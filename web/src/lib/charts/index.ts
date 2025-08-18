// Chart implementations
export { AreaChart, createAreaChart } from './charts/area';
export { BarChart, createBarChart } from './charts/bar';
export { createLineChart, LineChart } from './charts/line';
export { createDoughnutChart, createPieChart, PieChart } from './charts/pie';
export { createScatterChart, ScatterChart } from './charts/scatter';

// Core types and utilities
export {
  // Chart options interfaces
  type AreaChartOptions,
  type BarChartOptions,
  type BaseChartOptions,
  // Data types
  type ChartDataPoint,
  type ChartDataset,
  // Configuration types
  type ChartMargin,
  type CurveType,
  type IAreaChart,
  type IBarChart,
  // Chart interfaces
  type ILineChart,
  type IPieChart,
  type IScatterChart,
  type LegendPosition,
  type LineChartOptions,
  type PieChartOptions,
  type PieDataPoint,
  type PieTooltipData,
  type ScatterChartOptions,
  type ScatterTooltipData,
  // Tooltip data interfaces
  type TooltipData,
  type TooltipSize,
} from './core/types';

// Color utilities
export { DEFAULT_COLORS, getColor, hexToRgba } from './core/colors';

// Data generators
export {
  generateAppleStockData,
  generateAppleStockDataWithDates,
  generateBrowserUsageData,
  generateCampaignPerformanceScatter,
  generateCustomerSatisfactionScatter,
  generateDepartmentRevenueData,
  generateGlobalTemperatureData,
  generateHeightWeightData,
  generateMarketShareData,
  generateOfficeSatisfactionData,
  generateQuarterlySalesData,
  generateRegionalSalesData,
  generateRevenueBreakdownData,
  generateSalesMarketingData,
  // Extended examples with more datasets
  generateTechRevenueComparison,
  generateTechStocksData,
  generateTrafficSourcesData,
  generateWebsitePerformanceData,
} from './data';