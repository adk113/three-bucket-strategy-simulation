import { SupportedCountry } from '../utils/currency';
import { CrossBorderEquityAllocation } from './types';

export interface InstrumentRecommendation {
  name: string;
  category: string;
  taxStructure: string;
  riskLevel: 'Ultra-Low' | 'Low-to-Moderate' | 'High Growth';
  expectedReturn: number;
  volatility: number;
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
      role: 'Zero volatility cash equivalents guaranteeing 1-3 years of living liquidity.',
      instruments: [
        {
          name: 'Liquid & Overnight Mutual Funds',
          category: 'Mutual Funds',
          taxStructure: 'Taxed at slab rate upon withdrawal',
          riskLevel: 'Ultra-Low',
          expectedReturn: 6.2,
          volatility: 0.7,
          liquidity: 'Instant (T+0/T+1)',
          description: 'Sovereign T-bills and AAA commercial paper with minimal interest rate sensitivity.',
        },
        {
          name: 'Fixed Deposits (FDs) & Auto-Sweep Accounts',
          category: 'Banking',
          taxStructure: 'TDS applicable; interest taxed per slab',
          riskLevel: 'Ultra-Low',
          expectedReturn: 6.8,
          volatility: 0.1,
          liquidity: 'Instant (T+0/T+1)',
          description: 'Scheduled multi-bank fixed deposit ladders insured up to ₹5 Lakh under DICGC.',
        },
        {
          name: '91-Day / 182-Day Sovereign Treasury Bills',
          category: 'RBI Retail Direct',
          taxStructure: 'Capital gains taxed at marginal income tax slab',
          riskLevel: 'Ultra-Low',
          expectedReturn: 6.5,
          volatility: 0.3,
          liquidity: 'Instant (T+0/T+1)',
          description: 'Zero credit risk instruments backed directly by the Reserve Bank of India.',
        },
      ],
    },
    bucket2: {
      nominalReturnMean: 7.8,
      stdDev: 4.2,
      role: 'Moderate risk fixed income buffer; shields against equity bear market fire-sales.',
      instruments: [
        {
          name: 'Banking & PSU Debt / Corporate Bond Funds',
          category: 'Debt Mutual Funds',
          taxStructure: 'Marginal income tax slab rate',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 7.6,
          volatility: 3.5,
          liquidity: 'Medium (T+2/T+3)',
          description: 'Portfolios composed of high credit quality (AAA) public sector undertakings.',
        },
        {
          name: 'Target Maturity Bond ETFs (SDLs / Bharat Bond)',
          category: 'Fixed Income ETFs',
          taxStructure: 'Debt fund taxation at slab rate',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 7.4,
          volatility: 3.8,
          liquidity: 'Medium (T+2/T+3)',
          description: 'State Development Loans (SDLs) and AAA PSU bonds matching cash flow milestones.',
        },
        {
          name: 'Senior Citizens Savings Scheme (SCSS) & PPF',
          category: 'Govt Small Savings',
          taxStructure: 'PPF: EEE exempt; SCSS: Taxable under 80C',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 8.2,
          volatility: 0.0,
          liquidity: 'Medium (T+2/T+3)',
          description: 'Government backed annuity and quarterly interest income programs.',
        },
      ],
    },
    bucket3: {
      nominalReturnMean: 12.5,
      stdDev: 16.0,
      role: 'Long-term equity engine designed to outstrip inflation over 10-80 year horizons.',
      instruments: [
        {
          name: 'Nifty 50 / Nifty 500 Index Funds',
          category: 'Broad Market Equity',
          taxStructure: 'LTCG: 12.5% over ₹1.25 Lakh/yr',
          riskLevel: 'High Growth',
          expectedReturn: 12.5,
          volatility: 15.2,
          liquidity: 'High Volatility',
          description: 'India top-tier compounding powerhouses representing leading enterprises.',
        },
        {
          name: 'Active Multi-Cap & Flexi-Cap Funds',
          category: 'Diversified Equity',
          taxStructure: 'LTCG: 12.5% over exemption limit',
          riskLevel: 'High Growth',
          expectedReturn: 13.8,
          volatility: 16.8,
          liquidity: 'High Volatility',
          description: 'Dynamic compounding across blue-chips, mid-cap leaders, and emerging champions.',
        },
        {
          name: 'National Pension System (NPS - Tier 1 & 2)',
          category: 'Pension Architecture',
          taxStructure: '60% tax-free lump sum; 40% annuity',
          riskLevel: 'High Growth',
          expectedReturn: 11.5,
          volatility: 13.5,
          liquidity: 'High Volatility',
          description: 'Low expense institutional equity compounding with dedicated tax benefits.',
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
          name: 'US Treasury Bills (1-3 Month T-Bills / BIL ETF)',
          category: 'US Treasuries',
          taxStructure: 'Exempt from state/local taxes; federal taxable',
          riskLevel: 'Ultra-Low',
          expectedReturn: 3.4,
          volatility: 0.4,
          liquidity: 'Instant (T+0/T+1)',
          description: 'Backed by the full faith and credit of the United States Government.',
        },
        {
          name: 'High-Yield Savings & Money Market Funds (VMFXX)',
          category: 'Cash Equivalents',
          taxStructure: 'Taxable as ordinary income',
          riskLevel: 'Ultra-Low',
          expectedReturn: 3.5,
          volatility: 0.2,
          liquidity: 'Instant (T+0/T+1)',
          description: 'FDIC/SIPC insured capital ensuring continuous liquidity without capital loss.',
        },
      ],
    },
    bucket2: {
      nominalReturnMean: 4.8,
      stdDev: 5.2,
      role: 'US Aggregate Bonds & TIPS absorbing equity drawdowns.',
      instruments: [
        {
          name: 'US Aggregate Bond Index ETF (BND / AGG)',
          category: 'Total Bond Market',
          taxStructure: 'Taxable account: ordinary income; 401k/IRA: deferred',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 4.6,
          volatility: 5.0,
          liquidity: 'Medium (T+2/T+3)',
          description: 'Diversified intermediate mix of US Treasuries and high-grade corporate bonds.',
        },
        {
          name: 'TIPS (Treasury Inflation-Protected Securities / TIP)',
          category: 'Inflation Hedged',
          taxStructure: 'Principal adjustments federally taxable',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 4.2,
          volatility: 5.4,
          liquidity: 'Medium (T+2/T+3)',
          description: 'Principal adjusts directly with US Consumer Price Index (CPI) increases.',
        },
      ],
    },
    bucket3: {
      nominalReturnMean: 10.2,
      stdDev: 15.5,
      role: 'US broad-market equity engines driving long-term wealth compound.',
      instruments: [
        {
          name: 'S&P 500 Index ETF (VOO / SPY) & Roth IRA',
          category: 'US Large Cap',
          taxStructure: 'Taxable: 15-20% LTCG; Roth IRA: 100% tax-free',
          riskLevel: 'High Growth',
          expectedReturn: 10.2,
          volatility: 15.2,
          liquidity: 'High Volatility',
          description: 'The 500 preeminent publicly traded American enterprises.',
        },
        {
          name: 'Total US Stock Market Index (VTI / 401k)',
          category: 'Broad Market US',
          taxStructure: 'Tax-deferred growth inside 401(k) / Traditional IRA',
          riskLevel: 'High Growth',
          expectedReturn: 10.4,
          volatility: 15.8,
          liquidity: 'High Volatility',
          description: 'Comprehensive cross-cap exposure across large, mid, and small compounders.',
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
      role: 'Sterling cash reserves and UK Treasury gilts for immediate living costs.',
      instruments: [
        {
          name: 'UK Short-Term Gilts (0-1yr T-Bills)',
          category: 'Sovereign Gilts',
          taxStructure: 'Capital gains on UK Gilts are 100% tax-free',
          riskLevel: 'Ultra-Low',
          expectedReturn: 3.2,
          volatility: 0.5,
          liquidity: 'Instant (T+0/T+1)',
          description: 'HM Treasury backed short-dated sovereign notes.',
        },
        {
          name: 'Cash ISA (Stocks & Shares Cash Reserve)',
          category: 'ISA Structure',
          taxStructure: '100% tax-free interest and withdrawals',
          riskLevel: 'Ultra-Low',
          expectedReturn: 3.4,
          volatility: 0.2,
          liquidity: 'Instant (T+0/T+1)',
          description: 'UK individual savings account with zero capital gains or income tax.',
        },
      ],
    },
    bucket2: {
      nominalReturnMean: 4.2,
      stdDev: 5.8,
      role: 'UK Gilt index & investment grade corporate bonds stabilizing cash flow.',
      instruments: [
        {
          name: 'iShares Core UK Gilts UCITS ETF (IGLT)',
          category: 'UK Gilts',
          taxStructure: 'Tax-exempt inside ISA/SIPP',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 4.1,
          volatility: 5.6,
          liquidity: 'Medium (T+2/T+3)',
          description: 'Intermediate British government bond portfolio.',
        },
        {
          name: 'Sterling Corporate Bond Index (SLXX)',
          category: 'Corporate Debt',
          taxStructure: 'Tax-exempt inside ISA/SIPP',
          riskLevel: 'Low-to-Moderate',
          expectedReturn: 5.0,
          volatility: 6.2,
          liquidity: 'Medium (T+2/T+3)',
          description: 'High credit quality UK corporate bond issuance.',
        },
      ],
    },
    bucket3: {
      nominalReturnMean: 8.5,
      stdDev: 14.5,
      role: 'UK and Global equity compounders outperforming domestic inflation.',
      instruments: [
        {
          name: 'FTSE All-Share / FTSE 100 Index (ISF / Stocks ISA)',
          category: 'UK Equities',
          taxStructure: '100% tax-free inside Stocks & Shares ISA',
          riskLevel: 'High Growth',
          expectedReturn: 8.2,
          volatility: 14.2,
          liquidity: 'High Volatility',
          description: 'London blue-chip multinational dividends and global cash flows.',
        },
        {
          name: 'SIPP (Self-Invested Personal Pension - Global Index)',
          category: 'UK Pension',
          taxStructure: '25% tax-free lump sum; remainder taxed as income',
          riskLevel: 'High Growth',
          expectedReturn: 9.0,
          volatility: 15.0,
          liquidity: 'High Volatility',
          description: 'Global equity index portfolio with UK government tax-relief top-ups.',
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
          taxStructure: 'Taxed per local residency (e.g. flat tax / PFU)',
          riskLevel: 'Ultra-Low',
          expectedReturn: 2.5,
          volatility: 0.3,
          liquidity: 'Instant (T+0/T+1)',
          description: 'Matches the European Central Bank (ECB) deposit rate.',
        },
      ],
    },
    bucket2: {
      nominalReturnMean: 3.8,
      stdDev: 4.8,
      role: 'Eurozone Sovereign (Bunds/OATs) & investment grade corporate bonds.',
      instruments: [
        {
          name: 'Euro Government Bond 3-7yr UCITS ETF (IBGM)',
          category: 'Euro Sovereign',
          taxStructure: 'Tax-deferred inside PEA / insurance wrapper',
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
      role: 'Euro Stoxx 50 & Pan-European growth champions.',
      instruments: [
        {
          name: 'Euro Stoxx 50 / MSCI Europe UCITS ETF (PEA eligible)',
          category: 'European Equities',
          taxStructure: 'Exempt from capital gains tax inside French PEA after 5 yrs',
          riskLevel: 'High Growth',
          expectedReturn: 8.8,
          volatility: 16.0,
          liquidity: 'High Volatility',
          description: 'Top European industrial, healthcare, and technology multinational compounders.',
        },
      ],
    },
  },
};

// Cross-market pairwise correlation matrix
const CORRELATION_MATRIX: Record<SupportedCountry, Record<SupportedCountry, number>> = {
  IN: { IN: 1.0, US: 0.42, UK: 0.40, EU: 0.38 },
  US: { IN: 0.42, US: 1.0, UK: 0.74, EU: 0.72 },
  UK: { IN: 0.40, US: 0.74, UK: 1.0, EU: 0.78 },
  EU: { IN: 0.38, US: 0.72, UK: 0.78, EU: 1.0 },
};

/**
 * Computes multi-asset blended expected return and portfolio volatility
 * using the full N x N covariance matrix with currency drift adjustments.
 */
export function calculateMultiAssetBlendedB3(
  baseCountry: SupportedCountry,
  allocations: CrossBorderEquityAllocation[]
): { blendedReturn: number; blendedStdDev: number } {
  if (!allocations || allocations.length === 0) {
    const baseB3 = COUNTRY_PROFILES[baseCountry].bucket3;
    return { blendedReturn: baseB3.nominalReturnMean, blendedStdDev: baseB3.stdDev };
  }

  // Normalize weights so they sum to 1.0
  const totalWeight = allocations.reduce((acc, cur) => acc + cur.weight, 0);
  if (totalWeight <= 0) {
    const baseB3 = COUNTRY_PROFILES[baseCountry].bucket3;
    return { blendedReturn: baseB3.nominalReturnMean, blendedStdDev: baseB3.stdDev };
  }

  const normalized = allocations.map((a) => ({
    ...a,
    normWeight: a.weight / totalWeight,
    mean: a.isManual && a.customReturn !== undefined
      ? a.customReturn
      : COUNTRY_PROFILES[a.country].bucket3.nominalReturnMean,
    stdDev: a.isManual && a.customStdDev !== undefined
      ? a.customStdDev
      : COUNTRY_PROFILES[a.country].bucket3.stdDev,
  }));

  // Blended Expected Return (incorporating currency parity adjustment relative to baseCountry)
  let blendedReturn = 0;
  for (const item of normalized) {
    let currencyDrift = 0;
    if (baseCountry === 'IN' && item.country !== 'IN') {
      currencyDrift = 2.75; // historical INR depreciation vs USD/GBP/EUR
    } else if (baseCountry !== 'IN' && item.country === 'IN') {
      currencyDrift = -2.75;
    }
    blendedReturn += item.normWeight * (item.mean + currencyDrift);
  }

  // Blended Volatility via N x N covariance matrix
  let blendedVariance = 0;
  for (let i = 0; i < normalized.length; i++) {
    for (let j = 0; j < normalized.length; j++) {
      const a = normalized[i];
      const b = normalized[j];
      const rho = CORRELATION_MATRIX[a.country]?.[b.country] ?? 0.5;
      const cov = a.stdDev * b.stdDev * rho;
      blendedVariance += a.normWeight * b.normWeight * cov;
    }
  }

  const blendedStdDev = Number(Math.sqrt(Math.max(1, blendedVariance)).toFixed(2));
  return {
    blendedReturn: Number(blendedReturn.toFixed(2)),
    blendedStdDev,
  };
}
