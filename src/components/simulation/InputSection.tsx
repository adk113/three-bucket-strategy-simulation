import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import {
  Sparkles,
  Sliders,
  History,
  Globe2,
  CalendarDays,
  Percent,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { DatePickerInput } from '../common/DatePickerInput';
import { SimulationInputs } from '../../engine/types';
import { PALETTE } from '../../theme/colors';
import { COUNTRY_METAS, SupportedCountry, formatCurrency } from '../../utils/currency';

interface InputSectionProps {
  inputs: SimulationInputs;
  onChangeInputs: (newInputs: SimulationInputs) => void;
  onSuggestSafeWithdrawal: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  inputs,
  onChangeInputs,
  onSuggestSafeWithdrawal,
}) => {
  const { colors } = useTheme();
  const country = inputs.baseCountry || 'IN';
  const meta = COUNTRY_METAS[country] || COUNTRY_METAS.IN;

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

  const handleCountryChange = (newCountry: SupportedCountry) => {
    const newMeta = COUNTRY_METAS[newCountry];
    const foreign = newCountry === 'US' ? 'IN' : 'US';
    onChangeInputs({
      ...inputs,
      baseCountry: newCountry,
      foreignCountry: foreign,
      inflationRate: newMeta.defaultInflation,
      initialCorpus: newMeta.defaultCorpus,
      monthlyWithdrawal: newMeta.defaultWithdrawal,
    });
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
                onPress={() => handleCountryChange(cCode)}
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

      {/* 4. Variable Time Horizons Config */}
      <View style={[styles.horizonSection, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.horizonHeader}>
          <CalendarDays size={16} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>
            Simulation & Display Horizons
          </Text>
        </View>

        <View style={styles.horizonRow}>
          {/* Simulation Horizon */}
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.fieldLabelSub, { color: colors.textSecondary }]}>
              Simulate Backend:
            </Text>
            <View style={styles.horizonChips}>
              {[25, 30, 40, 50].map((yrs) => {
                const isSelected = (inputs.simulationHorizon || 30) === yrs;
                return (
                  <TouchableOpacity
                    key={yrs}
                    onPress={() =>
                      onChangeInputs({
                        ...inputs,
                        simulationHorizon: yrs,
                        displayHorizon: Math.min(inputs.displayHorizon || 30, yrs),
                      })
                    }
                    style={[
                      styles.horizonChip,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surfaceElevated,
                        borderColor: isSelected ? colors.accent : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.horizonChipText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {yrs}y
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Display Horizon */}
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.fieldLabelSub, { color: colors.textSecondary }]}>
              Visualize on Charts:
            </Text>
            <View style={styles.horizonChips}>
              {[10, 15, 20, 30].map((yrs) => {
                const isSelected = (inputs.displayHorizon || 30) === yrs;
                return (
                  <TouchableOpacity
                    key={yrs}
                    onPress={() => onChangeInputs({ ...inputs, displayHorizon: yrs })}
                    style={[
                      styles.horizonChip,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surfaceElevated,
                        borderColor: isSelected ? colors.accent : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.horizonChipText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {yrs}y
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      {/* 5. Cross-Border Portfolio Modeling (Foreign Allocation) */}
      <View style={[styles.foreignSection, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.foreignHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Globe2 size={16} color={PALETTE.bucket3.base} style={{ marginRight: 6 }} />
            <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>
              Cross-Border Equity Allocation (Bucket 3)
            </Text>
          </View>
          <Text style={[styles.foreignPctLabel, { color: PALETTE.bucket3.base }]}>
            {inputs.foreignAllocationPercent || 0}% Foreign
          </Text>
        </View>

        <Text style={[styles.foreignDesc, { color: colors.textMuted }]}>
          Invest a percentage of High-Growth Equities into a secondary international market:
        </Text>

        <View style={styles.foreignControlsRow}>
          {/* Secondary Country Selector */}
          <View style={styles.foreignCountrySelector}>
            {(['US', 'IN', 'EU', 'UK'] as SupportedCountry[])
              .filter((c) => c !== country)
              .slice(0, 3)
              .map((scCode) => {
                const scMeta = COUNTRY_METAS[scCode];
                const isSelected = inputs.foreignCountry === scCode;
                return (
                  <TouchableOpacity
                    key={scCode}
                    onPress={() => onChangeInputs({ ...inputs, foreignCountry: scCode })}
                    style={[
                      styles.secCountryChip,
                      {
                        backgroundColor: isSelected ? PALETTE.bucket3.base : colors.surfaceElevated,
                        borderColor: isSelected ? PALETTE.bucket3.base : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text style={styles.flagText}>{scMeta.flag}</Text>
                    <Text
                      style={[
                        styles.secCountryText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {scMeta.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>

          {/* Allocation % Chips */}
          <View style={styles.foreignPctChips}>
            {[0, 15, 25, 35, 50].map((pct) => {
              const isSelected = (inputs.foreignAllocationPercent || 0) === pct;
              return (
                <TouchableOpacity
                  key={pct}
                  onPress={() => onChangeInputs({ ...inputs, foreignAllocationPercent: pct })}
                  style={[
                    styles.pctChip,
                    {
                      backgroundColor: isSelected ? PALETTE.bucket3.base : colors.surfaceElevated,
                      borderColor: isSelected ? PALETTE.bucket3.base : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pctChipText,
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
      </View>

      {/* 6. ROI Mode Switcher: Historical vs Manual */}
      <View style={[styles.roiSection, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.roiHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {inputs.mode === 'historical' ? (
              <History size={16} color={colors.accent} style={{ marginRight: 6 }} />
            ) : (
              <Sliders size={16} color={colors.accent} style={{ marginRight: 6 }} />
            )}
            <Text style={[styles.roiTitle, { color: colors.textPrimary }]}>
              {inputs.mode === 'historical'
                ? `Historical Empirical Model (${meta.name})`
                : 'Manual ROI Overrides'}
            </Text>
          </View>

          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>
              {inputs.mode === 'historical' ? 'Historical' : 'Manual'}
            </Text>
            <Switch
              value={inputs.mode === 'manual'}
              onValueChange={(isManual) =>
                onChangeInputs({
                  ...inputs,
                  mode: isManual ? 'manual' : 'historical',
                })
              }
              thumbColor={colors.accent}
              trackColor={{ false: colors.surfaceElevated, true: colors.accent + '60' }}
            />
          </View>
        </View>

        {inputs.mode === 'manual' ? (
          <View style={styles.manualSlidersContainer}>
            <View style={styles.sliderGrid}>
              <View style={styles.roiPill}>
                <Text style={[styles.roiPillLabel, { color: PALETTE.bucket1.base }]}>B1 (Cash)</Text>
                <TextInput
                  style={[styles.roiPillInput, { color: colors.textPrimary, borderColor: colors.inputBorder }]}
                  value={inputs.manualReturns.bucket1.toString()}
                  onChangeText={(val) =>
                    onChangeInputs({
                      ...inputs,
                      manualReturns: { ...inputs.manualReturns, bucket1: parseFloat(val) || 0 },
                    })
                  }
                  keyboardType="decimal-pad"
                />
                <Text style={{ color: colors.textMuted }}>%</Text>
              </View>

              <View style={styles.roiPill}>
                <Text style={[styles.roiPillLabel, { color: PALETTE.bucket2.base }]}>B2 (Stable)</Text>
                <TextInput
                  style={[styles.roiPillInput, { color: colors.textPrimary, borderColor: colors.inputBorder }]}
                  value={inputs.manualReturns.bucket2.toString()}
                  onChangeText={(val) =>
                    onChangeInputs({
                      ...inputs,
                      manualReturns: { ...inputs.manualReturns, bucket2: parseFloat(val) || 0 },
                    })
                  }
                  keyboardType="decimal-pad"
                />
                <Text style={{ color: colors.textMuted }}>%</Text>
              </View>

              <View style={styles.roiPill}>
                <Text style={[styles.roiPillLabel, { color: PALETTE.bucket3.base }]}>B3 (Growth)</Text>
                <TextInput
                  style={[styles.roiPillInput, { color: colors.textPrimary, borderColor: colors.inputBorder }]}
                  value={inputs.manualReturns.bucket3.toString()}
                  onChangeText={(val) =>
                    onChangeInputs({
                      ...inputs,
                      manualReturns: { ...inputs.manualReturns, bucket3: parseFloat(val) || 0 },
                    })
                  }
                  keyboardType="decimal-pad"
                />
                <Text style={{ color: colors.textMuted }}>%</Text>
              </View>
            </View>
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
    alignItems: 'center',
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  horizonRow: {
    flexDirection: 'row',
  },
  fieldLabelSub: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  horizonChips: {
    flexDirection: 'row',
    gap: 6,
  },
  horizonChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
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
    alignItems: 'center',
    marginBottom: 4,
  },
  foreignPctLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  foreignDesc: {
    fontSize: 11,
    marginBottom: 8,
  },
  foreignControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  foreignCountrySelector: {
    flexDirection: 'row',
    gap: 6,
  },
  secCountryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  secCountryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  foreignPctChips: {
    flexDirection: 'row',
    gap: 4,
  },
  pctChip: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  pctChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roiSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  roiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roiTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  manualSlidersContainer: {
    marginTop: 10,
  },
  sliderGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  roiPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roiPillLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  roiPillInput: {
    width: 44,
    height: 34,
    borderWidth: 1,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 2,
  },
});
