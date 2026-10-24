export interface SimulationInputs {
  initialCorpus: number;
  monthlyWithdrawal: number;
  startDate: string; // YYYY-MM-DD or DD/MM/YYYY
  inflationRate: number; // e.g. 6 (%)
  bucket1Years: number; // default 3
  bucket2Years: number; // default 7
  mode: 'historical' | 'manual';
  // Manual expected returns (%)
  manualReturns: {
    bucket1: number; // default 5.5%
    bucket2: number; // default 8.0%
    bucket3: number; // default 12.0%
  };
}

export interface YearSimulationResult {
  year: number;
  calendarYear: number;
  age?: number;
  bucket1: number;
  bucket2: number;
  bucket3: number;
  totalCorpus: number;
  withdrawalAmount: number;
  bucket1RefilledFromB2: number;
  bucket2RefilledFromB3: number;
  isDepleted: boolean;
  marketReturnB3: number;
}

export interface MonteCarloSummary {
  successRate: number; // e.g. 96.5%
  medianBalanceYear30: number;
  percentile10BalanceYear30: number;
  percentile90BalanceYear30: number;
  medianTrajectory: number[];
  p10Trajectory: number[];
  p90Trajectory: number[];
  earliestDepletionYear: number | null;
  averageDepletionYear: number | null;
  depletionCount: number;
  totalRuns: number;
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
