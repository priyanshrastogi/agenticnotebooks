import { ChartDataPoint, ChartDataset } from '@/lib/charts/core/types';

/**
 * Generate customer satisfaction vs price analysis - single dataset scatter plot
 */
export function generateCustomerSatisfactionData(): ChartDataset[] {
  const data: ChartDataPoint[] = [];
  
  // Generate 50 data points for customer satisfaction vs price
  for (let i = 0; i < 50; i++) {
    // Price range: $20 - $200
    const price = 20 + Math.random() * 180;
    
    // Customer satisfaction generally decreases with price, but with noise
    // Higher prices tend to have lower satisfaction (with exceptions)
    let satisfaction = 95 - (price - 20) * 0.3; // Base trend
    
    // Add realistic noise and outliers
    satisfaction += (Math.random() - 0.5) * 25; // ±12.5 random variation
    
    // Add some premium product outliers (expensive but high satisfaction)
    if (Math.random() < 0.1 && price > 120) {
      satisfaction = 85 + Math.random() * 15; // Premium outliers
    }
    
    // Add budget-friendly sweet spots
    if (price > 40 && price < 80 && Math.random() < 0.2) {
      satisfaction = 80 + Math.random() * 15; // Sweet spot products
    }
    
    // Clamp satisfaction between 30-100
    satisfaction = Math.max(30, Math.min(100, satisfaction));
    
    data.push({
      x: Math.round(price * 100) / 100,
      y: Math.round(satisfaction * 10) / 10
    });
  }

  return [{
    label: 'Customer Satisfaction vs Price',
    data: data
  }];
}

/**
 * Generate employee performance analysis - salary vs productivity by department
 */
export function generateEmployeePerformanceData(): ChartDataset[] {
  const departments = [
    { name: 'Engineering', baseSalary: 95000, baseProductivity: 85, variance: 15 },
    { name: 'Sales', baseSalary: 75000, baseProductivity: 75, variance: 20 },
    { name: 'Marketing', baseSalary: 70000, baseProductivity: 70, variance: 18 }
  ];

  const datasets: ChartDataset[] = [];

  departments.forEach(dept => {
    const data: ChartDataPoint[] = [];
    
    // Generate 25 employees per department
    for (let i = 0; i < 25; i++) {
      // Salary with normal distribution around base
      const salaryVariance = (Math.random() - 0.5) * dept.baseSalary * 0.4;
      const salary = dept.baseSalary + salaryVariance;
      
      // Productivity loosely correlates with salary but with noise
      let productivity = dept.baseProductivity + (salaryVariance / dept.baseSalary) * 20;
      productivity += (Math.random() - 0.5) * dept.variance;
      
      // Add some star performers and underperformers
      if (Math.random() < 0.1) {
        productivity += (Math.random() - 0.5) * 30; // Outliers
      }
      
      // Clamp productivity between 40-100
      productivity = Math.max(40, Math.min(100, productivity));
      
      data.push({
        x: Math.round(salary),
        y: Math.round(productivity * 10) / 10
      });
    }

    datasets.push({
      label: dept.name,
      data: data
    });
  });

  return datasets;
}

/**
 * Generate housing market analysis - square footage vs price by city
 */
export function generateHousingMarketData(): ChartDataset[] {
  const cities = [
    { name: 'San Francisco', pricePerSqFt: 1200, minSize: 800, maxSize: 3000 },
    { name: 'Austin', pricePerSqFt: 400, minSize: 1200, maxSize: 4000 },
    { name: 'Denver', pricePerSqFt: 500, minSize: 1000, maxSize: 3500 }
  ];

  const datasets: ChartDataset[] = [];

  cities.forEach(city => {
    const data: ChartDataPoint[] = [];
    
    // Generate 30 properties per city
    for (let i = 0; i < 30; i++) {
      // Square footage within city range
      const sqft = city.minSize + Math.random() * (city.maxSize - city.minSize);
      
      // Base price calculation
      let price = sqft * city.pricePerSqFt;
      
      // Add market factors
      const marketVariance = 1 + (Math.random() - 0.5) * 0.4; // ±20% market variation
      price *= marketVariance;
      
      // Add property condition/location factors
      const conditionFactor = 0.7 + Math.random() * 0.6; // 0.7x to 1.3x
      price *= conditionFactor;
      
      // Convert to thousands for better readability
      price = price / 1000;
      
      data.push({
        x: Math.round(sqft),
        y: Math.round(price * 10) / 10
      });
    }

    datasets.push({
      label: city.name,
      data: data
    });
  });

  return datasets;
}

/**
 * Generate marketing campaign analysis - ad spend vs conversions by channel
 */
export function generateMarketingCampaignData(): ChartDataset[] {
  const channels = [
    { name: 'Google Ads', efficiency: 0.05, baseSpend: 5000, variance: 0.6 },
    { name: 'Facebook Ads', efficiency: 0.04, baseSpend: 3000, variance: 0.8 },
    { name: 'LinkedIn Ads', efficiency: 0.02, baseSpend: 8000, variance: 0.4 },
    { name: 'Twitter Ads', efficiency: 0.03, baseSpend: 2000, variance: 1.0 }
  ];

  const datasets: ChartDataset[] = [];

  channels.forEach(channel => {
    const data: ChartDataPoint[] = [];
    
    // Generate 20 campaigns per channel
    for (let i = 0; i < 20; i++) {
      // Ad spend varies around base spend
      const spendVariance = 1 + (Math.random() - 0.5) * channel.variance;
      const adSpend = channel.baseSpend * spendVariance;
      
      // Conversions based on efficiency with realistic noise
      let conversions = adSpend * channel.efficiency;
      
      // Add campaign performance variation
      const performanceMultiplier = 0.5 + Math.random() * 1.0; // 0.5x to 1.5x
      conversions *= performanceMultiplier;
      
      // Add seasonal/external factors
      if (Math.random() < 0.15) {
        conversions *= 0.3 + Math.random() * 0.4; // Some campaigns just fail
      } else if (Math.random() < 0.1) {
        conversions *= 1.5 + Math.random() * 0.8; // Some campaigns go viral
      }
      
      data.push({
        x: Math.round(adSpend),
        y: Math.round(conversions)
      });
    }

    datasets.push({
      label: channel.name,
      data: data
    });
  });

  return datasets;
}