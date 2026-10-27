import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Modal,
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
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { DatePickerInput } from '../common/DatePickerInput';
import { CrossBorderEquityAllocation, SimulationInputs } from '../../engine/types';
import { PALETTE } from '../../theme/colors';
import { COUNTRY_METAS, SupportedCountry, formatCurrency } from '../../utils/currency';
import { COUNTRY_PROFILES, calculateMultiAssetBlendedB3 } from '../../engine/historicalData';
import { calculateInitialSplit } from '../../engine/simulationEngine';

interface InputSectionProps {
  inputs: SimulationInputs;
  onChangeInputs: (newInputs: SimulationInputs) => void;
  onSuggestSafeWithdrawal: () => void;
  onOpenEducationModal: () => void;
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
  const country = inputs.baseCountry || 'IN';
  const meta = COUNTRY_METAS[country] || COUNTRY_METAS.IN;

  // Modal picker for horizons to completely eliminate z-index overlap bugs
  const [horizonModalMode, setHorizonModalMode] = useState<'sim' | 'disp' | null>(null);

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
          <Text style={[styles.badgeText, { color: colors.accent }]}>
            {formatCurrency(inputs.initialCorpus, country)}
          </Text>
        </View>

        <View
          style={[
            styles.inputRow,
            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
          ]}
        >
          <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>
            {meta.currencySymbol}
          </Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={inputs.initialCorpus > 0 ? inputs.initialCorpus.toLocaleString() : ''}
            onChangeText={handleCorpusChange}
            keyboardType="number-pad"
            placeholder="e.g. 20000000"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {/* Expected Monthly Withdrawal + Suggest Safe Button */}
      <View style={styles.fieldBlock}>
        <View style={styles.labelRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Expected Monthly Withdrawal ({meta.currencyCode})
          </Text>
          <Text style={[styles.badgeText, { color: colors.textMuted }]}>
            Annual: {formatCurrency(inputs.monthlyWithdrawal * 12, country)}
          </Text>
        </View>

        <View
          style={[
            styles.inputRow,
            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
          ]}
        >
          <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>
            {meta.currencySymbol}
          </Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={inputs.monthlyWithdrawal > 0 ? inputs.monthlyWithdrawal.toLocaleString() : ''}
            onChangeText={handleWithdrawalChange}
            keyboardType="number-pad"
            placeholder="e.g. 60000"
            placeholderTextColor={colors.textMuted}
          />

          <TouchableOpacity
            style={[styles.suggestBtn, { backgroundColor: colors.accent }]}
            onPress={onSuggestSafeWithdrawal}
            activeOpacity={0.8}
          >
            <Sparkles size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.suggestBtnText}>Suggest Safe</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Start Date & Inflation */}
      <View style={styles.twoColRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <DatePickerInput
            label="Retirement Start Date"
            value={inputs.startDate}
            onChange={(val) => onChangeInputs({ ...inputs, startDate: val })}
          />
        </View>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginBottom: 6 }]}>
            Expected Inflation (%)
          </Text>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, height: 48 },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={inputs.inflationRate.toString()}
              onChangeText={handleInflationChange}
              keyboardType="decimal-pad"
              placeholder={meta.defaultInflation.toString()}
              placeholderTextColor={colors.textMuted}
            />
            <Text style={{ color: colors.textMuted, fontWeight: '700' }}>%</Text>
          </View>
        </View>
      </View>

      {/* 4. Ultra-Long Time Horizons (Modal Trigger Buttons — Zero Overlap) */}
      <View style={[styles.horizonSection, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.horizonHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CalendarDays size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>
              Time Horizons (Up to 80 Years)
            </Text>
          </View>

          <TouchableOpacity
            onPress={onOpenEducationModal}
            style={styles.infoBadge}
            activeOpacity={0.7}
          >
            <HelpCircle size={14} color={colors.accent} style={{ marginRight: 4 }} />
            <Text style={[styles.infoBadgeText, { color: colors.accent }]}>Methodology</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.horizonButtonsRow}>
          {/* Simulation Horizon Trigger */}
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.fieldLabelSub, { color: colors.textSecondary }]}>
              Simulate Backend:
            </Text>
            <TouchableOpacity
              onPress={() => setHorizonModalMode('sim')}
              style={[
                styles.dropdownTrigger,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownTriggerText, { color: colors.textPrimary }]}>
                {inputs.simulationHorizon || 30} Years
              </Text>
              <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13 }}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Display Horizon Trigger */}
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.fieldLabelSub, { color: colors.textSecondary }]}>
              Visualize on Charts:
            </Text>
            <TouchableOpacity
              onPress={() => setHorizonModalMode('disp')}
              style={[
                styles.dropdownTrigger,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownTriggerText, { color: colors.textPrimary }]}>
                {inputs.displayHorizon || 30} Years
              </Text>
              <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13 }}>▾</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 5. Multi-Country & Multi-Asset Cross-Border Allocation (Bucket 3) */}
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

      {/* Dedicated Horizon Selection Modal (Completely Eliminates Z-Index / Overlap Issues) */}
      <Modal
        visible={horizonModalMode !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setHorizonModalMode(null)}
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
                  {horizonModalMode === 'sim'
                    ? 'Select Simulation Horizon'
                    : 'Select Display Horizon'}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  {horizonModalMode === 'sim'
                    ? 'How many years the engine calculates behind the scenes (up to 80 years)'
                    : 'How many years are visualized on the charts'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setHorizonModalMode(null)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {HORIZON_OPTIONS.filter((opt) =>
                horizonModalMode === 'disp' ? opt.value <= (inputs.simulationHorizon || 30) : true
              ).map((opt) => {
                const currentVal =
                  horizonModalMode === 'sim'
                    ? inputs.simulationHorizon || 30
                    : inputs.displayHorizon || 30;
                const isSelected = currentVal === opt.value;

                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => {
                      if (horizonModalMode === 'sim') {
                        onChangeInputs({
                          ...inputs,
                          simulationHorizon: opt.value,
                          displayHorizon: Math.min(inputs.displayHorizon || 30, opt.value),
                        });
                      } else {
                        onChangeInputs({ ...inputs, displayHorizon: opt.value });
                      }
                      setHorizonModalMode(null);
                    }}
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
              onPress={() => setHorizonModalMode(null)}
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
    fontSize: 15,
    fontFamily: 'System',
    paddingVertical: 8,
  },
  suggestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
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
});
