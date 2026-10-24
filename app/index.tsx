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
} from 'react-native';
import {
  Sun,
  Moon,
  FolderOpen,
  RotateCcw,
  BookOpen,
} from 'lucide-react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { SimulationInputs } from '../src/engine/types';
import { calculateInitialSplit, runDeterministicSimulation } from '../src/engine/simulationEngine';
import { runMonteCarloSimulation } from '../src/engine/monteCarlo';
import { calculateSafeMonthlyWithdrawal } from '../src/engine/safeWithdrawal';
import { generateStrategyInsights } from '../src/engine/insightsEngine';
import { InputSection } from '../src/components/simulation/InputSection';
import { BucketCards } from '../src/components/simulation/BucketCards';
import { ProjectionChart } from '../src/components/simulation/ProjectionChart';
import { InsightsPanel } from '../src/components/simulation/InsightsPanel';
import { StrategyModal } from '../src/components/simulation/StrategyModal';
import { InstrumentModal } from '../src/components/simulation/InstrumentModal';
import { FinancialGlossaryModal } from '../src/components/common/FinancialGlossaryModal';
import { COUNTRY_METAS, SupportedCountry } from '../src/utils/currency';

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
};

export default function SimulationDashboard() {
  const { colors, theme, toggleTheme } = useTheme();

  const [inputs, setInputs] = useState<SimulationInputs>(DEFAULT_INPUTS);
  const [strategyModalVisible, setStrategyModalVisible] = useState(false);
  const [selectedBucketModal, setSelectedBucketModal] = useState<1 | 2 | 3 | null>(null);
  const [glossaryModalVisible, setGlossaryModalVisible] = useState(false);
  const [glossaryTopic, setGlossaryTopic] = useState<'riskcone' | 'buckets' | 'waterfall' | 'swr'>('riskcone');

  // Re-run simulation models whenever inputs change
  const split = useMemo(() => calculateInitialSplit(inputs), [inputs]);
  const simResults = useMemo(() => runDeterministicSimulation(inputs), [inputs]);
  const mcSummary = useMemo(() => runMonteCarloSimulation(inputs, 500), [inputs]);
  const insights = useMemo(
    () => generateStrategyInsights(inputs, simResults, mcSummary),
    [inputs, simResults, mcSummary]
  );

  const handleSuggestSafeWithdrawal = () => {
    const safeAmount = calculateSafeMonthlyWithdrawal(inputs);
    setInputs((prev) => ({
      ...prev,
      monthlyWithdrawal: safeAmount,
    }));
  };

  const handleResetDefaults = () => {
    setInputs(DEFAULT_INPUTS);
  };

  const openEducation = (topic: 'riskcone' | 'buckets' | 'waterfall' | 'swr' = 'riskcone') => {
    setGlossaryTopic(topic);
    setGlossaryModalVisible(true);
  };

  const countryMeta = COUNTRY_METAS[inputs.baseCountry || 'IN'] || COUNTRY_METAS.IN;
  const activeCountriesList = inputs.multiCountryAllocations.map((a) => a.country);

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
                <Text style={[styles.proBadgeText, { color: colors.accent }]}>80Y PRO</Text>
              </View>
            </View>
            <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>
              Lifelong Multi-Market Wealth Preservation & Monte Carlo Model
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.headerActions}>
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
        </View>
      </View>

      {/* Main Scrollable Content */}
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
                backgroundColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(2, 132, 199, 0.06)',
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
                {inputs.simulationHorizon}-Yr Survival
              </Text>
              <Text
                style={[
                  styles.quickStatVal,
                  { color: mcSummary.successRate >= 90 ? '#10B981' : '#F59E0B' },
                ]}
              >
                {mcSummary.successRate}%
              </Text>
            </View>
          </View>

          {/* 1. Input Section with 80-Year Horizons, Country Blends & Manual Overrides */}
          <InputSection
            inputs={inputs}
            onChangeInputs={setInputs}
            onSuggestSafeWithdrawal={handleSuggestSafeWithdrawal}
            onOpenEducationModal={() => openEducation('swr')}
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

          {/* 3. Trajectory Chart (Scalable to 80 Years) */}
          <ProjectionChart
            results={simResults}
            mcSummary={mcSummary}
            displayHorizon={inputs.displayHorizon || 30}
            baseCountry={inputs.baseCountry}
            onOpenEducationModal={(topic) => openEducation(topic)}
          />

          {/* 4. Actuarial Insights & Depletion Warning Panel */}
          <InsightsPanel
            insights={insights}
            mcSummary={mcSummary}
            baseCountry={inputs.baseCountry}
            simulationHorizon={inputs.simulationHorizon || 30}
          />

          {/* Footer Notes */}
          <View style={styles.footerNote}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              3-Bucket Strategy Simulation • Institutional Multi-Asset Engine (Up to 80-Year Longevity) • Offline Storage & Actuarial Monte Carlo Modelling.
            </Text>
          </View>
        </View>
      </ScrollView>

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
    paddingVertical: 14,
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
});
