// Scatter chart exports
export { ScatterChart } from './ScatterChart';

import type { ChartDataset, ScatterChartOptions } from '../../core/types';
import { ScatterChart } from './ScatterChart';

/**
 * Create a new scatter chart instance
 * @param container - CSS selector or DOM element
 * @param data - Chart datasets
 * @param options - Chart configuration options
 * @returns ScatterChart instance
 */
export function createScatterChart(
  container: string,
  data: ChartDataset[],
  options: ScatterChartOptions = {}
): ScatterChart {
  return new ScatterChart(container, data, options);
}