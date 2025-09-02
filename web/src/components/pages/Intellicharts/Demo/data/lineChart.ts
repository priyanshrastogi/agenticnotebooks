import { ChartDataPoint, ChartDataset } from '@/lib/charts/core/types';

/**
 * Generate normalized stock index data for volatility comparison
 */
export function generateStockData(): ChartDataset[] {
  const datasets: ChartDataset[] = [];
  const indices = ['S&P 500', 'NASDAQ', 'DOW JONES', 'FTSE 100'];
  const volatilities = [0.012, 0.018, 0.010, 0.014]; // Different volatilities for each index
  const trends = [0.0003, 0.0005, 0.0002, 0.0001]; // Slight upward trends

  indices.forEach((indexName, index) => {
    const data: ChartDataPoint[] = [];
    let value = 100; // Start all indices at 100 for normalized comparison
    const volatility = volatilities[index];
    const trend = trends[index];

    for (let day = 0; day < 180; day++) {
      const date = new Date('2024-01-01');
      date.setDate(date.getDate() + day);
      
      // Random walk with trend and volatility specific to each index
      const dailyReturn = (Math.random() - 0.5) * volatility + trend;
      value = value * (1 + dailyReturn);
      
      data.push({
        x: date.toISOString().split('T')[0], // Use actual date as x value
        y: Math.round(value * 100) / 100
      });
    }

    datasets.push({
      label: indexName,
      data: data
    });
  });

  return datasets;
}

/**
 * Generate website traffic data with seasonal patterns
 */
export function generateTrafficData(): ChartDataset[] {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const organicData: ChartDataPoint[] = [];
  const paidData: ChartDataPoint[] = [];
  const socialData: ChartDataPoint[] = [];

  months.forEach((month, index) => {
    // Seasonal patterns - summer dip, holiday peaks
    const seasonalMultiplier = 1 + 0.3 * Math.sin((index / 12) * 2 * Math.PI);
    const baseOrganic = 45000;
    const basePaid = 15000;
    const baseSocial = 8000;

    organicData.push({
      x: month,
      y: Math.round(baseOrganic * seasonalMultiplier * (0.9 + Math.random() * 0.2))
    });

    paidData.push({
      x: month,
      y: Math.round(basePaid * seasonalMultiplier * (0.8 + Math.random() * 0.4))
    });

    socialData.push({
      x: month,
      y: Math.round(baseSocial * seasonalMultiplier * (0.7 + Math.random() * 0.6))
    });
  });

  return [
    { label: 'Organic Traffic', data: organicData },
    { label: 'Paid Traffic', data: paidData },
    { label: 'Social Traffic', data: socialData }
  ];
}

/**
 * Generate CPU usage data with realistic server patterns
 */
export function generateCPUUsageData(): ChartDataset[] {
  const servers = ['Web Server', 'Database Server', 'Cache Server'];
  const datasets: ChartDataset[] = [];

  servers.forEach((server, serverIndex) => {
    const data: ChartDataPoint[] = [];
    const baseUsage = [65, 45, 30][serverIndex];
    
    // Generate 24 hours of data (every 15 minutes)
    for (let quarter = 0; quarter < 96; quarter++) {
      const hour = Math.floor(quarter / 4);
      const minute = (quarter % 4) * 15;
      
      // Daily usage pattern (higher during business hours)
      let timeMultiplier = 1;
      if (hour >= 9 && hour <= 17) {
        timeMultiplier = 1.5; // Business hours spike
      } else if (hour >= 2 && hour <= 6) {
        timeMultiplier = 0.4; // Early morning low usage
      }
      
      // Add some random spikes and dips
      const randomFactor = 0.8 + Math.random() * 0.4;
      const usage = Math.min(100, baseUsage * timeMultiplier * randomFactor);
      
      data.push({
        x: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        y: Math.round(usage * 10) / 10
      });
    }

    datasets.push({
      label: server,
      data: data
    });
  });

  return datasets;
}

/**
 * Generate user engagement metrics
 */
export function generateEngagementData(): ChartDataset[] {
  const dauData: ChartDataPoint[] = [];
  const sessionData: ChartDataPoint[] = [];
  const pageViewData: ChartDataPoint[] = [];

  for (let day = 0; day < 30; day++) {
    const date = new Date('2024-08-01');
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    
    // Weekend dips for DAU and different patterns for metrics
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const weekendMultiplier = isWeekend ? 0.7 : 1;
    
    // Gradual growth trend with daily variations
    const trendMultiplier = 1 + (day / 30) * 0.2;
    
    dauData.push({
      x: dateStr,
      y: Math.round(12000 * weekendMultiplier * trendMultiplier * (0.9 + Math.random() * 0.2))
    });

    sessionData.push({
      x: dateStr,
      y: Math.round(8.5 * (1.2 - weekendMultiplier * 0.2) * (0.8 + Math.random() * 0.4) * 10) / 10
    });

    pageViewData.push({
      x: dateStr,
      y: Math.round(45000 * weekendMultiplier * trendMultiplier * (0.85 + Math.random() * 0.3))
    });
  }

  return [
    { label: 'DAU (thousands)', data: dauData.map(d => ({ ...d, y: d.y / 1000 })) },
    { label: 'Avg Session (min)', data: sessionData },
    { label: 'Page Views (thousands)', data: pageViewData.map(d => ({ ...d, y: d.y / 1000 })) }
  ];
}

/**
 * Generate monthly sales performance data for a single product
 */
export function generateSingleDatasetData(): ChartDataset[] {
  const data: ChartDataPoint[] = [];
  let sales = 15000; // Starting monthly sales
  
  for (let month = 0; month < 12; month++) {
    const date = new Date('2024-01-01');
    date.setMonth(month);
    
    // Seasonal pattern with growth trend
    const seasonalMultiplier = 1 + 0.4 * Math.sin((month / 12) * 2 * Math.PI + Math.PI); // Peak in summer
    const growthTrend = 1 + (month * 0.05); // 5% monthly growth
    const randomVariation = 0.85 + Math.random() * 0.3; // ±15% variation
    
    sales = sales * growthTrend * seasonalMultiplier * randomVariation;
    
    data.push({
      x: date.toISOString().split('T')[0],
      y: Math.round(sales)
    });
  }

  return [{
    label: 'Monthly Sales',
    data: data
  }];
}