import { ChartDataPoint, ChartDataset } from '@/lib/charts/core/types';

/**
 * Generate quarterly revenue comparison across different business units
 */
export function generateQuarterlyRevenueData(): ChartDataset[] {
  const quarters = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];
  const businessUnits = ['Sales', 'Marketing', 'Product', 'Services'];
  const datasets: ChartDataset[] = [];

  businessUnits.forEach((unit, unitIndex) => {
    const data: ChartDataPoint[] = [];
    const baseRevenues = [280000, 150000, 320000, 180000]; // Different base revenues per unit
    const growthRates = [0.08, 0.12, 0.06, 0.10]; // Different growth rates

    quarters.forEach((quarter, qIndex) => {
      const baseRevenue = baseRevenues[unitIndex];
      const growthRate = growthRates[unitIndex];
      const seasonalMultipliers = [0.9, 1.1, 1.0, 1.3]; // Q4 typically strongest
      
      const revenue = baseRevenue * (1 + (qIndex * growthRate / 4)) * seasonalMultipliers[qIndex] * (0.9 + Math.random() * 0.2);

      data.push({
        x: quarter,
        y: Math.round(revenue)
      });
    });

    datasets.push({
      label: unit,
      data: data
    });
  });

  return datasets;
}

/**
 * Generate website traffic by source comparison
 */
export function generateBarTrafficSourcesData(): ChartDataset[] {
  const sources = ['Organic Search', 'Direct', 'Social Media', 'Paid Ads', 'Email', 'Referral'];
  const data: ChartDataPoint[] = [];
  
  const trafficValues = [125000, 89000, 45000, 32000, 28000, 15000]; // Realistic traffic distribution
  
  sources.forEach((source, index) => {
    const baseTraffic = trafficValues[index];
    const variation = 0.85 + Math.random() * 0.3; // ±15% variation
    const traffic = Math.round(baseTraffic * variation);

    data.push({
      x: source,
      y: traffic
    });
  });

  return [{
    label: 'Monthly Visitors',
    data: data
  }];
}

/**
 * Generate product category sales performance
 */
export function generateProductCategorySalesData(): ChartDataset[] {
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Beauty', 'Toys'];
  const data: ChartDataPoint[] = [];
  
  const salesValues = [450000, 320000, 280000, 180000, 220000, 190000, 150000];
  
  categories.forEach((category, index) => {
    const baseSales = salesValues[index];
    const seasonalMultiplier = category === 'Toys' ? 1.4 : (category === 'Clothing' ? 1.2 : 1.0); // Holiday boost
    const variation = 0.8 + Math.random() * 0.4; // ±20% variation
    const sales = Math.round(baseSales * seasonalMultiplier * variation);

    data.push({
      x: category,
      y: sales
    });
  });

  return [{
    label: 'Sales ($)',
    data: data
  }];
}

/**
 * Generate employee satisfaction scores by department
 */
export function generateEmployeeSatisfactionData(): ChartDataset[] {
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Support'];
  const data: ChartDataPoint[] = [];
  
  const baseSatisfactionScores = [4.2, 3.8, 4.0, 4.1, 3.9, 3.7, 4.3]; // Out of 5
  
  departments.forEach((department, index) => {
    const baseScore = baseSatisfactionScores[index];
    const variation = 0.9 + Math.random() * 0.2; // ±10% variation
    const score = Math.round((baseScore * variation) * 10) / 10; // Round to 1 decimal

    data.push({
      x: department,
      y: Math.max(1, Math.min(5, score)) // Keep within 1-5 range
    });
  });

  return [{
    label: 'Satisfaction Score (1-5)',
    data: data
  }];
}

/**
 * Generate monthly app downloads comparison across platforms
 */
export function generatePlatformDownloadsData(): ChartDataset[] {
  const platforms = ['iOS App Store', 'Google Play', 'Web App', 'Desktop'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const datasets: ChartDataset[] = [];

  platforms.forEach((platform, platformIndex) => {
    const data: ChartDataPoint[] = [];
    const marketShares = [0.30, 0.55, 0.12, 0.03]; // Realistic platform distribution
    const baseDownloads = 50000;
    
    months.forEach((month, monthIndex) => {
      const growthTrend = 1 + (monthIndex * 0.1); // 10% monthly growth
      const seasonalVariation = 0.8 + Math.random() * 0.4; // ±20% variation
      const downloads = Math.round(baseDownloads * marketShares[platformIndex] * growthTrend * seasonalVariation);

      data.push({
        x: month,
        y: downloads
      });
    });

    datasets.push({
      label: platform,
      data: data
    });
  });

  return datasets;
}

/**
 * Generate regional sales performance comparison
 */
export function generateRegionalSalesData(): ChartDataset[] {
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'];
  const data: ChartDataPoint[] = [];
  
  const regionalSales = [1200000, 950000, 1500000, 320000, 180000]; // USD
  
  regions.forEach((region, index) => {
    const baseSales = regionalSales[index];
    const currencyFluctuation = 0.92 + Math.random() * 0.16; // ±8% currency impact
    const marketCondition = region === 'Asia Pacific' ? 1.1 : 1.0; // Strong APAC performance
    const sales = Math.round(baseSales * currencyFluctuation * marketCondition);

    data.push({
      x: region,
      y: sales
    });
  });

  return [{
    label: 'Sales Revenue (USD)',
    data: data
  }];
}

/**
 * Generate customer acquisition cost by channel
 */
export function generateCustomerAcquisitionData(): ChartDataset[] {
  const channels = ['Google Ads', 'Facebook', 'LinkedIn', 'Content Marketing', 'Referrals', 'Email'];
  const data: ChartDataPoint[] = [];
  
  const acquisitionCosts = [45, 38, 72, 25, 12, 18]; // Cost per acquisition in USD
  
  channels.forEach((channel, index) => {
    const baseCost = acquisitionCosts[index];
    const marketVariation = 0.85 + Math.random() * 0.3; // Market fluctuation
    const cost = Math.round((baseCost * marketVariation) * 100) / 100; // Round to 2 decimals

    data.push({
      x: channel,
      y: cost
    });
  });

  return [{
    label: 'Cost per Acquisition ($)',
    data: data
  }];
}