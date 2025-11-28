import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export type PremiumFeature = 
  | "games_pack"
  | "conversation_trust"
  | "conversation_intimacy"
  | "conversation_sex"
  | "conversation_healing"
  | "conversation_childhood"
  | "conflict_jealousy"
  | "conflict_miscommunication"
  | "conflict_stress"
  | "conflict_intimacy_mismatch"
  | "conflict_unappreciated"
  | "spark_challenges";

const STORAGE_KEY = "@premium_features";

export const [PurchaseProvider, usePurchases] = createContextHook(() => {
  const [ownedFeatures, setOwnedFeatures] = useState<Set<PremiumFeature>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const features = JSON.parse(stored) as PremiumFeature[];
        setOwnedFeatures(new Set(features));
      }
    } catch (error) {
      console.error("Error loading purchases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePurchases = async (features: Set<PremiumFeature>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(features)));
    } catch (error) {
      console.error("Error saving purchases:", error);
    }
  };

  const purchaseFeature = async (feature: PremiumFeature): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        "Premium Feature",
        "This feature costs $1. Would you like to unlock it?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Purchase $1",
            onPress: () => {
              const newFeatures = new Set(ownedFeatures);
              newFeatures.add(feature);
              setOwnedFeatures(newFeatures);
              savePurchases(newFeatures);
              
              Alert.alert(
                "Success!",
                "Premium feature unlocked! Thank you for your support.",
                [{ text: "OK" }]
              );
              resolve(true);
            },
          },
        ]
      );
    });
  };

  const hasFeature = (feature: PremiumFeature): boolean => {
    return ownedFeatures.has(feature);
  };

  const hasAnyConversationPack = (): boolean => {
    return (
      hasFeature("conversation_trust") ||
      hasFeature("conversation_intimacy") ||
      hasFeature("conversation_sex") ||
      hasFeature("conversation_healing") ||
      hasFeature("conversation_childhood")
    );
  };

  const hasAnyConflictPack = (): boolean => {
    return (
      hasFeature("conflict_jealousy") ||
      hasFeature("conflict_miscommunication") ||
      hasFeature("conflict_stress") ||
      hasFeature("conflict_intimacy_mismatch") ||
      hasFeature("conflict_unappreciated")
    );
  };

  return {
    ownedFeatures,
    isLoading,
    purchaseFeature,
    hasFeature,
    hasAnyConversationPack,
    hasAnyConflictPack,
  };
});
