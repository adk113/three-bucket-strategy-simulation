import { COUNTRY_PROFILES, calculateMultiAssetBlendedB3 } from './historicalData';
import { SimulationInputs, YearSimulationResult } from './types';

export function calculateInitialSplit(inputs: SimulationInputs) {
  const annualExpense = inputs.monthlyWithdrawal * 12;
  const targetB1 = annualExpense * inputs.bucket1Years;
  const targetB2 = annualExpense * inputs.bucket2Years;

  let b1 = 0;
  let b2 = 0;
  let b3 = 0;

  if (inputs.targetGrowthPercent !== undefined && inputs.targetGrowthPercent > 0) {
    const targetPct = Math.min(95, Math.max(5, inputs.targetGrowthPercent));
    b3 = inputs.initialCorpus * (targetPct / 100);
    const nonEquity = Math.max(0, inputs.initialCorpus - b3);

    if (nonEquity <= targetB1) {
      b1 = nonEquity;
      b2 = 0;
    } else {
      b1 = targetB1;
      b2 = nonEquity - targetB1;
    }
  } else if (inputs.initialCorpus <= targetB1) {
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
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      const yr = parseInt(parts[2], 10);
      if (!isNaN(yr)) return yr;
    }
  }
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
  const frictionRate = (inputs.rebalancingFrictionRate || 0.15) / 100;

  // Supports up to 80 years
  const horizon = Math.max(10, Math.min(80, inputs.simulationHorizon || 30));

  const countryProfile = COUNTRY_PROFILES[inputs.baseCountry || 'IN'] || COUNTRY_PROFILES.IN;
  const blendedB3 = calculateMultiAssetBlendedB3(
    inputs.baseCountry || 'IN',
    inputs.multiCountryAllocations
  );

  const results: YearSimulationResult[] = [];
  let isDepleted = false;

  for (let year = 1; year <= horizon; year++) {
    const calendarYear = startYear + year - 1;

    // Year t indexed expense: W_t = W_0 * (1 + inflation)^(t - 1)
    const withdrawalAmount = inputs.monthlyWithdrawal * 12 * Math.pow(1 + inflationDec, year - 1);
    const realPurchasingPower = Math.round(withdrawalAmount / Math.pow(1 + inflationDec, year - 1));

    if (isDepleted || b1 + b2 + b3 <= 0) {
      isDepleted = true;
      results.push({
        year,
        calendarYear,
        bucket1: 0,
        bucket2: 0,
        bucket3: 0,
        totalCorpus: 0,
        withdrawalAmount: Math.round(withdrawalAmount),
        realPurchasingPower,
        bucket1RefilledFromB2: 0,
        bucket2RefilledFromB3: 0,
        rebalanceFrictionCost: 0,
        bearMarketDefenseActive: false,
        isDepleted: true,
        marketReturnB3: 0,
      });
      continue;
    }

    // Step 1: Debit living expense from Bucket 1
    let needed = withdrawalAmount;
    const b1Paid = Math.min(b1, needed);
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
      isDepleted = true;
      b1 = 0;
      b2 = 0;
      b3 = 0;
    }

    // Step 2: Annual growth
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
      r1 = countryProfile.bucket1.nominalReturnMean / 100;
      r2 = countryProfile.bucket2.nominalReturnMean / 100;
      r3 = blendedB3.blendedReturn / 100;
    }

    b1 *= 1 + r1;
    b2 *= 1 + r2;
    b3 *= 1 + r3;

    // Step 3: Granular Waterfall Refill Mechanics
    const nextYearExpense = withdrawalAmount * (1 + inflationDec);
    const targetB1 = nextYearExpense * inputs.bucket1Years;
    const targetB2 = nextYearExpense * inputs.bucket2Years;

    let b1Refill = 0;
    let b2Refill = 0;
    let totalFriction = 0;
    let bearMarketDefenseActive = false;

    // Refill Bucket 1 from Bucket 2 if below target floor
    if (b1 < targetB1 && b2 > 0) {
      const deficit = targetB1 - b1;
      b1Refill = Math.min(b2, deficit);
      const friction = b1Refill * frictionRate;
      totalFriction += friction;
      b2 -= b1Refill;
      b1 += b1Refill - friction;
    }

    // Refill Bucket 2 from Bucket 3 if below target
    if (b2 < targetB2 && b3 > 0) {
      const deficit = targetB2 - b2;
      const isBearMarket = r3 < 0;
      if (isBearMarket && b2 > nextYearExpense * 1.5) {
        bearMarketDefenseActive = true;
        // Bear Market Defense: Protect equities from distress liquidation
      } else {
        b2Refill = Math.min(b3, deficit);
        const friction = b2Refill * frictionRate;
        totalFriction += friction;
        b3 -= b2Refill;
        b2 += b2Refill - friction;
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
      realPurchasingPower,
      bucket1RefilledFromB2: Math.round(b1Refill),
      bucket2RefilledFromB3: Math.round(b2Refill),
      rebalanceFrictionCost: Math.round(totalFriction),
      bearMarketDefenseActive,
      isDepleted,
      marketReturnB3: Number((r3 * 100).toFixed(2)),
    });
  }

  return results;
}
