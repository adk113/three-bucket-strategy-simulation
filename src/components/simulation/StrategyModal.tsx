import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Bookmark, FolderOpen, Trash2, X, Plus, Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { SavedStrategy, SimulationInputs } from '../../engine/types';
import {
  deleteSavedStrategy,
  getSavedStrategies,
  saveNewStrategy,
} from '../../storage/strategyStorage';

interface StrategyModalProps {
  visible: boolean;
  onClose: () => void;
  currentInputs: SimulationInputs;
  onLoadStrategy: (inputs: SimulationInputs) => void;
}

export const StrategyModal: React.FC<StrategyModalProps> = ({
  visible,
  onClose,
  currentInputs,
  onLoadStrategy,
}) => {
  const { colors, theme } = useTheme();
  const [strategies, setStrategies] = useState<SavedStrategy[]>([]);
  const [newStrategyName, setNewStrategyName] = useState('');
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('load');

  useEffect(() => {
    if (visible) {
      loadList();
    }
  }, [visible]);

  const loadList = async () => {
    const list = await getSavedStrategies();
    setStrategies(list);
  };

  const handleSave = async () => {
    if (!newStrategyName.trim()) {
      alert('Please enter a name for your strategy.');
      return;
    }
    await saveNewStrategy(newStrategyName.trim(), currentInputs);
    setNewStrategyName('');
    await loadList();
    setActiveTab('load');
  };

  const handleDelete = async (id: string) => {
    const updated = await deleteSavedStrategy(id);
    setStrategies(updated);
  };

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString()}`;
  };

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
              <FolderOpen size={20} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Strategy Manager (Offline)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Segmented Control */}
          <View style={[styles.segmentContainer, { backgroundColor: colors.surfaceElevated }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('load')}
              style={[
                styles.segmentBtn,
                activeTab === 'load' && { backgroundColor: colors.accent },
              ]}
            >
              <FolderOpen
                size={14}
                color={activeTab === 'load' ? '#FFFFFF' : colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.segmentText,
                  { color: activeTab === 'load' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                Saved Profiles ({strategies.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('save')}
              style={[
                styles.segmentBtn,
                activeTab === 'save' && { backgroundColor: colors.accent },
              ]}
            >
              <Bookmark
                size={14}
                color={activeTab === 'save' ? '#FFFFFF' : colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.segmentText,
                  { color: activeTab === 'save' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                Save Current Run
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === 'save' ? (
            <View style={styles.saveSection}>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                Snapshot your current corpus, monthly withdrawal, and ROI parameters to device storage.
              </Text>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Strategy Title
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="e.g. My Early Retirement Plan 2026"
                placeholderTextColor={colors.textMuted}
                value={newStrategyName}
                onChangeText={setNewStrategyName}
              />

              <View style={[styles.currentPreview, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[styles.previewHeading, { color: colors.textPrimary }]}>
                  Parameters to be saved:
                </Text>
                <Text style={[styles.previewDetail, { color: colors.textSecondary }]}>
                  • Initial Corpus: {formatAmount(currentInputs.initialCorpus)}
                </Text>
                <Text style={[styles.previewDetail, { color: colors.textSecondary }]}>
                  • Monthly Withdrawal: {formatAmount(currentInputs.monthlyWithdrawal)}
                </Text>
                <Text style={[styles.previewDetail, { color: colors.textSecondary }]}>
                  • Start Date: {currentInputs.startDate} | Inflation: {currentInputs.inflationRate}%
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveActionBtn, { backgroundColor: colors.accent }]}
              >
                <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveActionText}>Save to Device</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.listSection} showsVerticalScrollIndicator={false}>
              {strategies.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.strategyCard,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      onLoadStrategy(item.inputs);
                      onClose();
                    }}
                  >
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.itemDate, { color: colors.textMuted }]}>
                      Saved: {new Date(item.createdAt).toLocaleDateString()}
                    </Text>

                    <View style={styles.itemTagsRow}>
                      <View style={[styles.tagPill, { backgroundColor: colors.surfaceCard }]}>
                        <Text style={[styles.tagText, { color: colors.accent }]}>
                          Corpus: {formatAmount(item.inputs.initialCorpus)}
                        </Text>
                      </View>
                      <View style={[styles.tagPill, { backgroundColor: colors.surfaceCard }]}>
                        <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                          Withdrawal: {formatAmount(item.inputs.monthlyWithdrawal)}/mo
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      onPress={() => {
                        onLoadStrategy(item.inputs);
                        onClose();
                      }}
                      style={[styles.loadBtn, { backgroundColor: colors.accent }]}
                    >
                      <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.loadBtnText}>Load</Text>
                    </TouchableOpacity>

                    {!item.id.startsWith('preset_') && (
                      <TouchableOpacity
                        onPress={() => handleDelete(item.id)}
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
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
    maxWidth: 520,
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  saveSection: {
    paddingVertical: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    marginBottom: 14,
  },
  currentPreview: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  previewHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  previewDetail: {
    fontSize: 12,
    lineHeight: 18,
  },
  saveActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listSection: {
    maxHeight: 400,
  },
  strategyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 11,
    marginBottom: 8,
  },
  itemTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    gap: 8,
  },
  loadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  loadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
  },
});
