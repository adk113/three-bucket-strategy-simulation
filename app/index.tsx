import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import {
  Sun,
  Moon,
  FolderOpen,
  RotateCcw,
  BookOpen,
  HelpCircle,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { SimulationInputs } from '../src/engine/types';
import { calculateInitialSplit, runDeterministicSimulation } from '../src/engine/simulationEngine';
import { runMonteCarloSimulation } from '../src/engine/monteCarlo';
import { calculateSafeMonthlyWithdrawal } from '../src/engine/safeWithdrawal';
import { generateStrategyInsights } from '../src/engine/insightsEngine';
import {
  runHistoricalBacktest,
  runRollingReturnsAnalysis,
  runDeterministicStressTest,
  runGoalsBasedWealth,
  generateModelComparison,
  DEFAULT_GOAL_MILESTONES,
} from '../src/engine/wealthModelsEngine';
import { InputSection } from '../src/components/simulation/InputSection';
import { BucketCards } from '../src/components/simulation/BucketCards';
import { ProjectionChart } from '../src/components/simulation/ProjectionChart';
import { InsightsPanel } from '../src/components/simulation/InsightsPanel';
import { StrategyModal } from '../src/components/simulation/StrategyModal';
import { InstrumentModal } from '../src/components/simulation/InstrumentModal';
import { FinancialGlossaryModal } from '../src/components/common/FinancialGlossaryModal';
import { UserManualModal } from '../src/components/manual/UserManualModal';
import { COUNTRY_METAS } from '../src/utils/currency';
import { exportSimulationBreakdown } from '../src/utils/exportEngine';

const DEFAULT_INPUTS: SimulationInputs = {
  initialCorpus: 20000000, // ₹2 Crore
  monthlyWithdrawal: 65000, // ₹65,000 / month
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
  manualReturns: {
    bucket1: 5.5,
    bucket2: 8.0,
    bucket3: 12.0,
  },
  selectedModel: 'monte_carlo',
  historicalCrisis: '2008_gfc',
  rollingWindowYears: 5,
  stressTestScenario: 'equity_crash_30_inflation_8',
  goalMilestones: DEFAULT_GOAL_MILESTONES,
};

export default function SimulationDashboard() {
  const { colors, theme, toggleTheme } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Responsive landscape detection:
  // 1. Tablet & Desktop: Wide display (>= 960) and ample vertical height (>= 520)
  const isTabletOrDesktop = windowWidth >= 960 && windowHeight >= 520;

  // 2. Mobile Phone Landscape: Wide width (windowWidth > windowHeight) but short vertical height (< 520)
  const isPhoneLandscape = windowWidth > windowHeight && windowHeight < 520;

  // Backward compatibility alias for desktop split view
  const isLandscape = isTabletOrDesktop;
  const leftPanelWidth = Math.min(480, Math.round(windowWidth * 0.43));
  const landscapeChartWidth = Math.max(320, windowWidth - leftPanelWidth - 64);

  // Active view tab when mobile phone is auto-rotated to landscape
  const [phoneLandscapeTab, setPhoneLandscapeTab] = useState<'chart' | 'inputs' | 'insights'>('chart');

  const [inputs, setInputs] = useState<SimulationInputs>(DEFAULT_INPUTS);
  const [strategyModalVisible, setStrategyModalVisible] = useState(false);
  const [selectedBucketModal, setSelectedBucketModal] = useState<1 | 2 | 3 | null>(null);
  const [glossaryModalVisible, setGlossaryModalVisible] = useState(false);
  const [glossaryTopic, setGlossaryTopic] = useState<
    'riskcone' | 'buckets' | 'waterfall' | 'swr' | 'methodologies'
  >('riskcone');
  const [manualModalVisible, setManualModalVisible] = useState(false);

  // Export engine state
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Re-run simulation models whenever inputs change
  const split = useMemo(() => calculateInitialSplit(inputs), [inputs]);
  const simResults = useMemo(() => runDeterministicSimulation(inputs), [inputs]);
  const mcSummary = useMemo(() => runMonteCarloSimulation(inputs, 500), [inputs]);

  // Alternative Wealth Management Analytical Models
  const backtestResult = useMemo(
    () => runHistoricalBacktest(inputs, inputs.historicalCrisis),
    [inputs]
  );
  const rollingResult = useMemo(
    () => runRollingReturnsAnalysis(inputs, inputs.rollingWindowYears || 5),
    [inputs]
  );
  const stressResult = useMemo(
    () => runDeterministicStressTest(inputs, inputs.stressTestScenario),
    [inputs]
  );
  const goalsResult = useMemo(() => runGoalsBasedWealth(inputs), [inputs]);
  const modelComparison = useMemo(
    () => generateModelComparison(inputs, simResults, mcSummary),
    [inputs, simResults, mcSummary]
  );

  const insights = useMemo(
    () =>
      generateStrategyInsights(
        inputs,
        simResults,
        mcSummary,
        backtestResult,
        rollingResult,
        stressResult,
        goalsResult,
        modelComparison
      ),
    [
      inputs,
      simResults,
      mcSummary,
      backtestResult,
      rollingResult,
      stressResult,
      goalsResult,
      modelComparison,
    ]
  );

  const handleSuggestSafeWithdrawal = () => {
    const safeAmount = calculateSafeMonthlyWithdrawal(inputs);
    if (inputs.monthlyWithdrawal === safeAmount) return;
    setInputs((prev) => ({
      ...prev,
      monthlyWithdrawal: safeAmount,
    }));
  };

  const handleResetDefaults = () => {
    setInputs(DEFAULT_INPUTS);
  };

  const openEducation = (
    topic: 'riskcone' | 'buckets' | 'waterfall' | 'swr' | 'methodologies' = 'riskcone'
  ) => {
    setGlossaryTopic(topic);
    setGlossaryModalVisible(true);
  };

  const handleExportData = async () => {
    if (isExporting) return;
    setIsExporting(true);
    const res = await exportSimulationBreakdown(inputs, simResults, mcSummary);
    setIsExporting(false);
    setExportFeedback(res.message);
    setTimeout(() => {
      setExportFeedback(null);
    }, 4500);
  };

  const countryMeta = COUNTRY_METAS[inputs.baseCountry || 'IN'] || COUNTRY_METAS.IN;
  const activeCountriesList = inputs.multiCountryAllocations.map((a) => a.country);

  // Dynamic quick status reflecting active wealth model
  const quickStatMeta = useMemo(() => {
    const m = inputs.selectedModel || 'monte_carlo';
    if (m === 'historical_backtest') {
      return {
        label: `${(inputs.historicalCrisis || '2008_gfc').toUpperCase().replace('_', ' ')} Drawdown`,
        val: `-${backtestResult.maxDrawdownPct}%`,
        color: backtestResult.survived ? '#10B981' : '#EF4444',
      };
    }
    if (m === 'rolling_returns') {
      return {
        label: `${rollingResult.windowYears}Y Positive Odds`,
        val: `${rollingResult.positiveReturnProbabilityPct}%`,
        color: '#10B981',
      };
    }
    if (m === 'stress_testing') {
      return {
        label: 'Shock Cushion',
        val: `${stressResult.cushionRemainingPct}%`,
        color: stressResult.cushionRemainingPct >= 50 ? '#10B981' : '#F59E0B',
      };
    }
    if (m === 'goals_based') {
      const fundedCount = goalsResult.milestoneStatuses.filter((s) => s.isFullyFunded).length;
      return {
        label: 'Goals Funded',
        val: `${fundedCount}/${goalsResult.milestoneStatuses.length}`,
        color: goalsResult.allMilestonesFunded ? '#10B981' : '#8B5CF6',
      };
    }
    if (m === 'comparison') {
      return {
        label: 'Model Comparison',
        val: '5 Overlaid',
        color: '#6366F1',
      };
    }
    return {
      label: `${inputs.simulationHorizon}-Yr Survival`,
      val: `${mcSummary.successRate}%`,
      color: mcSummary.successRate >= 90 ? '#10B981' : '#F59E0B',
    };
  }, [
    inputs.selectedModel,
    inputs.historicalCrisis,
    inputs.simulationHorizon,
    backtestResult,
    rollingResult,
    stressResult,
    goalsResult,
    mcSummary,
  ]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* Top Header */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            shadowColor: colors.cardShadow,
          },
        ]}
      >
        <View style={styles.brandGroup}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                3-Bucket Strategy
              </Text>
              <View style={[styles.proBadge, { backgroundColor: colors.accent + '25' }]}>
                <Text style={[styles.proBadgeText, { color: colors.accent }]}>
                  {isTabletOrDesktop ? 'DESKTOP SPLIT' : isPhoneLandscape ? 'PANORAMIC WIDE' : '80Y PRO'}
                </Text>
              </View>
            </View>
            <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>
              Lifelong Multi-Market Wealth Preservation & Monte Carlo Model
            </Text>
          </View>
        </View>

        {/* Header Action Buttons */}
        <View style={styles.headerActions}>
          {/* Export CSV Button */}
          <TouchableOpacity
            style={[
              styles.headerBtn,
              {
                backgroundColor: '#10B98118',
                borderColor: '#10B98150',
              },
            ]}
            onPress={handleExportData}
            activeOpacity={0.7}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#10B981" style={{ marginRight: 6 }} />
            ) : (
              <FileSpreadsheet size={15} color="#10B981" style={{ marginRight: 6 }} />
            )}
            <Text style={[styles.headerBtnText, { color: '#10B981' }]}>
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Text>
          </TouchableOpacity>

          {/* Education Glossary Button */}
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
            onPress={() => openEducation('riskcone')}
            activeOpacity={0.7}
          >
            <BookOpen size={15} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.headerBtnText, { color: colors.textPrimary }]}>
              Glossary
            </Text>
          </TouchableOpacity>

          {/* Strategy Manager Modal Trigger */}
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
            onPress={() => setStrategyModalVisible(true)}
            activeOpacity={0.7}
          >
            <FolderOpen size={15} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.headerBtnText, { color: colors.textPrimary }]}>
              Profiles
            </Text>
          </TouchableOpacity>

          {/* Reset button */}
          <TouchableOpacity
            style={[styles.iconOnlyBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
            onPress={handleResetDefaults}
            activeOpacity={0.7}
          >
            <RotateCcw size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Dark / Light Mode Toggle */}
          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {theme === 'dark' ? (
              <Sun size={17} color="#FBBF24" />
            ) : (
              <Moon size={17} color="#6366F1" />
            )}
          </TouchableOpacity>

          {/* In-App User Manual "?" Button */}
          <TouchableOpacity
            style={[
              styles.iconOnlyBtn,
              {
                backgroundColor: colors.accent + '20',
                borderColor: colors.accent + '55',
                width: 36,
                height: 36,
              },
            ]}
            onPress={() => setManualModalVisible(true)}
            activeOpacity={0.7}
            accessibilityLabel="Open In-App User Manual"
          >
            <HelpCircle size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Export Toast Feedback */}
      {exportFeedback && (
        <View
          style={[
            styles.floatingToast,
            { backgroundColor: colors.surfaceElevated, borderColor: '#10B981' },
          ]}
        >
          <CheckCircle2 size={16} color="#10B981" style={{ marginRight: 8 }} />
          <Text style={[styles.toastText, { color: colors.textPrimary }]}>
            {exportFeedback}
          </Text>
        </View>
      )}

      {/* Dynamic Responsive Layout: Tablet Split Dashboard vs Auto-Rotated Phone Panoramic vs Portrait Single Column */}
      {isTabletOrDesktop ? (
        /* Tablet & Desktop 2-Column Split View */
        <View style={styles.landscapeContainer}>
          {/* Left Column: Fixed / Scrollable Configuration Panel */}
          <View
            style={[
              styles.landscapeLeftColumn,
              { width: leftPanelWidth, borderRightColor: colors.borderSubtle },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.landscapeLeftScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Compact Hero Card */}
              <View
                style={[
                  styles.heroBanner,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(56, 189, 248, 0.08)'
                        : 'rgba(2, 132, 199, 0.06)',
                    borderColor: colors.accent + '35',
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.countryFlagBadge}>{countryMeta.flag}</Text>
                    <Text style={[styles.heroHeading, { color: colors.textPrimary }]}>
                      {countryMeta.name} Base ({countryMeta.currencyCode}) • {inputs.simulationHorizon}Y
                    </Text>
                  </View>
                  <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
                    Bucket 1 protects {inputs.bucket1Years}Y cash. Bucket 2 absorbs bond income. Bucket 3 compounds wealth across {inputs.simulationHorizon} years.
                  </Text>
                </View>
              </View>

              {/* Input Section */}
              <InputSection
                inputs={inputs}
                onChangeInputs={setInputs}
                onSuggestSafeWithdrawal={handleSuggestSafeWithdrawal}
                onOpenEducationModal={() => openEducation('swr')}
              />
            </ScrollView>
          </View>

          {/* Right Column: Visual Charts, Live Bucket Cards & Insights */}
          <View style={styles.landscapeRightColumn}>
            <ScrollView
              contentContainerStyle={styles.landscapeRightScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Top Quick Status */}
              <View style={styles.landscapeRightHeaderRow}>
                <View style={styles.quickStatBox}>
                  <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>
                    {quickStatMeta.label}
                  </Text>
                  <Text style={[styles.quickStatVal, { color: quickStatMeta.color }]}>
                    {quickStatMeta.val}
                  </Text>
                </View>
              </View>

              {/* 2. Live 3-Bucket Split Cards */}
              <BucketCards
                initialCorpus={inputs.initialCorpus}
                split={split}
                b1Years={inputs.bucket1Years}
                b2Years={inputs.bucket2Years}
                baseCountry={inputs.baseCountry}
                multiCountryAllocations={inputs.multiCountryAllocations}
                onSelectBucket={(bNum) => setSelectedBucketModal(bNum)}
              />

              {/* 3. Scalable Trajectory & Model Comparison Chart */}
              <ProjectionChart
                results={simResults}
                mcSummary={mcSummary}
                displayHorizon={inputs.displayHorizon || 30}
                baseCountry={inputs.baseCountry}
                customWidth={landscapeChartWidth}
                onOpenEducationModal={(topic) => openEducation(topic)}
                selectedModel={inputs.selectedModel || 'monte_carlo'}
                historicalBacktest={backtestResult}
                rollingReturns={rollingResult}
                stressTest={stressResult}
                goalsBased={goalsResult}
                modelComparison={modelComparison}
                onSelectModel={(m) => setInputs((prev) => ({ ...prev, selectedModel: m }))}
              />

              {/* 4. Actuarial Insights Panel Tailored to Active Model */}
              <InsightsPanel
                insights={insights}
                mcSummary={mcSummary}
                baseCountry={inputs.baseCountry}
                simulationHorizon={inputs.simulationHorizon || 30}
                selectedModel={inputs.selectedModel || 'monte_carlo'}
                historicalBacktest={backtestResult}
                rollingReturns={rollingResult}
                stressTest={stressResult}
                goalsBased={goalsResult}
                modelComparison={modelComparison}
              />

              <View style={styles.footerNote}>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  3-Bucket Strategy Simulation • Institutional Multi-Asset Engine (Up to 80-Year Longevity) • Offline Storage & Actuarial Monte Carlo.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      ) : isPhoneLandscape ? (
        /* Phone Landscape Panoramic View: Optimized for auto-rotated phones */
        <View style={styles.phoneLandscapeContainer}>
          {/* Panoramic Segmented Switcher */}
          <View style={[styles.phoneLandscapeTabBar, { backgroundColor: colors.surface, borderBottomColor: colors.borderSubtle }]}>
            <TouchableOpacity
              onPress={() => setPhoneLandscapeTab('chart')}
              style={[
                styles.phoneLandscapeTabBtn,
                phoneLandscapeTab === 'chart' && { backgroundColor: colors.accent + '20', borderColor: colors.accent },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.phoneLandscapeTabText,
                  { color: phoneLandscapeTab === 'chart' ? colors.accent : colors.textSecondary },
                ]}
              >
                📊 Panoramic Chart & Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPhoneLandscapeTab('inputs')}
              style={[
                styles.phoneLandscapeTabBtn,
                phoneLandscapeTab === 'inputs' && { backgroundColor: colors.accent + '20', borderColor: colors.accent },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.phoneLandscapeTabText,
                  { color: phoneLandscapeTab === 'inputs' ? colors.accent : colors.textSecondary },
                ]}
              >
                ⚙️ Strategy Inputs & ROI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPhoneLandscapeTab('insights')}
              style={[
                styles.phoneLandscapeTabBtn,
                phoneLandscapeTab === 'insights' && { backgroundColor: colors.accent + '20', borderColor: colors.accent },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.phoneLandscapeTabText,
                  { color: phoneLandscapeTab === 'insights' ? colors.accent : colors.textSecondary },
                ]}
              >
                💡 Strategy Insights
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setManualModalVisible(true)}
              style={[
                styles.phoneLandscapeTabBtn,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.phoneLandscapeTabText, { color: colors.textSecondary }]}>
                📖 User Manual
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.phoneLandscapeScroll} showsVerticalScrollIndicator={false}>
            {phoneLandscapeTab === 'chart' && (
              <View style={styles.phoneLandscapeChartWrap}>
                <BucketCards
                  initialCorpus={inputs.initialCorpus}
                  split={split}
                  b1Years={inputs.bucket1Years}
                  b2Years={inputs.bucket2Years}
                  baseCountry={inputs.baseCountry}
                  multiCountryAllocations={inputs.multiCountryAllocations}
                  onSelectBucket={(bNum) => setSelectedBucketModal(bNum)}
                />
                <ProjectionChart
                  results={simResults}
                  mcSummary={mcSummary}
                  displayHorizon={inputs.displayHorizon || 30}
                  baseCountry={inputs.baseCountry}
                  customWidth={Math.max(340, windowWidth - 32)}
                  onOpenEducationModal={(topic) => openEducation(topic)}
                  selectedModel={inputs.selectedModel || 'monte_carlo'}
                  historicalBacktest={backtestResult}
                  rollingReturns={rollingResult}
                  stressTest={stressResult}
                  goalsBased={goalsResult}
                  modelComparison={modelComparison}
                  onSelectModel={(m) => setInputs((prev) => ({ ...prev, selectedModel: m }))}
                />
              </View>
            )}

            {phoneLandscapeTab === 'inputs' && (
              <View style={styles.phoneLandscapeInputsWrap}>
                <InputSection
                  inputs={inputs}
                  onChangeInputs={setInputs}
                  onSuggestSafeWithdrawal={handleSuggestSafeWithdrawal}
                  onOpenEducationModal={() => openEducation('swr')}
                />
              </View>
            )}

            {phoneLandscapeTab === 'insights' && (
              <View style={styles.phoneLandscapeInsightsWrap}>
                <InsightsPanel
                  insights={insights}
                  mcSummary={mcSummary}
                  baseCountry={inputs.baseCountry}
                  simulationHorizon={inputs.simulationHorizon || 30}
                  selectedModel={inputs.selectedModel || 'monte_carlo'}
                  historicalBacktest={backtestResult}
                  rollingReturns={rollingResult}
                  stressTest={stressResult}
                  goalsBased={goalsResult}
                  modelComparison={modelComparison}
                />
              </View>
            )}

            <View style={styles.footerNote}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                3-Bucket Strategy Simulation • Auto-Rotated Panoramic Mobile View.
              </Text>
            </View>
          </ScrollView>
        </View>
      ) : (
        /* Portrait Mode: Single-Column Vertical Flow */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentConstrained}>
            {/* Hero Banner / Strategy Summary */}
            <View
              style={[
                styles.heroBanner,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(56, 189, 248, 0.08)'
                      : 'rgba(2, 132, 199, 0.06)',
                  borderColor: colors.accent + '35',
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={styles.countryFlagBadge}>{countryMeta.flag}</Text>
                  <Text style={[styles.heroHeading, { color: colors.textPrimary }]}>
                    {countryMeta.name} Base ({countryMeta.currencyCode}) • {inputs.simulationHorizon}-Year Horizon
                  </Text>
                </View>
                <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
                  Bucket 1 secures living expenses for {inputs.bucket1Years} years without liquidation risks. Bucket 2 absorbs equity volatility, and Bucket 3 compounds wealth across {inputs.simulationHorizon} years with multi-country cross-border allocations.
                </Text>
              </View>
              <View style={styles.quickStatBox}>
                <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>
                  {quickStatMeta.label}
                </Text>
                <Text style={[styles.quickStatVal, { color: quickStatMeta.color }]}>
                  {quickStatMeta.val}
                </Text>
              </View>
            </View>

            {/* 1. Input Section with 80-Year Horizons, Country Blends & Model Choice */}
            <InputSection
              inputs={inputs}
              onChangeInputs={setInputs}
              onSuggestSafeWithdrawal={handleSuggestSafeWithdrawal}
              onOpenEducationModal={(topic) => openEducation(topic || 'methodologies')}
            />

            {/* 2. Live 3-Bucket Allocation Split Cards */}
            <BucketCards
              initialCorpus={inputs.initialCorpus}
              split={split}
              b1Years={inputs.bucket1Years}
              b2Years={inputs.bucket2Years}
              baseCountry={inputs.baseCountry}
              multiCountryAllocations={inputs.multiCountryAllocations}
              onSelectBucket={(bNum) => setSelectedBucketModal(bNum)}
            />

            {/* 3. Trajectory & Cross-Model Comparison Chart (Scalable to 80 Years) */}
            <ProjectionChart
              results={simResults}
              mcSummary={mcSummary}
              displayHorizon={inputs.displayHorizon || 30}
              baseCountry={inputs.baseCountry}
              onOpenEducationModal={(topic) => openEducation(topic)}
              selectedModel={inputs.selectedModel || 'monte_carlo'}
              historicalBacktest={backtestResult}
              rollingReturns={rollingResult}
              stressTest={stressResult}
              goalsBased={goalsResult}
              modelComparison={modelComparison}
              onSelectModel={(m) => setInputs((prev) => ({ ...prev, selectedModel: m }))}
            />



            {/* 4. Actuarial Insights & Depletion Warning Panel Tailored to Active Model */}
            <InsightsPanel
              insights={insights}
              mcSummary={mcSummary}
              baseCountry={inputs.baseCountry}
              simulationHorizon={inputs.simulationHorizon || 30}
              selectedModel={inputs.selectedModel || 'monte_carlo'}
              historicalBacktest={backtestResult}
              rollingReturns={rollingResult}
              stressTest={stressResult}
              goalsBased={goalsResult}
              modelComparison={modelComparison}
            />

            {/* Footer Notes */}
            <View style={styles.footerNote}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                3-Bucket Strategy Simulation • Institutional Multi-Asset Engine (Up to 80-Year Longevity) • Offline Storage & Actuarial Monte Carlo Modelling.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Offline Strategy Modal */}
      <StrategyModal
        visible={strategyModalVisible}
        onClose={() => setStrategyModalVisible(false)}
        currentInputs={inputs}
        onLoadStrategy={(newInputs) => setInputs(newInputs)}
      />

      {/* Instrument Recommendations Modal (Multi-Market) */}
      <InstrumentModal
        bucketNum={selectedBucketModal}
        baseCountry={inputs.baseCountry}
        activeCountries={activeCountriesList}
        onClose={() => setSelectedBucketModal(null)}
      />

      {/* Financial Education & Glossary Modal */}
      <FinancialGlossaryModal
        visible={glossaryModalVisible}
        initialTopic={glossaryTopic}
        onClose={() => setGlossaryModalVisible(false)}
      />

      {/* In-App Interactive User Manual Modal */}
      <UserManualModal
        visible={manualModalVisible}
        onClose={() => setManualModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 10,
    elevation: 3,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  proBadge: {
    marginLeft: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  headerBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconOnlyBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  themeToggleBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  floatingToast: {
    position: 'absolute',
    top: 72,
    alignSelf: 'center',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Landscape Split View Styles
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  landscapeLeftColumn: {
    borderRightWidth: 1,
  },
  landscapeLeftScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  landscapeRightColumn: {
    flex: 1,
  },
  landscapeRightScroll: {
    padding: 16,
    paddingBottom: 50,
  },
  landscapeRightHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
    flexWrap: 'wrap',
  },
  exportBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  exportBannerBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Portrait Styles
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  contentConstrained: {
    width: '100%',
    maxWidth: 900,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  countryFlagBadge: {
    fontSize: 18,
    marginRight: 6,
  },
  heroHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  heroDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  quickStatBox: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  quickStatVal: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  footerNote: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Phone Landscape Panoramic Mode Styles
  phoneLandscapeContainer: {
    flex: 1,
  },
  phoneLandscapeTabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  phoneLandscapeTabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  phoneLandscapeTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  phoneLandscapeScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  phoneLandscapeChartWrap: {
    width: '100%',
  },
  phoneLandscapeInputsWrap: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  phoneLandscapeInsightsWrap: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
});
