import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  BookOpen,
  X,
  ShieldCheck,
  TrendingUp,
  Layers,
  ArrowDownCircle,
  HelpCircle,
  Percent,
  CheckCircle2,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { PALETTE } from '../../theme/colors';

interface FinancialGlossaryModalProps {
  visible: boolean;
  onClose: () => void;
  initialTopic?: 'buckets' | 'riskcone' | 'waterfall' | 'swr';
}

export const FinancialGlossaryModal: React.FC<FinancialGlossaryModalProps> = ({
  visible,
  onClose,
  initialTopic = 'riskcone',
}) => {
  const { colors, theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'riskcone' | 'buckets' | 'waterfall' | 'swr'>(
    initialTopic
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <BookOpen size={20} color={colors.accent} style={{ marginRight: 8 }} />
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Financial Education & Methodology
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Understand the actuarial models, risk percentiles, and strategy mechanics
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsRow}
            contentContainerStyle={{ gap: 6 }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab('riskcone')}
              style={[
                styles.tabChip,
                {
                  backgroundColor:
                    activeTab === 'riskcone' ? colors.accent : colors.surfaceElevated,
                  borderColor: activeTab === 'riskcone' ? colors.accent : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabChipText,
                  { color: activeTab === 'riskcone' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                📊 Risk Cone & P10
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('buckets')}
              style={[
                styles.tabChip,
                {
                  backgroundColor:
                    activeTab === 'buckets' ? colors.accent : colors.surfaceElevated,
                  borderColor: activeTab === 'buckets' ? colors.accent : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabChipText,
                  { color: activeTab === 'buckets' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                🪣 The 3 Buckets
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('waterfall')}
              style={[
                styles.tabChip,
                {
                  backgroundColor:
                    activeTab === 'waterfall' ? colors.accent : colors.surfaceElevated,
                  borderColor: activeTab === 'waterfall' ? colors.accent : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabChipText,
                  { color: activeTab === 'waterfall' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                🌊 Waterfall Refill
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('swr')}
              style={[
                styles.tabChip,
                {
                  backgroundColor: activeTab === 'swr' ? colors.accent : colors.surfaceElevated,
                  borderColor: activeTab === 'swr' ? colors.accent : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabChipText,
                  { color: activeTab === 'swr' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                🛡️ Safe Withdrawal (SWR)
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Tab Content */}
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'riskcone' && (
              <View style={styles.topicBlock}>
                <View
                  style={[
                    styles.featuredBox,
                    {
                      backgroundColor:
                        theme === 'dark' ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2',
                      borderColor: 'rgba(239, 68, 68, 0.35)',
                    },
                  ]}
                >
                  <Text style={[styles.featuredHeading, { color: '#EF4444' }]}>
                    What is the Bear Case (P10)?
                  </Text>
                  <Text
                    style={[
                      styles.featuredBody,
                      { color: theme === 'dark' ? '#FCA5A5' : '#991B1B' },
                    ]}
                  >
                    The <Text style={{ fontWeight: '800' }}>10th Percentile (P10)</Text> represents a{' '}
                    <Text style={{ fontWeight: '800' }}>severe market downturn scenario</Text>. Statistically, there is a{' '}
                    <Text style={{ fontWeight: '800' }}>90% probability that the actual market performs better than this curve</Text>, and only a 10% likelihood that performance is worse.
                  </Text>
                  <Text
                    style={[
                      styles.featuredBody,
                      { color: theme === 'dark' ? '#FCA5A5' : '#991B1B', marginTop: 6 },
                    ]}
                  >
                    If your portfolio maintains a positive balance under the P10 trajectory, your retirement plan is extraordinarily resilient against deep recessions, stagflation, and severe sequence-of-returns drawdowns.
                  </Text>
                </View>

                <View
                  style={[styles.cardItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                >
                  <Text style={[styles.cardTitle, { color: colors.accent }]}>
                    🎯 Median Baseline (P50)
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    The 50th percentile is the central actuarial expectation. Exactly half of the 500 randomized market cycle simulations performed higher, and half performed lower. This reflects typical economic compounding across historical averages.
                  </Text>
                </View>

                <View
                  style={[styles.cardItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                >
                  <Text style={[styles.cardTitle, { color: '#10B981' }]}>
                    🚀 Bull Market (P90)
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    The 90th percentile represents a top-decile economic boom (prolonged bull markets, rapid productivity expansion, lower inflation). Only 10% of simulations exceed this high-wealth compounding path.
                  </Text>
                </View>
              </View>
            )}

            {activeTab === 'buckets' && (
              <View style={styles.topicBlock}>
                {/* Bucket 1 */}
                <View
                  style={[
                    styles.bucketCard,
                    {
                      backgroundColor:
                        theme === 'dark' ? PALETTE.bucket1.bgDark : PALETTE.bucket1.bgLight,
                      borderColor: PALETTE.bucket1.borderDark,
                    },
                  ]}
                >
                  <Text style={[styles.bucketName, { color: PALETTE.bucket1.base }]}>
                    Bucket 1: Cash & Immediate Liquidity (Years 1–3)
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    • <Text style={{ fontWeight: '700' }}>Core Mandate:</Text> Capital preservation and zero market volatility.{'\n'}
                    • <Text style={{ fontWeight: '700' }}>Time Horizon:</Text> 36 months of predictable monthly living expenses.{'\n'}
                    • <Text style={{ fontWeight: '700' }}>Vehicles:</Text> Sovereign Treasury Bills, Liquid Mutual Funds, High-Yield Sweep Accounts.{'\n'}
                    • <Text style={{ fontWeight: '700' }}>Psychological Impact:</Text> Provides peace of mind knowing that living expenses are guaranteed for 3 years without touching equities during a crash.
                  </Text>
                </View>

                {/* Bucket 2 */}
                <View
                  style={[
                    styles.bucketCard,
                    {
                      backgroundColor:
                        theme === 'dark' ? PALETTE.bucket2.bgDark : PALETTE.bucket2.bgLight,
                      borderColor: PALETTE.bucket2.borderDark,
                    },
                  ]}
                >
                  <Text style={[styles.bucketName, { color: PALETTE.bucket2.base }]}>
                    Bucket 2: Stability & Income (Years 4–10)
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    • <Text style={{ fontWeight: '700' }}>Core Mandate:</Text> Capital protection with steady yield generation.{'\n'}
                    • <Text style={{ fontWeight: '700' }}>Time Horizon:</Text> 7-year safety buffer bridging cash and equities.{'\n'}
                    • <Text style={{ fontWeight: '700' }}>Vehicles:</Text> Corporate Bond Funds, Target Maturity SDLs, TIPS, Conservative Hybrid.{'\n'}
                    • <Text style={{ fontWeight: '700' }}>The Shock Absorber:</Text> When equity markets plunge, Bucket 2 replenishes Bucket 1 cash, giving equities 7+ years to fully recover without forced liquidation.
                  </Text>
                </View>

                {/* Bucket 3 */}
                <View
                  style={[
                    styles.bucketCard,
                    {
                      backgroundColor:
                        theme === 'dark' ? PALETTE.bucket3.bgDark : PALETTE.bucket3.bgLight,
                      borderColor: PALETTE.bucket3.borderDark,
                    },
                  ]}
                >
                  <Text style={[styles.bucketName, { color: PALETTE.bucket3.base }]}>
                    Bucket 3: Long-Term Growth (Years 11–80+)
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    • <Text style={{ fontWeight: '700' }}>Core Mandate:</Text> Inflation-beating compounding over decades.{'\n'}
                    • <Text style={{ fontWeight: '700' }}>Time Horizon:</Text> Multi-decade retirement longevity and legacy transfer.{'\n'}
                    • <Text style={{ fontWeight: '700' }}>Vehicles:</Text> Nifty 50, S&P 500, MSCI World, Active Flexi-Caps.{'\n'}
                    • <Text style={{ fontWeight: '700' }}>Cross-Border Blending:</Text> Diversifying across domestic and foreign equities lowers portfolio standard deviation through low geographic correlation.
                  </Text>
                </View>
              </View>
            )}

            {activeTab === 'waterfall' && (
              <View style={styles.topicBlock}>
                <View
                  style={[styles.cardItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                    🌊 The Waterfall Refill Mechanism
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginBottom: 8 }]}>
                    Instead of selling assets at random, the 3-bucket strategy follows a disciplined, market-aware rules engine:
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    1. <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Monthly Living Cash:</Text> Automatically withdrawn exclusively from Bucket 1 (Cash).{'\n'}
                    2. <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Bucket 1 Replenishment:</Text> At the end of each year, Bucket 2 transfers funds to refill Bucket 1 back to 3 years of inflation-adjusted expenses.{'\n'}
                    3. <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Bucket 2 Replenishment:</Text> Bucket 3 (Growth) refills Bucket 2 only when equities have generated positive gains.{'\n'}
                    4. <Text style={{ fontWeight: '700', color: '#10B981' }}>Bear Market Defense Rule:</Text> If equities suffer a negative return (down market), Bucket 3 is sealed. No equities are sold at a loss. Bucket 2 absorbs living requirements until the market rebounds.
                  </Text>
                </View>
              </View>
            )}

            {activeTab === 'swr' && (
              <View style={styles.topicBlock}>
                <View
                  style={[styles.cardItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                    🛡️ Safe Withdrawal Rate (SWR) Actuarial Solver
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginBottom: 8 }]}>
                    The "Suggest Safe" button executes an actuarial binary search over 18 iterations:
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    • It stress-tests 500 economic trajectories with a 1.5% haircut below historical means.{'\n'}
                    • It indexes monthly living expenses to your chosen annual inflation rate every year.{'\n'}
                    • It targets a minimum <Text style={{ fontWeight: '700', color: '#10B981' }}>95% survival probability</Text> over your customized Simulation Horizon (up to 80 years).{'\n'}
                    • This ensures your capital theoretically preserves purchasing power and eliminates longevity exhaustion risk.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={[styles.doneBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.doneBtnText}>Got It, Close Glossary</Text>
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
    maxWidth: 620,
    maxHeight: '85%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  tabChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  contentScroll: {
    maxHeight: 460,
  },
  topicBlock: {
    gap: 12,
    paddingVertical: 4,
  },
  featuredBox: {
    borderRadius: 14,
    borderWidth: 1.2,
    padding: 14,
  },
  featuredHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  featuredBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  cardItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 12,
    lineHeight: 18,
  },
  bucketCard: {
    borderRadius: 14,
    borderWidth: 1.2,
    padding: 14,
  },
  bucketName: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  doneBtn: {
    paddingVertical: 12,
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
