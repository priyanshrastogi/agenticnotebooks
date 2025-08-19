import * as d3 from 'd3';

import { getColor } from '../../core/colors';
import {
  ChartDataPoint,
  ChartDataset,
  HTMLDivSelection,
  IScatterChart,
  ScatterChartOptions,
  ScatterTooltipData,
  SVGLineSelection,
  SVGSelection,
  XScale,
  YScale,
} from '../../core/types';
import {
  addAxes,
  addGridLines,
  addLegend,
  calculateLegendSpace,
  calculateNiceScale,
  createCrosshairTooltip,
  createTooltip,
  formatNumber,
  hideTooltip,
  showCrosshairTooltip,
  showTooltip,
} from '../../core/utils';

export class ScatterChart implements IScatterChart {
  private container: string;
  private data: ChartDataset[];
  private options: ScatterChartOptions;
  private svg?: SVGSelection;
  private tooltip?: HTMLDivSelection;
  private crosshairTooltip?: HTMLDivSelection;
  private crosshairLine?: SVGLineSelection;
  private resizeListener?: () => void;

  constructor(container: string, data: ChartDataset[], options: ScatterChartOptions = {}) {
    this.container = container;
    this.data = data;
    // Calculate dynamic margins based on options
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
      animate: true,
      pointRadius: 5,
      pointOpacity: 0.7,
      showTrendLine: false,
      yAxisStartsFromZero: true,
      tooltipSize: 'sm',
      ...options,
    };

    // Override margin with dynamic calculation if not explicitly provided
    if (!options.margin) {
      this.options.margin = dynamicMargin;
    }
  }

  private calculateMargins(options: ScatterChartOptions): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } {
    const showXAxis = options.showXAxis !== false; // Default to true
    const showYAxis = options.showYAxis !== false; // Default to true
    const showLegend = options.showLegend !== false; // Default to true
    const legendPosition = options.legendPosition || 'bottom';

    let top = 20;
    let right = 20;
    let bottom = showXAxis ? 40 : 10;
    let left = showYAxis ? 40 : 10;

    // Add extra space for axis labels
    if (showXAxis && options.xAxisLabel) {
      bottom += 20; // Extra space for X-axis label
    }
    if (showYAxis && options.yAxisLabel) {
      left += 20; // Extra space for Y-axis label
    }

    // Calculate dynamic left margin based on Y-axis label lengths
    if (showYAxis && this.data.length > 0) {
      // Get all Y values to estimate maximum label length
      const allYValues = this.data.flatMap((d) => d.data.map((item) => item.y));
      if (allYValues.length > 0) {
        const yExtent = d3.extent(allYValues) as [number, number];
        const yMin = options.yAxisStartsFromZero !== false ? 0 : yExtent[0];
        const { niceMin, niceMax } = calculateNiceScale(yMin, yExtent[1]);
        const maxYValue = Math.max(Math.abs(niceMin), Math.abs(niceMax));
        
        // Format the maximum value to estimate its display length using the same logic as axis labels
        const formattedMax = formatNumber(maxYValue);
        
        // Approximate 7 pixels per character + base padding
        const estimatedWidth = formattedMax.length * 7 + 20;
        left = Math.max(40, estimatedWidth);
        
        // Add extra space for Y-axis label if present
        if (options.yAxisLabel) {
          left += 15; // Additional space for the axis label
        }
      }
    }

    // Add dynamic space for legend based on actual content and wrapping
    if (showLegend && this.data.length > 0) {
      const legendData = this.data.map((dataset, index) => ({
        label: dataset.label || `Dataset ${index + 1}`,
        color: '', // We don't need color for space calculation
      }));
      
      // Calculate legend space requirements with current width
      const currentWidth = options.width || 800;
      const tempMargin = { top, right, bottom, left };
      const legendSpace = calculateLegendSpace(legendData, currentWidth, tempMargin, legendPosition);
      
      switch (legendPosition) {
        case 'bottom':
        case 'top':
          // For horizontal legends, add the calculated height
          if (legendPosition === 'bottom') {
            bottom += legendSpace.height;
          } else {
            top += legendSpace.height;
          }
          break;
        case 'left':
        case 'right':
          // For vertical legends, add the calculated width
          if (legendPosition === 'left') {
            left += legendSpace.width;
          } else {
            right += legendSpace.width;
          }
          break;
      }
    }

    return { top, right, bottom, left };
  }

  render(): void {
    this.destroy();
    this.createSVG();
    this.setupScales();
    this.renderChart();
  }

  private createSVG(): void {
    const { width, height } = this.options;
    const containerElement = d3.select(this.container).node() as HTMLElement;
    const containerWidth = containerElement?.parentElement?.clientWidth || width!;

    this.svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', height!)
      .attr('viewBox', `0 0 ${containerWidth} ${height!}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('background', 'transparent');

    if (this.options.showTooltip) {
      this.tooltip = createTooltip(this.container, this.options.tooltipSize);
      this.crosshairTooltip = createCrosshairTooltip(this.container, this.options.tooltipSize);
    }

    // Update width in options to match container
    this.options.width = containerWidth;

    // Add resize listener for responsiveness
    this.resizeListener = () => {
      const newWidth = containerElement?.parentElement?.clientWidth || width!;
      if (Math.abs(newWidth - this.options.width!) > 10) {
        // Only resize if significant change
        this.options.width = newWidth;
        this.svg?.attr('width', newWidth).attr('viewBox', `0 0 ${newWidth} ${height!}`);
        this.svg?.selectAll('*').remove();
        this.renderChart();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeListener);
    }
  }

  private setupScales(): {
    xScale: XScale;
    yScale: YScale;
    isOrdinal: boolean;
    isDateScale: boolean;
  } {
    const { width, height, margin } = this.options;

    // Determine if x-axis should be ordinal, date, or linear
    const allXValues = this.data.flatMap((d) => d.data.map((item) => item.x));
    const isOrdinal = allXValues.some((x) => typeof x === 'string');
    const isDate =
      !isOrdinal && allXValues.every((x) => typeof x === 'number' && x > 1000000000000); // Timestamp check

    let xScale: XScale;
    let isDateScale = false;

    if (isOrdinal) {
      const xDomain = Array.from(new Set(allXValues as string[]));
      xScale = d3
        .scalePoint()
        .domain(xDomain)
        .range([margin!.left, width! - margin!.right])
        .padding(0);
    } else if (isDate) {
      // Use time scale for dates
      const xExtent = d3.extent(allXValues as number[]) as [number, number];
      xScale = d3
        .scaleTime()
        .domain([new Date(xExtent[0]), new Date(xExtent[1])])
        .range([margin!.left, width! - margin!.right]);
      isDateScale = true;
    } else {
      const xExtent = d3.extent(allXValues as number[]) as [number, number];
      const { niceMin, niceMax } = calculateNiceScale(xExtent[0], xExtent[1]);
      xScale = d3
        .scaleLinear()
        .domain([niceMin, niceMax]) // Use nice scale for numeric X-axis
        .range([margin!.left, width! - margin!.right]);
    }

    const yExtent = d3.extent(this.data.flatMap((d) => d.data.map((item) => item.y))) as [
      number,
      number,
    ];
    const yMin = this.options.yAxisStartsFromZero ? 0 : yExtent[0];
    const { niceMin, niceMax } = calculateNiceScale(yMin, yExtent[1]);
    const yScale = d3
      .scaleLinear()
      .domain([niceMin, niceMax]) // Use nice scale domain
      .range([height! - margin!.bottom, margin!.top]);

    return { xScale, yScale, isOrdinal, isDateScale };
  }

  private calculateTrendLine(
    data: ChartDataPoint[],
    xScale: XScale,
    yScale: YScale
  ): string | null {
    if (data.length < 2) return null;

    // Convert data to numeric values for linear regression
    const numericData = data
      .map((d) => {
        let xVal: number;
        if (typeof d.x === 'string') {
          // For ordinal data, use the index
          return null;
        } else {
          xVal = d.x as number;
        }
        return { x: xVal, y: d.y };
      })
      .filter((d): d is { x: number; y: number } => d !== null);

    if (numericData.length < 2) return null;

    // Calculate linear regression
    const n = numericData.length;
    const sumX = numericData.reduce((sum, d) => sum + d.x, 0);
    const sumY = numericData.reduce((sum, d) => sum + d.y, 0);
    const sumXY = numericData.reduce((sum, d) => sum + d.x * d.y, 0);
    const sumX2 = numericData.reduce((sum, d) => sum + d.x * d.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Get domain range
    const xDomain = (xScale as d3.ScaleLinear<number, number>).domain();
    const yDomain = yScale.domain();
    const startX = xDomain[0];
    const endX = xDomain[1];

    const startY = slope * startX + intercept;
    const endY = slope * endX + intercept;

    // Clamp Y values to stay within chart bounds
    const clampedStartY = Math.max(yDomain[0], Math.min(yDomain[1], startY));
    const clampedEndY = Math.max(yDomain[0], Math.min(yDomain[1], endY));

    // Create line path
    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => (xScale as d3.ScaleLinear<number, number>)(d.x))
      .y((d) => yScale(d.y));

    return line([
      { x: startX, y: clampedStartY },
      { x: endX, y: clampedEndY },
    ]);
  }

  private renderChart(): void {
    const {
      width,
      height,
      margin,
      showXGrid,
      showYGrid,
      showXAxis,
      showYAxis,
      animate,
      pointRadius,
      pointOpacity,
      showTrendLine,
      trendLineColor,
    } = this.options;
    const { xScale, yScale, isOrdinal, isDateScale } = this.setupScales();

    // Add grid lines
    const actualShowXGrid = showXGrid !== false;
    const actualShowYGrid = showYGrid !== false;
    if (actualShowXGrid || actualShowYGrid) {
      addGridLines(
        this.svg!,
        xScale,
        yScale,
        width!,
        height!,
        margin!,
        actualShowXGrid,
        actualShowYGrid
      );
    }

    // Add axes
    const actualShowXAxis = showXAxis !== false;
    const actualShowYAxis = showYAxis !== false;
    if (actualShowXAxis || actualShowYAxis) {
      // Flatten data for analysis
      const flatData = this.data.flatMap((dataset) => dataset.data);
      addAxes(
        this.svg!,
        xScale,
        yScale,
        width!,
        height!,
        margin!,
        flatData,
        actualShowXAxis,
        actualShowYAxis,
        this.options.xAxisLabel,
        this.options.yAxisLabel,
        this.options.legendPosition || 'bottom',
        this.options.showLegend !== false
      );
    }

    // Add legend
    if (this.options.showLegend) {
      const legendData = this.data.map((dataset, index) => ({
        label: dataset.label || `Dataset ${index + 1}`,
        color: getColor(index, this.options.colors),
      }));
      addLegend(this.svg!, legendData, width!, height!, margin!, this.options.legendPosition);
    }

    // Create position functions
    const getXPosition = (d: ChartDataPoint): number => {
      if (isOrdinal) return (xScale as d3.ScalePoint<string>)(d.x as string)!;
      if (isDateScale) return (xScale as d3.ScaleTime<number, number>)(new Date(d.x as number));
      return (xScale as d3.ScaleLinear<number, number>)(d.x as number);
    };

    const getYPosition = (d: ChartDataPoint): number => yScale(d.y);

    // Render each dataset
    this.data.forEach((dataset, index) => {
      const color = getColor(index, this.options.colors);

      // Create group for this dataset
      const group = this.svg!.append('g').attr('class', `dataset-${index}`);

      // Add trend line if enabled and not ordinal data
      if (showTrendLine && !isOrdinal) {
        const trendPath = this.calculateTrendLine(dataset.data, xScale, yScale);
        if (trendPath) {
          group
            .append('path')
            .attr('d', trendPath)
            .attr('stroke', trendLineColor || color) // Use dataset color for trend line
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .attr('fill', 'none')
            .attr('opacity', 0.7);
        }
      }

      // Add scatter points
      const points = group
        .selectAll(`.point-${index}`)
        .data(dataset.data)
        .enter()
        .append('circle')
        .attr('class', `point-${index}`)
        .attr('cx', getXPosition)
        .attr('cy', getYPosition)
        .attr('r', pointRadius || 5)
        .attr('fill', color)
        .attr('opacity', pointOpacity || 0.7)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer');

      // Animation
      if (animate) {
        points
          .attr('r', 0)
          .attr('opacity', 0)
          .transition()
          .delay((d, i) => i * 50 + index * 200)
          .duration(400)
          .attr('r', pointRadius || 5)
          .attr('opacity', pointOpacity || 0.7);
      }

      // Tooltip interaction
      if (this.options.showTooltip && this.tooltip) {
        points
          .on('mouseover', (event, d) => {
            const displayValue = d.y.toFixed(2);
            const dateLabel = d.date || d.x;
            showTooltip(
              this.tooltip!,
              `<strong>${dataset.label || `Dataset ${index + 1}`}</strong><br/>X: ${dateLabel}<br/>Y: ${displayValue}`,
              event
            );

            // Highlight point on hover
            d3.select(event.target as SVGCircleElement)
              .transition()
              .duration(200)
              .attr('r', (pointRadius || 5) * 1.3)
              .attr('stroke-width', 2);
          })
          .on('mouseout', (event) => {
            hideTooltip(this.tooltip!);

            // Reset point size
            d3.select(event.target as SVGCircleElement)
              .transition()
              .duration(200)
              .attr('r', pointRadius || 5)
              .attr('stroke-width', 1);
          });
      }
    });

    // Add crosshair functionality if tooltips are enabled
    if (this.options.showTooltip) {
      this.addCrosshair();
    }
  }

  private addCrosshair(): void {
    const { width, height, margin } = this.options;
    const { xScale, yScale, isOrdinal, isDateScale } = this.setupScales();

    // Create invisible overlay for mouse tracking
    const overlay = this.svg!.append('rect')
      .attr('class', 'crosshair-overlay')
      .attr('x', margin!.left)
      .attr('y', margin!.top)
      .attr('width', width! - margin!.left - margin!.right)
      .attr('height', height! - margin!.top - margin!.bottom)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'crosshair');

    // Create highlight rings group for showing selected points
    const highlightRingsGroup = this.svg!.append('g')
      .attr('class', 'highlight-rings')
      .style('opacity', 0);

    overlay
      .on('mousemove', (event) => {
        const [mouseX, mouseY] = d3.pointer(event);

        // Find the single closest data point
        let closestPoint:
          | {
              dataset: ChartDataset;
              point: ChartDataPoint;
              distance: number;
              datasetIndex: number;
              pointX: number;
              pointY: number;
            }
          | undefined;

        this.data.forEach((dataset, datasetIndex) => {
          dataset.data.forEach((point) => {
            const pointX = isOrdinal
              ? (xScale as d3.ScalePoint<string>)(point.x as string)!
              : isDateScale
                ? (xScale as d3.ScaleTime<number, number>)(new Date(point.x as number))
                : (xScale as d3.ScaleLinear<number, number>)(point.x as number);

            const pointY = yScale(point.y);
            const distance = Math.sqrt(Math.pow(mouseX - pointX, 2) + Math.pow(mouseY - pointY, 2));

            if (!closestPoint || distance < closestPoint.distance) {
              closestPoint = { dataset, point, distance, datasetIndex, pointX, pointY };
            }
          });
        });

        // Only show tooltip and highlight if within reasonable distance (30px)
        if (closestPoint && closestPoint.distance < 30) {
          const { dataset, point, datasetIndex, pointX, pointY } = closestPoint;
          const color = getColor(datasetIndex, this.options.colors);
          const xDisplayValue =
            isDateScale && typeof point.x === 'number'
              ? new Date(point.x)
                  .toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit',
                  })
                  .replace(/ /g, ' ')
                  .replace(/,/g, " '")
              : point.x;

          // Show highlight ring around the closest point
          highlightRingsGroup.selectAll('*').remove();
          highlightRingsGroup
            .append('circle')
            .attr('cx', pointX)
            .attr('cy', pointY)
            .attr('r', (this.options.pointRadius || 5) + 3)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('opacity', 0.8);

          highlightRingsGroup.style('opacity', 1);

          // Show tooltip for the single closest point
          let tooltipContent: string;

          if (this.options.tooltipContentCallback) {
            // Use custom tooltip callback
            const scatterTooltipData: ScatterTooltipData = {
              label: dataset.label,
              x: xDisplayValue,
              y: point.y,
              color: color,
            };
            tooltipContent = this.options.tooltipContentCallback(scatterTooltipData);
          } else {
            // Use default tooltip content
            tooltipContent = `
              <div style="display: flex; align-items: center;">
                <div style="width: 10px; height: 10px; background: ${color}; border-radius: 50%; margin-right: 6px;"></div>
                <span style="color: #e5e7eb; margin-right: 4px;">${dataset.label}:</span>
                <span style="font-weight: 600; color: white;">(${xDisplayValue}, ${point.y.toFixed(2)})</span>
              </div>
            `;
          }

          showCrosshairTooltip(this.crosshairTooltip!, tooltipContent, event.pageX, event.pageY);
        } else {
          // Hide highlight and tooltip when no point is close enough
          highlightRingsGroup.style('opacity', 0);
          hideTooltip(this.crosshairTooltip!);
        }
      })
      .on('mouseleave', () => {
        // Hide highlights and tooltip
        highlightRingsGroup.style('opacity', 0);
        hideTooltip(this.crosshairTooltip!);
      });
  }

  update(data: ChartDataset[]): void {
    this.data = data;
    this.svg?.selectAll('*').remove();
    this.renderChart();
  }

  destroy(): void {
    d3.select(this.container).selectAll('*').remove();
    if (this.tooltip) {
      this.tooltip.remove();
    }
    if (this.crosshairTooltip) {
      this.crosshairTooltip.remove();
    }
    if (this.resizeListener && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeListener);
    }
  }
}
