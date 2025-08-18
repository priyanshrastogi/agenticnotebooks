import { ChartDataPoint, ChartDataset, PieDataPoint } from '../core/types';

/**
 * Generate realistic Apple stock price data for the last year (daily data)
 */
export function generateAppleStockData(): ChartDataset {
  const data: ChartDataPoint[] = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1); // 1 year ago

  let currentPrice = 150; // Starting price around $150
  const volatility = 0.025; // 2.5% daily volatility
  const trend = 0.0003; // Slight upward trend

  // Generate daily data for 1 year (approximately 252 trading days)
  for (let i = 0; i < 252; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + Math.floor(i * 1.4)); // Skip weekends approximately

    // Random walk with drift (realistic stock price movement)
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const driftChange = trend;
    const totalChange = randomChange + driftChange;

    currentPrice = currentPrice * (1 + totalChange);

    // Add some larger movements occasionally (news events, earnings, etc.)
    if (Math.random() < 0.015) {
      // 1.5% chance of significant movement
      const significantMove = (Math.random() - 0.5) * 0.08; // ±4% move
      currentPrice = currentPrice * (1 + significantMove);
    }

    // Ensure price stays within realistic bounds
    currentPrice = Math.max(120, Math.min(250, currentPrice));

    // Format date as "22 Apr '25" style
    const formattedDate = currentDate
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
      })
      .replace(/ /g, ' ')
      .replace(/,/g, " '");

    data.push({
      x: currentDate.getTime(), // Use timestamp for proper date scaling
      y: Math.round(currentPrice * 100) / 100, // Round to 2 decimal places
      date: formattedDate, // Store formatted date for tooltip
    });
  }

  return {
    label: 'AAPL',
    data,
  };
}

/**
 * Generate realistic stock data with date labels (for categorical X-axis)
 */
export function generateAppleStockDataWithDates(): ChartDataset {
  const data: ChartDataPoint[] = [];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  let currentPrice = 150;
  const monthlyVolatility = 0.08; // 8% monthly volatility

  months.forEach((month, index) => {
    // Monthly price changes
    const randomChange = (Math.random() - 0.5) * 2 * monthlyVolatility;
    currentPrice = currentPrice * (1 + randomChange);

    // Add some seasonal patterns
    if (index === 0 || index === 11) {
      // January effect and December rally
      currentPrice = currentPrice * 1.02;
    }
    if (index === 8 || index === 9) {
      // September/October volatility
      currentPrice = currentPrice * (0.95 + Math.random() * 0.1);
    }

    currentPrice = Math.max(120, Math.min(220, currentPrice));

    data.push({
      x: month,
      y: Math.round(currentPrice * 100) / 100,
    });
  });

  return {
    label: 'AAPL Monthly Close',
    data,
  };
}

/**
 * Generate multiple tech stock data for comparison
 */
export function generateTechStocksData(): ChartDataset[] {
  const stocks = [
    { name: 'AAPL', startPrice: 150, color: 'rgba(59, 130, 246, 1)' },
    { name: 'GOOGL', startPrice: 120, color: 'rgba(16, 185, 129, 1)' },
    { name: 'MSFT', startPrice: 300, color: 'rgba(245, 158, 11, 1)' },
  ];

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return stocks.map((stock) => {
    const data: ChartDataPoint[] = [];
    let currentPrice = stock.startPrice;

    months.forEach((month, index) => {
      const randomChange = (Math.random() - 0.5) * 0.1; // ±5% monthly change
      currentPrice = currentPrice * (1 + randomChange);

      // Different patterns for different stocks
      if (stock.name === 'AAPL') {
        // Apple tends to be more stable
        currentPrice = currentPrice * (0.98 + Math.random() * 0.04);
      } else if (stock.name === 'GOOGL') {
        // Google more volatile in tech earnings seasons
        if (index === 3 || index === 9) currentPrice = currentPrice * (0.9 + Math.random() * 0.2);
      } else if (stock.name === 'MSFT') {
        // Microsoft steady growth
        currentPrice = currentPrice * 1.005;
      }

      data.push({
        x: month,
        y: Math.round(currentPrice * 100) / 100,
      });
    });

    return {
      label: stock.name,
      data,
    };
  });
}

/**
 * Generate height vs weight scatter plot data
 */
export function generateHeightWeightData(): ChartDataset[] {
  const maleData: ChartDataPoint[] = [];
  const femaleData: ChartDataPoint[] = [];

  // Generate male data (height in cm, weight in kg)
  for (let i = 0; i < 50; i++) {
    const height = 165 + Math.random() * 25; // 165-190 cm
    const weight = (height - 100) * 0.9 + (Math.random() - 0.5) * 20; // BMI-based with variation
    maleData.push({
      x: Math.round(height * 100) / 100,
      y: Math.round(weight * 100) / 100,
    });
  }

  // Generate female data
  for (let i = 0; i < 50; i++) {
    const height = 155 + Math.random() * 20; // 155-175 cm
    const weight = (height - 110) * 0.8 + (Math.random() - 0.5) * 15; // BMI-based with variation
    femaleData.push({
      x: Math.round(height * 100) / 100,
      y: Math.round(weight * 100) / 100,
    });
  }

  return [
    {
      label: 'Male',
      data: maleData,
    },
    {
      label: 'Female',
      data: femaleData,
    },
  ];
}

/**
 * Generate sales vs marketing spend scatter plot data
 */
export function generateSalesMarketingData(): ChartDataset {
  const data: ChartDataPoint[] = [];

  // Generate data with positive correlation between marketing spend and sales
  for (let i = 0; i < 40; i++) {
    const marketingSpend = Math.random() * 100; // $0-100k marketing spend
    const baseSales = marketingSpend * 2.5; // Base relationship
    const noise = (Math.random() - 0.5) * 50; // Add noise
    const sales = Math.max(0, baseSales + noise);

    data.push({
      x: Math.round(marketingSpend * 100) / 100,
      y: Math.round(sales * 100) / 100,
    });
  }

  return {
    label: 'Sales vs Marketing Spend',
    data,
  };
}

/**
 * Generate market share data for pie/doughnut charts
 */
export function generateMarketShareData(): PieDataPoint[] {
  return [
    { label: 'Apple', value: 28.4 },
    { label: 'Samsung', value: 22.1 },
    { label: 'Google', value: 12.8 },
    { label: 'OnePlus', value: 8.9 },
    { label: 'Xiaomi', value: 7.2 },
    { label: 'Others', value: 20.6 },
  ];
}

/**
 * Generate revenue breakdown data for pie/doughnut charts
 */
export function generateRevenueBreakdownData(): PieDataPoint[] {
  return [
    { label: 'Product Sales', value: 45.2 },
    { label: 'Services', value: 28.7 },
    { label: 'Subscriptions', value: 15.1 },
    { label: 'Advertising', value: 8.3 },
    { label: 'Other', value: 2.7 },
  ];
}

/**
 * Generate web traffic sources data
 */
export function generateTrafficSourcesData(): PieDataPoint[] {
  return [
    { label: 'Organic Search', value: 42.3 },
    { label: 'Direct', value: 23.8 },
    { label: 'Social Media', value: 16.4 },
    { label: 'Paid Search', value: 9.2 },
    { label: 'Email', value: 5.1 },
    { label: 'Referral', value: 3.2 },
  ];
}

// ============================================================================
// EXTENDED EXAMPLES WITH MORE DATASETS
// ============================================================================

/**
 * Generate quarterly revenue comparison across 6 major tech companies
 */
export function generateTechRevenueComparison(): ChartDataset[] {
  const companies = [
    { name: 'Apple', baseRevenue: 90 },
    { name: 'Microsoft', baseRevenue: 50 },
    { name: 'Alphabet', baseRevenue: 65 },
    { name: 'Amazon', baseRevenue: 130 },
    { name: 'Meta', baseRevenue: 28 },
    { name: 'Tesla', baseRevenue: 24 },
  ];

  const quarters = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'];

  return companies.map((company) => {
    const data: ChartDataPoint[] = [];
    let currentRevenue = company.baseRevenue;

    quarters.forEach((quarter, index) => {
      // Add seasonal variations and growth trends
      const growthRate = 0.05 + Math.random() * 0.1; // 5-15% quarterly growth
      const seasonalFactor = index % 4 === 3 ? 1.15 : 1.0; // Q4 boost
      const randomVariation = 0.9 + Math.random() * 0.2; // ±10% variation

      currentRevenue = currentRevenue * (1 + growthRate) * seasonalFactor * randomVariation;

      data.push({
        x: quarter,
        y: Math.round(currentRevenue * 100) / 100,
      });
    });

    return {
      label: company.name,
      data,
    };
  });
}

/**
 * Generate global temperature data across 8 major cities
 */
export function generateGlobalTemperatureData(): ChartDataset[] {
  const cities = [
    { name: 'New York', baseTemp: 12 },
    { name: 'London', baseTemp: 10 },
    { name: 'Tokyo', baseTemp: 15 },
    { name: 'Sydney', baseTemp: 18 },
    { name: 'Mumbai', baseTemp: 27 },
    { name: 'Cairo', baseTemp: 22 },
    { name: 'Moscow', baseTemp: 5 },
    { name: 'São Paulo', baseTemp: 20 },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return cities.map((city) => {
    const data: ChartDataPoint[] = [];

    months.forEach((month, index) => {
      // Create seasonal temperature patterns
      const seasonalPattern = Math.sin((index * Math.PI) / 6) * 10; // Sinusoidal pattern
      const hemisphereMultiplier = ['Sydney', 'São Paulo'].includes(city.name) ? -1 : 1; // Southern hemisphere
      const temp = city.baseTemp + (seasonalPattern * hemisphereMultiplier) + (Math.random() - 0.5) * 4;

      data.push({
        x: month,
        y: Math.round(temp * 10) / 10,
      });
    });

    return {
      label: city.name,
      data,
    };
  });
}

/**
 * Generate website performance metrics across different pages
 */
export function generateWebsitePerformanceData(): ChartDataset[] {
  const metrics = [
    { name: 'Page Load Time (ms)', baseValue: 1200 },
    { name: 'Time to First Byte (ms)', baseValue: 200 },
    { name: 'Cumulative Layout Shift', baseValue: 0.1 },
    { name: 'First Contentful Paint (ms)', baseValue: 800 },
    { name: 'Largest Contentful Paint (ms)', baseValue: 1800 },
  ];

  const pages = ['Homepage', 'Products', 'About', 'Contact', 'Blog', 'Checkout', 'Dashboard'];

  return metrics.map((metric) => {
    const data: ChartDataPoint[] = [];

    pages.forEach((page) => {
      let value = metric.baseValue;

      // Add page-specific variations
      if (page === 'Homepage') value *= 0.8; // Optimized
      else if (page === 'Products') value *= 1.2; // Heavy with images
      else if (page === 'Dashboard') value *= 1.5; // Data-heavy
      else if (page === 'Checkout') value *= 0.9; // Critical, optimized
      else value *= (0.9 + Math.random() * 0.3); // Random variation

      // Add metric-specific formatting
      if (metric.name.includes('Layout Shift')) {
        value = Math.round(value * 1000) / 1000; // 3 decimal places
      } else {
        value = Math.round(value); // Round to integer for ms values
      }

      data.push({
        x: page,
        y: value,
      });
    });

    return {
      label: metric.name,
      data,
    };
  });
}

/**
 * Generate sales performance across multiple regions
 */
export function generateRegionalSalesData(): ChartDataset[] {
  const regions = [
    { name: 'North America', baseValue: 45 },
    { name: 'Europe', baseValue: 35 },
    { name: 'Asia Pacific', baseValue: 38 },
    { name: 'Latin America', baseValue: 15 },
    { name: 'Middle East', baseValue: 8 },
    { name: 'Africa', baseValue: 12 },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return regions.map((region) => {
    const data: ChartDataPoint[] = [];
    let currentSales = region.baseValue;

    months.forEach((month, index) => {
      // Seasonal patterns
      let seasonalMultiplier = 1.0;
      
      // Q4 holiday boost
      if (index >= 10) seasonalMultiplier = 1.3;
      // Summer slowdown
      else if (index >= 5 && index <= 7) seasonalMultiplier = 0.9;
      
      // Random monthly variation
      const randomVariation = 0.85 + Math.random() * 0.3;
      
      currentSales = region.baseValue * seasonalMultiplier * randomVariation;

      data.push({
        x: month,
        y: Math.round(currentSales * 100) / 100,
      });
    });

    return {
      label: region.name,
      data,
    };
  });
}

/**
 * Generate customer satisfaction scores across different departments
 */
export function generateCustomerSatisfactionScatter(): ChartDataset[] {
  const departments = [
    'Sales',
    'Customer Support',
    'Technical Support',
    'Billing',
    'Product Development',
    'Marketing',
  ];

  return departments.map((department) => {
    const data: ChartDataPoint[] = [];

    // Generate 15-25 data points per department
    const numPoints = 15 + Math.floor(Math.random() * 10);

    for (let i = 0; i < numPoints; i++) {
      // Response Time (minutes) vs Satisfaction Score (1-10)
      let responseTime = 1 + Math.random() * 60; // 1-60 minutes
      let satisfaction = 10 - (responseTime / 10) + (Math.random() - 0.5) * 3; // Inverse relationship with noise

      // Department-specific adjustments
      if (department === 'Sales') {
        responseTime *= 0.7; // Faster response
        satisfaction += 0.5; // Higher satisfaction
      } else if (department === 'Technical Support') {
        responseTime *= 1.8; // Slower due to complexity
        satisfaction -= 0.3; // Lower due to technical issues
      } else if (department === 'Customer Support') {
        responseTime *= 0.8; // Good response time
        satisfaction += 0.3; // Higher satisfaction
      }

      // Ensure bounds
      satisfaction = Math.max(1, Math.min(10, satisfaction));
      responseTime = Math.max(0.5, responseTime);

      data.push({
        x: Math.round(responseTime * 10) / 10,
        y: Math.round(satisfaction * 10) / 10,
      });
    }

    return {
      label: department,
      data,
    };
  });
}

/**
 * Generate marketing campaign performance data
 */
export function generateCampaignPerformanceScatter(): ChartDataset[] {
  const campaigns = [
    'Social Media Ads',
    'Google Ads',
    'Email Marketing',
    'Content Marketing',
    'Influencer Partnerships',
    'Display Advertising',
    'Affiliate Marketing',
  ];

  return campaigns.map((campaign) => {
    const data: ChartDataPoint[] = [];

    // Generate 20-30 data points per campaign
    const numPoints = 20 + Math.floor(Math.random() * 10);

    for (let i = 0; i < numPoints; i++) {
      // Budget Spent (x) vs Conversions (y)
      let budgetSpent = 500 + Math.random() * 4500; // $500-$5000
      let conversions = (budgetSpent / 100) + (Math.random() - 0.5) * 20; // Base relationship with noise

      // Campaign-specific adjustments
      if (campaign === 'Email Marketing') {
        budgetSpent *= 0.3; // Lower cost
        conversions *= 1.2; // Higher conversion rate
      } else if (campaign === 'Google Ads') {
        conversions *= 0.8; // Competitive, lower conversion
      } else if (campaign === 'Influencer Partnerships') {
        budgetSpent *= 1.5; // Higher cost
        conversions *= 0.9; // Variable performance
      } else if (campaign === 'Content Marketing') {
        budgetSpent *= 0.6; // Lower direct cost
        conversions *= 1.1; // Good long-term performance
      }

      conversions = Math.max(1, conversions);

      data.push({
        x: Math.round(budgetSpent),
        y: Math.round(conversions * 10) / 10,
      });
    }

    return {
      label: campaign,
      data,
    };
  });
}

/**
 * Generate quarterly sales data for multiple products (for bar charts)
 */
export function generateQuarterlySalesData(): ChartDataset[] {
  const products = ['Product A', 'Product B', 'Product C'];
  const quarters = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];

  return products.map((product) => {
    const data: ChartDataPoint[] = [];
    
    quarters.forEach((quarter) => {
      // Base sales with some variation per product
      let baseSales = 10000; // $10,000 base
      
      if (product === 'Product A') {
        baseSales = 12000 + Math.random() * 3000; // $12K-$15K range
      } else if (product === 'Product B') {
        baseSales = 8000 + Math.random() * 4000; // $8K-$12K range
      } else if (product === 'Product C') {
        baseSales = 6000 + Math.random() * 3000; // $6K-$9K range
      }
      
      // Q4 typically higher (holiday season)
      if (quarter === 'Q4 2024') {
        baseSales *= 1.3;
      }
      // Q1 typically lower (post-holiday)
      if (quarter === 'Q1 2024') {
        baseSales *= 0.8;
      }
      
      data.push({
        x: quarter,
        y: Math.round(baseSales),
      });
    });

    return {
      label: product,
      data,
    };
  });
}

/**
 * Generate monthly revenue data by department (for horizontal bar charts)
 */
export function generateDepartmentRevenueData(): ChartDataset[] {
  const departments = [
    'Engineering', 
    'Sales', 
    'Marketing', 
    'Customer Success', 
    'Operations',
    'Finance',
    'HR'
  ];
  
  const data: ChartDataPoint[] = departments.map(department => {
    let baseRevenue = 50000; // $50K base monthly revenue
    
    // Department-specific revenue ranges
    switch(department) {
      case 'Sales':
        baseRevenue = 120000 + Math.random() * 30000; // $120K-$150K
        break;
      case 'Engineering':
        baseRevenue = 80000 + Math.random() * 25000; // $80K-$105K
        break;
      case 'Marketing':
        baseRevenue = 60000 + Math.random() * 20000; // $60K-$80K
        break;
      case 'Customer Success':
        baseRevenue = 45000 + Math.random() * 15000; // $45K-$60K
        break;
      case 'Operations':
        baseRevenue = 30000 + Math.random() * 10000; // $30K-$40K
        break;
      case 'Finance':
        baseRevenue = 35000 + Math.random() * 10000; // $35K-$45K
        break;
      case 'HR':
        baseRevenue = 25000 + Math.random() * 8000; // $25K-$33K
        break;
    }
    
    return {
      x: department,
      y: Math.round(baseRevenue),
    };
  });

  return [{
    label: 'Monthly Revenue',
    data,
  }];
}

/**
 * Generate browser usage statistics (for grouped bar charts)
 */
export function generateBrowserUsageData(): ChartDataset[] {
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Other'];
  const datasets = ['Desktop', 'Mobile', 'Tablet'];
  
  return datasets.map(device => {
    const data: ChartDataPoint[] = [];
    
    browsers.forEach(browser => {
      let usage = 0;
      
      // Device and browser specific usage patterns
      if (device === 'Desktop') {
        switch(browser) {
          case 'Chrome': usage = 60 + Math.random() * 10; break;
          case 'Firefox': usage = 12 + Math.random() * 5; break;
          case 'Safari': usage = 8 + Math.random() * 4; break;
          case 'Edge': usage = 15 + Math.random() * 5; break;
          case 'Other': usage = 3 + Math.random() * 2; break;
        }
      } else if (device === 'Mobile') {
        switch(browser) {
          case 'Chrome': usage = 45 + Math.random() * 10; break;
          case 'Firefox': usage = 5 + Math.random() * 3; break;
          case 'Safari': usage = 35 + Math.random() * 8; break;
          case 'Edge': usage = 8 + Math.random() * 3; break;
          case 'Other': usage = 5 + Math.random() * 2; break;
        }
      } else { // Tablet
        switch(browser) {
          case 'Chrome': usage = 40 + Math.random() * 10; break;
          case 'Firefox': usage = 8 + Math.random() * 3; break;
          case 'Safari': usage = 42 + Math.random() * 8; break;
          case 'Edge': usage = 6 + Math.random() * 2; break;
          case 'Other': usage = 3 + Math.random() * 2; break;
        }
      }
      
      data.push({
        x: browser,
        y: Math.round(usage * 10) / 10, // Round to 1 decimal
      });
    });
    
    return {
      label: device,
      data,
    };
  });
}

/**
 * Generate employee satisfaction scores by office location (for stacked bar charts)
 */
export function generateOfficeSatisfactionData(): ChartDataset[] {
  const offices = ['New York', 'San Francisco', 'London', 'Tokyo', 'Berlin'];
  const categories = ['Work-Life Balance', 'Compensation', 'Management', 'Growth Opportunities'];
  
  return categories.map(category => {
    const data: ChartDataPoint[] = [];
    
    offices.forEach(office => {
      let baseScore = 70; // Base satisfaction score out of 100
      
      // Category-specific variations
      if (category === 'Work-Life Balance') {
        baseScore = 65 + Math.random() * 20; // 65-85 range
      } else if (category === 'Compensation') {
        baseScore = 60 + Math.random() * 25; // 60-85 range
        // San Francisco typically higher compensation satisfaction
        if (office === 'San Francisco') baseScore += 10;
      } else if (category === 'Management') {
        baseScore = 70 + Math.random() * 15; // 70-85 range
      } else if (category === 'Growth Opportunities') {
        baseScore = 75 + Math.random() * 15; // 75-90 range
        // New York and London typically more opportunities
        if (office === 'New York' || office === 'London') baseScore += 5;
      }
      
      data.push({
        x: office,
        y: Math.round(baseScore),
      });
    });
    
    return {
      label: category,
      data,
    };
  });
}

