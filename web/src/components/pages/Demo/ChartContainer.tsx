'use client';

import { useEffect, useRef } from 'react';

import { ChartOptionsConfig } from '@/components/ChartOptions';
import { createAreaChart, createLineChart, createScatterChart } from '@/lib/charts';
import { AreaChartOptions, ChartDataset, LineChartOptions, ScatterChartOptions } from '@/lib/charts/core/types';

interface ChartContainerProps {
  data: ChartDataset[];
  chartId: string;
  options: ChartOptionsConfig;
  chartType?: 'line' | 'area' | 'scatter';
}

export default function ChartContainer({ data, chartId, options, chartType = 'line' }: ChartContainerProps) {
  const chartRef = useRef<{ render: () => void; destroy: () => void } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.length > 0 && containerRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // Destroy previous chart if exists
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }

        // Clear container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Get container dimensions for responsive sizing
        const containerWidth = containerRef.current?.clientWidth || 800;
        const isMobile = containerWidth < 640;

        // Create chart options
        const baseChartOptions = {
          width: Math.max(320, containerWidth - 32), // Responsive width with min 320px
          height: isMobile ? 280 : 400, // Shorter on mobile
          showXGrid: options.showXGrid,
          showYGrid: options.showYGrid,
          showXAxis: options.showXAxis,
          showYAxis: options.showYAxis,
          showTooltip: options.showTooltip,
          showLegend: options.showLegend,
          legendPosition: options.legendPosition,
          showPoints: options.showPoints,
          animate: options.animate,
          curve: options.curve,
          yAxisStartsFromZero: options.yAxisStartsFromZero,
          xAxisLabel: options.xAxisLabel,
          yAxisLabel: options.yAxisLabel,
          tooltipSize: options.tooltipSize,
        };

        // Create and render chart based on type
        if (chartType === 'area') {
          const areaOptions: AreaChartOptions = {
            ...baseChartOptions,
            showStackedTotal: options.showStackedTotal,
            solidFill: options.solidFill,
          };
          chartRef.current = createAreaChart(`#${chartId}`, data, areaOptions);
        } else if (chartType === 'scatter') {
          const scatterOptions: ScatterChartOptions = {
            ...baseChartOptions,
            showTrendLine: options.showTrendLine,
          };
          chartRef.current = createScatterChart(`#${chartId}`, data, scatterOptions);
        } else {
          const lineOptions: LineChartOptions = baseChartOptions;
          chartRef.current = createLineChart(`#${chartId}`, data, lineOptions);
        }
        
        chartRef.current.render();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [data, options, chartId, chartType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div id={chartId} ref={containerRef} className="w-full" />
    </div>
  );
}
