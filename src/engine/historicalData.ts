export interface InstrumentRecommendation {
  name: string;
  category: string;
  riskLevel: 'Ultra-Low' | 'Low-to-Moderate' | 'High Growth';
  expectedReturn: number; // nominal percentage
  volatility: number; // annual std dev
  liquidity: 'Instant (T+0/T+1)' | 'Medium (T+2/T+3)' | 'High Volatility';
  description: string;
}

export const HISTORICAL_BENCHMARKS = {
  bucket1: {
    name: 'Bucket 1 (Cash & Cash Equivalents)',
    nominalReturnMean: 5.75, // 5.75%
    stdDev: 0.85,
    recommendedYears: 3,
    role: 'Zero volatility, guarantees 1-3 years living expenses without touching equities.',
    instruments: [
      {
        name: 'Liquid & Ultra-Short Debt Funds',
        category: 'Mutual Funds',
        riskLevel: 'Ultra-Low',
        expectedReturn: 6.2,
        volatility: 0.7,
        liquidity: 'Instant (T+0/T+1)',
        description: 'T-bill and AAA commercial paper portfolios with low interest rate sensitivity.',
      },
      {
        name: 'High-Yield Bank Fixed Deposits / Sweep-in Accounts',
        category: 'Banking',
        riskLevel: 'Ultra-Low',
        expectedReturn: 6.8,
        volatility: 0.1,
        liquidity: 'Instant (T+0/T+1)',
        description: 'Government-insured fixed deposits scheduled in systematic maturity ladders.',
      },
      {
        name: 'Treasury Bills (91-Day / 182-Day T-Bills)',
        category: 'Sovereign Debt',
        riskLevel: 'Ultra-Low',
        expectedReturn: 6.5,
        volatility: 0.3,
        liquidity: 'Instant (T+0/T+1)',
        description: 'Zero default risk backed directly by sovereign central bank guarantee.',
      },
    ] as InstrumentRecommendation[],
  },
  bucket2: {
    name: 'Bucket 2 (Income & Stability)',
    nominalReturnMean: 8.5, // 8.5%
    stdDev: 4.2,
    recommendedYears: 7,
    role: 'Low-to-moderate risk shock absorber; refills Bucket 1 during equity bear markets.',
    instruments: [
      {
        name: 'Banking & PSU Debt / Corporate Bond Funds',
        category: 'Debt Mutual Funds',
        riskLevel: 'Low-to-Moderate',
        expectedReturn: 7.8,
        volatility: 3.5,
        liquidity: 'Medium (T+2/T+3)',
        description: 'High credit quality portfolio generating predictable accrual yields.',
      },
      {
        name: 'Target Maturity Bond ETFs (e.g. Bharat Bond / SDL)',
        category: 'Fixed Income ETFs',
        riskLevel: 'Low-to-Moderate',
        expectedReturn: 7.5,
        volatility: 3.8,
        liquidity: 'Medium (T+2/T+3)',
        description: 'State Development Loans (SDLs) and AAA PSU bonds matching cash flow horizons.',
      },
      {
        name: 'Conservative Hybrid / Multi-Asset Allocation Funds',
        category: 'Hybrid Funds',
        riskLevel: 'Low-to-Moderate',
        expectedReturn: 9.5,
        volatility: 5.5,
        liquidity: 'Medium (T+2/T+3)',
        description: 'Mix of 75% debt, 15% equity, and 10% gold providing steady capital protection.',
      },
    ] as InstrumentRecommendation[],
  },
  bucket3: {
    name: 'Bucket 3 (Long-Term Growth)',
    nominalReturnMean: 12.5, // 12.5%
    stdDev: 15.8,
    recommendedYears: 20,
    role: 'Engine of wealth creation; outpaces inflation over 10-30 year horizons.',
    instruments: [
      {
        name: 'Nifty 50 / Nifty 500 Index Funds',
        category: 'Broad Market Equity',
        riskLevel: 'High Growth',
        expectedReturn: 12.5,
        volatility: 15.2,
        liquidity: 'High Volatility',
        description: 'Core broad-market equity exposure representing top tier enterprises.',
      },
      {
        name: 'International Developed Markets (S&P 500 / Nasdaq)',
        category: 'Global Equity',
        riskLevel: 'High Growth',
        expectedReturn: 11.8,
        volatility: 16.5,
        liquidity: 'High Volatility',
        description: 'Geographic diversification and currency hedging against domestic inflation.',
      },
      {
        name: 'Active Multi-Cap / Flexi-Cap Funds',
        category: 'Active Equity',
        riskLevel: 'High Growth',
        expectedReturn: 13.5,
        volatility: 16.8,
        liquidity: 'High Volatility',
        description: 'Dynamic allocation across large, mid, and small cap compounders.',
      },
    ] as InstrumentRecommendation[],
  },
};
