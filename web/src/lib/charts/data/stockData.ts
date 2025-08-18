import { ChartData, ChartDataset } from '../core/types';

/**
 * Generate realistic Apple stock price data for the last year (daily data)
 */
export function generateAppleStockData(): ChartDataset {
  const data: ChartData[] = [];
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
  const data: ChartData[] = [];
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
    const data: ChartData[] = [];
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
      color: stock.color,
    };
  });
}
