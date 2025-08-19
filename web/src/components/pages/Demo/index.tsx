'use client';

import ChartDemo from './ChartDemo';
import {
  generateAppDownloadsData,
  generateAppleStockData,
  generateEnergyConsumptionData,
} from './data/areaChart';
import {
  generateCPUUsageData,
  generateEngagementData,
  generateSingleDatasetData,
  generateStockData,
} from './data/lineChart';
import {
  generateCustomerSatisfactionData,
  generateEmployeePerformanceData,
  generateHousingMarketData,
  generateMarketingCampaignData,
} from './data/scatterChart';
import DemoHeader from './DemoHeader';

export default function DemoPage() {
  const demos = [
    {
      title: 'Market Index Comparison',
      description:
        'Normalized stock market indices showing relative volatility and performance over 6 months',
      dataGenerator: generateStockData,
      id: 'stock-chart',
      chartType: 'line' as const,
      defaultOptions: {
        curve: 'linear' as const,
        legendPosition: 'top' as const,
        showXGrid: false,
        animate: false,
      },
    },
    {
      title: 'Server Performance Monitoring',
      description:
        '24-hour CPU usage monitoring across multiple servers with business hour patterns',
      dataGenerator: generateCPUUsageData,
      id: 'cpu-chart',
      chartType: 'line' as const,
      defaultOptions: {
        showXGrid: true,
        showYGrid: true,
        curve: 'linear' as const,
        legendPosition: 'bottom' as const,
      },
    },
    {
      title: 'User Engagement Metrics',
      description: 'Daily active users, session duration, and page views over a month',
      dataGenerator: generateEngagementData,
      id: 'engagement-chart',
      chartType: 'line' as const,
      defaultOptions: {
        legendPosition: 'top' as const,
        showYGrid: false,
        yAxisStartsFromZero: true,
        curve: 'linear' as const,
      },
    },
    {
      title: 'Monthly Sales Performance',
      description:
        'E-commerce product sales showing seasonal patterns and growth trend over 12 months',
      dataGenerator: generateSingleDatasetData,
      id: 'single-chart',
      chartType: 'line' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: true,
        showYGrid: true,
        curve: 'smooth' as const,
        animate: true,
        yAxisStartsFromZero: false,
      },
    },
    // Area Chart Examples
    {
      title: 'Apple Stock Performance',
      description:
        'Daily AAPL stock price over the past year showing realistic volatility, earnings impacts, and growth trends',
      dataGenerator: generateAppleStockData,
      id: 'apple-stock-chart',
      chartType: 'area' as const,
      defaultOptions: {
        curve: 'smooth' as const,
        legendPosition: 'top' as const,
        showLegend: false,
        showXGrid: true,
        showYGrid: true,
        yAxisStartsFromZero: false,
        solidFill: false,
        animate: true,
        tooltipSize: 'md' as const,
      },
    },
    {
      title: 'Energy Consumption by Source',
      description:
        'Monthly energy generation from renewable (solar, wind, hydro) and non-renewable sources throughout the year',
      dataGenerator: generateEnergyConsumptionData,
      id: 'energy-area-chart',
      chartType: 'area' as const,
      defaultOptions: {
        curve: 'smooth' as const,
        legendPosition: 'right' as const,
        showStackedTotal: true,
        yAxisStartsFromZero: true,
        solidFill: true,
        showXGrid: false,
      },
    },
    {
      title: 'App Downloads by Platform',
      description:
        'Weekly download trends for iOS, Android, and web applications showing platform adoption over 12 weeks',
      dataGenerator: generateAppDownloadsData,
      id: 'downloads-area-chart',
      chartType: 'area' as const,
      defaultOptions: {
        curve: 'linear' as const,
        legendPosition: 'bottom' as const,
        showPoints: false,
        yAxisStartsFromZero: true,
        showStackedTotal: false,
        solidFill: false,
      },
    },
    // Scatter Chart Examples
    {
      title: 'Price vs Satisfaction: Finding the Sweet Spot',
      description:
        "Reveals that higher prices don't guarantee customer satisfaction. Shows premium outliers and budget-friendly winners with clear correlation patterns",
      dataGenerator: generateCustomerSatisfactionData,
      id: 'satisfaction-scatter-chart',
      chartType: 'scatter' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: true,
        showYGrid: true,
        yAxisStartsFromZero: false,
        animate: true,
        tooltipSize: 'md' as const,
        showTrendLine: true,
      },
    },
    {
      title: 'Salary vs Productivity: Department Insights',
      description:
        'Engineering shows strong salary-performance correlation, Sales has high variability, Marketing clusters in mid-range. Identifies star performers and optimization opportunities',
      dataGenerator: generateEmployeePerformanceData,
      id: 'performance-scatter-chart',
      chartType: 'scatter' as const,
      defaultOptions: {
        legendPosition: 'top' as const,
        showXGrid: true,
        showYGrid: true,
        yAxisStartsFromZero: false,
        animate: false,
        tooltipSize: 'md' as const,
        showTrendLine: false,
      },
    },
    {
      title: 'Real Estate: Size vs Value Across Markets',
      description:
        'San Francisco commands premium prices per sq ft, Austin offers best value for large homes, Denver shows consistent linear pricing. Exposes market inefficiencies',
      dataGenerator: generateHousingMarketData,
      id: 'housing-scatter-chart',
      chartType: 'scatter' as const,
      defaultOptions: {
        legendPosition: 'bottom' as const,
        showXGrid: true,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'sm' as const,
        showTrendLine: false,
      },
    },
    {
      title: 'Ad Spend ROI: Platform Performance Comparison',
      description:
        'Google Ads shows highest efficiency, LinkedIn requires larger budgets but delivers quality, Facebook and Twitter have volatile performance. Guides budget allocation',
      dataGenerator: generateMarketingCampaignData,
      id: 'marketing-scatter-chart',
      chartType: 'scatter' as const,
      defaultOptions: {
        legendPosition: 'right' as const,
        showXGrid: false,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
        showTrendLine: true,
      },
    },
  ];

  // Separate chart demos by type
  const lineChartDemos = demos.filter((demo) => demo.chartType === 'line');
  const areaChartDemos = demos.filter((demo) => demo.chartType === 'area');
  const scatterChartDemos = demos.filter((demo) => demo.chartType === 'scatter');

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <DemoHeader />

      {/* Line Charts Section */}
      <div className="mb-12 sm:mb-16">
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">Line Charts</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              Multi-series support
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              Trend analysis
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              Time-series data
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              Interactive tooltips
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              Smooth & linear curves
            </span>
          </div>
        </div>
        <div className="space-y-8 sm:space-y-12">
          {lineChartDemos.map((demo, index) => (
            <ChartDemo
              key={`line-${index}`}
              title={demo.title}
              description={demo.description}
              dataGenerator={demo.dataGenerator}
              chartId={demo.id}
              defaultOptions={demo.defaultOptions}
              chartType={demo.chartType}
            />
          ))}
        </div>
      </div>

      {/* Area Charts Section */}
      <div className="mb-12 sm:mb-16">
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">Area Charts</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Filled visualizations
            </span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Volume representation
            </span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Stacking support
            </span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Gradient fills
            </span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Cumulative data
            </span>
          </div>
        </div>
        <div className="space-y-8 sm:space-y-12">
          {areaChartDemos.map((demo, index) => (
            <ChartDemo
              key={`area-${index}`}
              title={demo.title}
              description={demo.description}
              dataGenerator={demo.dataGenerator}
              chartId={demo.id}
              defaultOptions={demo.defaultOptions}
              chartType={demo.chartType}
            />
          ))}
        </div>
      </div>

      {/* Scatter Charts Section */}
      <div className="mb-12 sm:mb-16">
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">Scatter Charts</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
              Correlation analysis
            </span>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
              Multi-dimensional data
            </span>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
              Trend lines
            </span>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
              Outlier detection
            </span>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
              Clustering patterns
            </span>
          </div>
        </div>
        <div className="space-y-8 sm:space-y-12">
          {scatterChartDemos.map((demo, index) => (
            <ChartDemo
              key={`scatter-${index}`}
              title={demo.title}
              description={demo.description}
              dataGenerator={demo.dataGenerator}
              chartId={demo.id}
              defaultOptions={demo.defaultOptions}
              chartType={demo.chartType}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
