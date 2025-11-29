import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { X, Smile, Meh, Frown, Battery, Zap, Briefcase } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { MoodEntry, MoodType } from '@/contexts/MoodContext';
import { BlurView } from 'expo-blur';

interface MoodHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  moodHistory: MoodEntry[];
}

const getMoodIcon = (mood: MoodType) => {
  switch (mood) {
    case 'happy':
      return Smile;
    case 'neutral':
      return Meh;
    case 'sad':
      return Frown;
    case 'tired':
      return Battery;
    case 'exciting':
      return Zap;
    case 'busy':
      return Briefcase;
    default:
      return Smile;
  }
};

const getMoodLabel = (mood: MoodType) => {
  switch (mood) {
    case 'happy':
      return 'Happy';
    case 'neutral':
      return 'Okay';
    case 'sad':
      return 'Down';
    case 'tired':
      return 'Tired';
    case 'exciting':
      return 'Exciting';
    case 'busy':
      return 'Busy';
    default:
      return mood;
  }
};

const getMoodEmoji = (mood: MoodType) => {
  switch (mood) {
    case 'happy':
      return '😊';
    case 'neutral':
      return '😐';
    case 'sad':
      return '😔';
    case 'tired':
      return '😴';
    case 'exciting':
      return '⚡';
    case 'busy':
      return '💼';
    default:
      return '😊';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export default function MoodHistoryModal({
  visible,
  onClose,
  moodHistory,
}: MoodHistoryModalProps) {
  const { colors } = useTheme();

  const getWeekKey = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Week of ${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };

  const groupByWeek = (entries: MoodEntry[]) => {
    const grouped: { [key: string]: MoodEntry[] } = {};
    
    entries.forEach((entry) => {
      const date = new Date(entry.created_at);
      const weekKey = getWeekKey(date);
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = [];
      }
      grouped[weekKey].push(entry);
    });
    
    return grouped;
  };

  const groupedMoods = groupByWeek(moodHistory);



  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={50} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        )}
        
        <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.lightGray }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Mood History
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.lightGray }]}
            >
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.historyList}
            contentContainerStyle={styles.historyListContent}
            showsVerticalScrollIndicator={false}
          >
            {moodHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  No mood history yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                  Start tracking your feelings to see them here
                </Text>
              </View>
            ) : (
              Object.entries(groupedMoods).map(([week, entries]) => (
                <View key={week} style={styles.dateGroup}>
                  <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>
                    {week}
                  </Text>
                  {entries.map((entry) => {
                    const MoodIcon = getMoodIcon(entry.mood as MoodType);
                    return (
                      <View
                        key={entry.id}
                        style={[
                          styles.historyItem,
                          { backgroundColor: colors.lightGray },
                        ]}
                      >
                        <View style={styles.historyItemLeft}>
                          <View
                            style={[
                              styles.moodIconContainer,
                              { backgroundColor: colors.lightRose },
                            ]}
                          >
                            <MoodIcon size={24} color={colors.accentRose} />
                          </View>
                          <View style={styles.moodInfo}>
                            <Text style={[styles.moodText, { color: colors.textPrimary }]}>
                              {getMoodEmoji(entry.mood as MoodType)} {getMoodLabel(entry.mood as MoodType)}
                            </Text>
                            {entry.note && (
                              <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                                {entry.note}
                              </Text>
                            )}
                          </View>
                        </View>
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                          {formatDate(entry.created_at)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  moodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodInfo: {
    flex: 1,
  },
  moodText: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  noteText: {
    fontSize: 13,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
});
