'use client';

import { Download, FileDown } from 'lucide-react';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChartExportButtonProps {
  chartId: string;
  chartTitle?: string;
}

export function ChartExportButton({ chartId, chartTitle = 'chart' }: ChartExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsPNG = async () => {
    setIsExporting(true);
    try {
      // Get the SVG element
      const svgElement = document.querySelector(`${chartId} svg`) as SVGSVGElement;
      if (!svgElement) {
        console.error('SVG element not found');
        return;
      }

      // Clone the SVG to avoid modifying the original
      const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
      
      // Get the SVG dimensions
      const width = parseInt(svgElement.getAttribute('width') || '800');
      const height = parseInt(svgElement.getAttribute('height') || '400');

      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // 2x for higher resolution
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Canvas context not available');
        return;
      }

      // Scale for higher resolution
      ctx.scale(2, 2);

      // Set white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);

      // Convert SVG to string
      const svgString = new XMLSerializer().serializeToString(svgClone);
      
      // Create a blob from the SVG string
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create an image from the SVG
      const img = new Image();
      img.onload = () => {
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${chartTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.click();
            
            // Clean up
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(svgUrl);
          }
        }, 'image/png');
      };
      
      img.onerror = (error) => {
        console.error('Error loading SVG as image:', error);
        URL.revokeObjectURL(svgUrl);
      };
      
      img.src = svgUrl;
    } catch (error) {
      console.error('Error exporting as PNG:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsSVG = () => {
    setIsExporting(true);
    try {
      // Get the SVG element
      const svgElement = document.querySelector(`${chartId} svg`) as SVGSVGElement;
      if (!svgElement) {
        console.error('SVG element not found');
        return;
      }

      // Clone the SVG to avoid modifying the original
      const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
      
      // Add xmlns attribute if not present
      if (!svgClone.getAttribute('xmlns')) {
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      // Add white background rect as first child
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', svgClone.getAttribute('width') || '800');
      bgRect.setAttribute('height', svgClone.getAttribute('height') || '400');
      bgRect.setAttribute('fill', 'white');
      svgClone.insertBefore(bgRect, svgClone.firstChild);

      // Convert SVG to string
      const svgString = new XMLSerializer().serializeToString(svgClone);
      
      // Create a blob from the SVG string
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chartTitle.toLowerCase().replace(/\s+/g, '-')}.svg`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting as SVG:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          disabled={isExporting}
          aria-label="Export chart"
        >
          <Download className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsPNG} disabled={isExporting}>
          <FileDown className="mr-2 h-4 w-4" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsSVG} disabled={isExporting}>
          <FileDown className="mr-2 h-4 w-4" />
          Export as SVG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}