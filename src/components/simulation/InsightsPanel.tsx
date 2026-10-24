import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  TrendingUp,
  Percent,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { MonteCarloSummary, StrategyInsight } from '../../engine/types';
import { PALETTE } from '../../theme/colors';

interface InsightsPanelProps {
  insights: StrategyInsight[];
  mcSummary: MonteCarloSummary;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  mcSummary,
}) => {
  const { colors, theme } = useTheme();

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString()}`;
  };

  const isDepletionRiskHigh = mcSummary.successRate < 85;

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
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Statistical Insights & Risk Diagnostic
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Monte Carlo actuarial analysis across 500 randomized market cycles
          </Text>
        </View>
      </View>

      {/* Prominent Depletion Warning Banner if risk is elevated */}
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
              Depletion Alert: High Probability of Capital Exhaustion
            </Text>
            <Text style={[styles.depletionDesc, { color: theme === 'dark' ? '#FCA5A5' : '#991B1B' }]}>
              The probabilistic model detects that your current withdrawal pace has a{' '}
              {(100 - mcSummary.successRate).toFixed(1)}% chance of depleting the entire corpus
              within 30 years
              {mcSummary.earliestDepletionYear
                ? ` (earliest simulated depletion around Year ${mcSummary.earliestDepletionYear})`
                : ''}
              . Tap "Suggest Safe Withdrawal" to restore longevity.
            </Text>
          </View>
        </View>
      ) : null}

      {/* 3 Metric Summary Badges */}
      <View style={styles.summaryGrid}>
        {/* Success Rate */}
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <View style={styles.statIconRow}>
            <Percent size={14} color={mcSummary.successRate >= 90 ? '#10B981' : '#F59E0B'} />
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Success Rate
            </Text>
          </View>
          <Text
            style={[
              styles.statValue,
              { color: mcSummary.successRate >= 90 ? '#10B981' : mcSummary.successRate >= 75 ? '#F59E0B' : '#EF4444' },
            ]}
          >
            {mcSummary.successRate}%
          </Text>
          <Text style={[styles.statSub, { color: colors.textMuted }]}>
            30-Year Survival
          </Text>
        </View>

        {/* Median Year 30 Balance */}
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <View style={styles.statIconRow}>
            <TrendingUp size={14} color={colors.accent} />
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Median Terminal (P50)
            </Text>
          </View>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {formatCurrency(mcSummary.medianBalanceYear30)}
          </Text>
          <Text style={[styles.statSub, { color: colors.textMuted }]}>
            Expected Year 30 Wealth
          </Text>
        </View>

        {/* 10th Percentile Bear Case */}
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <View style={styles.statIconRow}>
            <ShieldAlert size={14} color={mcSummary.percentile10BalanceYear30 > 0 ? '#10B981' : '#EF4444'} />
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Bear Case (P10)
            </Text>
          </View>
          <Text
            style={[
              styles.statValue,
              { color: mcSummary.percentile10BalanceYear30 > 0 ? colors.textPrimary : '#EF4444' },
            ]}
          >
            {formatCurrency(mcSummary.percentile10BalanceYear30)}
          </Text>
          <Text style={[styles.statSub, { color: colors.textMuted }]}>
            Severe Market Stress
          </Text>
        </View>
      </View>

      {/* Dynamic Actionable Suggestions List */}
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
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor,
                },
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
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
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
    fontSize: 18,
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
