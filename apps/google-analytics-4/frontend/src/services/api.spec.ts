import { z } from 'zod';
import { rest } from 'msw';
import { server } from '../../test/mocks/api/server';
import { Api, ApiClientError, ApiError, ApiServerError, fetchFromApi } from './api';

describe('fetchFromApi()', () => {
  const ZSomeSchema = z.object({ foo: z.string() });
  type SomeSchema = z.infer<typeof ZSomeSchema>;
  const url = new URL('http://example.com/foo');

  beforeEach(() => {
    server.use(
      rest.get(url.toString(), (_req, res, ctx) => {
        return res(ctx.json({ foo: 'bar' }));
      })
    );
  });

  it('returns the correctly typed data', async () => {
    const result = await fetchFromApi<SomeSchema>(url, ZSomeSchema);
    expect(result).toEqual(expect.objectContaining({ foo: 'bar' }));
  });

  // See https://developer.mozilla.org/en-US/docs/Web/API/fetch#exceptions
  describe('when fetch throws a TypeError', () => {
    beforeEach(() => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('boom!'));
    });
    afterEach(() => {
      jest.spyOn(global, 'fetch').mockRestore();
    });

    it('throws an ApiServerError', async () => {
      await expect(fetchFromApi<SomeSchema>(url, ZSomeSchema)).rejects.toThrow(ApiError);
    });
  });

  describe('when a server error occurs', () => {
    beforeEach(() => {
      server.use(
        rest.get(url.toString(), (_req, res, ctx) => {
          return res(ctx.status(500), ctx.body('Boom!'));
        })
      );
    });

    it('throws an ApiServerError', async () => {
      await expect(fetchFromApi<SomeSchema>(url, ZSomeSchema)).rejects.toThrow(ApiServerError);
    });
  });

  describe('when a client error occurs', () => {
    beforeEach(() => {
      server.use(
        rest.get(url.toString(), (_req, res, ctx) => {
          return res(ctx.status(400), ctx.body('Boom!'));
        })
      );
    });

    it('throws an ApiClientError', async () => {
      await expect(fetchFromApi<SomeSchema>(url, ZSomeSchema)).rejects.toThrow(ApiClientError);
    });
  });

  describe('when the response does not parse against the schema', () => {
    beforeEach(() => {
      server.use(
        rest.get(url.toString(), (_req, res, ctx) => {
          return res(ctx.json({ bar: 'baz' }));
        })
      );
    });

    it('throws an ApiError', async () => {
      await expect(fetchFromApi<SomeSchema>(url, ZSomeSchema)).rejects.toThrow(ApiError);
    });
  });

  describe('when bad JSON is sent', () => {
    beforeEach(() => {
      server.use(
        rest.get(url.toString(), (_req, res, ctx) => {
          return res(ctx.body('not json!'));
        })
      );
    });

    it('throws an ApiError', async () => {
      await expect(fetchFromApi<SomeSchema>(url, ZSomeSchema)).rejects.toThrow(ApiError);
    });
  });
});

// Note: mocked http responses are set up using msw in tests/mocks/api/handler
describe('Api', () => {
  describe('getCredentials()', () => {
    it('returns a set of credentials', async () => {
      const api = new Api();
      const result = await api.getCredentials();
      expect(result).toEqual(expect.objectContaining({ status: 'active' }));
    });
  });
});