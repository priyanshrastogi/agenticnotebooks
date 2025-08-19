import { Settings } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

import ChartOptions, { type ChartOptionsConfig } from './ChartOptions';

interface ChartOptionsPopoverProps {
  options: ChartOptionsConfig;
  onOptionsChange: (options: ChartOptionsConfig) => void;
  chartType: 'line' | 'area' | 'scatter' | 'pie' | 'doughnut' | 'bar' | 'histogram';
}

export const ChartOptionsPopover: React.FC<ChartOptionsPopoverProps> = ({
  options,
  onOptionsChange,
  chartType,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        title="Chart Options"
        className="h-8 w-8"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Popover */}
          <div className="absolute right-0 top-10 z-50 w-64 rounded-lg border bg-white shadow-xl">
            <div className="p-2">
              <ChartOptions
                options={options}
                onOptionsChange={onOptionsChange}
                chartType={chartType}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChartOptionsPopover;
