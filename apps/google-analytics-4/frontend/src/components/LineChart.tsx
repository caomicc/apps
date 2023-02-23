import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import tokens from '@contentful/f36-tokens';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

ChartJS.defaults.font.size = 16;
ChartJS.defaults.font.family = tokens.fontStackPrimary;
ChartJS.defaults.font.weight = '500';
ChartJS.defaults.borderColor = tokens.gray200;
ChartJS.defaults.datasets.line.borderColor = tokens.colorPrimary;

interface LineChartProps {
  dataValues: Array<string | number>;
  xAxesLabels: Array<string>;
  tooltipMetricLabel: string;
}

const LineChart = ({ dataValues, xAxesLabels, tooltipMetricLabel }: LineChartProps) => {
  const data = {
    labels: xAxesLabels,
    datasets: [
      {
        data: dataValues,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        backgroundColor: tokens.gray900,
        bodyColor: tokens.colorWhite,
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 12,
        },
        displayColors: false,
        callbacks: {
          beforeLabel: () => tooltipMetricLabel,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default LineChart;
