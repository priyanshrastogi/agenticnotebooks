import * as d3 from 'd3';

// ============================================================================
// CORE DATA STRUCTURES
// ============================================================================

/**
 * Base chart data point for line, area, and scatter charts
 */
export interface ChartDataPoint {
  x: string | number;
  y: number;
  date?: string; // Optional formatted date for display
  // For stacked area charts
  y0?: number;
  y1?: number;
}

/**
 * Pie/Doughnut chart data point
 */
export interface PieDataPoint {
  label: string;
  value: number;
  color?: string;
}

/**
 * Dataset containing multiple data points with styling
 */
export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
}

// ============================================================================
// CHART CONFIGURATION INTERFACES
// ============================================================================

/**
 * Chart margin configuration
 */
export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Legend positioning options
 */
export type LegendPosition = 'bottom' | 'top' | 'left' | 'right';

/**
 * Curve interpolation types for line/area charts
 */
export type CurveType = 'linear' | 'smooth';

/**
 * Tooltip size variants
 */
export type TooltipSize = 'sm' | 'md';

/**
 * Base configuration interface for all chart types
 */
export interface BaseChartOptions {
  // Dimensions
  width?: number;
  height?: number;
  margin?: ChartMargin;

  // Visual elements
  showXGrid?: boolean;
  showYGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  legendPosition?: LegendPosition;
  animate?: boolean;
  colors?: string[];

  // Axis configuration
  yAxisStartsFromZero?: boolean;

  // Tooltip configuration
  tooltipSize?: TooltipSize;
}

/**
 * Line chart specific configuration
 */
export interface LineChartOptions extends BaseChartOptions {
  showPoints?: boolean;
  pointRadius?: number;
  strokeWidth?: number;
  curve?: CurveType;
  tooltipContentCallback?: (data: TooltipData[], xValue?: string | number) => string;
}

/**
 * Area chart specific configuration
 */
export interface AreaChartOptions extends BaseChartOptions {
  showPoints?: boolean;
  pointRadius?: number;
  strokeWidth?: number;
  fillOpacity?: number;
  stacked?: boolean;
  showStackedTotal?: boolean;
  curve?: CurveType;
  tooltipContentCallback?: (data: TooltipData[], xValue?: string | number) => string;
}

/**
 * Scatter chart specific configuration
 */
export interface ScatterChartOptions extends BaseChartOptions {
  pointRadius?: number;
  pointOpacity?: number;
  showTrendLine?: boolean;
  trendLineColor?: string;
  tooltipContentCallback?: (data: ScatterTooltipData) => string;
}


/**
 * Pie/Doughnut chart specific configuration
 */
export interface PieChartOptions
  extends Omit<BaseChartOptions, 'showGrid' | 'showAxis' | 'yAxisStartsFromZero'> {
  // Pie-specific dimensions
  innerRadius?: number; // 0 for pie chart, > 0 for doughnut chart
  outerRadius?: number;
  padAngle?: number; // Space between slices in radians
  cornerRadius?: number; // Rounded corners for slices

  // Label configuration
  showLabels?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  labelDistance?: number; // Multiplier for label positioning from center

  // Custom tooltip
  tooltipContentCallback?: (data: PieTooltipData) => string;
}

// ============================================================================
// CHART INTERFACE CONTRACTS
// ============================================================================

/**
 * Line chart interface
 */
export interface ILineChart {
  render(): void;
  update(data: ChartDataset[]): void;
  destroy(): void;
}

/**
 * Area chart interface
 */
export interface IAreaChart {
  render(): void;
  update(data: ChartDataset[]): void;
  destroy(): void;
}

/**
 * Scatter chart interface
 */
export interface IScatterChart {
  render(): void;
  update(data: ChartDataset[]): void;
  destroy(): void;
}


/**
 * Pie chart interface
 */
export interface IPieChart {
  render(): void;
  update(data: PieDataPoint[]): void;
  destroy(): void;
}

// ============================================================================
// TOOLTIP DATA INTERFACES
// ============================================================================

/**
 * Standard tooltip data for line/area charts
 */
export interface TooltipData {
  label: string;
  value: number;
  color: string;
  stackedValue?: number; // For stacked area charts
  yPosition?: number; // For positioning in stacked tooltips
}

/**
 * Scatter chart tooltip data
 */
export interface ScatterTooltipData {
  label: string;
  x: string | number;
  y: number;
  color: string;
}

/**
 * Pie chart tooltip data
 */
export interface PieTooltipData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

// ============================================================================
// D3.JS TYPE DEFINITIONS
// ============================================================================

/**
 * Generic D3 selection type for better type safety
 */
export type D3Selection<T extends d3.BaseType> = d3.Selection<T, unknown, HTMLElement, unknown>;

/**
 * Common D3 selection types
 */
export type SVGSelection = D3Selection<SVGSVGElement>;
export type HTMLDivSelection = D3Selection<HTMLDivElement>;
export type SVGLineSelection = D3Selection<SVGLineElement>;
export type SVGGroupSelection = d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
export type SVGCircleSelection = d3.Selection<SVGCircleElement, unknown, HTMLElement, unknown>;

/**
 * D3 scale types for chart axes
 */
export type XScale =
  | d3.ScaleLinear<number, number>
  | d3.ScalePoint<string>
  | d3.ScaleTime<number, number>;

export type YScale = d3.ScaleLinear<number, number>;

/**
 * Union type for scale domain values
 */
export type ScaleDomainValue = string | number | Date;
