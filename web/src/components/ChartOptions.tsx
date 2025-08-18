import React from 'react';

export interface ChartOptionsConfig {
  showGrid: boolean;
  showAxis: boolean;
  showTooltip: boolean;
  showLegend: boolean;
  legendPosition: 'bottom' | 'top' | 'left' | 'right';
  showPoints?: boolean;
  animate: boolean;
  curve: 'linear' | 'smooth';
  yAxisStartsFromZero: boolean;
  showStackedTotal?: boolean;
  showTrendLine?: boolean;
  tooltipSize?: 'sm' | 'md';
  // Pie chart specific options
  innerRadius?: number;
  showLabels?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
}

interface ChartOptionsProps {
  options: ChartOptionsConfig;
  onOptionsChange: (options: ChartOptionsConfig) => void;
  chartType: 'line' | 'area' | 'scatter' | 'pie' | 'doughnut';
}

export const ChartOptions: React.FC<ChartOptionsProps> = ({
  options,
  onOptionsChange,
  chartType
}) => {
  const handleChange = (key: keyof ChartOptionsConfig, value: boolean | string) => {
    onOptionsChange({
      ...options,
      [key]: value
    });
  };

  return (
    <div className="chart-options">
      <h3 className="options-title">Options</h3>
      
      <div className="options-grid">
        {(chartType === 'line' || chartType === 'area' || chartType === 'scatter') && (
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.showGrid}
              onChange={(e) => handleChange('showGrid', e.target.checked)}
            />
            <span>Grid</span>
          </label>
        )}
        
        {(chartType === 'line' || chartType === 'area' || chartType === 'scatter') && (
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.showAxis}
              onChange={(e) => handleChange('showAxis', e.target.checked)}
            />
            <span>Axes</span>
          </label>
        )}
        
        <label className="option-item">
          <input
            type="checkbox"
            checked={options.showTooltip}
            onChange={(e) => handleChange('showTooltip', e.target.checked)}
          />
          <span>Tooltips</span>
        </label>
        
        <label className="option-item">
          <input
            type="checkbox"
            checked={options.showLegend}
            onChange={(e) => handleChange('showLegend', e.target.checked)}
          />
          <span>Legend</span>
        </label>

        {(chartType === 'line' || chartType === 'area') && (
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.showPoints || false}
              onChange={(e) => handleChange('showPoints', e.target.checked)}
            />
            <span>Points</span>
          </label>
        )}

        {(chartType === 'pie' || chartType === 'doughnut') && (
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.showLabels || false}
              onChange={(e) => handleChange('showLabels', e.target.checked)}
            />
            <span>Labels</span>
          </label>
        )}

        {(chartType === 'pie' || chartType === 'doughnut') && (
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.showValues || false}
              onChange={(e) => handleChange('showValues', e.target.checked)}
            />
            <span>Values</span>
          </label>
        )}

        {(chartType === 'pie' || chartType === 'doughnut') && (
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.showPercentages || false}
              onChange={(e) => handleChange('showPercentages', e.target.checked)}
            />
            <span>Percentages</span>
          </label>
        )}
        
        <label className="option-item">
          <input
            type="checkbox"
            checked={options.animate}
            onChange={(e) => handleChange('animate', e.target.checked)}
          />
          <span>Animate</span>
        </label>
        
        {(chartType === 'line' || chartType === 'area' || chartType === 'scatter') && (
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.yAxisStartsFromZero}
              onChange={(e) => handleChange('yAxisStartsFromZero', e.target.checked)}
            />
            <span>Zero Base</span>
          </label>
        )}

        {chartType === 'area' && (
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.showStackedTotal || false}
              onChange={(e) => handleChange('showStackedTotal', e.target.checked)}
            />
            <span>Stack Total</span>
          </label>
        )}

        {chartType === 'scatter' && (
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.showTrendLine || false}
              onChange={(e) => handleChange('showTrendLine', e.target.checked)}
            />
            <span>Trend Line</span>
          </label>
        )}
        
        {(chartType === 'line' || chartType === 'area') && (
          <div className="option-item select-item">
            <select
              value={options.curve}
              onChange={(e) => handleChange('curve', e.target.value)}
              className="curve-select"
            >
              <option value="linear">Linear</option>
              <option value="smooth">Smooth</option>
            </select>
          </div>
        )}
        
        {options.showLegend && (
          <div className="option-item select-item">
            <select
              value={options.legendPosition}
              onChange={(e) => handleChange('legendPosition', e.target.value)}
              className="curve-select"
            >
              <option value="bottom">Legend: Bottom</option>
              <option value="top">Legend: Top</option>
              <option value="left">Legend: Left</option>
              <option value="right">Legend: Right</option>
            </select>
          </div>
        )}
        
        {options.showTooltip && (
          <div className="option-item select-item">
            <select
              value={options.tooltipSize || 'sm'}
              onChange={(e) => handleChange('tooltipSize', e.target.value)}
              className="curve-select"
            >
              <option value="sm">Tooltip: Small</option>
              <option value="md">Tooltip: Medium</option>
            </select>
          </div>
        )}
      </div>

      <style jsx>{`
        .chart-options {
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 12px;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .options-title {
          margin: 0 0 12px 0;
          color: #343a40;
          font-size: 14px;
          font-weight: 600;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 12px;
          color: #495057;
          padding: 4px 6px;
          border-radius: 4px;
          transition: background-color 0.1s;
        }

        .option-item:hover {
          background: rgba(0, 123, 255, 0.05);
        }

        .option-item input[type="checkbox"] {
          width: 14px;
          height: 14px;
          accent-color: #007bff;
          cursor: pointer;
        }

        .option-item span {
          user-select: none;
          white-space: nowrap;
        }

        .select-item {
          grid-column: 1 / -1;
        }

        .curve-select {
          padding: 4px 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          background: white;
          font-size: 12px;
          color: #495057;
          cursor: pointer;
          width: 100%;
        }

        .curve-select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
      `}</style>
    </div>
  );
};

export default ChartOptions;