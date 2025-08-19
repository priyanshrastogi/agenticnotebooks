import * as d3 from 'd3';

import { getColor } from '../../core/colors';
import {
  HistogramChartOptions,
  HTMLDivSelection,
  IHistogramChart,
  SVGLineSelection,
  SVGSelection,
} from '../../core/types';
import {
  addGridLines,
  addLegend,
  calculateNiceScale,
  createTooltip,
  formatNumber,
  hideTooltip,
  showTooltip,
} from '../../core/utils';

export interface HistogramBin {
  x0: number;
  x1: number;
  length: number;
  frequency: number;
}

export class HistogramChart implements IHistogramChart {
  private container: string;
  private data: number[];
  private options: HistogramChartOptions;
  private svg?: SVGSelection;
  private tooltip?: HTMLDivSelection;
  private crosshairTooltip?: HTMLDivSelection;
  private crosshairLine?: SVGLineSelection;
  private resizeListener?: () => void;

  constructor(container: string, data: number[], options: HistogramChartOptions = {}) {
    this.container = container;
    this.data = data;

    // Calculate dynamic margins based on options and data
    const dynamicMargin = this.calculateMargins(options);

    this.options = {
      width: 800,
      height: 400,
      margin: dynamicMargin,
      showXGrid: true,
      showYGrid: true,
      showXAxis: true,
      showYAxis: true,
      showTooltip: true,
      showLegend: false,
      legendPosition: 'bottom',
      animate: true,
      yAxisStartsFromZero: true,
      tooltipSize: 'sm',
      bins: 10,
      binRange: 'auto',
      showDensity: false,
      ...options,
    };

    // Override margin with dynamic calculation if not explicitly provided
    if (!options.margin) {
      this.options.margin = dynamicMargin;
    }
  }

  private calculateMargins(options: HistogramChartOptions): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } {
    const showXAxis = options.showXAxis !== false;
    const showYAxis = options.showYAxis !== false;
    const showLegend = options.showLegend !== false;
    const legendPosition = options.legendPosition || 'bottom';

    let top = 20;
    let right = 20;
    let bottom = showXAxis ? 40 : 10;
    let left = showYAxis ? 40 : 10;

    // Calculate dynamic left margin based on estimated Y-axis tick values
    if (showYAxis && this.data.length > 0) {
      // Estimate maximum frequency for margin calculation
      // For a simple estimate, assume roughly normal distribution where max frequency
      // is around data.length / bins * 1.5 (peak of distribution)
      const bins = options.bins || 10;
      const estimatedMaxFrequency = options.showDensity
        ? 1.0 // Density values are typically between 0-1
        : Math.ceil((this.data.length / bins) * 1.5);

      // Calculate nice scale to get the actual tick values that will be displayed
      const { ticks } = calculateNiceScale(0, estimatedMaxFrequency);

      // Find the longest tick value
      const maxTickLength = Math.max(
        ...ticks.map((tick: number) => {
          const formatted = options.showDensity ? tick.toFixed(3) : formatNumber(tick);
          return formatted.length;
        })
      );

      // Calculate required width: ~7 pixels per character + padding
      left = Math.max(40, maxTickLength * 7 + 20);
    }

    // Add space for legend
    if (showLegend) {
      switch (legendPosition) {
        case 'bottom':
          bottom += 50;
          break;
        case 'top':
          top += 40;
          break;
        case 'left':
          left += 120;
          break;
        case 'right':
          right += 120;
          break;
      }
    }

    return { top, right, bottom, left };
  }

  private updateLeftMargin(maxFrequency: number): void {
    if (this.options.showYAxis !== false && maxFrequency > 0) {
      // Calculate nice scale to get the actual tick values that will be displayed
      const { ticks } = calculateNiceScale(0, maxFrequency);

      // Find the longest tick value
      const maxTickLength = Math.max(
        ...ticks.map((tick: number) => {
          const formatted = this.options.showDensity ? tick.toFixed(3) : formatNumber(tick);
          return formatted.length;
        })
      );

      // Calculate required width: ~7 pixels per character + padding
      const newLeft = Math.max(40, maxTickLength * 7 + 20);

      // Update the margin
      this.options.margin = {
        ...this.options.margin!,
        left: newLeft,
      };
    }
  }

  private setupScalesWithBins(bins: HistogramBin[]) {
    const {
      width = 800,
      height = 400,
      margin = { top: 20, right: 20, bottom: 40, left: 60 },
    } = this.options;

    // X scale for bin positions - use nice scale for better readability
    const xExtent =
      bins.length > 0 ? (d3.extent(bins.flatMap((d) => [d.x0, d.x1])) as [number, number]) : [0, 1];
    const { niceMin: xMin, niceMax: xMax } = calculateNiceScale(xExtent[0], xExtent[1]);
    const xScale = d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([margin.left, width - margin.right]);

    // Y scale for frequencies/densities - always start from zero for histograms
    const maxFrequency = bins.length > 0 ? Math.max(...bins.map((d) => d.frequency)) : 1;
    const { niceMin: yMin, niceMax: yMax } = calculateNiceScale(0, maxFrequency);

    const yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([height - margin.bottom, margin.top]);

    return { xScale, yScale };
  }

  private calculateBins(): HistogramBin[] {
    if (this.data.length === 0) return [];

    const minVal = d3.min(this.data) || 0;
    const maxVal = d3.max(this.data) || 0;

    let binRange: [number, number];
    if (this.options.binRange === 'auto') {
      binRange = [minVal, maxVal];
    } else {
      binRange = this.options.binRange as [number, number];
    }

    // Create histogram generator
    const histogram = d3
      .histogram()
      .domain(binRange)
      .thresholds(this.options.bins || 10);

    const bins = histogram(this.data);

    return bins.map((bin) => ({
      x0: bin.x0 || 0,
      x1: bin.x1 || 0,
      length: bin.length,
      frequency: this.options.showDensity
        ? bin.length / (this.data.length * (bin.x1! - bin.x0!))
        : bin.length,
    }));
  }

  private setupScales() {
    const {
      width = 800,
      height = 400,
      margin = { top: 20, right: 20, bottom: 40, left: 60 },
    } = this.options;

    const bins = this.calculateBins();

    // X scale for bin positions - use nice scale for better readability
    const xExtent = d3.extent(bins.flatMap((d) => [d.x0, d.x1])) as [number, number];
    const { niceMin: xMin, niceMax: xMax } = calculateNiceScale(xExtent[0], xExtent[1]);
    const xScale = d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([margin.left, width - margin.right]);

    // Y scale for frequencies/densities - always start from zero for histograms
    const maxFrequency = d3.max(bins, (d) => d.frequency) || 0;
    const { niceMin: yMin, niceMax: yMax } = calculateNiceScale(0, maxFrequency);

    const yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([height - margin.bottom, margin.top]);

    return { xScale, yScale, bins };
  }

  private addHistogramAxes(
    svg: SVGSelection,
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>
  ) {
    const {
      height = 400,
      margin = { top: 20, right: 20, bottom: 40, left: 60 },
      showXAxis,
      showYAxis,
    } = this.options;
    const chartBottom = height - margin.bottom;
    const chartLeft = margin.left;

    // X-axis
    if (showXAxis) {
      const xDomain = xScale.domain();
      const { ticks: xTickValues } = calculateNiceScale(xDomain[0], xDomain[1]);

      const xAxis = svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${chartBottom})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickValues(xTickValues)
            .tickSize(5)
            .tickPadding(8)
            .tickFormat((d) => formatNumber(d as number))
        );

      xAxis.select('.domain').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
      xAxis.selectAll('.tick line').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
    }

    // Y-axis
    if (showYAxis) {
      const yDomain = yScale.domain();
      const { ticks: tickValues } = calculateNiceScale(yDomain[0], yDomain[1]);

      const yAxis = svg
        .append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${chartLeft},0)`)
        .call(
          d3
            .axisLeft(yScale)
            .tickValues(tickValues)
            .tickSize(5)
            .tickPadding(8)
            .tickFormat((d) =>
              this.options.showDensity ? (d as number).toFixed(3) : formatNumber(d as number)
            )
        );

      yAxis.select('.domain').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
      yAxis.selectAll('.tick line').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
    }

    // Style axis text
    svg
      .selectAll('.x-axis text, .y-axis text')
      .attr('fill', '#666')
      .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
      .attr('font-size', '12px');
  }

  private renderChart() {
    const container = d3.select(this.container);
    container.selectAll('*').remove();

    // Get responsive width from container
    const containerElement = container.node() as HTMLElement;
    const containerWidth =
      containerElement?.parentElement?.clientWidth || this.options.width || 800;

    // Update width in options to match container
    this.options.width = containerWidth;

    // Calculate bins first to get actual frequency range
    const bins = this.calculateBins();
    const maxFrequency = bins.length > 0 ? Math.max(...bins.map((bin) => bin.frequency)) : 0;

    // Recalculate left margin based on actual data
    this.updateLeftMargin(maxFrequency);

    const {
      height = 400,
      margin = { top: 20, right: 20, bottom: 40, left: 60 },
      animate,
    } = this.options;
    const { xScale, yScale } = this.setupScalesWithBins(bins);

    this.svg = container
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', 'transparent');

    // Add grid lines
    if (this.options.showXGrid || this.options.showYGrid) {
      addGridLines(
        this.svg,
        xScale,
        yScale,
        containerWidth,
        height,
        margin,
        this.options.showXGrid,
        this.options.showYGrid
      );
    }

    // Create tooltip
    if (this.options.showTooltip) {
      this.tooltip = createTooltip(this.container, this.options.tooltipSize);
    }

    // Render histogram bars
    const barsGroup = this.svg.append('g').attr('class', 'histogram-bars');
    const barColor = getColor(0, this.options.colors);

    const bars = barsGroup
      .selectAll('.histogram-bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'histogram-bar')
      .attr('x', (d) => xScale(d.x0))
      .attr('width', (d) => Math.max(0, xScale(d.x1) - xScale(d.x0))) // No gaps between bars
      .attr('y', height - margin.bottom)
      .attr('height', 0)
      .attr('fill', barColor)
      .attr('stroke', 'none')
      .style('cursor', this.options.showTooltip ? 'pointer' : 'default');

    // Animate bars
    if (animate) {
      bars
        .transition()
        .duration(800)
        .ease(d3.easeBackOut.overshoot(0.1))
        .attr('y', (d) => yScale(d.frequency))
        .attr('height', (d) => Math.max(0, height - margin.bottom - yScale(d.frequency)));
    } else {
      bars
        .attr('y', (d) => yScale(d.frequency))
        .attr('height', (d) => Math.max(0, height - margin.bottom - yScale(d.frequency)));
    }

    // Add tooltip interactions
    if (this.options.showTooltip && this.tooltip) {
      bars
        .on('mouseenter', (event, d) => {
          const tooltipContent = `
            <div style="font-weight: 600; margin-bottom: 4px;">
              Range: ${formatNumber(d.x0)} - ${formatNumber(d.x1)}
            </div>
            <div>Count: ${d.length}</div>
            ${this.options.showDensity ? `<div>Density: ${d.frequency.toFixed(3)}</div>` : ''}
          `;
          showTooltip(this.tooltip!, tooltipContent, event);
        })
        .on('mouseleave', () => {
          hideTooltip(this.tooltip!);
        });
    }

    // Add axes
    this.addHistogramAxes(this.svg, xScale, yScale);

    // Add legend if enabled
    if (this.options.showLegend) {
      const legendData = [
        {
          label: this.options.showDensity ? 'Density Distribution' : 'Frequency Distribution',
          color: barColor,
        },
      ];

      addLegend(this.svg, legendData, containerWidth, height, margin, this.options.legendPosition);
    }
  }

  public render(): void {
    this.renderChart();

    // Add resize listener
    if (typeof window !== 'undefined') {
      this.resizeListener = () => {
        const containerElement = document.querySelector(this.container) as HTMLElement;
        if (containerElement) {
          const newWidth =
            containerElement?.parentElement?.clientWidth || this.options.width || 800;
          if (Math.abs(newWidth - this.options.width!) > 10) {
            // Only resize if significant change (prevents unnecessary re-renders)
            this.options.width = newWidth;
            this.renderChart();
          }
        }
      };
      window.addEventListener('resize', this.resizeListener);
    }
  }

  public update(data: number[]): void {
    this.data = data;
    this.renderChart();
  }

  public destroy(): void {
    if (this.tooltip) {
      this.tooltip.remove();
    }
    if (this.crosshairTooltip) {
      this.crosshairTooltip.remove();
    }
    if (this.resizeListener && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeListener);
    }
    const container = d3.select(this.container);
    container.selectAll('*').remove();
  }
}

export const createHistogramChart = (
  container: string,
  data: number[],
  options: HistogramChartOptions = {}
): HistogramChart => {
  return new HistogramChart(container, data, options);
};
