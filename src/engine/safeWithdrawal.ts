import { COUNTRY_PROFILES } from './historicalData';
import { runDeterministicSimulation } from './simulationEngine';
import { SimulationInputs } from './types';

export function calculateSafeMonthlyWithdrawal(inputs: SimulationInputs): number {
  if (inputs.initialCorpus <= 0) return 0;

  const horizon = Math.max(10, inputs.simulationHorizon || 30);
  const country = COUNTRY_PROFILES[inputs.baseCountry || 'IN'] || COUNTRY_PROFILES.IN;

  // Initial bounds for monthly withdrawal
  let low = Math.floor((inputs.initialCorpus * 0.015) / 12);
  let high = Math.floor((inputs.initialCorpus * 0.09) / 12);
  let bestSafeWithdrawal = low;

  for (let iter = 0; iter < 18; iter++) {
    const mid = Math.floor((low + high) / 2);
    const testInputs: SimulationInputs = {
      ...inputs,
      monthlyWithdrawal: mid,
    };

    // Conservative stress haircut (1.5% below historical mean)
    const conservativeCustomReturns = Array.from({ length: horizon }, () => ({
      b1: Math.max(0.01, (country.bucket1.nominalReturnMean - 1.2) / 100),
      b2: Math.max(0.02, (country.bucket2.nominalReturnMean - 1.5) / 100),
      b3: Math.max(0.04, (country.bucket3.nominalReturnMean - 2.5) / 100),
    }));

    const path = runDeterministicSimulation(testInputs, conservativeCustomReturns);
    const terminalCorpus = path[horizon - 1]?.totalCorpus || 0;
    const isDepleted = path.some((p) => p.isDepleted || p.totalCorpus <= 0);

    if (!isDepleted && terminalCorpus >= inputs.initialCorpus * 0.4) {
      bestSafeWithdrawal = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const roundUnit = inputs.baseCountry === 'IN' ? 500 : 50;
  return Math.max(roundUnit, Math.round(bestSafeWithdrawal / roundUnit) * roundUnit);
}
