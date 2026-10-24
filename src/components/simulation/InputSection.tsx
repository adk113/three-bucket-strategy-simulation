import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { Sparkles, Sliders, History, IndianRupee } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { DatePickerInput } from '../common/DatePickerInput';
import { SimulationInputs } from '../../engine/types';
import { PALETTE } from '../../theme/colors';

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
  const { colors, theme } = useTheme();

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
      inflationRate: isNaN(num) ? 0 : Math.min(20, Math.max(0, num)),
    });
  };

  const setCorpusPreset = (amount: number) => {
    onChangeInputs({ ...inputs, initialCorpus: amount });
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
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Simulation Parameters
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Customize your corpus, living expenses, and economic assumptions
          </Text>
        </View>
      </View>

      {/* Initial Corpus */}
      <View style={styles.fieldBlock}>
        <View style={styles.labelRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Initial Retirement Corpus
          </Text>
          {inputs.initialCorpus >= 10000000 ? (
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              ₹{(inputs.initialCorpus / 10000000).toFixed(2)} Crore
            </Text>
          ) : inputs.initialCorpus >= 100000 ? (
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              ₹{(inputs.initialCorpus / 100000).toFixed(2)} Lakh
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.inputRow,
            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
          ]}
        >
          <IndianRupee size={18} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={inputs.initialCorpus > 0 ? inputs.initialCorpus.toLocaleString() : ''}
            onChangeText={handleCorpusChange}
            keyboardType="number-pad"
            placeholder="e.g. 2,00,00,000"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Quick presets */}
        <View style={styles.presetRow}>
          {[10000000, 20000000, 30000000, 50000000].map((amt) => {
            const label = `₹${amt / 10000000} Cr`;
            const isSelected = inputs.initialCorpus === amt;
            return (
              <TouchableOpacity
                key={amt}
                onPress={() => setCorpusPreset(amt)}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surfaceElevated,
                    borderColor: isSelected ? colors.accent : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Expected Monthly Withdrawal + Safe Suggest Button */}
      <View style={styles.fieldBlock}>
        <View style={styles.labelRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Expected Monthly Withdrawal
          </Text>
          <Text style={[styles.badgeText, { color: colors.textMuted }]}>
            Annual: ₹{((inputs.monthlyWithdrawal * 12) / 100000).toFixed(2)} L
          </Text>
        </View>

        <View
          style={[
            styles.inputRow,
            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
          ]}
        >
          <IndianRupee size={18} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={inputs.monthlyWithdrawal > 0 ? inputs.monthlyWithdrawal.toLocaleString() : ''}
            onChangeText={handleWithdrawalChange}
            keyboardType="number-pad"
            placeholder="e.g. 60,000"
            placeholderTextColor={colors.textMuted}
          />

          {/* Suggest Safe Withdrawal Button */}
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

      {/* Start Date & Inflation */}
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
              placeholder="6.0"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={{ color: colors.textMuted, fontWeight: '700' }}>%</Text>
          </View>
        </View>
      </View>

      {/* ROI Mode Switcher: Historical vs Manual */}
      <View style={[styles.roiSection, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.roiHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {inputs.mode === 'historical' ? (
              <History size={18} color={colors.accent} style={{ marginRight: 8 }} />
            ) : (
              <Sliders size={18} color={colors.accent} style={{ marginRight: 8 }} />
            )}
            <Text style={[styles.roiTitle, { color: colors.textPrimary }]}>
              {inputs.mode === 'historical'
                ? 'Mode: Historical Asset Models'
                : 'Mode: Manual ROI Overrides'}
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
            <Text style={[styles.manualDesc, { color: colors.textMuted }]}>
              Set expected annual growth rates for each bucket:
            </Text>

            <View style={styles.sliderGrid}>
              <View style={styles.roiPill}>
                <Text style={[styles.roiPillLabel, { color: PALETTE.bucket1.base }]}>
                  B1 (Cash)
                </Text>
                <TextInput
                  style={[styles.roiPillInput, { color: colors.textPrimary, borderColor: colors.inputBorder }]}
                  value={inputs.manualReturns.bucket1.toString()}
                  onChangeText={(val) =>
                    onChangeInputs({
                      ...inputs,
                      manualReturns: {
                        ...inputs.manualReturns,
                        bucket1: parseFloat(val) || 0,
                      },
                    })
                  }
                  keyboardType="decimal-pad"
                />
                <Text style={{ color: colors.textMuted }}>%</Text>
              </View>

              <View style={styles.roiPill}>
                <Text style={[styles.roiPillLabel, { color: PALETTE.bucket2.base }]}>
                  B2 (Stable)
                </Text>
                <TextInput
                  style={[styles.roiPillInput, { color: colors.textPrimary, borderColor: colors.inputBorder }]}
                  value={inputs.manualReturns.bucket2.toString()}
                  onChangeText={(val) =>
                    onChangeInputs({
                      ...inputs,
                      manualReturns: {
                        ...inputs.manualReturns,
                        bucket2: parseFloat(val) || 0,
                      },
                    })
                  }
                  keyboardType="decimal-pad"
                />
                <Text style={{ color: colors.textMuted }}>%</Text>
              </View>

              <View style={styles.roiPill}>
                <Text style={[styles.roiPillLabel, { color: PALETTE.bucket3.base }]}>
                  B3 (Growth)
                </Text>
                <TextInput
                  style={[styles.roiPillInput, { color: colors.textPrimary, borderColor: colors.inputBorder }]}
                  value={inputs.manualReturns.bucket3.toString()}
                  onChangeText={(val) =>
                    onChangeInputs({
                      ...inputs,
                      manualReturns: {
                        ...inputs.manualReturns,
                        bucket3: parseFloat(val) || 0,
                      },
                    })
                  }
                  keyboardType="decimal-pad"
                />
                <Text style={{ color: colors.textMuted }}>%</Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={[styles.historicalNote, { color: colors.textMuted }]}>
            Using empirical parameters: B1 (Cash: 5.75% μ, 0.85% σ) • B2 (Stable: 8.5% μ, 4.2% σ) • B3 (Growth: 12.5% μ, 15.8% σ) with stochastic market volatility.
          </Text>
        )}
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
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'System',
    paddingVertical: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  historicalNote: {
    fontSize: 11,
    marginTop: 8,
    lineHeight: 16,
  },
  manualSlidersContainer: {
    marginTop: 10,
  },
  manualDesc: {
    fontSize: 11,
    marginBottom: 8,
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
