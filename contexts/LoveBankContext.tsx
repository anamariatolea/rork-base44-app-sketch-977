import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PointsData = {
  myPoints: number;
  partnerPoints: number;
};

const POINTS_KEY = "love_bank_points";

export const [LoveBankProvider, useLoveBank] = createContextHook(() => {
  const [points, setPoints] = useState<PointsData>({
    myPoints: 125,
    partnerPoints: 98,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      const stored = await AsyncStorage.getItem(POINTS_KEY);
      if (stored) {
        setPoints(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading points:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const savePoints = async (newPoints: PointsData) => {
    try {
      await AsyncStorage.setItem(POINTS_KEY, JSON.stringify(newPoints));
      setPoints(newPoints);
    } catch (error) {
      console.error("Error saving points:", error);
    }
  };

  const addPoints = (amount: number, isMe: boolean = true) => {
    const newPoints = {
      ...points,
      myPoints: isMe ? points.myPoints + amount : points.myPoints,
      partnerPoints: isMe ? points.partnerPoints : points.partnerPoints + amount,
    };
    savePoints(newPoints);
    console.log(`Added ${amount} points. New balance:`, newPoints);
  };

  const spendPoints = (amount: number, isMe: boolean = true) => {
    const currentPoints = isMe ? points.myPoints : points.partnerPoints;
    if (currentPoints < amount) {
      return false;
    }
    
    const newPoints = {
      ...points,
      myPoints: isMe ? points.myPoints - amount : points.myPoints,
      partnerPoints: isMe ? points.partnerPoints : points.partnerPoints - amount,
    };
    savePoints(newPoints);
    console.log(`Spent ${amount} points. New balance:`, newPoints);
    return true;
  };

  return {
    points,
    isLoaded,
    addPoints,
    spendPoints,
  };
});
