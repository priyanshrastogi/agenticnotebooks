// Area chart exports
export { AreaChart } from './AreaChart';

import type { AreaChartOptions, ChartDataset } from '../../core/types';
import { AreaChart } from './AreaChart';

/**
 * Create a new area chart instance
 * @param container - CSS selector or DOM element
 * @param data - Chart datasets
 * @param options - Chart configuration options
 * @returns AreaChart instance
 */
export function createAreaChart(
  container: string,
  data: ChartDataset[],
  options: AreaChartOptions = {}
): AreaChart {
  return new AreaChart(container, data, options);
}
