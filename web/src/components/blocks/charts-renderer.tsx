/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { Chart, registerables } from 'chart.js';
import html2canvas from 'html2canvas-pro';
import { Download, Maximize2, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef, useState } from 'react';

import { Modal } from '@/components/blocks/modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Register all Chart.js components
Chart.register(...registerables);

interface ChartConfig {
  type: string;
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  options: {
    [key: string]: any;
  };
  title: string;
}

interface DataVisualizationProps {
  chartConfig: ChartConfig;
  className?: string;
}

export default function DataVisualization({ chartConfig, className }: DataVisualizationProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const fullScreenChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const fullScreenChartInstance = useRef<Chart | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const fullScreenContainerRef = useRef<HTMLDivElement>(null);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [chartTheme, setChartTheme] = useState<'light' | 'dark' | 'inherit'>('light');

  // Determine the actual theme to use
  const effectiveChartTheme =
    chartTheme === 'inherit' ? (resolvedTheme as 'light' | 'dark') : chartTheme;

  // Toggle the chart theme between light and dark
  const toggleChartTheme = () => {
    if (chartTheme === 'dark' || (chartTheme === 'inherit' && resolvedTheme === 'dark')) {
      setChartTheme('light');
    } else {
      setChartTheme('dark');
    }
  };

  // Initialize or update the main chart
  useEffect(() => {
    if (!chartRef.current || !chartConfig) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: chartConfig.type as any,
        data: chartConfig.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...chartConfig.options,
        },
      });
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartConfig]);

  // Initialize or update the full screen chart when modal opens
  useEffect(() => {
    if (!isFullScreenOpen || !fullScreenChartRef.current || !chartConfig) return;

    // Destroy existing full screen chart if it exists
    if (fullScreenChartInstance.current) {
      fullScreenChartInstance.current.destroy();
    }

    // Create new full screen chart
    const ctx = fullScreenChartRef.current.getContext('2d');
    if (ctx) {
      fullScreenChartInstance.current = new Chart(ctx, {
        type: chartConfig.type as any,
        data: chartConfig.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...chartConfig.options,
        },
      });
    }

    // Cleanup when modal closes
    return () => {
      if (fullScreenChartInstance.current) {
        fullScreenChartInstance.current.destroy();
        fullScreenChartInstance.current = null;
      }
    };
  }, [chartConfig, isFullScreenOpen]);

  const handleFullScreen = () => {
    setIsFullScreenOpen(true);
    // Keep current chart theme when opening fullscreen
  };

  const handleDownload = async (container: HTMLDivElement | null, fileName?: string) => {
    if (!container) return;

    try {
      const isDarkTheme = effectiveChartTheme === 'dark';
      // Use simple black/white colors to match the chart display
      const bgColor = isDarkTheme ? 'black' : 'white';

      const canvas = await html2canvas(container, {
        backgroundColor: bgColor,
        useCORS: true,
        scale: 2, // Higher resolution
        width: container.offsetWidth + 40, // Add extra width to account for padding
        height: container.offsetHeight + 40, // Add extra height to account for padding
        onclone: (clonedDoc) => {
          // Ensure cloned element has correct background color
          const clonedContainer = clonedDoc.querySelector(`#${container.id}`) as HTMLElement | null;
          if (clonedContainer) {
            clonedContainer.style.backgroundColor = bgColor;
            clonedContainer.style.color = isDarkTheme ? 'white' : 'black';
            clonedContainer.style.padding = '20px';
            clonedContainer.style.paddingRight = '20px'; // Explicitly set right padding
            clonedContainer.style.borderRadius = '8px';
            clonedContainer.style.width = `${container.offsetWidth}px`;
            clonedContainer.style.boxSizing = 'content-box'; // Ensure padding is added to dimensions
          }
        },
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = fileName || `${chartConfig.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  };

  const downloadFullScreenChart = () => {
    handleDownload(
      fullScreenContainerRef.current,
      `${chartConfig.title.replace(/\s+/g, '-').toLowerCase()}-fullscreen.png`
    );
  };

  if (!chartConfig) return null;

  return (
    <>
      <div className={cn('flex flex-col rounded-md p-2', className)}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm">{chartConfig.title}</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleFullScreen} title="View full screen">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(chartContainerRef.current)}
              title="Download chart"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div
          ref={chartContainerRef}
          className={cn(
            'relative h-64 w-full rounded-md p-2',
            effectiveChartTheme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
          )}
          id="chart-container"
        >
          <canvas ref={chartRef} />
        </div>
      </div>

      <Modal
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
        title={chartConfig.title}
        dialogContentClassName="sm:max-w-4xl"
      >
        <div className="rounded-lg bg-white p-6 dark:bg-black">
          <div className="mb-6 flex items-center">
            <div className="flex-1 text-center">
              <h2 className={cn('font-semibold')}>{chartConfig.title}</h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChartTheme}
                title={
                  effectiveChartTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
                }
              >
                {effectiveChartTheme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={downloadFullScreenChart}
                title="Download chart"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div
            ref={fullScreenContainerRef}
            className={cn(
              'relative h-[70vh] w-full rounded-md p-4',
              effectiveChartTheme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
            )}
            id="fullscreen-chart-container"
          >
            <canvas ref={fullScreenChartRef} />
          </div>
        </div>
      </Modal>
    </>
  );
}
