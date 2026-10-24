import { SupportedCountry } from '../utils/currency';

export interface CrossBorderEquityAllocation {
  country: SupportedCountry;
  weight: number; // percentage of Bucket 3 (e.g. 50%, 30%, 20%)
  isManual: boolean;
  customReturn?: number; // % p.a.
  customStdDev?: number; // % p.a.
}

export interface SimulationInputs {
  initialCorpus: number;
  monthlyWithdrawal: number;
  startDate: string; // DD/MM/YYYY or YYYY-MM-DD
  inflationRate: number; // e.g. 6.0 (%)
  bucket1Years: number; // default 3
  bucket2Years: number; // default 7
  mode: 'historical' | 'manual';

  // Base Market & Multi-Country Cross-Border Settings
  baseCountry: SupportedCountry; // 'IN' | 'US' | 'UK' | 'EU'
  targetGrowthPercent?: number; // Target Equity / Growth Bucket % of corpus (e.g. 60%)
  multiCountryAllocations: CrossBorderEquityAllocation[];

  // Ultra-Long Variable Time Horizons (up to 80 years)
  simulationHorizon: number; // 10 to 80 years
  displayHorizon: number; // 10 to 80 years

  // Rebalancing Friction
  rebalancingFrictionRate: number; // e.g. 0.15% transaction friction

  // Manual expected returns for baseline (%)
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
  diversificationBenefitVolReduction: number;
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
