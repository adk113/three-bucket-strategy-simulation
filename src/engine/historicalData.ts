import { SupportedCountry } from '../utils/currency';

export interface InstrumentRecommendation {
  name: string;
  category: string;
  riskLevel: 'Ultra-Low' | 'Low-to-Moderate' | 'High Growth';
  expectedReturn: number; // nominal percentage
  volatility: number; // annual std dev %
  liquidity: 'Instant (T+0/T+1)' | 'Medium (T+2/T+3)' | 'High Volatility';
  description: string;
}

export interface CountryHistoricalProfile {
  name: string;
  currencySymbol: string;
  defaultInflation: number;
  bucket1: {
    nominalReturnMean: number;
    stdDev: number;
    role: string;
    instruments: InstrumentRecommendation[];
  };
  bucket2: {
    nominalReturnMean: number;
    stdDev: number;
    role: string;
    instruments: InstrumentRecommendation[];
  };
  bucket3: {
    nominalReturnMean: number;
    stdDev: number;
    role: string;
    instruments: InstrumentRecommendation[];
  };
}

export const COUNTRY_PROFILES: Record<SupportedCountry, CountryHistoricalProfile> = {
  IN: {
    name: 'India',
    currencySymbol: '₹',
    defaultInflation: 6.0,
    bucket1: {
      nominalReturnMean: 5.75,
      stdDev: 0.85,
      role: 'Zero volatility, guarantees 1-3 years living expenses without touching equities.',
      instruments: [
        {
          name: 'Liquid & Ultra-Short Debt Funds',
          category: 'Mutual Funds',
          riskLevel: 'Ultra-Low',
          expectedReturn: 6.2,
          volatility: 0.7,
          liquidity: 'Instant (T+0/T+1)',
          description: 'T-bill and AAA commercial paper portfolios with minimal duration risk.',
        },
        {
          name: 'Fixed Deposits (FDs) / Sweep Accounts',
          category: 'Banking',
          riskLevel: 'Ultra-Low',
          expectedReturn: 6.8,
          volatility: 0.1,
          liquidity: 'Instant (T+0/T+1)',
          description: 'Sovereign/DICGC insured bank deposits laddered across 1–3 years.',
        },
        {
          name: '91-Day / 182-Day Treasury Bills',
          category: 'Sovereign Debt',
          riskLevel: 'Ultra-Low',
          expectedReturn: 6.5,
          volatility: 0.3,
          liquidity: 'Instant (T+0/T+1)',
          description: 'Zero credit risk backed directly by the Reserve Bank of India.',
        },
      ],
    },
    bucket2: {
      nominalReturnMean: 7.8,
      stdDev: 4.2,
      role: 'Low-to-moderate risk shock absorber; refills Bucket 1 during equity bear markets.',
      instruments: [
        {
          name: 'Banking & PSU Debt / Corporate Bond Funds',
          category: 'Debt Mutual Funds',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 7.6,
          volatility: 3.5,
          liquidity: 'Medium (T+2/T+3)',
          description: 'High credit quality portfolio generating predictable accrual yields.',
        },
        {
          name: 'Target Maturity Bond ETFs (SDLs / Bharat Bond)',
          category: 'Fixed Income ETFs',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 7.4,
          volatility: 3.8,
          liquidity: 'Medium (T+2/T+3)',
          description: 'State Development Loans & AAA PSU bonds matching cash flow horizons.',
        },
        {
          name: 'Conservative Hybrid / Multi-Asset Allocation Funds',
          category: 'Hybrid Funds',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 9.2,
          volatility: 5.5,
          liquidity: 'Medium (T+2/T+3)',
          description: '75% debt, 15% equity, 10% gold providing robust capital preservation.',
        },
      ],
    },
    bucket3: {
      nominalReturnMean: 12.5,
      stdDev: 16.0,
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
          name: 'Active Flexi-Cap & Large/Mid-Cap Funds',
          category: 'Active Equity',
          riskLevel: 'High Growth',
          expectedReturn: 13.5,
          volatility: 16.8,
          liquidity: 'High Volatility',
          description: 'Dynamic compounding across blue-chips and emerging growth sectors.',
        },
      ],
    },
  },

  US: {
    name: 'United States',
    currencySymbol: '$',
    defaultInflation: 2.8,
    bucket1: {
      nominalReturnMean: 3.2,
      stdDev: 0.9,
      role: 'Ultra-safe USD cash reserves covering years 1-3 living expenses.',
      instruments: [
        {
          name: 'US Treasury Bills (1-3 Month T-Bills / Bil ETF)',
          category: 'US Treasuries',
          riskLevel: 'Ultra-Low',
          expectedReturn: 3.4,
          volatility: 0.4,
          liquidity: 'Instant (T+0/T+1)',
          description: 'Backed by the full faith and credit of the US Government.',
        },
        {
          name: 'High-Yield Savings & Money Market Funds (VMFXX)',
          category: 'Cash Equivalents',
          riskLevel: 'Ultra-Low',
          expectedReturn: 3.5,
          volatility: 0.2,
          liquidity: 'Instant (T+0/T+1)',
          description: 'FDIC/SIPC insured liquid capital for continuous withdrawal.',
        },
      ],
    },
    bucket2: {
      nominalReturnMean: 4.8,
      stdDev: 5.2,
      role: 'US Aggregate Bonds & Intermediate Treasuries shielding against equity drawdowns.',
      instruments: [
        {
          name: 'US Aggregate Bond Index (BND / AGG)',
          category: 'Total Bond Market',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 4.6,
          volatility: 5.0,
          liquidity: 'Medium (T+2/T+3)',
          description: 'Broad mix of investment-grade corporate and US government bonds.',
        },
        {
          name: 'TIPS (Treasury Inflation-Protected Securities / TIP)',
          category: 'Inflation Hedged',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 4.2,
          volatility: 5.4,
          liquidity: 'Medium (T+2/T+3)',
          description: 'Principal adjusts directly with US Consumer Price Index (CPI).',
        },
      ],
    },
    bucket3: {
      nominalReturnMean: 10.2,
      stdDev: 15.5,
      role: 'US equity market powerhouses generating long-term real capital expansion.',
      instruments: [
        {
          name: 'S&P 500 Index ETF (VOO / SPY)',
          category: 'US Large Cap',
          riskLevel: 'High Growth',
          expectedReturn: 10.2,
          volatility: 15.2,
          liquidity: 'High Volatility',
          description: 'The 500 largest publicly traded American corporations.',
        },
        {
          name: 'Total US Stock Market Index (VTI)',
          category: 'Broad Market US',
          riskLevel: 'High Growth',
          expectedReturn: 10.4,
          volatility: 15.8,
          liquidity: 'High Volatility',
          description: 'Comprehensive exposure across large, mid, and small cap US equities.',
        },
      ],
    },
  },

  UK: {
    name: 'United Kingdom',
    currencySymbol: '£',
    defaultInflation: 3.2,
    bucket1: {
      nominalReturnMean: 3.0,
      stdDev: 0.9,
      role: 'Sterling cash reserves and UK Treasury gilts for immediate living requirements.',
      instruments: [
        {
          name: 'UK Short-Term Gilts (0-1yr T-Bills)',
          category: 'Sovereign Gilts',
          riskLevel: 'Ultra-Low',
          expectedReturn: 3.2,
          volatility: 0.5,
          liquidity: 'Instant (T+0/T+1)',
          description: 'UK HM Treasury backed short-dated debt notes.',
        },
        {
          name: 'Sterling Money Market Funds',
          category: 'Cash',
          riskLevel: 'Ultra-Low',
          expectedReturn: 3.4,
          volatility: 0.2,
          liquidity: 'Instant (T+0/T+1)',
          description: 'Institutional quality overnight sterling liquidity.',
        },
      ],
    },
    bucket2: {
      nominalReturnMean: 4.2,
      stdDev: 5.8,
      role: 'UK Gilt index & investment grade corporate bonds stabilizing income.',
      instruments: [
        {
          name: 'iShares Core UK Gilts (IGLT)',
          category: 'UK Gilts',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 4.1,
          volatility: 5.6,
          liquidity: 'Medium (T+2/T+3)',
          description: 'Diversified portfolio of intermediate British Government bonds.',
        },
        {
          name: 'Sterling Corporate Bond Fund (SLXX)',
          category: 'Corporate Debt',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 5.0,
          volatility: 6.2,
          liquidity: 'Medium (T+2/T+3)',
          description: 'Accrual yields from high-grade UK corporate borrowers.',
        },
      ],
    },
    bucket3: {
      nominalReturnMean: 8.5,
      stdDev: 14.5,
      role: 'UK and Global equity compounders outrunning domestic inflation.',
      instruments: [
        {
          name: 'FTSE All-Share / FTSE 100 Index ETF (ISF / VMID)',
          category: 'UK Equities',
          riskLevel: 'High Growth',
          expectedReturn: 8.2,
          volatility: 14.2,
          liquidity: 'High Volatility',
          description: 'London Stock Exchange blue chips with high dividend yields.',
        },
      ],
    },
  },

  EU: {
    name: 'Eurozone',
    currencySymbol: '€',
    defaultInflation: 2.5,
    bucket1: {
      nominalReturnMean: 2.4,
      stdDev: 0.7,
      role: 'Euro short debt and bank deposits providing zero-fluctuation security.',
      instruments: [
        {
          name: 'Euro Overnight Rate (ESTR) / Cash UCITS ETF',
          category: 'Euro Liquidity',
          riskLevel: 'Ultra-Low',
          expectedReturn: 2.5,
          volatility: 0.3,
          liquidity: 'Instant (T+0/T+1)',
          description: 'ECB policy rate matching institutional cash reserves.',
        },
      ],
    },
    bucket2: {
      nominalReturnMean: 3.8,
      stdDev: 4.8,
      role: 'Eurozone Sovereign (Bunds/OATs) & investment grade bonds.',
      instruments: [
        {
          name: 'Euro Government Bond 3-7yr (IBGM)',
          category: 'Euro Sovereign',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 3.6,
          volatility: 4.6,
          liquidity: 'Medium (T+2/T+3)',
          description: 'Sovereign bonds from Germany, France, Netherlands.',
        },
      ],
    },
    bucket3: {
      nominalReturnMean: 8.8,
      stdDev: 16.2,
      role: 'Euro Stoxx 50 & pan-European growth champions.',
      instruments: [
        {
          name: 'Euro Stoxx 50 / MSCI Europe ETF',
          category: 'European Equities',
          riskLevel: 'High Growth',
          expectedReturn: 8.8,
          volatility: 16.0,
          liquidity: 'High Volatility',
          description: 'Top European multinational leaders across industrial and tech sectors.',
        },
      ],
    },
  },
};

/**
 * Computes the blended return and standard deviation when Bucket 3 has
 * a foreign equity allocation (e.g. 30% US S&P 500 inside an Indian portfolio).
 */
export function calculateBlendedBucket3(
  baseCountry: SupportedCountry,
  foreignCountry: SupportedCountry,
  foreignAllocationPct: number
): { blendedReturn: number; blendedStdDev: number } {
  const baseB3 = COUNTRY_PROFILES[baseCountry].bucket3;
  const foreignB3 = COUNTRY_PROFILES[foreignCountry].bucket3;

  if (foreignAllocationPct <= 0 || baseCountry === foreignCountry) {
    return {
      blendedReturn: baseB3.nominalReturnMean,
      blendedStdDev: baseB3.stdDev,
    };
  }

  const wFor = Math.min(0.5, Math.max(0, foreignAllocationPct / 100));
  const wBase = 1 - wFor;

  // Expected currency drift / depreciation premium between emerging vs developed currencies
  let currencyAdjustment = 0;
  if (baseCountry === 'IN' && (foreignCountry === 'US' || foreignCountry === 'EU' || foreignCountry === 'UK')) {
    // Historical INR depreciation vs USD/EUR ~ 3.0% p.a. boosts nominal INR return
    currencyAdjustment = 2.75;
  } else if ((baseCountry === 'US' || baseCountry === 'EU') && foreignCountry === 'IN') {
    currencyAdjustment = -2.75;
  }

  const adjustedForeignReturn = foreignB3.nominalReturnMean + currencyAdjustment;

  // Blended Expected Return
  const blendedReturn = Number((wBase * baseB3.nominalReturnMean + wFor * adjustedForeignReturn).toFixed(2));

  // Blended Portfolio Volatility with cross-market correlation rho ~ 0.42
  const rho = 0.42;
  const varBase = Math.pow(baseB3.stdDev, 2);
  const varFor = Math.pow(foreignB3.stdDev, 2);
  const blendedVariance =
    Math.pow(wBase, 2) * varBase +
    Math.pow(wFor, 2) * varFor +
    2 * wBase * wFor * rho * baseB3.stdDev * foreignB3.stdDev;

  const blendedStdDev = Number(Math.sqrt(Math.max(1, blendedVariance)).toFixed(2));

  return { blendedReturn, blendedStdDev };
}
