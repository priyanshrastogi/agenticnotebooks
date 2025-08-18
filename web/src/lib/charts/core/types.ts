import * as d3 from 'd3';

export interface ChartData {
  x: string | number;
  y: number;
  date?: string; // Optional date field for stock chart tooltips
  // For stacked data
  y0?: number;
  y1?: number;
}

export interface ChartDataset {
  label: string;
  data: ChartData[];
  color?: string;
}

export interface ChartOptions {
  width?: number;
  height?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  showGrid?: boolean;
  showAxis?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  legendPosition?: 'bottom' | 'top' | 'left' | 'right';
  animate?: boolean;
  colors?: string[];
  curve?: 'linear' | 'smooth';
  yAxisStartsFromZero?: boolean; // Allow Y-axis to start from data min instead of 0
}

export interface LineChartOptions extends ChartOptions {
  showPoints?: boolean;
  pointRadius?: number;
  strokeWidth?: number;
}

export interface AreaChartOptions extends ChartOptions {
  showPoints?: boolean;
  pointRadius?: number;
  strokeWidth?: number;
  fillOpacity?: number;
  stacked?: boolean;
  showStackedTotal?: boolean;
}

export interface Chart {
  render(): void;
  update(data: ChartDataset[]): void;
  destroy(): void;
}

// D3 Selection types for better type safety
export type D3Selection<T extends d3.BaseType> = d3.Selection<T, unknown, HTMLElement, unknown>;
export type SVGSelection = D3Selection<SVGSVGElement>;
export type HTMLDivSelection = D3Selection<HTMLDivElement>;
export type SVGLineSelection = D3Selection<SVGLineElement>;

// Scale types
export type XScale =
  | d3.ScaleLinear<number, number>
  | d3.ScalePoint<string>
  | d3.ScaleTime<number, number>;
export type YScale = d3.ScaleLinear<number, number>;

// Union type for scale domain values
export type ScaleDomainValue = string | number | Date;

// D3 Selection types with specific elements
export type SVGGroupSelection = d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
export type SVGCircleSelection = d3.Selection<SVGCircleElement, unknown, HTMLElement, unknown>;

// Tooltip data interface
export interface TooltipData {
  label: string;
  value: number;
  color: string;
  stackedValue?: number;
  yPosition?: number;
}
