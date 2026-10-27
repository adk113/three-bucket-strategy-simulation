import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  ChevronDown,
  Sparkles,
  Edit3,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

interface DatePickerInputProps {
  value: string; // e.g. "01/01/2026"
  onChange: (val: string) => void;
  label?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// 1970 to 2085 coverage for multi-decade retirement scenarios
const FULL_YEAR_LIST = Array.from({ length: 116 }, (_, i) => 1970 + i);

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  label = 'Retirement Start Date',
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'days' | 'years' | 'months'>('days');
  const [isManualTyping, setIsManualTyping] = useState(false);
  const [manualInputVal, setManualInputVal] = useState(value);

  // Parse DD/MM/YYYY or YYYY-MM-DD
  const parseDate = (str: string): Date => {
    if (!str) return new Date();
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          return new Date(y, m, d);
        }
      }
    } else if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m, d);
        } else {
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const y = parseInt(parts[2], 10);
          if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m, d);
        }
      }
    }
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const activeDate = useMemo(() => parseDate(value), [value]);
  const [viewYear, setViewYear] = useState<number>(activeDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(activeDate.getMonth()); // 0-11
  const [selectedDay, setSelectedDay] = useState<number>(activeDate.getDate());

  const openPicker = () => {
    const current = parseDate(value);
    setViewYear(current.getFullYear());
    setViewMonth(current.getMonth());
    setSelectedDay(current.getDate());
    setManualInputVal(value);
    setPickerMode('days');
    setIsManualTyping(false);
    setModalVisible(true);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  const offset = useMemo(() => {
    // 0 = Sunday, 1 = Monday...
    const day = new Date(viewYear, viewMonth, 1).getDay();
    // Transform to Monday-first (0 = Monday, 6 = Sunday)
    return day === 0 ? 6 : day - 1;
  }, [viewYear, viewMonth]);

  const applySelectedDate = (day: number, month: number, year: number) => {
    const dd = String(day).padStart(2, '0');
    const mm = String(month + 1).padStart(2, '0');
    const yyyy = year;
    const formatted = `${dd}/${mm}/${yyyy}`;
    onChange(formatted);
    setModalVisible(false);
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    applySelectedDate(day, viewMonth, viewYear);
  };

  const handleApplyPreset = (targetDate: Date) => {
    const d = targetDate.getDate();
    const m = targetDate.getMonth();
    const y = targetDate.getFullYear();
    setViewYear(y);
    setViewMonth(m);
    setSelectedDay(d);
    applySelectedDate(d, m, y);
  };

  // Friendly human format: e.g. "01 Jan 2026"
  const friendlyLabel = useMemo(() => {
    const d = parseDate(value);
    const day = String(d.getDate()).padStart(2, '0');
    const m = MONTH_NAMES[d.getMonth()]?.slice(0, 3) || 'Jan';
    const yr = d.getFullYear();
    return `${day} ${m} ${yr}`;
  }, [value]);

  const today = new Date();
  const nextYearJan1 = new Date(today.getFullYear() + 1, 0, 1);
  const in3Years = new Date(today.getFullYear() + 3, 0, 1);
  const in5Years = new Date(today.getFullYear() + 5, 0, 1);

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      ) : null}

      {/* Main Interactive Trigger: Clean date on left, standalone Calendar icon on right */}
      <TouchableOpacity
        style={[
          styles.triggerBtn,
          {
            backgroundColor: colors.inputBg,
            borderColor: colors.inputBorder,
          },
        ]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <Text style={[styles.mainDateText, { color: colors.textPrimary }]}>
          {value || '01/01/2026'}
        </Text>

        <View
          style={[
            styles.calendarIconButton,
            { backgroundColor: colors.accent + '18', borderColor: colors.accent + '35' },
          ]}
        >
          <Calendar size={16} color={colors.accent} />
        </View>
      </TouchableOpacity>

      {/* Calendar Modal Popup */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
                shadowColor: colors.cardShadow,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Calendar size={18} color={colors.accent} style={{ marginRight: 6 }} />
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    Retirement Start Date
                  </Text>
                </View>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Select your retirement milestone date for all multi-bucket models
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
                activeOpacity={0.7}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Current Selected Date Hero Banner */}
            <View
              style={[
                styles.selectedHeroBanner,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
              ]}
            >
              <View>
                <Text style={[styles.selectedHeroLabel, { color: colors.textMuted }]}>
                  Retirement Milestone
                </Text>
                <Text style={[styles.selectedHeroDate, { color: colors.textPrimary }]}>
                  {String(selectedDay).padStart(2, '0')} {MONTH_NAMES[viewMonth]} {viewYear}
                </Text>
              </View>
              <View
                style={[
                  styles.yearPillBadge,
                  { backgroundColor: colors.accent + '22', borderColor: colors.accent },
                ]}
              >
                <Text style={[styles.yearPillBadgeText, { color: colors.accent }]}>
                  Year 1 ({viewYear})
                </Text>
              </View>
            </View>

            {/* Quick Presets for Retirement Planning */}
            <View style={styles.presetSection}>
              <Text style={[styles.presetTitle, { color: colors.textMuted }]}>
                Quick Presets:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                <TouchableOpacity
                  onPress={() => handleApplyPreset(today)}
                  style={[styles.presetChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetChipText, { color: colors.textPrimary }]}>Today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleApplyPreset(nextYearJan1)}
                  style={[styles.presetChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                  activeOpacity={0.7}
                >
                  <Sparkles size={11} color={colors.accent} style={{ marginRight: 4 }} />
                  <Text style={[styles.presetChipText, { color: colors.accent }]}>
                    Next Jan 1 ({nextYearJan1.getFullYear()})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleApplyPreset(in3Years)}
                  style={[styles.presetChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetChipText, { color: colors.textSecondary }]}>
                    In 3Y ({in3Years.getFullYear()})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleApplyPreset(in5Years)}
                  style={[styles.presetChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetChipText, { color: colors.textSecondary }]}>
                    In 5Y ({in5Years.getFullYear()})
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Navigation Header (Prev Month, Month Selector, Year Selector, Next Month) */}
            <View style={[styles.navRow, { borderColor: colors.borderSubtle }]}>
              {pickerMode === 'days' ? (
                <>
                  <TouchableOpacity
                    onPress={handlePrevMonth}
                    style={[styles.navArrow, { backgroundColor: colors.surfaceElevated }]}
                    activeOpacity={0.7}
                  >
                    <ChevronLeft size={18} color={colors.textPrimary} />
                  </TouchableOpacity>

                  {/* Dropdown Chip Buttons */}
                  <View style={styles.selectorsRow}>
                    <TouchableOpacity
                      onPress={() => setPickerMode('months')}
                      style={[styles.dropdownChip, { backgroundColor: colors.surfaceElevated }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dropdownChipText, { color: colors.textPrimary }]}>
                        {MONTH_NAMES[viewMonth]}
                      </Text>
                      <ChevronDown size={14} color={colors.accent} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setPickerMode('years')}
                      style={[styles.dropdownChip, { backgroundColor: colors.surfaceElevated }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dropdownChipText, { color: colors.textPrimary }]}>
                        {viewYear}
                      </Text>
                      <ChevronDown size={14} color={colors.accent} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={handleNextMonth}
                    style={[styles.navArrow, { backgroundColor: colors.surfaceElevated }]}
                    activeOpacity={0.7}
                  >
                    <ChevronRight size={18} color={colors.textPrimary} />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.decadeNavRow}>
                  <Text style={[styles.decadeRangeText, { color: colors.textPrimary }]}>
                    {pickerMode === 'years' ? `Choose Year (Currently: ${viewYear})` : 'Choose Month'}
                  </Text>
                </View>
              )}
            </View>

            {/* View Mode 1: Fast Year Selection List (1970–2085) */}
            {pickerMode === 'years' ? (
              <ScrollView style={styles.yearScrollList} showsVerticalScrollIndicator={true}>
                <View style={styles.yearGrid}>
                  {FULL_YEAR_LIST.map((yr) => {
                    const isSelected = yr === viewYear;
                    return (
                      <TouchableOpacity
                        key={yr}
                        onPress={() => {
                          setViewYear(yr);
                          setPickerMode('days');
                        }}
                        style={[
                          styles.yearGridItem,
                          {
                            backgroundColor: isSelected ? colors.accent : colors.surfaceElevated,
                            borderColor: isSelected ? colors.accent : colors.borderSubtle,
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.yearGridItemText,
                            { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                          ]}
                        >
                          {yr}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            ) : pickerMode === 'months' ? (
              /* View Mode 2: Month Grid */
              <View style={styles.gridContainer}>
                {MONTH_NAMES.map((mName, idx) => {
                  const isSelected = idx === viewMonth;
                  return (
                    <TouchableOpacity
                      key={mName}
                      onPress={() => {
                        setViewMonth(idx);
                        setPickerMode('days');
                      }}
                      style={[
                        styles.monthGridItem,
                        {
                          backgroundColor: isSelected ? colors.accent : colors.surfaceElevated,
                          borderColor: isSelected ? colors.accent : colors.borderSubtle,
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.monthGridItemText,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {mName.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              /* View Mode 3: Days Grid (Uniform 14.28% 7-Column Layout) */
              <View style={styles.calendarBody}>
                {/* Weekday Columns Header */}
                <View style={styles.weekdaysRow}>
                  {WEEKDAY_NAMES.map((w, idx) => (
                    <Text key={idx} style={[styles.weekdayText, { color: colors.textMuted }]}>
                      {w}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                  {Array.from({ length: offset }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.dayCellWrapper}>
                      <View style={styles.dayCellEmpty} />
                    </View>
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const isSelected =
                      dayNum === selectedDay &&
                      viewMonth === activeDate.getMonth() &&
                      viewYear === activeDate.getFullYear();

                    const isToday =
                      dayNum === today.getDate() &&
                      viewMonth === today.getMonth() &&
                      viewYear === today.getFullYear();

                    return (
                      <View key={`day-wrap-${dayNum}`} style={styles.dayCellWrapper}>
                        <TouchableOpacity
                          onPress={() => handleSelectDay(dayNum)}
                          style={[
                            styles.dayCell,
                            { backgroundColor: isSelected ? colors.accent : 'transparent' },
                            isToday && !isSelected && {
                              borderWidth: 1.5,
                              borderColor: colors.accent,
                            },
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              {
                                color: isSelected
                                  ? '#FFFFFF'
                                  : isToday
                                  ? colors.accent
                                  : colors.textPrimary,
                                fontWeight: isSelected || isToday ? '700' : '500',
                              },
                            ]}
                          >
                            {dayNum}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Manual Typing Toggle Option */}
            <View style={styles.manualEntrySection}>
              {isManualTyping ? (
                <View style={styles.manualInputRow}>
                  <TextInput
                    style={[
                      styles.manualInput,
                      {
                        color: colors.textPrimary,
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                    value={manualInputVal}
                    onChangeText={setManualInputVal}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numbers-and-punctuation"
                  />
                  <TouchableOpacity
                    style={[styles.manualApplyBtn, { backgroundColor: colors.accent }]}
                    onPress={() => {
                      if (manualInputVal.trim()) {
                        onChange(manualInputVal.trim());
                        setModalVisible(false);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Check size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsManualTyping(true)}
                  style={styles.toggleManualBtn}
                  activeOpacity={0.7}
                >
                  <Edit3 size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                  <Text style={[styles.toggleManualText, { color: colors.textMuted }]}>
                    Type date manually (DD/MM/YYYY)
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Footer Buttons */}
            <View style={[styles.footerRow, { borderTopColor: colors.borderSubtle }]}>
              {pickerMode !== 'days' ? (
                <TouchableOpacity
                  style={[styles.todayBtn, { borderColor: colors.border }]}
                  onPress={() => setPickerMode('days')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.todayBtnText, { color: colors.textSecondary }]}>
                    ← Back to Calendar
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.todayBtn, { borderColor: colors.border }]}
                  onPress={() => handleApplyPreset(today)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.todayBtnText, { color: colors.accent }]}>
                    Set to Today
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: colors.accent }]}
                onPress={() => applySelectedDate(selectedDay, viewMonth, viewYear)}
                activeOpacity={0.8}
              >
                <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.doneBtnText}>Confirm Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  mainDateText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'System',
    letterSpacing: 0.3,
  },
  calendarIconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '92%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 18,
    marginLeft: 8,
  },
  selectedHeroBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  selectedHeroLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedHeroDate: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  yearPillBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  yearPillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  presetSection: {
    marginBottom: 12,
  },
  presetTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  presetScroll: {
    flexDirection: 'row',
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  navArrow: {
    padding: 8,
    borderRadius: 10,
  },
  selectorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  decadeNavRow: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  decadeRangeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  calendarBody: {
    marginVertical: 4,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellWrapper: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  dayCell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellEmpty: {
    width: 34,
    height: 34,
  },
  dayText: {
    fontSize: 13,
    fontFamily: 'System',
  },
  yearScrollList: {
    maxHeight: 240,
    marginVertical: 6,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  yearGridItem: {
    width: '23%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  yearGridItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 10,
  },
  monthGridItem: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  monthGridItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  manualEntrySection: {
    marginTop: 8,
    paddingTop: 8,
  },
  toggleManualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  toggleManualText: {
    fontSize: 11,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  manualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  manualInput: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  manualApplyBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  todayBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  todayBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
