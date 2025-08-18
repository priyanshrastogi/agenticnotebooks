export const PLANS = {
  free: {
    name: 'Free',
    code: 'free',
    description: 'Perfect for trying Intellicharts',
    features: {
      dailyLimit: 20,
      monthlyLimit: 200,
      maxFileSize: 5, // MB
      maxFiles: 5,
      maxColumns: 25,
    },
    monthlyPrice: 0,
    yearlyPrice: 0,
    isLifetime: false,
  },
  pro: {
    name: 'Pro',
    code: 'pro',
    description: 'For regular users',
    features: {
      dailyLimit: null, // No daily limit
      monthlyLimit: 600,
      maxFileSize: 30, // MB
      maxFiles: 50,
      maxColumns: null, // Unlimited
    },
    monthlyPrice: 19,
    yearlyPrice: 190,
    isLifetime: false,
  },
  lifetime: {
    name: 'Lifetime Credits',
    code: 'lt_credits',
    description: 'Never expires',
    features: {
      dailyLimit: null, // No daily limit
      totalCredits: 1800,
      maxFileSize: 30, // MB
      maxFiles: 50,
      maxColumns: null, // Unlimited
    },
    price: 99,
    isLifetime: true,
  },
};
