import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X, CheckCircle, Shield, TrendingUp, Layers } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { HISTORICAL_BENCHMARKS } from '../../engine/historicalData';
import { PALETTE } from '../../theme/colors';

interface InstrumentModalProps {
  bucketNum: 1 | 2 | 3 | null;
  onClose: () => void;
}

export const InstrumentModal: React.FC<InstrumentModalProps> = ({
  bucketNum,
  onClose,
}) => {
  const { colors, theme } = useTheme();

  if (!bucketNum) return null;

  const configKey = bucketNum === 1 ? 'bucket1' : bucketNum === 2 ? 'bucket2' : 'bucket3';
  const data = HISTORICAL_BENCHMARKS[configKey];
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
              <Text style={[styles.title, { color: bucketColor }]}>{data.name}</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>{data.role}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
              Recommended Asset Vehicles & Allocation
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
            <Text style={styles.doneBtnText}>Close</Text>
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
    maxWidth: 500,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 10,
  },
  sectionHeading: {
    fontSize: 13,
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
    fontSize: 14,
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
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
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
    fontSize: 11,
    marginRight: 4,
  },
  mVal: {
    fontSize: 11,
    fontWeight: '600',
  },
  doneBtn: {
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
