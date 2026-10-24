import React, { useState } from 'react';
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
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

interface DatePickerInputProps {
  value: string; // e.g. "01/01/2026"
  onChange: (val: string) => void;
  label?: string;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  label = 'Start Date',
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'days' | 'years' | 'months'>('days');

  const parseDate = (str: string) => {
    if (!str) return new Date();
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m, d);
      }
    }
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const initialDate = parseDate(value);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Full year list from 1970 to 2085
  const fullYearList = Array.from({ length: 116 }, (_, i) => 1970 + i);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOffset = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const offset = getFirstDayOffset(viewYear, viewMonth);

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const dd = String(day).padStart(2, '0');
    const mm = String(viewMonth + 1).padStart(2, '0');
    const yyyy = viewYear;
    onChange(`${dd}/${mm}/${yyyy}`);
    setModalVisible(false);
  };

  const openPicker = () => {
    const current = parseDate(value);
    setViewYear(current.getFullYear());
    setViewMonth(current.getMonth());
    setSelectedDay(current.getDate());
    setPickerMode('days');
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBg,
            borderColor: colors.inputBorder,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChange}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={colors.textMuted}
          keyboardType="numbers-and-punctuation"
        />

        <TouchableOpacity
          style={[styles.calendarIconBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={openPicker}
          activeOpacity={0.7}
        >
          <Calendar size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
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
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {pickerMode === 'years'
                    ? 'Select Year (1970–2085)'
                    : pickerMode === 'months'
                    ? 'Select Month'
                    : 'Select Start Date'}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  {pickerMode === 'years'
                    ? 'Instant decade jump without scrolling'
                    : 'Simulation start date'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Quick Mode Navigation Header */}
            <View style={[styles.navRow, { borderColor: colors.borderSubtle }]}>
              {pickerMode === 'days' ? (
                <>
                  <TouchableOpacity
                    onPress={handlePrevMonth}
                    style={[styles.navArrow, { backgroundColor: colors.surfaceElevated }]}
                  >
                    <ChevronLeft size={18} color={colors.textPrimary} />
                  </TouchableOpacity>

                  {/* Dropdown Chip Buttons */}
                  <View style={styles.selectorsRow}>
                    <TouchableOpacity
                      onPress={() => setPickerMode('months')}
                      style={[styles.dropdownChip, { backgroundColor: colors.surfaceElevated }]}
                    >
                      <Text style={[styles.dropdownChipText, { color: colors.textPrimary }]}>
                        {monthNames[viewMonth]}
                      </Text>
                      <ChevronDown size={14} color={colors.accent} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setPickerMode('years')}
                      style={[styles.dropdownChip, { backgroundColor: colors.surfaceElevated }]}
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
                  {fullYearList.map((yr) => {
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
                {monthNames.map((mName, idx) => {
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
              /* View Mode 3: Days Grid */
              <>
                <View style={styles.weekdaysRow}>
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((w, idx) => (
                    <Text key={idx} style={[styles.weekdayText, { color: colors.textMuted }]}>
                      {w}
                    </Text>
                  ))}
                </View>

                <View style={styles.daysGrid}>
                  {Array.from({ length: offset }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.dayCellEmpty} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const isSelected =
                      dayNum === selectedDay &&
                      viewMonth === initialDate.getMonth() &&
                      viewYear === initialDate.getFullYear();

                    return (
                      <TouchableOpacity
                        key={`day-${dayNum}`}
                        onPress={() => handleSelectDay(dayNum)}
                        style={[
                          styles.dayCell,
                          isSelected && { backgroundColor: colors.accent },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {dayNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Footer */}
            <View style={[styles.footerRow, { borderTopColor: colors.borderSubtle }]}>
              {pickerMode !== 'days' ? (
                <TouchableOpacity
                  style={[styles.todayBtn, { borderColor: colors.border }]}
                  onPress={() => setPickerMode('days')}
                >
                  <Text style={[styles.todayBtnText, { color: colors.textSecondary }]}>
                    ← Back to Calendar
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.todayBtn, { borderColor: colors.border }]}
                  onPress={() => {
                    const now = new Date();
                    setViewYear(now.getFullYear());
                    setViewMonth(now.getMonth());
                    handleSelectDay(now.getDate());
                  }}
                >
                  <Text style={[styles.todayBtnText, { color: colors.accent }]}>Today</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  const dd = String(selectedDay).padStart(2, '0');
                  const mm = String(viewMonth + 1).padStart(2, '0');
                  onChange(`${dd}/${mm}/${viewYear}`);
                  setModalVisible(false);
                }}
              >
                <Check size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.doneBtnText}>Confirm</Text>
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
    marginVertical: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputContainer: {
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
  calendarIconBtn: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 12,
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
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dropdownChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  decadeNavRow: {
    flex: 1,
    alignItems: 'center',
  },
  decadeRangeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  yearScrollList: {
    maxHeight: 250,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 6,
  },
  yearGridItem: {
    width: '23%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
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
    paddingVertical: 8,
  },
  monthGridItem: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  monthGridItemText: {
    fontSize: 14,
    fontWeight: '700',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
  },
  dayCellEmpty: {
    width: 38,
    height: 38,
    marginVertical: 3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  todayBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  todayBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
