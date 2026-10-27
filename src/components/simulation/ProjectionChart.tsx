import React, { useState, useEffect, useMemo } from 'react';
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
import {
  MonteCarloSummary,
  YearSimulationResult,
  WealthModelType,
  HistoricalBacktestResult,
  RollingReturnsResult,
  StressTestResult,
  GoalsBasedResult,
  ModelComparisonSummary,
} from '../../engine/types';
import {
  LineChart,
  Layers,
  ShieldCheck,
  ArrowRightLeft,
  HelpCircle,
  Scale,
  Activity,
  History,
  Target,
  Zap,
} from 'lucide-react-native';
import { SupportedCountry, formatCurrency, formatShortAxis } from '../../utils/currency';

interface ProjectionChartProps {
  results: YearSimulationResult[];
  mcSummary: MonteCarloSummary;
  displayHorizon: number;
  baseCountry: SupportedCountry;
  customWidth?: number;
  onOpenEducationModal?: (topic: 'riskcone' | 'waterfall' | 'methodologies') => void;
  selectedModel?: WealthModelType;
  historicalBacktest?: HistoricalBacktestResult;
  rollingReturns?: RollingReturnsResult;
  stressTest?: StressTestResult;
  goalsBased?: GoalsBasedResult;
  modelComparison?: ModelComparisonSummary;
  onSelectModel?: (model: WealthModelType) => void;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({
  results,
  mcSummary,
  displayHorizon = 30,
  baseCountry = 'IN',
  customWidth,
  onOpenEducationModal,
  selectedModel = 'monte_carlo',
  historicalBacktest,
  rollingReturns,
  stressTest,
  goalsBased,
  modelComparison,
  onSelectModel,
}) => {
  const { colors, theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  // Active chart tab: 'stacked' | 'montecarlo' | 'active_model' | 'comparison'
  const [activeTab, setActiveTab] = useState<'stacked' | 'montecarlo' | 'active_model' | 'comparison'>(
    selectedModel === 'comparison' ? 'comparison' : selectedModel === 'monte_carlo' ? 'montecarlo' : 'active_model'
  );

  useEffect(() => {
    if (selectedModel === 'comparison') {
      setActiveTab('comparison');
    } else if (selectedModel === 'monte_carlo') {
      // Keep user choice or default to montecarlo
    } else {
      setActiveTab('active_model');
    }
  }, [selectedModel]);

  const [zoomHorizon, setZoomHorizon] = useState<number | null>(null);
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(
    Math.min(displayHorizon - 1, 9)
  );
  const [isTransferScheduleOpen, setIsTransferScheduleOpen] = useState<boolean>(false);
  const [scheduleSource, setScheduleSource] = useState<'baseline' | 'active_model'>('baseline');

  // Determine active model yearly results if available
  const activeModelResults: YearSimulationResult[] | null = useMemo(() => {
    if (selectedModel === 'historical_backtest' && historicalBacktest?.yearlyResults && historicalBacktest.yearlyResults.length > 0) {
      return historicalBacktest.yearlyResults;
    }
    if (selectedModel === 'stress_testing' && stressTest?.yearlyResults && stressTest.yearlyResults.length > 0) {
      return stressTest.yearlyResults;
    }
    if (selectedModel === 'goals_based' && goalsBased?.yearlyResults && goalsBased.yearlyResults.length > 0) {
      return goalsBased.yearlyResults;
    }
    return null;
  }, [selectedModel, historicalBacktest, stressTest, goalsBased]);

  const hasAlternativeModelSchedule = activeModelResults !== null;

  // Auto-align scheduleSource when alternative model is selected
  useEffect(() => {
    if (selectedModel === 'historical_backtest' || selectedModel === 'stress_testing' || selectedModel === 'goals_based') {
      setScheduleSource('active_model');
    } else {
      setScheduleSource('baseline');
    }
  }, [selectedModel]);

  // Scalable slice up to 80 years
  const activeDisplayHorizon =
    zoomHorizon && zoomHorizon < displayHorizon ? zoomHorizon : displayHorizon;
  const effectiveHorizon = Math.min(results.length, Math.max(5, activeDisplayHorizon));
  const safeYearIndex = Math.min(selectedYearIndex, effectiveHorizon - 1);
  const displayedResults = results.slice(0, effectiveHorizon);
  const displayedMedian = mcSummary.medianTrajectory.slice(0, effectiveHorizon);
  const displayedP10 = mcSummary.p10Trajectory.slice(0, effectiveHorizon);
  const displayedP90 = mcSummary.p90Trajectory.slice(0, effectiveHorizon);

  // Active results slice for schedule and inspector
  const activeScheduleResults = useMemo(() => {
    if (scheduleSource === 'active_model' && activeModelResults) {
      return activeModelResults.slice(0, effectiveHorizon);
    }
    return displayedResults;
  }, [scheduleSource, activeModelResults, displayedResults, effectiveHorizon]);

  // Slices for alternative models with fallback to modelComparison summary
  const compBacktestModel = modelComparison?.models.find((m) => m.id === 'historical_backtest');
  const compRollingModel = modelComparison?.models.find((m) => m.id === 'rolling_returns');
  const compStressModel = modelComparison?.models.find((m) => m.id === 'stress_testing');
  const compGoalsModel = modelComparison?.models.find((m) => m.id === 'goals_based');

  const displayedBacktest =
    historicalBacktest?.trajectory && historicalBacktest.trajectory.length > 0
      ? historicalBacktest.trajectory.slice(0, effectiveHorizon)
      : compBacktestModel?.trajectory?.slice(0, effectiveHorizon) || [];

  const displayedRollingMedian =
    rollingReturns?.medianTrajectory && rollingReturns.medianTrajectory.length > 0
      ? rollingReturns.medianTrajectory.slice(0, effectiveHorizon)
      : compRollingModel?.trajectory?.slice(0, effectiveHorizon) || [];

  const displayedRollingWorst =
    rollingReturns?.worstTrajectory && rollingReturns.worstTrajectory.length > 0
      ? rollingReturns.worstTrajectory.slice(0, effectiveHorizon)
      : [];

  const displayedRollingBest =
    rollingReturns?.bestTrajectory && rollingReturns.bestTrajectory.length > 0
      ? rollingReturns.bestTrajectory.slice(0, effectiveHorizon)
      : [];

  const displayedStress =
    stressTest?.trajectory && stressTest.trajectory.length > 0
      ? stressTest.trajectory.slice(0, effectiveHorizon)
      : compStressModel?.trajectory?.slice(0, effectiveHorizon) || [];

  const displayedGoals =
    goalsBased?.trajectory && goalsBased.trajectory.length > 0
      ? goalsBased.trajectory.slice(0, effectiveHorizon)
      : compGoalsModel?.trajectory?.slice(0, effectiveHorizon) || [];

  const containerWidth = customWidth
    ? Math.max(280, customWidth)
    : Math.min(windowWidth - 36, 880);
  const chartHeight = 275;
  const paddingLeft = 54;
  const paddingRight = 16;
  const paddingTop = 22;
  const paddingBottom = 34;

  const innerWidth = containerWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Compute maximum values across displayed models cleanly
  const maxStackTotal = Math.max(...displayedResults.map((r) => r.totalCorpus), 1);
  const maxMCTotal = Math.max(...displayedP90, ...displayedMedian, 1);

  // Safe realistic multi-model comparison scaling across the 5 central trajectories
  const compCandidates = [
    ...displayedMedian,
    ...displayedBacktest,
    ...displayedRollingMedian,
    ...displayedStress,
    ...displayedGoals,
  ].filter((v) => typeof v === 'number' && isFinite(v) && v > 0);
  const maxComparisonTotal =
    compCandidates.length > 0 ? Math.max(...compCandidates) : maxStackTotal;

  let maxVal = maxStackTotal * 1.15;
  if (activeTab === 'montecarlo') {
    maxVal = maxMCTotal * 1.15;
  } else if (activeTab === 'comparison') {
    maxVal = maxComparisonTotal * 1.18;
  } else if (activeTab === 'active_model') {
    if (selectedModel === 'historical_backtest') {
      const candidates = displayedBacktest.filter((v) => typeof v === 'number' && isFinite(v) && v > 0);
      maxVal = (candidates.length > 0 ? Math.max(...candidates) : maxStackTotal) * 1.18;
    } else if (selectedModel === 'rolling_returns') {
      const candidates = [...displayedRollingBest, ...displayedRollingMedian, ...displayedRollingWorst].filter(
        (v) => typeof v === 'number' && isFinite(v) && v > 0
      );
      maxVal = (candidates.length > 0 ? Math.max(...candidates) : maxStackTotal) * 1.18;
    } else if (selectedModel === 'stress_testing') {
      const candidates = displayedStress.filter((v) => typeof v === 'number' && isFinite(v) && v > 0);
      maxVal = (candidates.length > 0 ? Math.max(...candidates) : maxStackTotal) * 1.18;
    } else if (selectedModel === 'goals_based') {
      const candidates = displayedGoals.filter((v) => typeof v === 'number' && isFinite(v) && v > 0);
      maxVal = (candidates.length > 0 ? Math.max(...candidates) : maxStackTotal) * 1.18;
    }
  }

  const safeMaxVal = typeof maxVal === 'number' && isFinite(maxVal) && maxVal > 0 ? maxVal : 1;

  const scaleY = (val: number) => {
    const num = typeof val === 'number' && isFinite(val) ? val : 0;
    const clamped = Math.max(0, Math.min(num, safeMaxVal));
    const y = paddingTop + innerHeight - (clamped / safeMaxVal) * innerHeight;
    return typeof y === 'number' && isFinite(y) ? y : paddingTop + innerHeight;
  };

  const scaleX = (index: number) => {
    const divisor = Math.max(1, effectiveHorizon - 1);
    const x = paddingLeft + (index / divisor) * innerWidth;
    return typeof x === 'number' && isFinite(x) ? x : paddingLeft;
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
        b1Line += `M ${x.toFixed(1)} ${yB1.toFixed(1)}`;
        b2Line += `M ${x.toFixed(1)} ${yB2.toFixed(1)}`;
        b3Line += `M ${x.toFixed(1)} ${yB3.toFixed(1)}`;
      } else {
        b1Line += ` L ${x.toFixed(1)} ${yB1.toFixed(1)}`;
        b2Line += ` L ${x.toFixed(1)} ${yB2.toFixed(1)}`;
        b3Line += ` L ${x.toFixed(1)} ${yB3.toFixed(1)}`;
      }
    });

    const lastX = scaleX(effectiveHorizon - 1);
    const firstX = scaleX(0);

    const b1Path = `${b1Line} L ${lastX.toFixed(1)} ${bottomY.toFixed(1)} L ${firstX.toFixed(1)} ${bottomY.toFixed(1)} Z`;
    const b2Path = `${b2Line} L ${lastX.toFixed(1)} ${bottomY.toFixed(1)} L ${firstX.toFixed(1)} ${bottomY.toFixed(1)} Z`;
    const b3Path = `${b3Line} L ${lastX.toFixed(1)} ${bottomY.toFixed(1)} L ${firstX.toFixed(1)} ${bottomY.toFixed(1)} Z`;

    return { b1Path, b2Path, b3Path };
  };

  // Monte Carlo Paths (P10, P50, P90)
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
        p90Line += `M ${x.toFixed(1)} ${yP90.toFixed(1)}`;
        p50Line += `M ${x.toFixed(1)} ${yP50.toFixed(1)}`;
        p10Line += `M ${x.toFixed(1)} ${yP10.toFixed(1)}`;
      } else {
        p90Line += ` L ${x.toFixed(1)} ${yP90.toFixed(1)}`;
        p50Line += ` L ${x.toFixed(1)} ${yP50.toFixed(1)}`;
        p10Line += ` L ${x.toFixed(1)} ${yP10.toFixed(1)}`;
      }
    }

    let bandPath = p90Line;
    for (let i = effectiveHorizon - 1; i >= 0; i--) {
      const x = scaleX(i);
      const yP10 = scaleY(displayedP10[i] || 0);
      bandPath += ` L ${x.toFixed(1)} ${yP10.toFixed(1)}`;
    }
    bandPath += ' Z';

    return { p90Line, p50Line, p10Line, bandPath };
  };

  // Generic Line Path builder
  const buildLinePath = (data: number[]) => {
    if (!data || data.length === 0) return '';
    let path = '';
    const len = Math.min(data.length, effectiveHorizon);
    for (let i = 0; i < len; i++) {
      const val = typeof data[i] === 'number' && isFinite(data[i]) ? data[i] : 0;
      const x = scaleX(i);
      const y = scaleY(val);
      if (i === 0) path += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      else path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return path;
  };

  // Rolling envelope band (between Best and Worst holding blocks)
  const buildRollingBandPath = () => {
    if (displayedRollingBest.length === 0 || displayedRollingWorst.length === 0) return '';
    let topPath = '';
    for (let i = 0; i < Math.min(displayedRollingBest.length, effectiveHorizon); i++) {
      const x = scaleX(i);
      const y = scaleY(displayedRollingBest[i] || 0);
      if (i === 0) topPath += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      else topPath += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    let bottomPath = '';
    for (let i = Math.min(displayedRollingWorst.length, effectiveHorizon) - 1; i >= 0; i--) {
      const x = scaleX(i);
      const y = scaleY(displayedRollingWorst[i] || 0);
      bottomPath += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return topPath + bottomPath + ' Z';
  };

  const { b1Path, b2Path, b3Path } = buildStackedAreaPaths();
  const { p90Line, p50Line, p10Line, bandPath } = buildMCPaths();
  const rollingBandPath = buildRollingBandPath();

  // Model comparison lines (Unified 5-model overlay)
  const mcCompLine = buildLinePath(displayedMedian);
  const backtestCompLine = buildLinePath(displayedBacktest);
  const rollingMedianCompLine = buildLinePath(displayedRollingMedian);
  const stressCompLine = buildLinePath(displayedStress);
  const goalsCompLine = buildLinePath(displayedGoals);

  // Active Model specific paths
  const rollingBestLine = buildLinePath(displayedRollingBest);
  const rollingWorstLine = buildLinePath(displayedRollingWorst);

  const selectedData =
    activeScheduleResults[safeYearIndex] ||
    activeScheduleResults[0] ||
    displayedResults[safeYearIndex] ||
    displayedResults[0];

  // Dynamic X-axis ticks
  const generateXTicks = () => {
    const step =
      effectiveHorizon <= 15
        ? 2
        : effectiveHorizon <= 30
        ? 5
        : effectiveHorizon <= 50
        ? 10
        : 10;

    const ticks: number[] = [1];
    for (let y = step; y < effectiveHorizon; y += step) {
      if (y !== 1 && y !== effectiveHorizon) ticks.push(y);
    }
    ticks.push(effectiveHorizon);
    return ticks;
  };

  const activeModelTitle =
    selectedModel === 'historical_backtest'
      ? `Historical Backtest (${historicalBacktest?.scenarioKey.toUpperCase().replace('_', ' ')})`
      : selectedModel === 'rolling_returns'
      ? `Rolling Returns (${rollingReturns?.windowYears}Y Windows)`
      : selectedModel === 'stress_testing'
      ? `Deterministic Stress Shock`
      : selectedModel === 'goals_based'
      ? `Goals-Based (GBWM)`
      : 'Monte Carlo Stochastic Risk Cone';

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
      {/* Chart Header */}
      <View style={styles.chartHeader}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {activeTab === 'comparison'
                ? `Cross-Model Comparison (${effectiveHorizon} Years)`
                : activeTab === 'active_model'
                ? `${activeModelTitle} (${effectiveHorizon}Y)`
                : `Portfolio Trajectory (${effectiveHorizon} Years)`}
            </Text>
            <TouchableOpacity
              onPress={() =>
                onOpenEducationModal?.(
                  activeTab === 'comparison'
                    ? 'methodologies'
                    : activeTab === 'stacked'
                    ? 'waterfall'
                    : 'riskcone'
                )
              }
              style={styles.infoIconBtn}
              activeOpacity={0.7}
            >
              <HelpCircle size={15} color={colors.accent} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {activeTab === 'stacked'
              ? 'Multi-Bucket Waterfall Breakdown & Refill Mechanics'
              : activeTab === 'montecarlo'
              ? 'Monte Carlo Stochastic Risk Cone (P10 Bear - P50 Base - P90 Bull)'
              : activeTab === 'comparison'
              ? 'Simultaneous Cross-Comparison of All 5 Wealth Management Methodologies'
              : selectedModel === 'historical_backtest'
              ? `Replaying ${historicalBacktest?.title || 'Historical Crisis'}`
              : selectedModel === 'rolling_returns'
              ? `Worst, Median, and Best ${rollingReturns?.windowYears || 5}-Year Holding Frequency`
              : selectedModel === 'stress_testing'
              ? `${stressTest?.title || 'Macro Shock Simulation'}`
              : 'Lifecycle Milestone Bucket Allocation & Legacy'}
          </Text>
        </View>

        {/* View Mode Toggle Tabs */}
        <View style={styles.chartHeaderRight}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.tabToggle, { backgroundColor: colors.surfaceElevated }]}>
              <TouchableOpacity
                onPress={() => setActiveTab('stacked')}
                style={[
                  styles.tabBtn,
                  activeTab === 'stacked' && { backgroundColor: colors.accent },
                ]}
              >
                <Layers
                  size={13}
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
                  size={13}
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

              {selectedModel !== 'monte_carlo' && selectedModel !== 'comparison' && (
                <TouchableOpacity
                  onPress={() => setActiveTab('active_model')}
                  style={[
                    styles.tabBtn,
                    activeTab === 'active_model' && { backgroundColor: colors.accent },
                  ]}
                >
                  <Activity
                    size={13}
                    color={activeTab === 'active_model' ? '#FFFFFF' : colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.tabBtnText,
                      { color: activeTab === 'active_model' ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {selectedModel === 'historical_backtest'
                      ? '📜 Backtest'
                      : selectedModel === 'rolling_returns'
                      ? `📈 Rolling (${rollingReturns?.windowYears || 5}Y)`
                      : selectedModel === 'stress_testing'
                      ? '⚡ Stress Shock'
                      : selectedModel === 'goals_based'
                      ? '🎯 Goals (GBWM)'
                      : 'Active Model'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setActiveTab('comparison')}
                style={[
                  styles.tabBtn,
                  activeTab === 'comparison' && { backgroundColor: colors.accent },
                ]}
              >
                <Scale
                  size={13}
                  color={activeTab === 'comparison' ? '#FFFFFF' : colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: activeTab === 'comparison' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  ⚖️ Compare All
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
            <LinearGradient id="rollingGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#10B981" stopOpacity="0.04" />
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

          {/* Mode 1: Stacked Waterfall Area */}
          {activeTab === 'stacked' && (
            <G>
              <Path d={b3Path} fill="url(#b3Grad)" />
              <Path d={b2Path} fill="url(#b2Grad)" />
              <Path d={b1Path} fill="url(#b1Grad)" />
            </G>
          )}

          {/* Mode 2: Monte Carlo Risk Cone */}
          {activeTab === 'montecarlo' && (
            <G>
              <Path d={bandPath} fill="url(#mcConeGrad)" />
              {/* Bull (P90) */}
              <Path
                d={p90Line}
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              {/* Median (P50) */}
              <Path d={p50Line} fill="none" stroke="#38BDF8" strokeWidth="2.5" />
              {/* Bear (P10) */}
              <Path
                d={p10Line}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            </G>
          )}

          {/* Mode 3: Active Model Detailed Path */}
          {activeTab === 'active_model' && (
            <G>
              {selectedModel === 'historical_backtest' && (
                <G>
                  <Path d={backtestCompLine} fill="none" stroke="#F59E0B" strokeWidth="2.8" />
                  {historicalBacktest?.troughYear && (
                    <Circle
                      cx={scaleX(historicalBacktest.troughYear - 1)}
                      cy={scaleY(historicalBacktest.trajectory[historicalBacktest.troughYear - 1] || 0)}
                      r={5}
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  )}
                </G>
              )}

              {selectedModel === 'rolling_returns' && (
                <G>
                  {/* Rolling Envelope Area Fill */}
                  {rollingBandPath ? (
                    <Path d={rollingBandPath} fill="url(#rollingGrad)" />
                  ) : null}
                  {/* Best Block (Top Historical Horizon) */}
                  <Path d={rollingBestLine} fill="none" stroke="#10B981" strokeWidth="2.2" strokeDasharray="4 2" />
                  {/* Median Block (Compound Baseline) */}
                  <Path d={rollingMedianCompLine} fill="none" stroke="#10B981" strokeWidth="3" />
                  {/* Worst Block (Lowest Historical Floor) */}
                  <Path d={rollingWorstLine} fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeDasharray="4 2" />

                  {/* Vertical Window Boundary Marker */}
                  {rollingReturns?.windowYears && rollingReturns.windowYears < effectiveHorizon && (
                    <G>
                      <Line
                        x1={scaleX(rollingReturns.windowYears - 1)}
                        y1={paddingTop}
                        x2={scaleX(rollingReturns.windowYears - 1)}
                        y2={paddingTop + innerHeight}
                        stroke="#10B981"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity={0.6}
                      />
                      <SvgText
                        x={scaleX(rollingReturns.windowYears - 1) + 4}
                        y={paddingTop + 14}
                        fill="#10B981"
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="System"
                      >
                        {rollingReturns.windowYears}Y Block
                      </SvgText>
                    </G>
                  )}
                </G>
              )}

              {selectedModel === 'stress_testing' && (
                <G>
                  <Path d={stressCompLine} fill="none" stroke="#EC4899" strokeWidth="2.8" />
                  {stressTest?.troughYear && (
                    <Circle
                      cx={scaleX(stressTest.troughYear - 1)}
                      cy={scaleY(stressTest.lowestCorpusTrough)}
                      r={5.5}
                      fill="#EC4899"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  )}
                </G>
              )}

              {selectedModel === 'goals_based' && (
                <G>
                  <Path d={goalsCompLine} fill="none" stroke="#8B5CF6" strokeWidth="2.8" />
                  {goalsBased?.milestoneStatuses.map((ms) => {
                    const yrIdx = Math.min(ms.milestone.targetYear - 1, effectiveHorizon - 1);
                    return (
                      <Circle
                        key={ms.milestone.id}
                        cx={scaleX(yrIdx)}
                        cy={scaleY(displayedGoals[yrIdx] || 0)}
                        r={5}
                        fill={ms.isFullyFunded ? '#10B981' : '#F59E0B'}
                        stroke="#FFFFFF"
                        strokeWidth={1.5}
                      />
                    );
                  })}
                </G>
              )}
            </G>
          )}

          {/* Mode 4: Multi-Model Comparison Chart */}
          {activeTab === 'comparison' && (
            <G>
              {/* Monte Carlo Median (Cyan) */}
              {mcCompLine ? <Path d={mcCompLine} fill="none" stroke="#38BDF8" strokeWidth="2.8" /> : null}
              {/* Historical Backtest (Orange) */}
              {backtestCompLine ? <Path d={backtestCompLine} fill="none" stroke="#F59E0B" strokeWidth="2.8" /> : null}
              {/* Rolling Returns Median (Emerald Green) */}
              {rollingMedianCompLine ? <Path d={rollingMedianCompLine} fill="none" stroke="#10B981" strokeWidth="2.8" /> : null}
              {/* Stress Test (Pink Dashed) */}
              {stressCompLine ? <Path d={stressCompLine} fill="none" stroke="#EC4899" strokeWidth="2.8" strokeDasharray="5 3" /> : null}
              {/* Goals-Based (Purple Dashed) */}
              {goalsCompLine ? <Path d={goalsCompLine} fill="none" stroke="#8B5CF6" strokeWidth="2.8" strokeDasharray="8 3" /> : null}

              {/* Glowing inspection dots at selected year */}
              <Circle
                cx={scaleX(safeYearIndex)}
                cy={scaleY(displayedMedian[safeYearIndex] || 0)}
                r={6}
                fill="#38BDF8"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <Circle
                cx={scaleX(safeYearIndex)}
                cy={scaleY(displayedBacktest[safeYearIndex] || 0)}
                r={6}
                fill="#F59E0B"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <Circle
                cx={scaleX(safeYearIndex)}
                cy={scaleY(displayedRollingMedian[safeYearIndex] || 0)}
                r={6}
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <Circle
                cx={scaleX(safeYearIndex)}
                cy={scaleY(displayedStress[safeYearIndex] || 0)}
                r={6}
                fill="#EC4899"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <Circle
                cx={scaleX(safeYearIndex)}
                cy={scaleY(displayedGoals[safeYearIndex] || 0)}
                r={6}
                fill="#8B5CF6"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            </G>
          )}

          {/* Vertical Year Inspection Indicator Line */}
          <Line
            x1={scaleX(safeYearIndex)}
            y1={paddingTop}
            x2={scaleX(safeYearIndex)}
            y2={paddingTop + innerHeight}
            stroke={colors.accent}
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </Svg>
      </View>

      {/* Chart Legend */}
      <View style={styles.legendContainer}>
        {activeTab === 'stacked' ? (
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: PALETTE.bucket1.base }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Bucket 1 (Cash Liquid)
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: PALETTE.bucket2.base }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Bucket 2 (Income / Debt)
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: PALETTE.bucket3.base }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Bucket 3 (Growth Equities)
              </Text>
            </View>
          </View>
        ) : activeTab === 'montecarlo' ? (
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                P90 Bull Market
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                P50 Median Base
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                P10 Conservative Floor
              </Text>
            </View>
          </View>
        ) : activeTab === 'active_model' ? (
          <View style={styles.legendRow}>
            {selectedModel === 'historical_backtest' ? (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                  {historicalBacktest?.title || 'Historical Crash Replay Path'}
                </Text>
              </View>
            ) : selectedModel === 'rolling_returns' ? (
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                    Best Block
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                    Median Block
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                    Worst Block
                  </Text>
                </View>
              </View>
            ) : selectedModel === 'stress_testing' ? (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                  {stressTest?.title || 'Macro Shock Drawdown Path'}
                </Text>
              </View>
            ) : (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                  Net Corpus After Milestones (GBWM)
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* Multi-Model Comparison Legend */
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.legendRow, { gap: 12 }]}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                  Monte Carlo (P50)
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                  Backtest (2008 GFC)
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                  Rolling Returns ({rollingReturns?.windowYears || 5}Y)
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                  Stress Shock (8% Infl)
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                  Goals-Based GBWM
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Year Selector Ribbon */}
      <View style={styles.yearRibbon}>
        <Text style={[styles.yearRibbonLabel, { color: colors.textMuted }]}>
          Inspect Year:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
          {displayedResults.map((r, idx) => {
            const isSelected = idx === safeYearIndex;
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
      {activeTab === 'comparison' ? (
        /* Multi-Model Year Comparison Inspector */
        <View style={[styles.inspectorCard, { backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.inspectorHeader}>
            <Text style={[styles.inspectorYearTitle, { color: colors.textPrimary }]}>
              Year {selectedData.year} ({selectedData.calendarYear}) Cross-Model Valuation
            </Text>
            <Text style={[styles.inspectorTotalVal, { color: colors.accent }]}>
              5 Models Simulated
            </Text>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#38BDF8' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Monte Carlo P50:</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatCurrency(displayedMedian[safeYearIndex] || 0, baseCountry)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>2008 Backtest:</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatCurrency(displayedBacktest[safeYearIndex] || 0, baseCountry)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Rolling Median:</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatCurrency(displayedRollingMedian[safeYearIndex] || 0, baseCountry)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#EC4899' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Stress Shock:</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatCurrency(displayedStress[safeYearIndex] || 0, baseCountry)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Goals Net (GBWM):</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatCurrency(displayedGoals[safeYearIndex] || 0, baseCountry)}
              </Text>
            </View>
          </View>
        </View>
      ) : activeTab === 'active_model' && selectedModel === 'rolling_returns' && rollingReturns ? (
        /* Rolling Returns Inspector Card */
        <View style={[styles.inspectorCard, { backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.inspectorHeader}>
            <Text style={[styles.inspectorYearTitle, { color: colors.textPrimary }]}>
              Year {selectedData.year} ({selectedData.calendarYear}) • {rollingReturns.windowYears}-Year Holding Frequency
            </Text>
            <Text style={[styles.inspectorTotalVal, { color: '#10B981' }]}>
              Median: {formatCurrency(displayedRollingMedian[safeYearIndex] || 0, baseCountry)}
            </Text>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Best {rollingReturns.windowYears}Y Block:</Text>
              <Text style={[styles.metricVal, { color: '#10B981' }]}>
                {formatCurrency(displayedRollingBest[safeYearIndex] || 0, baseCountry)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Median Compounding:</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatCurrency(displayedRollingMedian[safeYearIndex] || 0, baseCountry)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Worst {rollingReturns.windowYears}Y Floor:</Text>
              <Text style={[styles.metricVal, { color: '#F59E0B' }]}>
                {formatCurrency(displayedRollingWorst[safeYearIndex] || 0, baseCountry)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#38BDF8' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Annualized Range:</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                +{rollingReturns.minReturnPct}% to +{rollingReturns.maxReturnPct}% p.a.
              </Text>
            </View>
          </View>
        </View>
      ) : activeTab === 'active_model' && selectedModel === 'historical_backtest' && historicalBacktest ? (
        /* Historical Backtest Inspector Card */
        <View style={[styles.inspectorCard, { backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.inspectorHeader}>
            <Text style={[styles.inspectorYearTitle, { color: colors.textPrimary }]}>
              Year {selectedData.year} ({selectedData.calendarYear}) • {historicalBacktest.title}
            </Text>
            <Text style={[styles.inspectorTotalVal, { color: '#F59E0B' }]}>
              Corpus: {formatCurrency(displayedBacktest[safeYearIndex] || 0, baseCountry)}
            </Text>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Crisis Replay:</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {historicalBacktest.scenarioKey.toUpperCase().replace('_', ' ')}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Max Drawdown:</Text>
              <Text style={[styles.metricVal, { color: '#EF4444' }]}>
                -{historicalBacktest.maxDrawdownPct}%
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Recovery Status:</Text>
              <Text style={[styles.metricVal, { color: '#10B981' }]}>
                {historicalBacktest.recoveryYears ? `Recovered in ${historicalBacktest.recoveryYears}Y` : 'Under Buffer Defense'}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#38BDF8' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Final Rebound:</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatCurrency(historicalBacktest.terminalBalance, baseCountry)}
              </Text>
            </View>
          </View>
        </View>
      ) : activeTab === 'active_model' && selectedModel === 'stress_testing' && stressTest ? (
        /* Stress Testing Inspector Card */
        <View style={[styles.inspectorCard, { backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.inspectorHeader}>
            <Text style={[styles.inspectorYearTitle, { color: colors.textPrimary }]}>
              Year {selectedData.year} ({selectedData.calendarYear}) • {stressTest.title}
            </Text>
            <Text style={[styles.inspectorTotalVal, { color: '#EC4899' }]}>
              Post-Shock: {formatCurrency(displayedStress[safeYearIndex] || 0, baseCountry)}
            </Text>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#EC4899' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Solvency Cushion:</Text>
              <Text style={[styles.metricVal, { color: stressTest.cushionRemainingPct >= 50 ? '#10B981' : '#F59E0B' }]}>
                {stressTest.cushionRemainingPct}% Remaining
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Lowest Dip (Trough):</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatCurrency(stressTest.lowestCorpusTrough, baseCountry)} (Y{stressTest.troughYear})
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Terminal Balance:</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatCurrency(stressTest.terminalBalance, baseCountry)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#38BDF8' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Survival Outcome:</Text>
              <Text style={[styles.metricVal, { color: stressTest.survived ? '#10B981' : '#EF4444' }]}>
                {stressTest.survived ? 'Fully Solvent' : 'Exhausted Early'}
              </Text>
            </View>
          </View>
        </View>
      ) : activeTab === 'active_model' && selectedModel === 'goals_based' && goalsBased ? (
        /* Goals Based Inspector Card */
        <View style={[styles.inspectorCard, { backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.inspectorHeader}>
            <Text style={[styles.inspectorYearTitle, { color: colors.textPrimary }]}>
              Year {selectedData.year} ({selectedData.calendarYear}) • Goals-Based (GBWM)
            </Text>
            <Text style={[styles.inspectorTotalVal, { color: '#8B5CF6' }]}>
              Net Wealth: {formatCurrency(displayedGoals[safeYearIndex] || 0, baseCountry)}
            </Text>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Milestones Funded:</Text>
              <Text style={[styles.metricVal, { color: goalsBased.allMilestonesFunded ? '#10B981' : '#F59E0B' }]}>
                {goalsBased.milestoneStatuses.filter((m) => m.isFullyFunded).length}/{goalsBased.milestoneStatuses.length} Goals
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Immediate Cash Runway:</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {goalsBased.shortTermRunwayYears} Years Protected
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#38BDF8' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Medium-Term Shield:</Text>
              <Text style={[styles.metricVal, { color: goalsBased.mediumTermShieldFunded ? '#10B981' : '#F59E0B' }]}>
                {goalsBased.mediumTermShieldFunded ? 'Fully Funded' : 'Partial'}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#F43F5E' }]} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Legacy Surplus:</Text>
              <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                {formatCurrency(goalsBased.terminalLegacySurplus, baseCountry)}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        /* Standard 3-Bucket / Monte Carlo Inspector Card */
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

          {/* Yearly Bucket-to-Bucket Refill & Transfer Box */}
          <View style={[styles.transferBreakdownBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
            <View style={styles.transferHeaderRow}>
              <ArrowRightLeft size={14} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={[styles.transferHeaderTitle, { color: colors.textPrimary }]}>
                Year {selectedData.year} Bucket Refill & Cash Flow Protocol
              </Text>
            </View>

            <View style={styles.transferRowsContainer}>
              {/* Row 1: Living Expense Debit */}
              <View style={styles.transferDetailRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.transferIconDot, { backgroundColor: '#F43F5E' }]} />
                  <Text style={[styles.transferActionLabel, { color: colors.textSecondary }]}>
                    Annual Living Expense Paid:
                  </Text>
                </View>
                <Text style={[styles.transferActionVal, { color: '#F43F5E' }]}>
                  −{formatCurrency(selectedData.withdrawalAmount, baseCountry)} (from B1 Cash)
                </Text>
              </View>

              {/* Row 2: B2 to B1 Cash Refill */}
              <View style={styles.transferDetailRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.transferIconDot, { backgroundColor: PALETTE.bucket2.base }]} />
                  <Text style={[styles.transferActionLabel, { color: colors.textSecondary }]}>
                    Bucket 2 → Bucket 1 Refill:
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transferActionVal,
                    { color: selectedData.bucket1RefilledFromB2 > 0 ? colors.accent : colors.textMuted },
                  ]}
                >
                  {selectedData.bucket1RefilledFromB2 > 0
                    ? `+${formatCurrency(selectedData.bucket1RefilledFromB2, baseCountry)} (Cash Target Restored)`
                    : '₹0 (Target Floor Maintained)'}
                </Text>
              </View>

              {/* Row 3: B3 to B2 Equity Harvest / Bear Defense */}
              <View style={styles.transferDetailRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.transferIconDot, { backgroundColor: PALETTE.bucket3.base }]} />
                  <Text style={[styles.transferActionLabel, { color: colors.textSecondary }]}>
                    Bucket 3 → Bucket 2 Harvest:
                  </Text>
                </View>
                {selectedData.bearMarketDefenseActive ? (
                  <Text style={[styles.transferActionVal, { color: '#F59E0B' }]}>
                    🛡️ ₹0 (Bear Defense Active: Equities Protected)
                  </Text>
                ) : (
                  <Text
                    style={[
                      styles.transferActionVal,
                      { color: selectedData.bucket2RefilledFromB3 > 0 ? '#10B981' : colors.textMuted },
                    ]}
                  >
                    {selectedData.bucket2RefilledFromB3 > 0
                      ? `+${formatCurrency(selectedData.bucket2RefilledFromB3, baseCountry)} (Harvested to Buffer)`
                      : '₹0 (Buffer Target Satisfied)'}
                  </Text>
                )}
              </View>

              {/* Row 4: Transaction Friction if any */}
              {selectedData.rebalanceFrictionCost > 0 && (
                <View style={styles.transferDetailRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.transferIconDot, { backgroundColor: colors.textMuted }]} />
                    <Text style={[styles.transferActionLabel, { color: colors.textMuted }]}>
                      Rebalancing Friction / Slippage:
                    </Text>
                  </View>
                  <Text style={[styles.transferActionVal, { color: colors.textMuted }]}>
                    −{formatCurrency(selectedData.rebalanceFrictionCost, baseCountry)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Year-on-Year Bucket Transfer Schedule (All Years Table) */}
      <View
        style={[
          styles.scheduleContainer,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setIsTransferScheduleOpen(!isTransferScheduleOpen)}
          style={[styles.scheduleToggleBtn, { backgroundColor: colors.surfaceElevated }]}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
            <ArrowRightLeft size={16} color={colors.accent} style={{ marginRight: 8 }} />
            <View>
              <Text style={[styles.scheduleToggleTitle, { color: colors.textPrimary }]}>
                Year-on-Year Bucket Transfer Schedule ({activeScheduleResults.length} Years)
              </Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>
                Mode: {scheduleSource === 'active_model' ? (selectedModel === 'historical_backtest' ? `⚡ Backtest (${historicalBacktest?.title || 'Crisis'})` : selectedModel === 'stress_testing' ? `⚡ Stress (${stressTest?.title || 'Shock'})` : '⚡ Goals-Based') : '📊 Deterministic Baseline'}
              </Text>
            </View>
          </View>
          <Text style={[styles.scheduleToggleSub, { color: colors.accent }]}>
            {isTransferScheduleOpen ? 'Hide Schedule ▲' : 'View Schedule (All Years) ▼'}
          </Text>
        </TouchableOpacity>

        {isTransferScheduleOpen && (
          <View style={[styles.scheduleContentBox, { borderTopColor: colors.borderSubtle }]}>
            {/* Scenario Model Source Selector Bar */}
            {hasAlternativeModelSchedule && (
              <View style={styles.scheduleSourceToggleBar}>
                <TouchableOpacity
                  style={[
                    styles.scheduleSourceBtn,
                    scheduleSource === 'baseline' && [styles.scheduleSourceBtnActive, { backgroundColor: colors.accent }],
                  ]}
                  onPress={() => setScheduleSource('baseline')}
                >
                  <Text
                    style={[
                      styles.scheduleSourceBtnText,
                      { color: scheduleSource === 'baseline' ? '#000' : colors.textSecondary },
                      scheduleSource === 'baseline' && { fontWeight: '700' },
                    ]}
                  >
                    📊 Baseline Plan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.scheduleSourceBtn,
                    scheduleSource === 'active_model' && [styles.scheduleSourceBtnActive, { backgroundColor: colors.accent }],
                  ]}
                  onPress={() => setScheduleSource('active_model')}
                >
                  <Text
                    style={[
                      styles.scheduleSourceBtnText,
                      { color: scheduleSource === 'active_model' ? '#000' : colors.textSecondary },
                      scheduleSource === 'active_model' && { fontWeight: '700' },
                    ]}
                  >
                    ⚡ Active: {selectedModel === 'historical_backtest' ? (historicalBacktest?.title ? historicalBacktest.title.split(' ')[0] + ' ' + (historicalBacktest.title.split(' ')[1] || '') : 'Backtest') : selectedModel === 'stress_testing' ? (stressTest?.title ? stressTest.title.split(' ')[0] + ' ' + (stressTest.title.split(' ')[1] || '') : 'Stress') : 'Goals'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Dynamic Model Variance Explainer Callout */}
            <View style={[styles.scheduleExplainerBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
              <Text style={[styles.scheduleExplainerTitle, { color: colors.accent }]}>
                {scheduleSource === 'active_model'
                  ? selectedModel === 'historical_backtest'
                    ? `🛡️ Historical Crisis Transfer Protocol: ${historicalBacktest?.title}`
                    : selectedModel === 'stress_testing'
                    ? `⚡ Stress Shock Transfer Protocol: ${stressTest?.title}`
                    : `🎯 Goals-Based Transfer Protocol`
                  : `📊 Deterministic Baseline Transfer Protocol`}
              </Text>
              <Text style={[styles.scheduleHelpText, { color: colors.textSecondary, marginBottom: 0 }]}>
                {scheduleSource === 'active_model'
                  ? selectedModel === 'historical_backtest'
                    ? 'In market crashes, Bear Market Defense activates: B3→B2 equity harvests are frozen (₹0) to prevent selling at bottoms. B2 (Debt) covers all B1 living expenses alone until equities recover.'
                    : selectedModel === 'stress_testing'
                    ? 'Inflation shock increases annual expenses (higher B2→B1 cash refill demand), while the equity crash freezes stock harvests in Year 1.'
                    : 'Milestone years deduct capital outlays directly from designated buckets, altering subsequent refill demands.'
                  : 'Predictable waterfall: annual expenses debited from B1 cash, B2 refills B1 cash floor, and B3 harvests steady growth gains to replenish B2.'}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScrollWrap}>
              <View>
                {/* Table Header */}
                <View style={[styles.tableHeaderRow, { backgroundColor: colors.surfaceCard, borderBottomColor: colors.borderSubtle }]}>
                  <Text style={[styles.tableHeaderCol, { width: 85, color: colors.textMuted }]}>Year</Text>
                  <Text style={[styles.tableHeaderCol, { width: 110, color: colors.textMuted }]}>Expense Paid</Text>
                  <Text style={[styles.tableHeaderCol, { width: 125, color: colors.textMuted }]}>B2 → B1 Refill</Text>
                  <Text style={[styles.tableHeaderCol, { width: 135, color: colors.textMuted }]}>B3 → B2 Harvest</Text>
                  <Text style={[styles.tableHeaderCol, { width: 120, color: colors.textMuted }]}>Protocol Action</Text>
                  <Text style={[styles.tableHeaderCol, { width: 200, color: colors.textMuted }]}>Ending Balances (B1/B2/B3)</Text>
                  <Text style={[styles.tableHeaderCol, { width: 125, color: colors.textMuted }]}>Total Corpus</Text>
                </View>

                {/* Table Rows */}
                {activeScheduleResults.map((r, idx) => {
                  const isCurSelected = idx === safeYearIndex;
                  return (
                    <TouchableOpacity
                      key={r.year}
                      onPress={() => setSelectedYearIndex(idx)}
                      style={[
                        styles.tableRow,
                        {
                          backgroundColor: isCurSelected ? colors.accent + '15' : idx % 2 === 0 ? 'transparent' : colors.surfaceCard + '40',
                          borderBottomColor: colors.borderSubtle,
                        },
                      ]}
                      activeOpacity={0.65}
                    >
                      {/* Col 1: Year */}
                      <View style={{ width: 85, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.tableColText, { color: isCurSelected ? colors.accent : colors.textPrimary, fontWeight: '700' }]}>
                          Y{r.year} <Text style={{ fontSize: 10, color: colors.textMuted }}>({r.calendarYear})</Text>
                        </Text>
                      </View>

                      {/* Col 2: Expense Paid */}
                      <View style={{ width: 110 }}>
                        <Text style={[styles.tableColText, { color: '#F43F5E' }]}>
                          −{formatCurrency(r.withdrawalAmount, baseCountry)}
                        </Text>
                      </View>

                      {/* Col 3: B2 -> B1 Refill */}
                      <View style={{ width: 125 }}>
                        <Text
                          style={[
                            styles.tableColText,
                            { color: r.bucket1RefilledFromB2 > 0 ? colors.accent : colors.textMuted },
                          ]}
                        >
                          {r.bucket1RefilledFromB2 > 0 ? `+${formatCurrency(r.bucket1RefilledFromB2, baseCountry)}` : '—'}
                        </Text>
                      </View>

                      {/* Col 4: B3 -> B2 Harvest */}
                      <View style={{ width: 135 }}>
                        {r.bearMarketDefenseActive ? (
                          <Text style={[styles.tableColText, { color: '#F59E0B', fontWeight: '700' }]}>
                            🛡️ Bear Defense
                          </Text>
                        ) : (
                          <Text
                            style={[
                              styles.tableColText,
                              { color: r.bucket2RefilledFromB3 > 0 ? '#10B981' : colors.textMuted },
                            ]}
                          >
                            {r.bucket2RefilledFromB3 > 0 ? `+${formatCurrency(r.bucket2RefilledFromB3, baseCountry)}` : '—'}
                          </Text>
                        )}
                      </View>

                      {/* Col 5: Protocol Action Badge */}
                      <View style={{ width: 120 }}>
                        {r.isDepleted ? (
                          <View style={[styles.statusBadge, { backgroundColor: '#EF444420' }]}>
                            <Text style={[styles.statusBadgeText, { color: '#EF4444' }]}>Depleted</Text>
                          </View>
                        ) : r.bearMarketDefenseActive ? (
                          <View style={[styles.statusBadge, { backgroundColor: '#F59E0B20' }]}>
                            <Text style={[styles.statusBadgeText, { color: '#F59E0B' }]}>🛡️ Equities Saved</Text>
                          </View>
                        ) : r.bucket2RefilledFromB3 > 0 ? (
                          <View style={[styles.statusBadge, { backgroundColor: '#10B98120' }]}>
                            <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>Equity Harvest</Text>
                          </View>
                        ) : r.bucket1RefilledFromB2 > 0 ? (
                          <View style={[styles.statusBadge, { backgroundColor: colors.accent + '20' }]}>
                            <Text style={[styles.statusBadgeText, { color: colors.accent }]}>Cash Refilled</Text>
                          </View>
                        ) : (
                          <View style={[styles.statusBadge, { backgroundColor: colors.surfaceCard }]}>
                            <Text style={[styles.statusBadgeText, { color: colors.textMuted }]}>Floors Met</Text>
                          </View>
                        )}
                      </View>

                      {/* Col 6: Bucket Breakdown */}
                      <View style={{ width: 200 }}>
                        <Text style={[styles.tableColText, { fontSize: 10, color: colors.textSecondary }]}>
                          <Text style={{ color: PALETTE.bucket1.base }}>B1:</Text> {formatShortAxis(r.bucket1, baseCountry)} |{' '}
                          <Text style={{ color: PALETTE.bucket2.base }}>B2:</Text> {formatShortAxis(r.bucket2, baseCountry)} |{' '}
                          <Text style={{ color: PALETTE.bucket3.base }}>B3:</Text> {formatShortAxis(r.bucket3, baseCountry)}
                        </Text>
                      </View>

                      {/* Col 7: Total Corpus */}
                      <View style={{ width: 125 }}>
                        <Text style={[styles.tableColText, { color: colors.textPrimary, fontWeight: '700' }]}>
                          {formatCurrency(r.totalCorpus, baseCountry)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Educational Guide for Rolling Returns Holding Block Windows */}
      {selectedModel === 'rolling_returns' && rollingReturns && (
        <View style={[styles.rollingExplainerBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
          <View style={styles.explainerHeaderRow}>
            <Activity size={16} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={[styles.explainerTitle, { color: colors.textPrimary }]}>
              Understanding the Rolling Returns Graph ({rollingReturns.windowYears}-Year Holding Windows)
            </Text>
          </View>
          
          <Text style={[styles.explainerText, { color: colors.textSecondary, marginBottom: 8 }]}>
            Standard point-to-point forecasts suffer from starting-year sequence luck. This model breaks market history into continuous, overlapping <Text style={{ fontWeight: '700', color: '#10B981' }}>{rollingReturns.windowYears}-year holding blocks</Text> to show what an investor realistically endures:
          </Text>

          {/* 3 Blocks Explanation Grid */}
          <View style={styles.rollingCardsRow}>
            <View style={[styles.rollingMiniCard, { backgroundColor: colors.surfaceCard, borderColor: '#10B981' }]}>
              <Text style={[styles.miniCardTitle, { color: '#10B981' }]}>🟢 Top Line (Best Block)</Text>
              <Text style={[styles.miniCardStat, { color: '#10B981' }]}>+{rollingReturns.maxReturnPct}% p.a.</Text>
              <Text style={[styles.miniCardSub, { color: colors.textMuted }]}>
                Corpus path if starting at the most profitable historical {rollingReturns.windowYears}Y bull rally.
              </Text>
            </View>

            <View style={[styles.rollingMiniCard, { backgroundColor: colors.surfaceCard, borderColor: '#38BDF8' }]}>
              <Text style={[styles.miniCardTitle, { color: '#38BDF8' }]}>❇️ Center Line (Median)</Text>
              <Text style={[styles.miniCardStat, { color: '#38BDF8' }]}>+{rollingReturns.medianReturnPct}% p.a.</Text>
              <Text style={[styles.miniCardSub, { color: colors.textMuted }]}>
                The baseline compound expectation across all historical {rollingReturns.windowYears}Y holding periods.
              </Text>
            </View>

            <View style={[styles.rollingMiniCard, { backgroundColor: colors.surfaceCard, borderColor: '#F59E0B' }]}>
              <Text style={[styles.miniCardTitle, { color: '#F59E0B' }]}>🟠 Lower Line (Worst Floor)</Text>
              <Text style={[styles.miniCardStat, { color: '#F59E0B' }]}>+{rollingReturns.minReturnPct}% p.a.</Text>
              <Text style={[styles.miniCardSub, { color: colors.textMuted }]}>
                The worst historical stress block (e.g. retiring right before an acute market drawdown).
              </Text>
            </View>
          </View>

          {/* CLT Compression Callout */}
          <View style={[styles.takeawayPill, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.takeawayPillText, { color: colors.textSecondary }]}>
              💡 <Text style={{ fontWeight: '700', color: '#10B981' }}>Why 3Y vs 5Y vs 10Y Changes the Graph: </Text>
              Notice how switching from <Text style={{ fontWeight: '700', color: colors.textPrimary }}>3Y → 5Y → 10Y</Text> visibly squeezes the gap between the Top and Bottom lines! With a 10-Year window, the historical chance of positive return reaches <Text style={{ fontWeight: '700', color: '#10B981' }}>{rollingReturns.positiveReturnProbabilityPct}%</Text>, proving that extended time horizons systematically eliminate downside volatility drag (Central Limit Theorem).
            </Text>
          </View>
        </View>
      )}

      {/* Guide Banner for Multi-Model Comparison */}
      {activeTab === 'comparison' && (
        <View style={[styles.comparisonGuideBanner, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
          <View style={styles.comparisonGuideRow}>
            <Scale size={16} color="#6366F1" style={{ marginRight: 6 }} />
            <Text style={[styles.comparisonGuideTitle, { color: colors.textPrimary }]}>
              How to Compare All 5 Lines on the Chart
            </Text>
          </View>
          <Text style={[styles.comparisonGuideText, { color: colors.textSecondary }]}>
            All 5 curves start at your exact initial corpus ({formatCurrency(results[0]?.totalCorpus || 0, baseCountry)}) and apply identical annual expenses.
            {'\n'}• <Text style={{ fontWeight: '700', color: '#38BDF8' }}>Cyan Solid: </Text>Monte Carlo P50 Median (500 stochastic trials)
            {'\n'}• <Text style={{ fontWeight: '700', color: '#F59E0B' }}>Orange Solid: </Text>Historical Backtest (2008 GFC crisis replay with zero equity sales during crash)
            {'\n'}• <Text style={{ fontWeight: '700', color: '#10B981' }}>Green Solid: </Text>Rolling Returns Median ({rollingReturns?.windowYears || 5}Y holding block)
            {'\n'}• <Text style={{ fontWeight: '700', color: '#EC4899' }}>Pink Dashed: </Text>Deterministic Stress Test (8% inflation + -30% equity shock)
            {'\n'}• <Text style={{ fontWeight: '700', color: '#8B5CF6' }}>Purple Dashed: </Text>Goals-Based GBWM (Net wealth remaining after dedicated major life milestones)
          </Text>
        </View>
      )}

      {/* Model Comparison Matrix Table (Rendered when in Comparison Mode) */}
      {activeTab === 'comparison' && modelComparison && (
        <View style={[styles.comparisonMatrixBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
          <View style={styles.matrixHeaderRow}>
            <Scale size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.matrixTitle, { color: colors.textPrimary }]}>
              Executive Comparison: Analytical Methods Matrix
            </Text>
          </View>
          <Text style={[styles.matrixSubtitle, { color: colors.textMuted }]}>
            How each methodology evaluates your portfolio under identical starting capital:
          </Text>

          <View style={styles.modelCardsGrid}>
            {modelComparison.models.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.modelCardItem,
                  {
                    backgroundColor: colors.surfaceCard,
                    borderColor: m.id === selectedModel ? m.color : colors.borderSubtle,
                    borderLeftColor: m.color,
                    borderLeftWidth: 4,
                  },
                ]}
              >
                <View style={styles.modelCardTop}>
                  <Text style={[styles.modelCardName, { color: m.color }]}>{m.name}</Text>
                  <View style={[styles.metricBadge, { backgroundColor: m.color + '20', borderColor: m.color }]}>
                    <Text style={[styles.metricBadgeText, { color: m.color }]}>
                      {m.keyMetricLabel}: {m.keyMetricValue}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.modelCardQuestion, { color: colors.textSecondary }]}>
                  "{m.whatItAnswers}"
                </Text>

                <View style={styles.modelCardFooter}>
                  <Text style={[styles.modelTerminalLabel, { color: colors.textMuted }]}>
                    Terminal Corpus ({effectiveHorizon}Y):
                  </Text>
                  <Text style={[styles.modelTerminalVal, { color: colors.textPrimary }]}>
                    {formatCurrency(m.terminalBalance, baseCountry)}
                  </Text>
                </View>

                <Text style={[styles.modelCardBestFor, { color: colors.textMuted }]}>
                  <Text style={{ fontWeight: '700', color: colors.textSecondary }}>Best Used For: </Text>
                  {m.bestUsedFor}
                </Text>
              </View>
            ))}
          </View>

          {/* Institutional Takeaway Note */}
          <View style={[styles.takeawayCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.takeawayHeading, { color: colors.accent }]}>
              💡 Actuarial Synthesis
            </Text>
            <Text style={[styles.takeawayBody, { color: colors.textSecondary }]}>
              {modelComparison.recommendation}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  infoIconBtn: {
    padding: 4,
    marginLeft: 4,
  },
  chartHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 7,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  legendContainer: {
    marginTop: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  yearRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  yearRibbonLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginRight: 8,
  },
  yearScroll: {
    flexDirection: 'row',
  },
  yearPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  yearPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  inspectorCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 6,
  },
  inspectorYearTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  inspectorTotalVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  metricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  metricLabel: {
    fontSize: 11,
    marginRight: 4,
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  comparisonMatrixBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  matrixTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  matrixSubtitle: {
    fontSize: 11,
    marginBottom: 10,
  },
  modelCardsGrid: {
    gap: 10,
  },
  modelCardItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  modelCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  modelCardName: {
    fontSize: 13,
    fontWeight: '800',
  },
  metricBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  metricBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  modelCardQuestion: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  modelCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modelTerminalLabel: {
    fontSize: 11,
  },
  modelTerminalVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  modelCardBestFor: {
    fontSize: 11,
    lineHeight: 15,
  },
  takeawayCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  takeawayHeading: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  takeawayBody: {
    fontSize: 11,
    lineHeight: 16,
  },
  rollingExplainerBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  explainerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  explainerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  explainerText: {
    fontSize: 11,
    lineHeight: 16,
  },
  rollingCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  rollingMiniCard: {
    flex: 1,
    minWidth: 140,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  miniCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  miniCardStat: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  miniCardSub: {
    fontSize: 10,
    lineHeight: 14,
  },
  takeawayPill: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  takeawayPillText: {
    fontSize: 11,
    lineHeight: 16,
  },
  comparisonGuideBanner: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  comparisonGuideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  comparisonGuideTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  comparisonGuideText: {
    fontSize: 11,
    lineHeight: 18,
  },
  transferBreakdownBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  transferHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transferHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  transferRowsContainer: {
    gap: 6,
  },
  transferDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  transferIconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  transferActionLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  transferActionVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  scheduleContainer: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scheduleToggleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  scheduleToggleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  scheduleToggleSub: {
    fontSize: 11,
    fontWeight: '700',
  },
  scheduleContentBox: {
    borderTopWidth: 1,
    padding: 10,
  },
  scheduleHelpText: {
    fontSize: 11,
    marginBottom: 8,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  tableScrollWrap: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  tableHeaderCol: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
  },
  tableColText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  scheduleSourceToggleBar: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  scheduleSourceBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  scheduleSourceBtnActive: {
    borderColor: 'transparent',
  },
  scheduleSourceBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scheduleExplainerBox: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  scheduleExplainerTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 3,
  },
});
