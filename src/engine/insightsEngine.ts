import { MonteCarloSummary, SimulationInputs, StrategyInsight, YearSimulationResult } from './types';

export function generateStrategyInsights(
  inputs: SimulationInputs,
  simResults: YearSimulationResult[],
  mcSummary: MonteCarloSummary
): StrategyInsight[] {
  const insights: StrategyInsight[] = [];
  const annualWithdrawal = inputs.monthlyWithdrawal * 12;
  const withdrawalRate = (annualWithdrawal / inputs.initialCorpus) * 100;
  const initialCashBufferYears = inputs.bucket1Years;
  const initialStabilityYears = inputs.bucket2Years;
  const combinedBufferYears = initialCashBufferYears + initialStabilityYears;

  // 1. Success Rate Insight
  if (mcSummary.successRate >= 92) {
    insights.push({
      type: 'success',
      title: 'High Longevity Confidence (92%+)',
      message: `Your strategy achieves a robust ${mcSummary.successRate}% probability of surviving 30 years across 500 market cycle simulations without depleting.`,
      recommendation:
        mcSummary.percentile10BalanceYear30 > 0
          ? `Even in the worst 10% market scenarios, your terminal corpus remains positive (~${formatCurrency(
              mcSummary.percentile10BalanceYear30
            )}).`
          : undefined,
    });
  } else if (mcSummary.successRate >= 75) {
    insights.push({
      type: 'warning',
      title: 'Moderate Sequence-of-Returns Risk',
      message: `The simulation shows a ${mcSummary.successRate}% survival probability. In prolonged bear markets, the portfolio faces a ${(
        100 - mcSummary.successRate
      ).toFixed(1)}% chance of depletion.`,
      recommendation:
        mcSummary.earliestDepletionYear
          ? `Earliest simulated depletion occurred around Year ${mcSummary.earliestDepletionYear}. Consider reducing monthly withdrawal by 5-10% to secure a 95%+ success rate.`
          : 'Consider boosting Bucket 2 stability reserves.',
    });
  } else {
    insights.push({
      type: 'danger',
      title: 'Elevated Depletion Hazard',
      message: `Your current withdrawal pace has a critical failure rate of ${(
        100 - mcSummary.successRate
      ).toFixed(1)}%. The portfolio is likely to run dry within 30 years under realistic inflation.`,
      recommendation: `Action Required: Tap the "Suggest Safe Withdrawal" button to calculate a sustainable monthly amount.`,
    });
  }

  // 2. Withdrawal Rate Diagnostic
  if (withdrawalRate > 5.5) {
    insights.push({
      type: 'danger',
      title: `High Initial Withdrawal Rate (${withdrawalRate.toFixed(2)}%)`,
      message: `An initial withdrawal rate of ${withdrawalRate.toFixed(
        2
      )}% is significantly above the historical safe threshold (3.5% - 4.5%) when indexed to ${inputs.inflationRate}% annual inflation.`,
      recommendation: `Recommended initial withdrawal should not exceed 4.0% - 4.5% of total corpus for long retirement horizons.`,
    });
  } else if (withdrawalRate <= 3.8) {
    insights.push({
      type: 'info',
      title: `Conservative Withdrawal Rate (${withdrawalRate.toFixed(2)}%)`,
      message: `Your withdrawal rate is well within safe capital preservation guidelines. You have strong leeway to absorb healthcare spikes or leave an inheritance.`,
    });
  }

  // 3. Buffer Runway & Bear Market Protection
  if (combinedBufferYears >= 8) {
    insights.push({
      type: 'success',
      title: `${combinedBufferYears}-Year Shock Absorber Active`,
      message: `With ${initialCashBufferYears} years in Bucket 1 and ${initialStabilityYears} years in Bucket 2, you can weather any modern equity bear market without panic selling equities at the bottom.`,
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Short Cash/Bond Buffer (< 8 Years)',
      message: `Your combined Bucket 1 & 2 runway is only ${combinedBufferYears} years. Prolonged market downturns may force you to sell equities in Bucket 3 during a recession.`,
      recommendation: `Increase Bucket 2 allocation to provide at least 7-8 years of cumulative living expense coverage.`,
    });
  }

  return insights;
}

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString()}`;
}
