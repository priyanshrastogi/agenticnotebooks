'use client';

import { useEffect, useRef } from 'react';

import { ChartOptionsConfig } from '@/components/ChartOptions';
import {
  createAreaChart,
  createBarChart,
  createDoughnutChart,
  createHistogramChart,
  createLineChart,
  createPieChart,
  createScatterChart,
} from '@/lib/charts';
import {
  AreaChartOptions,
  BarChartOptions,
  ChartDataset,
  HistogramChartOptions,
  LineChartOptions,
  PieChartOptions,
  PieDataPoint,
  ScatterChartOptions,
} from '@/lib/charts/core/types';

interface ChartContainerProps {
  data: ChartDataset[] | PieDataPoint[] | number[];
  chartId: string;
  options: ChartOptionsConfig;
  chartType?: 'line' | 'area' | 'bar' | 'histogram' | 'scatter' | 'pie' | 'doughnut';
}

export default function ChartContainer({
  data,
  chartId,
  options,
  chartType = 'line',
}: ChartContainerProps) {
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
          chartRef.current = createAreaChart(`#${chartId}`, data as ChartDataset[], areaOptions);
        } else if (chartType === 'bar') {
          const barOptions: BarChartOptions = baseChartOptions;
          chartRef.current = createBarChart(`#${chartId}`, data as ChartDataset[], barOptions);
        } else if (chartType === 'histogram') {
          const histogramOptions: HistogramChartOptions = {
            ...baseChartOptions,
            bins: options.bins || 20,
          };
          chartRef.current = createHistogramChart(`#${chartId}`, data as number[], histogramOptions);
        } else if (chartType === 'scatter') {
          const scatterOptions: ScatterChartOptions = {
            ...baseChartOptions,
            showTrendLine: options.showTrendLine,
          };
          chartRef.current = createScatterChart(
            `#${chartId}`,
            data as ChartDataset[],
            scatterOptions
          );
        } else if (chartType === 'pie') {
          const pieOptions: PieChartOptions = {
            width: baseChartOptions.width,
            height: baseChartOptions.height,
            showTooltip: baseChartOptions.showTooltip,
            showLegend: baseChartOptions.showLegend,
            legendPosition: baseChartOptions.legendPosition,
            animate: baseChartOptions.animate,
            tooltipSize: baseChartOptions.tooltipSize,
            showLabels: options.showLabels !== false,
            showPercentages: options.showPercentages !== false,
            showValues: options.showValues === true,
          };
          chartRef.current = createPieChart(`#${chartId}`, data as PieDataPoint[], pieOptions);
        } else if (chartType === 'doughnut') {
          const doughnutOptions: PieChartOptions = {
            width: baseChartOptions.width,
            height: baseChartOptions.height,
            showTooltip: baseChartOptions.showTooltip,
            showLegend: baseChartOptions.showLegend,
            legendPosition: baseChartOptions.legendPosition,
            animate: baseChartOptions.animate,
            tooltipSize: baseChartOptions.tooltipSize,
            showLabels: options.showLabels !== false,
            showPercentages: options.showPercentages !== false,
            showValues: options.showValues === true,
          };
          chartRef.current = createDoughnutChart(
            `#${chartId}`,
            data as PieDataPoint[],
            doughnutOptions
          );
        } else {
          const lineOptions: LineChartOptions = baseChartOptions;
          chartRef.current = createLineChart(`#${chartId}`, data as ChartDataset[], lineOptions);
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
    <div className="max-h-[280px] w-full sm:max-h-[400px]">
      <div id={chartId} ref={containerRef} className="w-full" />
    </div>
  );
}
