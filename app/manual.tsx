import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookOpen,
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronUp,
  Shield,
  Sliders,
  Globe,
  Cpu,
  BarChart2,
  CheckCircle,
  Lightbulb,
  Zap,
  HelpCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react-native';
import { useTheme } from '../src/theme/ThemeContext';
import {
  USER_MANUAL_SECTIONS,
  USER_MANUAL_CATEGORIES,
  ManualSection,
} from '../src/data/userManualData';

const getSectionIcon = (iconName: string, color: string, size: number = 20) => {
  switch (iconName) {
    case 'Shield':
      return <Shield size={size} color={color} />;
    case 'Sliders':
      return <Sliders size={size} color={color} />;
    case 'Globe':
      return <Globe size={size} color={color} />;
    case 'Cpu':
      return <Cpu size={size} color={color} />;
    case 'BarChart2':
      return <BarChart2 size={size} color={color} />;
    default:
      return <BookOpen size={size} color={color} />;
  }
};

const getLevelColor = (level: 'Beginner' | 'Intermediate' | 'Advanced') => {
  switch (level) {
    case 'Beginner':
      return '#10B981';
    case 'Intermediate':
      return '#F59E0B';
    case 'Advanced':
      return '#8B5CF6';
  }
};

export default function ManualScreen() {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isCompact = windowWidth < 600;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSubsections, setExpandedSubsections] = useState<Record<string, boolean>>({
    philosophy_core_concept: true,
  });

  const toggleSubsection = (id: string) => {
    setExpandedSubsections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    USER_MANUAL_SECTIONS.forEach((sec) => {
      sec.subsections.forEach((sub) => {
        allIds[sub.id] = true;
      });
    });
    setExpandedSubsections(allIds);
  };

  const collapseAll = () => {
    setExpandedSubsections({});
  };

  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return USER_MANUAL_SECTIONS.map((section) => {
      const categoryMatch = activeCategory === 'all' || section.category === activeCategory;
      if (!categoryMatch && q.length === 0) return null;

      const matchingSubsections = section.subsections.filter((sub) => {
        if (!categoryMatch && q.length === 0) return false;
        if (!q) return true;

        const matchTitle = sub.title.toLowerCase().includes(q);
        const matchSummary = sub.summary.toLowerCase().includes(q);
        const matchContent = sub.contentParagraphs.some((p) => p.toLowerCase().includes(q));
        const matchTips = sub.keyRulesOrTips?.some((t) => t.toLowerCase().includes(q));
        const matchFormula = sub.formulaOrProtocol?.toLowerCase().includes(q);

        return matchTitle || matchSummary || matchContent || matchTips || matchFormula;
      });

      if (matchingSubsections.length === 0) return null;

      return {
        ...section,
        subsections: matchingSubsections,
      };
    }).filter(Boolean) as ManualSection[];
  }, [activeCategory, searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.surfaceCard, borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceElevated }]}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            In-App User Manual
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            3-Bucket Strategy Simulation App (v2.0)
          </Text>
        </View>

        <View style={[styles.versionBadge, { backgroundColor: colors.accent + '20' }]}>
          <Text style={[styles.versionBadgeText, { color: colors.accent }]}>v2.0</Text>
        </View>
      </View>

      <View style={[styles.mainBody, { maxWidth: 900, alignSelf: 'center', width: '100%' }]}>
        {/* Search Bar & Controls */}
        <View style={styles.searchAndControlsWrap}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search guide (e.g. SWR, Bear Defense, P10, Waterfall Refill)..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.accordionControlsRow}>
            <TouchableOpacity onPress={expandAll} style={styles.toggleTextBtn}>
              <Maximize2 size={12} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.toggleTextBtnLabel, { color: colors.accent }]}>Expand All</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.textMuted, marginHorizontal: 6 }}>•</Text>
            <TouchableOpacity onPress={collapseAll} style={styles.toggleTextBtn}>
              <Minimize2 size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
              <Text style={[styles.toggleTextBtnLabel, { color: colors.textMuted }]}>Collapse All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter Pills */}
        <View style={styles.categoriesBarWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
            {USER_MANUAL_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isActive ? colors.accent : colors.surfaceElevated,
                      borderColor: isActive ? colors.accent : colors.borderSubtle,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: isActive ? '#FFFFFF' : colors.textSecondary },
                      isActive && { fontWeight: '700' },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Content List */}
        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollListInner} showsVerticalScrollIndicator={true}>
          {filteredSections.length === 0 ? (
            <View style={styles.emptyStateWrap}>
              <HelpCircle size={44} color={colors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>
                No matching manual topics found
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: colors.textMuted }]}>
                Try searching for broader terms or switch to "All Guides".
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                style={[styles.resetSearchBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.resetSearchBtnText}>Show All Guides</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredSections.map((section) => (
              <View key={section.id} style={styles.sectionBlock}>
                {/* Section Title Header */}
                <View style={[styles.sectionHeaderBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
                  <View style={styles.sectionHeaderIconWrap}>
                    {getSectionIcon(section.iconName, colors.accent, 22)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                      {section.title}
                    </Text>
                    <Text style={[styles.sectionShortDesc, { color: colors.textMuted }]}>
                      {section.shortDesc}
                    </Text>
                  </View>
                </View>

                {/* Subsections Accordion */}
                <View style={styles.subsectionsList}>
                  {section.subsections.map((sub) => {
                    const isExpanded = !!expandedSubsections[sub.id];

                    return (
                      <View
                        key={sub.id}
                        style={[
                          styles.subsectionCard,
                          {
                            backgroundColor: colors.surfaceCard,
                            borderColor: isExpanded ? colors.accent + '40' : colors.borderSubtle,
                          },
                        ]}
                      >
                        <TouchableOpacity
                          onPress={() => toggleSubsection(sub.id)}
                          style={styles.subsectionHeader}
                          activeOpacity={0.7}
                        >
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <View style={styles.metaRow}>
                              <View
                                style={[
                                  styles.levelBadge,
                                  { backgroundColor: getLevelColor(sub.level) + '20' },
                                ]}
                              >
                                <Text style={[styles.levelBadgeText, { color: getLevelColor(sub.level) }]}>
                                  {sub.level}
                                </Text>
                              </View>
                              <Text style={[styles.readTimeText, { color: colors.textMuted }]}>
                                ⏱️ {sub.readTime}
                              </Text>
                            </View>
                            <Text style={[styles.subsectionTitle, { color: colors.textPrimary }]}>
                              {sub.title}
                            </Text>
                            {!isExpanded && (
                              <Text
                                style={[styles.subsectionSummaryCollapsed, { color: colors.textMuted }]}
                                numberOfLines={2}
                              >
                                {sub.summary}
                              </Text>
                            )}
                          </View>

                          <View
                            style={[
                              styles.chevronBadge,
                              { backgroundColor: isExpanded ? colors.accent + '20' : colors.surfaceElevated },
                            ]}
                          >
                            {isExpanded ? (
                              <ChevronUp size={16} color={colors.accent} />
                            ) : (
                              <ChevronDown size={16} color={colors.textSecondary} />
                            )}
                          </View>
                        </TouchableOpacity>

                        {/* Expanded Subsection Content */}
                        {isExpanded && (
                          <View style={[styles.subsectionBody, { borderTopColor: colors.borderSubtle }]}>
                            {/* Highlight Summary */}
                            <View style={[styles.summaryCallout, { backgroundColor: colors.accent + '12', borderColor: colors.accent + '30' }]}>
                              <Lightbulb size={16} color={colors.accent} style={{ marginRight: 8, marginTop: 2 }} />
                              <Text style={[styles.summaryCalloutText, { color: colors.textPrimary }]}>
                                {sub.summary}
                              </Text>
                            </View>

                            {/* Paragraphs */}
                            {sub.contentParagraphs.map((para, pIdx) => (
                              <Text key={pIdx} style={[styles.paragraphText, { color: colors.textSecondary }]}>
                                {para}
                              </Text>
                            ))}

                            {/* Key Rules or Tips Box */}
                            {sub.keyRulesOrTips && sub.keyRulesOrTips.length > 0 && (
                              <View style={[styles.tipsBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
                                <Text style={[styles.tipsBoxTitle, { color: colors.accent }]}>
                                  📌 Key Rules & Execution Tips
                                </Text>
                                {sub.keyRulesOrTips.map((tip, tIdx) => (
                                  <View key={tIdx} style={styles.tipItemRow}>
                                    <CheckCircle size={14} color="#10B981" style={{ marginRight: 6, marginTop: 2 }} />
                                    <Text style={[styles.tipItemText, { color: colors.textPrimary }]}>
                                      {tip}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}

                            {/* Formula or Protocol Box */}
                            {sub.formulaOrProtocol && (
                              <View style={[styles.formulaBox, { backgroundColor: '#8B5CF612', borderColor: '#8B5CF635' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                  <Zap size={14} color="#8B5CF6" style={{ marginRight: 6 }} />
                                  <Text style={[styles.formulaBoxTitle, { color: '#8B5CF6' }]}>
                                    Mathematical Logic / Protocol Trigger
                                  </Text>
                                </View>
                                <Text style={[styles.formulaBoxCode, { color: colors.textPrimary }]}>
                                  {sub.formulaOrProtocol}
                                </Text>
                              </View>
                            )}

                            {/* Step-by-Step App Actions */}
                            {sub.appActionGuide && sub.appActionGuide.length > 0 && (
                              <View style={[styles.actionsBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
                                <Text style={[styles.actionsBoxTitle, { color: colors.textPrimary }]}>
                                  📱 How to perform this in the app:
                                </Text>
                                {sub.appActionGuide.map((act) => (
                                  <View key={act.step} style={styles.actionStepRow}>
                                    <View style={[styles.actionStepBadge, { backgroundColor: colors.accent }]}>
                                      <Text style={styles.actionStepBadgeText}>{act.step}</Text>
                                    </View>
                                    <Text style={[styles.actionStepInstruction, { color: colors.textSecondary }]}>
                                      {act.instruction}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  versionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  versionBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  mainBody: {
    flex: 1,
  },
  searchAndControlsWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  accordionControlsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
    paddingRight: 4,
  },
  toggleTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  toggleTextBtnLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoriesBarWrap: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollList: {
    flex: 1,
  },
  scrollListInner: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  sectionBlock: {
    marginBottom: 10,
  },
  sectionHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  sectionHeaderIconWrap: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionShortDesc: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  subsectionsList: {
    gap: 10,
  },
  subsectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  subsectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  readTimeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  subsectionSummaryCollapsed: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  chevronBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subsectionBody: {
    borderTopWidth: 1,
    padding: 14,
    gap: 12,
  },
  summaryCallout: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryCalloutText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    flex: 1,
  },
  paragraphText: {
    fontSize: 13,
    lineHeight: 20,
  },
  tipsBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  tipsBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  tipItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipItemText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  formulaBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  formulaBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  formulaBoxCode: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  actionsBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  actionsBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  actionStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionStepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  actionStepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionStepInstruction: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  emptyStateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 18,
  },
  resetSearchBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetSearchBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
