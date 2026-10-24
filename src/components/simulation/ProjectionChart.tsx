import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Svg, {
  Rect,
  Path,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { PALETTE } from '../../theme/colors';
import { MonteCarloSummary, YearSimulationResult } from '../../engine/types';
import { BarChart3, LineChart, Layers } from 'lucide-react-native';

interface ProjectionChartProps {
  results: YearSimulationResult[];
  mcSummary: MonteCarloSummary;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({
  results,
  mcSummary,
}) => {
  const { colors, theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<'stacked' | 'montecarlo'>('stacked');
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(14); // Year 15 default

  // Responsive chart width
  const containerWidth = Math.min(windowWidth - 36, 850);
  const chartHeight = 260;
  const paddingLeft = 46;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 32;

  const innerWidth = containerWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Max corpus across 30 years for scaling
  const maxStackTotal = Math.max(
    ...results.map((r) => r.totalCorpus),
    1
  );
  const maxMCTotal = Math.max(
    ...mcSummary.p90Trajectory,
    ...mcSummary.medianTrajectory,
    1
  );
  const maxVal = activeTab === 'stacked' ? maxStackTotal * 1.15 : maxMCTotal * 1.15;

  const scaleY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxVal));
    return paddingTop + innerHeight - (clamped / maxVal) * innerHeight;
  };

  const scaleX = (index: number) => {
    return paddingLeft + (index / 29) * innerWidth;
  };

  const formatShort = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
    return `₹${Math.round(val / 1000)}k`;
  };

  // Stacked Area Paths
  const buildStackedAreaPaths = () => {
    if (results.length === 0) return { b1Path: '', b2Path: '', b3Path: '' };

    // Point calculations
    // Base = 0
    // L1 = B1
    // L2 = B1 + B2
    // L3 = B1 + B2 + B3
    const bottomY = scaleY(0);

    let b1Line = '';
    let b2Line = '';
    let b3Line = '';

    results.forEach((r, idx) => {
      const x = scaleX(idx);
      const yB1 = scaleY(r.bucket1);
      const yB2 = scaleY(r.bucket1 + r.bucket2);
      const yB3 = scaleY(r.bucket1 + r.bucket2 + r.bucket3);

      if (idx === 0) {
        b1Line += `M ${x} ${yB1}`;
        b2Line += `M ${x} ${yB2}`;
        b3Line += `M ${x} ${yB3}`;
      } else {
        b1Line += ` L ${x} ${yB1}`;
        b2Line += ` L ${x} ${yB2}`;
        b3Line += ` L ${x} ${yB3}`;
      }
    });

    // Close paths
    const lastX = scaleX(29);
    const firstX = scaleX(0);

    const b1Path = `${b1Line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    const b2Path = `${b2Line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    const b3Path = `${b3Line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return { b1Path, b2Path, b3Path };
  };

  // Monte Carlo Paths (P10, P50, P90)
  const buildMCPaths = () => {
    let p90Line = '';
    let p50Line = '';
    let p10Line = '';

    for (let i = 0; i < 30; i++) {
      const x = scaleX(i);
      const yP90 = scaleY(mcSummary.p90Trajectory[i] || 0);
      const yP50 = scaleY(mcSummary.medianTrajectory[i] || 0);
      const yP10 = scaleY(mcSummary.p10Trajectory[i] || 0);

      if (i === 0) {
        p90Line += `M ${x} ${yP90}`;
        p50Line += `M ${x} ${yP50}`;
        p10Line += `M ${x} ${yP10}`;
      } else {
        p90Line += ` L ${x} ${yP90}`;
        p50Line += ` L ${x} ${yP50}`;
        p10Line += ` L ${x} ${yP10}`;
      }
    }

    // Band path between P90 and P10
    let bandPath = p90Line;
    for (let i = 29; i >= 0; i--) {
      const x = scaleX(i);
      const yP10 = scaleY(mcSummary.p10Trajectory[i] || 0);
      bandPath += ` L ${x} ${yP10}`;
    }
    bandPath += ' Z';

    return { p90Line, p50Line, p10Line, bandPath };
  };

  const { b1Path, b2Path, b3Path } = buildStackedAreaPaths();
  const { p90Line, p50Line, p10Line, bandPath } = buildMCPaths();

  const selectedData = results[selectedYearIndex] || results[0];

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
      {/* Header and Mode Toggle */}
      <View style={styles.chartHeader}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            30-Year Portfolio Trajectory
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {activeTab === 'stacked'
              ? 'Multi-Bucket Waterfall Breakdown'
              : 'Monte Carlo Stochastic Confidence Cone'}
          </Text>
        </View>

        <View style={[styles.tabToggle, { backgroundColor: colors.surfaceElevated }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('stacked')}
            style={[
              styles.tabBtn,
              activeTab === 'stacked' && { backgroundColor: colors.accent },
            ]}
          >
            <Layers
              size={14}
              color={activeTab === 'stacked' ? '#FFFFFF' : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'stacked' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Buckets
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('montecarlo')}
            style={[
              styles.tabBtn,
              activeTab === 'montecarlo' && { backgroundColor: colors.accent },
            ]}
          >
            <LineChart
              size={14}
              color={activeTab === 'montecarlo' ? '#FFFFFF' : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'montecarlo' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Risk Cone
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SVG Chart Canvas */}
      <View style={styles.svgWrapper}>
        <Svg width={containerWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="b3Grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={PALETTE.bucket3.base} stopOpacity="0.85" />
              <Stop offset="100%" stopColor={PALETTE.bucket3.dark} stopOpacity="0.45" />
            </LinearGradient>
            <LinearGradient id="b2Grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={PALETTE.bucket2.base} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={PALETTE.bucket2.dark} stopOpacity="0.55" />
            </LinearGradient>
            <LinearGradient id="b1Grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={PALETTE.bucket1.base} stopOpacity="0.95" />
              <Stop offset="100%" stopColor={PALETTE.bucket1.dark} stopOpacity="0.75" />
            </LinearGradient>
            <LinearGradient id="mcConeGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#818CF8" stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingTop + innerHeight * (1 - pct);
            const gridVal = maxVal * pct;
            return (
              <G key={`grid-${i}`}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={containerWidth - paddingRight}
                  y2={y}
                  stroke={colors.borderSubtle}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <SvgText
                  x={paddingLeft - 6}
                  y={y + 4}
                  fill={colors.textMuted}
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="System"
                >
                  {formatShort(gridVal)}
                </SvgText>
              </G>
            );
          })}

          {/* X Axis Ticks */}
          {[1, 5, 10, 15, 20, 25, 30].map((yr) => {
            const x = scaleX(yr - 1);
            return (
              <G key={`x-${yr}`}>
                <Line
                  x1={x}
                  y1={paddingTop + innerHeight}
                  x2={x}
                  y2={paddingTop + innerHeight + 4}
                  stroke={colors.borderSubtle}
                  strokeWidth="1"
                />
                <SvgText
                  x={x}
                  y={paddingTop + innerHeight + 16}
                  fill={colors.textMuted}
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="System"
                >
                  Y{yr}
                </SvgText>
              </G>
            );
          })}

          {/* Stacked Chart Layer */}
          {activeTab === 'stacked' ? (
            <G>
              {/* Bucket 3 (Bottom-most in visual stack, covers B1+B2+B3) */}
              <Path d={b3Path} fill="url(#b3Grad)" />
              {/* Bucket 2 (Covers B1+B2) */}
              <Path d={b2Path} fill="url(#b2Grad)" />
              {/* Bucket 1 (Covers B1 only) */}
              <Path d={b1Path} fill="url(#b1Grad)" />
            </G>
          ) : (
            /* Monte Carlo Risk Cone Layer */
            <G>
              {/* Confidence Band (10th to 90th percentile) */}
              <Path d={bandPath} fill="url(#mcConeGrad)" />
              {/* 90th Percentile (Bull) */}
              <Path
                d={p90Line}
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              {/* 50th Percentile (Median) */}
              <Path d={p50Line} fill="none" stroke="#38BDF8" strokeWidth="2.5" />
              {/* 10th Percentile (Bear) */}
              <Path
                d={p10Line}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            </G>
          )}

          {/* Vertical cursor indicator */}
          <Line
            x1={scaleX(selectedYearIndex)}
            y1={paddingTop}
            x2={scaleX(selectedYearIndex)}
            y2={paddingTop + innerHeight}
            stroke={colors.accent}
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          <Circle
            cx={scaleX(selectedYearIndex)}
            cy={scaleY(selectedData.totalCorpus)}
            r="4.5"
            fill={colors.accent}
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        </Svg>
      </View>

      {/* Year Selector Slider / Chips */}
      <View style={styles.yearScrollContainer}>
        <Text style={[styles.inspectPrompt, { color: colors.textMuted }]}>
          Tap year to inspect details:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
          {results.map((r, idx) => {
            const isSelected = idx === selectedYearIndex;
            return (
              <TouchableOpacity
                key={r.year}
                onPress={() => setSelectedYearIndex(idx)}
                style={[
                  styles.yearPill,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surfaceElevated,
                    borderColor: isSelected ? colors.accent : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.yearPillText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  Y{r.year}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected Year Detail Inspector Card */}
      <View style={[styles.inspectorCard, { backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.inspectorHeader}>
          <Text style={[styles.inspectorYearTitle, { color: colors.textPrimary }]}>
            Year {selectedData.year} ({selectedData.calendarYear})
          </Text>
          <Text style={[styles.inspectorTotalVal, { color: colors.accent }]}>
            Total: {formatShort(selectedData.totalCorpus)}
          </Text>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: PALETTE.bucket1.base }]} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>B1 (Cash):</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {formatShort(selectedData.bucket1)}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: PALETTE.bucket2.base }]} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>B2 (Stable):</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {formatShort(selectedData.bucket2)}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: PALETTE.bucket3.base }]} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>B3 (Growth):</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {formatShort(selectedData.bucket3)}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: '#F43F5E' }]} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Withdrawal:</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {formatShort(selectedData.withdrawalAmount)}
            </Text>
          </View>
        </View>

        {selectedData.bucket1RefilledFromB2 > 0 || selectedData.bucket2RefilledFromB3 > 0 ? (
          <View style={styles.refillAlert}>
            <Text style={[styles.refillAlertText, { color: colors.accent }]}>
              Waterfall refill triggered:{' '}
              {selectedData.bucket1RefilledFromB2 > 0
                ? `B2→B1 (${formatShort(selectedData.bucket1RefilledFromB2)}) `
                : ''}
              {selectedData.bucket2RefilledFromB3 > 0
                ? `B3→B2 (${formatShort(selectedData.bucket2RefilledFromB3)})`
                : ''}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginVertical: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
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
  tabToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  svgWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  yearScrollContainer: {
    marginTop: 8,
  },
  inspectPrompt: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  yearScroll: {
    flexDirection: 'row',
  },
  yearPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  yearPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inspectorCard: {
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inspectorYearTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  inspectorTotalVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
  },
  metricDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  metricLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  refillAlert: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  refillAlertText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
