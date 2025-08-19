import { ChartOptions, ChartOptionsConfig } from '@/components/ChartOptions';

interface OptionsPanelProps {
  options: ChartOptionsConfig;
  onOptionsChange: (options: ChartOptionsConfig) => void;
  chartType: 'line' | 'area' | 'scatter' | 'pie' | 'doughnut' | 'bar' | 'histogram';
}

export default function OptionsPanel({ options, onOptionsChange, chartType }: OptionsPanelProps) {
  return (
    <div className="w-full lg:w-80 lg:flex-shrink-0">
      <div className="border rounded-lg bg-gray-50">
        <ChartOptions
          options={options}
          onOptionsChange={onOptionsChange}
          chartType={chartType}
        />
      </div>
    </div>
  );
}