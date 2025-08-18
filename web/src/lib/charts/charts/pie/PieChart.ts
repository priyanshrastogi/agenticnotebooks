import * as d3 from 'd3';

import { getColor } from '../../core/colors';
import {
  HTMLDivSelection,
  IPieChart,
  PieChartOptions,
  PieDataPoint,
  PieTooltipData,
  SVGSelection,
} from '../../core/types';
import {
  addLegend,
  createCrosshairTooltip,
  createTooltip,
  hideTooltip,
  showCrosshairTooltip,
} from '../../core/utils';

export class PieChart implements IPieChart {
  private container: string;
  private data: PieDataPoint[];
  private options: PieChartOptions;
  private svg?: SVGSelection;
  private tooltip?: HTMLDivSelection;
  private crosshairTooltip?: HTMLDivSelection;
  private resizeListener?: () => void;

  constructor(container: string, data: PieDataPoint[], options: PieChartOptions = {}) {
    this.container = container;
    this.data = data;
    
    // Calculate dynamic margins based on options
    const dynamicMargin = this.calculateMargins(options);
    
    this.options = {
      width: 400,
      height: 400,
      margin: dynamicMargin,
      showTooltip: true,
      animate: true,
      showLegend: true,
      legendPosition: 'right',
      innerRadius: 0, // 0 = pie chart, > 0 = doughnut
      outerRadius: 150,
      padAngle: 0.02,
      cornerRadius: 2,
      showLabels: true,
      showValues: false,
      showPercentages: true,
      labelDistance: 1.2,
      tooltipSize: 'sm',
      ...options,
    };
    
    // Override margin with dynamic calculation if not explicitly provided
    if (!options.margin) {
      this.options.margin = dynamicMargin;
    }
  }

  private calculateMargins(options: PieChartOptions): { top: number; right: number; bottom: number; left: number } {
    const showLegend = options.showLegend !== false; // Default to true
    const legendPosition = options.legendPosition || 'right';
    
    let top = 20;
    let right = 20;
    let bottom = 20;
    let left = 20;
    
    // Add space for legend
    if (showLegend) {
      switch (legendPosition) {
        case 'bottom':
          bottom += 80;
          break;
        case 'top':
          top += 60;
          break;
        case 'left':
          left += 150;
          break;
        case 'right':
          right += 150;
          break;
      }
    }
    
    return { top, right, bottom, left };
  }

  render(): void {
    this.destroy();
    this.createSVG();
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

  private renderChart(): void {
    const {
      width,
      height,
      margin,
      animate,
      innerRadius,
      outerRadius,
      padAngle,
      cornerRadius,
      showLabels,
      showValues,
      showPercentages,
      labelDistance,
    } = this.options;

    // Calculate center position
    const centerX = width! / 2;
    const centerY = height! / 2;

    // Create pie generator
    const pie = d3.pie<PieDataPoint>()
      .value(d => d.value)
      .sort(null)
      .padAngle(padAngle || 0);

    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<PieDataPoint>>()
      .innerRadius(innerRadius || 0)
      .outerRadius(outerRadius || 150)
      .cornerRadius(cornerRadius || 0);

    // Create label arc (for positioning labels)
    const labelArc = d3.arc<d3.PieArcDatum<PieDataPoint>>()
      .innerRadius((outerRadius || 150) * (labelDistance || 1.2))
      .outerRadius((outerRadius || 150) * (labelDistance || 1.2));

    // Calculate total for percentages
    const total = this.data.reduce((sum, d) => sum + d.value, 0);

    // Generate pie data
    const pieData = pie(this.data);

    // Create main group centered
    const g = this.svg!
      .append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Create slices
    const slices = g
      .selectAll('.slice')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'slice');

    // Add paths (the pie slices)
    const paths = slices
      .append('path')
      .attr('fill', (d, i) => d.data.color || getColor(i, this.options.colors))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Set initial state and animate
    if (animate) {
      // Disable pointer events during animation to prevent interruption
      paths.style('pointer-events', 'none');
      
      // Track total animation duration for re-enabling interactions
      const animationDuration = 800;
      const maxDelay = pieData.length * 50;
      const totalAnimationTime = animationDuration + maxDelay;
      
      // Start with all slices at 0 angle
      paths
        .attr('d', (d) => {
          const zeroArc = {
            ...d,
            startAngle: 0,
            endAngle: 0
          };
          return arc(zeroArc) || '';
        })
        .each(function(d, i) {
          const path = d3.select(this);
          const interpolate = d3.interpolate(
            { startAngle: 0, endAngle: 0 },
            { startAngle: d.startAngle, endAngle: d.endAngle }
          );
          
          path
            .transition()
            .duration(animationDuration)
            .delay(i * 50)
            .attrTween('d', function() {
              return function(t: number) {
                const interpolated = interpolate(t);
                const arcData = {
                  ...d,
                  startAngle: interpolated.startAngle,
                  endAngle: interpolated.endAngle
                };
                return arc(arcData) || '';
              };
            });
        });
      
      // Re-enable pointer events after all animations complete
      setTimeout(() => {
        paths.style('pointer-events', 'auto');
      }, totalAnimationTime);
    } else {
      // No animation - render directly with pointer events enabled
      paths
        .attr('d', arc)
        .style('pointer-events', 'auto');
    }

    // Add labels
    if (showLabels) {
      const labels = slices
        .append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .style('pointer-events', 'none');

      labels.each(function(d) {
        const label = d3.select(this);
        const percentage = ((d.data.value / total) * 100).toFixed(1);
        
        if (showPercentages && showValues) {
          // Two lines: percentage and value
          label
            .append('tspan')
            .attr('x', 0)
            .attr('dy', '-0.2em')
            .attr('font-weight', '600')
            .text(`${percentage}%`);
          
          label
            .append('tspan')
            .attr('x', 0)
            .attr('dy', '1.2em')
            .attr('font-size', '10px')
            .text(d.data.value.toLocaleString());
        } else if (showPercentages) {
          // Just percentage
          label
            .attr('font-weight', '600')
            .text(`${percentage}%`);
        } else if (showValues) {
          // Just value
          label
            .attr('font-weight', '600')
            .text(d.data.value.toLocaleString());
        } else {
          // Just label name
          label
            .text(d.data.label);
        }
      });

      // Animation for labels - appear after pie animation
      if (animate) {
        labels
          .style('opacity', 0)
          .transition()
          .delay(800 + pieData.length * 50) // Wait for all slices to animate
          .duration(200)
          .style('opacity', 1);
      }
    }

    // Add legend
    if (this.options.showLegend) {
      const legendData = this.data.map((item, index) => ({
        label: item.label,
        color: item.color || getColor(index, this.options.colors),
      }));
      addLegend(this.svg!, legendData, width!, height!, margin!, this.options.legendPosition);
    }

    // Add hover effects and tooltips
    if (this.options.showTooltip) {
      // Delay adding hover handlers if animation is enabled
      const hoverDelay = animate ? (800 + pieData.length * 50) : 0;
      
      setTimeout(() => {
        paths
          .on('mouseover', (event, d) => {
            // Only apply hover effect if pointer events are enabled (animation complete)
            const target = d3.select(event.target as SVGPathElement);
            if (target.style('pointer-events') === 'none') return;
            
            // Highlight slice
            target
              .transition()
              .duration(200)
              .attr('transform', () => {
                const [x, y] = arc.centroid(d);
                const scale = 0.05;
                return `translate(${x * scale}, ${y * scale})`;
              })
              .attr('filter', 'brightness(1.1)');

            // Show tooltip
            const percentage = ((d.data.value / total) * 100).toFixed(1);
            
            let tooltipContent: string;
            
            if (this.options.tooltipContentCallback) {
              // Use custom tooltip callback
              const pieTooltipData: PieTooltipData = {
                label: d.data.label,
                value: d.data.value,
                percentage: parseFloat(percentage),
                color: d.data.color || getColor(d.index, this.options.colors),
              };
              tooltipContent = this.options.tooltipContentCallback(pieTooltipData);
            } else {
              // Use default tooltip content
              tooltipContent = `
                <div style="display: flex; align-items: center;">
                  <div style="width: 10px; height: 10px; background: ${d.data.color || getColor(d.index, this.options.colors)}; border-radius: 50%; margin-right: 6px;"></div>
                  <span style="color: #e5e7eb; margin-right: 4px;">${d.data.label}:</span>
                  <span style="font-weight: 600; color: white;">${d.data.value.toLocaleString()} (${percentage}%)</span>
                </div>
              `;
            }

            showCrosshairTooltip(this.crosshairTooltip!, tooltipContent, event.pageX, event.pageY);
          })
          .on('mouseout', (event) => {
            // Only reset if pointer events are enabled
            const target = d3.select(event.target as SVGPathElement);
            if (target.style('pointer-events') === 'none') return;
            
            // Reset slice
            target
              .transition()
              .duration(200)
              .attr('transform', 'translate(0, 0)')
              .attr('filter', 'none');

            // Hide tooltip
            hideTooltip(this.crosshairTooltip!);
          });
      }, hoverDelay);
    }
  }

  update(data: PieDataPoint[]): void {
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