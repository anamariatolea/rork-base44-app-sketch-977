import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LANGUAGES } from "@/constants/languages";
import { translations, TranslationKey } from "@/constants/translations";

const LANGUAGE_STORAGE_KEY = "@us_and_co_language";

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof LANGUAGES>("en");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && LANGUAGES[savedLanguage]) {
        setCurrentLanguage(savedLanguage as keyof typeof LANGUAGES);
      }
    } catch (error) {
      console.log("Error loading language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (languageKey: keyof typeof LANGUAGES) => {
    try {
      setCurrentLanguage(languageKey);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageKey);
    } catch (error) {
      console.log("Error saving language:", error);
    }
  };

  const t = (key: TranslationKey): string => {
    const langCode = currentLanguage as keyof typeof translations;
    return translations[langCode]?.[key] || translations.en[key] || key;
  };

  const languageInfo = LANGUAGES[currentLanguage];

  return {
    currentLanguage,
    languageInfo,
    changeLanguage,
    t,
    isLoading,
  };
});
