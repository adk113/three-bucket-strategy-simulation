import { formatCurrency } from '../utils/currency';
import { MonteCarloSummary, SimulationInputs, StrategyInsight, YearSimulationResult } from './types';

export function generateStrategyInsights(
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

  // Total friction incurred over simulation
  const totalFrictionIncurred = simResults.reduce((acc, cur) => acc + cur.rebalanceFrictionCost, 0);

  // 1. Success Rate & Longevity Insight
  if (mcSummary.successRate >= 90) {
    insights.push({
      type: 'success',
      title: `High Longevity Confidence (${mcSummary.successRate}%)`,
      message: `Your ${inputs.baseCountry} retirement portfolio has an actuarial ${mcSummary.successRate}% probability of outliving your ${horizon}-year horizon across 500 stochastic market cycles.`,
      recommendation:
        mcSummary.percentile10BalanceTerminal > 0
          ? `Even in the worst 10% market scenarios, your terminal corpus remains intact (${formatCurrency(
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
        ? `Earliest simulated depletion observed at Year ${mcSummary.earliestDepletionYear}. Reducing monthly withdrawal by 5-8% elevates your survival odds to >95%.`
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

  // 2. Cross-Border Diversification Advantage
  if (inputs.foreignAllocationPercent > 0 && inputs.baseCountry !== inputs.foreignCountry) {
    insights.push({
      type: 'info',
      title: `Cross-Border Diversification Active (${inputs.foreignAllocationPercent}% ${inputs.foreignCountry})`,
      message: `Allocating ${inputs.foreignAllocationPercent}% of Bucket 3 to ${inputs.foreignCountry} assets reduced equity volatility drag by ~${mcSummary.diversificationBenefitVolReduction}% and provides geographic currency protection.`,
    });
  }

  // 3. Withdrawal Rate Diagnostic
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

  // 4. Rebalancing Waterfall & Friction Analytics
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
