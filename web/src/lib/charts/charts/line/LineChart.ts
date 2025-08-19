import * as d3 from 'd3';

import { getColor } from '../../core/colors';
import {
  ChartDataPoint,
  ChartDataset,
  HTMLDivSelection,
  ILineChart,
  LineChartOptions,
  SVGLineSelection,
  SVGSelection,
  TooltipData,
  XScale,
  YScale,
} from '../../core/types';
import {
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
} from '../../core/utils';

export class LineChart implements ILineChart {
  private container: string;
  private data: ChartDataset[];
  private options: LineChartOptions;
  private svg?: SVGSelection;
  private tooltip?: HTMLDivSelection;
  private crosshairTooltip?: HTMLDivSelection;
  private crosshairLine?: SVGLineSelection;
  private resizeListener?: () => void;

  constructor(container: string, data: ChartDataset[], options: LineChartOptions = {}) {
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
      showPoints: true,
      pointRadius: 4,
      strokeWidth: 2.5,
      curve: 'smooth',
      yAxisStartsFromZero: true,
      tooltipSize: 'sm',
      ...options,
    };

    // Override margin with dynamic calculation if not explicitly provided
    if (!options.margin) {
      this.options.margin = dynamicMargin;
    }
  }

  private calculateMargins(options: LineChartOptions): {
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
      }
    }

    // Add space for legend
    if (showLegend) {
      switch (legendPosition) {
        case 'bottom':
          bottom += 50; // Increased to accommodate potential multi-row legends
          break;
        case 'top':
          top += 40; // Increased slightly
          break;
        case 'left':
          left += 120; // Increased for longer labels
          break;
        case 'right':
          right += 120; // Increased for longer labels
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

  private setupScales(): { xScale: XScale; yScale: YScale; isOrdinal: boolean } {
    const { width, height, margin } = this.options;

    // Determine if x-axis should be ordinal or linear
    const allXValues = this.data.flatMap((d) => d.data.map((item) => item.x));
    const isOrdinal = allXValues.some((x) => typeof x === 'string');

    let xScale: XScale;

    if (isOrdinal) {
      const xDomain = Array.from(new Set(allXValues as string[]));
      xScale = d3
        .scalePoint()
        .domain(xDomain)
        .range([margin!.left, width! - margin!.right])
        .padding(0);
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

    return { xScale, yScale, isOrdinal };
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
      curve,
      strokeWidth,
      showPoints,
      pointRadius,
    } = this.options;
    const { xScale, yScale, isOrdinal } = this.setupScales();

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
        actualShowYAxis
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

    // Create line generator
    const line = d3
      .line<ChartDataPoint>()
      .x((d) => {
        if (isOrdinal) {
          const pointScale = xScale as d3.ScalePoint<string>;
          return pointScale(d.x as string) || 0;
        }
        const linearScale = xScale as d3.ScaleLinear<number, number>;
        return linearScale(d.x as number);
      })
      .y((d) => yScale(d.y));

    if (curve === 'smooth') {
      line.curve(d3.curveCardinal.tension(0.3));
    }

    // Render each dataset
    this.data.forEach((dataset, index) => {
      const color = getColor(index, this.options.colors);

      // Create group for this dataset
      const group = this.svg!.append('g').attr('class', `dataset-${index}`);

      // Add line path
      const path = group
        .append('path')
        .datum(dataset.data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth || 2.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', line(dataset.data) || '');

      // Animation
      if (animate) {
        const totalLength = path.node()!.getTotalLength();
        path
          .attr('stroke-dasharray', totalLength + ' ' + totalLength)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(1500)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0);
      }

      // Add points
      if (showPoints) {
        const points = group
          .selectAll(`.point-${index}`)
          .data(dataset.data)
          .enter()
          .append('circle')
          .attr('class', `point-${index}`)
          .attr('cx', (d) => {
            if (isOrdinal) {
              const pointScale = xScale as d3.ScalePoint<string>;
              return pointScale(d.x as string) || 0;
            }
            const linearScale = xScale as d3.ScaleLinear<number, number>;
            return linearScale(d.x as number);
          })
          .attr('cy', (d) => yScale(d.y))
          .attr('r', pointRadius || 4)
          .attr('fill', '#ffffff')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .style('cursor', 'pointer');

        // Animation for points
        if (animate) {
          points
            .attr('r', 0)
            .transition()
            .delay((d, i) => i * 100)
            .duration(300)
            .attr('r', pointRadius || 4);
        }

        // Tooltip interaction
        if (this.options.showTooltip && this.tooltip) {
          points
            .on('mouseover', (event, d) => {
              showTooltip(
                this.tooltip!,
                `<strong>${dataset.label}</strong><br/>X: ${d.x}<br/>Y: ${d.y}`,
                event
              );
            })
            .on('mouseout', () => {
              hideTooltip(this.tooltip!);
            });
        }
      }
    });

    // Add crosshair functionality by default if tooltips are enabled
    if (this.options.showTooltip) {
      this.addCrosshair();
    }
  }

  private addCrosshair(): void {
    const { width, height, margin } = this.options;
    const { xScale, yScale, isOrdinal } = this.setupScales();

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

    // Create crosshair line (initially hidden)
    this.crosshairLine = this.svg!.append('line')
      .attr('class', 'crosshair-line')
      .attr('y1', margin!.top)
      .attr('y2', height! - margin!.bottom)
      .attr('stroke', 'rgba(100, 100, 100, 0.8)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    // Create hover points group (initially hidden)
    const hoverPointsGroup = this.svg!.append('g')
      .attr('class', 'hover-points')
      .style('opacity', 0);

    overlay
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);

        // Find closest X value first
        let closestX: string | number;
        if (isOrdinal) {
          const xDomain = (xScale as d3.ScalePoint<string>).domain();
          const step = (width! - margin!.left - margin!.right) / (xDomain.length - 1);
          const relativeX = mouseX - margin!.left;
          const index = Math.round(relativeX / step);
          closestX = xDomain[Math.max(0, Math.min(index, xDomain.length - 1))];
        } else {
          closestX = (xScale as d3.ScaleLinear<number, number>).invert(mouseX);
          // Find the actual closest data point
          const allXValues = Array.from(
            new Set(this.data.flatMap((d) => d.data.map((item) => item.x)))
          );
          closestX = allXValues.reduce((prev, curr) =>
            Math.abs((curr as number) - (closestX as number)) <
            Math.abs((prev as number) - (closestX as number))
              ? curr
              : prev
          );
        }

        // Get all dataset values at this X position
        const tooltipData: TooltipData[] = [];
        this.data.forEach((dataset, index) => {
          const dataPoint = dataset.data.find((d) => d.x === closestX);
          if (dataPoint) {
            tooltipData.push({
              label: dataset.label || `Dataset ${index + 1}`,
              value: dataPoint.y,
              color: getColor(index, this.options.colors),
            });
          }
        });

        // Calculate actual X position for data point
        const actualXPosition = isOrdinal
          ? (xScale as d3.ScalePoint<string>)(closestX as string)!
          : (xScale as d3.ScaleLinear<number, number>)(closestX as number);

        // Show crosshair line at actual data point position
        this.crosshairLine!.attr('x1', actualXPosition)
          .attr('x2', actualXPosition)
          .style('opacity', 1);

        // Update hover points
        hoverPointsGroup.selectAll('.hover-point').remove();

        hoverPointsGroup
          .selectAll('.hover-point')
          .data(tooltipData)
          .enter()
          .append('circle')
          .attr('class', 'hover-point')
          .attr('cx', actualXPosition)
          .attr('cy', (d: TooltipData) => yScale(d.value))
          .attr('r', 5)
          .attr('fill', (d: TooltipData) => d.color)
          .attr('stroke', 'white')
          .attr('stroke-width', 2);

        hoverPointsGroup.style('opacity', 1);

        if (tooltipData.length > 0) {
          // Create multi-value tooltip content
          let tooltipContent: string;

          if (this.options.tooltipContentCallback) {
            // Use custom tooltip callback
            tooltipContent = this.options.tooltipContentCallback(tooltipData, closestX);
          } else {
            // Use default tooltip content
            tooltipContent = `
              <div style="font-weight: 600; margin-bottom: 8px; color: #e5e7eb;">${closestX}</div>
              ${tooltipData
                .map(
                  (item) => `
                <div style="display: flex; align-items: center; margin-bottom: 2px;">
                  <div style="width: 10px; height: 10px; background: ${item.color}; border-radius: 50%; margin-right: 6px;"></div>
                  <span style="color: #e5e7eb; margin-right: 4px;">${item.label}:</span>
                  <span style="font-weight: 600; color: white;">${item.value.toFixed(2)}</span>
                </div>
              `
                )
                .join('')}
            `;
          }

          showCrosshairTooltip(this.crosshairTooltip!, tooltipContent, event.pageX, event.pageY);
        }
      })
      .on('mouseleave', () => {
        // Hide crosshair line, hover points, and tooltip
        this.crosshairLine!.style('opacity', 0);
        hoverPointsGroup.style('opacity', 0);
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
