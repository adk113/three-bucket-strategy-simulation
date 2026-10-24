import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
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
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { DatePickerInput } from '../common/DatePickerInput';
import { CrossBorderEquityAllocation, SimulationInputs } from '../../engine/types';
import { PALETTE } from '../../theme/colors';
import { COUNTRY_METAS, SupportedCountry, formatCurrency } from '../../utils/currency';
import { COUNTRY_PROFILES } from '../../engine/historicalData';

interface InputSectionProps {
  inputs: SimulationInputs;
  onChangeInputs: (newInputs: SimulationInputs) => void;
  onSuggestSafeWithdrawal: () => void;
  onOpenEducationModal: () => void;
}

const HORIZON_OPTIONS = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80];

export const InputSection: React.FC<InputSectionProps> = ({
  inputs,
  onChangeInputs,
  onSuggestSafeWithdrawal,
  onOpenEducationModal,
}) => {
  const { colors } = useTheme();
  const country = inputs.baseCountry || 'IN';
  const meta = COUNTRY_METAS[country] || COUNTRY_METAS.IN;

  const [horizonDropdownOpen, setHorizonDropdownOpen] = useState<'sim' | 'disp' | null>(null);

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
    // Re-seed multi-country allocation with Base 60% and secondary 40%
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

  // Multi-country allocation helpers
  const handleUpdateWeight = (idx: number, newWeightStr: string) => {
    const w = parseInt(newWeightStr.replace(/[^0-9]/g, ''), 10) || 0;
    const updated = [...inputs.multiCountryAllocations];
    updated[idx] = { ...updated[idx], weight: Math.min(100, Math.max(0, w)) };
    onChangeInputs({ ...inputs, multiCountryAllocations: updated });
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
    const updated = [...inputs.multiCountryAllocations, { country: c, weight: 20, isManual: false }];
    onChangeInputs({ ...inputs, multiCountryAllocations: updated });
  };

  const handleRemoveCountry = (idx: number) => {
    if (inputs.multiCountryAllocations.length <= 1) return;
    const updated = inputs.multiCountryAllocations.filter((_, i) => i !== idx);
    onChangeInputs({ ...inputs, multiCountryAllocations: updated });
  };

  const totalAllocWeight = inputs.multiCountryAllocations.reduce((acc, cur) => acc + cur.weight, 0);

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

      {/* 4. Ultra-Long Time Horizons (Dropdown up to 80 Years) */}
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

        <View style={styles.horizonDropdownRow}>
          {/* Simulation Horizon Dropdown */}
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.fieldLabelSub, { color: colors.textSecondary }]}>
              Simulate Backend:
            </Text>
            <TouchableOpacity
              onPress={() =>
                setHorizonDropdownOpen(horizonDropdownOpen === 'sim' ? null : 'sim')
              }
              style={[
                styles.dropdownTrigger,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
              ]}
            >
              <Text style={[styles.dropdownTriggerText, { color: colors.textPrimary }]}>
                {inputs.simulationHorizon || 30} Years
              </Text>
              <Text style={{ color: colors.accent, fontWeight: '700' }}>▾</Text>
            </TouchableOpacity>

            {horizonDropdownOpen === 'sim' && (
              <View
                style={[
                  styles.dropdownMenu,
                  { backgroundColor: colors.surfaceCard, borderColor: colors.border },
                ]}
              >
                <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={true}>
                  {HORIZON_OPTIONS.map((yrs) => (
                    <TouchableOpacity
                      key={yrs}
                      onPress={() => {
                        onChangeInputs({
                          ...inputs,
                          simulationHorizon: yrs,
                          displayHorizon: Math.min(inputs.displayHorizon || 30, yrs),
                        });
                        setHorizonDropdownOpen(null);
                      }}
                      style={[
                        styles.dropdownItem,
                        inputs.simulationHorizon === yrs && { backgroundColor: colors.accent + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          {
                            color:
                              inputs.simulationHorizon === yrs
                                ? colors.accent
                                : colors.textPrimary,
                          },
                        ]}
                      >
                        {yrs} Years {yrs >= 50 ? '🌟 Lifelong' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Display Horizon Dropdown */}
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.fieldLabelSub, { color: colors.textSecondary }]}>
              Visualize on Charts:
            </Text>
            <TouchableOpacity
              onPress={() =>
                setHorizonDropdownOpen(horizonDropdownOpen === 'disp' ? null : 'disp')
              }
              style={[
                styles.dropdownTrigger,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
              ]}
            >
              <Text style={[styles.dropdownTriggerText, { color: colors.textPrimary }]}>
                {inputs.displayHorizon || 30} Years
              </Text>
              <Text style={{ color: colors.accent, fontWeight: '700' }}>▾</Text>
            </TouchableOpacity>

            {horizonDropdownOpen === 'disp' && (
              <View
                style={[
                  styles.dropdownMenu,
                  { backgroundColor: colors.surfaceCard, borderColor: colors.border },
                ]}
              >
                <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={true}>
                  {HORIZON_OPTIONS.filter((y) => y <= (inputs.simulationHorizon || 30)).map(
                    (yrs) => (
                      <TouchableOpacity
                        key={yrs}
                        onPress={() => {
                          onChangeInputs({ ...inputs, displayHorizon: yrs });
                          setHorizonDropdownOpen(null);
                        }}
                        style={[
                          styles.dropdownItem,
                          inputs.displayHorizon === yrs && { backgroundColor: colors.accent + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            {
                              color:
                                inputs.displayHorizon === yrs
                                  ? colors.accent
                                  : colors.textPrimary,
                            },
                          ]}
                        >
                          {yrs} Years
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 5. Multi-Country & Multi-Asset Cross-Border Allocation (Bucket 3) */}
      <View style={[styles.foreignSection, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.foreignHeader}>
          <View>
            <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>
              Multi-Country Equity Blend (Bucket 3)
            </Text>
            <Text style={[styles.foreignDesc, { color: colors.textMuted }]}>
              Weight multiple markets simultaneously. Total Weight: {totalAllocWeight}%
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

        {/* List of active country equity allocations */}
        <View style={styles.allocList}>
          {inputs.multiCountryAllocations.map((alloc, idx) => {
            const cMeta = COUNTRY_METAS[alloc.country];
            const defaultProfile = COUNTRY_PROFILES[alloc.country].bucket3;

            return (
              <View
                key={alloc.country}
                style={[
                  styles.allocCard,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
                ]}
              >
                <View style={styles.allocCardTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, marginRight: 6 }}>{cMeta.flag}</Text>
                    <Text style={[styles.allocCountryName, { color: colors.textPrimary }]}>
                      {cMeta.name} Equity
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {/* Weight Input */}
                    <View style={styles.weightBox}>
                      <TextInput
                        style={[
                          styles.weightInput,
                          { color: colors.textPrimary, borderColor: colors.borderSubtle },
                        ]}
                        value={alloc.weight.toString()}
                        onChangeText={(txt) => handleUpdateWeight(idx, txt)}
                        keyboardType="number-pad"
                      />
                      <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 11 }}>
                        %
                      </Text>
                    </View>

                    {/* Manual Mode Toggle */}
                    <TouchableOpacity
                      onPress={() => handleToggleManualCountry(idx, !alloc.isManual)}
                      style={[
                        styles.manualIconBtn,
                        alloc.isManual && { backgroundColor: PALETTE.bucket3.base },
                      ]}
                    >
                      <Settings2
                        size={14}
                        color={alloc.isManual ? '#FFFFFF' : colors.textSecondary}
                      />
                    </TouchableOpacity>

                    {inputs.multiCountryAllocations.length > 1 && (
                      <TouchableOpacity
                        onPress={() => handleRemoveCountry(idx)}
                        style={styles.trashBtn}
                      >
                        <Trash2 size={14} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
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
              </View>
            );
          })}
        </View>
      </View>
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
  horizonDropdownRow: {
    flexDirection: 'row',
    position: 'relative',
    zIndex: 20,
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
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 999,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '600',
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
  },
  allocCountryName: {
    fontSize: 13,
    fontWeight: '700',
  },
  weightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weightInput: {
    width: 44,
    height: 32,
    borderWidth: 1,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
  },
  manualIconBtn: {
    padding: 6,
    borderRadius: 6,
  },
  trashBtn: {
    padding: 6,
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
});
