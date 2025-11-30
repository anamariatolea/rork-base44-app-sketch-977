import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from './AuthContext';
import { trpc } from '@/lib/trpc';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MoodType = "happy" | "neutral" | "sad" | "tired" | "exciting" | "busy";

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: MoodType;
  note?: string;
  created_at: string;
}

const MOOD_STORAGE_KEY = '@mood_current';
const MOOD_HISTORY_KEY = '@mood_history';

const isBackendAvailable = () => {
  return !!process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
};

export const [MoodProvider, useMood] = createContextHook(() => {
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
  const [localMoodHistory, setLocalMoodHistory] = useState<MoodEntry[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  const backendEnabled = isBackendAvailable();

  const moodHistoryQuery = trpc.moods.history.useQuery(
    { userId: user?.id || '', limit: 50 },
    { 
      enabled: !!user && backendEnabled,
      retry: false,
      retryOnMount: false,
    }
  );

  const latestMoodQuery = trpc.moods.latest.useQuery(
    { userId: user?.id || '' },
    { 
      enabled: !!user && backendEnabled,
      retry: false,
      retryOnMount: false,
    }
  );

  const recordMoodMutation = trpc.moods.record.useMutation({
    onSuccess: () => {
      console.log('[MoodContext] Mood recorded successfully to backend');
      moodHistoryQuery.refetch();
      latestMoodQuery.refetch();
    },
    onError: (error) => {
      console.error('[MoodContext] Error recording mood to backend:', error);
    },
  });

  useEffect(() => {
    if (backendEnabled && latestMoodQuery.data) {
      setCurrentMood(latestMoodQuery.data.mood as MoodType);
    }
  }, [latestMoodQuery.data, backendEnabled]);

  useEffect(() => {
    const loadLocalData = async () => {
      if (backendEnabled) {
        setIsLocalLoading(false);
        return;
      }

      try {
        console.log('[MoodContext] Loading local mood data');
        const storedMood = await AsyncStorage.getItem(MOOD_STORAGE_KEY);
        const storedHistory = await AsyncStorage.getItem(MOOD_HISTORY_KEY);

        if (storedMood) {
          setCurrentMood(storedMood as MoodType);
        }

        if (storedHistory) {
          setLocalMoodHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('[MoodContext] Error loading local mood data:', error);
      } finally {
        setIsLocalLoading(false);
      }
    };

    loadLocalData();
  }, [backendEnabled]);

  const recordMood = async (mood: MoodType, note?: string) => {
    if (!user) {
      console.warn('[MoodContext] Cannot record mood - no user logged in');
      return;
    }
    
    console.log('[MoodContext] Recording mood:', { mood, userId: user.id, backend: backendEnabled });
    setCurrentMood(mood);
    
    if (backendEnabled) {
      try {
        await recordMoodMutation.mutateAsync({
          userId: user.id,
          mood,
          note,
        });
      } catch {
        console.error('[MoodContext] Backend unavailable, falling back to local storage');
        await saveLocalMood(mood, note, user.id);
      }
    } else {
      await saveLocalMood(mood, note, user.id);
    }
  };

  const saveLocalMood = async (mood: MoodType, note: string | undefined, userId: string) => {
    try {
      console.log('[MoodContext] Saving mood locally');
      await AsyncStorage.setItem(MOOD_STORAGE_KEY, mood);

      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        user_id: userId,
        mood,
        note,
        created_at: new Date().toISOString(),
      };

      const updatedHistory = [newEntry, ...localMoodHistory].slice(0, 50);
      setLocalMoodHistory(updatedHistory);
      await AsyncStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('[MoodContext] Error saving local mood:', error);
      Alert.alert(
        'Error',
        'Unable to save your mood. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return {
    currentMood,
    recordMood,
    moodHistory: backendEnabled ? (moodHistoryQuery.data || []) : localMoodHistory,
    isLoading: backendEnabled ? (moodHistoryQuery.isLoading || latestMoodQuery.isLoading) : isLocalLoading,
    isRecording: backendEnabled ? recordMoodMutation.isPending : false,
  };
});
