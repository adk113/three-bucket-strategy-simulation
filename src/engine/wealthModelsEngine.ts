import {
  COUNTRY_PROFILES,
  calculateMultiAssetBlendedB3,
} from './historicalData';
import { runDeterministicSimulation } from './simulationEngine';
import {
  SimulationInputs,
  HistoricalCrisisType,
  HistoricalBacktestResult,
  StressScenarioType,
  StressTestResult,
  RollingReturnsResult,
  GoalMilestone,
  GoalsBasedResult,
  ModelComparisonSummary,
  ModelComparisonItem,
  MonteCarloSummary,
  YearSimulationResult,
} from './types';

// Preset real historical crisis return sequences for Buckets 1, 2, and 3
export const HISTORICAL_CRISIS_DATA: Record<
  HistoricalCrisisType,
  {
    title: string;
    description: string;
    historicalPeriod: string;
    returns: { b1: number; b2: number; b3: number; inflation?: number }[];
  }
> = {
  '2008_gfc': {
    title: '2008 Global Financial Crisis (GFC)',
    description:
      'Subprime mortgage contagion triggered a worldwide liquidity freeze. Equities plunged over 38% in 2008 while high-quality debt surged as a safe haven before a multi-year recovery.',
    historicalPeriod: '2008 – 2013 Market Cycle',
    returns: [
      { b1: 0.065, b2: 0.12, b3: -0.375, inflation: 3.8 }, // 2008
      { b1: 0.045, b2: 0.08, b3: 0.285, inflation: -0.4 }, // 2009 rebound
      { b1: 0.048, b2: 0.075, b3: 0.165, inflation: 1.6 }, // 2010
      { b1: 0.052, b2: 0.082, b3: 0.021, inflation: 3.2 }, // 2011
      { b1: 0.055, b2: 0.078, b3: 0.162, inflation: 2.1 }, // 2012
      { b1: 0.058, b2: 0.065, b3: 0.324, inflation: 1.5 }, // 2013 bull market
    ],
  },
  '2000_dotcom': {
    title: '2000 Dot-Com Tech Crash & Recession',
    description:
      'Tech bubble collapse leading to three brutal consecutive down years in growth equities. Cash and short debt preserved essential purchasing power.',
    historicalPeriod: '2000 – 2005 Tech Burst Cycle',
    returns: [
      { b1: 0.06, b2: 0.085, b3: -0.091, inflation: 3.4 }, // 2000
      { b1: 0.052, b2: 0.082, b3: -0.119, inflation: 2.8 }, // 2001
      { b1: 0.045, b2: 0.078, b3: -0.221, inflation: 1.6 }, // 2002
      { b1: 0.048, b2: 0.068, b3: 0.287, inflation: 2.3 }, // 2003
      { b1: 0.052, b2: 0.065, b3: 0.108, inflation: 2.7 }, // 2004
      { b1: 0.055, b2: 0.062, b3: 0.049, inflation: 3.4 }, // 2005
    ],
  },
  '1973_stagflation': {
    title: '1973–1974 Great Stagflation Shock',
    description:
      'OPEC oil embargo sparked double-digit inflation alongside a deep economic recession. Rising bond yields eroded debt capital while equities suffered steep real losses.',
    historicalPeriod: '1973 – 1978 Stagflation Replay',
    returns: [
      { b1: 0.075, b2: 0.035, b3: -0.148, inflation: 8.8 }, // 1973
      { b1: 0.082, b2: 0.021, b3: -0.264, inflation: 12.2 }, // 1974
      { b1: 0.068, b2: 0.085, b3: 0.372, inflation: 9.1 }, // 1975
      { b1: 0.062, b2: 0.082, b3: 0.238, inflation: 5.8 }, // 1976
      { b1: 0.065, b2: 0.061, b3: -0.072, inflation: 6.5 }, // 1977
      { b1: 0.072, b2: 0.058, b3: 0.065, inflation: 7.6 }, // 1978
    ],
  },
  '2020_covid': {
    title: '2020 Pandemic Shock & 2022 Rate Spike',
    description:
      'Unprecedented global pandemic lockdown followed by rapid central bank stimulus, then 2022 synchronous drop in equities and bonds due to 450bps rate hikes.',
    historicalPeriod: '2020 – 2024 Modern Volatility Cycle',
    returns: [
      { b1: 0.045, b2: 0.092, b3: 0.184, inflation: 1.4 }, // 2020 (swift rebound)
      { b1: 0.04, b2: 0.055, b3: 0.246, inflation: 7.0 }, // 2021
      { b1: 0.055, b2: -0.125, b3: -0.181, inflation: 6.5 }, // 2022 (dual selloff)
      { b1: 0.068, b2: 0.075, b3: 0.242, inflation: 4.1 }, // 2023
      { b1: 0.065, b2: 0.078, b3: 0.185, inflation: 3.4 }, // 2024
    ],
  },
};

// Deterministic Macroeconomic Stress Shock Scenarios
export const STRESS_SCENARIOS_DATA: Record<
  StressScenarioType,
  {
    title: string;
    description: string;
    shockDetails: string;
    generateReturns: (
      horizon: number,
      baseB1: number,
      baseB2: number,
      baseB3: number
    ) => { b1: number; b2: number; b3: number }[];
  }
> = {
  equity_crash_30_inflation_8: {
    title: 'Macro Shock: 8% Inflation + 30% Equity Crash',
    description:
      'Simulates an acute macroeconomic stagflationary shock in Year 1 where inflation surges to 8% while equity values plunge 30%.',
    shockDetails:
      'Year 1: Equity -30%, Debt +3%, Cash +6%. Year 2: Equity -5%. Year 3–5: gradual recovery back to long-term trend.',
    generateReturns: (horizon, b1, b2, b3) => {
      const arr = [];
      for (let yr = 0; yr < horizon; yr++) {
        if (yr === 0) arr.push({ b1: 0.06, b2: 0.03, b3: -0.30 });
        else if (yr === 1) arr.push({ b1: 0.055, b2: 0.05, b3: -0.05 });
        else if (yr === 2) arr.push({ b1: 0.052, b2: 0.065, b3: 0.14 });
        else if (yr === 3) arr.push({ b1: 0.05, b2: 0.07, b3: 0.18 });
        else arr.push({ b1, b2, b3 });
      }
      return arr;
    },
  },
  stagflation_shock: {
    title: '1970s Persistent Stagflation (5-Year Drag)',
    description:
      'Simulates a protracted 5-year stagflationary cycle with elevated living expense inflation and suppressed real equity returns.',
    shockDetails:
      'Years 1–5: Inflation stays 8.5%, equities average just 2% nominal (negative real return), bonds return 5%.',
    generateReturns: (horizon, b1, b2, b3) => {
      const arr = [];
      for (let yr = 0; yr < horizon; yr++) {
        if (yr < 5) arr.push({ b1: 0.065, b2: 0.05, b3: 0.02 });
        else arr.push({ b1, b2, b3 });
      }
      return arr;
    },
  },
  dual_asset_selloff_2022: {
    title: 'Synchronous Equity & Bond Collapse',
    description:
      'A sharp interest rate tightening cycle causing negative correlation breakdown where both equities (-20%) and fixed income (-14%) crash simultaneously.',
    shockDetails:
      'Year 1: Equities -20%, Debt -14%, Cash +5%. Eliminates traditional 60/40 bond protection.',
    generateReturns: (horizon, b1, b2, b3) => {
      const arr = [];
      for (let yr = 0; yr < horizon; yr++) {
        if (yr === 0) arr.push({ b1: 0.05, b2: -0.14, b3: -0.20 });
        else if (yr === 1) arr.push({ b1: 0.055, b2: 0.04, b3: 0.08 });
        else if (yr === 2) arr.push({ b1: 0.058, b2: 0.075, b3: 0.16 });
        else arr.push({ b1, b2, b3 });
      }
      return arr;
    },
  },
  prolonged_bear_market: {
    title: 'Lost Decade (10-Year Zero Equity Growth)',
    description:
      'Simulates a secular stagnation regime similar to Japan 1990s or US 2000–2010 where equities deliver 0% nominal growth for 10 full years.',
    shockDetails:
      'Years 1–10: Equities deliver 0% returns, forcing reliance exclusively on Bucket 1 cash & Bucket 2 bond coupon yields.',
    generateReturns: (horizon, b1, b2, b3) => {
      const arr = [];
      for (let yr = 0; yr < horizon; yr++) {
        if (yr < 10) arr.push({ b1, b2, b3: 0.0 });
        else arr.push({ b1, b2, b3 });
      }
      return arr;
    },
  },
};

// Default milestones for Goals-Based Wealth Management
export const DEFAULT_GOAL_MILESTONES: GoalMilestone[] = [
  {
    id: 'm1',
    name: 'Child Higher Education / Tuition',
    targetYear: 7,
    amount: 3500000,
    bucketPriority: 2,
    category: 'education',
  },
  {
    id: 'm2',
    name: 'Family Lifestyle & Home Upgrade',
    targetYear: 14,
    amount: 2500000,
    bucketPriority: 2,
    category: 'property',
  },
  {
    id: 'm3',
    name: 'Healthcare & Longevity Care Reserve',
    targetYear: 22,
    amount: 3000000,
    bucketPriority: 1,
    category: 'healthcare',
  },
  {
    id: 'm4',
    name: 'Next-Generation Legacy Transfer',
    targetYear: 30,
    amount: 10000000,
    bucketPriority: 3,
    category: 'legacy',
  },
];

/**
 * 1. Historical Backtesting Engine
 * Winds back the clock and applies real historical crisis sequences to the 3-bucket portfolio.
 */
export function runHistoricalBacktest(
  inputs: SimulationInputs,
  crisisKey?: HistoricalCrisisType
): HistoricalBacktestResult {
  const crisis = HISTORICAL_CRISIS_DATA[crisisKey || inputs.historicalCrisis || '2008_gfc'];
  const horizon = Math.max(10, Math.min(80, inputs.simulationHorizon || 30));

  const countryProfile = COUNTRY_PROFILES[inputs.baseCountry || 'IN'] || COUNTRY_PROFILES.IN;
  const blendedB3 = calculateMultiAssetBlendedB3(
    inputs.baseCountry || 'IN',
    inputs.multiCountryAllocations
  );

  const baseB1 =
    (inputs.mode === 'manual' && inputs.manualReturns
      ? inputs.manualReturns.bucket1
      : countryProfile.bucket1.nominalReturnMean) / 100;
  const baseB2 =
    (inputs.mode === 'manual' && inputs.manualReturns
      ? inputs.manualReturns.bucket2
      : countryProfile.bucket2.nominalReturnMean) / 100;
  const baseB3 =
    (inputs.mode === 'manual' && inputs.manualReturns
      ? inputs.manualReturns.bucket3
      : blendedB3.blendedReturn) / 100;

  // Build custom returns: crisis period followed by normalized long-term trend
  const customReturns: { b1: number; b2: number; b3: number }[] = [];
  for (let yr = 0; yr < horizon; yr++) {
    if (yr < crisis.returns.length) {
      customReturns.push({
        b1: crisis.returns[yr].b1,
        b2: crisis.returns[yr].b2,
        b3: crisis.returns[yr].b3,
      });
    } else {
      customReturns.push({ b1: baseB1, b2: baseB2, b3: baseB3 });
    }
  }

  const yearlyResults = runDeterministicSimulation(inputs, customReturns);
  const trajectory = yearlyResults.map((r) => r.totalCorpus);

  // Calculate maximum drawdown experienced from initial corpus
  let peak = inputs.initialCorpus;
  let maxDD = 0;
  let troughIndex = 0;
  let recoveryYear: number | null = null;

  for (let i = 0; i < trajectory.length; i++) {
    const val = trajectory[i];
    if (val > peak) {
      peak = val;
      if (maxDD > 0 && recoveryYear === null && i > troughIndex) {
        recoveryYear = i + 1;
      }
    }
    const dd = ((peak - val) / peak) * 100;
    if (dd > maxDD) {
      maxDD = dd;
      troughIndex = i;
    }
  }

  const terminalBalance = trajectory[trajectory.length - 1] || 0;
  const survived = terminalBalance > 0 && !yearlyResults.some((r) => r.isDepleted);

  return {
    scenarioKey: crisisKey || inputs.historicalCrisis || '2008_gfc',
    title: crisis.title,
    description: crisis.description,
    historicalPeriod: crisis.historicalPeriod,
    yearlyResults,
    trajectory,
    maxDrawdownPct: Number(maxDD.toFixed(1)),
    troughYear: troughIndex + 1,
    recoveryYears: recoveryYear,
    terminalBalance: Math.round(terminalBalance),
    survived,
  };
}

/**
 * 2. Rolling Returns Analysis Engine
 * Evaluates overlapping holding blocks (3Y, 5Y, 10Y) to eliminate start-date sequence luck.
 */
export function runRollingReturnsAnalysis(
  inputs: SimulationInputs,
  windowYears: 3 | 5 | 10 = 5
): RollingReturnsResult {
  const horizon = Math.max(10, Math.min(80, inputs.simulationHorizon || 30));
  const countryProfile = COUNTRY_PROFILES[inputs.baseCountry || 'IN'] || COUNTRY_PROFILES.IN;
  const blendedB3 = calculateMultiAssetBlendedB3(
    inputs.baseCountry || 'IN',
    inputs.multiCountryAllocations
  );

  const meanB3 =
    inputs.mode === 'manual' && inputs.manualReturns
      ? inputs.manualReturns.bucket3
      : blendedB3.blendedReturn;
  const stdB3 = blendedB3.blendedStdDev;
  const b1Return =
    inputs.mode === 'manual' && inputs.manualReturns
      ? inputs.manualReturns.bucket1
      : countryProfile.bucket1.nominalReturnMean;
  const b2Return =
    inputs.mode === 'manual' && inputs.manualReturns
      ? inputs.manualReturns.bucket2
      : countryProfile.bucket2.nominalReturnMean;

  // Approximate historical rolling distribution for chosen window
  // Longer holding periods significantly compress return variance (CLT)
  const volCompressionFactor = Math.sqrt(windowYears);
  const rollingStdDev = stdB3 / volCompressionFactor;

  // Worst, Median, and Best annualized equity performance for the window
  const worstRollB3 = Number((meanB3 - 1.96 * rollingStdDev).toFixed(2));
  const medianRollB3 = meanB3;
  const bestRollB3 = Number((meanB3 + 1.96 * rollingStdDev).toFixed(2));

  // Probability of positive return increases dramatically over 5–10 years
  // India/US historical 5Y rolling equities have >96% positive returns
  const zScore = meanB3 / Math.max(1, rollingStdDev);
  const approxProbPositive = Math.min(
    99.5,
    Math.max(75, Number((50 + 50 * Math.min(1, zScore * 0.4)).toFixed(1)))
  );

  // Build 3 distinct trajectories: Worst Rolling, Median Rolling, and Best Rolling
  // Realistic rolling regime: The portfolio experiences the window's annualized return
  // during the first `windowYears` (holding block), then mean-reverts to long-term compound return.
  const buildTraj = (b3AnnualReturnDuringWindow: number) => {
    const returns = Array.from({ length: horizon }, (_, yrIdx) => {
      const isWithinWindow = yrIdx < windowYears;
      const b3Rate = isWithinWindow ? b3AnnualReturnDuringWindow : meanB3;
      return {
        b1: b1Return / 100,
        b2: b2Return / 100,
        b3: b3Rate / 100,
      };
    });
    const res = runDeterministicSimulation(inputs, returns);
    return res.map((r) => r.totalCorpus);
  };

  const worstTrajectory = buildTraj(worstRollB3);
  const medianTrajectory = buildTraj(medianRollB3);
  const bestTrajectory = buildTraj(bestRollB3);

  return {
    windowYears,
    minReturnPct: worstRollB3,
    medianReturnPct: medianRollB3,
    maxReturnPct: bestRollB3,
    positiveReturnProbabilityPct: approxProbPositive,
    worstTrajectory,
    medianTrajectory,
    bestTrajectory,
    terminalBalanceWorst: worstTrajectory[worstTrajectory.length - 1] || 0,
    terminalBalanceMedian: medianTrajectory[medianTrajectory.length - 1] || 0,
    terminalBalanceBest: bestTrajectory[bestTrajectory.length - 1] || 0,
  };
}

/**
 * 3. Deterministic Stress Testing Engine
 * Tests resilience against hardcoded structural macroeconomic shocks (e.g. 8% inflation + 30% crash).
 */
export function runDeterministicStressTest(
  inputs: SimulationInputs,
  scenarioKey?: StressScenarioType
): StressTestResult {
  const scenario =
    STRESS_SCENARIOS_DATA[scenarioKey || inputs.stressTestScenario || 'equity_crash_30_inflation_8'];
  const horizon = Math.max(10, Math.min(80, inputs.simulationHorizon || 30));

  const countryProfile = COUNTRY_PROFILES[inputs.baseCountry || 'IN'] || COUNTRY_PROFILES.IN;
  const blendedB3 = calculateMultiAssetBlendedB3(
    inputs.baseCountry || 'IN',
    inputs.multiCountryAllocations
  );

  const baseB1 = countryProfile.bucket1.nominalReturnMean / 100;
  const baseB2 = countryProfile.bucket2.nominalReturnMean / 100;
  const baseB3 = blendedB3.blendedReturn / 100;

  const stressReturns = scenario.generateReturns(horizon, baseB1, baseB2, baseB3);
  const yearlyResults = runDeterministicSimulation(inputs, stressReturns);
  const trajectory = yearlyResults.map((r) => r.totalCorpus);

  let lowestCorpus = inputs.initialCorpus;
  let troughYear = 1;
  for (let i = 0; i < trajectory.length; i++) {
    if (trajectory[i] < lowestCorpus) {
      lowestCorpus = trajectory[i];
      troughYear = i + 1;
    }
  }

  const terminalBalance = trajectory[trajectory.length - 1] || 0;
  const survived = terminalBalance > 0 && !yearlyResults.some((r) => r.isDepleted);
  const cushionRemainingPct = Number(
    ((lowestCorpus / Math.max(1, inputs.initialCorpus)) * 100).toFixed(1)
  );

  return {
    scenarioKey: scenarioKey || inputs.stressTestScenario || 'equity_crash_30_inflation_8',
    title: scenario.title,
    description: scenario.description,
    shockDetails: scenario.shockDetails,
    yearlyResults,
    trajectory,
    terminalBalance: Math.round(terminalBalance),
    lowestCorpusTrough: Math.round(lowestCorpus),
    troughYear,
    survived,
    cushionRemainingPct,
  };
}

/**
 * 4. Goals-Based Wealth Management (GBWM) Engine
 * Structures wealth specifically around lifecycle milestones, earmarking bucket assets.
 */
export function runGoalsBasedWealth(inputs: SimulationInputs): GoalsBasedResult {
  const milestones =
    inputs.goalMilestones && inputs.goalMilestones.length > 0
      ? inputs.goalMilestones
      : DEFAULT_GOAL_MILESTONES;

  const horizon = Math.max(10, Math.min(80, inputs.simulationHorizon || 30));
  const baseSim = runDeterministicSimulation(inputs);

  // Evaluate each milestone feasibility against projected corpus
  const milestoneStatuses = milestones.map((m) => {
    const yrIndex = Math.min(m.targetYear - 1, baseSim.length - 1);
    const availableCorpus = baseSim[yrIndex]?.totalCorpus || 0;
    const fundedAmount = Math.min(m.amount, availableCorpus * 0.75);
    const fundingPct = Number(((fundedAmount / m.amount) * 100).toFixed(1));
    return {
      milestone: m,
      fundedAmount: Math.round(fundedAmount),
      isFullyFunded: fundingPct >= 99,
      fundingPct,
      projectedCorpusAtMilestone: availableCorpus,
    };
  });

  const allMilestonesFunded = milestoneStatuses.every((ms) => ms.isFullyFunded);

  // Deduct earmarked milestone funding from terminal trajectory
  const trajectory = baseSim.map((r, idx) => {
    let milestoneDeductions = 0;
    milestones.forEach((m) => {
      if (idx + 1 >= m.targetYear) {
        milestoneDeductions += m.amount;
      }
    });
    return Math.max(0, r.totalCorpus - Math.round(milestoneDeductions * 0.6));
  });

  const terminalLegacySurplus = trajectory[trajectory.length - 1] || 0;
  const annualExpense = inputs.monthlyWithdrawal * 12;
  const shortTermRunwayYears = Number((inputs.bucket1Years).toFixed(1));
  const mediumTermShieldFunded = inputs.bucket2Years >= 5;

  return {
    yearlyResults: baseSim,
    trajectory,
    milestoneStatuses,
    allMilestonesFunded,
    terminalLegacySurplus: Math.round(terminalLegacySurplus),
    shortTermRunwayYears,
    mediumTermShieldFunded,
  };
}

/**
 * 5. Comprehensive Cross-Model Comparison Engine
 * Executes all 5 wealth management models side-by-side with identical inputs
 * to create a comparative analytical matrix.
 */
export function generateModelComparison(
  inputs: SimulationInputs,
  simResults: YearSimulationResult[],
  mcSummary: MonteCarloSummary
): ModelComparisonSummary {
  const backtest = runHistoricalBacktest(inputs);
  const rolling = runRollingReturnsAnalysis(inputs, inputs.rollingWindowYears || 5);
  const stress = runDeterministicStressTest(inputs);
  const goals = runGoalsBasedWealth(inputs);

  const horizon = Math.max(10, Math.min(80, inputs.simulationHorizon || 30));
  const mcMedianTraj = mcSummary.medianTrajectory.slice(0, horizon);

  const models: ModelComparisonItem[] = [
    {
      id: 'monte_carlo',
      name: 'Monte Carlo (Risk Cone)',
      category: 'Probabilistic Simulation',
      whatItAnswers: 'What are the statistical odds of my money lasting across market cycles?',
      bestUsedFor: 'Long-term retirement viability & sequence-of-returns percentile bands.',
      trajectory: mcMedianTraj,
      terminalBalance: mcSummary.medianBalanceTerminal,
      keyMetricLabel: 'Actuarial Survival',
      keyMetricValue: `${mcSummary.successRate}%`,
      status: mcSummary.successRate >= 90 ? 'excellent' : mcSummary.successRate >= 75 ? 'good' : 'caution',
      color: '#38BDF8', // Cyan / Sky Blue
    },
    {
      id: 'historical_backtest',
      name: 'Historical Backtest (2008 GFC)',
      category: 'Real Market Replay',
      whatItAnswers: 'How would this exact portfolio have survived the 2008 Global Financial Crisis?',
      bestUsedFor: 'Grounding strategy in real-world crisis drawdowns rather than abstract math.',
      trajectory: backtest.trajectory.slice(0, horizon),
      terminalBalance: backtest.terminalBalance,
      keyMetricLabel: 'Max Crisis Drawdown',
      keyMetricValue: `-${backtest.maxDrawdownPct}%`,
      status: backtest.survived ? 'good' : 'danger',
      color: '#F59E0B', // Amber / Orange
    },
    {
      id: 'rolling_returns',
      name: `Rolling Returns (${rolling.windowYears}Y Blocks)`,
      category: 'Horizon Consistency',
      whatItAnswers: `What is the typical experience of holding this portfolio across any ${rolling.windowYears}-year block?`,
      bestUsedFor: 'Eliminating start-date sequence luck and measuring time-horizon consistency.',
      trajectory: rolling.medianTrajectory.slice(0, horizon),
      terminalBalance: rolling.terminalBalanceMedian,
      keyMetricLabel: 'Positive Return Odds',
      keyMetricValue: `${rolling.positiveReturnProbabilityPct}%`,
      status: rolling.positiveReturnProbabilityPct >= 95 ? 'excellent' : 'good',
      color: '#10B981', // Emerald Green
    },
    {
      id: 'stress_testing',
      name: 'Stress Test (8% Infl + -30% Eq)',
      category: 'Macroeconomic Shock',
      whatItAnswers: 'What happens to this portfolio if inflation doubles and stocks crash tomorrow?',
      bestUsedFor: 'Identifying structural vulnerabilities and verifying Bucket 1 & 2 cash buffers.',
      trajectory: stress.trajectory.slice(0, horizon),
      terminalBalance: stress.terminalBalance,
      keyMetricLabel: 'Lowest Corpus Cushion',
      keyMetricValue: `${stress.cushionRemainingPct}%`,
      status: stress.survived ? (stress.cushionRemainingPct > 50 ? 'good' : 'caution') : 'danger',
      color: '#EC4899', // Pink / Rose
    },
    {
      id: 'goals_based',
      name: 'Goals-Based (GBWM)',
      category: 'Milestone Bucketing',
      whatItAnswers: 'Am I on track to fund education, home, healthcare, and retire smoothly?',
      bestUsedFor: 'Emotional discipline, behavioral peace of mind, and milestone alignment.',
      trajectory: goals.trajectory.slice(0, horizon),
      terminalBalance: goals.terminalLegacySurplus,
      keyMetricLabel: 'Milestones Funded',
      keyMetricValue: `${goals.milestoneStatuses.filter((m) => m.isFullyFunded).length}/${goals.milestoneStatuses.length}`,
      status: goals.allMilestonesFunded ? 'excellent' : 'good',
      color: '#8B5CF6', // Purple / Violet
    },
  ];

  let recommendation =
    'Your 3-bucket architecture demonstrates strong resilience across probabilistic simulations and historical crisis replays. Bucket 1 and 2 provide ample insulation against equity bear markets.';
  if (mcSummary.successRate < 80 || !backtest.survived || !stress.survived) {
    recommendation =
      'Stress testing and historical backtests indicate vulnerability during prolonged macroeconomic downturns. Consider expanding Bucket 1 cash or Bucket 2 debt buffers to insulate withdrawals.';
  }

  return {
    models,
    recommendation,
  };
}
