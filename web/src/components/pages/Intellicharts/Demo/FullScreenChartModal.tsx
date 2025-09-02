'use client';

import { Download, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { FullscreenModal } from '@/components/blocks/FullscreenModal';
import { ChartOptionsConfig } from '@/components/ChartOptions';
import { Button } from '@/components/ui/button';
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

interface FullScreenChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: ChartDataset[] | PieDataPoint[] | number[];
  options: ChartOptionsConfig;
  chartType: 'line' | 'area' | 'bar' | 'histogram' | 'scatter' | 'pie' | 'doughnut';
  chartId: string;
}


export default function FullScreenChartModal({
  isOpen,
  onClose,
  title,
  data,
  options,
  chartType,
  chartId,
}: FullScreenChartModalProps) {
  const chartRef = useRef<{ render: () => void; destroy: () => void } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fullScreenChartId = `${chartId}-fullscreen`;

  // Render chart when modal opens
  useEffect(() => {
    if (isOpen && data.length > 0 && containerRef.current) {
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

        // Calculate available dimensions
        const containerWidth = containerRef.current?.clientWidth || 800;
        const containerHeight = containerRef.current?.clientHeight || 600;

        // Create chart options with available dimensions
        const baseChartOptions = {
          width: containerWidth,
          height: containerHeight,
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
          chartRef.current = createAreaChart(`#${fullScreenChartId}`, data as ChartDataset[], areaOptions);
        } else if (chartType === 'bar') {
          const barOptions: BarChartOptions = baseChartOptions;
          chartRef.current = createBarChart(`#${fullScreenChartId}`, data as ChartDataset[], barOptions);
        } else if (chartType === 'histogram') {
          const histogramOptions: HistogramChartOptions = {
            ...baseChartOptions,
            bins: options.bins || 20,
          };
          chartRef.current = createHistogramChart(`#${fullScreenChartId}`, data as number[], histogramOptions);
        } else if (chartType === 'scatter') {
          const scatterOptions: ScatterChartOptions = {
            ...baseChartOptions,
            showTrendLine: options.showTrendLine,
          };
          chartRef.current = createScatterChart(`#${fullScreenChartId}`, data as ChartDataset[], scatterOptions);
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
          chartRef.current = createPieChart(`#${fullScreenChartId}`, data as PieDataPoint[], pieOptions);
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
          chartRef.current = createDoughnutChart(`#${fullScreenChartId}`, data as PieDataPoint[], doughnutOptions);
        } else {
          const lineOptions: LineChartOptions = baseChartOptions;
          chartRef.current = createLineChart(`#${fullScreenChartId}`, data as ChartDataset[], lineOptions);
        }

        chartRef.current.render();
        
        // Debug: Log when chart is rendered
        console.log('Chart rendered in fullscreen modal:', {
          chartType,
          containerElement: containerRef.current,
          chartId: fullScreenChartId,
          dataLength: data.length
        });
        
        // Wait a bit more and check if SVG is present
        setTimeout(() => {
          const svgElement = containerRef.current?.querySelector('svg');
          console.log('SVG check after render:', {
            svgFound: !!svgElement,
            svgElement: svgElement,
            containerHTML: containerRef.current?.innerHTML.substring(0, 200)
          });
        }, 200);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, data, options, chartType, fullScreenChartId]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen && chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  }, [isOpen]);

  // Export functionality
  const exportChart = useCallback((format: 'png' | 'svg') => {
    console.log('Export function called with format:', format);
    
    if (!containerRef.current) {
      console.error('Container ref not found');
      alert('Chart container not found. Please wait for the chart to load.');
      return;
    }

    // Give a moment for the chart to be fully rendered
    setTimeout(() => {
      const svgElement = containerRef.current?.querySelector('svg');
      if (!svgElement) {
        console.error('SVG element not found in container');
        console.log('Container contents:', containerRef.current?.innerHTML);
        alert('Chart SVG not found. Please wait for the chart to load completely.');
        return;
      }

      console.log('Found SVG element:', svgElement);
      
      // Get SVG attributes for dimensions
      const svgWidth = svgElement.getAttribute('width') || svgElement.clientWidth || 800;
      const svgHeight = svgElement.getAttribute('height') || svgElement.clientHeight || 600;
      
      console.log('SVG dimensions:', { width: svgWidth, height: svgHeight });

      if (format === 'svg') {
        try {
          // Export as SVG
          const serializer = new XMLSerializer();
          let svgString = serializer.serializeToString(svgElement);
          
          console.log('Serialized SVG string length:', svgString.length);
          
          // Add XML declaration and ensure proper namespaces
          if (!svgString.includes('xmlns')) {
            svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
          }
          
          // Ensure SVG has proper dimensions
          if (!svgString.includes('width=')) {
            svgString = svgString.replace('<svg', `<svg width="${svgWidth}" height="${svgHeight}"`);
          }
          
          const fullSvgString = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
          
          const blob = new Blob([fullSvgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-chart.svg`;
          link.style.display = 'none';
          document.body.appendChild(link);
          
          console.log('Triggering download...');
          link.click();
          
          // Cleanup
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          console.log('SVG export completed successfully');
        } catch (error) {
          console.error('Error exporting SVG:', error);
          alert('Error exporting chart as SVG. Please try again.');
        }
      } else {
        // Export as PNG
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.error('Could not get canvas context');
            alert('Canvas not supported in this browser.');
            return;
          }

          // Set canvas size
          canvas.width = parseInt(svgWidth.toString());
          canvas.height = parseInt(svgHeight.toString());

          // Set white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Create image from SVG
          const serializer = new XMLSerializer();
          let svgString = serializer.serializeToString(svgElement);
          
          // Add namespace if missing
          if (!svgString.includes('xmlns')) {
            svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
          }
          
          // Ensure dimensions and background
          if (!svgString.includes('width=')) {
            svgString = svgString.replace('<svg', `<svg width="${svgWidth}" height="${svgHeight}"`);
          }
          
          const img = new Image();
          
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-chart.png`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                console.log('PNG export completed successfully');
              }
            }, 'image/png');
          };
          
          img.onerror = (error) => {
            console.error('Error loading SVG into image:', error);
            alert('Error converting chart to PNG. Please try SVG export instead.');
          };

          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);
          img.src = svgUrl;
          
          // Clean up blob URL after some time
          setTimeout(() => {
            URL.revokeObjectURL(svgUrl);
          }, 5000);
        } catch (error) {
          console.error('Error exporting PNG:', error);
          alert('Error exporting chart as PNG. Please try again.');
        }
      }
    }, 100); // Small delay to ensure chart is fully rendered
  }, [title]);



  return (
    <FullscreenModal
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex flex-col h-full">
        {/* Header with title and controls */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          <div className="flex items-center gap-2">
            {/* Export buttons */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                console.log('SVG export button clicked', e);
                e.preventDefault();
                e.stopPropagation();
                exportChart('svg');
              }}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              Export SVG
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                console.log('PNG export button clicked', e);
                e.preventDefault();
                e.stopPropagation();
                exportChart('png');
              }}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              Export PNG
            </Button>
            
            {/* Close button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chart container */}
        <div className="flex-1 p-8">
          <div
            id={fullScreenChartId}
            ref={containerRef}
            className="w-full h-full bg-white"
          />
        </div>
      </div>
    </FullscreenModal>
  );
}