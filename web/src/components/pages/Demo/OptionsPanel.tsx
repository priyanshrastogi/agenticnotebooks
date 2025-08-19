import { ChartOptions, ChartOptionsConfig } from '@/components/ChartOptions';

interface OptionsPanelProps {
  options: ChartOptionsConfig;
  onOptionsChange: (options: ChartOptionsConfig) => void;
  chartType: 'line' | 'area' | 'scatter' | 'pie' | 'doughnut' | 'bar' | 'histogram';
}

export default function OptionsPanel({ options, onOptionsChange, chartType }: OptionsPanelProps) {
  return (
    <div className="w-full">
      <p className="mb-4 font-semibold">Options</p>
      <ChartOptions options={options} onOptionsChange={onOptionsChange} chartType={chartType} />
    </div>
  );
}
