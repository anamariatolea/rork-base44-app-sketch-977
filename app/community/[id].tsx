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
import { ArrowLeft, Plus, Heart, Flame, Hand, Laugh, Frown, MapPin, Share2 } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const postsQuery = trpc.communities.posts.list.useQuery({ communityId: id });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Community</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accentRose }]}
          onPress={() => setShowCreatePost(true)}
        >
          <Plus color={colors.white} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {postsQuery.isLoading ? (
          <ActivityIndicator size="large" color={colors.accentRose} style={styles.loader} />
        ) : postsQuery.data && postsQuery.data.length > 0 ? (
          postsQuery.data.map((post) => (
            <PostCard key={post.id} post={post} colors={colors} userId={user?.id} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No posts yet. Be the first to share!
            </Text>
          </View>
        )}
      </ScrollView>

      <CreatePostModal
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        colors={colors}
        userId={user?.id}
        communityId={id}
        onSuccess={() => {
          setShowCreatePost(false);
          postsQuery.refetch();
        }}
      />
    </SafeAreaView>
  );
}

function PostCard({ post, colors, userId }: any) {
  const reactMutation = trpc.communities.posts.react.useMutation();
  const postsQuery = trpc.communities.posts.list.useQuery({ communityId: post.community_id });

  const reactions = post.post_reactions || [];
  const reactionCounts = reactions.reduce((acc: any, r: any) => {
    acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
    return acc;
  }, {});

  const userReactions = reactions.filter((r: any) => r.user_id === userId).map((r: any) => r.reaction_type);

  type ReactionType = 'heart' | 'fire' | 'clap' | 'laugh' | 'cry';

  const reactionIcons: Record<ReactionType, React.ComponentType<any>> = {
    heart: Heart,
    fire: Flame,
    clap: Hand,
    laugh: Laugh,
    cry: Frown,
  };

  const handleReaction = async (reactionType: ReactionType) => {
    const hasReacted = userReactions.includes(reactionType);
    try {
      await reactMutation.mutateAsync({
        postId: post.id,
        userId,
        reactionType,
        remove: hasReacted,
      });
      postsQuery.refetch();
    } catch {
      Alert.alert('Error', 'Failed to react to post');
    }
  };

  return (
    <View style={[styles.postCard, { backgroundColor: colors.white }]}>
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.lightGray }]}>
          {post.user_profiles?.avatar_url ? (
            <Image source={{ uri: post.user_profiles.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarText, { color: colors.textPrimary }]}>
              {post.user_profiles?.display_name?.[0]?.toUpperCase() || '?'}
            </Text>
          )}
        </View>
        <View style={styles.postHeaderText}>
          <Text style={[styles.postAuthor, { color: colors.textPrimary }]}>
            {post.user_profiles?.display_name || 'Anonymous'}
          </Text>
          <Text style={[styles.postTime, { color: colors.textSecondary }]}>
            {new Date(post.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {post.shared_from && (
        <View style={[styles.sharedBadge, { backgroundColor: colors.accentRose + '20' }]}>
          <Share2 color={colors.accentRose} size={14} />
          <Text style={[styles.sharedText, { color: colors.accentRose }]}>
            Shared from {post.shared_from}
          </Text>
        </View>
      )}

      {post.caption && (
        <Text style={[styles.postCaption, { color: colors.textPrimary }]}>{post.caption}</Text>
      )}

      {post.image_url && (
        <Image source={{ uri: post.image_url }} style={styles.postImage} />
      )}

      {post.location_name && (
        <View style={styles.locationContainer}>
          <MapPin color={colors.textSecondary} size={14} />
          <Text style={[styles.locationText, { color: colors.textSecondary }]}>
            {post.location_name}
          </Text>
        </View>
      )}

      {post.shared_data && (
        <View style={[styles.sharedDataCard, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.sharedDataText, { color: colors.textPrimary }]}>
            {JSON.stringify(post.shared_data, null, 2)}
          </Text>
        </View>
      )}

      <View style={styles.reactionsContainer}>
        {(Object.entries(reactionIcons) as [ReactionType, React.ComponentType<any>][]).map(([type, IconComponent]) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.reactionButton,
              { backgroundColor: userReactions.includes(type) ? colors.accentRose + '20' : colors.lightGray },
            ]}
            onPress={() => handleReaction(type)}
          >
            <IconComponent
              color={userReactions.includes(type) ? colors.accentRose : colors.textSecondary}
              size={18}
            />
            {reactionCounts[type] > 0 && (
              <Text
                style={[
                  styles.reactionCount,
                  { color: userReactions.includes(type) ? colors.accentRose : colors.textSecondary },
                ]}
              >
                {reactionCounts[type]}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function CreatePostModal({ visible, onClose, colors, userId, communityId, onSuccess, sharedData }: any) {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const createPostMutation = trpc.communities.posts.create.useMutation();

  const requestLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        setLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      setLocation({
        name: `${address.city || ''}, ${address.region || ''}`.trim(),
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch {
      Alert.alert('Error', 'Failed to get location');
    }
    setLoadingLocation(false);
  };

  const handlePost = async () => {
    try {
      await createPostMutation.mutateAsync({
        communityId,
        userId,
        caption: caption.trim(),
        locationName: location?.name,
        locationLatitude: location?.latitude,
        locationLongitude: location?.longitude,
        sharedFrom: sharedData?.from,
        sharedData: sharedData?.data,
      });
      setCaption('');
      setLocation(null);
      onSuccess();
    } catch {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Create Post</Text>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.lightGray, color: colors.textPrimary },
            ]}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textSecondary}
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={6}
          />

          {location && (
            <View style={[styles.locationTag, { backgroundColor: colors.lightGray }]}>
              <MapPin color={colors.accentRose} size={16} />
              <Text style={[styles.locationTagText, { color: colors.textPrimary }]}>
                {location.name}
              </Text>
              <TouchableOpacity onPress={() => setLocation(null)}>
                <Text style={{ color: colors.accentRose }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: colors.lightGray }]}
            onPress={requestLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator color={colors.accentRose} />
            ) : (
              <>
                <MapPin color={colors.accentRose} size={20} />
                <Text style={[styles.locationButtonText, { color: colors.textPrimary }]}>
                  Add Location
                </Text>
              </>
            )}
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
              onPress={handlePost}
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.modalButtonText, { color: colors.white }]}>Post</Text>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    flex: 1,
    textAlign: 'center' as const,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
  },
  postCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  postHeaderText: {
    marginLeft: 12,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  postTime: {
    fontSize: 12,
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  sharedText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  postCaption: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
  },
  sharedDataCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  sharedDataText: {
    fontSize: 12,
    fontFamily: 'monospace' as const,
  },
  reactionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  reactionCount: {
    fontSize: 12,
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
    height: 150,
    textAlignVertical: 'top' as const,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  locationTagText: {
    flex: 1,
    fontSize: 14,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
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
