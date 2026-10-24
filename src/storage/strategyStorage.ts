import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedStrategy, SimulationInputs } from '../engine/types';

const STORAGE_KEY = '@three_bucket_saved_strategies_v3';

export const DEFAULT_PRESETS: SavedStrategy[] = [
  {
    id: 'preset_balanced_classic',
    name: 'Classic Balanced (India ₹2 Cr)',
    createdAt: '2026-01-01T00:00:00.000Z',
    inputs: {
      initialCorpus: 20000000,
      monthlyWithdrawal: 65000,
      startDate: '01/01/2026',
      inflationRate: 6.0,
      bucket1Years: 3,
      bucket2Years: 7,
      mode: 'historical',
      baseCountry: 'IN',
      targetGrowthPercent: 60,
      multiCountryAllocations: [
        { country: 'IN', weight: 60, isManual: false },
        { country: 'US', weight: 40, isManual: false },
      ],
      simulationHorizon: 30,
      displayHorizon: 30,
      rebalancingFrictionRate: 0.15,
      manualReturns: { bucket1: 5.5, bucket2: 8.0, bucket3: 12.0 },
    },
  },
  {
    id: 'preset_fire_us',
    name: 'US Early FIRE ($1.5M)',
    createdAt: '2026-01-01T00:00:00.000Z',
    inputs: {
      initialCorpus: 1500000,
      monthlyWithdrawal: 5500,
      startDate: '01/01/2026',
      inflationRate: 2.8,
      bucket1Years: 3,
      bucket2Years: 6,
      mode: 'historical',
      baseCountry: 'US',
      targetGrowthPercent: 70,
      multiCountryAllocations: [
        { country: 'US', weight: 70, isManual: false },
        { country: 'EU', weight: 30, isManual: false },
      ],
      simulationHorizon: 40,
      displayHorizon: 30,
      rebalancingFrictionRate: 0.10,
      manualReturns: { bucket1: 3.2, bucket2: 4.8, bucket3: 10.2 },
    },
  },
  {
    id: 'preset_conservative_retiree',
    name: 'Conservative 50Y Lifelong Preservation (India ₹1.5 Cr)',
    createdAt: '2026-01-01T00:00:00.000Z',
    inputs: {
      initialCorpus: 15000000,
      monthlyWithdrawal: 45000,
      startDate: '01/01/2026',
      inflationRate: 5.5,
      bucket1Years: 4,
      bucket2Years: 8,
      mode: 'historical',
      baseCountry: 'IN',
      targetGrowthPercent: 50,
      multiCountryAllocations: [
        { country: 'IN', weight: 80, isManual: false },
        { country: 'US', weight: 20, isManual: false },
      ],
      simulationHorizon: 50,
      displayHorizon: 30,
      rebalancingFrictionRate: 0.15,
      manualReturns: { bucket1: 5.5, bucket2: 7.5, bucket3: 11.0 },
    },
  },
];

export async function getSavedStrategies(): Promise<SavedStrategy[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESETS));
      return DEFAULT_PRESETS;
    }
    const parsed: SavedStrategy[] = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Failed to load saved strategies from AsyncStorage:', err);
    return DEFAULT_PRESETS;
  }
}

export async function saveNewStrategy(
  name: string,
  inputs: SimulationInputs
): Promise<SavedStrategy[]> {
  try {
    const existing = await getSavedStrategies();
    const newEntry: SavedStrategy = {
      id: `strat_${Date.now()}`,
      name: name.trim() || `Strategy ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      inputs,
    };
    const updated = [newEntry, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save strategy:', err);
    throw err;
  }
}

export async function deleteSavedStrategy(id: string): Promise<SavedStrategy[]> {
  try {
    const existing = await getSavedStrategies();
    const updated = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete strategy:', err);
    throw err;
  }
}
