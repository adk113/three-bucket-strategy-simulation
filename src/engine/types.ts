import { SupportedCountry } from '../utils/currency';

export interface SimulationInputs {
  initialCorpus: number;
  monthlyWithdrawal: number;
  startDate: string; // DD/MM/YYYY or YYYY-MM-DD
  inflationRate: number; // e.g. 6.0 (%)
  bucket1Years: number; // default 3
  bucket2Years: number; // default 7
  mode: 'historical' | 'manual';

  // Multi-Country & Cross-Border Settings
  baseCountry: SupportedCountry; // 'IN' | 'US' | 'UK' | 'EU'
  foreignCountry: SupportedCountry;
  foreignAllocationPercent: number; // 0% to 50% of Bucket 3

  // Variable Time Horizons
  simulationHorizon: number; // e.g. 30 or 40 (years simulated in engine)
  displayHorizon: number; // e.g. 10, 15, 20, 30 (years rendered on charts)

  // Rebalancing Friction
  rebalancingFrictionRate: number; // e.g. 0.15% transaction friction

  // Manual expected returns (%)
  manualReturns: {
    bucket1: number;
    bucket2: number;
    bucket3: number;
  };
}

export interface YearSimulationResult {
  year: number;
  calendarYear: number;
  bucket1: number;
  bucket2: number;
  bucket3: number;
  totalCorpus: number;
  withdrawalAmount: number;
  realPurchasingPower: number; // withdrawal / (1 + inflation)^t
  bucket1RefilledFromB2: number;
  bucket2RefilledFromB3: number;
  rebalanceFrictionCost: number;
  bearMarketDefenseActive: boolean;
  isDepleted: boolean;
  marketReturnB3: number;
}

export interface MonteCarloSummary {
  successRate: number;
  medianBalanceTerminal: number;
  percentile10BalanceTerminal: number;
  percentile90BalanceTerminal: number;
  medianTrajectory: number[];
  p10Trajectory: number[];
  p90Trajectory: number[];
  earliestDepletionYear: number | null;
  averageDepletionYear: number | null;
  depletionCount: number;
  totalRuns: number;
  diversificationBenefitVolReduction: number; // e.g. -1.4% std dev
}

export interface StrategyInsight {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  recommendation?: string;
}

export interface SavedStrategy {
  id: string;
  name: string;
  createdAt: string;
  inputs: SimulationInputs;
}
