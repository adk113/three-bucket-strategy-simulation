import { Platform } from 'react-native';
import { SimulationInputs, YearSimulationResult, MonteCarloSummary } from '../engine/types';
import { COUNTRY_METAS } from './currency';

/**
 * Builds a clean CSV string representing the entire simulation matrix,
 * parameters, and actuarial Monte Carlo projections.
 */
export function generateSimulationCSV(
  inputs: SimulationInputs,
  results: YearSimulationResult[],
  mcSummary: MonteCarloSummary
): string {
  const cMeta = COUNTRY_METAS[inputs.baseCountry || 'IN'] || COUNTRY_METAS.IN;
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString();

  const lines: string[] = [];

  // Metadata & Parameters
  lines.push(`"3-Bucket Retirement Wealth Strategy - Actuarial Simulation Report"`);
  lines.push(`"Generated On","${dateStr} ${timeStr}"`);
  lines.push(`"Base Country","${cMeta.name} (${cMeta.currencyCode} - ${cMeta.currencySymbol})"`);
  lines.push(`"Initial Total Corpus","${inputs.initialCorpus}"`);
  lines.push(`"Initial Monthly Living Expense","${inputs.monthlyWithdrawal}"`);
  lines.push(`"Annual Inflation Rate (%)","${inputs.inflationRate}%"`);
  lines.push(`"Bucket 1 Duration (Immediate Cash)","${inputs.bucket1Years} Years"`);
  lines.push(`"Bucket 2 Duration (Stable Income)","${inputs.bucket2Years} Years"`);
  lines.push(`"Simulation Horizon","${inputs.simulationHorizon} Years"`);
  lines.push(`"Display Horizon","${inputs.displayHorizon || inputs.simulationHorizon} Years"`);
  lines.push(`"Transaction / Rebalancing Friction","${inputs.rebalancingFrictionRate || 0.15}%"`);
  lines.push(`"Actuarial Success Rate (500 Runs)","${mcSummary.successRate}%"`);
  lines.push(`"Median Terminal Wealth","${mcSummary.medianBalanceTerminal}"`);
  lines.push(`"10th Percentile Terminal (Adverse Run)","${mcSummary.percentile10BalanceTerminal}"`);
  lines.push(`"90th Percentile Terminal (Bull Run)","${mcSummary.percentile90BalanceTerminal}"`);

  // Multi-Country Allocations
  const allocSummary = inputs.multiCountryAllocations
    .map((a) => `${a.country}: ${a.weight}%`)
    .join(' | ');
  lines.push(`"Bucket 3 Equity Geographic Blends","${allocSummary}"`);
  lines.push(''); // Blank line

  // Column Headers
  const headers = [
    'Year',
    'Calendar Year',
    'Net Total Corpus',
    'Bucket 1 (Liquid Cash)',
    'Bucket 2 (Stable Income)',
    'Bucket 3 (Growth Equity)',
    'Annual Living Withdrawal',
    'Inflation Adjusted Real Power',
    'B1 Refill from B2',
    'B2 Refill from B3',
    'Friction Cost',
    'Equity Return (%)',
    'Bear Defense Active',
    'Corpus Depleted',
    'MC Median Trajectory',
    'MC 10th Percentile (Stress Test)',
    'MC 90th Percentile (Favorable)',
  ];
  lines.push(headers.map((h) => `"${h}"`).join(','));

  // Row Data
  results.forEach((row, idx) => {
    const mcMedian = mcSummary.medianTrajectory[idx] !== undefined ? Math.round(mcSummary.medianTrajectory[idx]) : '';
    const mcP10 = mcSummary.p10Trajectory[idx] !== undefined ? Math.round(mcSummary.p10Trajectory[idx]) : '';
    const mcP90 = mcSummary.p90Trajectory[idx] !== undefined ? Math.round(mcSummary.p90Trajectory[idx]) : '';

    const rowValues = [
      row.year,
      row.calendarYear,
      Math.round(row.totalCorpus),
      Math.round(row.bucket1),
      Math.round(row.bucket2),
      Math.round(row.bucket3),
      Math.round(row.withdrawalAmount),
      Math.round(row.realPurchasingPower),
      Math.round(row.bucket1RefilledFromB2),
      Math.round(row.bucket2RefilledFromB3),
      Math.round(row.rebalanceFrictionCost),
      row.marketReturnB3 !== undefined ? Number(row.marketReturnB3).toFixed(2) : '0.00',
      row.bearMarketDefenseActive ? 'YES' : 'NO',
      row.isDepleted ? 'DEPLETED' : 'SOLVENT',
      mcMedian,
      mcP10,
      mcP90,
    ];

    lines.push(rowValues.map((v) => `"${v}"`).join(','));
  });

  return lines.join('\r\n');
}

/**
 * Triggers native share sheet (iOS/Android) or initiates a CSV download (Web).
 */
export async function exportSimulationBreakdown(
  inputs: SimulationInputs,
  results: YearSimulationResult[],
  mcSummary: MonteCarloSummary
): Promise<{ success: boolean; message: string }> {
  try {
    const csvContent = generateSimulationCSV(inputs, results, mcSummary);
    const dateStamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `3_Bucket_Simulation_${inputs.baseCountry}_${dateStamp}.csv`;

    if (Platform.OS === 'web') {
      // Browser environment: trigger file download via Blob & synthetic <a> anchor
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { success: true, message: `Report exported as ${fileName}` };
      }
      return { success: false, message: 'Web document environment not accessible.' };
    } else {
      // Native iOS / Android environment using modern Expo FileSystem SDK 58 API
      const { File, Paths } = await import('expo-file-system');
      const Sharing = await import('expo-sharing');

      const file = new File(Paths.cache, fileName);
      await file.write(csvContent);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export 3-Bucket Strategy Simulation Report',
          UTI: 'public.comma-separated-values-text',
        });
        return { success: true, message: 'Export sheet opened successfully.' };
      } else {
        return {
          success: false,
          message: 'Sharing is not supported on this device. File saved to cache.',
        };
      }
    }
  } catch (error: any) {
    console.error('Failed to export simulation CSV:', error);
    return {
      success: false,
      message: error?.message || 'An error occurred during data export.',
    };
  }
}
