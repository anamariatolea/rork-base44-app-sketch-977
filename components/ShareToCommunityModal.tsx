import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { X, Check } from 'lucide-react-native';

interface ShareToCommunityModalProps {
  visible: boolean;
  onClose: () => void;
  sharedFrom: string;
  sharedData: any;
  onSuccess?: () => void;
}

export function ShareToCommunityModal({
  visible,
  onClose,
  sharedFrom,
  sharedData,
  onSuccess,
}: ShareToCommunityModalProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const communitiesQuery = trpc.communities.list.useQuery({
    userId: user?.id,
    myCommunitiesOnly: true,
  });

  const createPostMutation = trpc.communities.posts.create.useMutation();

  const handleShare = async () => {
    if (!selectedCommunity) {
      Alert.alert('Error', 'Please select a community');
      return;
    }

    try {
      await createPostMutation.mutateAsync({
        communityId: selectedCommunity,
        userId: user?.id || '',
        caption: caption.trim(),
        sharedFrom,
        sharedData,
      });

      Alert.alert('Success', 'Shared to community!');
      setCaption('');
      setSelectedCommunity(null);
      onSuccess?.();
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to share to community');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Share to Community
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X color={colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.captionInput,
              { backgroundColor: colors.lightGray, color: colors.textPrimary },
            ]}
            placeholder="Add a caption (optional)"
            placeholderTextColor={colors.textSecondary}
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Select Community
          </Text>

          {communitiesQuery.isLoading ? (
            <ActivityIndicator color={colors.accentRose} style={styles.loader} />
          ) : communitiesQuery.data && communitiesQuery.data.length > 0 ? (
            <ScrollView style={styles.communitiesList} showsVerticalScrollIndicator={false}>
              {communitiesQuery.data.map((community) => (
                <TouchableOpacity
                  key={community.id}
                  style={[
                    styles.communityItem,
                    {
                      backgroundColor:
                        selectedCommunity === community.id ? colors.accentRose + '20' : colors.lightGray,
                      borderColor:
                        selectedCommunity === community.id ? colors.accentRose : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedCommunity(community.id)}
                >
                  <View style={styles.communityInfo}>
                    <Text style={[styles.communityName, { color: colors.textPrimary }]}>
                      {community.name}
                    </Text>
                    {community.description && (
                      <Text
                        style={[styles.communityDescription, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {community.description}
                      </Text>
                    )}
                  </View>
                  {selectedCommunity === community.id && (
                    <Check color={colors.accentRose} size={24} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                You haven't joined any communities yet
              </Text>
            </View>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.mediumGray }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: colors.accentRose },
                !selectedCommunity && { opacity: 0.5 },
              ]}
              onPress={handleShare}
              disabled={!selectedCommunity || createPostMutation.isPending}
            >
              {createPostMutation.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.modalButtonText, { color: colors.white }]}>Share</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  captionInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top' as const,
    minHeight: 80,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 20,
  },
  communitiesList: {
    maxHeight: 250,
    marginBottom: 20,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  communityDescription: {
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
