// Core functionality exports
export { DEFAULT_COLORS, getColor, hexToRgba } from './colors';
export {
  type AreaChartOptions,
  type Chart,
  type ChartData,
  type ChartDataset,
  type ChartOptions,
  type D3Selection,
  type HTMLDivSelection,
  type LineChartOptions,
  type ScaleDomainValue,
  type SVGCircleSelection,
  type SVGGroupSelection,
  type SVGLineSelection,
  type SVGSelection,
  type TooltipData,
  type XScale,
  type YScale,
} from './types';
export {
  addAxes,
  addGridLines,
  calculateNiceScale,
  createCrosshairTooltip,
  createTooltip,
  formatNumber,
  hideTooltip,
  showCrosshairTooltip,
  showTooltip,
} from './utils';
