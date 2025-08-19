import { ChartDataPoint, ChartDataset } from '@/lib/charts/core/types';

/**
 * Generate revenue breakdown by product category - suitable for stacked area chart
 */
export function generateRevenueBreakdownData(): ChartDataset[] {
  const categories = ['Software', 'Hardware', 'Services', 'Support'];
  const datasets: ChartDataset[] = [];

  categories.forEach((category, index) => {
    const data: ChartDataPoint[] = [];
    const baseRevenues = [120000, 80000, 60000, 40000]; // Different base revenues per category
    const growthRates = [0.08, 0.03, 0.12, 0.06]; // Different growth rates
    
    for (let month = 0; month < 12; month++) {
      const date = new Date('2024-01-01');
      date.setMonth(month);
      
      // Seasonal multiplier (Q4 boost for software/hardware, steady for services)
      const seasonalMultipliers = [
        1 + 0.3 * Math.sin((month / 12) * 2 * Math.PI + 3.5), // Software: Q4 peak
        1 + 0.2 * Math.sin((month / 12) * 2 * Math.PI + 3.8), // Hardware: slight Q4 boost  
        1 + 0.1 * Math.sin((month / 12) * 2 * Math.PI), // Services: steady
        1 + 0.15 * Math.sin((month / 12) * 2 * Math.PI + 1) // Support: mid-year peak
      ];
      
      const baseRevenue = baseRevenues[index];
      const growthRate = growthRates[index];
      const seasonalMultiplier = seasonalMultipliers[index];
      const randomVariation = 0.85 + Math.random() * 0.3;
      
      const revenue = baseRevenue * (1 + (month * growthRate / 12)) * seasonalMultiplier * randomVariation;
      
      data.push({
        x: date.toISOString().split('T')[0],
        y: Math.round(revenue)
      });
    }

    datasets.push({
      label: category,
      data: data
    });
  });

  return datasets;
}

/**
 * Generate website performance metrics - page load times, bounce rate, conversion rate
 */
export function generateWebsiteMetricsData(): ChartDataset[] {
  const metrics = ['Page Load Time (s)', 'Bounce Rate (%)', 'Conversion Rate (%)'];
  const datasets: ChartDataset[] = [];

  // Generate daily data for the last 30 days
  metrics.forEach((metric, metricIndex) => {
    const data: ChartDataPoint[] = [];
    
    for (let day = 0; day < 30; day++) {
      const date = new Date('2024-08-01');
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];
      
      let value: number;
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      switch (metricIndex) {
        case 0: // Page Load Time - slower on weekends due to less CDN optimization
          value = (2.1 + (isWeekend ? 0.3 : 0)) * (0.9 + Math.random() * 0.2);
          value = Math.round(value * 100) / 100;
          break;
        case 1: // Bounce Rate - higher on weekends
          value = (45 + (isWeekend ? 8 : 0)) * (0.85 + Math.random() * 0.3);
          value = Math.round(value * 10) / 10;
          break;
        case 2: // Conversion Rate - lower on weekends
          value = (3.2 + (isWeekend ? -0.5 : 0)) * (0.8 + Math.random() * 0.4);
          value = Math.round(value * 100) / 100;
          break;
        default:
          value = 0;
      }
      
      data.push({
        x: dateStr,
        y: value
      });
    }

    datasets.push({
      label: metric,
      data: data
    });
  });

  return datasets;
}

/**
 * Generate energy consumption data by source - renewable vs non-renewable
 */
export function generateEnergyConsumptionData(): ChartDataset[] {
  const sources = ['Solar', 'Wind', 'Hydro', 'Natural Gas', 'Coal'];
  const datasets: ChartDataset[] = [];
  
  sources.forEach((source, index) => {
    const data: ChartDataPoint[] = [];
    
    // Base consumption patterns
    const baseConsumptions = [25, 35, 15, 45, 30]; // MW
    const trends = [0.15, 0.12, 0.02, -0.08, -0.12]; // Renewable growing, fossil declining
    
    for (let month = 0; month < 12; month++) {
      const date = new Date('2024-01-01');
      date.setMonth(month);
      
      // Seasonal patterns
      let seasonalMultiplier = 1;
      if (source === 'Solar') {
        seasonalMultiplier = 1 + 0.4 * Math.sin((month / 12) * 2 * Math.PI - Math.PI/2); // Peak in summer
      } else if (source === 'Wind') {
        seasonalMultiplier = 1 + 0.3 * Math.sin((month / 12) * 2 * Math.PI + Math.PI); // Peak in winter
      } else if (source === 'Natural Gas') {
        seasonalMultiplier = 1 + 0.5 * Math.sin((month / 12) * 2 * Math.PI + Math.PI); // Higher in winter
      } else if (source === 'Coal') {
        seasonalMultiplier = 1 + 0.2 * Math.sin((month / 12) * 2 * Math.PI + Math.PI); // Slightly higher in winter
      }
      
      const baseConsumption = baseConsumptions[index];
      const trend = trends[index];
      const trendMultiplier = 1 + (month * trend / 12);
      const randomVariation = 0.85 + Math.random() * 0.3;
      
      const consumption = Math.max(0, baseConsumption * seasonalMultiplier * trendMultiplier * randomVariation);
      
      data.push({
        x: date.toISOString().split('T')[0],
        y: Math.round(consumption * 10) / 10
      });
    }

    datasets.push({
      label: source,
      data: data
    });
  });

  return datasets;
}

/**
 * Generate social media engagement data - likes, comments, shares, views
 */
export function generateSocialEngagementData(): ChartDataset[] {
  const engagementTypes = ['Views', 'Likes', 'Comments', 'Shares'];
  const datasets: ChartDataset[] = [];
  
  engagementTypes.forEach((type, index) => {
    const data: ChartDataPoint[] = [];
    const baseValues = [50000, 3500, 450, 180]; // Realistic social media ratios
    const weeklyPatterns = [1.0, 1.2, 0.9, 0.8, 0.85, 1.4, 1.3]; // Mon-Sun pattern
    
    for (let day = 0; day < 28; day++) { // 4 weeks of data
      const date = new Date('2024-08-01');
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOfWeek = date.getDay();
      const weeklyMultiplier = weeklyPatterns[dayOfWeek];
      
      // Gradual growth trend over the month
      const growthTrend = 1 + (day / 28) * 0.25;
      
      // Random daily variation
      const randomVariation = 0.7 + Math.random() * 0.6;
      
      const baseValue = baseValues[index];
      const value = Math.round(baseValue * weeklyMultiplier * growthTrend * randomVariation);
      
      data.push({
        x: dateStr,
        y: value
      });
    }

    datasets.push({
      label: type,
      data: data
    });
  });

  return datasets;
}

/**
 * Generate Apple Stock Performance data - daily stock price for the past year
 */
export function generateAppleStockData(): ChartDataset[] {
  const data: ChartDataPoint[] = [];
  let currentPrice = 150; // Starting price around $150
  const basePrice = 150;
  
  // Generate daily data for the past year (365 days)
  for (let day = 0; day < 365; day++) {
    const date = new Date();
    date.setDate(date.getDate() - (365 - day - 1)); // Start from 365 days ago
    
    // Overall trend component (gradual growth over the year)
    const overallTrend = basePrice * (1 + (day / 365) * 0.20); // 20% growth over the year
    
    // Seasonal patterns - tech stocks often see Q4 rallies and earnings impacts
    const month = date.getMonth();
    let seasonalOffset = 0;
    
    if (month >= 9) { // Q4 rally (Oct-Dec)
      seasonalOffset = 15 * Math.sin((month - 9) / 3 * Math.PI);
    } else if (month <= 2) { // New year volatility
      seasonalOffset = -8 * Math.sin((month / 3) * Math.PI);
    }
    
    // Weekly patterns - Monday blues, Friday optimism
    const dayOfWeek = date.getDay();
    let weeklyOffset = 0;
    if (dayOfWeek === 1) weeklyOffset = -0.5; // Monday slight dip
    if (dayOfWeek === 5) weeklyOffset = 0.5; // Friday slight boost
    
    // Random daily volatility (Apple typically has 1-3% daily moves)
    const dailyNoise = (Math.random() - 0.5) * 8; // ±$4 daily moves
    
    // Calculate base price for the day
    let dayPrice = overallTrend + seasonalOffset + weeklyOffset + dailyNoise;
    
    // Add some major events/earnings spikes as one-time adjustments
    if (day === 90) dayPrice += 12; // Q1 earnings beat
    if (day === 180) dayPrice -= 15; // Mid-year market correction
    if (day === 270) dayPrice += 10; // Q3 earnings beat
    if (day === 320) dayPrice += 8; // Holiday season optimism
    
    // Apply random walk for more realistic day-to-day movement
    const randomWalk = (Math.random() - 0.5) * 0.02; // ±1% random walk
    currentPrice = currentPrice + (dayPrice - currentPrice) * 0.1 + currentPrice * randomWalk;
    
    // Keep within realistic bounds but allow more variation
    currentPrice = Math.max(120, Math.min(220, currentPrice));
    
    data.push({
      x: date.toISOString().split('T')[0],
      y: Math.round(currentPrice * 100) / 100
    });
  }

  return [{
    label: 'AAPL Stock Price',
    data: data
  }];
}

/**
 * Generate app download data by platform - iOS, Android, Web
 */
export function generateAppDownloadsData(): ChartDataset[] {
  const platforms = ['iOS', 'Android', 'Web App'];
  const datasets: ChartDataset[] = [];
  
  platforms.forEach((platform, index) => {
    const data: ChartDataPoint[] = [];
    const marketShares = [0.25, 0.65, 0.10]; // Realistic mobile market share
    const baseDownloads = 8000;
    
    for (let week = 0; week < 12; week++) { // 12 weeks of data
      const date = new Date('2024-06-01');
      date.setDate(date.getDate() + (week * 7));
      const dateStr = date.toISOString().split('T')[0];
      
      // Platform-specific growth patterns
      let growthMultiplier = 1;
      if (platform === 'iOS') {
        growthMultiplier = 1 + (week * 0.03); // Steady growth
      } else if (platform === 'Android') {
        growthMultiplier = 1 + (week * 0.05); // Faster growth
      } else {
        growthMultiplier = 1 + (week * 0.08); // Rapid web adoption
      }
      
      // Weekly variation (app store featuring, marketing campaigns)
      const weeklyVariation = 0.6 + Math.random() * 0.8;
      
      const downloads = Math.round(
        baseDownloads * marketShares[index] * growthMultiplier * weeklyVariation
      );
      
      data.push({
        x: dateStr,
        y: downloads
      });
    }

    datasets.push({
      label: platform,
      data: data
    });
  });

  return datasets;
}