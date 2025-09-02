'use client';

import ChartDemo from './ChartDemo';
import {
  generateAppDownloadsData,
  generateAppleStockData,
  generateEnergyConsumptionData,
} from './data/areaChart';
import {
  generateBarTrafficSourcesData,
  generateCustomerAcquisitionData,
  generateEmployeeSatisfactionData,
  generatePlatformDownloadsData,
  generateProductCategorySalesData,
  generateQuarterlyRevenueData,
  generateRegionalSalesData,
} from './data/barChart';
import {
  generateAgeDistributionData,
  generateIncomeDistributionData,
  generateLoadTimeData,
  generateResponseTimeData,
  generateStepCountData,
  generateTestScoresData,
  generateTransactionAmountData,
} from './data/histogramChart';
import {
  generateCPUUsageData,
  generateEngagementData,
  generateSingleDatasetData,
  generateStockData,
} from './data/lineChart';
import {
  generateEcommerceSalesData,
  generateEnergySourcesData,
  generateSocialMediaUsageData,
  generateStartupBudgetData,
  generateTechMarketShareData,
  generateTrafficSourcesData,
} from './data/pieChart';
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
    // Bar Chart Examples
    {
      title: 'Quarterly Revenue by Business Unit',
      description:
        'Strategic performance comparison across Sales, Marketing, Product, and Services divisions showing seasonal patterns and growth trends',
      dataGenerator: generateQuarterlyRevenueData,
      id: 'quarterly-revenue-bar-chart',
      chartType: 'bar' as const,
      defaultOptions: {
        legendPosition: 'top' as const,
        showXGrid: false,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
      },
    },
    {
      title: 'Website Traffic Sources Analysis',
      description:
        'Monthly visitor breakdown by acquisition channel revealing organic search dominance and identifying optimization opportunities',
      dataGenerator: generateBarTrafficSourcesData,
      id: 'traffic-sources-bar-chart',
      chartType: 'bar' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: false,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
      },
    },
    {
      title: 'Product Category Sales Performance',
      description:
        'Revenue comparison across major e-commerce categories with Electronics leading, showing market preferences and seasonal impacts',
      dataGenerator: generateProductCategorySalesData,
      id: 'product-sales-bar-chart',
      chartType: 'bar' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: true,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: false,
        tooltipSize: 'sm' as const,
      },
    },
    {
      title: 'Employee Satisfaction by Department',
      description:
        'Internal survey results showing Support and Engineering leading in satisfaction, highlighting areas for HR intervention and best practices',
      dataGenerator: generateEmployeeSatisfactionData,
      id: 'satisfaction-bar-chart',
      chartType: 'bar' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: false,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
      },
    },
    {
      title: 'App Downloads by Platform Over Time',
      description:
        'Monthly download trends across iOS, Android, and Web platforms showing Android dominance and growing web adoption',
      dataGenerator: generatePlatformDownloadsData,
      id: 'platform-downloads-bar-chart',
      chartType: 'bar' as const,
      defaultOptions: {
        legendPosition: 'bottom' as const,
        showXGrid: true,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
      },
    },
    {
      title: 'Regional Sales Performance',
      description:
        'Global revenue distribution highlighting Asia Pacific leadership and growth opportunities in emerging markets',
      dataGenerator: generateRegionalSalesData,
      id: 'regional-sales-bar-chart',
      chartType: 'bar' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: false,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
      },
    },
    {
      title: 'Customer Acquisition Cost by Channel',
      description:
        'Marketing efficiency analysis showing Referrals and Email as most cost-effective channels, with LinkedIn commanding premium prices',
      dataGenerator: generateCustomerAcquisitionData,
      id: 'acquisition-cost-bar-chart',
      chartType: 'bar' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: true,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
      },
    },
    // Histogram Chart Examples
    {
      title: 'Age Distribution Analysis',
      description:
        'Population age demographics showing multi-modal distribution with peaks at young adults, middle-aged, and older adults',
      dataGenerator: generateAgeDistributionData,
      id: 'age-distribution-histogram',
      chartType: 'histogram' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: false,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
        bins: 20,
      },
    },
    {
      title: 'Website Loading Performance',
      description:
        'Page load time distribution revealing most pages load under 3 seconds with a long tail of slower responses',
      dataGenerator: generateLoadTimeData,
      id: 'load-time-histogram',
      chartType: 'histogram' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: true,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
        bins: 25,
      },
    },
    {
      title: 'Income Distribution by Household',
      description:
        'Economic analysis showing income inequality with concentration in lower-middle brackets and long tail of high earners',
      dataGenerator: generateIncomeDistributionData,
      id: 'income-distribution-histogram',
      chartType: 'histogram' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: false,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
        bins: 30,
      },
    },
    {
      title: 'Student Test Score Distribution',
      description:
        'Educational assessment results showing normal distribution centered around 78% with typical bell curve characteristics',
      dataGenerator: generateTestScoresData,
      id: 'test-scores-histogram',
      chartType: 'histogram' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: true,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: false,
        tooltipSize: 'sm' as const,
        bins: 15,
      },
    },
    {
      title: 'API Response Time Analysis',
      description:
        'Server performance metrics showing most requests under 200ms with performance bottlenecks clearly identified',
      dataGenerator: generateResponseTimeData,
      id: 'response-time-histogram',
      chartType: 'histogram' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: true,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
        bins: 20,
      },
    },
    {
      title: 'Daily Step Count Distribution',
      description:
        'Fitness tracking data revealing activity levels with clear segments for sedentary, moderate, and active users',
      dataGenerator: generateStepCountData,
      id: 'step-count-histogram',
      chartType: 'histogram' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: false,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
        bins: 18,
      },
    },
    {
      title: 'Transaction Amount Patterns',
      description:
        'Financial transaction analysis showing spending behavior with heavy concentration in small amounts and few large purchases',
      dataGenerator: generateTransactionAmountData,
      id: 'transaction-amount-histogram',
      chartType: 'histogram' as const,
      defaultOptions: {
        showLegend: false,
        showXGrid: true,
        showYGrid: true,
        yAxisStartsFromZero: true,
        animate: true,
        tooltipSize: 'md' as const,
        bins: 25,
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
    // Pie Chart Examples
    {
      title: 'Tech Industry Market Cap',
      description:
        'Market capitalization breakdown of major technology companies showing Apple and Microsoft leading the sector',
      dataGenerator: generateTechMarketShareData,
      id: 'tech-market-pie-chart',
      chartType: 'pie' as const,
      defaultOptions: {
        legendPosition: 'right' as const,
        showLabels: false,
        showPercentages: true,
        showValues: false,
        animate: true,
        tooltipSize: 'md' as const,
      },
    },
    {
      title: 'Global Energy Sources',
      description:
        'Worldwide energy consumption by source revealing fossil fuel dominance and growing renewable adoption',
      dataGenerator: generateEnergySourcesData,
      id: 'energy-sources-pie-chart',
      chartType: 'pie' as const,
      defaultOptions: {
        legendPosition: 'bottom' as const,
        showLabels: true,
        showPercentages: true,
        showValues: false,
        animate: true,
        tooltipSize: 'md' as const,
      },
    },
    {
      title: 'Social Media Platform Usage',
      description:
        'User engagement distribution across social platforms with Instagram and TikTok leading among younger demographics',
      dataGenerator: generateSocialMediaUsageData,
      id: 'social-media-pie-chart',
      chartType: 'pie' as const,
      defaultOptions: {
        legendPosition: 'right' as const,
        showLabels: false,
        showPercentages: true,
        showValues: true,
        animate: true,
        tooltipSize: 'sm' as const,
      },
    },
    // Doughnut Chart Examples
    {
      title: 'Startup Budget Allocation',
      description:
        'Strategic budget distribution for a growing tech startup with engineering as the primary investment focus',
      dataGenerator: generateStartupBudgetData,
      id: 'startup-budget-doughnut-chart',
      chartType: 'doughnut' as const,
      defaultOptions: {
        legendPosition: 'right' as const,
        showLabels: false,
        showPercentages: true,
        showValues: false,
        animate: true,
        tooltipSize: 'md' as const,
      },
    },
    {
      title: 'E-commerce Sales by Category',
      description:
        'Revenue distribution across product categories highlighting electronics as the dominant segment in online retail',
      dataGenerator: generateEcommerceSalesData,
      id: 'ecommerce-sales-doughnut-chart',
      chartType: 'doughnut' as const,
      defaultOptions: {
        legendPosition: 'bottom' as const,
        showLabels: true,
        showPercentages: false,
        showValues: true,
        animate: true,
        tooltipSize: 'md' as const,
      },
    },
    {
      title: 'Website Traffic Sources',
      description:
        'Analytics breakdown showing organic search dominance and direct traffic strength, guiding marketing strategy decisions',
      dataGenerator: generateTrafficSourcesData,
      id: 'traffic-sources-doughnut-chart',
      chartType: 'doughnut' as const,
      defaultOptions: {
        legendPosition: 'top' as const,
        showLabels: false,
        showPercentages: true,
        showValues: false,
        animate: true,
        tooltipSize: 'sm' as const,
      },
    },
  ];

  // Separate chart demos by type
  const lineChartDemos = demos.filter((demo) => demo.chartType === 'line');
  const areaChartDemos = demos.filter((demo) => demo.chartType === 'area');
  const barChartDemos = demos.filter((demo) => demo.chartType === 'bar');
  const histogramChartDemos = demos.filter((demo) => demo.chartType === 'histogram');
  const scatterChartDemos = demos.filter((demo) => demo.chartType === 'scatter');
  const pieChartDemos = demos.filter((demo) => demo.chartType === 'pie');
  const doughnutChartDemos = demos.filter((demo) => demo.chartType === 'doughnut');

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

      {/* Bar Charts Section */}
      <div className="mb-12 sm:mb-16">
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">Bar Charts</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
              Category comparison
            </span>
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
              Ranking visualization
            </span>
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
              Multi-series support
            </span>
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
              Performance metrics
            </span>
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
              Business dashboards
            </span>
          </div>
        </div>
        <div className="space-y-8 sm:space-y-12">
          {barChartDemos.map((demo, index) => (
            <ChartDemo
              key={`bar-${index}`}
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

      {/* Histogram Charts Section */}
      <div className="mb-12 sm:mb-16">
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">Histogram Charts</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
              Distribution analysis
            </span>
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
              Frequency patterns
            </span>
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
              Statistical insights
            </span>
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
              Data binning
            </span>
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
              Outlier detection
            </span>
          </div>
        </div>
        <div className="space-y-8 sm:space-y-12">
          {histogramChartDemos.map((demo, index) => (
            <ChartDemo
              key={`histogram-${index}`}
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

      {/* Pie Charts Section */}
      <div className="mb-12 sm:mb-16">
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">Pie Charts</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
              Part-to-whole relationships
            </span>
            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
              Percentage breakdown
            </span>
            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
              Market share analysis
            </span>
            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
              Interactive tooltips
            </span>
            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
              Customizable labels
            </span>
          </div>
        </div>
        <div className="space-y-8 sm:space-y-12">
          {pieChartDemos.map((demo, index) => (
            <ChartDemo
              key={`pie-${index}`}
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

      {/* Doughnut Charts Section */}
      <div className="mb-12 sm:mb-16">
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">Doughnut Charts</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-800">
              Modern design aesthetic
            </span>
            <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-800">
              Central focus area
            </span>
            <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-800">
              Elegant data presentation
            </span>
            <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-800">
              Budget allocations
            </span>
            <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-800">
              Resource distribution
            </span>
          </div>
        </div>
        <div className="space-y-8 sm:space-y-12">
          {doughnutChartDemos.map((demo, index) => (
            <ChartDemo
              key={`doughnut-${index}`}
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
