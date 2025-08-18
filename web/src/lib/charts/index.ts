// Chart implementations
export { AreaChart, createAreaChart } from './charts/area';
export { createLineChart, LineChart } from './charts/line';

// Core types and utilities
export {
  type AreaChartOptions,
  type Chart,
  type ChartData,
  type ChartDataset,
  type ChartOptions,
  type LineChartOptions,
} from './core/types';

// Color utilities
export { DEFAULT_COLORS, getColor, hexToRgba } from './core/colors';

// Data generators
export {
  generateAppleStockData,
  generateAppleStockDataWithDates,
  generateTechStocksData,
} from './data/stockData';
