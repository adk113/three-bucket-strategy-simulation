import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  TrendingUp,
  Percent,
  History,
  Activity,
  Target,
  Scale,
  Zap,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import {
  MonteCarloSummary,
  StrategyInsight,
  WealthModelType,
  HistoricalBacktestResult,
  RollingReturnsResult,
  StressTestResult,
  GoalsBasedResult,
  ModelComparisonSummary,
} from '../../engine/types';
import { SupportedCountry, formatCurrency } from '../../utils/currency';

interface InsightsPanelProps {
  insights: StrategyInsight[];
  mcSummary: MonteCarloSummary;
  baseCountry: SupportedCountry;
  simulationHorizon: number;
  selectedModel?: WealthModelType;
  historicalBacktest?: HistoricalBacktestResult;
  rollingReturns?: RollingReturnsResult;
  stressTest?: StressTestResult;
  goalsBased?: GoalsBasedResult;
  modelComparison?: ModelComparisonSummary;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  mcSummary,
  baseCountry = 'IN',
  simulationHorizon = 30,
  selectedModel = 'monte_carlo',
  historicalBacktest,
  rollingReturns,
  stressTest,
  goalsBased,
  modelComparison,
}) => {
  const { colors, theme } = useTheme();

  // Header Title & Subtitle based on the active model
  const headerMeta = (() => {
    switch (selectedModel) {
      case 'historical_backtest':
        return {
          title: `Historical Crash Resilience Diagnostic`,
          subtitle: `Replaying real market data from ${historicalBacktest?.title || 'Historical Crisis'} (${simulationHorizon}-year horizon)`,
          icon: <History size={20} color="#F59E0B" style={{ marginRight: 8 }} />,
        };
      case 'rolling_returns':
        return {
          title: `Rolling Returns & Horizon Consistency Diagnostic`,
          subtitle: `Overlapping ${rollingReturns?.windowYears || 5}-year holding blocks to eliminate start-date sequence luck`,
          icon: <Activity size={20} color="#10B981" style={{ marginRight: 8 }} />,
        };
      case 'stress_testing':
        return {
          title: `Deterministic Macro Shock Diagnostic`,
          subtitle: `Evaluating tail-risk solvency under acute macroeconomic shock parameters`,
          icon: <Zap size={20} color="#EC4899" style={{ marginRight: 8 }} />,
        };
      case 'goals_based':
        return {
          title: `Goals-Based Wealth Management (GBWM) Diagnostic`,
          subtitle: `Asset-Liability Matching (ALM): Discrete milestone earmarking & legacy surplus`,
          icon: <Target size={20} color="#8B5CF6" style={{ marginRight: 8 }} />,
        };
      case 'comparison':
        return {
          title: `Cross-Model Analytical Consensus Diagnostic`,
          subtitle: `Simultaneous comparative validation across all 5 institutional wealth methodologies`,
          icon: <Scale size={20} color="#6366F1" style={{ marginRight: 8 }} />,
        };
      default:
        return {
          title: `Statistical Insights & Risk Diagnostic`,
          subtitle: `Actuarial Monte Carlo analysis across 500 stochastic market cycles (${simulationHorizon}-year horizon)`,
          icon: <Percent size={20} color={colors.accent} style={{ marginRight: 8 }} />,
        };
    }
  })();

  const isDepletionRiskHigh =
    selectedModel === 'historical_backtest'
      ? !(historicalBacktest?.survived ?? true)
      : selectedModel === 'stress_testing'
      ? !(stressTest?.survived ?? true)
      : selectedModel === 'goals_based'
      ? !(goalsBased?.allMilestonesFunded ?? true)
      : mcSummary.successRate < 85;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceCard,
          borderColor: colors.border,
          shadowColor: colors.cardShadow,
        },
      ]}
    >
      {/* Dynamic Header */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {headerMeta.icon}
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {headerMeta.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {headerMeta.subtitle}
            </Text>
          </View>
        </View>
      </View>

      {/* Prominent Depletion / Stress Warning Banner if risk is elevated */}
      {isDepletionRiskHigh ? (
        <View
          style={[
            styles.depletionBanner,
            {
              backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
              borderColor: 'rgba(239, 68, 68, 0.4)',
            },
          ]}
        >
          <AlertTriangle size={22} color="#EF4444" style={{ marginRight: 10, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.depletionTitle, { color: '#EF4444' }]}>
              {selectedModel === 'historical_backtest'
                ? `Crisis Drawdown Vulnerability Detected`
                : selectedModel === 'stress_testing'
                ? `Macroeconomic Ruin Warning`
                : selectedModel === 'goals_based'
                ? `Milestone Funding Shortfall Detected`
                : `Depletion Alert: High Probability of Premature Exhaustion`}
            </Text>
            <Text style={[styles.depletionDesc, { color: theme === 'dark' ? '#FCA5A5' : '#991B1B' }]}>
              {selectedModel === 'historical_backtest'
                ? `Under real historical crash data, the maximum drawdown of -${historicalBacktest?.maxDrawdownPct}% exhausted defensive buffers. Consider expanding Bucket 1 cash or Bucket 2 debt to insulate equities.`
                : selectedModel === 'stress_testing'
                ? `The acute macroeconomic shock severely compressed liquid cushions. Tap "Suggest Safe" to recalibrate living withdrawals.`
                : selectedModel === 'goals_based'
                ? `Current corpus and withdrawal speed fund only a portion of earmarked life milestones without jeopardizing late-stage longevity.`
                : `The probabilistic engine indicates a ${(100 - mcSummary.successRate).toFixed(
                    1
                  )}% chance that capital exhausts before Year ${simulationHorizon}. Tap "Suggest Safe" to calibrate monthly withdrawals.`}
            </Text>
          </View>
        </View>
      ) : null}

      {/* 3 Metric Summary Badges Tailored to the Selected Model */}
      <View style={styles.summaryGrid}>
        {selectedModel === 'historical_backtest' && historicalBacktest ? (
          <>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <TrendingUp size={14} color={historicalBacktest.survived ? '#10B981' : '#EF4444'} />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Max Drawdown</Text>
              </View>
              <Text style={[styles.statValue, { color: historicalBacktest.survived ? '#F59E0B' : '#EF4444' }]}>
                -{historicalBacktest.maxDrawdownPct}%
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Trough Year {historicalBacktest.troughYear}
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <ShieldAlert size={14} color="#38BDF8" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Recovery Time</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {historicalBacktest.recoveryYears ? `Year ${historicalBacktest.recoveryYears}` : 'Protected'}
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Pre-Crisis Peak Restored
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Terminal Balance</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {formatCurrency(historicalBacktest.terminalBalance, baseCountry)}
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Final Wealth @ {simulationHorizon}Y
              </Text>
            </View>
          </>
        ) : selectedModel === 'rolling_returns' && rollingReturns ? (
          <>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <Percent size={14} color="#10B981" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Positive Odds</Text>
              </View>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {rollingReturns.positiveReturnProbabilityPct}%
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Over {rollingReturns.windowYears}Y Holding Blocks
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <TrendingUp size={14} color="#38BDF8" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Median Return</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                +{rollingReturns.medianReturnPct}% p.a.
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Annualized Compound
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <ShieldAlert size={14} color="#F59E0B" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Worst Block Floor</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                +{rollingReturns.minReturnPct}% p.a.
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Historical Lower Bound
              </Text>
            </View>
          </>
        ) : selectedModel === 'stress_testing' && stressTest ? (
          <>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <ShieldAlert size={14} color={stressTest.cushionRemainingPct >= 50 ? '#10B981' : '#F59E0B'} />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Solvency Cushion</Text>
              </View>
              <Text style={[styles.statValue, { color: stressTest.cushionRemainingPct >= 50 ? '#10B981' : '#F59E0B' }]}>
                {stressTest.cushionRemainingPct}%
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Lowest Point Reserve
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <TrendingUp size={14} color="#EC4899" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Corpus Trough</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {formatCurrency(stressTest.lowestCorpusTrough, baseCountry)}
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Lowest Dip at Year {stressTest.troughYear}
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Post-Shock Terminal</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {formatCurrency(stressTest.terminalBalance, baseCountry)}
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Final Wealth Rebound
              </Text>
            </View>
          </>
        ) : selectedModel === 'goals_based' && goalsBased ? (
          <>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <Target size={14} color={goalsBased.allMilestonesFunded ? '#10B981' : '#8B5CF6'} />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Milestones Funded</Text>
              </View>
              <Text style={[styles.statValue, { color: goalsBased.allMilestonesFunded ? '#10B981' : '#8B5CF6' }]}>
                {goalsBased.milestoneStatuses.filter((s) => s.isFullyFunded).length}/{goalsBased.milestoneStatuses.length}
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                100% Solvency Rate
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <ShieldAlert size={14} color="#38BDF8" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Short Runway</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {goalsBased.shortTermRunwayYears} Years
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Bucket 1 Living Buffer
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <TrendingUp size={14} color="#F59E0B" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Legacy Surplus</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {formatCurrency(goalsBased.terminalLegacySurplus, baseCountry)}
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Final Generational Transfer
              </Text>
            </View>
          </>
        ) : selectedModel === 'comparison' && modelComparison ? (
          <>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <Scale size={14} color="#6366F1" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Model Consensus</Text>
              </View>
              <Text style={[styles.statValue, { color: '#6366F1' }]}>
                5 Overlaid
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Unified Evaluation
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <TrendingUp size={14} color="#38BDF8" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Monte Carlo P50</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {formatCurrency(mcSummary.medianBalanceTerminal, baseCountry)}
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Expected Base Path
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <ShieldAlert size={14} color="#10B981" />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Survival Odds</Text>
              </View>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {mcSummary.successRate}%
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                500-Run Stochastic Viability
              </Text>
            </View>
          </>
        ) : (
          /* Default: Monte Carlo 3 Cards */
          <>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <Percent size={14} color={mcSummary.successRate >= 90 ? '#10B981' : '#F59E0B'} />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Success Rate</Text>
              </View>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      mcSummary.successRate >= 90
                        ? '#10B981'
                        : mcSummary.successRate >= 75
                        ? '#F59E0B'
                        : '#EF4444',
                  },
                ]}
              >
                {mcSummary.successRate}%
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                {simulationHorizon}-Year Longevity
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <TrendingUp size={14} color={colors.accent} />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Median Terminal (P50)
                </Text>
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {formatCurrency(mcSummary.medianBalanceTerminal, baseCountry)}
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Expected Final Wealth
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <View style={styles.statIconRow}>
                <ShieldAlert
                  size={14}
                  color={mcSummary.percentile10BalanceTerminal > 0 ? '#10B981' : '#EF4444'}
                />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Bear Case (P10)
                </Text>
              </View>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      mcSummary.percentile10BalanceTerminal > 0 ? colors.textPrimary : '#EF4444',
                  },
                ]}
              >
                {formatCurrency(mcSummary.percentile10BalanceTerminal, baseCountry)}
              </Text>
              <Text style={[styles.statSub, { color: colors.textMuted }]}>
                Severe Market Stress
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Dynamic Actionable Suggestions List Tailored to Model */}
      <View style={styles.insightsList}>
        {insights.map((ins, idx) => {
          let icon = <Info size={18} color={colors.accent} />;
          let borderColor = colors.borderSubtle;

          if (ins.type === 'success') {
            icon = <CheckCircle2 size={18} color="#10B981" />;
            borderColor = 'rgba(16, 185, 129, 0.3)';
          } else if (ins.type === 'warning') {
            icon = <AlertTriangle size={18} color="#F59E0B" />;
            borderColor = 'rgba(245, 158, 11, 0.3)';
          } else if (ins.type === 'danger') {
            icon = <AlertTriangle size={18} color="#EF4444" />;
            borderColor = 'rgba(239, 68, 68, 0.3)';
          }

          return (
            <View
              key={idx}
              style={[
                styles.insightItem,
                { backgroundColor: colors.surfaceElevated, borderColor },
              ]}
            >
              <View style={styles.insightIconBox}>{icon}</View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>
                  {ins.title}
                </Text>
                <Text style={[styles.insightMessage, { color: colors.textSecondary }]}>
                  {ins.message}
                </Text>
                {ins.recommendation ? (
                  <View style={styles.recomBox}>
                    <Text style={[styles.recomLabel, { color: colors.accent }]}>
                      Recommendation:{' '}
                    </Text>
                    <Text style={[styles.recomText, { color: colors.textPrimary }]}>
                      {ins.recommendation}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginVertical: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  depletionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1.2,
    padding: 14,
    marginBottom: 14,
  },
  depletionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  depletionDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  statSub: {
    fontSize: 10,
    marginTop: 2,
  },
  insightsList: {
    gap: 10,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  insightIconBox: {
    marginRight: 12,
    marginTop: 2,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  insightMessage: {
    fontSize: 12,
    lineHeight: 17,
  },
  recomBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  recomLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  recomText: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
  },
});
