import * as d3 from 'd3';

import { getColor } from '../../core/colors';
import {
  BarChartOptions,
  ChartDataset,
  HTMLDivSelection,
  IBarChart,
  SVGLineSelection,
  SVGSelection,
  TooltipData,
  XScale,
  YScale,
} from '../../core/types';
import {
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

export class BarChart implements IBarChart {
  private container: string;
  private data: ChartDataset[];
  private options: BarChartOptions;
  private svg?: SVGSelection;
  private tooltip?: HTMLDivSelection;
  private crosshairTooltip?: HTMLDivSelection;
  private crosshairLine?: SVGLineSelection;
  private resizeListener?: () => void;

  constructor(container: string, data: ChartDataset[], options: BarChartOptions = {}) {
    this.container = container;
    this.data = data;
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
      barWidth: 0.8,
      barPadding: 0.1,
      groupPadding: 0.2,
      stacked: false,
      horizontal: false,
      showValues: false,
      yAxisStartsFromZero: true,
      tooltipSize: 'sm',
      ...options,
    };

    if (!options.margin) {
      this.options.margin = dynamicMargin;
    }
  }

  private calculateMargins(options: BarChartOptions): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } {
    const showXAxis = options.showXAxis !== false;
    const showYAxis = options.showYAxis !== false;
    const showLegend = options.showLegend !== false;
    const legendPosition = options.legendPosition || 'bottom';
    const horizontal = options.horizontal || false;

    let top = 20;
    let right = 20;
    let bottom = showXAxis ? 40 : 10;
    let left = showYAxis ? 40 : 10;

    // For horizontal bar charts, calculate dynamic left margin based on label lengths
    if (horizontal && showYAxis) {
      const allXValues = Array.from(
        new Set(this.data.flatMap((d) => d.data.map((item) => item.x)))
      );
      const maxLabelLength = Math.max(...allXValues.map((x) => String(x).length));
      // Approximate 7 pixels per character + base padding
      left = Math.max(40, maxLabelLength * 7 + 20);
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

    this.options.width = containerWidth;

    this.resizeListener = () => {
      const newWidth = containerElement?.parentElement?.clientWidth || width!;
      if (Math.abs(newWidth - this.options.width!) > 10) {
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
    xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
    yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
    xSubgroupScale?: d3.ScaleBand<string>;
  } {
    const { width, height, margin, stacked, horizontal } = this.options;

    const allXValues = Array.from(new Set(this.data.flatMap((d) => d.data.map((item) => item.x))));
    const xDomain = allXValues.map(String);

    let maxY: number;
    if (stacked && this.data.length > 1) {
      maxY = Math.max(
        ...allXValues.map((xValue) => {
          return this.data.reduce((sum, dataset) => {
            const dataPoint = dataset.data.find((point) => point.x === xValue);
            return sum + (dataPoint ? dataPoint.y : 0);
          }, 0);
        })
      );
    } else {
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

    if (horizontal) {
      const yScale = d3
        .scaleBand()
        .domain(xDomain)
        .range([margin!.top, height! - margin!.bottom])
        .paddingInner(this.options.barPadding || 0.1)
        .paddingOuter(0);

      const xScale = d3
        .scaleLinear()
        .domain([niceMin, niceMax])
        .range([margin!.left, width! - margin!.right]);

      let xSubgroupScale: d3.ScaleBand<string> | undefined;
      if (!stacked && this.data.length > 1) {
        xSubgroupScale = d3
          .scaleBand()
          .domain(this.data.map((d) => d.label))
          .range([0, yScale.bandwidth()])
          .padding(this.options.groupPadding || 0.2);
      }

      return { xScale, yScale, xSubgroupScale };
    } else {
      const xScale = d3
        .scaleBand()
        .domain(xDomain)
        .range([margin!.left, width! - margin!.right])
        .paddingInner(this.options.barPadding || 0.1)
        .paddingOuter(0);

      const yScale = d3
        .scaleLinear()
        .domain([niceMin, niceMax])
        .range([height! - margin!.bottom, margin!.top]);

      let xSubgroupScale: d3.ScaleBand<string> | undefined;
      if (!stacked && this.data.length > 1) {
        xSubgroupScale = d3
          .scaleBand()
          .domain(this.data.map((d) => d.label))
          .range([0, xScale.bandwidth()])
          .padding(this.options.groupPadding || 0.2);
      }

      return { xScale, yScale, xSubgroupScale };
    }
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
      stacked,
      horizontal,
      showValues,
    } = this.options;
    const { xScale, yScale, xSubgroupScale } = this.setupScales();

    // For bar charts: vertical bars should only show Y grid, horizontal bars should only show X grid
    let actualShowXGrid = false;
    let actualShowYGrid = false;

    if (horizontal) {
      // Horizontal bars: only show X grid (makes sense for comparing values)
      actualShowXGrid = showXGrid !== false;
    } else {
      // Vertical bars: only show Y grid (makes sense for comparing values)
      actualShowYGrid = showYGrid !== false;
    }

    if (actualShowXGrid || actualShowYGrid) {
      addGridLines(
        this.svg!,
        xScale as XScale,
        yScale as YScale,
        width!,
        height!,
        margin!,
        actualShowXGrid,
        actualShowYGrid
      );
    }

    const actualShowXAxis = showXAxis !== false;
    const actualShowYAxis = showYAxis !== false;
    if (actualShowXAxis || actualShowYAxis) {
      this.addBarChartAxes(xScale, yScale, actualShowXAxis, actualShowYAxis);
    }

    if (this.options.showLegend) {
      const legendData = this.data.map((dataset, index) => ({
        label: dataset.label || `Dataset ${index + 1}`,
        color: getColor(index, this.options.colors),
      }));
      addLegend(this.svg!, legendData, width!, height!, margin!, this.options.legendPosition);
    }

    const allXValues = Array.from(new Set(this.data.flatMap((d) => d.data.map((item) => item.x))));

    if (stacked && this.data.length > 1) {
      this.renderStackedBars(allXValues, xScale, yScale);
    } else if (this.data.length > 1) {
      this.renderGroupedBars(allXValues, xScale, yScale, xSubgroupScale!);
    } else {
      this.renderSimpleBars(allXValues, xScale, yScale);
    }

    if (showValues) {
      this.renderValueLabels(allXValues, xScale, yScale, xSubgroupScale);
    }

    if (this.options.showTooltip) {
      this.addCrosshair();
    }
  }

  private renderSimpleBars(
    _xValues: (string | number)[],
    xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>
  ): void {
    const { animate, horizontal, margin, height } = this.options;
    const dataset = this.data[0];
    const color = getColor(0, this.options.colors);

    const bars = this.svg!.selectAll('.bar')
      .data(dataset.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('fill', color);

    if (horizontal) {
      bars
        .attr('x', margin!.left)
        .attr('y', (d) => (yScale as d3.ScaleBand<string>)(String(d.x))!)
        .attr('width', 0)
        .attr('height', (yScale as d3.ScaleBand<string>).bandwidth());

      if (animate) {
        bars
          .transition()
          .duration(800)
          .delay((_, i) => i * 50)
          .attr('width', (d) => (xScale as d3.ScaleLinear<number, number>)(d.y) - margin!.left);
      } else {
        bars.attr('width', (d) => (xScale as d3.ScaleLinear<number, number>)(d.y) - margin!.left);
      }
    } else {
      bars
        .attr('x', (d) => (xScale as d3.ScaleBand<string>)(String(d.x))!)
        .attr('y', height! - margin!.bottom)
        .attr('width', (xScale as d3.ScaleBand<string>).bandwidth())
        .attr('height', 0);

      if (animate) {
        bars
          .transition()
          .duration(800)
          .delay((_, i) => i * 50)
          .attr('y', (d) => (yScale as d3.ScaleLinear<number, number>)(d.y))
          .attr(
            'height',
            (d) => height! - margin!.bottom - (yScale as d3.ScaleLinear<number, number>)(d.y)
          );
      } else {
        bars
          .attr('y', (d) => (yScale as d3.ScaleLinear<number, number>)(d.y))
          .attr(
            'height',
            (d) => height! - margin!.bottom - (yScale as d3.ScaleLinear<number, number>)(d.y)
          );
      }
    }

    if (this.options.showTooltip && this.tooltip) {
      bars
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

  private renderGroupedBars(
    xValues: (string | number)[],
    xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    xSubgroupScale: d3.ScaleBand<string>
  ): void {
    const { animate, horizontal, margin, height } = this.options;

    const groups = this.svg!.selectAll('.bar-group')
      .data(xValues)
      .enter()
      .append('g')
      .attr('class', 'bar-group');

    if (horizontal) {
      groups.attr(
        'transform',
        (d) => `translate(0, ${(yScale as d3.ScaleBand<string>)(String(d))})`
      );
    } else {
      groups.attr(
        'transform',
        (d) => `translate(${(xScale as d3.ScaleBand<string>)(String(d))}, 0)`
      );
    }

    this.data.forEach((dataset, index) => {
      const color = getColor(index, this.options.colors);

      const bars = groups.append('rect').attr('class', `bar bar-${index}`).attr('fill', color);

      if (horizontal) {
        bars
          .attr('x', margin!.left)
          .attr('y', xSubgroupScale(dataset.label)!)
          .attr('width', 0)
          .attr('height', xSubgroupScale.bandwidth());

        const barData = xValues.map((xValue) => {
          const dataPoint = dataset.data.find((d) => d.x === xValue);
          return dataPoint ? dataPoint.y : 0;
        });

        bars.data(barData);

        if (animate) {
          bars
            .transition()
            .duration(800)
            .delay((_, i) => i * 50 + index * 100)
            .attr(
              'width',
              (d) => (xScale as d3.ScaleLinear<number, number>)(d as number) - margin!.left
            );
        } else {
          bars.attr(
            'width',
            (d) => (xScale as d3.ScaleLinear<number, number>)(d as number) - margin!.left
          );
        }
      } else {
        bars
          .attr('x', xSubgroupScale(dataset.label)!)
          .attr('y', height! - margin!.bottom)
          .attr('width', xSubgroupScale.bandwidth())
          .attr('height', 0);

        const barData = xValues.map((xValue) => {
          const dataPoint = dataset.data.find((d) => d.x === xValue);
          return dataPoint ? dataPoint.y : 0;
        });

        bars.data(barData);

        if (animate) {
          bars
            .transition()
            .duration(800)
            .delay((_, i) => i * 50 + index * 100)
            .attr('y', (d) => (yScale as d3.ScaleLinear<number, number>)(d as number))
            .attr(
              'height',
              (d) =>
                height! - margin!.bottom - (yScale as d3.ScaleLinear<number, number>)(d as number)
            );
        } else {
          bars
            .attr('y', (d) => (yScale as d3.ScaleLinear<number, number>)(d as number))
            .attr(
              'height',
              (d) =>
                height! - margin!.bottom - (yScale as d3.ScaleLinear<number, number>)(d as number)
            );
        }
      }

      if (this.options.showTooltip && this.tooltip) {
        bars
          .on('mouseover', (event, d) => {
            const parentNode = (event.currentTarget as SVGRectElement).parentNode;
            const groupNodes = groups.nodes();
            const xValue = xValues[groupNodes.indexOf(parentNode as SVGGElement)];
            showTooltip(
              this.tooltip!,
              `<strong>${dataset.label}</strong><br/>X: ${xValue}<br/>Y: ${d}`,
              event
            );
          })
          .on('mouseout', () => {
            hideTooltip(this.tooltip!);
          });
      }
    });
  }

  private renderStackedBars(
    xValues: (string | number)[],
    xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>
  ): void {
    const { animate, horizontal, margin, height } = this.options;

    const stackedData: {
      [key: string]: { y0: number; y1: number; dataset: ChartDataset; index: number }[];
    } = {};

    xValues.forEach((xValue) => {
      let cumulative = 0;
      stackedData[String(xValue)] = [];

      this.data.forEach((dataset, index) => {
        const dataPoint = dataset.data.find((d) => d.x === xValue);
        const value = dataPoint ? dataPoint.y : 0;

        stackedData[String(xValue)].push({
          y0: cumulative,
          y1: cumulative + value,
          dataset,
          index,
        });

        cumulative += value;
      });
    });

    xValues.forEach((xValue) => {
      const stack = stackedData[String(xValue)];

      stack.forEach((item) => {
        const color = getColor(item.index, this.options.colors);

        const bar = this.svg!.append('rect')
          .attr('class', `bar bar-${item.index}`)
          .attr('fill', color);

        if (horizontal) {
          bar
            .attr('x', (xScale as d3.ScaleLinear<number, number>)(item.y0))
            .attr('y', (yScale as d3.ScaleBand<string>)(String(xValue))!)
            .attr('width', 0)
            .attr('height', (yScale as d3.ScaleBand<string>).bandwidth());

          if (animate) {
            bar
              .transition()
              .duration(800)
              .delay(item.index * 100)
              .attr(
                'width',
                (xScale as d3.ScaleLinear<number, number>)(item.y1) -
                  (xScale as d3.ScaleLinear<number, number>)(item.y0)
              );
          } else {
            bar.attr(
              'width',
              (xScale as d3.ScaleLinear<number, number>)(item.y1) -
                (xScale as d3.ScaleLinear<number, number>)(item.y0)
            );
          }
        } else {
          bar
            .attr('x', (xScale as d3.ScaleBand<string>)(String(xValue))!)
            .attr('y', height! - margin!.bottom)
            .attr('width', (xScale as d3.ScaleBand<string>).bandwidth())
            .attr('height', 0);

          if (animate) {
            bar
              .transition()
              .duration(800)
              .delay(item.index * 100)
              .attr('y', (yScale as d3.ScaleLinear<number, number>)(item.y1))
              .attr(
                'height',
                (yScale as d3.ScaleLinear<number, number>)(item.y0) -
                  (yScale as d3.ScaleLinear<number, number>)(item.y1)
              );
          } else {
            bar
              .attr('y', (yScale as d3.ScaleLinear<number, number>)(item.y1))
              .attr(
                'height',
                (yScale as d3.ScaleLinear<number, number>)(item.y0) -
                  (yScale as d3.ScaleLinear<number, number>)(item.y1)
              );
          }
        }

        if (this.options.showTooltip && this.tooltip) {
          bar
            .on('mouseover', (event) => {
              const value = item.y1 - item.y0;
              showTooltip(
                this.tooltip!,
                `<strong>${item.dataset.label}</strong><br/>X: ${xValue}<br/>Y: ${value}`,
                event
              );
            })
            .on('mouseout', () => {
              hideTooltip(this.tooltip!);
            });
        }
      });
    });
  }

  private renderValueLabels(
    xValues: (string | number)[],
    xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    xSubgroupScale?: d3.ScaleBand<string>
  ): void {
    const { stacked, horizontal } = this.options;

    if (stacked && this.data.length > 1) {
      const stackedData: {
        [key: string]: { y0: number; y1: number; dataset: ChartDataset; index: number }[];
      } = {};

      xValues.forEach((xValue) => {
        let cumulative = 0;
        stackedData[String(xValue)] = [];

        this.data.forEach((dataset, index) => {
          const dataPoint = dataset.data.find((d) => d.x === xValue);
          const value = dataPoint ? dataPoint.y : 0;

          stackedData[String(xValue)].push({
            y0: cumulative,
            y1: cumulative + value,
            dataset,
            index,
          });

          cumulative += value;
        });
      });

      xValues.forEach((xValue) => {
        const stack = stackedData[String(xValue)];

        stack.forEach((item) => {
          const value = item.y1 - item.y0;
          if (value > 0) {
            const text = this.svg!.append('text')
              .attr('class', 'value-label')
              .attr('text-anchor', 'middle')
              .attr('fill', 'white')
              .attr('font-size', '12px')
              .attr('font-weight', 'bold')
              .text(value.toFixed(1));

            if (horizontal) {
              const x =
                (xScale as d3.ScaleLinear<number, number>)(item.y0) +
                ((xScale as d3.ScaleLinear<number, number>)(item.y1) -
                  (xScale as d3.ScaleLinear<number, number>)(item.y0)) /
                  2;
              const y =
                (yScale as d3.ScaleBand<string>)(String(xValue))! +
                (yScale as d3.ScaleBand<string>).bandwidth() / 2;
              text.attr('x', x).attr('y', y).attr('dy', '0.35em');
            } else {
              const x =
                (xScale as d3.ScaleBand<string>)(String(xValue))! +
                (xScale as d3.ScaleBand<string>).bandwidth() / 2;
              const y =
                (yScale as d3.ScaleLinear<number, number>)(item.y1) +
                ((yScale as d3.ScaleLinear<number, number>)(item.y0) -
                  (yScale as d3.ScaleLinear<number, number>)(item.y1)) /
                  2;
              text.attr('x', x).attr('y', y).attr('dy', '0.35em');
            }
          }
        });
      });
    } else {
      this.data.forEach((dataset) => {
        dataset.data.forEach((d) => {
          if (d.y > 0) {
            const text = this.svg!.append('text')
              .attr('class', 'value-label')
              .attr('text-anchor', 'middle')
              .attr('fill', '#374151')
              .attr('font-size', '11px')
              .attr('font-weight', '500')
              .text(d.y.toFixed(1));

            if (horizontal) {
              const x = (xScale as d3.ScaleLinear<number, number>)(d.y) + 5;
              let y: number;

              if (this.data.length > 1 && xSubgroupScale) {
                y =
                  (yScale as d3.ScaleBand<string>)(String(d.x))! +
                  xSubgroupScale(dataset.label)! +
                  xSubgroupScale.bandwidth() / 2;
              } else {
                y =
                  (yScale as d3.ScaleBand<string>)(String(d.x))! +
                  (yScale as d3.ScaleBand<string>).bandwidth() / 2;
              }

              text.attr('x', x).attr('y', y).attr('dy', '0.35em').attr('text-anchor', 'start');
            } else {
              let x: number;

              if (this.data.length > 1 && xSubgroupScale) {
                x =
                  (xScale as d3.ScaleBand<string>)(String(d.x))! +
                  xSubgroupScale(dataset.label)! +
                  xSubgroupScale.bandwidth() / 2;
              } else {
                x =
                  (xScale as d3.ScaleBand<string>)(String(d.x))! +
                  (xScale as d3.ScaleBand<string>).bandwidth() / 2;
              }

              const y = (yScale as d3.ScaleLinear<number, number>)(d.y) - 5;
              text.attr('x', x).attr('y', y);
            }
          }
        });
      });
    }
  }

  private addCrosshair(): void {
    const { width, height, margin, stacked, horizontal } = this.options;
    const { xScale, yScale } = this.setupScales();

    const overlay = this.svg!.append('rect')
      .attr('class', 'crosshair-overlay')
      .attr('x', margin!.left)
      .attr('y', margin!.top)
      .attr('width', width! - margin!.left - margin!.right)
      .attr('height', height! - margin!.top - margin!.bottom)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'crosshair');

    this.crosshairLine = this.svg!.append('line')
      .attr('class', 'crosshair-line')
      .attr('stroke', 'rgba(100, 100, 100, 0.8)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    if (horizontal) {
      this.crosshairLine.attr('x1', margin!.left).attr('x2', width! - margin!.right);
    } else {
      this.crosshairLine.attr('y1', margin!.top).attr('y2', height! - margin!.bottom);
    }

    overlay
      .on('mousemove', (event) => {
        const [mouseX, mouseY] = d3.pointer(event);

        let closestX: string | number;

        if (horizontal) {
          const yDomain = (yScale as d3.ScaleBand<string>).domain();
          const step = (height! - margin!.top - margin!.bottom) / yDomain.length;
          const relativeY = mouseY - margin!.top;
          const index = Math.floor(relativeY / step);
          closestX = yDomain[Math.max(0, Math.min(index, yDomain.length - 1))];

          const actualYPosition =
            (yScale as d3.ScaleBand<string>)(closestX)! +
            (yScale as d3.ScaleBand<string>).bandwidth() / 2;
          this.crosshairLine!.attr('y1', actualYPosition)
            .attr('y2', actualYPosition)
            .style('opacity', 1);
        } else {
          const xDomain = (xScale as d3.ScaleBand<string>).domain();
          const step = (width! - margin!.left - margin!.right) / xDomain.length;
          const relativeX = mouseX - margin!.left;
          const index = Math.floor(relativeX / step);
          closestX = xDomain[Math.max(0, Math.min(index, xDomain.length - 1))];

          const actualXPosition =
            (xScale as d3.ScaleBand<string>)(closestX)! +
            (xScale as d3.ScaleBand<string>).bandwidth() / 2;
          this.crosshairLine!.attr('x1', actualXPosition)
            .attr('x2', actualXPosition)
            .style('opacity', 1);
        }

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
              color: getColor(index, this.options.colors),
            });
          }
        });

        if (tooltipData.length > 0) {
          let tooltipContent: string;

          if (this.options.tooltipContentCallback) {
            tooltipContent = this.options.tooltipContentCallback(tooltipData, closestX);
          } else {
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
              ${stacked && this.options.showStackedTotal ? `<div style="border-top: 1px solid #374151; margin-top: 8px; padding-top: 4px; color: #e5e7eb; font-weight: 600;">Total: ${cumulativeValue.toFixed(2)}</div>` : ''}
            `;
          }

          showCrosshairTooltip(this.crosshairTooltip!, tooltipContent, event.pageX, event.pageY);
        }
      })
      .on('mouseleave', () => {
        this.crosshairLine!.style('opacity', 0);
        hideTooltip(this.crosshairTooltip!);
      });
  }

  update(data: ChartDataset[]): void {
    this.data = data;
    this.svg?.selectAll('*').remove();
    this.renderChart();
  }

  private addBarChartAxes(
    xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    yScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
    showXAxis: boolean,
    showYAxis: boolean
  ): void {
    const { height, margin, horizontal } = this.options;
    const chartBottom = height! - margin!.bottom;
    const chartLeft = margin!.left;

    if (horizontal) {
      // Horizontal bars: X-axis is linear (values), Y-axis is band (categories)
      if (showXAxis) {
        const linearXScale = xScale as d3.ScaleLinear<number, number>;
        const xDomain = linearXScale.domain();
        const { ticks: tickValues } = calculateNiceScale(xDomain[0], xDomain[1]);

        const xAxis = this.svg!.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${chartBottom})`)
          .call(
            d3
              .axisBottom(linearXScale)
              .tickValues(tickValues)
              .tickSize(5)
              .tickPadding(8)
              .tickFormat((d) => formatNumber(d as number))
          );

        // Style X-axis
        xAxis.select('.domain').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
        xAxis.selectAll('.tick line').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
      }

      if (showYAxis) {
        const bandYScale = yScale as d3.ScaleBand<string>;
        const yAxis = this.svg!.append('g')
          .attr('class', 'y-axis')
          .attr('transform', `translate(${chartLeft},0)`)
          .call(d3.axisLeft(bandYScale).tickSize(5).tickPadding(8));

        // Style Y-axis
        yAxis.select('.domain').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
        yAxis.selectAll('.tick line').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
      }
    } else {
      // Vertical bars: X-axis is band (categories), Y-axis is linear (values)
      if (showXAxis) {
        const bandXScale = xScale as d3.ScaleBand<string>;
        const xAxis = this.svg!.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${chartBottom})`)
          .call(d3.axisBottom(bandXScale).tickSize(5).tickPadding(8));

        // Style X-axis
        xAxis.select('.domain').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
        xAxis.selectAll('.tick line').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
      }

      if (showYAxis) {
        const linearYScale = yScale as d3.ScaleLinear<number, number>;
        const yDomain = linearYScale.domain();
        const { ticks: tickValues } = calculateNiceScale(yDomain[0], yDomain[1]);

        const yAxis = this.svg!.append('g')
          .attr('class', 'y-axis')
          .attr('transform', `translate(${chartLeft},0)`)
          .call(
            d3
              .axisLeft(linearYScale)
              .tickValues(tickValues)
              .tickSize(5)
              .tickPadding(8)
              .tickFormat((d) => formatNumber(d as number))
          );

        // Style Y-axis
        yAxis.select('.domain').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
        yAxis.selectAll('.tick line').attr('stroke', 'rgba(0, 0, 0, 0.8)').attr('stroke-width', 1);
      }
    }

    // Style axis text
    this.svg!.selectAll('.x-axis text, .y-axis text')
      .attr('fill', '#666')
      .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
      .attr('font-size', '12px');
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
