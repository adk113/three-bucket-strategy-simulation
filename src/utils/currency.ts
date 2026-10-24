export type SupportedCountry = 'US' | 'IN' | 'UK' | 'EU';

export interface CountryMeta {
  code: SupportedCountry;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  flag: string;
  defaultInflation: number;
  defaultCorpus: number;
  defaultWithdrawal: number;
}

export const COUNTRY_METAS: Record<SupportedCountry, CountryMeta> = {
  IN: {
    code: 'IN',
    name: 'India',
    currencyCode: 'INR',
    currencySymbol: '₹',
    flag: '🇮🇳',
    defaultInflation: 6.0,
    defaultCorpus: 20000000, // 2 Cr
    defaultWithdrawal: 65000,
  },
  US: {
    code: 'US',
    name: 'United States',
    currencyCode: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
    defaultInflation: 2.8,
    defaultCorpus: 1500000, // $1.5M
    defaultWithdrawal: 5500,
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    currencyCode: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
    defaultInflation: 3.2,
    defaultCorpus: 1200000, // £1.2M
    defaultWithdrawal: 4500,
  },
  EU: {
    code: 'EU',
    name: 'Eurozone',
    currencyCode: 'EUR',
    currencySymbol: '€',
    flag: '🇪🇺',
    defaultInflation: 2.5,
    defaultCorpus: 1300000, // €1.3M
    defaultWithdrawal: 4800,
  },
};

export function formatCurrency(amount: number | undefined | null, country: SupportedCountry = 'IN'): string {
  const meta = COUNTRY_METAS[country] || COUNTRY_METAS.IN;
  const sym = meta.currencySymbol;

  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${sym}0`;
  }

  const safeAmount = Math.max(0, amount);

  if (country === 'IN') {
    if (safeAmount >= 10000000) {
      return `${sym}${(safeAmount / 10000000).toFixed(2)} Cr`;
    }
    if (safeAmount >= 100000) {
      return `${sym}${(safeAmount / 100000).toFixed(2)} L`;
    }
    return `${sym}${Math.round(safeAmount).toLocaleString('en-IN')}`;
  }

  // Western currencies (USD, GBP, EUR)
  if (safeAmount >= 1000000) {
    return `${sym}${(safeAmount / 1000000).toFixed(2)}M`;
  }
  if (safeAmount >= 1000) {
    return `${sym}${(safeAmount / 1000).toFixed(1)}k`;
  }
  return `${sym}${Math.round(safeAmount).toLocaleString()}`;
}

export function formatShortAxis(amount: number | undefined | null, country: SupportedCountry = 'IN'): string {
  const meta = COUNTRY_METAS[country] || COUNTRY_METAS.IN;
  const sym = meta.currencySymbol;

  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${sym}0`;
  }

  const safeAmount = Math.max(0, amount);

  if (country === 'IN') {
    if (safeAmount >= 10000000) return `${sym}${(safeAmount / 10000000).toFixed(1)}Cr`;
    if (safeAmount >= 100000) return `${sym}${(safeAmount / 100000).toFixed(0)}L`;
    return `${sym}${Math.round(safeAmount / 1000)}k`;
  }

  if (safeAmount >= 1000000) return `${sym}${(safeAmount / 1000000).toFixed(1)}M`;
  if (safeAmount >= 1000) return `${sym}${(safeAmount / 1000).toFixed(0)}k`;
  return `${sym}${Math.round(safeAmount)}`;
}
