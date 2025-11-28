import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  totalDaysActive: number;
};

type StreakContextType = {
  streak: StreakData;
  recordActivity: () => Promise<void>;
  isLoading: boolean;
};

const StreakContext = createContext<StreakContextType | undefined>(undefined);

const STORAGE_KEY = "@streak_data";

export function StreakProvider({ children }: { children: ReactNode }) {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    totalDaysActive: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStreak();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStreak = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const updatedStreak = calculateStreakStatus(data);
        setStreak(updatedStreak);
        if (updatedStreak.currentStreak !== data.currentStreak) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStreak));
        }
      }
    } catch (error) {
      console.error("Error loading streak:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreakStatus = (data: StreakData): StreakData => {
    if (!data.lastActivityDate) return data;

    const lastDate = new Date(data.lastActivityDate);
    const today = new Date();
    
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      return {
        ...data,
        currentStreak: 0,
      };
    }

    return data;
  };

  const recordActivity = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayString = today.toISOString();

      const lastDate = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
      if (lastDate) {
        lastDate.setHours(0, 0, 0, 0);
      }

      if (lastDate && lastDate.getTime() === today.getTime()) {
        return;
      }

      let newCurrentStreak = streak.currentStreak;
      let newTotalDays = streak.totalDaysActive + 1;

      if (lastDate) {
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newCurrentStreak += 1;
        } else if (diffDays > 1) {
          newCurrentStreak = 1;
        }
      } else {
        newCurrentStreak = 1;
      }

      const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);

      const updatedStreak: StreakData = {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: todayString,
        totalDaysActive: newTotalDays,
      };

      setStreak(updatedStreak);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStreak));
      
      console.log("Streak updated:", updatedStreak);
    } catch (error) {
      console.error("Error recording activity:", error);
    }
  };

  return (
    <StreakContext.Provider value={{ streak, recordActivity, isLoading }}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error("useStreak must be used within a StreakProvider");
  }
  return context;
}
