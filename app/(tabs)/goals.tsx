import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, CheckCircle2, Circle, Calendar as CalendarIcon, Star } from "lucide-react-native";
import { useState } from "react";
import Colors from "@/constants/colors";

type Goal = {
  id: number;
  title: string;
  description: string;
  category: "daily" | "weekly" | "yearly";
  completed: boolean;
  streak?: number;
};

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "yearly">("daily");

  const goals: Goal[] = [
    {
      id: 1,
      title: "Morning text",
      description: "Send a sweet good morning message",
      category: "daily",
      completed: true,
      streak: 12,
    },
    {
      id: 2,
      title: "Share something funny",
      description: "Share a meme or joke",
      category: "daily",
      completed: true,
      streak: 8,
    },
    {
      id: 3,
      title: "Evening call",
      description: "End the day together",
      category: "daily",
      completed: false,
      streak: 5,
    },
    {
      id: 4,
      title: "Quality time",
      description: "Spend 2 hours together",
      category: "daily",
      completed: false,
      streak: 3,
    },
    {
      id: 5,
      title: "Date night",
      description: "Plan and enjoy a special date",
      category: "weekly",
      completed: true,
    },
    {
      id: 6,
      title: "Try new restaurant",
      description: "Explore a new cuisine together",
      category: "weekly",
      completed: false,
    },
    {
      id: 7,
      title: "Outdoor adventure",
      description: "Go hiking or outdoor activity",
      category: "weekly",
      completed: false,
    },
    {
      id: 8,
      title: "Take a trip together",
      description: "Visit a new country or city",
      category: "yearly",
      completed: false,
    },
    {
      id: 9,
      title: "Learn something new together",
      description: "Take a class or workshop",
      category: "yearly",
      completed: false,
    },
    {
      id: 10,
      title: "Create a major memory",
      description: "Do something unforgettable",
      category: "yearly",
      completed: false,
    },
  ];

  const filteredGoals = goals.filter((g) => g.category === activeTab);
  const completedCount = filteredGoals.filter((g) => g.completed).length;

  const TabButton = ({ label, value, icon: Icon }: any) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === value && styles.tabActive]}
      onPress={() => setActiveTab(value)}
    >
      <Icon
        size={20}
        color={activeTab === value ? Colors.accentRose : Colors.textSecondary}
      />
      <Text style={[styles.tabText, activeTab === value && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const GoalCard = ({ goal }: { goal: Goal }) => (
    <View style={styles.goalCard}>
      <TouchableOpacity style={styles.goalCheckbox}>
        {goal.completed ? (
          <CheckCircle2 size={28} color={Colors.success} fill={Colors.success} />
        ) : (
          <Circle size={28} color={Colors.mediumGray} />
        )}
      </TouchableOpacity>
      <View style={styles.goalContent}>
        <Text
          style={[
            styles.goalTitle,
            goal.completed && styles.goalTitleCompleted,
          ]}
        >
          {goal.title}
        </Text>
        <Text style={styles.goalDescription}>{goal.description}</Text>
        {goal.streak && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {goal.streak} day streak</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Goals & Rituals</Text>
        <Text style={styles.subtitle}>
          Building your relationship, one step at a time
        </Text>
      </View>

      <View style={styles.tabs}>
        <TabButton label="Daily" value="daily" icon={CheckCircle2} />
        <TabButton label="Weekly" value="weekly" icon={CalendarIcon} />
        <TabButton label="Yearly" value="yearly" icon={Star} />
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {completedCount} of {filteredGoals.length} completed
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${filteredGoals.length > 0 ? (completedCount / filteredGoals.length) * 100 : 0}%`,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredGoals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color={Colors.white} />
          <Text style={styles.addButtonText}>Add New Goal</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.lightRose,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.accentRose,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.mediumGray,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accentRose,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  goalCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.deepSlate,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  goalCheckbox: {
    paddingTop: 2,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  goalTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textSecondary,
  },
  goalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  streakBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.lightRose,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accentRose,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accentRose,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
