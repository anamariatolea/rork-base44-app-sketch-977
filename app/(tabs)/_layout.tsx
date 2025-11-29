import { Tabs } from "expo-router";
import { Heart, Grid } from "lucide-react-native";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accentRose,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.mediumGray,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Heartbeat",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Grid color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="goals" options={{ href: null }} />
      <Tabs.Screen name="love-bank" options={{ href: null }} />
      <Tabs.Screen name="spark" options={{ href: null }} />

      <Tabs.Screen name="compatibility" options={{ href: null }} />
      <Tabs.Screen name="vision-board" options={{ href: null }} />
      <Tabs.Screen name="games" options={{ href: null }} />
      <Tabs.Screen name="conversations" options={{ href: null }} />
      <Tabs.Screen name="conflict-repair" options={{ href: null }} />
      <Tabs.Screen name="spark-challenges" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
