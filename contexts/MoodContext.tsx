import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from './AuthContext';
import { trpc } from '@/lib/trpc';
import { useState, useEffect } from 'react';
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
      enabled: false,
      retry: false,
      retryOnMount: false,
    }
  );

  const latestMoodQuery = trpc.moods.latest.useQuery(
    { userId: user?.id || '' },
    { 
      enabled: false,
      retry: false,
      retryOnMount: false,
    }
  );

  const recordMoodMutation = trpc.moods.record.useMutation({
    onSuccess: () => {
      console.log('[MoodContext] Mood recorded successfully to backend');
      if (backendEnabled) {
        moodHistoryQuery.refetch();
        latestMoodQuery.refetch();
      }
    },
    onError: (error) => {
      console.error('[MoodContext] Backend error:', error.message);
    },
  });

  useEffect(() => {
    if (backendEnabled && latestMoodQuery.data) {
      setCurrentMood(latestMoodQuery.data.mood as MoodType);
    }
  }, [latestMoodQuery.data, backendEnabled]);

  useEffect(() => {
    const loadLocalData = async () => {
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
  }, []);

  const recordMood = async (mood: MoodType, note?: string) => {
    if (!user) {
      console.warn('[MoodContext] Cannot record mood - no user logged in');
      return;
    }
    
    console.log('[MoodContext] Recording mood:', { mood, userId: user.id, backend: backendEnabled });
    setCurrentMood(mood);
    
    try {
      await saveLocalMood(mood, note, user.id);
      console.log('[MoodContext] Mood saved locally');
    } catch (error: any) {
      console.error('[MoodContext] Failed to save mood locally:', error);
      throw error;
    }
    
    if (backendEnabled) {
      console.log('[MoodContext] Syncing mood to backend');
      try {
        await recordMoodMutation.mutateAsync({
          userId: user.id,
          mood,
          note,
        });
        console.log('[MoodContext] Backend sync successful');
      } catch (error: any) {
        console.log('[MoodContext] Backend sync failed - continuing with local save:', error.message);
      }
    } else {
      console.log('[MoodContext] Backend not configured - using local storage only');
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
      console.log('[MoodContext] Mood saved successfully');
    } catch (error) {
      console.error('[MoodContext] Error saving local mood:', error);
      throw error;
    }
  };

  return {
    currentMood,
    recordMood,
    moodHistory: backendEnabled && moodHistoryQuery.data ? moodHistoryQuery.data : localMoodHistory,
    isLoading: isLocalLoading,
    isRecording: recordMoodMutation.isPending,
  };
});
