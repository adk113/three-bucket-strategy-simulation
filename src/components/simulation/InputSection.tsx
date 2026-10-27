import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  Sparkles,
  Sliders,
  History,
  Globe2,
  CalendarDays,
  HelpCircle,
  Plus,
  Trash2,
  Settings2,
  X,
  Check,
  ShieldAlert,
  Activity,
  Target,
  Scale,
  Zap,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Percent,
  TrendingUp,
  Layers,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { DatePickerInput } from '../common/DatePickerInput';
import {
  CrossBorderEquityAllocation,
  SimulationInputs,
  WealthModelType,
  HistoricalCrisisType,
  StressScenarioType,
} from '../../engine/types';
import { PALETTE } from '../../theme/colors';
import { COUNTRY_METAS, SupportedCountry, formatCurrency } from '../../utils/currency';
import { COUNTRY_PROFILES, calculateMultiAssetBlendedB3 } from '../../engine/historicalData';
import { calculateInitialSplit } from '../../engine/simulationEngine';
import { calculateSafeMonthlyWithdrawal } from '../../engine/safeWithdrawal';
import {
  HISTORICAL_CRISIS_DATA,
  STRESS_SCENARIOS_DATA,
} from '../../engine/wealthModelsEngine';

interface InputSectionProps {
  inputs: SimulationInputs;
  onChangeInputs: (newInputs: SimulationInputs) => void;
  onSuggestSafeWithdrawal: () => void;
  onOpenEducationModal?: (
    topic?: 'riskcone' | 'buckets' | 'waterfall' | 'swr' | 'methodologies'
  ) => void;
}

const HORIZON_OPTIONS = [
  { value: 10, label: '10 Years', desc: 'Short Horizon / Phase 1' },
  { value: 15, label: '15 Years', desc: 'Mid Horizon' },
  { value: 20, label: '20 Years', desc: 'Two Decades' },
  { value: 25, label: '25 Years', desc: 'Quarter Century' },
  { value: 30, label: '30 Years', desc: 'Standard Retirement' },
  { value: 40, label: '40 Years', desc: 'Extended Longevity' },
  { value: 50, label: '50 Years', desc: '🌟 Lifelong Multi-Decade' },
  { value: 60, label: '60 Years', desc: '💎 Multi-Generational' },
  { value: 70, label: '70 Years', desc: 'Dynasty Horizon' },
  { value: 80, label: '80 Years', desc: '👑 Centenarian Longevity' },
];

export const InputSection: React.FC<InputSectionProps> = ({
  inputs,
  onChangeInputs,
  onSuggestSafeWithdrawal,
  onOpenEducationModal,
}) => {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const isCompact = screenWidth < 500;
  const country = inputs.baseCountry || 'IN';
  const meta = COUNTRY_METAS[country] || COUNTRY_METAS.IN;

  // Modals for Unified Horizon, Corpus, Withdrawal, and Inflation dropdowns
  const [isHorizonModalOpen, setIsHorizonModalOpen] = useState(false);
  const [isCorpusModalOpen, setIsCorpusModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isInflationModalOpen, setIsInflationModalOpen] = useState(false);

  // Dynamic Safe Monthly Withdrawal Benchmark & Range (±5k to ±25k)
  const dynamicSafeBenchmark = useMemo(() => {
    return calculateSafeMonthlyWithdrawal(inputs);
  }, [inputs]);

  const withdrawalRangeOptions = useMemo(() => {
    const isIndia = (inputs.baseCountry || 'IN') === 'IN';
    const minFloor = isIndia ? 5000 : 500;
    const offsets = [-25000, -20000, -15000, -10000, -5000, 0, 5000, 10000, 15000, 20000, 25000];
    const base = dynamicSafeBenchmark;

    return offsets
      .map((delta) => {
        const val = Math.max(minFloor, base + delta);
        const deltaLabel =
          delta === 0
            ? '⭐ Suggested Safe Benchmark'
            : delta < 0
            ? `${delta / 1000}K (Conservative buffer)`
            : `+${delta / 1000}K (Elevated draw)`;
        return {
          delta,
          value: val,
          label: formatCurrency(val, country),
          desc: `${deltaLabel} • Annual: ${formatCurrency(val * 12, country)}`,
        };
      })
      .filter((opt, idx, arr) => arr.findIndex((x) => x.value === opt.value) === idx);
  }, [dynamicSafeBenchmark, inputs.baseCountry, country]);

  // Initial Retirement Corpus Dropdown Options (50 L to 10 Cr with 50 L intervals)
  const corpusDropdownOptions = useMemo(() => {
    const list = [];
    // 50 Lakhs (5,000,000) to 10 Crore (100,000,000) in steps of 50 Lakhs (5,000,000)
    for (let c = 5000000; c <= 100000000; c += 5000000) {
      const crVal = c / 10000000;
      const label =
        c < 10000000
          ? `${c / 100000} Lakhs (${crVal.toFixed(2)} Cr)`
          : `${crVal.toFixed(1)} Crore`;
      list.push({
        value: c,
        label,
        formatted: formatCurrency(c, country),
      });
    }
    return list;
  }, [country]);

  // Expected Inflation Dropdown Options (0% to 10%)
  const inflationDropdownOptions = useMemo(() => {
    const list = [];
    for (let i = 0; i <= 10; i++) {
      list.push({
        value: i,
        label: `${i}%`,
        desc:
          i === 0
            ? '0% Inflation (Nominal = Real)'
            : i === 6
            ? '6.0% (India Historical Benchmark)'
            : i === 3
            ? '3.0% (Developed Market Benchmark)'
            : `${i}% Annual Inflation`,
      });
    }
    return list;
  }, []);

  const handleSelectUnifiedHorizon = (years: number) => {
    onChangeInputs({
      ...inputs,
      simulationHorizon: years,
      displayHorizon: years,
    });
    setIsHorizonModalOpen(false);
  };

  const handleSelectCorpus = (corpusVal: number) => {
    onChangeInputs({
      ...inputs,
      initialCorpus: corpusVal,
    });
    setIsCorpusModalOpen(false);
  };

  const handleSelectWithdrawal = (withdrawalVal: number) => {
    onChangeInputs({
      ...inputs,
      monthlyWithdrawal: withdrawalVal,
    });
    setIsWithdrawalModalOpen(false);
  };

  const handleSelectInflation = (inflationVal: number) => {
    onChangeInputs({
      ...inputs,
      inflationRate: inflationVal,
    });
    setIsInflationModalOpen(false);
  };

  const handleCorpusChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    const num = clean ? parseInt(clean, 10) : 0;
    onChangeInputs({ ...inputs, initialCorpus: num });
  };

  const handleWithdrawalChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    const num = clean ? parseInt(clean, 10) : 0;
    onChangeInputs({ ...inputs, monthlyWithdrawal: num });
  };

  const handleInflationChange = (text: string) => {
    const num = parseFloat(text);
    onChangeInputs({
      ...inputs,
      inflationRate: isNaN(num) ? 0 : Math.min(25, Math.max(0, num)),
    });
  };

  const handleBaseCountryChange = (newCountry: SupportedCountry) => {
    const newMeta = COUNTRY_METAS[newCountry];
    const defaultSec = newCountry === 'US' ? 'IN' : 'US';
    const newAllocs: CrossBorderEquityAllocation[] = [
      { country: newCountry, weight: 60, isManual: false },
      { country: defaultSec, weight: 40, isManual: false },
    ];

    onChangeInputs({
      ...inputs,
      baseCountry: newCountry,
      multiCountryAllocations: newAllocs,
      inflationRate: newMeta.defaultInflation,
      initialCorpus: newMeta.defaultCorpus,
      monthlyWithdrawal: newMeta.defaultWithdrawal,
    });
  };

  // Multi-country allocation helpers: allow freeform entry without keystroke interference
  const handleUpdateWeight = (idx: number, newWeightStr: string) => {
    const rawDigits = newWeightStr.replace(/[^0-9]/g, '');
    const w = rawDigits === '' ? 0 : parseInt(rawDigits, 10);
    const clamped = Math.min(100, Math.max(0, w));
    const list = inputs.multiCountryAllocations.map((item, i) =>
      i === idx ? { ...item, weight: clamped } : { ...item }
    );
    onChangeInputs({ ...inputs, multiCountryAllocations: list });
  };

  const handleToggleManualCountry = (idx: number, isManual: boolean) => {
    const updated = [...inputs.multiCountryAllocations];
    const item = updated[idx];
    const defaultData = COUNTRY_PROFILES[item.country].bucket3;
    updated[idx] = {
      ...item,
      isManual,
      customReturn: isManual ? defaultData.nominalReturnMean : undefined,
      customStdDev: isManual ? defaultData.stdDev : undefined,
    };
    onChangeInputs({ ...inputs, multiCountryAllocations: updated });
  };

  const handleUpdateCustomMetrics = (
    idx: number,
    field: 'return' | 'stdDev',
    valStr: string
  ) => {
    const val = parseFloat(valStr) || 0;
    const updated = [...inputs.multiCountryAllocations];
    if (field === 'return') {
      updated[idx] = { ...updated[idx], customReturn: val };
    } else {
      updated[idx] = { ...updated[idx], customStdDev: val };
    }
    onChangeInputs({ ...inputs, multiCountryAllocations: updated });
  };

  const handleAddCountryToEquity = (c: SupportedCountry) => {
    if (inputs.multiCountryAllocations.some((a) => a.country === c)) return;
    const list = inputs.multiCountryAllocations.map((item) => ({ ...item }));

    if (list.length === 1) {
      // Transitioning from 1 to 2 countries: default to 60 / 40 split
      list[0].weight = 60;
      list.push({ country: c, weight: 40, isManual: false });
    } else {
      // Transitioning to 3+ countries: reserve 20% for new country and scale others
      const newWeight = 20;
      const scale = (100 - newWeight) / 100;
      let allocated = 0;
      list.forEach((item) => {
        item.weight = Math.round(item.weight * scale);
        allocated += item.weight;
      });
      list.push({ country: c, weight: Math.max(0, 100 - allocated), isManual: false });
    }

    onChangeInputs({ ...inputs, multiCountryAllocations: list });
  };

  const handleRemoveCountry = (idx: number) => {
    if (inputs.multiCountryAllocations.length <= 1) return;
    const deletedWeight = inputs.multiCountryAllocations[idx]?.weight || 0;
    const remaining = inputs.multiCountryAllocations
      .filter((_, i) => i !== idx)
      .map((item) => ({ ...item }));

    // While deleting, the deleted % gets added to the last available entry
    const lastIdx = remaining.length - 1;
    remaining[lastIdx].weight = Math.min(100, remaining[lastIdx].weight + deletedWeight);

    onChangeInputs({ ...inputs, multiCountryAllocations: remaining });
  };

  const split = calculateInitialSplit(inputs);
  const blendedB3 = calculateMultiAssetBlendedB3(country, inputs.multiCountryAllocations);
  const totalAllocWeight = inputs.multiCountryAllocations.reduce((acc, cur) => acc + cur.weight, 0);
  const isAllocationBalanced = totalAllocWeight === 100;
  const lastCountryIdx = inputs.multiCountryAllocations.length - 1;
  const sumExceptLast = inputs.multiCountryAllocations
    .slice(0, lastCountryIdx)
    .reduce((acc, cur) => acc + cur.weight, 0);
  const neededForLast = Math.max(0, 100 - sumExceptLast);

  const handleBalanceLastEntry = () => {
    if (inputs.multiCountryAllocations.length === 0) return;
    const list = inputs.multiCountryAllocations.map((item, i) =>
      i === lastCountryIdx ? { ...item, weight: neededForLast } : { ...item }
    );
    onChangeInputs({ ...inputs, multiCountryAllocations: list });
  };

  const currentGrowthPct =
    inputs.targetGrowthPercent ??
    Math.round((split.bucket3 / Math.max(1, inputs.initialCorpus)) * 100);

  const handleSetGrowthPercent = (pct: number) => {
    const cleanPct = Math.min(95, Math.max(5, pct));
    onChangeInputs({ ...inputs, targetGrowthPercent: cleanPct });
  };

  const handleApplySplitPreset = (preset: '100' | '70_30' | '60_40' | '50_50' | 'equal') => {
    const list = inputs.multiCountryAllocations.map((a) => ({ ...a }));
    if (list.length === 0) return;

    if (preset === '100') {
      list.forEach((a, i) => {
        a.weight = i === 0 ? 100 : 0;
      });
    } else if (preset === '70_30') {
      if (list.length >= 2) {
        list[0].weight = 70;
        list[1].weight = 30;
        for (let i = 2; i < list.length; i++) list[i].weight = 0;
      } else {
        list[0].weight = 100;
      }
    } else if (preset === '60_40') {
      if (list.length >= 2) {
        list[0].weight = 60;
        list[1].weight = 40;
        for (let i = 2; i < list.length; i++) list[i].weight = 0;
      } else {
        list[0].weight = 100;
      }
    } else if (preset === '50_50') {
      if (list.length >= 2) {
        list[0].weight = 50;
        list[1].weight = 50;
        for (let i = 2; i < list.length; i++) list[i].weight = 0;
      } else {
        list[0].weight = 100;
      }
    } else if (preset === 'equal') {
      const share = Math.floor(100 / list.length);
      let allocated = 0;
      list.forEach((a, i) => {
        if (i === list.length - 1) {
          a.weight = 100 - allocated;
        } else {
          a.weight = share;
          allocated += share;
        }
      });
    }
    onChangeInputs({ ...inputs, multiCountryAllocations: list });
  };

  // Bucket Tenure & Time Horizons Handlers
  const handleUpdateBucket1Years = (years: number) => {
    const clamped = Math.min(10, Math.max(1, Math.round(years)));
    onChangeInputs({
      ...inputs,
      bucket1Years: clamped,
    });
  };

  const handleUpdateBucket2Years = (years: number) => {
    const clamped = Math.min(15, Math.max(1, Math.round(years)));
    onChangeInputs({
      ...inputs,
      bucket2Years: clamped,
    });
  };

  const handleAdjustBucket1Years = (delta: number) => {
    handleUpdateBucket1Years((inputs.bucket1Years || 3) + delta);
  };

  const handleAdjustBucket2Years = (delta: number) => {
    handleUpdateBucket2Years((inputs.bucket2Years || 7) + delta);
  };

  const b1Y = inputs.bucket1Years || 3;
  const b2Y = inputs.bucket2Years || 7;
  const totalBufferY = b1Y + b2Y;
  const horizonY = inputs.simulationHorizon || 30;
  const b3StartYear = totalBufferY + 1;
  const b3RunwayY = Math.max(1, horizonY - totalBufferY);

  const annualExpense = inputs.monthlyWithdrawal * 12;
  const targetB1Amount = annualExpense * b1Y;
  const targetB2Amount = annualExpense * b2Y;

  // Bucket Expected ROI (% Annual Returns) Logic
  const countryProfile =
    COUNTRY_PROFILES[inputs.baseCountry || 'IN'] || COUNTRY_PROFILES.IN;
  const benchmarkB1 = countryProfile.bucket1.nominalReturnMean;
  const benchmarkB2 = countryProfile.bucket2.nominalReturnMean;
  const benchmarkB3 = Number(blendedB3.blendedReturn.toFixed(2));

  const currentB1Roi =
    inputs.mode === 'manual'
      ? (inputs.manualReturns?.bucket1 ?? benchmarkB1)
      : benchmarkB1;
  const currentB2Roi =
    inputs.mode === 'manual'
      ? (inputs.manualReturns?.bucket2 ?? benchmarkB2)
      : benchmarkB2;
  const currentB3Roi =
    inputs.mode === 'manual'
      ? (inputs.manualReturns?.bucket3 ?? benchmarkB3)
      : benchmarkB3;

  const handleUpdateBucketRoi = (bucket: 1 | 2 | 3, valueStr: string) => {
    const clean = valueStr.replace(/[^0-9.-]/g, '');
    const num = parseFloat(clean);
    const safeVal = isNaN(num) ? 0 : Math.min(50, Math.max(-20, Number(num.toFixed(2))));

    onChangeInputs({
      ...inputs,
      mode: 'manual',
      manualReturns: {
        bucket1: bucket === 1 ? safeVal : currentB1Roi,
        bucket2: bucket === 2 ? safeVal : currentB2Roi,
        bucket3: bucket === 3 ? safeVal : currentB3Roi,
      },
    });
  };

  const handleAdjustBucketRoi = (bucket: 1 | 2 | 3, delta: number) => {
    const curVal = bucket === 1 ? currentB1Roi : bucket === 2 ? currentB2Roi : currentB3Roi;
    const newVal = Number((curVal + delta).toFixed(2));
    const safeVal = Math.min(50, Math.max(-20, newVal));

    onChangeInputs({
      ...inputs,
      mode: 'manual',
      manualReturns: {
        bucket1: bucket === 1 ? safeVal : currentB1Roi,
        bucket2: bucket === 2 ? safeVal : currentB2Roi,
        bucket3: bucket === 3 ? safeVal : currentB3Roi,
      },
    });
  };

  const handleResetBucketRoiToBenchmark = () => {
    onChangeInputs({
      ...inputs,
      mode: 'historical',
      manualReturns: {
        bucket1: benchmarkB1,
        bucket2: benchmarkB2,
        bucket3: benchmarkB3,
      },
    });
  };

  const handleSetCustomRoiMode = () => {
    onChangeInputs({
      ...inputs,
      mode: 'manual',
      manualReturns: {
        bucket1: currentB1Roi,
        bucket2: currentB2Roi,
        bucket3: currentB3Roi,
      },
    });
  };

  const activeModel = inputs.selectedModel || 'monte_carlo';
  const activeCrisis = inputs.historicalCrisis || '2008_gfc';
  const activeRollingWindow = inputs.rollingWindowYears || 5;
  const activeStressScenario = inputs.stressTestScenario || 'equity_crash_30_inflation_8';

  const WEALTH_MODELS_LIST: {
    id: WealthModelType;
    title: string;
    badge: string;
    icon: string;
    color: string;
    shortDesc: string;
  }[] = [
    {
      id: 'monte_carlo',
      title: 'Monte Carlo',
      badge: 'Risk Cone',
      icon: '🎲',
      color: '#38BDF8',
      shortDesc: 'Stochastic Probabilistic Fan',
    },
    {
      id: 'historical_backtest',
      title: 'Historical Backtest',
      badge: 'Crisis Replay',
      icon: '📜',
      color: '#F59E0B',
      shortDesc: 'Real Historical Market Data',
    },
    {
      id: 'rolling_returns',
      title: 'Rolling Returns',
      badge: 'Holding Horizon',
      icon: '🔄',
      color: '#10B981',
      shortDesc: 'Sequence Bias Elimination',
    },
    {
      id: 'stress_testing',
      title: 'Stress Testing',
      badge: 'Macro Shocks',
      icon: '⚡',
      color: '#EC4899',
      shortDesc: 'Deterministic Structural Shocks',
    },
    {
      id: 'goals_based',
      title: 'Goals-Based (GBWM)',
      badge: 'Milestones',
      icon: '🎯',
      color: '#8B5CF6',
      shortDesc: 'Asset-Liability Bucketing',
    },
    {
      id: 'comparison',
      title: 'Compare All Models',
      badge: 'Multi-Model',
      icon: '⚖️',
      color: '#6366F1',
      shortDesc: 'Side-by-Side Unified Overlay',
    },
  ];

  const modelScrollRef = React.useRef<any>(null);
  const currentModelIndex = WEALTH_MODELS_LIST.findIndex((m) => m.id === activeModel);
  const activeModelMeta = WEALTH_MODELS_LIST[currentModelIndex] || WEALTH_MODELS_LIST[0];

  const handleModelChange = (m: WealthModelType, idx?: number) => {
    onChangeInputs({ ...inputs, selectedModel: m });
    const targetIdx = idx !== undefined ? idx : WEALTH_MODELS_LIST.findIndex((item) => item.id === m);
    if (targetIdx >= 0) {
      modelScrollRef.current?.scrollTo({ x: Math.max(0, targetIdx * 140 - 24), animated: true });
    }
  };

  const handleScrollPrev = () => {
    const prevIdx = currentModelIndex > 0 ? currentModelIndex - 1 : WEALTH_MODELS_LIST.length - 1;
    handleModelChange(WEALTH_MODELS_LIST[prevIdx].id, prevIdx);
  };

  const handleScrollNext = () => {
    const nextIdx = currentModelIndex < WEALTH_MODELS_LIST.length - 1 ? currentModelIndex + 1 : 0;
    handleModelChange(WEALTH_MODELS_LIST[nextIdx].id, nextIdx);
  };

  const handleCrisisChange = (c: HistoricalCrisisType) => {
    onChangeInputs({ ...inputs, historicalCrisis: c });
  };

  const handleRollingWindowChange = (w: 3 | 5 | 10) => {
    onChangeInputs({ ...inputs, rollingWindowYears: w });
  };

  const handleStressScenarioChange = (s: StressScenarioType) => {
    onChangeInputs({ ...inputs, stressTestScenario: s });
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
      {/* 0. Wealth Management & Analytical Model Choice Option */}
      <View style={[styles.modelSelectionCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
        <View style={styles.modelHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Scale size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.barTitle, { color: colors.textPrimary }]}>
              Analytical Model & Growth Engine:
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onOpenEducationModal?.('methodologies')}
            style={styles.infoIconBtn}
            activeOpacity={0.7}
          >
            <HelpCircle size={15} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Tactical Scroll Navigation Controls for Switching Models */}
        <View style={styles.modelScrollControlRow}>
          <TouchableOpacity
            onPress={handleScrollPrev}
            style={[
              styles.modelScrollArrowBtn,
              { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle },
            ]}
            activeOpacity={0.7}
          >
            <ChevronLeft size={16} color={colors.textPrimary} />
            <Text style={[styles.modelScrollArrowText, { color: colors.textSecondary }]}>Prev</Text>
          </TouchableOpacity>

          <View style={[styles.modelIndicatorPill, { backgroundColor: activeModelMeta.color + '15', borderColor: activeModelMeta.color + '40' }]}>
            <Text style={[styles.modelIndicatorText, { color: activeModelMeta.color }]}>
              {activeModelMeta.icon} Model {currentModelIndex + 1} of {WEALTH_MODELS_LIST.length}:{' '}
              <Text style={{ fontWeight: '800' }}>{activeModelMeta.title}</Text>
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleScrollNext}
            style={[
              styles.modelScrollArrowBtn,
              { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle },
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.modelScrollArrowText, { color: colors.textSecondary }]}>Next</Text>
            <ChevronRight size={16} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Model Chips Horizontal Scroll Track */}
        <ScrollView
          ref={modelScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          {WEALTH_MODELS_LIST.map((m, idx) => {
            const isCur = activeModel === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => handleModelChange(m.id, idx)}
                style={[
                  styles.modelChip,
                  {
                    backgroundColor: isCur ? m.color + '20' : colors.surfaceCard,
                    borderColor: isCur ? m.color : colors.borderSubtle,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modelChipText,
                    { color: isCur ? m.color : colors.textPrimary },
                  ]}
                >
                  {m.icon} {m.title}
                </Text>
                <Text style={[styles.modelChipSub, { color: isCur ? m.color : colors.textMuted }]}>
                  {m.badge}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Contextual Scenario Controls Based on Selected Model */}
        {activeModel === 'historical_backtest' && (
          <View style={[styles.scenarioSubBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.scenarioSubLabel, { color: colors.textSecondary }]}>
              Select Crisis Market Cycle:
            </Text>
            <View style={styles.scenarioChipsRow}>
              {(['2008_gfc', '2000_dotcom', '1973_stagflation', '2020_covid'] as HistoricalCrisisType[]).map((cKey) => {
                const item = HISTORICAL_CRISIS_DATA[cKey];
                const isCur = activeCrisis === cKey;
                return (
                  <TouchableOpacity
                    key={cKey}
                    onPress={() => handleCrisisChange(cKey)}
                    style={[
                      styles.scenarioChip,
                      {
                        backgroundColor: isCur ? '#F59E0B25' : colors.surfaceElevated,
                        borderColor: isCur ? '#F59E0B' : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text style={[styles.scenarioChipText, { color: isCur ? '#F59E0B' : colors.textPrimary }]}>
                      {cKey === '2008_gfc'
                        ? '2008 GFC'
                        : cKey === '2000_dotcom'
                        ? '2000 Dot-Com'
                        : cKey === '1973_stagflation'
                        ? '1973 Stagflation'
                        : '2020 Covid / 2022'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.scenarioDescText, { color: colors.textMuted }]}>
              {HISTORICAL_CRISIS_DATA[activeCrisis]?.description}
            </Text>
          </View>
        )}

        {activeModel === 'rolling_returns' && (
          <View style={[styles.scenarioSubBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.scenarioSubLabel, { color: colors.textSecondary }]}>
              Select Rolling Holding Block Window:
            </Text>
            <View style={styles.scenarioChipsRow}>
              {([3, 5, 10] as (3 | 5 | 10)[]).map((win) => {
                const isCur = activeRollingWindow === win;
                return (
                  <TouchableOpacity
                    key={win}
                    onPress={() => handleRollingWindowChange(win)}
                    style={[
                      styles.scenarioChip,
                      {
                        backgroundColor: isCur ? '#10B98125' : colors.surfaceElevated,
                        borderColor: isCur ? '#10B981' : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text style={[styles.scenarioChipText, { color: isCur ? '#10B981' : colors.textPrimary }]}>
                      {win}-Year Holding Blocks {win === 5 ? '⭐' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.scenarioDescText, { color: colors.textMuted }]}>
              {activeRollingWindow === 3
                ? '3-Year Window: Short-term equity holding block. Shows higher volatility spread between sharp pullbacks and bull rallies.'
                : activeRollingWindow === 5
                ? '5-Year Window (Recommended): Balanced horizon. Historically in US & India, 5Y equity holding blocks deliver positive returns >96% of the time.'
                : '10-Year Window: Long-term compounding. Central Limit Theorem compresses variance—virtually 0% historical chance of a negative return.'}
            </Text>
          </View>
        )}

        {activeModel === 'stress_testing' && (
          <View style={[styles.scenarioSubBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.scenarioSubLabel, { color: colors.textSecondary }]}>
              Select Macroeconomic Shock Scenario:
            </Text>
            <View style={styles.scenarioChipsRow}>
              {(['equity_crash_30_inflation_8', 'stagflation_shock', 'dual_asset_selloff_2022', 'prolonged_bear_market'] as StressScenarioType[]).map((sKey) => {
                const item = STRESS_SCENARIOS_DATA[sKey];
                const isCur = activeStressScenario === sKey;
                return (
                  <TouchableOpacity
                    key={sKey}
                    onPress={() => handleStressScenarioChange(sKey)}
                    style={[
                      styles.scenarioChip,
                      {
                        backgroundColor: isCur ? '#EC489925' : colors.surfaceElevated,
                        borderColor: isCur ? '#EC4899' : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text style={[styles.scenarioChipText, { color: isCur ? '#EC4899' : colors.textPrimary }]}>
                      {sKey === 'equity_crash_30_inflation_8'
                        ? '8% Infl + -30% Crash'
                        : sKey === 'stagflation_shock'
                        ? '1970s Stagflation'
                        : sKey === 'dual_asset_selloff_2022'
                        ? '2022 Dual Sell-Off'
                        : 'Lost Decade (10Y Flat)'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.scenarioDescText, { color: colors.textMuted }]}>
              {STRESS_SCENARIOS_DATA[activeStressScenario]?.description}
            </Text>
          </View>
        )}

        {activeModel === 'goals_based' && (
          <View style={[styles.scenarioSubBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.scenarioSubLabel, { color: colors.textSecondary }]}>
              Goals-Based Wealth Management (GBWM) Milestone Allocation:
            </Text>
            <View style={{ gap: 6, marginVertical: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.miniBucketTag, { backgroundColor: '#38BDF825', borderColor: '#38BDF8' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#38BDF8' }}>Bucket 1 (1–3Y)</Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                  Immediate living liquidity & short-term safety cushion
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.miniBucketTag, { backgroundColor: '#10B98125', borderColor: '#10B981' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#10B981' }}>Bucket 2 (5–10Y)</Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                  Tuition, lifestyle upgrade, and intermediate milestones
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.miniBucketTag, { backgroundColor: '#F59E0B25', borderColor: '#F59E0B' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#F59E0B' }}>Bucket 3 (15+Y)</Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                  Aggressive compounding for retirement longevity & legacy transfer
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeModel === 'comparison' && (
          <View style={[styles.scenarioSubBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Scale size={14} color="#6366F1" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#6366F1' }}>
                Multi-Model Cross Comparison Active
              </Text>
            </View>
            <Text style={[styles.scenarioDescText, { color: colors.textMuted, marginTop: 4 }]}>
              Simultaneously calculating Monte Carlo, Historical Backtest (2008), Rolling Returns, Stress Testing, and Goals-Based models. Inspect the comparison chart and table below.
            </Text>
          </View>
        )}
      </View>

      {/* 1. Country & Base Market Selector Bar */}
      <View style={styles.countryBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Globe2 size={16} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.barTitle, { color: colors.textPrimary }]}>
            Base Market & Currency:
          </Text>
        </View>

        <View style={styles.countryChipsRow}>
          {(['IN', 'US', 'UK', 'EU'] as SupportedCountry[]).map((cCode) => {
            const cMeta = COUNTRY_METAS[cCode];
            const isSelected = country === cCode;
            return (
              <TouchableOpacity
                key={cCode}
                onPress={() => handleBaseCountryChange(cCode)}
                style={[
                  styles.countryChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surfaceElevated,
                    borderColor: isSelected ? colors.accent : colors.borderSubtle,
                  },
                ]}
              >
                <Text style={styles.flagText}>{cMeta.flag}</Text>
                <Text
                  style={[
                    styles.countryChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {cMeta.currencyCode} ({cMeta.currencySymbol})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Initial Corpus & Monthly Withdrawal */}
      <View style={styles.fieldBlock}>
        <View style={styles.labelRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Initial Retirement Corpus ({meta.currencyCode})
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              onPress={() => setIsCorpusModalOpen(true)}
              style={[
                styles.fieldDropdownBtn,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.fieldDropdownBtnText, { color: colors.accent }]}>
                {inputs.initialCorpus >= 10000000
                  ? `${(inputs.initialCorpus / 10000000).toFixed(1)} Cr ▾`
                  : `${(inputs.initialCorpus / 100000).toFixed(0)} L ▾`}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              {formatCurrency(inputs.initialCorpus, country)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.inputRow,
            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
          ]}
        >
          <Text style={[styles.currencyPrefix, { color: colors.accent }]}>
            {meta.currencySymbol}
          </Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={inputs.initialCorpus > 0 ? inputs.initialCorpus.toLocaleString() : ''}
            onChangeText={handleCorpusChange}
            keyboardType="number-pad"
            placeholder="e.g. 20000000"
            placeholderTextColor={colors.textMuted}
            underlineColorAndroid="transparent"
          />
          <TouchableOpacity
            style={[styles.inlineDropdownTrigger, { backgroundColor: colors.surfaceElevated }]}
            onPress={() => setIsCorpusModalOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.inlineDropdownText, { color: colors.accent }]}>
              50L - 10Cr ▾
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expected Monthly Withdrawal + Suggest Safe Button + Dynamic Range Dropdown */}
      <View style={styles.fieldBlock}>
        <View style={styles.labelRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Expected Monthly Withdrawal ({meta.currencyCode})
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              onPress={() => setIsWithdrawalModalOpen(true)}
              style={[
                styles.fieldDropdownBtn,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.fieldDropdownBtnText, { color: colors.accent }]}>
                Safe Range (±25k) ▾
              </Text>
            </TouchableOpacity>
            <Text style={[styles.badgeText, { color: colors.textMuted }]}>
              Annual: {formatCurrency(inputs.monthlyWithdrawal * 12, country)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.inputRow,
            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
          ]}
        >
          <Text style={[styles.currencyPrefix, { color: colors.accent }]}>
            {meta.currencySymbol}
          </Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={inputs.monthlyWithdrawal > 0 ? inputs.monthlyWithdrawal.toLocaleString() : ''}
            onChangeText={handleWithdrawalChange}
            keyboardType="number-pad"
            placeholder="e.g. 60000"
            placeholderTextColor={colors.textMuted}
            underlineColorAndroid="transparent"
          />

          <TouchableOpacity
            style={[styles.inlineDropdownTrigger, { backgroundColor: colors.surfaceElevated, marginRight: isCompact ? 0 : 6 }]}
            onPress={() => setIsWithdrawalModalOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.inlineDropdownText, { color: colors.accent }]}>
              ±25k ▾
            </Text>
          </TouchableOpacity>

          {!isCompact && (
            <TouchableOpacity
              style={[styles.suggestBtn, { backgroundColor: colors.accent }]}
              onPress={onSuggestSafeWithdrawal}
              activeOpacity={0.8}
            >
              <Sparkles size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.suggestBtnText}>Suggest Safe</Text>
            </TouchableOpacity>
          )}
        </View>

        {isCompact && (
          <TouchableOpacity
            style={[styles.suggestBtnFull, { backgroundColor: colors.accent }]}
            onPress={onSuggestSafeWithdrawal}
            activeOpacity={0.8}
          >
            <Sparkles size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.suggestBtnText}>
              Suggest Safe SWR: {formatCurrency(dynamicSafeBenchmark, country)} / mo
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. Start Date & Inflation */}
      <View style={[styles.twoColRow, isCompact && { flexDirection: 'column', gap: 10 }]}>
        <View style={[{ flex: 1 }, !isCompact && { marginRight: 8 }]}>
          <DatePickerInput
            label="Retirement Start Date"
            value={inputs.startDate}
            onChange={(val) => onChangeInputs({ ...inputs, startDate: val })}
          />
        </View>

        <View style={[{ flex: 1 }, !isCompact && { marginLeft: 8 }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Expected Inflation
          </Text>
          <TouchableOpacity
            onPress={() => setIsInflationModalOpen(true)}
            style={[
              styles.inputRow,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                height: 48,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 14,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>
              {inputs.inflationRate}%
            </Text>
            <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 14 }}>
              ▾
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Ultra-Long Time Horizons (Modal Trigger Buttons — Zero Overlap) */}
      {/* 4. Unified Retirement Planning Horizon (Up to 80 Years) */}
      <View style={[styles.horizonSection, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.horizonHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CalendarDays size={16} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>
                Retirement Planning Horizon
              </Text>
            </View>
            <Text style={[styles.foreignDesc, { color: colors.textMuted }]}>
              Simulates portfolio survival and charts all {inputs.simulationHorizon || 50} years in lockstep.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsHorizonModalOpen(true)}
            style={[
              styles.dropdownTrigger,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle, minWidth: 110 },
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownTriggerText, { color: colors.textPrimary }]}>
              {inputs.simulationHorizon || 50} Years
            </Text>
            <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13, marginLeft: 6 }}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Horizon Selectors: 20Y, 30Y, 40Y, 50Y, 60Y, 80Y */}
        <View style={styles.horizonChipsRow}>
          {[20, 30, 40, 50, 60, 80].map((h) => {
            const isSelected = (inputs.simulationHorizon || 50) === h;
            return (
              <TouchableOpacity
                key={h}
                onPress={() => handleSelectUnifiedHorizon(h)}
                style={[
                  styles.horizonChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surfaceElevated,
                    borderColor: isSelected ? colors.accent : colors.borderSubtle,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.horizonChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {h}Y
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 5. Bucket Tenures & Time Horizons */}
      <View style={[styles.roiSection, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.roiHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 220 }}>
              <Layers size={18} color={colors.accent} style={{ marginRight: 8 }} />
              <View>
                <Text style={[styles.roiTitle, { color: colors.textPrimary }]}>
                  Bucket Tenures & Time Horizons
                </Text>
                <Text style={[styles.roiSubtitle, { color: colors.textMuted }]}>
                  Customize cash runway and debt duration. Bucket 3 growth horizon is auto-determined.
                </Text>
              </View>
            </View>
            <View style={[styles.totalBufferPill, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '40' }]}>
              <Text style={[styles.totalBufferPillText, { color: colors.accent }]}>
                {totalBufferY}Y Total Protection Buffer
              </Text>
            </View>
          </View>
        </View>

        {/* Visual Timeline Flow Ribbon */}
        <View style={[styles.tenureFlowBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
          <View style={[styles.tenureFlowItem, { borderColor: PALETTE.bucket1.base + '50' }]}>
            <View style={[styles.tenureDot, { backgroundColor: PALETTE.bucket1.base }]} />
            <Text style={[styles.tenureFlowTitle, { color: PALETTE.bucket1.base }]}>
              Bucket 1: Y1–{b1Y}
            </Text>
            <Text style={[styles.tenureFlowSub, { color: colors.textMuted }]}>
              {b1Y}Y Cash Runway
            </Text>
          </View>

          <Text style={[styles.flowArrow, { color: colors.textMuted }]}>➔</Text>

          <View style={[styles.tenureFlowItem, { borderColor: PALETTE.bucket2.base + '50' }]}>
            <View style={[styles.tenureDot, { backgroundColor: PALETTE.bucket2.base }]} />
            <Text style={[styles.tenureFlowTitle, { color: PALETTE.bucket2.base }]}>
              Bucket 2: Y{b1Y + 1}–{totalBufferY}
            </Text>
            <Text style={[styles.tenureFlowSub, { color: colors.textMuted }]}>
              {b2Y}Y Debt Buffer
            </Text>
          </View>

          <Text style={[styles.flowArrow, { color: colors.textMuted }]}>➔</Text>

          <View style={[styles.tenureFlowItem, { borderColor: PALETTE.bucket3.base + '50' }]}>
            <View style={[styles.tenureDot, { backgroundColor: PALETTE.bucket3.base }]} />
            <Text style={[styles.tenureFlowTitle, { color: PALETTE.bucket3.base }]}>
              Bucket 3: Y{b3StartYear}+
            </Text>
            <Text style={[styles.tenureFlowSub, { color: colors.textMuted }]}>
              {b3RunwayY}Y Compounding
            </Text>
          </View>
        </View>

        {/* Interactive Tenure Control Cards */}
        <View style={styles.roiCardsGrid}>
          {/* Bucket 1 Tenure Card */}
          <View style={[styles.roiBucketCard, { backgroundColor: colors.surfaceElevated, borderColor: PALETTE.bucket1.base + '50' }]}>
            <View style={styles.roiCardTop}>
              <View style={[styles.roiBucketBadge, { backgroundColor: PALETTE.bucket1.base + '25' }]}>
                <Text style={[styles.roiBucketBadgeText, { color: PALETTE.bucket1.base }]}>
                  Bucket 1: Years 1 to {b1Y} ({b1Y} Years Cash)
                </Text>
              </View>
              <Text style={[styles.benchmarkRefText, { color: colors.textMuted }]}>
                Default: 3 Years
              </Text>
            </View>

            <Text style={[styles.roiBucketDesc, { color: colors.textSecondary }]}>
              Zero-volatility cash floor. Fully covers annual living expenses for the first {b1Y} years of retirement.
            </Text>

            {/* Stepper + Input */}
            <View style={styles.roiControlRow}>
              <TouchableOpacity
                onPress={() => handleAdjustBucket1Years(-1)}
                style={[styles.roiStepBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}
              >
                <Text style={[styles.roiStepBtnText, { color: colors.textPrimary }]}>−</Text>
              </TouchableOpacity>

              <View style={[styles.roiInputWrap, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                <TextInput
                  value={b1Y.toString()}
                  onChangeText={(val) => handleUpdateBucket1Years(parseInt(val, 10) || 1)}
                  keyboardType="number-pad"
                  style={[styles.roiInput, { color: colors.textPrimary }]}
                  placeholder="3"
                  placeholderTextColor={colors.textMuted}
                  underlineColorAndroid="transparent"
                />
                <Text style={[styles.roiUnit, { color: colors.textMuted }]}>Years Runway</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleAdjustBucket1Years(1)}
                style={[styles.roiStepBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}
              >
                <Text style={[styles.roiStepBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <View style={styles.roiPresetsRow}>
              {[1, 2, 3, 4, 5].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleUpdateBucket1Years(preset)}
                  style={[
                    styles.roiPresetChip,
                    {
                      backgroundColor: b1Y === preset ? PALETTE.bucket1.base : colors.surfaceCard,
                      borderColor: b1Y === preset ? PALETTE.bucket1.base : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roiPresetChipText,
                      { color: b1Y === preset ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    1 to {preset}Y {preset === 3 ? '⭐' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Live Required Reserve Amount */}
            <View style={[styles.realReturnBadge, { backgroundColor: colors.surfaceCard }]}>
              <Text style={[styles.realReturnLabel, { color: colors.textMuted }]}>Target Cash Allocation:</Text>
              <Text style={[styles.realReturnVal, { color: PALETTE.bucket1.base }]}>
                {formatCurrency(targetB1Amount, country)} ({b1Y} Years Expenses)
              </Text>
            </View>
          </View>

          {/* Bucket 2 Tenure Card */}
          <View style={[styles.roiBucketCard, { backgroundColor: colors.surfaceElevated, borderColor: PALETTE.bucket2.base + '50' }]}>
            <View style={styles.roiCardTop}>
              <View style={[styles.roiBucketBadge, { backgroundColor: PALETTE.bucket2.base + '25' }]}>
                <Text style={[styles.roiBucketBadgeText, { color: PALETTE.bucket2.base }]}>
                  Bucket 2: Years {b1Y + 1} to {totalBufferY} ({b2Y} Years Debt)
                </Text>
              </View>
              <Text style={[styles.benchmarkRefText, { color: colors.textMuted }]}>
                Default: 7 Years
              </Text>
            </View>

            <Text style={[styles.roiBucketDesc, { color: colors.textSecondary }]}>
              Income shock absorber. Provides {b2Y} years of bond buffer starting after Year {b1Y}.
            </Text>

            {/* Stepper + Input */}
            <View style={styles.roiControlRow}>
              <TouchableOpacity
                onPress={() => handleAdjustBucket2Years(-1)}
                style={[styles.roiStepBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}
              >
                <Text style={[styles.roiStepBtnText, { color: colors.textPrimary }]}>−</Text>
              </TouchableOpacity>

              <View style={[styles.roiInputWrap, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                <TextInput
                  value={b2Y.toString()}
                  onChangeText={(val) => handleUpdateBucket2Years(parseInt(val, 10) || 1)}
                  keyboardType="number-pad"
                  style={[styles.roiInput, { color: colors.textPrimary }]}
                  placeholder="7"
                  placeholderTextColor={colors.textMuted}
                  underlineColorAndroid="transparent"
                />
                <Text style={[styles.roiUnit, { color: colors.textMuted }]}>Years Buffer</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleAdjustBucket2Years(1)}
                style={[styles.roiStepBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}
              >
                <Text style={[styles.roiStepBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <View style={styles.roiPresetsRow}>
              {[4, 5, 6, 7, 8, 10].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleUpdateBucket2Years(preset)}
                  style={[
                    styles.roiPresetChip,
                    {
                      backgroundColor: b2Y === preset ? PALETTE.bucket2.base : colors.surfaceCard,
                      borderColor: b2Y === preset ? PALETTE.bucket2.base : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roiPresetChipText,
                      { color: b2Y === preset ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {preset}Y Buffer {preset === 7 ? '⭐' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Live Required Reserve Amount */}
            <View style={[styles.realReturnBadge, { backgroundColor: colors.surfaceCard }]}>
              <Text style={[styles.realReturnLabel, { color: colors.textMuted }]}>Target Debt Allocation:</Text>
              <Text style={[styles.realReturnVal, { color: PALETTE.bucket2.base }]}>
                {formatCurrency(targetB2Amount, country)} ({b2Y} Years Expenses)
              </Text>
            </View>
          </View>

          {/* Bucket 3 Auto-Determined Card */}
          <View style={[styles.roiBucketCard, { backgroundColor: colors.surfaceElevated, borderColor: PALETTE.bucket3.base + '50' }]}>
            <View style={styles.roiCardTop}>
              <View style={[styles.roiBucketBadge, { backgroundColor: PALETTE.bucket3.base + '25' }]}>
                <Text style={[styles.roiBucketBadgeText, { color: PALETTE.bucket3.base }]}>
                  Bucket 3: Years {b3StartYear} to {horizonY} ({b3RunwayY} Years Growth)
                </Text>
              </View>
              <View style={[styles.autoBadge, { backgroundColor: '#8B5CF620', borderColor: '#8B5CF660' }]}>
                <Text style={[styles.autoBadgeText, { color: '#A78BFA' }]}>⚡ Auto-Determined</Text>
              </View>
            </View>

            <Text style={[styles.roiBucketDesc, { color: colors.textSecondary }]}>
              Growth equities compound untouched because Buckets 1 & 2 fully insulate living expenses for the first {totalBufferY} years.
            </Text>

            <View style={[styles.autoCalculatedInfoBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
              <View style={styles.autoCalcRow}>
                <Text style={[styles.autoCalcKey, { color: colors.textMuted }]}>Equity Start Year:</Text>
                <Text style={[styles.autoCalcVal, { color: colors.textPrimary }]}>Year {b3StartYear} (after {totalBufferY}Y buffer)</Text>
              </View>
              <View style={styles.autoCalcRow}>
                <Text style={[styles.autoCalcKey, { color: colors.textMuted }]}>Untouched Compounding Runway:</Text>
                <Text style={[styles.autoCalcVal, { color: '#10B981', fontWeight: '800' }]}>{b3RunwayY} Years</Text>
              </View>
              <View style={styles.autoCalcRow}>
                <Text style={[styles.autoCalcKey, { color: colors.textMuted }]}>Initial Equity Allocation:</Text>
                <Text style={[styles.autoCalcVal, { color: PALETTE.bucket3.base, fontWeight: '800' }]}>
                  {formatCurrency(split.bucket3, country)} ({((split.bucket3 / Math.max(1, inputs.initialCorpus)) * 100).toFixed(0)}% of corpus)
                </Text>
              </View>
            </View>

            {/* Impact Note */}
            <View style={[styles.realReturnBadge, { backgroundColor: colors.surfaceCard }]}>
              <Text style={[styles.realReturnLabel, { color: colors.textMuted }]}>Liquidation Immunity:</Text>
              <Text style={[styles.realReturnVal, { color: '#10B981' }]}>
                Zero forced equity selling for {totalBufferY} Years ✓
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 6. Multi-Country & Multi-Asset Cross-Border Allocation (Bucket 3) */}
      <View style={[styles.foreignSection, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.foreignHeader}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Globe2 size={16} color={PALETTE.bucket3.base} style={{ marginRight: 6 }} />
              <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>
                Multi-Country Equity Blend (Bucket 3)
              </Text>
            </View>
            <Text style={[styles.foreignDesc, { color: colors.textMuted }]}>
              Blended Return: ~{blendedB3.blendedReturn}% μ • Volatility: ±{blendedB3.blendedStdDev}% σ
            </Text>
          </View>

          <View style={styles.addCountryRow}>
            {(['IN', 'US', 'UK', 'EU'] as SupportedCountry[])
              .filter((c) => !inputs.multiCountryAllocations.some((a) => a.country === c))
              .map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => handleAddCountryToEquity(c)}
                  style={[styles.addChip, { backgroundColor: colors.surfaceElevated }]}
                >
                  <Plus size={12} color={colors.accent} />
                  <Text style={[styles.addChipText, { color: colors.textPrimary }]}>
                    {COUNTRY_METAS[c].flag} {c}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* Growth Bucket (Equity % of Corpus) Control */}
        <View
          style={[
            styles.targetEquityCard,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
          ]}
        >
          <View style={styles.targetEquityTopRow}>
            <View>
              <Text style={[styles.targetEquityTitle, { color: colors.textPrimary }]}>
                Target Growth Bucket (Equity % of Corpus)
              </Text>
              <Text style={[styles.targetEquitySubtitle, { color: colors.textMuted }]}>
                Allocated to Bucket 3: {formatCurrency(split.bucket3, country)} ({currentGrowthPct}% of Total Corpus)
              </Text>
            </View>

            <View
              style={[
                styles.growthPctBadge,
                { backgroundColor: PALETTE.bucket3.base + '20', borderColor: PALETTE.bucket3.base },
              ]}
            >
              <Text style={[styles.growthPctBadgeText, { color: PALETTE.bucket3.base }]}>
                {currentGrowthPct}% Equity
              </Text>
            </View>
          </View>

          {/* Quick Selectable Equity % Chips */}
          <View style={styles.equityPresetChipsRow}>
            {[30, 40, 50, 60, 70, 80].map((pct) => {
              const isSelected = currentGrowthPct === pct;
              return (
                <TouchableOpacity
                  key={pct}
                  onPress={() => handleSetGrowthPercent(pct)}
                  style={[
                    styles.equityPresetChip,
                    {
                      backgroundColor: isSelected ? PALETTE.bucket3.base : colors.surfaceCard,
                      borderColor: isSelected ? PALETTE.bucket3.base : colors.borderSubtle,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.equityPresetChipText,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {pct}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Country Blend Presets */}
        <View style={styles.presetSplitsRow}>
          <Text style={[styles.fieldLabelSub, { color: colors.textMuted, marginRight: 6 }]}>
            Blend Presets:
          </Text>
          <TouchableOpacity
            onPress={() => handleApplySplitPreset('100')}
            style={[styles.presetSplitBtn, { backgroundColor: colors.surfaceElevated }]}
          >
            <Text style={[styles.presetSplitBtnText, { color: colors.textSecondary }]}>
              100% {country}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleApplySplitPreset('70_30')}
            style={[styles.presetSplitBtn, { backgroundColor: colors.surfaceElevated }]}
          >
            <Text style={[styles.presetSplitBtnText, { color: colors.textSecondary }]}>
              70 / 30
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleApplySplitPreset('60_40')}
            style={[styles.presetSplitBtn, { backgroundColor: colors.surfaceElevated }]}
          >
            <Text style={[styles.presetSplitBtnText, { color: colors.textSecondary }]}>
              60 / 40
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleApplySplitPreset('50_50')}
            style={[styles.presetSplitBtn, { backgroundColor: colors.surfaceElevated }]}
          >
            <Text style={[styles.presetSplitBtnText, { color: colors.textSecondary }]}>
              50 / 50
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleApplySplitPreset('equal')}
            style={[styles.presetSplitBtn, { backgroundColor: colors.surfaceElevated }]}
          >
            <Text style={[styles.presetSplitBtnText, { color: colors.textSecondary }]}>
              Equal
            </Text>
          </TouchableOpacity>

          {/* Validation Status Badge */}
          {isAllocationBalanced ? (
            <View style={[styles.sumBadge, { backgroundColor: '#10B98118', borderColor: '#10B98150' }]}>
              <Text style={[styles.sumBadgeText, { color: '#10B981' }]}>Total: 100% ✓</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleBalanceLastEntry}
              style={[styles.sumBadge, { backgroundColor: '#F59E0B18', borderColor: '#F59E0B60' }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.sumBadgeText, { color: '#F59E0B' }]}>
                Total: {totalAllocWeight}% (Tap to balance last entry to {neededForLast}%)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* List of active country equity allocations */}
        <View style={styles.allocList}>
          {inputs.multiCountryAllocations.map((alloc, idx) => {
            const cMeta = COUNTRY_METAS[alloc.country];
            const defaultProfile = COUNTRY_PROFILES[alloc.country].bucket3;
            const allocAmt = Math.round(split.bucket3 * (alloc.weight / totalAllocWeight));
            const allocPortionPct = ((alloc.weight / totalAllocWeight) * currentGrowthPct).toFixed(1);

            return (
              <View
                key={alloc.country}
                style={[
                  styles.allocCard,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
                ]}
              >
                <View style={styles.allocCardTop}>
                  <View style={styles.allocCountryInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 16, marginRight: 6 }}>{cMeta.flag}</Text>
                      <Text style={[styles.allocCountryName, { color: colors.textPrimary }]}>
                        {cMeta.name} Equity
                      </Text>
                    </View>
                    <Text style={[styles.allocSubAmount, { color: colors.textMuted }]}>
                      {formatCurrency(allocAmt, country)} • {alloc.weight}% of Equity ({allocPortionPct}% of Portfolio)
                    </Text>
                  </View>

                  <View style={styles.allocControlsRow}>
                    {/* Weight Input Box with integrated % unit label */}
                    <View
                      style={[
                        styles.weightBox,
                        { borderColor: colors.borderSubtle, backgroundColor: colors.inputBg },
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.weightInput,
                          { color: colors.textPrimary },
                        ]}
                        value={alloc.weight.toString()}
                        onChangeText={(txt) => handleUpdateWeight(idx, txt)}
                        keyboardType="number-pad"
                        selectTextOnFocus
                      />
                      <Text style={[styles.weightUnitText, { color: colors.accent }]}>
                        %
                      </Text>
                    </View>

                    {/* Manual Mode Toggle */}
                    <TouchableOpacity
                      onPress={() => handleToggleManualCountry(idx, !alloc.isManual)}
                      style={[
                        styles.manualIconBtn,
                        { borderColor: colors.borderSubtle, backgroundColor: colors.surface },
                        alloc.isManual && { backgroundColor: PALETTE.bucket3.base, borderColor: PALETTE.bucket3.base },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Settings2
                        size={15}
                        color={alloc.isManual ? '#FFFFFF' : colors.textSecondary}
                      />
                    </TouchableOpacity>

                    {inputs.multiCountryAllocations.length > 1 && (
                      <TouchableOpacity
                        onPress={() => handleRemoveCountry(idx)}
                        style={styles.trashBtn}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={15} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Quick country weight chips */}
                <View style={styles.quickWeightRow}>
                  {[25, 30, 40, 50, 60, 70, 100].map((w) => (
                    <TouchableOpacity
                      key={w}
                      onPress={() => handleUpdateWeight(idx, w.toString())}
                      style={[
                        styles.quickWeightChip,
                        alloc.weight === w && {
                          backgroundColor: PALETTE.bucket3.base + '25',
                          borderColor: PALETTE.bucket3.base,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickWeightChipText,
                          {
                            color:
                              alloc.weight === w ? PALETTE.bucket3.base : colors.textMuted,
                          },
                        ]}
                      >
                        {w}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Sub row showing empirical or manual numbers */}
                {alloc.isManual ? (
                  <View style={styles.manualInputsGrid}>
                    <View style={styles.manualInputItem}>
                      <Text style={[styles.mInputLabel, { color: colors.textMuted }]}>
                        Exp. Return (μ):
                      </Text>
                      <TextInput
                        style={[styles.mInput, { color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                        value={(alloc.customReturn ?? defaultProfile.nominalReturnMean).toString()}
                        onChangeText={(t) => handleUpdateCustomMetrics(idx, 'return', t)}
                        keyboardType="decimal-pad"
                      />
                      <Text style={{ color: colors.textMuted, fontSize: 11 }}>%</Text>
                    </View>

                    <View style={styles.manualInputItem}>
                      <Text style={[styles.mInputLabel, { color: colors.textMuted }]}>
                        Volatility (σ):
                      </Text>
                      <TextInput
                        style={[styles.mInput, { color: colors.textPrimary, borderColor: colors.borderSubtle }]}
                        value={(alloc.customStdDev ?? defaultProfile.stdDev).toString()}
                        onChangeText={(t) => handleUpdateCustomMetrics(idx, 'stdDev', t)}
                        keyboardType="decimal-pad"
                      />
                      <Text style={{ color: colors.textMuted, fontSize: 11 }}>%</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.allocSummaryRow}>
                    <Text style={[styles.allocStatText, { color: colors.textMuted }]}>
                      Historical Empirical: ~{defaultProfile.nominalReturnMean}% μ • {defaultProfile.stdDev}% σ
                    </Text>
                  </View>
                )}

                {/* Last entry balance helper if sum !== 100 */}
                {idx === lastCountryIdx && inputs.multiCountryAllocations.length > 1 && !isAllocationBalanced && (
                  <View style={styles.lastEntryNoticeRow}>
                    <Text style={[styles.lastEntryNoticeText, { color: '#F59E0B' }]}>
                      Total equity sum is {totalAllocWeight}% (needs {neededForLast > alloc.weight ? `+${neededForLast - alloc.weight}%` : `${neededForLast - alloc.weight}%`} to equal 100%)
                    </Text>
                    <TouchableOpacity
                      onPress={handleBalanceLastEntry}
                      style={[styles.balanceLastBtn, { backgroundColor: colors.accent + '20', borderColor: colors.accent }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.balanceLastBtnText, { color: colors.accent }]}>
                        Auto-balance to {neededForLast}%
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Bucket Expected ROI (% Annual Returns) Configuration */}
      <View style={[styles.roiSection, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.roiHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, flexWrap: 'wrap', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 200 }}>
              <TrendingUp size={18} color={colors.accent} style={{ marginRight: 8 }} />
              <View>
                <Text style={[styles.roiTitle, { color: colors.textPrimary }]}>
                  Bucket Expected ROI (% Annual Returns)
                </Text>
                <Text style={[styles.roiSubtitle, { color: colors.textMuted }]}>
                  Customize annual growth rates per bucket or rely on empirical country benchmarks
                </Text>
              </View>
            </View>

            {/* Mode Switcher */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                onPress={handleResetBucketRoiToBenchmark}
                style={[
                  styles.roiModePill,
                  {
                    backgroundColor: inputs.mode !== 'manual' ? colors.accent : colors.surfaceElevated,
                    borderColor: inputs.mode !== 'manual' ? colors.accent : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roiModePillText,
                    { color: inputs.mode !== 'manual' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  🏛️ Benchmarks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSetCustomRoiMode}
                style={[
                  styles.roiModePill,
                  {
                    backgroundColor: inputs.mode === 'manual' ? colors.accent : colors.surfaceElevated,
                    borderColor: inputs.mode === 'manual' ? colors.accent : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roiModePillText,
                    { color: inputs.mode === 'manual' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  ⚙️ Custom ROI
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {inputs.mode === 'manual' && (
          <View style={[styles.customRoiAlert, { backgroundColor: colors.accent + '12', borderColor: colors.accent + '40' }]}>
            <Text style={[styles.customRoiAlertText, { color: colors.accent }]}>
              Custom Mode Active: Using your expected ROI overrides across all annual waterfall updates and Monte Carlo trajectories.
            </Text>
            <TouchableOpacity
              onPress={handleResetBucketRoiToBenchmark}
              style={[styles.resetRoiBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
            >
              <RotateCcw size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.resetRoiBtnText, { color: colors.textSecondary }]}>Reset to Benchmarks</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.roiCardsGrid}>
          {/* Bucket 1 ROI Card */}
          <View style={[styles.roiBucketCard, { backgroundColor: colors.surfaceElevated, borderColor: PALETTE.bucket1.base + '50' }]}>
            <View style={styles.roiCardTop}>
              <View style={[styles.roiBucketBadge, { backgroundColor: PALETTE.bucket1.base + '25' }]}>
                <Text style={[styles.roiBucketBadgeText, { color: PALETTE.bucket1.base }]}>Bucket 1 (Cash)</Text>
              </View>
              <Text style={[styles.benchmarkRefText, { color: colors.textMuted }]}>
                Benchmark: {benchmarkB1}%
              </Text>
            </View>

            <Text style={[styles.roiBucketDesc, { color: colors.textSecondary }]}>
              Liquid cash, FD, high-yield savings (0–3 Years Runway)
            </Text>

            {/* Stepper + Input */}
            <View style={styles.roiControlRow}>
              <TouchableOpacity
                onPress={() => handleAdjustBucketRoi(1, -0.25)}
                style={[styles.roiStepBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}
              >
                <Text style={[styles.roiStepBtnText, { color: colors.textPrimary }]}>−</Text>
              </TouchableOpacity>

              <View style={[styles.roiInputWrap, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                <TextInput
                  value={currentB1Roi.toString()}
                  onChangeText={(val) => handleUpdateBucketRoi(1, val)}
                  keyboardType="decimal-pad"
                  style={[styles.roiInput, { color: colors.textPrimary }]}
                  placeholder="5.5"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={[styles.roiUnit, { color: colors.textMuted }]}>% p.a.</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleAdjustBucketRoi(1, 0.25)}
                style={[styles.roiStepBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}
              >
                <Text style={[styles.roiStepBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <View style={styles.roiPresetsRow}>
              {[4.5, 5.5, 6.5, 7.5].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleUpdateBucketRoi(1, preset.toString())}
                  style={[
                    styles.roiPresetChip,
                    {
                      backgroundColor: currentB1Roi === preset ? PALETTE.bucket1.base : colors.surfaceCard,
                      borderColor: currentB1Roi === preset ? PALETTE.bucket1.base : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roiPresetChipText,
                      { color: currentB1Roi === preset ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {preset}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Real Return Badge */}
            <View style={[styles.realReturnBadge, { backgroundColor: colors.surfaceCard }]}>
              <Text style={[styles.realReturnLabel, { color: colors.textMuted }]}>Real Return (Net of {inputs.inflationRate}% Infl):</Text>
              <Text
                style={[
                  styles.realReturnVal,
                  { color: currentB1Roi >= inputs.inflationRate ? '#10B981' : '#F59E0B' },
                ]}
              >
                {currentB1Roi >= inputs.inflationRate ? '+' : ''}
                {(currentB1Roi - inputs.inflationRate).toFixed(1)}% p.a.
              </Text>
            </View>
          </View>

          {/* Bucket 2 ROI Card */}
          <View style={[styles.roiBucketCard, { backgroundColor: colors.surfaceElevated, borderColor: PALETTE.bucket2.base + '50' }]}>
            <View style={styles.roiCardTop}>
              <View style={[styles.roiBucketBadge, { backgroundColor: PALETTE.bucket2.base + '25' }]}>
                <Text style={[styles.roiBucketBadgeText, { color: PALETTE.bucket2.base }]}>Bucket 2 (Income / Debt)</Text>
              </View>
              <Text style={[styles.benchmarkRefText, { color: colors.textMuted }]}>
                Benchmark: {benchmarkB2}%
              </Text>
            </View>

            <Text style={[styles.roiBucketDesc, { color: colors.textSecondary }]}>
              Short/medium debt, corporate bonds, target maturity (3–10 Years Buffer)
            </Text>

            {/* Stepper + Input */}
            <View style={styles.roiControlRow}>
              <TouchableOpacity
                onPress={() => handleAdjustBucketRoi(2, -0.25)}
                style={[styles.roiStepBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}
              >
                <Text style={[styles.roiStepBtnText, { color: colors.textPrimary }]}>−</Text>
              </TouchableOpacity>

              <View style={[styles.roiInputWrap, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                <TextInput
                  value={currentB2Roi.toString()}
                  onChangeText={(val) => handleUpdateBucketRoi(2, val)}
                  keyboardType="decimal-pad"
                  style={[styles.roiInput, { color: colors.textPrimary }]}
                  placeholder="8.0"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={[styles.roiUnit, { color: colors.textMuted }]}>% p.a.</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleAdjustBucketRoi(2, 0.25)}
                style={[styles.roiStepBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}
              >
                <Text style={[styles.roiStepBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <View style={styles.roiPresetsRow}>
              {[6.5, 7.5, 8.5, 9.5].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleUpdateBucketRoi(2, preset.toString())}
                  style={[
                    styles.roiPresetChip,
                    {
                      backgroundColor: currentB2Roi === preset ? PALETTE.bucket2.base : colors.surfaceCard,
                      borderColor: currentB2Roi === preset ? PALETTE.bucket2.base : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roiPresetChipText,
                      { color: currentB2Roi === preset ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {preset}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Real Return Badge */}
            <View style={[styles.realReturnBadge, { backgroundColor: colors.surfaceCard }]}>
              <Text style={[styles.realReturnLabel, { color: colors.textMuted }]}>Real Return (Net of {inputs.inflationRate}% Infl):</Text>
              <Text
                style={[
                  styles.realReturnVal,
                  { color: currentB2Roi >= inputs.inflationRate ? '#10B981' : '#F59E0B' },
                ]}
              >
                {currentB2Roi >= inputs.inflationRate ? '+' : ''}
                {(currentB2Roi - inputs.inflationRate).toFixed(1)}% p.a.
              </Text>
            </View>
          </View>

          {/* Bucket 3 ROI Card */}
          <View style={[styles.roiBucketCard, { backgroundColor: colors.surfaceElevated, borderColor: PALETTE.bucket3.base + '50' }]}>
            <View style={styles.roiCardTop}>
              <View style={[styles.roiBucketBadge, { backgroundColor: PALETTE.bucket3.base + '25' }]}>
                <Text style={[styles.roiBucketBadgeText, { color: PALETTE.bucket3.base }]}>Bucket 3 (Growth Equities)</Text>
              </View>
              <Text style={[styles.benchmarkRefText, { color: colors.textMuted }]}>
                Blended: {benchmarkB3}%
              </Text>
            </View>

            <Text style={[styles.roiBucketDesc, { color: colors.textSecondary }]}>
              Multi-country equities, global ETFs, wealth growth engine (10+ Years)
            </Text>

            {/* Stepper + Input */}
            <View style={styles.roiControlRow}>
              <TouchableOpacity
                onPress={() => handleAdjustBucketRoi(3, -0.5)}
                style={[styles.roiStepBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}
              >
                <Text style={[styles.roiStepBtnText, { color: colors.textPrimary }]}>−</Text>
              </TouchableOpacity>

              <View style={[styles.roiInputWrap, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
                <TextInput
                  value={currentB3Roi.toString()}
                  onChangeText={(val) => handleUpdateBucketRoi(3, val)}
                  keyboardType="decimal-pad"
                  style={[styles.roiInput, { color: colors.textPrimary }]}
                  placeholder="12.0"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={[styles.roiUnit, { color: colors.textMuted }]}>% p.a.</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleAdjustBucketRoi(3, 0.5)}
                style={[styles.roiStepBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}
              >
                <Text style={[styles.roiStepBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <View style={styles.roiPresetsRow}>
              {[10.0, 11.5, 12.5, 14.0].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleUpdateBucketRoi(3, preset.toString())}
                  style={[
                    styles.roiPresetChip,
                    {
                      backgroundColor: currentB3Roi === preset ? PALETTE.bucket3.base : colors.surfaceCard,
                      borderColor: currentB3Roi === preset ? PALETTE.bucket3.base : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roiPresetChipText,
                      { color: currentB3Roi === preset ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {preset}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Real Return Badge */}
            <View style={[styles.realReturnBadge, { backgroundColor: colors.surfaceCard }]}>
              <Text style={[styles.realReturnLabel, { color: colors.textMuted }]}>Real Return (Net of {inputs.inflationRate}% Infl):</Text>
              <Text
                style={[
                  styles.realReturnVal,
                  { color: currentB3Roi >= inputs.inflationRate ? '#10B981' : '#F43F5E' },
                ]}
              >
                {currentB3Roi >= inputs.inflationRate ? '+' : ''}
                {(currentB3Roi - inputs.inflationRate).toFixed(1)}% p.a.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Unified Horizon Selection Modal */}
      <Modal
        visible={isHorizonModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsHorizonModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
                shadowColor: colors.cardShadow,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Select Retirement Horizon
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Sets both backend calculations and chart visualizations in unified lockstep (up to 80 years)
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsHorizonModalOpen(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {HORIZON_OPTIONS.map((opt) => {
                const isSelected = (inputs.simulationHorizon || 50) === opt.value;

                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => handleSelectUnifiedHorizon(opt.value)}
                    style={[
                      styles.horizonOptionItem,
                      {
                        backgroundColor: isSelected ? colors.accent + '15' : colors.surfaceElevated,
                        borderColor: isSelected ? colors.accent : colors.borderSubtle,
                      },
                    ]}
                  >
                    <View>
                      <Text
                        style={[
                          styles.horizonOptionTitle,
                          { color: isSelected ? colors.accent : colors.textPrimary },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text style={[styles.horizonOptionDesc, { color: colors.textMuted }]}>
                        {opt.desc}
                      </Text>
                    </View>
                    {isSelected ? <Check size={18} color={colors.accent} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsHorizonModalOpen(false)}
              style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. Initial Retirement Corpus Selection Modal (50 L to 10 Cr in 50 L intervals) */}
      <Modal
        visible={isCorpusModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCorpusModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
                shadowColor: colors.cardShadow,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Select Initial Corpus
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Choose from 50 Lakhs to 10 Crore (50L increments) or enter custom amount
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCorpusModalOpen(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {corpusDropdownOptions.map((opt) => {
                const isSelected = inputs.initialCorpus === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => handleSelectCorpus(opt.value)}
                    style={[
                      styles.horizonOptionItem,
                      {
                        backgroundColor: isSelected ? colors.accent + '15' : colors.surfaceElevated,
                        borderColor: isSelected ? colors.accent : colors.borderSubtle,
                      },
                    ]}
                  >
                    <View>
                      <Text
                        style={[
                          styles.horizonOptionTitle,
                          { color: isSelected ? colors.accent : colors.textPrimary },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text style={[styles.horizonOptionDesc, { color: colors.textMuted }]}>
                        {opt.formatted}
                      </Text>
                    </View>
                    {isSelected ? <Check size={18} color={colors.accent} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsCorpusModalOpen(false)}
              style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. Expected Monthly Withdrawal Dynamic Safe Range Modal (±5k to ±25k) */}
      <Modal
        visible={isWithdrawalModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsWithdrawalModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
                shadowColor: colors.cardShadow,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Expected Monthly Withdrawal
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Dynamic safe benchmark: {formatCurrency(dynamicSafeBenchmark, country)}/mo (±5k to ±25k range)
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsWithdrawalModalOpen(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {withdrawalRangeOptions.map((opt) => {
                const isSelected = inputs.monthlyWithdrawal === opt.value;
                const isBenchmark = opt.delta === 0;

                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => handleSelectWithdrawal(opt.value)}
                    style={[
                      styles.horizonOptionItem,
                      {
                        backgroundColor: isSelected
                          ? colors.accent + '20'
                          : isBenchmark
                          ? '#10B98115'
                          : colors.surfaceElevated,
                        borderColor: isSelected
                          ? colors.accent
                          : isBenchmark
                          ? '#10B98160'
                          : colors.borderSubtle,
                      },
                    ]}
                  >
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text
                          style={[
                            styles.horizonOptionTitle,
                            { color: isSelected ? colors.accent : colors.textPrimary },
                          ]}
                        >
                          {opt.label}/mo
                        </Text>
                        {isBenchmark ? (
                          <View style={{ backgroundColor: '#10B98125', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                            <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '700' }}>RECOMMENDED</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={[styles.horizonOptionDesc, { color: colors.textMuted }]}>
                        {opt.desc}
                      </Text>
                    </View>
                    {isSelected ? <Check size={18} color={colors.accent} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsWithdrawalModalOpen(false)}
              style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4. Expected Inflation Dropdown Modal (0% to 10%) */}
      <Modal
        visible={isInflationModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInflationModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
                shadowColor: colors.cardShadow,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Select Expected Inflation
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Choose from 0% to 10% annual inflation, or enter any decimal manually
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsInflationModalOpen(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Direct Decimal Input Field */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                borderRadius: 10,
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginRight: 10 }}>
                Custom %:
              </Text>
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.textPrimary,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  backgroundColor: colors.inputBg,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.inputBorder,
                }}
                value={inputs.inflationRate.toString()}
                onChangeText={handleInflationChange}
                keyboardType="decimal-pad"
                placeholder={meta.defaultInflation.toString()}
                placeholderTextColor={colors.textMuted}
                underlineColorAndroid="transparent"
              />
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textSecondary, marginLeft: 8 }}>
                %
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {inflationDropdownOptions.map((opt) => {
                const isSelected = inputs.inflationRate === opt.value;

                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => handleSelectInflation(opt.value)}
                    style={[
                      styles.horizonOptionItem,
                      {
                        backgroundColor: isSelected ? colors.accent + '15' : colors.surfaceElevated,
                        borderColor: isSelected ? colors.accent : colors.borderSubtle,
                      },
                    ]}
                  >
                    <View>
                      <Text
                        style={[
                          styles.horizonOptionTitle,
                          { color: isSelected ? colors.accent : colors.textPrimary },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text style={[styles.horizonOptionDesc, { color: colors.textMuted }]}>
                        {opt.desc}
                      </Text>
                    </View>
                    {isSelected ? <Check size={18} color={colors.accent} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsInflationModalOpen(false)}
              style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginVertical: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  fieldDropdownBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  fieldDropdownBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inlineDropdownTrigger: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginLeft: 6,
  },
  inlineDropdownText: {
    fontSize: 11,
    fontWeight: '700',
  },
  labelRowSub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tinyDropdownBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  tinyDropdownBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  percentSuffix: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  percentDropdownToggle: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  percentDropdownText: {
    fontSize: 13,
    fontWeight: '800',
  },
  countryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexWrap: 'wrap',
    gap: 8,
  },
  barTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  countryChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  flagText: {
    fontSize: 13,
    marginRight: 4,
  },
  countryChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fieldBlock: {
    marginVertical: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  suggestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  suggestBtnFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  suggestBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  horizonSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  horizonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  horizonButtonsRow: {
    flexDirection: 'row',
  },
  fieldLabelSub: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  dropdownTriggerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  horizonChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  horizonChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  horizonChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  foreignSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  foreignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  foreignDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  addCountryRow: {
    flexDirection: 'row',
    gap: 6,
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  addChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  allocList: {
    gap: 8,
  },
  allocCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  allocCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 44,
  },
  allocCountryInfo: {
    flex: 1,
    minWidth: 150,
  },
  allocCountryName: {
    fontSize: 13,
    fontWeight: '700',
  },
  allocControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minHeight: 36,
  },
  weightInput: {
    width: 44,
    height: 34,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    padding: 0,
  },
  weightUnitText: {
    fontSize: 13,
    fontWeight: '800',
  },
  manualIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  manualInputsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  manualInputItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mInputLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  mInput: {
    width: 48,
    height: 28,
    borderWidth: 1,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  allocSummaryRow: {
    marginTop: 4,
  },
  allocStatText: {
    fontSize: 10,
  },
  targetEquityCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  targetEquityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  targetEquityTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  targetEquitySubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  growthPctBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  growthPctBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  equityPresetChipsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  equityPresetChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  equityPresetChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  presetSplitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  presetSplitBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  presetSplitBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sumBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  sumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  lastEntryNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.25)',
  },
  lastEntryNoticeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  balanceLastBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  balanceLastBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  allocSubAmount: {
    fontSize: 10,
    marginTop: 2,
  },
  quickWeightRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickWeightChip: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickWeightChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  horizonOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  horizonOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  horizonOptionDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modelSelectionCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  modelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelScrollControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  modelScrollArrowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
  },
  modelScrollArrowText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modelIndicatorPill: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoIconBtn: {
    padding: 4,
    marginLeft: 4,
  },
  modelChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    minWidth: 100,
  },
  modelChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modelChipSub: {
    fontSize: 10,
    marginTop: 1,
    fontWeight: '600',
  },
  scenarioSubBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  scenarioSubLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  scenarioChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  scenarioChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  scenarioChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scenarioDescText: {
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  miniBucketTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  roiSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  roiHeader: {
    marginBottom: 8,
  },
  roiTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  roiSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  roiModePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  roiModePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  customRoiAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 6,
  },
  customRoiAlertText: {
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
    minWidth: 200,
  },
  resetRoiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  resetRoiBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  roiCardsGrid: {
    marginTop: 12,
    gap: 12,
  },
  roiBucketCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  roiCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roiBucketBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  roiBucketBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  benchmarkRefText: {
    fontSize: 11,
    fontWeight: '600',
  },
  roiBucketDesc: {
    fontSize: 11,
    marginBottom: 10,
    lineHeight: 15,
  },
  roiControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  roiStepBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roiStepBtnText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  roiInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  roiInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  roiUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  roiPresetsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  roiPresetChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  roiPresetChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  realReturnBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 2,
  },
  realReturnLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  realReturnVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  totalBufferPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  totalBufferPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tenureFlowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  tenureFlowItem: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tenureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  tenureFlowTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  tenureFlowSub: {
    fontSize: 10,
    marginTop: 2,
  },
  flowArrow: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 2,
  },
  autoBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  autoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  autoCalculatedInfoBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    gap: 6,
  },
  autoCalcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoCalcKey: {
    fontSize: 11,
    fontWeight: '500',
  },
  autoCalcVal: {
    fontSize: 11,
    fontWeight: '700',
  },
});

