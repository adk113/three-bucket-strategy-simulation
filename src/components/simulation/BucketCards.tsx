import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wallet, ShieldCheck, TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { PALETTE } from '../../theme/colors';
import { SupportedCountry, formatCurrency } from '../../utils/currency';

interface BucketCardsProps {
  initialCorpus: number;
  split: {
    bucket1: number;
    bucket2: number;
    bucket3: number;
  };
  b1Years: number;
  b2Years: number;
  baseCountry?: SupportedCountry;
  onSelectBucket?: (bucketNum: 1 | 2 | 3) => void;
}

export const BucketCards: React.FC<BucketCardsProps> = ({
  initialCorpus,
  split,
  b1Years,
  b2Years,
  baseCountry = 'IN',
  onSelectBucket,
}) => {
  const { colors, theme } = useTheme();

  const total = Math.max(1, split.bucket1 + split.bucket2 + split.bucket3);
  const p1 = Math.round((split.bucket1 / total) * 100);
  const p2 = Math.round((split.bucket2 / total) * 100);
  const p3 = Math.max(0, 100 - p1 - p2);

  const formatAmount = (val: number) => formatCurrency(val, baseCountry);

  return (
    <View style={styles.container}>
      {/* Allocation Distribution Bar */}
      <View style={styles.barSection}>
        <View style={styles.barLabelsRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Target Allocation Split
          </Text>
          <Text style={[styles.totalText, { color: colors.textSecondary }]}>
            Total: {formatAmount(initialCorpus)}
          </Text>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}>
          <View style={[styles.progressFill, { width: `${p1}%`, backgroundColor: PALETTE.bucket1.base }]} />
          <View style={[styles.progressFill, { width: `${p2}%`, backgroundColor: PALETTE.bucket2.base }]} />
          <View style={[styles.progressFill, { width: `${p3}%`, backgroundColor: PALETTE.bucket3.base }]} />
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PALETTE.bucket1.base }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              B1 (Cash): {p1}%
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PALETTE.bucket2.base }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              B2 (Income): {p2}%
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PALETTE.bucket3.base }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              B3 (Growth): {p3}%
            </Text>
          </View>
        </View>
      </View>

      {/* 3 Bucket Cards Grid */}
      <View style={styles.cardsRow}>
        {/* Bucket 1 */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onSelectBucket?.(1)}
          style={[
            styles.card,
            {
              backgroundColor: theme === 'dark' ? PALETTE.bucket1.bgDark : PALETTE.bucket1.bgLight,
              borderColor: PALETTE.bucket1.borderDark,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconPill, { backgroundColor: PALETTE.bucket1.base }]}>
              <Wallet size={16} color="#FFFFFF" />
            </View>
            <View style={[styles.yearBadge, { backgroundColor: PALETTE.bucket1.base }]}>
              <Text style={styles.yearBadgeText}>Years 1–{b1Years}</Text>
            </View>
          </View>

          <Text style={[styles.bucketTitle, { color: PALETTE.bucket1.base }]}>
            Bucket 1: Cash
          </Text>
          <Text style={[styles.bucketSubtitle, { color: colors.textMuted }]}>
            Zero-risk living liquidity
          </Text>

          <Text style={[styles.bucketAmount, { color: colors.textPrimary }]}>
            {formatAmount(split.bucket1)}
          </Text>

          <View style={[styles.infoRow, { borderTopColor: colors.borderSubtle }]}>
            <Text style={[styles.infoKey, { color: colors.textMuted }]}>Horizon:</Text>
            <Text style={[styles.infoVal, { color: colors.textSecondary }]}>
              {b1Years} Yrs Living Expenses
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: colors.textMuted }]}>Instruments:</Text>
            <Text style={[styles.infoVal, { color: colors.textSecondary }]}>
              {baseCountry === 'IN' ? 'Liquid Funds, T-Bills' : 'T-Bills, Money Market'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bucket 2 */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onSelectBucket?.(2)}
          style={[
            styles.card,
            {
              backgroundColor: theme === 'dark' ? PALETTE.bucket2.bgDark : PALETTE.bucket2.bgLight,
              borderColor: PALETTE.bucket2.borderDark,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconPill, { backgroundColor: PALETTE.bucket2.base }]}>
              <ShieldCheck size={16} color="#FFFFFF" />
            </View>
            <View style={[styles.yearBadge, { backgroundColor: PALETTE.bucket2.base }]}>
              <Text style={styles.yearBadgeText}>Years {b1Years + 1}–{b1Years + b2Years}</Text>
            </View>
          </View>

          <Text style={[styles.bucketTitle, { color: PALETTE.bucket2.base }]}>
            Bucket 2: Stable
          </Text>
          <Text style={[styles.bucketSubtitle, { color: colors.textMuted }]}>
            Income & Shock Absorber
          </Text>

          <Text style={[styles.bucketAmount, { color: colors.textPrimary }]}>
            {formatAmount(split.bucket2)}
          </Text>

          <View style={[styles.infoRow, { borderTopColor: colors.borderSubtle }]}>
            <Text style={[styles.infoKey, { color: colors.textMuted }]}>Horizon:</Text>
            <Text style={[styles.infoVal, { color: colors.textSecondary }]}>
              {b2Years} Yrs Buffer
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: colors.textMuted }]}>Instruments:</Text>
            <Text style={[styles.infoVal, { color: colors.textSecondary }]}>
              {baseCountry === 'IN' ? 'Corporate Bonds, SDLs' : 'BND, TIPS, Gilts'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bucket 3 */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onSelectBucket?.(3)}
          style={[
            styles.card,
            {
              backgroundColor: theme === 'dark' ? PALETTE.bucket3.bgDark : PALETTE.bucket3.bgLight,
              borderColor: PALETTE.bucket3.borderDark,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconPill, { backgroundColor: PALETTE.bucket3.base }]}>
              <TrendingUp size={16} color="#FFFFFF" />
            </View>
            <View style={[styles.yearBadge, { backgroundColor: PALETTE.bucket3.base }]}>
              <Text style={styles.yearBadgeText}>Years {b1Years + b2Years + 1}+</Text>
            </View>
          </View>

          <Text style={[styles.bucketTitle, { color: PALETTE.bucket3.base }]}>
            Bucket 3: Growth
          </Text>
          <Text style={[styles.bucketSubtitle, { color: colors.textMuted }]}>
            Inflation-beating Equities
          </Text>

          <Text style={[styles.bucketAmount, { color: colors.textPrimary }]}>
            {formatAmount(split.bucket3)}
          </Text>

          <View style={[styles.infoRow, { borderTopColor: colors.borderSubtle }]}>
            <Text style={[styles.infoKey, { color: colors.textMuted }]}>Horizon:</Text>
            <Text style={[styles.infoVal, { color: colors.textSecondary }]}>
              Long-term wealth engine
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: colors.textMuted }]}>Instruments:</Text>
            <Text style={[styles.infoVal, { color: colors.textSecondary }]}>
              {baseCountry === 'IN' ? 'Nifty 50, Flexi-Cap' : 'S&P 500, MSCI World'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  barSection: {
    marginBottom: 16,
  },
  barLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  totalText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressTrack: {
    height: 10,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginVertical: 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: 260,
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconPill: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  yearBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bucketTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  bucketSubtitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  bucketAmount: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoKey: {
    fontSize: 11,
    fontWeight: '500',
  },
  infoVal: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },
});
