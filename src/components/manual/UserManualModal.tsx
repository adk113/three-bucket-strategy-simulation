import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  BookOpen,
  X,
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
import { useTheme } from '../../theme/ThemeContext';
import {
  USER_MANUAL_SECTIONS,
  USER_MANUAL_CATEGORIES,
  ManualSection,
  ManualSubSection,
} from '../../data/userManualData';

interface UserManualModalProps {
  visible: boolean;
  onClose: () => void;
  initialCategory?: string;
  initialSearchQuery?: string;
}

const getSectionIcon = (iconName: string, color: string, size: number = 18) => {
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

export const UserManualModal: React.FC<UserManualModalProps> = ({
  visible,
  onClose,
  initialCategory = 'all',
  initialSearchQuery = '',
}) => {
  const { colors, theme } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLandscape = windowWidth > windowHeight;
  const isCompact = windowWidth < 600;

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [expandedSubsections, setExpandedSubsections] = useState<Record<string, boolean>>({
    philosophy_core_concept: true, // Default first subsection open
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

  // Filter sections and subsections based on active category and search query
  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return USER_MANUAL_SECTIONS.map((section) => {
      // Category match
      const categoryMatch = activeCategory === 'all' || section.category === activeCategory;
      if (!categoryMatch && q.length === 0) return null;

      // Filter subsections
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
              width: isCompact ? '96%' : Math.min(windowWidth - 40, 860),
              maxHeight: isLandscape ? '95%' : '90%',
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.headerTitleWrap}>
              <View style={[styles.headerIconBadge, { backgroundColor: colors.accent + '20' }]}>
                <BookOpen size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                  3-Bucket In-App User Manual
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                  Architecture v2.0 • Interactive Operating Guide
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.surfaceElevated }]}
              activeOpacity={0.7}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Bar & Global Accordion Controls */}
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
                placeholder="Search manual (e.g. SWR, Bear Defense, P10, Waterfall)..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={14} color={colors.textMuted} />
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

          {/* Main Manual Scrollable Content */}
          <ScrollView
            style={styles.contentScrollView}
            contentContainerStyle={styles.contentScrollInner}
            showsVerticalScrollIndicator={true}
          >
            {filteredSections.length === 0 ? (
              <View style={styles.emptyStateWrap}>
                <HelpCircle size={40} color={colors.textMuted} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>
                  No matching manual topics found
                </Text>
                <Text style={[styles.emptyStateSubtitle, { color: colors.textMuted }]}>
                  Try clearing your search query "{searchQuery}" or select "All Guides".
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  style={[styles.resetSearchBtn, { backgroundColor: colors.accent }]}
                >
                  <Text style={styles.resetSearchBtnText}>Reset Search Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredSections.map((section) => (
                <View key={section.id} style={styles.sectionBlock}>
                  {/* Section Title Header */}
                  <View style={[styles.sectionHeaderBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
                    <View style={styles.sectionHeaderIconWrap}>
                      {getSectionIcon(section.iconName, colors.accent, 20)}
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
                              backgroundColor: colors.surfaceElevated,
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
                                { backgroundColor: isExpanded ? colors.accent + '20' : colors.surfaceCard },
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
                                <View style={[styles.tipsBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
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
                                <View style={[styles.actionsBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
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

          {/* Footer Bar */}
          <View style={[styles.footerBar, { borderTopColor: colors.borderSubtle }]}>
            <Text style={[styles.footerVersionText, { color: colors.textMuted }]}>
              3-Bucket Strategy Simulation • Engine v2.0
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.footerCloseBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
            >
              <Text style={styles.footerCloseBtnText}>Done Reading</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  headerIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
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
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentScrollView: {
    flex: 1,
  },
  contentScrollInner: {
    padding: 16,
    gap: 16,
  },
  sectionBlock: {
    marginBottom: 8,
  },
  sectionHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  sectionHeaderIconWrap: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionShortDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  subsectionsList: {
    gap: 8,
  },
  subsectionCard: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  subsectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
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
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  subsectionSummaryCollapsed: {
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15,
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
    padding: 12,
    gap: 10,
  },
  summaryCallout: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryCalloutText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    flex: 1,
  },
  paragraphText: {
    fontSize: 12,
    lineHeight: 18,
  },
  tipsBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
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
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  formulaBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  formulaBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  formulaBoxCode: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  actionsBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
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
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 1,
  },
  actionStepBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionStepInstruction: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  emptyStateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  resetSearchBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resetSearchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerVersionText: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  footerCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
