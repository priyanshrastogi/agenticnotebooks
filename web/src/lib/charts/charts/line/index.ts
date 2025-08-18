// Line chart exports
export { LineChart } from './LineChart';

import type { ChartDataset, LineChartOptions } from '../../core/types';
import { LineChart } from './LineChart';

/**
 * Create a new line chart instance
 * @param container - CSS selector or DOM element
 * @param data - Chart datasets
 * @param options - Chart configuration options
 * @returns LineChart instance
 */
export function createLineChart(
  container: string,
  data: ChartDataset[],
  options: LineChartOptions = {}
): LineChart {
  return new LineChart(container, data, options);
}
