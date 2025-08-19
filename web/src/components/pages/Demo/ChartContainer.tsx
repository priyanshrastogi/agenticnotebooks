'use client';

import { useEffect, useRef } from 'react';

import { ChartOptionsConfig } from '@/components/ChartOptions';
import { createLineChart } from '@/lib/charts';
import { ChartDataset, LineChartOptions } from '@/lib/charts/core/types';

interface ChartContainerProps {
  data: ChartDataset[];
  chartId: string;
  options: ChartOptionsConfig;
}

export default function ChartContainer({ data, chartId, options }: ChartContainerProps) {
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
        const chartOptions: LineChartOptions = {
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
          tooltipSize: options.tooltipSize,
        };

        // Create and render chart
        chartRef.current = createLineChart(`#${chartId}`, data, chartOptions);
        chartRef.current.render();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [data, options, chartId]);

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
