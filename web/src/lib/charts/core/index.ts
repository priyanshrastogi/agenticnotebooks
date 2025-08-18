// Core functionality exports
export { DEFAULT_COLORS, getColor, hexToRgba } from './colors';
export {
  // Chart options interfaces
  type AreaChartOptions,
  type BaseChartOptions,
  // Data types
  type ChartDataPoint,
  type ChartDataset,
  // Configuration types
  type ChartMargin,
  type CurveType,
  // D3 types
  type D3Selection,
  type HTMLDivSelection,
  type IAreaChart,
  // Chart interfaces
  type ILineChart,
  type IPieChart,
  type IScatterChart,
  type LegendPosition,
  type LineChartOptions,
  type PieChartOptions,
  type PieDataPoint,
  type PieTooltipData,
  type ScaleDomainValue,
  type ScatterChartOptions,
  type ScatterTooltipData,
  type SVGCircleSelection,
  type SVGGroupSelection,
  type SVGLineSelection,
  type SVGSelection,
  // Tooltip data interfaces
  type TooltipData,
  type TooltipSize,
  type XScale,
  type YScale,
} from './types';
export {
  addAxes,
  addGridLines,
  addLegend,
  calculateNiceScale,
  createCrosshairTooltip,
  createTooltip,
  formatNumber,
  hideTooltip,
  showCrosshairTooltip,
  showTooltip,
} from './utils';