import { HISTORICAL_BENCHMARKS } from './historicalData';
import { SimulationInputs, YearSimulationResult } from './types';

export function calculateInitialSplit(inputs: SimulationInputs) {
  const annualExpense = inputs.monthlyWithdrawal * 12;
  const targetB1 = annualExpense * inputs.bucket1Years;
  const targetB2 = annualExpense * inputs.bucket2Years;

  let b1 = 0;
  let b2 = 0;
  let b3 = 0;

  if (inputs.initialCorpus <= targetB1) {
    b1 = inputs.initialCorpus;
    b2 = 0;
    b3 = 0;
  } else if (inputs.initialCorpus <= targetB1 + targetB2) {
    b1 = targetB1;
    b2 = inputs.initialCorpus - targetB1;
    b3 = 0;
  } else {
    b1 = targetB1;
    b2 = targetB2;
    b3 = inputs.initialCorpus - (targetB1 + targetB2);
  }

  return {
    bucket1: Math.round(b1),
    bucket2: Math.round(b2),
    bucket3: Math.round(b3),
    targetB1: Math.round(targetB1),
    targetB2: Math.round(targetB2),
  };
}

export function parseStartCalendarYear(dateStr: string): number {
  if (!dateStr) return new Date().getFullYear();
  // Check DD/MM/YYYY
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      const yr = parseInt(parts[2], 10);
      if (!isNaN(yr)) return yr;
    }
  }
  // Check YYYY-MM-DD
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const yr = parseInt(parts[0], 10);
      if (!isNaN(yr)) return yr;
    }
  }
  return new Date().getFullYear();
}

export function runDeterministicSimulation(
  inputs: SimulationInputs,
  customReturns?: { b1: number; b2: number; b3: number }[]
): YearSimulationResult[] {
  const initialSplit = calculateInitialSplit(inputs);
  let b1 = initialSplit.bucket1;
  let b2 = initialSplit.bucket2;
  let b3 = initialSplit.bucket3;

  const startYear = parseStartCalendarYear(inputs.startDate);
  const inflationDec = inputs.inflationRate / 100;

  const results: YearSimulationResult[] = [];
  let isDepleted = false;

  for (let year = 1; year <= 30; year++) {
    const calendarYear = startYear + year - 1;

    // Withdrawal amount for year t (adjusted for cumulative inflation)
    const withdrawalAmount = inputs.monthlyWithdrawal * 12 * Math.pow(1 + inflationDec, year - 1);

    if (isDepleted || b1 + b2 + b3 <= 0) {
      isDepleted = true;
      results.push({
        year,
        calendarYear,
        bucket1: 0,
        bucket2: 0,
        bucket3: 0,
        totalCorpus: 0,
        withdrawalAmount,
        bucket1RefilledFromB2: 0,
        bucket2RefilledFromB3: 0,
        isDepleted: true,
        marketReturnB3: 0,
      });
      continue;
    }

    // Step 1: Debit living expenses from Bucket 1
    let needed = withdrawalAmount;
    let b1Paid = Math.min(b1, needed);
    b1 -= b1Paid;
    needed -= b1Paid;

    if (needed > 0) {
      const b2Paid = Math.min(b2, needed);
      b2 -= b2Paid;
      needed -= b2Paid;
    }

    if (needed > 0) {
      const b3Paid = Math.min(b3, needed);
      b3 -= b3Paid;
      needed -= b3Paid;
    }

    if (needed > 0) {
      // Entire portfolio was exhausted by withdrawal
      isDepleted = true;
      b1 = 0;
      b2 = 0;
      b3 = 0;
    }

    // Step 2: Growth during the year
    let r1 = 0;
    let r2 = 0;
    let r3 = 0;

    if (customReturns && customReturns[year - 1]) {
      r1 = customReturns[year - 1].b1;
      r2 = customReturns[year - 1].b2;
      r3 = customReturns[year - 1].b3;
    } else if (inputs.mode === 'manual') {
      r1 = inputs.manualReturns.bucket1 / 100;
      r2 = inputs.manualReturns.bucket2 / 100;
      r3 = inputs.manualReturns.bucket3 / 100;
    } else {
      r1 = HISTORICAL_BENCHMARKS.bucket1.nominalReturnMean / 100;
      r2 = HISTORICAL_BENCHMARKS.bucket2.nominalReturnMean / 100;
      r3 = HISTORICAL_BENCHMARKS.bucket3.nominalReturnMean / 100;
    }

    b1 *= 1 + r1;
    b2 *= 1 + r2;
    b3 *= 1 + r3;

    // Step 3: Waterfall Refill Mechanics
    const nextYearExpense = withdrawalAmount * (1 + inflationDec);
    const targetB1 = nextYearExpense * inputs.bucket1Years;
    const targetB2 = nextYearExpense * inputs.bucket2Years;

    let b1Refill = 0;
    let b2Refill = 0;

    // Refill Bucket 1 from Bucket 2 if below target
    if (b1 < targetB1 && b2 > 0) {
      const deficit = targetB1 - b1;
      b1Refill = Math.min(b2, deficit);
      b2 -= b1Refill;
      b1 += b1Refill;
    }

    // Refill Bucket 2 from Bucket 3 if below target AND Bucket 3 has positive or neutral performance
    if (b2 < targetB2 && b3 > 0) {
      const deficit = targetB2 - b2;
      // Sequence-of-returns protection: if market had a steep negative return (r3 < 0),
      // we avoid panic-selling Bucket 3 equities, unless Bucket 2 is critically exhausted (< 1 yr).
      const allowEquityHarvest = r3 >= 0 || b2 < nextYearExpense;
      if (allowEquityHarvest) {
        b2Refill = Math.min(b3, deficit);
        b3 -= b2Refill;
        b2 += b2Refill;
      }
    }

    const total = Math.max(0, b1 + b2 + b3);
    if (total <= 0) {
      isDepleted = true;
    }

    results.push({
      year,
      calendarYear,
      bucket1: Math.round(b1),
      bucket2: Math.round(b2),
      bucket3: Math.round(b3),
      totalCorpus: Math.round(total),
      withdrawalAmount: Math.round(withdrawalAmount),
      bucket1RefilledFromB2: Math.round(b1Refill),
      bucket2RefilledFromB3: Math.round(b2Refill),
      isDepleted,
      marketReturnB3: Number((r3 * 100).toFixed(2)),
    });
  }

  return results;
}
