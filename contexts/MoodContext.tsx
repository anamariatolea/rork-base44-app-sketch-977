import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from './AuthContext';
import { trpc } from '@/lib/trpc';
import { useState, useEffect } from 'react';

export type MoodType = "happy" | "neutral" | "sad" | "tired" | "exciting" | "busy";

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: MoodType;
  note?: string;
  created_at: string;
}

export const [MoodProvider, useMood] = createContextHook(() => {
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);

  const moodHistoryQuery = trpc.moods.history.useQuery(
    { userId: user?.id || '', limit: 50 },
    { 
      enabled: !!user,
      retry: false,
      retryOnMount: false,
    }
  );

  const latestMoodQuery = trpc.moods.latest.useQuery(
    { userId: user?.id || '' },
    { 
      enabled: !!user,
      retry: false,
      retryOnMount: false,
    }
  );

  const recordMoodMutation = trpc.moods.record.useMutation({
    onSuccess: () => {
      moodHistoryQuery.refetch();
      latestMoodQuery.refetch();
    },
  });

  useEffect(() => {
    if (latestMoodQuery.data) {
      setCurrentMood(latestMoodQuery.data.mood as MoodType);
    }
  }, [latestMoodQuery.data]);

  const recordMood = async (mood: MoodType, note?: string) => {
    if (!user) return;
    
    setCurrentMood(mood);
    await recordMoodMutation.mutateAsync({
      userId: user.id,
      mood,
      note,
    });
  };

  return {
    currentMood,
    recordMood,
    moodHistory: moodHistoryQuery.data || [],
    isLoading: moodHistoryQuery.isLoading || latestMoodQuery.isLoading,
    isRecording: recordMoodMutation.isPending,
  };
});
