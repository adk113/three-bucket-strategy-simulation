import { COUNTRY_PROFILES, calculateMultiAssetBlendedB3 } from './historicalData';
import { runDeterministicSimulation } from './simulationEngine';
import { MonteCarloSummary, SimulationInputs } from './types';

// Deterministic PRNG (Mulberry32) for reproducible, stable actuarial simulations
function createMulberry32(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller normal transform driven by deterministic PRNG
function createSeededRandomNormal(prng: () => number) {
  return function (mean = 0, stdDev = 1): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = prng();
    while (v === 0) v = prng();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + stdDev * num;
  };
}

export function runMonteCarloSimulation(
  inputs: SimulationInputs,
  runs = 500
): MonteCarloSummary {
  // Deterministic seed ensures identical parameters produce identical, rock-solid success rates
  const prng = createMulberry32(133742);
  const randomNormal = createSeededRandomNormal(prng);
  const countryProfile = COUNTRY_PROFILES[inputs.baseCountry || 'IN'] || COUNTRY_PROFILES.IN;
  const blendedB3 = calculateMultiAssetBlendedB3(
    inputs.baseCountry || 'IN',
    inputs.multiCountryAllocations
  );

  const horizon = Math.max(10, Math.min(80, inputs.simulationHorizon || 30));

  const mu1 =
    inputs.mode === 'manual'
      ? inputs.manualReturns.bucket1 / 100
      : countryProfile.bucket1.nominalReturnMean / 100;
  const sigma1 = countryProfile.bucket1.stdDev / 100;

  const mu2 =
    inputs.mode === 'manual'
      ? inputs.manualReturns.bucket2 / 100
      : countryProfile.bucket2.nominalReturnMean / 100;
  const sigma2 = countryProfile.bucket2.stdDev / 100;

  const mu3 =
    inputs.mode === 'manual'
      ? inputs.manualReturns.bucket3 / 100
      : blendedB3.blendedReturn / 100;
  const sigma3 = blendedB3.blendedStdDev / 100;

  // Diversification benefit compared to 100% domestic equity
  const domesticB3StdDev = countryProfile.bucket3.stdDev;
  const volReduction = Number((domesticB3StdDev - blendedB3.blendedStdDev).toFixed(2));

  const yearBalances: number[][] = Array.from({ length: horizon }, () => []);
  let survivingCount = 0;
  const depletionYears: number[] = [];

  for (let r = 0; r < runs; r++) {
    const yearlyReturns: { b1: number; b2: number; b3: number }[] = [];

    for (let yr = 0; yr < horizon; yr++) {
      const z1 = randomNormal(0, 1);
      const z2 = randomNormal(0, 1);
      const z3 = randomNormal(0, 1);

      // Mild correlation between debt and equity (~0.2)
      const corrZ2 = 0.2 * z3 + Math.sqrt(1 - 0.2 * 0.2) * z2;

      const r1 = Math.max(-0.01, mu1 + sigma1 * z1);
      const r2 = Math.max(-0.15, mu2 + sigma2 * corrZ2);
      const r3 = Math.max(-0.45, mu3 + sigma3 * z3);

      yearlyReturns.push({ b1: r1, b2: r2, b3: r3 });
    }

    const simPath = runDeterministicSimulation(inputs, yearlyReturns);

    let depletedAt: number | null = null;
    for (let yr = 0; yr < horizon; yr++) {
      const bal = simPath[yr]?.totalCorpus || 0;
      yearBalances[yr].push(bal);

      if (bal <= 0 && depletedAt === null) {
        depletedAt = yr + 1;
      }
    }

    if (depletedAt === null) {
      survivingCount++;
    } else {
      depletionYears.push(depletedAt);
    }
  }

  const medianTrajectory: number[] = [];
  const p10Trajectory: number[] = [];
  const p90Trajectory: number[] = [];

  for (let yr = 0; yr < horizon; yr++) {
    const sorted = [...yearBalances[yr]].sort((a, b) => a - b);
    const p10Index = Math.floor(runs * 0.1);
    const p50Index = Math.floor(runs * 0.5);
    const p90Index = Math.floor(runs * 0.9);

    p10Trajectory.push(Math.round(sorted[p10Index] || 0));
    medianTrajectory.push(Math.round(sorted[p50Index] || 0));
    p90Trajectory.push(Math.round(sorted[p90Index] || 0));
  }

  const successRate = Number(((survivingCount / runs) * 100).toFixed(1));
  const earliestDepletionYear =
    depletionYears.length > 0 ? Math.min(...depletionYears) : null;
  const averageDepletionYear =
    depletionYears.length > 0
      ? Number(
          (
            depletionYears.reduce((acc, cur) => acc + cur, 0) /
            depletionYears.length
          ).toFixed(1)
        )
      : null;

  return {
    successRate,
    medianBalanceTerminal: medianTrajectory[horizon - 1] || 0,
    percentile10BalanceTerminal: p10Trajectory[horizon - 1] || 0,
    percentile90BalanceTerminal: p90Trajectory[horizon - 1] || 0,
    medianTrajectory,
    p10Trajectory,
    p90Trajectory,
    earliestDepletionYear,
    averageDepletionYear,
    depletionCount: runs - survivingCount,
    totalRuns: runs,
    diversificationBenefitVolReduction: Math.max(0, volReduction),
  };
}
