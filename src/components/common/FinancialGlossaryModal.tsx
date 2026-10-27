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
  AlertTriangle,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { PALETTE } from '../../theme/colors';

interface FinancialGlossaryModalProps {
  visible: boolean;
  onClose: () => void;
  initialTopic?: 'riskcone' | 'buckets' | 'waterfall' | 'swr' | 'methodologies';
}

export const FinancialGlossaryModal: React.FC<FinancialGlossaryModalProps> = ({
  visible,
  onClose,
  initialTopic = 'riskcone',
}) => {
  const { colors, theme } = useTheme();
  const [activeTab, setActiveTab] = useState<
    'riskcone' | 'buckets' | 'waterfall' | 'swr' | 'methodologies'
  >(initialTopic);

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

          {/* Navigation Tabs (Pinned with flexShrink: 0 so they never hide behind details) */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsRow}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
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

              <TouchableOpacity
                onPress={() => setActiveTab('methodologies')}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor:
                      activeTab === 'methodologies' ? colors.accent : colors.surfaceElevated,
                    borderColor:
                      activeTab === 'methodologies' ? colors.accent : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    { color: activeTab === 'methodologies' ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  ⚖️ Model Methodologies
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Tab Content */}
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'riskcone' && (
              <View style={styles.topicBlock}>
                {/* 1. Executive Summary */}
                <View
                  style={[
                    styles.executiveSummaryCard,
                    {
                      backgroundColor: colors.accent + '12',
                      borderColor: colors.accent + '40',
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <TrendingUp size={16} color={colors.accent} style={{ marginRight: 6 }} />
                    <Text style={[styles.executiveSummaryTitle, { color: colors.accent }]}>
                      Executive Summary
                    </Text>
                  </View>
                  <Text style={[styles.cardText, { color: colors.textPrimary }]}>
                    A <Text style={{ fontWeight: '800' }}>Risk Cone</Text> is an actuarial visual tool generated by{' '}
                    <Text style={{ fontWeight: '800' }}>Monte Carlo simulations (500+ randomized economic cycles)</Text> that illustrates the growing range of uncertainty in your retirement wealth over time.
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginTop: 6 }]}>
                    Within these projections, <Text style={{ fontWeight: '700', color: colors.textPrimary }}>P10, P50, and P90</Text> represent statistical confidence thresholds. Crucially,{' '}
                    <Text style={{ fontWeight: '700', color: colors.accent }}>P10 has opposite meanings</Text> depending on the industry context (Wealth Management vs. Project Engineering / Budgeting) due to how probabilities are measured.
                  </Text>
                </View>

                {/* 2. What is a Risk Cone? */}
                <View
                  style={[styles.cardItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                    1. What is a Risk Cone & Why Single Lines Fail?
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    When forecasting long-term retirement wealth (over 20 to 80 years), <Text style={{ fontWeight: '700', color: colors.textPrimary }}>single-line linear forecasts fail</Text> because they assume market returns are smooth and constant every year. In reality, markets experience severe volatility, stagflation, and sequence-of-returns drawdowns.
                  </Text>
                  <View style={{ marginTop: 8, gap: 4 }}>
                    <Text style={[styles.bulletItem, { color: colors.textSecondary }]}>
                      • <Text style={{ fontWeight: '700', color: colors.textPrimary }}>The Shape:</Text> Starts tight at Year 0 (where you have 100% certainty of your current corpus) and fans out progressively wider every subsequent year.
                    </Text>
                    <Text style={[styles.bulletItem, { color: colors.textSecondary }]}>
                      • <Text style={{ fontWeight: '700', color: colors.textPrimary }}>The Purpose:</Text> The widening cone visually captures the compounding nature of risk, inflation dispersion, and volatility over time.
                    </Text>
                    <Text style={[styles.bulletItem, { color: colors.textSecondary }]}>
                      • <Text style={{ fontWeight: '700', color: colors.textPrimary }}>The Bands:</Text> Divided into horizontal confidence curves (P10, P50, P90) showing your probability of landing in various wealth zones.
                    </Text>
                  </View>
                </View>

                {/* 3. The 3 Curves in Wealth Management */}
                <View
                  style={[
                    styles.featuredBox,
                    {
                      backgroundColor:
                        theme === 'dark' ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2',
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <AlertTriangle size={16} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={[styles.featuredHeading, { color: '#EF4444' }]}>
                      P10 (10th Percentile) — The Pessimistic Bear Case
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.featuredBody,
                      { color: theme === 'dark' ? '#FCA5A5' : '#991B1B' },
                    ]}
                  >
                    In financial planning, there is only a <Text style={{ fontWeight: '800' }}>10% probability that your portfolio performs worse than this line</Text>, meaning there is a{' '}
                    <Text style={{ fontWeight: '800' }}>90% probability that performance is higher</Text>. It models historic market crashes (e.g. 1929, 1973, 2000, 2008) and high sequence-of-returns risk early in retirement.
                  </Text>
                  <View style={[styles.highlightPill, { backgroundColor: '#EF444425', borderColor: '#EF444460' }]}>
                    <Text style={[styles.highlightPillText, { color: '#EF4444' }]}>
                      👑 The Golden Rule: If your wealth stays above ₹0 under the P10 curve, your retirement plan is virtually crisis-proof.
                    </Text>
                  </View>
                </View>

                <View
                  style={[styles.cardItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                >
                  <Text style={[styles.cardTitle, { color: colors.accent }]}>
                    🎯 P50 (50th Percentile) — Median Central Expectation
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    The 50th percentile is the central actuarial expectation. Exactly half (50%) of the randomized market simulations compounded higher, and half compounded lower. This represents your balanced, baseline compounding path under normal historical market cycles.
                  </Text>
                </View>

                <View
                  style={[styles.cardItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                >
                  <Text style={[styles.cardTitle, { color: '#10B981' }]}>
                    🚀 P90 (90th Percentile) — The Optimistic Bull Market
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    The 90th percentile represents a top-decile economic boom. 90% of simulations fell below this trajectory; only the top 10% most prosperous global market expansion runs exceed it.
                  </Text>
                </View>

                {/* 4. Dual Meanings Across Industries (Crucial Context) */}
                <View
                  style={[styles.cardItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <HelpCircle size={16} color={colors.accent} style={{ marginRight: 6 }} />
                    <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                      2. Dual Meanings of P10 Across Industries
                    </Text>
                  </View>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    Because financial planning and engineering track probabilities in opposite directions, P10 carries two distinct conventions:
                  </Text>

                  <View style={{ marginTop: 8, gap: 8 }}>
                    <View style={[styles.subContextCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
                      <Text style={[styles.subContextTitle, { color: colors.accent }]}>
                        Context A: Wealth Management (Cumulative Distribution) — Used in this App
                      </Text>
                      <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                        P-values track the probability that wealth falls <Text style={{ fontWeight: '700', color: colors.textPrimary }}>at or below a number</Text>. P10 is the <Text style={{ fontWeight: '700', color: '#EF4444' }}>downside / pessimistic case</Text> (only 10% chance of doing worse).
                      </Text>
                    </View>

                    <View style={[styles.subContextCard, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
                      <Text style={[styles.subContextTitle, { color: colors.textMuted }]}>
                        Context B: Engineering, Construction & Oil/Gas (Exceedance Convention)
                      </Text>
                      <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                        P-values track the probability that resources or costs will <Text style={{ fontWeight: '700', color: colors.textPrimary }}>equal or exceed an estimate</Text>. In that sector, P10 represents an <Text style={{ fontWeight: '700', color: '#10B981' }}>optimistic best-case scenario</Text> (only 10% chance of exceeding or beating this aggressive cost/volume target).
                      </Text>
                    </View>
                  </View>

                  {/* Summary Comparison Table */}
                  <View style={[styles.tableContainer, { borderColor: colors.borderSubtle }]}>
                    <View style={[styles.tableHeaderRow, { backgroundColor: colors.surfaceCard, borderBottomColor: colors.borderSubtle }]}>
                      <Text style={[styles.tableHeaderCell, { flex: 1.1, color: colors.textPrimary }]}>Metric</Text>
                      <Text style={[styles.tableHeaderCell, { flex: 2.2, color: colors.accent }]}>Wealth & Finance (This App)</Text>
                      <Text style={[styles.tableHeaderCell, { flex: 2.2, color: colors.textMuted }]}>Project Costs & Engineering</Text>
                    </View>

                    <View style={[styles.tableRow, { borderBottomColor: colors.borderSubtle }]}>
                      <View style={{ flex: 1.1 }}>
                        <View style={[styles.metricBadge, { backgroundColor: '#EF444422', borderColor: '#EF4444' }]}>
                          <Text style={[styles.metricBadgeText, { color: '#EF4444' }]}>P10</Text>
                        </View>
                      </View>
                      <Text style={[styles.tableCell, { flex: 2.2, color: colors.textPrimary }]}>
                        <Text style={{ fontWeight: '700', color: '#EF4444' }}>Pessimistic Case:</Text> 10% chance of performing worse (90% chance better).
                      </Text>
                      <Text style={[styles.tableCell, { flex: 2.2, color: colors.textSecondary }]}>
                        <Text style={{ fontWeight: '700', color: '#10B981' }}>Optimistic Case:</Text> 10% chance of exceeding or finding more.
                      </Text>
                    </View>

                    <View style={[styles.tableRow, { borderBottomColor: colors.borderSubtle }]}>
                      <View style={{ flex: 1.1 }}>
                        <View style={[styles.metricBadge, { backgroundColor: colors.accent + '22', borderColor: colors.accent }]}>
                          <Text style={[styles.metricBadgeText, { color: colors.accent }]}>P50</Text>
                        </View>
                      </View>
                      <Text style={[styles.tableCell, { flex: 2.2, color: colors.textPrimary }]}>
                        <Text style={{ fontWeight: '700', color: colors.accent }}>Median Case:</Text> 50/50 central expected compounding path.
                      </Text>
                      <Text style={[styles.tableCell, { flex: 2.2, color: colors.textSecondary }]}>
                        <Text style={{ fontWeight: '700', color: colors.textSecondary }}>Median Case:</Text> Balanced central project cost baseline.
                      </Text>
                    </View>

                    <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                      <View style={{ flex: 1.1 }}>
                        <View style={[styles.metricBadge, { backgroundColor: '#10B98122', borderColor: '#10B981' }]}>
                          <Text style={[styles.metricBadgeText, { color: '#10B981' }]}>P90</Text>
                        </View>
                      </View>
                      <Text style={[styles.tableCell, { flex: 2.2, color: colors.textPrimary }]}>
                        <Text style={{ fontWeight: '700', color: '#10B981' }}>Optimistic Case:</Text> 90% chance of performing worse (top 10% bull decile).
                      </Text>
                      <Text style={[styles.tableCell, { flex: 2.2, color: colors.textSecondary }]}>
                        <Text style={{ fontWeight: '700', color: '#EF4444' }}>Pessimistic Safe Bound:</Text> 90% chance cost is equal or below ceiling.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 5. How It Helps You Predict & Visualize Behavior */}
                <View
                  style={[styles.cardItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                >
                  <Text style={[styles.cardTitle, { color: colors.accent }]}>
                    3. How the Risk Cone Helps Predict & Protect Your Retirement
                  </Text>
                  <View style={{ gap: 8, marginTop: 4 }}>
                    <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                      🛡️ <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Sequence-of-Returns Protection:</Text> Notice the early years of the cone (Years 1–5). Even if a P10 recession hits right as you retire, the 3-Bucket Strategy draws living expenses exclusively from Bucket 1 (Cash floor) and Bucket 2 (Fixed Income), completely shielding Bucket 3 equities from panic selling at market bottoms.
                    </Text>
                    <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                      🎛️ <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Dynamic Withdrawal Tuning:</Text> If the bottom P10 red dashed curve slopes downward toward zero in later years, you know your withdrawal rate is too aggressive for severe bear markets. Use the **Safe Range (±25k)** dropdown to lower your monthly draw by ₹5k–₹15k until the P10 curve turns upward into permanent sustainability!
                    </Text>
                  </View>
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

            {activeTab === 'methodologies' && (
              <View style={styles.topicBlock}>
                {/* Executive Overview */}
                <View
                  style={[
                    styles.executiveSummaryCard,
                    {
                      backgroundColor: colors.accent + '12',
                      borderColor: colors.accent + '40',
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <TrendingUp size={16} color={colors.accent} style={{ marginRight: 6 }} />
                    <Text style={[styles.executiveSummaryTitle, { color: colors.textPrimary }]}>
                      Wealth Management & Asset Growth Methodologies
                    </Text>
                  </View>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginBottom: 8 }]}>
                    While Monte Carlo simulations (which generate risk cones) are excellent for viewing probabilistic futures, wealth managers and institutional investors rely on several other core methods to analyze asset growth and plan portfolios.
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    These alternative methodologies focus on real-world history, deterministic stress testing, or structural life goals rather than random probability alone.
                  </Text>
                </View>

                {/* Core Analytical Methods Comparison Table */}
                <View
                  style={[
                    styles.cardItem,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                    ⚖️ Analytical Methods: Core Comparison
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginBottom: 10 }]}>
                    How institutional wealth managers select and apply each analytical lens:
                  </Text>

                  <View style={[styles.tableContainer, { borderColor: colors.borderSubtle }]}>
                    <View
                      style={[
                        styles.tableHeaderRow,
                        {
                          backgroundColor:
                            theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                          borderBottomColor: colors.borderSubtle,
                        },
                      ]}
                    >
                      <Text style={[styles.tableHeaderCell, { flex: 1.1, color: colors.textMuted }]}>
                        Method
                      </Text>
                      <Text style={[styles.tableHeaderCell, { flex: 1.4, color: colors.textMuted }]}>
                        What It Answers
                      </Text>
                      <Text style={[styles.tableHeaderCell, { flex: 1.5, color: colors.textMuted }]}>
                        Best Used For
                      </Text>
                    </View>

                    {/* Row 1: Monte Carlo */}
                    <View style={[styles.tableRow, { borderBottomColor: colors.borderSubtle }]}>
                      <View style={{ flex: 1.1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#38BDF8' }}>
                          Monte Carlo (Risk Cone)
                        </Text>
                      </View>
                      <Text style={[styles.tableCell, { flex: 1.4, color: colors.textSecondary }]}>
                        "What are the statistical odds of my money lasting?"
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.5, color: colors.textPrimary }]}>
                        Long-term retirement viability & sequence-of-returns bounds.
                      </Text>
                    </View>

                    {/* Row 2: Historical Backtesting */}
                    <View style={[styles.tableRow, { borderBottomColor: colors.borderSubtle }]}>
                      <View style={{ flex: 1.1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#F59E0B' }}>
                          Historical Backtesting
                        </Text>
                      </View>
                      <Text style={[styles.tableCell, { flex: 1.4, color: colors.textSecondary }]}>
                        "How would this exact portfolio survive 2008?"
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.5, color: colors.textPrimary }]}>
                        Strategy validation and reality checks against actual crashes.
                      </Text>
                    </View>

                    {/* Row 3: Rolling Returns */}
                    <View style={[styles.tableRow, { borderBottomColor: colors.borderSubtle }]}>
                      <View style={{ flex: 1.1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>
                          Rolling Returns
                        </Text>
                      </View>
                      <Text style={[styles.tableCell, { flex: 1.4, color: colors.textSecondary }]}>
                        "What is the typical experience of holding this for 5 years?"
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.5, color: colors.textPrimary }]}>
                        Measuring consistency and volatility decay over holding blocks.
                      </Text>
                    </View>

                    {/* Row 4: Stress Testing */}
                    <View style={[styles.tableRow, { borderBottomColor: colors.borderSubtle }]}>
                      <View style={{ flex: 1.1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#EC4899' }}>
                          Stress Testing
                        </Text>
                      </View>
                      <Text style={[styles.tableCell, { flex: 1.4, color: colors.textSecondary }]}>
                        "What happens if inflation doubles and stocks crash tomorrow?"
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.5, color: colors.textPrimary }]}>
                        Finding structural holes & verifying cash/debt buffer adequacy.
                      </Text>
                    </View>

                    {/* Row 5: Goals-Based Planning */}
                    <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                      <View style={{ flex: 1.1 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#8B5CF6' }}>
                          Goals-Based (GBWM)
                        </Text>
                      </View>
                      <Text style={[styles.tableCell, { flex: 1.4, color: colors.textSecondary }]}>
                        "Am I on track to pay for college and retire smoothly?"
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.5, color: colors.textPrimary }]}>
                        Personal financial alignment, milestone earmarking & behavioral discipline.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* In-depth 1: Historical Backtesting */}
                <View
                  style={[
                    styles.cardItem,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: '#F59E0B' }]}>
                    1. Historical Backtesting
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginBottom: 6 }]}>
                    Instead of simulating randomized future paths, backtesting applies your current asset allocation strategy directly to real historical market data.
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginBottom: 6 }]}>
                    <Text style={{ fontWeight: '700', color: colors.textPrimary }}>How it works: </Text>
                    You "wind back the clock" to a specific date (e.g. Jan 1, 2000 or Jan 1, 2008) and track how your 3-bucket portfolio would have survived through the Dot-Com crash, the 2008 Financial Crisis, or 1970s Stagflation.
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: '#10B981' }}>Key Benefit: </Text>
                    Grounds your retirement plan in actual lived history rather than theoretical equations, exposing how your cash buffer prevents distress selling at market bottoms.
                  </Text>
                </View>

                {/* In-depth 2: Rolling Returns Analysis */}
                <View
                  style={[
                    styles.cardItem,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: '#10B981' }]}>
                    2. Rolling Returns Analysis
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginBottom: 6 }]}>
                    A major flaw in standard point-to-point growth calculations is "sequence of returns risk" (the luck of the calendar year when you start). Rolling returns break down an investment timeline into overlapping blocks to eliminate this bias.
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginBottom: 6 }]}>
                    <Text style={{ fontWeight: '700', color: colors.textPrimary }}>How it works: </Text>
                    If you have 20 years of market data, a rolling 5-year analysis computes returns from Year 1–5, Year 2–6, Year 3–7, and so on.
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: '#10B981' }}>Key Benefit: </Text>
                    Reveals the frequency and statistical probability of achieving positive growth over a holding horizon, showing you the absolute worst, median, and best outcomes experienced historically.
                  </Text>
                </View>

                {/* In-depth 3: Deterministic Stress Testing */}
                <View
                  style={[
                    styles.cardItem,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: '#EC4899' }]}>
                    3. Deterministic Stress Testing (Scenario Analysis)
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginBottom: 6 }]}>
                    Unlike Monte Carlo's abstract percentage bands, deterministic stress testing models how a portfolio handles specific, hardcoded macroeconomic shocks.
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginBottom: 6 }]}>
                    <Text style={{ fontWeight: '700', color: colors.textPrimary }}>How it works: </Text>
                    Institutions hardcode parameters to simulate acute crises, e.g.: "What happens if inflation spikes to 8% and equities plunge 30% simultaneously?" or "How will this wealth cope with 1970s-style stagflation?"
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: '#10B981' }}>Key Benefit: </Text>
                    Helps investors identify structural vulnerabilities, proving whether Bucket 1 cash and Bucket 2 debt buffers are sufficient to weather macroeconomic shocks.
                  </Text>
                </View>

                {/* In-depth 4: Goals-Based Wealth Management */}
                <View
                  style={[
                    styles.cardItem,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: '#8B5CF6' }]}>
                    4. Goals-Based Wealth Management (GBWM)
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginBottom: 6 }]}>
                    Rather than focusing purely on maximizing return percentages or beating a market benchmark, Goals-Based Wealth Management structures your assets entirely around specific life milestones.
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary, marginBottom: 6 }]}>
                    <Text style={{ fontWeight: '700', color: colors.textPrimary }}>How it works: </Text>
                    Your wealth is segmented into different "buckets," each matched to a distinct timeframe:
                    {'\n'}• <Text style={{ fontWeight: '700', color: '#38BDF8' }}>Short-Term (1–3 years):</Text> High liquidity, ultra-low risk cash for living expenses and immediate needs.
                    {'\n'}• <Text style={{ fontWeight: '700', color: '#10B981' }}>Medium-Term (5–10 years):</Text> Moderate risk fixed income for college tuition and lifestyle upgrades.
                    {'\n'}• <Text style={{ fontWeight: '700', color: '#F59E0B' }}>Long-Term (15+ years):</Text> Aggressive growth equities for multi-generational wealth and lifelong retirement longevity.
                  </Text>
                  <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: '#10B981' }}>Key Benefit: </Text>
                    Prevents emotional panic during market downturns because you know your immediate cash needs and near-term milestones are insulated from volatile growth buckets.
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
    maxWidth: 680,
    maxHeight: '88%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  tabsContainer: {
    flexShrink: 0,
    marginBottom: 12,
    zIndex: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    flexGrow: 0,
  },
  tabChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
    minHeight: 200,
  },
  topicBlock: {
    gap: 12,
    paddingVertical: 4,
  },
  executiveSummaryCard: {
    borderRadius: 14,
    borderWidth: 1.2,
    padding: 14,
  },
  executiveSummaryTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  bulletItem: {
    fontSize: 12,
    lineHeight: 18,
  },
  highlightPill: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  highlightPillText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  subContextCard: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  subContextTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  tableContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
  },
  tableCell: {
    fontSize: 11,
    lineHeight: 16,
  },
  metricBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  metricBadgeText: {
    fontSize: 11,
    fontWeight: '800',
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
