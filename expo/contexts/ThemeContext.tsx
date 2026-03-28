import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES } from "@/constants/themes";

const THEME_STORAGE_KEY = "@us_and_co_theme";

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>("classic");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && THEMES[savedTheme]) {
        setCurrentTheme(savedTheme as keyof typeof THEMES);
      }
    } catch (error) {
      console.log("Error loading theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTheme = async (themeKey: keyof typeof THEMES) => {
    try {
      setCurrentTheme(themeKey);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeKey);
    } catch (error) {
      console.log("Error saving theme:", error);
    }
  };

  const colors = THEMES[currentTheme];

  return {
    currentTheme,
    colors,
    changeTheme,
    isLoading,
  };
});
