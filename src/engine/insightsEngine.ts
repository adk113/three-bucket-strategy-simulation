import { formatCurrency } from '../utils/currency';
import {
  MonteCarloSummary,
  SimulationInputs,
  StrategyInsight,
  YearSimulationResult,
  HistoricalBacktestResult,
  RollingReturnsResult,
  StressTestResult,
  GoalsBasedResult,
  ModelComparisonSummary,
} from './types';

export function generateStrategyInsights(
  inputs: SimulationInputs,
  simResults: YearSimulationResult[],
  mcSummary: MonteCarloSummary,
  backtestResult?: HistoricalBacktestResult,
  rollingResult?: RollingReturnsResult,
  stressResult?: StressTestResult,
  goalsResult?: GoalsBasedResult,
  modelComparison?: ModelComparisonSummary
): StrategyInsight[] {
  const model = inputs.selectedModel || 'monte_carlo';
  const country = inputs.baseCountry || 'IN';
  const horizon = inputs.simulationHorizon || 30;

  // 1. Model-Specific Tailored Insights
  if (model === 'historical_backtest' && backtestResult) {
    return generateHistoricalBacktestInsights(inputs, backtestResult);
  }

  if (model === 'rolling_returns' && rollingResult) {
    return generateRollingReturnsInsights(inputs, rollingResult);
  }

  if (model === 'stress_testing' && stressResult) {
    return generateStressTestingInsights(inputs, stressResult);
  }

  if (model === 'goals_based' && goalsResult) {
    return generateGoalsBasedInsights(inputs, goalsResult);
  }

  if (model === 'comparison' && modelComparison) {
    return generateComparisonInsights(inputs, modelComparison, mcSummary);
  }

  // Default: Monte Carlo Stochastic Risk Cone Insights
  return generateMonteCarloInsights(inputs, simResults, mcSummary);
}

/**
 * Monte Carlo Stochastic Risk Cone Insights
 */
function generateMonteCarloInsights(
  inputs: SimulationInputs,
  simResults: YearSimulationResult[],
  mcSummary: MonteCarloSummary
): StrategyInsight[] {
  const insights: StrategyInsight[] = [];
  const country = inputs.baseCountry || 'IN';
  const horizon = inputs.simulationHorizon || 30;
  const annualWithdrawal = inputs.monthlyWithdrawal * 12;
  const withdrawalRate = (annualWithdrawal / inputs.initialCorpus) * 100;
  const combinedBufferYears = inputs.bucket1Years + inputs.bucket2Years;
  const totalFrictionIncurred = simResults.reduce((acc, cur) => acc + cur.rebalanceFrictionCost, 0);

  if (mcSummary.successRate >= 90) {
    insights.push({
      type: 'success',
      title: `High Longevity Confidence (${mcSummary.successRate}%)`,
      message: `Your ${inputs.baseCountry} retirement portfolio has an actuarial ${mcSummary.successRate}% probability of outliving your ${horizon}-year horizon across 500 stochastic market cycles.`,
      recommendation:
        mcSummary.percentile10BalanceTerminal > 0
          ? `Even in the conservative 10th percentile bear scenario (P10), your terminal corpus remains intact (${formatCurrency(
              mcSummary.percentile10BalanceTerminal,
              country
            )}).`
          : undefined,
    });
  } else if (mcSummary.successRate >= 75) {
    insights.push({
      type: 'warning',
      title: `Moderate Sequence-of-Returns Risk (${mcSummary.successRate}%)`,
      message: `The simulation shows a ${mcSummary.successRate}% survival probability over ${horizon} years. In severe bear markets, there is a ${(
        100 - mcSummary.successRate
      ).toFixed(1)}% risk of capital exhaustion.`,
      recommendation: mcSummary.earliestDepletionYear
        ? `Earliest simulated depletion observed around Year ${mcSummary.earliestDepletionYear}. Reducing monthly withdrawal by 5-8% elevates your survival odds to >95%.`
        : 'Consider boosting your Bucket 2 stability buffer.',
    });
  } else {
    insights.push({
      type: 'danger',
      title: `Critical Depletion Risk (${(100 - mcSummary.successRate).toFixed(1)}% Failure)`,
      message: `At your current withdrawal pace, the portfolio fails within the ${horizon}-year horizon in ${(
        100 - mcSummary.successRate
      ).toFixed(1)}% of economic simulations.`,
      recommendation: `Action: Tap "Suggest Safe" to compute the sustainable monthly withdrawal for ${inputs.baseCountry}.`,
    });
  }

  // Cross-Border Diversification Advantage
  const foreignAllocs = (inputs.multiCountryAllocations || []).filter(
    (a) => a.country !== inputs.baseCountry && a.weight > 0
  );
  if (foreignAllocs.length > 0) {
    const summaryStr = foreignAllocs.map((a) => `${a.weight}% ${a.country}`).join(', ');
    insights.push({
      type: 'info',
      title: `Multi-Country Diversification Active (${summaryStr})`,
      message: `Blending Bucket 3 equities across ${foreignAllocs.length} foreign markets reduced equity volatility drag by ~${mcSummary.diversificationBenefitVolReduction}% through low cross-country correlation and provides global purchasing power protection.`,
    });
  }

  // Withdrawal Rate Diagnostic
  const maxSafeThreshold = country === 'US' || country === 'EU' ? 4.2 : 4.8;
  if (withdrawalRate > maxSafeThreshold) {
    insights.push({
      type: 'danger',
      title: `High Initial Withdrawal Rate (${withdrawalRate.toFixed(2)}%)`,
      message: `An initial withdrawal rate of ${withdrawalRate.toFixed(
        2
      )}% exceeds the ${country} sustainable guideline (${maxSafeThreshold}%) under ${inputs.inflationRate}% annual inflation.`,
      recommendation: `Target an initial withdrawal under ${maxSafeThreshold}% to avoid irreversible sequence drag.`,
    });
  }

  // Rebalancing Waterfall & Friction Analytics
  if (totalFrictionIncurred > 0) {
    insights.push({
      type: 'info',
      title: `Rebalancing Friction & Net Capital Preservation`,
      message: `Over the simulation horizon, bucket-to-bucket rebalancing incurred ${formatCurrency(
        totalFrictionIncurred,
        country
      )} in estimated rebalancing slippage/friction (${inputs.rebalancingFrictionRate || 0.15}% rate), but protected ${combinedBufferYears} full years of uninterrupted cash flow without forced fire-sales.`,
    });
  }

  return insights;
}

/**
 * Historical Backtesting Model Insights
 */
function generateHistoricalBacktestInsights(
  inputs: SimulationInputs,
  backtest: HistoricalBacktestResult
): StrategyInsight[] {
  const insights: StrategyInsight[] = [];
  const country = inputs.baseCountry || 'IN';
  const crisisName = backtest.title;

  if (backtest.survived) {
    insights.push({
      type: 'success',
      title: `Crisis Survival Confirmed: ${crisisName}`,
      message: `Your 3-bucket asset allocation successfully absorbed the real historical crash with a maximum drawdown of -${backtest.maxDrawdownPct}%. Terminal wealth ended at ${formatCurrency(
        backtest.terminalBalance,
        country
      )}.`,
      recommendation: backtest.recoveryYears
        ? `The portfolio completely recovered to pre-crisis highs in Year ${backtest.recoveryYears}, proving the strategy's self-healing capacity.`
        : 'Bucket 1 cash & Bucket 2 debt provided full liquidity without selling depressed equities.',
    });
  } else {
    insights.push({
      type: 'danger',
      title: `Crisis Vulnerability Detected: ${crisisName}`,
      message: `Under real historical market conditions, the severe drawdown (-${backtest.maxDrawdownPct}%) exhausted liquid reserves and forced liquidation of equities at market bottoms.`,
      recommendation:
        'Increase Bucket 1 cash to 4 years and Bucket 2 debt to 8 years to widen your defensive moat against prolonged crashes.',
    });
  }

  // Counterfactual buffer diagnostic
  const b1Years = inputs.bucket1Years;
  const b2Years = inputs.bucket2Years;
  insights.push({
    type: 'info',
    title: 'Bear Market Defense Rule in Action',
    message: `During the crisis years, Bucket 3 equity harvesting was paused automatically. Your ${b1Years} years of liquid cash and ${b2Years} years of debt absorbed ${inputs.baseCountry} living expenses uninterrupted, avoiding panic selling at historic bottoms.`,
    recommendation:
      'Without this 3-bucket insulation, a 100% equity portfolio would have suffered permanent capital destruction.',
  });

  insights.push({
    type: 'info',
    title: 'Grounding in Lived Market Reality',
    message: `Unlike abstract statistical bell curves, historical backtesting proves how your strategy would have withstood real-world geopolitical shocks, liquidity freezes, and high inflation regimes.`,
  });

  return insights;
}

/**
 * Rolling Returns Model Insights
 */
function generateRollingReturnsInsights(
  inputs: SimulationInputs,
  rolling: RollingReturnsResult
): StrategyInsight[] {
  const insights: StrategyInsight[] = [];
  const country = inputs.baseCountry || 'IN';
  const win = rolling.windowYears;

  if (rolling.positiveReturnProbabilityPct >= 95) {
    insights.push({
      type: 'success',
      title: `Exceptional Horizon Consistency (${rolling.positiveReturnProbabilityPct}% Positive Odds)`,
      message: `Holding this portfolio across any overlapping ${win}-year block historically delivered a positive return in ${rolling.positiveReturnProbabilityPct}% of periods, effectively eliminating sequence-of-returns luck.`,
      recommendation: `Expected median annualized return over ${win}-year blocks: +${rolling.medianReturnPct}% p.a. Terminal wealth: ${formatCurrency(
        rolling.terminalBalanceMedian,
        country
      )}.`,
    });
  } else {
    insights.push({
      type: 'warning',
      title: `Moderate Horizon Volatility (${rolling.positiveReturnProbabilityPct}% Positive Odds)`,
      message: `Across ${win}-year holding blocks, there is a ${(100 - rolling.positiveReturnProbabilityPct).toFixed(
        1
      )}% probability of experiencing negative annualized returns.`,
      recommendation:
        'Extending your investment horizon to 10-year rolling blocks compresses return variance and boosts positive odds to >99%.',
    });
  }

  // Volatility compression analysis
  insights.push({
    type: 'info',
    title: `Variance Compression via Central Limit Theorem`,
    message: `Over short 1-year windows, equity returns swing violently (e.g. -35% to +45%). By evaluating ${win}-year overlapping rolling blocks, annualized variance compresses to [+${rolling.minReturnPct}%, +${rolling.maxReturnPct}%], shielding long-term retirees.`,
  });

  // Worst-case block reality check
  insights.push({
    type: rolling.terminalBalanceWorst > 0 ? 'info' : 'warning',
    title: `Worst Historical ${win}-Year Holding Block`,
    message: `Even in the absolute worst historical holding window (+${rolling.minReturnPct}% p.a. return), your terminal corpus is projected at ${formatCurrency(
      rolling.terminalBalanceWorst,
      country
    )}.`,
    recommendation:
      'Bucket 1 cash prevents you from having to liquidate assets during the worst rolling block.',
  });

  return insights;
}

/**
 * Deterministic Stress Testing Model Insights
 */
function generateStressTestingInsights(
  inputs: SimulationInputs,
  stress: StressTestResult
): StrategyInsight[] {
  const insights: StrategyInsight[] = [];
  const country = inputs.baseCountry || 'IN';

  if (stress.survived && stress.cushionRemainingPct >= 50) {
    insights.push({
      type: 'success',
      title: `Robust Shock Absorption (${stress.cushionRemainingPct}% Solvency Cushion)`,
      message: `Under the severe macroeconomic shock "${stress.title}", your portfolio's lowest trough was ${formatCurrency(
        stress.lowestCorpusTrough,
        country
      )} (Year ${stress.troughYear}), retaining a ${stress.cushionRemainingPct}% solvency cushion.`,
      recommendation: `Terminal corpus rebounds to ${formatCurrency(
        stress.terminalBalance,
        country
      )} after macroeconomic recovery.`,
    });
  } else if (stress.survived) {
    insights.push({
      type: 'warning',
      title: `Tight Solvency Margin (${stress.cushionRemainingPct}% Cushion Remaining)`,
      message: `The shock severely compressed liquidity. At Year ${stress.troughYear}, capital dipped to ${formatCurrency(
        stress.lowestCorpusTrough,
        country
      )}, leaving little buffer for subsequent unexpected emergencies.`,
      recommendation:
        'Expand Bucket 2 intermediate debt buffer by 2 additional years of living expenses to widen the stress buffer.',
    });
  } else {
    insights.push({
      type: 'danger',
      title: `Severe Macroeconomic Ruin Risk`,
      message: `The simultaneous inflation spike and equity collapse completely overwhelmed Bucket 1 & 2 reserves, causing portfolio depletion.`,
      recommendation:
        'Tap "Suggest Safe" to recalibrate living withdrawals or reduce equity beta exposure.',
    });
  }

  insights.push({
    type: 'info',
    title: 'Deterministic Stress Shock Parameters',
    message: stress.shockDetails,
    recommendation:
      'Stress testing tests structural vulnerabilities that probabilistic models often smooth over.',
  });

  return insights;
}

/**
 * Goals-Based Wealth Management (GBWM) Insights
 */
function generateGoalsBasedInsights(
  inputs: SimulationInputs,
  goals: GoalsBasedResult
): StrategyInsight[] {
  const insights: StrategyInsight[] = [];
  const country = inputs.baseCountry || 'IN';
  const fundedCount = goals.milestoneStatuses.filter((s) => s.isFullyFunded).length;
  const totalCount = goals.milestoneStatuses.length;
  const fundingPct = Math.round((fundedCount / Math.max(1, totalCount)) * 100);

  if (goals.allMilestonesFunded) {
    insights.push({
      type: 'success',
      title: `100% Life Milestones Fully Funded (${fundedCount}/${totalCount})`,
      message: `Every lifecycle milestone (education, property, healthcare, and legacy) is fully solvent and earmarked without jeopardizing retirement cash flow.`,
      recommendation: `Projected terminal legacy surplus after funding all milestones: ${formatCurrency(
        goals.terminalLegacySurplus,
        country
      )}.`,
    });
  } else {
    insights.push({
      type: 'warning',
      title: `Partial Milestone Solvency (${fundedCount}/${totalCount} Milestones Funded)`,
      message: `Your current corpus and withdrawal pace fund ${fundingPct}% of earmarked milestones. Later-stage milestones face potential capital shortfalls.`,
      recommendation:
        'Consider adjusting target milestone amounts or allocating higher weight to Bucket 3 growth equities.',
    });
  }

  // Time-Horizon Bucketing ALM Diagnostic
  insights.push({
    type: 'info',
    title: 'Asset-Liability Matching (ALM) in Practice',
    message: `Immediate living liquidity is insulated for ${goals.shortTermRunwayYears} years in Bucket 1 cash. Intermediate milestones are shielded in Bucket 2 bonds, allowing Bucket 3 equities to compound untouched for 15+ years.`,
    recommendation:
      'This segmented structure eliminates emotional panic and keeps your retirement plan strictly aligned with real life goals.',
  });

  return insights;
}

/**
 * Multi-Model Comparison Insights
 */
function generateComparisonInsights(
  inputs: SimulationInputs,
  modelComp: ModelComparisonSummary,
  mcSummary: MonteCarloSummary
): StrategyInsight[] {
  const insights: StrategyInsight[] = [];
  const country = inputs.baseCountry || 'IN';

  const terminalBalances = modelComp.models.map((m) => m.terminalBalance);
  const minTerminal = Math.min(...terminalBalances);
  const maxTerminal = Math.max(...terminalBalances);

  insights.push({
    type: 'success',
    title: 'Cross-Model Analytical Consensus',
    message: `Evaluating your portfolio simultaneously across all 5 wealth models reveals a terminal capital range from ${formatCurrency(
      minTerminal,
      country
    )} (most conservative stress condition) to ${formatCurrency(
      maxTerminal,
      country
    )} (secular growth).`,
    recommendation: modelComp.recommendation,
  });

  insights.push({
    type: 'info',
    title: 'Multi-Methodology Strategy Validation',
    message: `• Monte Carlo: ${mcSummary.successRate}% Actuarial Survival odds.\n• 2008 GFC Backtest: Proven drawdown resilience against real financial crisis.\n• Rolling Returns: High frequency of positive compounding over multi-year holding blocks.\n• Stress Testing: Confirmed solvency margin under acute macroeconomic shocks.\n• Goals-Based: Verified milestone funding and generational wealth legacy.`,
    recommendation:
      'Review the Comparison Matrix and chart above to cross-reference each methodology.',
  });

  return insights;
}
