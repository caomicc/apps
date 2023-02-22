import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';
import React from 'react';
import { render } from 'react-dom';

import { GlobalStyles } from '@contentful/f36-components';
import { SDKProvider } from '@contentful/react-apps-toolkit';

import LocalhostWarning from './components/LocalhostWarning';
import App from './App';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  // TODO: setup Sentry as part of release pipeline (see: https://docs.sentry.io/platforms/javascript/sourcemaps/?_ga=2.56533545.342806665.1676988870-873194326.1675171780#uploading-source-maps-to-sentry)
  release: process.env.REACT_APP_VERSION,
});

const root = document.getElementById('root');

if (process.env.NODE_ENV === 'development' && window.self === window.top) {
  // You can remove this if block before deploying your app
  render(<LocalhostWarning />, root);
} else {
  render(
    <SDKProvider>
      <GlobalStyles />
      <App />
    </SDKProvider>,
    root
  );
}
