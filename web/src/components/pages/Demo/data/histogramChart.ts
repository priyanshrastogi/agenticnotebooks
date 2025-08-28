/**
 * Generate age distribution data for demographic analysis
 */
export function generateAgeDistributionData(): number[] {
  const ages: number[] = [];
  
  // Generate realistic age distribution with multiple peaks
  // Young adults (18-30)
  for (let i = 0; i < 150; i++) {
    ages.push(18 + Math.random() * 12 + Math.random() * 5);
  }
  
  // Middle-aged (35-50)
  for (let i = 0; i < 200; i++) {
    ages.push(35 + Math.random() * 15 + Math.random() * 8);
  }
  
  // Older adults (55-75)
  for (let i = 0; i < 100; i++) {
    ages.push(55 + Math.random() * 20 + Math.random() * 10);
  }
  
  // Add some outliers
  for (let i = 0; i < 20; i++) {
    ages.push(80 + Math.random() * 15);
  }
  
  return ages.map(age => Math.round(age * 10) / 10);
}

/**
 * Generate website loading time distribution data
 */
export function generateLoadTimeData(): number[] {
  const loadTimes: number[] = [];
  
  // Most pages load quickly (0.5-3 seconds) - log-normal distribution
  for (let i = 0; i < 800; i++) {
    const baseTime = Math.random() * 2.5 + 0.5;
    const variation = Math.random() * 0.8;
    loadTimes.push(baseTime + variation);
  }
  
  // Some slower pages (3-8 seconds)
  for (let i = 0; i < 150; i++) {
    const slowTime = 3 + Math.random() * 5;
    loadTimes.push(slowTime);
  }
  
  // A few very slow pages (8-15 seconds)
  for (let i = 0; i < 50; i++) {
    const verySlowTime = 8 + Math.random() * 7;
    loadTimes.push(verySlowTime);
  }
  
  return loadTimes.map(time => Math.round(time * 100) / 100);
}

/**
 * Generate income distribution data for economic analysis
 */
export function generateIncomeDistributionData(): number[] {
  const incomes: number[] = [];
  
  // Lower income bracket (20k-50k)
  for (let i = 0; i < 300; i++) {
    const income = 20000 + Math.random() * 30000 + (Math.random() - 0.5) * 5000;
    incomes.push(Math.max(15000, income));
  }
  
  // Middle income bracket (50k-100k)
  for (let i = 0; i < 400; i++) {
    const income = 50000 + Math.random() * 50000 + (Math.random() - 0.5) * 10000;
    incomes.push(income);
  }
  
  // Upper middle income (100k-200k)
  for (let i = 0; i < 200; i++) {
    const income = 100000 + Math.random() * 100000 + (Math.random() - 0.5) * 15000;
    incomes.push(income);
  }
  
  // High income (200k-500k)
  for (let i = 0; i < 80; i++) {
    const income = 200000 + Math.random() * 300000;
    incomes.push(income);
  }
  
  // Very high income (500k+)
  for (let i = 0; i < 20; i++) {
    const income = 500000 + Math.random() * 1000000;
    incomes.push(income);
  }
  
  return incomes.map(income => Math.round(income));
}

/**
 * Generate test scores distribution for educational analysis
 */
export function generateTestScoresData(): number[] {
  const scores: number[] = [];
  
  // Normal distribution around 75-85 (typical test scores)
  for (let i = 0; i < 500; i++) {
    let score = 0;
    // Use Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    score = 78 + z0 * 12; // Mean 78, std dev 12
    score = Math.max(0, Math.min(100, score)); // Clamp to 0-100
    scores.push(Math.round(score * 10) / 10);
  }
  
  return scores;
}

/**
 * Generate response time distribution for API performance analysis
 */
export function generateResponseTimeData(): number[] {
  const responseTimes: number[] = [];
  
  // Most requests are fast (0-200ms)
  for (let i = 0; i < 700; i++) {
    const time = Math.random() * 200 + Math.random() * 50;
    responseTimes.push(time);
  }
  
  // Some moderate responses (200-500ms)
  for (let i = 0; i < 200; i++) {
    const time = 200 + Math.random() * 300;
    responseTimes.push(time);
  }
  
  // Slow responses (500ms-2s)
  for (let i = 0; i < 80; i++) {
    const time = 500 + Math.random() * 1500;
    responseTimes.push(time);
  }
  
  // Very slow responses (2s+)
  for (let i = 0; i < 20; i++) {
    const time = 2000 + Math.random() * 3000;
    responseTimes.push(time);
  }
  
  return responseTimes.map(time => Math.round(time));
}

/**
 * Generate daily step count distribution for fitness tracking
 */
export function generateStepCountData(): number[] {
  const stepCounts: number[] = [];
  
  // Sedentary days (1000-5000 steps)
  for (let i = 0; i < 150; i++) {
    const steps = 1000 + Math.random() * 4000 + Math.random() * 1000;
    stepCounts.push(Math.round(steps));
  }
  
  // Moderately active days (5000-10000 steps)
  for (let i = 0; i < 300; i++) {
    const steps = 5000 + Math.random() * 5000 + Math.random() * 2000;
    stepCounts.push(Math.round(steps));
  }
  
  // Active days (10000-15000 steps)
  for (let i = 0; i < 200; i++) {
    const steps = 10000 + Math.random() * 5000 + Math.random() * 1500;
    stepCounts.push(Math.round(steps));
  }
  
  // Very active days (15000+ steps)
  for (let i = 0; i < 50; i++) {
    const steps = 15000 + Math.random() * 10000;
    stepCounts.push(Math.round(steps));
  }
  
  return stepCounts;
}

/**
 * Generate transaction amount distribution for financial analysis
 */
export function generateTransactionAmountData(): number[] {
  const amounts: number[] = [];
  
  // Small transactions ($1-$50) - most common
  for (let i = 0; i < 400; i++) {
    const amount = 1 + Math.random() * 49 + Math.random() * 20;
    amounts.push(Math.round(amount * 100) / 100);
  }
  
  // Medium transactions ($50-$200)
  for (let i = 0; i < 250; i++) {
    const amount = 50 + Math.random() * 150 + Math.random() * 50;
    amounts.push(Math.round(amount * 100) / 100);
  }
  
  // Large transactions ($200-$1000)
  for (let i = 0; i < 100; i++) {
    const amount = 200 + Math.random() * 800;
    amounts.push(Math.round(amount * 100) / 100);
  }
  
  // Very large transactions ($1000+)
  for (let i = 0; i < 50; i++) {
    const amount = 1000 + Math.random() * 4000;
    amounts.push(Math.round(amount * 100) / 100);
  }
  
  return amounts;
}