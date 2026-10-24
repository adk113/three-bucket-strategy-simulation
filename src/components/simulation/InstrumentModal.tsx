import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X, ShieldAlert, Award } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { COUNTRY_PROFILES } from '../../engine/historicalData';
import { PALETTE } from '../../theme/colors';
import { COUNTRY_METAS, SupportedCountry } from '../../utils/currency';

interface InstrumentModalProps {
  bucketNum: 1 | 2 | 3 | null;
  baseCountry?: SupportedCountry;
  activeCountries?: SupportedCountry[];
  onClose: () => void;
}

export const InstrumentModal: React.FC<InstrumentModalProps> = ({
  bucketNum,
  baseCountry = 'IN',
  activeCountries = ['IN', 'US'],
  onClose,
}) => {
  const { colors } = useTheme();

  // Deduplicate countries list
  const uniqueCountries = Array.from(new Set([baseCountry, ...activeCountries]));
  const [selectedCountryTab, setSelectedCountryTab] = useState<SupportedCountry>(baseCountry);

  if (!bucketNum) return null;

  const currentCountry = uniqueCountries.includes(selectedCountryTab)
    ? selectedCountryTab
    : baseCountry;
  const countryProfile = COUNTRY_PROFILES[currentCountry] || COUNTRY_PROFILES.IN;
  const configKey = bucketNum === 1 ? 'bucket1' : bucketNum === 2 ? 'bucket2' : 'bucket3';
  const data = countryProfile[configKey];
  const bucketColor =
    bucketNum === 1
      ? PALETTE.bucket1.base
      : bucketNum === 2
      ? PALETTE.bucket2.base
      : PALETTE.bucket3.base;

  return (
    <Modal visible={bucketNum !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
              shadowColor: colors.cardShadow,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: bucketColor }]}>
                {bucketNum === 1
                  ? 'Bucket 1: Cash Liquidity (Years 1–3)'
                  : bucketNum === 2
                  ? 'Bucket 2: Stability & Income (Years 4–10)'
                  : 'Bucket 3: Long-Term Growth (Years 11–80+)'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>{data.role}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Country Switcher Tabs */}
          <View style={styles.countryTabsRow}>
            <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>Market:</Text>
            {uniqueCountries.map((cCode) => {
              const cMeta = COUNTRY_METAS[cCode];
              const isSelected = currentCountry === cCode;
              return (
                <TouchableOpacity
                  key={cCode}
                  onPress={() => setSelectedCountryTab(cCode)}
                  style={[
                    styles.cTab,
                    {
                      backgroundColor: isSelected ? bucketColor : colors.surfaceElevated,
                      borderColor: isSelected ? bucketColor : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 13, marginRight: 4 }}>{cMeta.flag}</Text>
                  <Text
                    style={[
                      styles.cTabText,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {cMeta.name} {cCode === baseCountry ? '(Base)' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView style={{ maxHeight: 390 }} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
              Recommended Vehicles & Tax Structures ({countryProfile.name})
            </Text>

            {data.instruments.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.instrumentCard,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.instName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <View style={[styles.riskTag, { backgroundColor: bucketColor + '20' }]}>
                    <Text style={[styles.riskTagText, { color: bucketColor }]}>
                      {item.riskLevel}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.instDesc, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>

                {item.taxStructure ? (
                  <View style={styles.taxBox}>
                    <Award size={12} color={colors.accent} style={{ marginRight: 4 }} />
                    <Text style={[styles.taxText, { color: colors.accent }]}>
                      Tax Treatment: {item.taxStructure}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.metricsRow}>
                  <View style={styles.metricPair}>
                    <Text style={[styles.mKey, { color: colors.textMuted }]}>Exp. Return:</Text>
                    <Text style={[styles.mVal, { color: colors.textPrimary }]}>
                      ~{item.expectedReturn}% p.a.
                    </Text>
                  </View>
                  <View style={styles.metricPair}>
                    <Text style={[styles.mKey, { color: colors.textMuted }]}>Volatility (σ):</Text>
                    <Text style={[styles.mVal, { color: colors.textPrimary }]}>
                      {item.volatility}%
                    </Text>
                  </View>
                  <View style={styles.metricPair}>
                    <Text style={[styles.mKey, { color: colors.textMuted }]}>Liquidity:</Text>
                    <Text style={[styles.mVal, { color: colors.textPrimary }]}>
                      {item.liquidity}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.doneBtn, { backgroundColor: bucketColor }]}
          >
            <Text style={styles.doneBtnText}>Close Vehicle Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 540,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 10,
  },
  countryTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexWrap: 'wrap',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginRight: 4,
  },
  cTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  instrumentCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  instName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  riskTag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  riskTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  instDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  taxBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  taxText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 6,
  },
  metricPair: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mKey: {
    fontSize: 10,
    marginRight: 4,
  },
  mVal: {
    fontSize: 10,
    fontWeight: '600',
  },
  doneBtn: {
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
