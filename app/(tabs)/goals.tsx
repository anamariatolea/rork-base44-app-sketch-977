import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, CheckCircle2, Circle, Calendar as CalendarIcon, Star, X, Trash2, Gift, Coins } from "lucide-react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { useLoveBank } from "@/contexts/LoveBankContext";

type Goal = {
  id: number;
  title: string;
  description: string;
  category: "daily" | "weekly" | "yearly";
  completed: boolean;
  streak?: number;
  reward?: string;
  rewardPoints?: number;
};

const GOALS_KEY = "relationship_goals";
const BONUS_POINTS = {
  daily: 10,
  weekly: 25,
  yearly: 100,
};

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const { addPoints } = useLoveBank();
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "yearly">("daily");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [customReward, setCustomReward] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastCompletionState, setLastCompletionState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveGoals();
      checkForBonus();
    }
  }, [goals, isLoaded]);

  const loadGoals = async () => {
    try {
      const stored = await AsyncStorage.getItem(GOALS_KEY);
      if (stored) {
        const parsedGoals = JSON.parse(stored);
        setGoals(parsedGoals);
        const completionState = getCompletionState(parsedGoals);
        setLastCompletionState(completionState);
      } else {
        setGoals(getDefaultGoals());
      }
    } catch (error) {
      console.error("Error loading goals:", error);
      setGoals(getDefaultGoals());
    } finally {
      setIsLoaded(true);
    }
  };

  const saveGoals = async () => {
    try {
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error("Error saving goals:", error);
    }
  };

  const getCompletionState = (goalsList: Goal[]) => {
    const state: Record<string, boolean> = {};
    ["daily", "weekly", "yearly"].forEach((category) => {
      const categoryGoals = goalsList.filter((g) => g.category === category);
      state[category] = categoryGoals.length > 0 && categoryGoals.every((g) => g.completed);
    });
    return state;
  };

  const checkForBonus = () => {
    const currentState = getCompletionState(goals);
    
    ["daily", "weekly", "yearly"].forEach((category) => {
      const wasCompleted = lastCompletionState[category];
      const isCompleted = currentState[category];
      
      if (!wasCompleted && isCompleted) {
        const bonus = BONUS_POINTS[category as keyof typeof BONUS_POINTS];
        addPoints(bonus);
        Alert.alert(
          "🎉 Bonus Points!",
          `Congratulations! You completed all ${category} goals and earned ${bonus} Love Bank points!`,
          [
            {
              text: "Set Custom Reward",
              onPress: () => setShowRewardModal(true),
            },
            { text: "Great!", style: "default" },
          ]
        );
      }
    });
    
    setLastCompletionState(currentState);
  };

  const getDefaultGoals = (): Goal[] => [
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

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) {
      Alert.alert("Title Required", "Please enter a title for your goal.");
      return;
    }

    const newGoal: Goal = {
      id: Date.now(),
      title: newGoalTitle,
      description: newGoalDescription,
      category: activeTab,
      completed: false,
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle("");
    setNewGoalDescription("");
    setShowAddModal(false);
  };

  const handleToggleGoal = (id: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    const wasCompleted = goal.completed;
    const updatedGoals = goals.map((g) =>
      g.id === id ? { ...g, completed: !g.completed } : g
    );
    setGoals(updatedGoals);

    if (!wasCompleted && goal.rewardPoints) {
      addPoints(goal.rewardPoints);
      Alert.alert(
        "Points Earned!",
        `You earned ${goal.rewardPoints} points for completing: ${goal.title}`,
        [{ text: "Nice!", style: "default" }]
      );
    }
  };

  const handleSetReward = (goalId: number) => {
    if (!customReward.trim() || !rewardPoints.trim()) {
      Alert.alert("Error", "Please enter both a reward and points value.");
      return;
    }

    setGoals(
      goals.map((g) =>
        g.id === goalId
          ? { ...g, reward: customReward, rewardPoints: Number(rewardPoints) }
          : g
      )
    );

    Alert.alert(
      "Reward Set!",
      `Reward "${customReward}" (${rewardPoints} points) has been added to the goal.`
    );

    setCustomReward("");
    setRewardPoints("");
    setShowRewardModal(false);
  };

  const handleDeleteGoal = (id: number) => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this goal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setGoals(goals.filter(g => g.id !== id)),
        },
      ]
    );
  };

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

  const handleAddCustomReward = () => {
    if (!customReward.trim() || !rewardPoints.trim()) {
      Alert.alert("Error", "Please enter both a reward description and points.");
      return;
    }

    Alert.alert(
      "Custom Reward Added!",
      `"${customReward}" will earn you ${rewardPoints} points when completed. Keep working towards your goals!`
    );

    setCustomReward("");
    setRewardPoints("");
    setShowRewardModal(false);
  };

  const GoalCard = ({ goal }: { goal: Goal }) => (
    <View style={styles.goalCard}>
      <TouchableOpacity style={styles.goalCheckbox} onPress={() => handleToggleGoal(goal.id)}>
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
        <View style={styles.goalBadges}>
          {goal.streak && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {goal.streak} day streak</Text>
            </View>
          )}
          {goal.reward && (
            <View style={styles.rewardBadge}>
              <Gift size={12} color={Colors.accentRose} />
              <Text style={styles.rewardText}>
                {goal.reward} ({goal.rewardPoints} pts)
              </Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteGoal(goal.id)}>
        <Trash2 size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
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
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {completedCount} of {filteredGoals.length} completed
          </Text>
          {completedCount === filteredGoals.length && filteredGoals.length > 0 && (
            <View style={styles.bonusBadge}>
              <Coins size={14} color={Colors.white} />
              <Text style={styles.bonusText}>+{BONUS_POINTS[activeTab]} bonus</Text>
            </View>
          )}
        </View>
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

        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color={Colors.white} />
          <Text style={styles.addButtonText}>Add New Goal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rewardButton}
          onPress={() => setShowRewardModal(true)}
        >
          <Gift size={20} color={Colors.accentRose} />
          <Text style={styles.rewardButtonText}>Add Custom Reward</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Add New Goal</Text>
                    <TouchableOpacity onPress={() => setShowAddModal(false)}>
                      <X size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Text style={styles.label}>Category: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</Text>

                    <Text style={styles.label}>Title</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Morning text, Date night"
                      placeholderTextColor={Colors.mediumGray}
                      value={newGoalTitle}
                      onChangeText={setNewGoalTitle}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Add details about your goal..."
                      placeholderTextColor={Colors.mediumGray}
                      value={newGoalDescription}
                      onChangeText={setNewGoalDescription}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleAddGoal}>
                      <Text style={styles.saveButtonText}>Add Goal</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showRewardModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRewardModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Add Custom Reward</Text>
                    <TouchableOpacity onPress={() => setShowRewardModal(false)}>
                      <X size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Text style={styles.rewardDescription}>
                      Create a custom reward for yourself outside the app (like a date night, spa day, etc.) to celebrate your progress!
                    </Text>

                    <Text style={styles.label}>Reward Description</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Date night, Spa day, Movie marathon"
                      placeholderTextColor={Colors.mediumGray}
                      value={customReward}
                      onChangeText={setCustomReward}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />

                    <Text style={styles.label}>Points Value</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 50"
                      placeholderTextColor={Colors.mediumGray}
                      value={rewardPoints}
                      onChangeText={setRewardPoints}
                      keyboardType="numeric"
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />

                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleAddCustomReward}
                    >
                      <Text style={styles.saveButtonText}>Add Reward</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
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
  deleteButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: Colors.accentRose,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700" as const,
  },
  progressHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
  bonusBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.success,
    borderRadius: 12,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  goalBadges: {
    flexDirection: "row" as const,
    gap: 8,
    flexWrap: "wrap" as const,
  },
  rewardBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.lightRose,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accentRose,
  },
  rewardButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.accentRose,
    borderStyle: "dashed" as const,
  },
  rewardButtonText: {
    color: Colors.accentRose,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  rewardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
});
