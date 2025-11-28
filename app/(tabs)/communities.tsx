import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Plus, Search, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function CommunitiesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyCommunitiesOnly, setShowMyCommunitiesOnly] = useState(false);

  const communitiesQuery = trpc.communities.list.useQuery({
    userId: user?.id,
    myCommunitiesOnly: showMyCommunitiesOnly,
  });

  const filteredCommunities = communitiesQuery.data?.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Communities</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.accentRose }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus color={colors.white} size={24} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.white }]}>
        <Search color={colors.textSecondary} size={20} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search communities..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !showMyCommunitiesOnly && { backgroundColor: colors.accentRose },
          ]}
          onPress={() => setShowMyCommunitiesOnly(false)}
        >
          <Text
            style={[
              styles.filterText,
              { color: !showMyCommunitiesOnly ? colors.white : colors.textSecondary },
            ]}
          >
            All Communities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showMyCommunitiesOnly && { backgroundColor: colors.accentRose },
          ]}
          onPress={() => setShowMyCommunitiesOnly(true)}
        >
          <Text
            style={[
              styles.filterText,
              { color: showMyCommunitiesOnly ? colors.white : colors.textSecondary },
            ]}
          >
            My Communities
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {communitiesQuery.isLoading ? (
          <ActivityIndicator size="large" color={colors.accentRose} style={styles.loader} />
        ) : (
          <View style={styles.communitiesGrid}>
            {filteredCommunities?.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onPress={() => router.push(`/community/${community.id}` as any)}
                colors={colors}
                userId={user?.id}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <CreateCommunityModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        colors={colors}
        userId={user?.id}
        onSuccess={() => {
          setShowCreateModal(false);
          communitiesQuery.refetch();
        }}
      />
    </SafeAreaView>
  );
}

function CommunityCard({ community, onPress, colors, userId }: any) {
  const joinMutation = trpc.communities.join.useMutation();
  const leaveMutation = trpc.communities.leave.useMutation();
  const communitiesQuery = trpc.communities.list.useQuery({
    userId,
    myCommunitiesOnly: false,
  });

  const isMember = community.community_members?.some((m: any) => m.user_id === userId);

  const handleJoinLeave = async () => {
    try {
      if (isMember) {
        await leaveMutation.mutateAsync({
          communityId: community.id,
          userId,
        });
      } else {
        await joinMutation.mutateAsync({
          communityId: community.id,
          userId,
        });
      }
      communitiesQuery.refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to join/leave community');
    }
  };

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.white }]} onPress={onPress}>
      {community.image_url ? (
        <Image source={{ uri: community.image_url }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.lightGray }]}>
          <Users color={colors.textSecondary} size={40} />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {community.name}
        </Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {community.description || 'No description'}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.cardStats}>
            <Users color={colors.textSecondary} size={16} />
            <Text style={[styles.cardStatText, { color: colors.textSecondary }]}>
              {community.community_members?.[0]?.count || 0}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.joinButton,
              { backgroundColor: isMember ? colors.mediumGray : colors.accentRose },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleJoinLeave();
            }}
          >
            <Text style={[styles.joinButtonText, { color: colors.white }]}>
              {isMember ? 'Leave' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CreateCommunityModal({ visible, onClose, colors, userId, onSuccess }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const createMutation = trpc.communities.create.useMutation();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a community name');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        ownerId: userId,
        isPrivate,
      });
      setName('');
      setDescription('');
      setIsPrivate(false);
      onSuccess();
    } catch (error) {
      Alert.alert('Error', 'Failed to create community');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            Create Community
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.lightGray, color: colors.textPrimary }]}
            placeholder="Community name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.lightGray, color: colors.textPrimary },
            ]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsPrivate(!isPrivate)}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: colors.mediumGray },
                isPrivate && { backgroundColor: colors.accentRose },
              ]}
            >
              {isPrivate && <Text style={{ color: colors.white }}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.textPrimary }]}>
              Private Community
            </Text>
          </TouchableOpacity>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.mediumGray }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.accentRose }]}
              onPress={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.modalButtonText, { color: colors.white }]}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  communitiesGrid: {
    padding: 20,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover' as const,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardStatText: {
    fontSize: 14,
  },
  joinButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 20,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top' as const,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 16,
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
