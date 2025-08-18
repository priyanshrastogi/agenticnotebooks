// Bar chart exports
export { BarChart } from './BarChart';

import type { BarChartOptions, ChartDataset } from '../../core/types';
import { BarChart } from './BarChart';

/**
 * Create a new bar chart instance
 * @param container - CSS selector or DOM element
 * @param data - Chart datasets
 * @param options - Chart configuration options
 * @returns BarChart instance
 */
export function createBarChart(
  container: string,
  data: ChartDataset[],
  options: BarChartOptions = {}
): BarChart {
  return new BarChart(container, data, options);
}