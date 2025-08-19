import React from 'react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export interface ChartOptionsConfig {
  showXGrid: boolean;
  showYGrid: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  showTooltip: boolean;
  showLegend: boolean;
  legendPosition: 'bottom' | 'top' | 'left' | 'right';
  showPoints?: boolean;
  animate: boolean;
  curve: 'linear' | 'smooth';
  yAxisStartsFromZero: boolean;
  showStackedTotal?: boolean;
  showTrendLine?: boolean;
  solidFill?: boolean;
  tooltipSize?: 'sm' | 'md';
  // Pie chart specific options
  innerRadius?: number;
  showLabels?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  // Bar chart specific options
  stacked?: boolean;
  horizontal?: boolean;
  showBarValues?: boolean;
  // Histogram chart specific options
  bins?: number;
  binRange?: 'auto' | [number, number];
  showDensity?: boolean;
}

interface ChartOptionsProps {
  options: ChartOptionsConfig;
  onOptionsChange: (options: ChartOptionsConfig) => void;
  chartType: 'line' | 'area' | 'scatter' | 'pie' | 'doughnut' | 'bar' | 'histogram';
}

export const ChartOptions: React.FC<ChartOptionsProps> = ({
  options,
  onOptionsChange,
  chartType,
}) => {
  const handleChange = (key: keyof ChartOptionsConfig, value: boolean | string | number) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  const OptionSwitch = ({
    checked,
    onChange,
    label,
    id,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    id: string;
  }) => (
    <div className="flex items-center space-x-3 py-1">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal text-gray-700">
        {label}
      </Label>
    </div>
  );

  const OptionSelect = ({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    className = '',
  }: {
    value: string | number;
    onChange: (value: string | number) => void;
    options: { value: string | number; label: string }[];
    placeholder?: string;
    className?: string;
  }) => (
    <div className={`col-span-2 ${className}`}>
      <Select value={String(value)} onValueChange={(val) => onChange(val)}>
        <SelectTrigger className="h-8 w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(({ value, label }) => (
            <SelectItem key={value} value={String(value)}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Grid Controls */}
        {(chartType === 'line' || chartType === 'area' || chartType === 'scatter') && (
          <>
            <OptionSwitch
              id="x-grid"
              checked={options.showXGrid}
              onChange={(checked) => handleChange('showXGrid', checked)}
              label="X Grid"
            />
            <OptionSwitch
              id="y-grid"
              checked={options.showYGrid}
              onChange={(checked) => handleChange('showYGrid', checked)}
              label="Y Grid"
            />
          </>
        )}

        {chartType === 'bar' && (
          <OptionSwitch
            id="value-grid"
            checked={options.horizontal ? options.showXGrid : options.showYGrid}
            onChange={(checked) =>
              handleChange(options.horizontal ? 'showXGrid' : 'showYGrid', checked)
            }
            label="Value Grid"
          />
        )}

        {chartType === 'histogram' && (
          <OptionSwitch
            id="histogram-y-grid"
            checked={options.showYGrid}
            onChange={(checked) => handleChange('showYGrid', checked)}
            label="Y Grid"
          />
        )}

        {/* Axis Controls */}
        {(chartType === 'line' ||
          chartType === 'area' ||
          chartType === 'scatter' ||
          chartType === 'bar' ||
          chartType === 'histogram') && (
          <>
            <OptionSwitch
              id="x-axis"
              checked={options.showXAxis}
              onChange={(checked) => handleChange('showXAxis', checked)}
              label="X Axis"
            />
            <OptionSwitch
              id="y-axis"
              checked={options.showYAxis}
              onChange={(checked) => handleChange('showYAxis', checked)}
              label="Y Axis"
            />
          </>
        )}

        {/* Common Controls */}
        <OptionSwitch
          id="tooltips"
          checked={options.showTooltip}
          onChange={(checked) => handleChange('showTooltip', checked)}
          label="Tooltips"
        />

        <OptionSwitch
          id="legend"
          checked={options.showLegend}
          onChange={(checked) => handleChange('showLegend', checked)}
          label="Legend"
        />

        <OptionSwitch
          id="animate"
          checked={options.animate}
          onChange={(checked) => handleChange('animate', checked)}
          label="Animate"
        />

        {(chartType === 'line' ||
          chartType === 'area' ||
          chartType === 'scatter' ||
          chartType === 'bar' ||
          chartType === 'histogram') && (
          <OptionSwitch
            id="zero-base"
            checked={options.yAxisStartsFromZero}
            onChange={(checked) => handleChange('yAxisStartsFromZero', checked)}
            label="Zero Base"
          />
        )}

        {/* Line/Area Specific */}
        {(chartType === 'line' || chartType === 'area') && (
          <OptionSwitch
            id="points"
            checked={options.showPoints || false}
            onChange={(checked) => handleChange('showPoints', checked)}
            label="Points"
          />
        )}

        {/* Pie/Doughnut Specific */}
        {(chartType === 'pie' || chartType === 'doughnut') && (
          <>
            <OptionSwitch
              id="pie-labels"
              checked={options.showLabels || false}
              onChange={(checked) => handleChange('showLabels', checked)}
              label="Labels"
            />
            <OptionSwitch
              id="pie-values"
              checked={options.showValues || false}
              onChange={(checked) => handleChange('showValues', checked)}
              label="Values"
            />
            <OptionSwitch
              id="pie-percentages"
              checked={options.showPercentages || false}
              onChange={(checked) => handleChange('showPercentages', checked)}
              label="Percentages"
            />
          </>
        )}

        {/* Area Specific */}
        {chartType === 'area' && (
          <>
            <OptionSwitch
              id="stack-total"
              checked={options.showStackedTotal || false}
              onChange={(checked) => handleChange('showStackedTotal', checked)}
              label="Stack Total"
            />
            <OptionSwitch
              id="solid-fill"
              checked={options.solidFill || false}
              onChange={(checked) => handleChange('solidFill', checked)}
              label="Solid Fill"
            />
          </>
        )}

        {/* Scatter Specific */}
        {chartType === 'scatter' && (
          <OptionSwitch
            id="trend-line"
            checked={options.showTrendLine || false}
            onChange={(checked) => handleChange('showTrendLine', checked)}
            label="Trend Line"
          />
        )}

        {/* Bar Specific */}
        {chartType === 'bar' && (
          <>
            <OptionSwitch
              id="stacked"
              checked={options.stacked || false}
              onChange={(checked) => handleChange('stacked', checked)}
              label="Stacked"
            />
            <OptionSwitch
              id="horizontal"
              checked={options.horizontal || false}
              onChange={(checked) => handleChange('horizontal', checked)}
              label="Horizontal"
            />
            <OptionSwitch
              id="bar-values"
              checked={options.showBarValues || false}
              onChange={(checked) => handleChange('showBarValues', checked)}
              label="Show Values"
            />
          </>
        )}

        {/* Histogram Specific */}
        {chartType === 'histogram' && (
          <OptionSwitch
            id="density"
            checked={options.showDensity || false}
            onChange={(checked) => handleChange('showDensity', checked)}
            label="Show Density"
          />
        )}

        {/* Select Controls */}
        {chartType === 'histogram' && (
          <OptionSelect
            value={options.bins || 10}
            onChange={(value) => handleChange('bins', parseInt(value as string))}
            options={[
              { value: 5, label: 'Bins: 5' },
              { value: 10, label: 'Bins: 10' },
              { value: 15, label: 'Bins: 15' },
              { value: 20, label: 'Bins: 20' },
              { value: 25, label: 'Bins: 25' },
              { value: 30, label: 'Bins: 30' },
            ]}
          />
        )}

        {(chartType === 'line' || chartType === 'area') && (
          <OptionSelect
            value={options.curve}
            onChange={(value) => handleChange('curve', value)}
            options={[
              { value: 'linear', label: 'Curve: Linear' },
              { value: 'smooth', label: 'Curve: Smooth' },
            ]}
          />
        )}

        {options.showLegend && (
          <OptionSelect
            value={options.legendPosition}
            onChange={(value) => handleChange('legendPosition', value)}
            options={[
              { value: 'bottom', label: 'Legend: Bottom' },
              { value: 'top', label: 'Legend: Top' },
              { value: 'left', label: 'Legend: Left' },
              { value: 'right', label: 'Legend: Right' },
            ]}
          />
        )}

        {options.showTooltip && (
          <OptionSelect
            value={options.tooltipSize || 'sm'}
            onChange={(value) => handleChange('tooltipSize', value)}
            options={[
              { value: 'sm', label: 'Tooltip: Small' },
              { value: 'md', label: 'Tooltip: Medium' },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default ChartOptions;
