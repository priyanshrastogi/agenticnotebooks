import { PieChartOptions,PieDataPoint } from '../../core/types';
import { PieChart } from './PieChart';

export { PieChart };

/**
 * Create a pie chart
 * @param container - CSS selector or element to render the chart in
 * @param data - Array of pie chart data points
 * @param options - Chart configuration options
 * @returns PieChart instance
 */
export function createPieChart(
  container: string,
  data: PieDataPoint[],
  options?: PieChartOptions
): PieChart {
  return new PieChart(container, data, { ...options, innerRadius: 0 });
}

/**
 * Create a doughnut chart
 * @param container - CSS selector or element to render the chart in
 * @param data - Array of pie chart data points
 * @param options - Chart configuration options
 * @returns PieChart instance configured as doughnut
 */
export function createDoughnutChart(
  container: string,
  data: PieDataPoint[],
  options?: PieChartOptions
): PieChart {
  const defaultInnerRadius = (options?.outerRadius || 150) * 0.5;
  return new PieChart(container, data, { 
    ...options, 
    innerRadius: options?.innerRadius ?? defaultInnerRadius 
  });
}