import { SupportedCountry } from '../utils/currency';

export interface CrossBorderEquityAllocation {
  country: SupportedCountry;
  weight: number; // percentage of Bucket 3 (e.g. 50%, 30%, 20%)
  isManual: boolean;
  customReturn?: number; // % p.a.
  customStdDev?: number; // % p.a.
}

export type WealthModelType =
  | 'monte_carlo'
  | 'historical_backtest'
  | 'rolling_returns'
  | 'stress_testing'
  | 'goals_based'
  | 'comparison';

export type HistoricalCrisisType =
  | '2008_gfc'
  | '2000_dotcom'
  | '2020_covid'
  | '1973_stagflation';

export type StressScenarioType =
  | 'equity_crash_30_inflation_8'
  | 'stagflation_shock'
  | 'dual_asset_selloff_2022'
  | 'prolonged_bear_market';

export interface GoalMilestone {
  id: string;
  name: string;
  targetYear: number;
  amount: number;
  bucketPriority: 1 | 2 | 3;
  category: 'education' | 'property' | 'lifestyle' | 'healthcare' | 'legacy';
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

  // Wealth Management Analytical Model Configuration
  selectedModel?: WealthModelType;
  historicalCrisis?: HistoricalCrisisType;
  rollingWindowYears?: 3 | 5 | 10;
  stressTestScenario?: StressScenarioType;
  goalMilestones?: GoalMilestone[];
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

export interface HistoricalBacktestResult {
  scenarioKey: HistoricalCrisisType;
  title: string;
  description: string;
  historicalPeriod: string;
  yearlyResults: YearSimulationResult[];
  trajectory: number[];
  maxDrawdownPct: number;
  troughYear: number;
  recoveryYears: number | null;
  terminalBalance: number;
  survived: boolean;
}

export interface RollingReturnsResult {
  windowYears: number;
  minReturnPct: number;
  medianReturnPct: number;
  maxReturnPct: number;
  positiveReturnProbabilityPct: number;
  bestTrajectory: number[];
  medianTrajectory: number[];
  worstTrajectory: number[];
  terminalBalanceMedian: number;
  terminalBalanceWorst: number;
  terminalBalanceBest: number;
}

export interface StressTestResult {
  scenarioKey: StressScenarioType;
  title: string;
  description: string;
  shockDetails: string;
  yearlyResults: YearSimulationResult[];
  trajectory: number[];
  terminalBalance: number;
  lowestCorpusTrough: number;
  troughYear: number;
  survived: boolean;
  cushionRemainingPct: number;
}

export interface GoalsMilestoneStatus {
  milestone: GoalMilestone;
  fundedAmount: number;
  isFullyFunded: boolean;
  fundingPct: number;
  projectedCorpusAtMilestone: number;
}

export interface GoalsBasedResult {
  yearlyResults: YearSimulationResult[];
  trajectory: number[];
  milestoneStatuses: GoalsMilestoneStatus[];
  allMilestonesFunded: boolean;
  terminalLegacySurplus: number;
  shortTermRunwayYears: number;
  mediumTermShieldFunded: boolean;
}

export interface ModelComparisonItem {
  id: WealthModelType;
  name: string;
  category: string;
  whatItAnswers: string;
  bestUsedFor: string;
  trajectory: number[];
  terminalBalance: number;
  keyMetricLabel: string;
  keyMetricValue: string;
  status: 'excellent' | 'good' | 'caution' | 'danger';
  color: string;
}

export interface ModelComparisonSummary {
  models: ModelComparisonItem[];
  recommendation: string;
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

