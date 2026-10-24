import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedStrategy, SimulationInputs } from '../engine/types';

const STORAGE_KEY = '@three_bucket_saved_strategies_v1';

export const DEFAULT_PRESETS: SavedStrategy[] = [
  {
    id: 'preset_balanced_classic',
    name: 'Classic Balanced (₹2 Cr Corpus)',
    createdAt: '2026-01-01T00:00:00.000Z',
    inputs: {
      initialCorpus: 20000000, // 2 Cr
      monthlyWithdrawal: 65000, // 65k / month
      startDate: '01/01/2026',
      inflationRate: 6.0,
      bucket1Years: 3,
      bucket2Years: 7,
      mode: 'historical',
      manualReturns: { bucket1: 5.5, bucket2: 8.0, bucket3: 12.0 },
    },
  },
  {
    id: 'preset_fire_early',
    name: 'Aggressive Early FIRE (₹3.5 Cr)',
    createdAt: '2026-01-01T00:00:00.000Z',
    inputs: {
      initialCorpus: 35000000, // 3.5 Cr
      monthlyWithdrawal: 100000, // 1 Lakh / month
      startDate: '01/01/2026',
      inflationRate: 6.5,
      bucket1Years: 2,
      bucket2Years: 6,
      mode: 'historical',
      manualReturns: { bucket1: 6.0, bucket2: 8.5, bucket3: 13.0 },
    },
  },
  {
    id: 'preset_conservative_retiree',
    name: 'Conservative Capital Preservation (₹1.5 Cr)',
    createdAt: '2026-01-01T00:00:00.000Z',
    inputs: {
      initialCorpus: 15000000, // 1.5 Cr
      monthlyWithdrawal: 45000, // 45k / month
      startDate: '01/01/2026',
      inflationRate: 5.5,
      bucket1Years: 4,
      bucket2Years: 8,
      mode: 'historical',
      manualReturns: { bucket1: 5.5, bucket2: 7.5, bucket3: 11.0 },
    },
  },
];

export async function getSavedStrategies(): Promise<SavedStrategy[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with default presets on first use
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
