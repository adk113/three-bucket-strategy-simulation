import { HISTORICAL_BENCHMARKS } from './historicalData';
import { runDeterministicSimulation } from './simulationEngine';
import { MonteCarloSummary, SimulationInputs } from './types';

// Standard normal generator (Box-Muller)
function randomNormal(mean = 0, stdDev = 1): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + stdDev * num;
}

export function runMonteCarloSimulation(
  inputs: SimulationInputs,
  runs = 500
): MonteCarloSummary {
  const mu1 =
    inputs.mode === 'manual'
      ? inputs.manualReturns.bucket1 / 100
      : HISTORICAL_BENCHMARKS.bucket1.nominalReturnMean / 100;
  const sigma1 = HISTORICAL_BENCHMARKS.bucket1.stdDev / 100;

  const mu2 =
    inputs.mode === 'manual'
      ? inputs.manualReturns.bucket2 / 100
      : HISTORICAL_BENCHMARKS.bucket2.nominalReturnMean / 100;
  const sigma2 = HISTORICAL_BENCHMARKS.bucket2.stdDev / 100;

  const mu3 =
    inputs.mode === 'manual'
      ? inputs.manualReturns.bucket3 / 100
      : HISTORICAL_BENCHMARKS.bucket3.nominalReturnMean / 100;
  const sigma3 = HISTORICAL_BENCHMARKS.bucket3.stdDev / 100;

  const yearBalances: number[][] = Array.from({ length: 30 }, () => []);
  let survivingCount = 0;
  const depletionYears: number[] = [];

  for (let r = 0; r < runs; r++) {
    // Generate 30 years of correlated stochastic returns
    const yearlyReturns: { b1: number; b2: number; b3: number }[] = [];

    for (let yr = 0; yr < 30; yr++) {
      // Independent normal shocks
      const z1 = randomNormal(0, 1);
      const z2 = randomNormal(0, 1);
      const z3 = randomNormal(0, 1);

      // Mild correlation between Bucket 2 and Bucket 3 (~0.2)
      const corrZ2 = 0.2 * z3 + Math.sqrt(1 - 0.2 * 0.2) * z2;

      const r1 = Math.max(-0.01, mu1 + sigma1 * z1);
      const r2 = Math.max(-0.15, mu2 + sigma2 * corrZ2);
      const r3 = Math.max(-0.45, mu3 + sigma3 * z3);

      yearlyReturns.push({ b1: r1, b2: r2, b3: r3 });
    }

    const simPath = runDeterministicSimulation(inputs, yearlyReturns);

    let depletedAt: number | null = null;
    for (let yr = 0; yr < 30; yr++) {
      const bal = simPath[yr].totalCorpus;
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

  // Calculate percentiles for each year
  const medianTrajectory: number[] = [];
  const p10Trajectory: number[] = [];
  const p90Trajectory: number[] = [];

  for (let yr = 0; yr < 30; yr++) {
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
    medianBalanceYear30: medianTrajectory[29] || 0,
    percentile10BalanceYear30: p10Trajectory[29] || 0,
    percentile90BalanceYear30: p90Trajectory[29] || 0,
    medianTrajectory,
    p10Trajectory,
    p90Trajectory,
    earliestDepletionYear,
    averageDepletionYear,
    depletionCount: runs - survivingCount,
    totalRuns: runs,
  };
}
