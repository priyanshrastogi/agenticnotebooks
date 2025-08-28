import { PieDataPoint } from '@/lib/charts/core/types';

/**
 * Generate market share data for major tech companies
 */
export function generateTechMarketShareData(): PieDataPoint[] {
  return [
    { label: 'Apple', value: 28.5 },
    { label: 'Microsoft', value: 24.2 },
    { label: 'Amazon', value: 18.3 },
    { label: 'Google', value: 15.7 },
    { label: 'Meta', value: 8.1 },
    { label: 'Others', value: 5.2 },
  ];
}

/**
 * Generate global energy consumption by source
 */
export function generateEnergySourcesData(): PieDataPoint[] {
  return [
    { label: 'Coal', value: 27.2 },
    { label: 'Oil', value: 31.5 },
    { label: 'Natural Gas', value: 24.7 },
    { label: 'Nuclear', value: 10.1 },
    { label: 'Hydroelectric', value: 4.1 },
    { label: 'Solar', value: 1.8 },
    { label: 'Wind', value: 0.6 },
  ];
}

/**
 * Generate budget allocation for a growing startup
 */
export function generateStartupBudgetData(): PieDataPoint[] {
  return [
    { label: 'Engineering', value: 45.2 },
    { label: 'Marketing', value: 23.8 },
    { label: 'Sales', value: 15.4 },
    { label: 'Operations', value: 8.1 },
    { label: 'R&D', value: 4.7 },
    { label: 'Admin', value: 2.8 },
  ];
}

/**
 * Generate social media platform usage statistics
 */
export function generateSocialMediaUsageData(): PieDataPoint[] {
  return [
    { label: 'Instagram', value: 32.4 },
    { label: 'TikTok', value: 28.9 },
    { label: 'Facebook', value: 18.7 },
    { label: 'Twitter/X', value: 9.2 },
    { label: 'LinkedIn', value: 6.1 },
    { label: 'YouTube', value: 3.4 },
    { label: 'Others', value: 1.3 },
  ];
}

/**
 * Generate e-commerce sales by product category
 */
export function generateEcommerceSalesData(): PieDataPoint[] {
  return [
    { label: 'Electronics', value: 35.6 },
    { label: 'Clothing', value: 22.8 },
    { label: 'Home & Garden', value: 16.3 },
    { label: 'Books & Media', value: 9.7 },
    { label: 'Sports & Outdoors', value: 8.2 },
    { label: 'Beauty', value: 4.9 },
    { label: 'Others', value: 2.5 },
  ];
}

/**
 * Generate website traffic sources for analytics dashboard
 */
export function generateTrafficSourcesData(): PieDataPoint[] {
  return [
    { label: 'Organic Search', value: 42.3 },
    { label: 'Direct', value: 28.7 },
    { label: 'Social Media', value: 12.4 },
    { label: 'Paid Ads', value: 8.9 },
    { label: 'Email', value: 5.2 },
    { label: 'Referral', value: 2.5 },
  ];
}