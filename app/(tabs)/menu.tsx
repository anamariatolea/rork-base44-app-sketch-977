import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Target,
  Gift,
  Sparkles,
  Camera,
  Settings,
  Users,
  Lightbulb,
  Gamepad2,
  MessageSquare,
  ShieldQuestion,
  Zap,
  ChevronRight,
} from "lucide-react-native";

type MenuItem = {
  title: string;
  description: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  route: string;
  color: string;
};

export default function MenuScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      title: "Goals & Rituals",
      description: "Track your relationship goals",
      icon: Target,
      route: "/goals",
      color: "#FF6B9D",
    },
    {
      title: "Love Bank",
      description: "Earn and redeem rewards",
      icon: Gift,
      route: "/love-bank",
      color: "#C9A0DC",
    },
    {
      title: "The Spark",
      description: "Get date ideas and inspiration",
      icon: Sparkles,
      route: "/spark",
      color: "#FFB74D",
    },
    {
      title: "Memories",
      description: "Your shared photo gallery",
      icon: Camera,
      route: "/memories",
      color: "#64B5F6",
    },
    {
      title: "Compatibility",
      description: "Discover your match score",
      icon: Users,
      route: "/compatibility",
      color: "#FF6B9D",
    },
    {
      title: "Vision Board",
      description: "Plan your future together",
      icon: Lightbulb,
      route: "/vision-board",
      color: "#FFD54F",
    },
    {
      title: "Games",
      description: "Fun games for couples",
      icon: Gamepad2,
      route: "/games",
      color: "#81C784",
    },
    {
      title: "Deep Conversations",
      description: "Meaningful discussion prompts",
      icon: MessageSquare,
      route: "/conversations",
      color: "#9575CD",
    },
    {
      title: "Conflict Repair",
      description: "Navigate challenges together",
      icon: ShieldQuestion,
      route: "/conflict-repair",
      color: "#F06292",
    },
    {
      title: "Spark Challenges",
      description: "Daily relationship challenges",
      icon: Zap,
      route: "/spark-challenges",
      color: "#FFB300",
    },
    {
      title: "Settings",
      description: "Customize your experience",
      icon: Settings,
      route: "/settings",
      color: "#78909C",
    },
  ];

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <LinearGradient
        colors={[colors.softRose, colors.lightRose, colors.white]}
        style={styles.header}
      >
        <Text style={[styles.title, { color: colors.deepSlate }]}>Explore</Text>
        <Text style={[styles.subtitle, { color: colors.deepSlate }]}>
          Discover all features
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { backgroundColor: colors.white }]}
            onPress={() => handlePress(item.route)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + "15" }]}>
              <item.icon color={item.color} size={24} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
                {item.description}
              </Text>
            </View>
            <ChevronRight color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
});
