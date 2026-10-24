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
import { LineChart, Layers, ShieldCheck, ArrowRightLeft } from 'lucide-react-native';
import { SupportedCountry, formatCurrency, formatShortAxis } from '../../utils/currency';

interface ProjectionChartProps {
  results: YearSimulationResult[];
  mcSummary: MonteCarloSummary;
  displayHorizon: number;
  baseCountry: SupportedCountry;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({
  results,
  mcSummary,
  displayHorizon = 30,
  baseCountry = 'IN',
}) => {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<'stacked' | 'montecarlo'>('stacked');
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(
    Math.min(displayHorizon - 1, 9)
  );

  // Slice results according to user's customized Display Horizon
  const effectiveHorizon = Math.min(results.length, Math.max(5, displayHorizon));
  const displayedResults = results.slice(0, effectiveHorizon);
  const displayedMedian = mcSummary.medianTrajectory.slice(0, effectiveHorizon);
  const displayedP10 = mcSummary.p10Trajectory.slice(0, effectiveHorizon);
  const displayedP90 = mcSummary.p90Trajectory.slice(0, effectiveHorizon);

  // Responsive chart width
  const containerWidth = Math.min(windowWidth - 36, 850);
  const chartHeight = 260;
  const paddingLeft = 52;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 32;

  const innerWidth = containerWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxStackTotal = Math.max(...displayedResults.map((r) => r.totalCorpus), 1);
  const maxMCTotal = Math.max(...displayedP90, ...displayedMedian, 1);
  const maxVal = activeTab === 'stacked' ? maxStackTotal * 1.15 : maxMCTotal * 1.15;

  const scaleY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxVal));
    return paddingTop + innerHeight - (clamped / maxVal) * innerHeight;
  };

  const scaleX = (index: number) => {
    const divisor = Math.max(1, effectiveHorizon - 1);
    return paddingLeft + (index / divisor) * innerWidth;
  };

  // Stacked Area Paths
  const buildStackedAreaPaths = () => {
    if (displayedResults.length === 0) return { b1Path: '', b2Path: '', b3Path: '' };

    const bottomY = scaleY(0);
    let b1Line = '';
    let b2Line = '';
    let b3Line = '';

    displayedResults.forEach((r, idx) => {
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

    const lastX = scaleX(effectiveHorizon - 1);
    const firstX = scaleX(0);

    const b1Path = `${b1Line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    const b2Path = `${b2Line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    const b3Path = `${b3Line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return { b1Path, b2Path, b3Path };
  };

  // Monte Carlo Paths
  const buildMCPaths = () => {
    let p90Line = '';
    let p50Line = '';
    let p10Line = '';

    for (let i = 0; i < effectiveHorizon; i++) {
      const x = scaleX(i);
      const yP90 = scaleY(displayedP90[i] || 0);
      const yP50 = scaleY(displayedMedian[i] || 0);
      const yP10 = scaleY(displayedP10[i] || 0);

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

    let bandPath = p90Line;
    for (let i = effectiveHorizon - 1; i >= 0; i--) {
      const x = scaleX(i);
      const yP10 = scaleY(displayedP10[i] || 0);
      bandPath += ` L ${x} ${yP10}`;
    }
    bandPath += ' Z';

    return { p90Line, p50Line, p10Line, bandPath };
  };

  const { b1Path, b2Path, b3Path } = buildStackedAreaPaths();
  const { p90Line, p50Line, p10Line, bandPath } = buildMCPaths();

  const selectedData = displayedResults[selectedYearIndex] || displayedResults[0];

  // Dynamic X-axis tick generator based on display horizon
  const generateXTicks = () => {
    const step = effectiveHorizon <= 15 ? 2 : effectiveHorizon <= 25 ? 5 : 5;
    const ticks: number[] = [1];
    for (let y = step; y < effectiveHorizon; y += step) {
      if (y !== 1 && y !== effectiveHorizon) ticks.push(y);
    }
    ticks.push(effectiveHorizon);
    return ticks;
  };

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
      <View style={styles.chartHeader}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Portfolio Trajectory ({effectiveHorizon} Years)
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {activeTab === 'stacked'
              ? 'Multi-Bucket Waterfall Breakdown & Rebalancing'
              : 'Monte Carlo Stochastic Risk Cone (P10 - P50 - P90)'}
          </Text>
        </View>

        <View style={[styles.tabToggle, { backgroundColor: colors.surfaceElevated }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('stacked')}
            style={[styles.tabBtn, activeTab === 'stacked' && { backgroundColor: colors.accent }]}
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
            style={[styles.tabBtn, activeTab === 'montecarlo' && { backgroundColor: colors.accent }]}
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

      {/* SVG Canvas */}
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

          {/* Horizontal Grid */}
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
                  {formatShortAxis(gridVal, baseCountry)}
                </SvgText>
              </G>
            );
          })}

          {/* Dynamic X Axis Ticks */}
          {generateXTicks().map((yr) => {
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

          {/* Layer 1: Stacked Waterfall Area */}
          {activeTab === 'stacked' ? (
            <G>
              <Path d={b3Path} fill="url(#b3Grad)" />
              <Path d={b2Path} fill="url(#b2Grad)" />
              <Path d={b1Path} fill="url(#b1Grad)" />
            </G>
          ) : (
            /* Layer 2: Monte Carlo Risk Cone */
            <G>
              <Path d={bandPath} fill="url(#mcConeGrad)" />
              <Path
                d={p90Line}
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <Path d={p50Line} fill="none" stroke="#38BDF8" strokeWidth="2.5" />
              <Path
                d={p10Line}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            </G>
          )}

          {/* Vertical cursor */}
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

      {/* Year Selector Chips */}
      <View style={styles.yearScrollContainer}>
        <Text style={[styles.inspectPrompt, { color: colors.textMuted }]}>
          Inspect Year Details (Up to {effectiveHorizon} Years):
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
          {displayedResults.map((r, idx) => {
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

      {/* Year Inspector Card */}
      <View style={[styles.inspectorCard, { backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.inspectorHeader}>
          <Text style={[styles.inspectorYearTitle, { color: colors.textPrimary }]}>
            Year {selectedData.year} ({selectedData.calendarYear})
          </Text>
          <Text style={[styles.inspectorTotalVal, { color: colors.accent }]}>
            Total: {formatCurrency(selectedData.totalCorpus, baseCountry)}
          </Text>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: PALETTE.bucket1.base }]} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>B1 (Cash):</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {formatCurrency(selectedData.bucket1, baseCountry)}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: PALETTE.bucket2.base }]} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>B2 (Stable):</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {formatCurrency(selectedData.bucket2, baseCountry)}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: PALETTE.bucket3.base }]} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>B3 (Growth):</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {formatCurrency(selectedData.bucket3, baseCountry)}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: '#F43F5E' }]} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Withdrawal:</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {formatCurrency(selectedData.withdrawalAmount, baseCountry)}
            </Text>
          </View>
        </View>

        {/* Detailed Waterfall Rebalance & Defense Notifications */}
        {selectedData.bucket1RefilledFromB2 > 0 ||
        selectedData.bucket2RefilledFromB3 > 0 ||
        selectedData.bearMarketDefenseActive ? (
          <View style={styles.waterfallAudit}>
            {selectedData.bucket1RefilledFromB2 > 0 ? (
              <View style={styles.auditRow}>
                <ArrowRightLeft size={13} color={PALETTE.bucket1.base} style={{ marginRight: 6 }} />
                <Text style={[styles.auditText, { color: colors.textSecondary }]}>
                  Waterfall Refill: Transferred{' '}
                  <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                    {formatCurrency(selectedData.bucket1RefilledFromB2, baseCountry)}
                  </Text>{' '}
                  from Bucket 2 to replenish Bucket 1 cash floor.
                </Text>
              </View>
            ) : null}

            {selectedData.bucket2RefilledFromB3 > 0 ? (
              <View style={styles.auditRow}>
                <ArrowRightLeft size={13} color={PALETTE.bucket3.base} style={{ marginRight: 6 }} />
                <Text style={[styles.auditText, { color: colors.textSecondary }]}>
                  Equity Harvesting: Harvested{' '}
                  <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                    {formatCurrency(selectedData.bucket2RefilledFromB3, baseCountry)}
                  </Text>{' '}
                  from Bucket 3 growth to reinforce Bucket 2 reserves.
                </Text>
              </View>
            ) : null}

            {selectedData.bearMarketDefenseActive ? (
              <View style={styles.auditRow}>
                <ShieldCheck size={14} color="#10B981" style={{ marginRight: 6 }} />
                <Text style={[styles.auditText, { color: '#10B981', fontWeight: '600' }]}>
                  Bear Market Defense Active: Equities in Bucket 3 were shielded from panic liquidation during drawdown.
                </Text>
              </View>
            ) : null}
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
    padding: 14,
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
  waterfallAudit: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  auditText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
