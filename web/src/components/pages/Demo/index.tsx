'use client';

import ChartDemo from './ChartDemo';
import {
  generateCPUUsageData,
  generateEngagementData,
  generateSingleDatasetData,
  generateStockData,
  generateTrafficData,
} from './data/lineChart';
import DemoHeader from './DemoHeader';

export default function DemoPage() {
  const demos = [
    {
      title: 'Market Index Comparison',
      description:
        'Normalized stock market indices showing relative volatility and performance over 6 months',
      dataGenerator: generateStockData,
      id: 'stock-chart',
      defaultOptions: {
        curve: 'linear' as const,
        legendPosition: 'top' as const,
        showXGrid: false,
        animate: false
      }
    },
    {
      title: 'Website Traffic Analytics',
      description: 'Organic, paid, and social traffic patterns showing seasonal variations',
      dataGenerator: generateTrafficData,
      id: 'traffic-chart',
      defaultOptions: {
        curve: 'smooth' as const,
        legendPosition: 'bottom' as const,
        yAxisStartsFromZero: false,
        tooltipSize: 'md' as const
      }
    },
    {
      title: 'Server Performance Monitoring',
      description:
        '24-hour CPU usage monitoring across multiple servers with business hour patterns',
      dataGenerator: generateCPUUsageData,
      id: 'cpu-chart',
      defaultOptions: {
        showXGrid: true,
        showYGrid: true,
        curve: 'linear' as const,
        legendPosition: 'bottom' as const
      }
    },
    {
      title: 'User Engagement Metrics',
      description: 'Daily active users, session duration, and page views over a month',
      dataGenerator: generateEngagementData,
      id: 'engagement-chart',
      defaultOptions: {
        legendPosition: 'top' as const,
        showYGrid: false,
        yAxisStartsFromZero: true,
        curve: 'linear' as const,
      }
    },
    {
      title: 'Monthly Sales Performance',
      description: 'E-commerce product sales showing seasonal patterns and growth trend over 12 months',
      dataGenerator: generateSingleDatasetData,
      id: 'single-chart',
      defaultOptions: {
        showLegend: false,
        showXGrid: true,
        showYGrid: true,
        curve: 'smooth' as const,
        animate: true,
        yAxisStartsFromZero: false
      }
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <DemoHeader />
      <div className="space-y-8 sm:space-y-12">
        {demos.map((demo, index) => (
          <ChartDemo
            key={index}
            title={demo.title}
            description={demo.description}
            dataGenerator={demo.dataGenerator}
            chartId={demo.id}
            defaultOptions={demo.defaultOptions}
          />
        ))}
      </div>
    </div>
  );
}
