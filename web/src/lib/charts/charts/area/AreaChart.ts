import * as d3 from 'd3';

import { getColor } from '../../core/colors';
import {
  AreaChartOptions,
  ChartDataPoint,
  ChartDataset,
  HTMLDivSelection,
  IAreaChart,
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
  calculateLegendSpace,
  calculateNiceScale,
  createCrosshairTooltip,
  createTooltip,
  formatNumber,
  hideTooltip,
  showCrosshairTooltip,
  showTooltip,
} from '../../core/utils';

export class AreaChart implements IAreaChart {
  private container: string;
  private data: ChartDataset[];
  private options: AreaChartOptions;
  private svg?: SVGSelection;
  private tooltip?: HTMLDivSelection;
  private crosshairTooltip?: HTMLDivSelection;
  private crosshairLine?: SVGLineSelection;
  private resizeListener?: () => void;

  constructor(container: string, data: ChartDataset[], options: AreaChartOptions = {}) {
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
      fillOpacity: 0.3,
      curve: 'smooth',
      stacked: true,
      showStackedTotal: false,
      solidFill: false,
      yAxisStartsFromZero: true,
      tooltipSize: 'sm',
      ...options,
    };

    // Override margin with dynamic calculation if not explicitly provided
    if (!options.margin) {
      this.options.margin = dynamicMargin;
    }
  }

  private calculateMargins(options: AreaChartOptions): {
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
        const { niceMin, niceMax } = calculateNiceScale(yExtent[0], yExtent[1]);
        const maxYValue = Math.max(Math.abs(niceMin), Math.abs(niceMax));
        
        // Format the maximum value to estimate its display length using the same logic as axis labels
        const formattedMax = formatNumber(maxYValue);
        
        // Approximate 7 pixels per character + base padding
        const estimatedWidth = formattedMax.length * 7 + 20;
        left = Math.max(40, estimatedWidth);
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

    // Create defs for gradients
    this.svg.append('defs');

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
    const { width, height, margin, stacked } = this.options;

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

    // Calculate Y scale based on whether stacking is enabled
    let maxY: number;

    if (stacked && this.data.length > 1) {
      // For stacked areas, calculate the maximum cumulative value at any X position
      const uniqueXValues = Array.from(new Set(allXValues));
      maxY = Math.max(
        ...uniqueXValues.map((xValue) => {
          // Sum all Y values for this X position across all datasets
          return this.data.reduce((sum, dataset) => {
            const dataPoint = dataset.data.find((point) => point.x === xValue);
            return sum + (dataPoint ? dataPoint.y : 0);
          }, 0);
        })
      );
    } else {
      // For non-stacked areas, use the maximum individual Y value
      const yExtent = d3.extent(this.data.flatMap((d) => d.data.map((item) => item.y))) as [
        number,
        number,
      ];
      maxY = yExtent[1];
    }

    const yMin = this.options.yAxisStartsFromZero
      ? 0
      : Math.min(...this.data.flatMap((d) => d.data.map((item) => item.y)));
    const { niceMin, niceMax } = calculateNiceScale(yMin, maxY);
    const yScale = d3
      .scaleLinear()
      .domain([niceMin, niceMax]) // Use nice scale domain
      .range([height! - margin!.bottom, margin!.top]);

    return { xScale, yScale, isOrdinal, isDateScale };
  }

  private createGradient(
    color: string,
    index: number,
    dataset: ChartDataset,
    yScale: YScale,
    stacked: boolean
  ): string {
    const gradientId = `area-gradient-${index}`;
    const defs = this.svg!.select('defs');

    // Remove existing gradient
    defs.select(`#${gradientId}`).remove();

    let y1: number, y2: number;

    if (stacked && dataset.data.length > 0) {
      // For stacked areas, use the actual Y range of this specific area
      const minY0 = Math.min(...dataset.data.map((d) => d.y0 || 0));
      const maxY1 = Math.max(...dataset.data.map((d) => d.y1 || d.y));
      y1 = yScale(maxY1); // Top of the area (lower Y coordinate)
      y2 = yScale(minY0); // Bottom of the area (higher Y coordinate)
    } else {
      // For non-stacked areas, use full chart height
      y1 = this.options.margin!.top;
      y2 = this.options.height! - this.options.margin!.bottom;
    }

    const gradient = defs
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', y1)
      .attr('x2', 0)
      .attr('y2', y2);

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.7); // Increased from 0.3 to 0.7 for darker gradient

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.1); // Increased from 0.05 to 0.1 for slightly more visible bottom

    return `url(#${gradientId})`;
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
      stacked,
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

    // Prepare stacked data if stacking is enabled
    let stackedData = this.data;
    const cumulativeData: Map<string | number, number> = new Map();

    if (stacked && this.data.length > 1) {
      // Initialize cumulative values
      const allXValues = Array.from(
        new Set(this.data.flatMap((d) => d.data.map((item) => item.x)))
      );
      allXValues.forEach((x) => cumulativeData.set(x, 0));

      // Create stacked datasets
      stackedData = this.data.map((dataset) => {
        const stackedDataPoints = dataset.data.map((point) => {
          const currentCumulative = cumulativeData.get(point.x) || 0;
          const newCumulative = currentCumulative + point.y;
          cumulativeData.set(point.x, newCumulative);

          return {
            ...point,
            y0: currentCumulative, // Bottom of this area
            y1: newCumulative, // Top of this area
          };
        });

        return {
          ...dataset,
          data: stackedDataPoints,
        };
      });
    }

    // Create line and area generators
    const getXPosition = (d: ChartDataPoint): number => {
      if (isOrdinal) return (xScale as d3.ScalePoint<string>)(d.x as string)!;
      if (isDateScale) return (xScale as d3.ScaleTime<number, number>)(new Date(d.x as number));
      return (xScale as d3.ScaleLinear<number, number>)(d.x as number);
    };

    const line = d3
      .line<ChartDataPoint>()
      .x(getXPosition)
      .y((d) => yScale(stacked ? d.y1 || d.y : d.y));

    const area = d3
      .area<ChartDataPoint>()
      .x(getXPosition)
      .y0((d) => {
        if (stacked) {
          const y0Value = d.y0 || 0;
          const scaledY0 = yScale(y0Value);
          const axisPosition = height! - margin!.bottom;
          // Don't let stacked areas go below the axis
          return Math.min(scaledY0, axisPosition);
        } else {
          return height! - margin!.bottom - 1; // Stop 1px above axis line
        }
      })
      .y1((d) => yScale(stacked ? d.y1 || d.y : d.y));

    if (curve === 'smooth') {
      line.curve(d3.curveCardinal.tension(0.3));
      area.curve(d3.curveCardinal.tension(0.3));
    }

    // For overlapping (non-stacked) charts, render from largest area to smallest to minimize visual occlusion
    // For stacked charts, render in normal order
    const renderOrder =
      !stacked && this.data.length > 1
        ? stackedData.slice().sort((a, b) => {
            // Sort by maximum Y value descending (largest areas first)
            const maxA = Math.max(...a.data.map((d) => d.y));
            const maxB = Math.max(...b.data.map((d) => d.y));
            return maxB - maxA;
          })
        : stackedData;

    // Render each dataset
    renderOrder.forEach((dataset) => {
      // Find original index for color consistency
      const originalIndex = stackedData.findIndex((d) => d === dataset);
      const color = getColor(originalIndex, this.options.colors);

      // Handle fill style based on solidFill option
      let fillStyle: string;
      let fillOpacity: number;

      if (this.options.solidFill) {
        // Solid fill mode: use solid color with full opacity
        fillStyle = color;
        fillOpacity = 1;
      } else if (!stacked && this.data.length > 1) {
        // Overlapping areas: use gradient with opacity for natural transparency
        fillStyle = this.createGradient(color, originalIndex, dataset, yScale, false);
        fillOpacity = this.options.fillOpacity || 0.3;
      } else {
        // Stacked areas or single area: use gradient
        fillStyle = this.createGradient(color, originalIndex, dataset, yScale, stacked || false);
        fillOpacity = 1;
      }

      // Create group for this dataset
      const group = this.svg!.append('g').attr('class', `dataset-${originalIndex}`);

      // Add area path
      const areaPath = group
        .append('path')
        .datum(dataset.data)
        .attr('fill', fillStyle)
        .attr('fill-opacity', fillOpacity)
        .attr('d', area(dataset.data) || '');

      // Add line path
      const linePath = group
        .append('path')
        .datum(dataset.data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth || 2.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', line);

      // Animation
      if (animate) {
        // Animate area
        areaPath
          .attr('opacity', 0)
          .transition()
          .duration(1000)
          .delay(200 + originalIndex * 200)
          .attr('opacity', 1);

        // Animate line
        const totalLength = linePath.node()!.getTotalLength();
        linePath
          .attr('stroke-dasharray', totalLength + ' ' + totalLength)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(1500)
          .delay(originalIndex * 200)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0);
      }

      // Add points or invisible hover areas for tooltip
      if (showPoints || this.options.showTooltip) {
        const points = group
          .selectAll(`.point-${originalIndex}`)
          .data(dataset.data)
          .enter()
          .append('circle')
          .attr('class', `point-${originalIndex}`)
          .attr('cx', getXPosition)
          .attr('cy', (d) => yScale(stacked ? d.y1 || d.y : d.y))
          .attr('r', showPoints ? pointRadius || 4 : 6) // Larger invisible hover area if no points
          .attr('fill', showPoints ? '#ffffff' : 'transparent')
          .attr('stroke', showPoints ? color : 'transparent')
          .attr('stroke-width', showPoints ? 2 : 0)
          .style('cursor', 'pointer');

        // Animation for visible points only
        if (animate && showPoints) {
          points
            .attr('r', 0)
            .transition()
            .delay((d, i) => i * 100 + 1000 + originalIndex * 200)
            .duration(300)
            .attr('r', pointRadius || 4);
        }

        // Tooltip interaction (always enabled if showTooltip is true)
        if (this.options.showTooltip && this.tooltip) {
          points
            .on('mouseover', (event, d) => {
              const originalData = this.data[originalIndex].data.find((item) => item.x === d.x);
              const displayValue = originalData ? originalData.y : d.y;
              const dateLabel = originalData?.date || d.x;
              showTooltip(
                this.tooltip!,
                `<strong>${displayValue.toFixed(2)}</strong><br/>${dateLabel}`,
                event
              );

              // Show hover indicator on invisible points
              if (!showPoints) {
                d3.select(event.target as SVGCircleElement)
                  .attr('fill', 'rgba(59, 130, 246, 0.2)')
                  .attr('r', 4);
              }
            })
            .on('mouseout', (event) => {
              hideTooltip(this.tooltip!);

              // Hide hover indicator on invisible points
              if (!showPoints) {
                d3.select(event.target as SVGCircleElement)
                  .attr('fill', 'transparent')
                  .attr('r', 6);
              }
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
    const { width, height, margin, stacked } = this.options;
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
          if (isDateScale) {
            closestX = (xScale as d3.ScaleTime<number, number>).invert(mouseX).getTime();
          } else {
            closestX = (xScale as d3.ScaleLinear<number, number>).invert(mouseX);
          }
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
        let cumulativeValue = 0;

        this.data.forEach((dataset, index) => {
          const dataPoint = dataset.data.find((d) => d.x === closestX);
          if (dataPoint) {
            const originalValue = dataPoint.y;
            cumulativeValue += originalValue;

            tooltipData.push({
              label: dataset.label || `Dataset ${index + 1}`,
              value: originalValue,
              stackedValue: stacked ? cumulativeValue : undefined,
              yPosition: stacked ? cumulativeValue : originalValue,
              color: getColor(index, this.options.colors),
            });
          }
        });

        // Calculate actual X position for data point
        const actualXPosition = isOrdinal
          ? (xScale as d3.ScalePoint<string>)(closestX as string)!
          : isDateScale
            ? (xScale as d3.ScaleTime<number, number>)(new Date(closestX as number))
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
          .attr('cy', (d: TooltipData) => yScale(d.yPosition || d.value))
          .attr('r', 5)
          .attr('fill', (d: TooltipData) => d.color)
          .attr('stroke', 'white')
          .attr('stroke-width', 2);

        hoverPointsGroup.style('opacity', 1);

        if (tooltipData.length > 0) {
          // Create multi-value tooltip content
          const xDisplayValue =
            isDateScale && typeof closestX === 'number'
              ? new Date(closestX)
                  .toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit',
                  })
                  .replace(/ /g, ' ')
                  .replace(/,/g, " '")
              : closestX;

          let tooltipContent: string;

          if (this.options.tooltipContentCallback) {
            // Use custom tooltip callback
            tooltipContent = this.options.tooltipContentCallback(tooltipData, xDisplayValue);
          } else {
            // Use default tooltip content
            tooltipContent = `
              <div style="font-weight: 600; margin-bottom: 8px; color: #e5e7eb;">${xDisplayValue}</div>
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
              ${stacked && this.options.showStackedTotal ? `<div style="border-top: 1px solid #374151; margin-top: 8px; padding-top: 4px; color: #e5e7eb; font-weight: 600;">Total: ${cumulativeValue.toFixed(2)}</div>` : ''}
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
