import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Coins, Coffee, UtensilsCrossed, Sparkles, Home, Music, Heart, X, Trash2, Gift } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { useLoveBank } from "@/contexts/LoveBankContext";

type Reward = {
  id: number;
  title: string;
  description: string;
  points: number;
  icon: any;
  category: string;
  claimed?: boolean;
};

const REWARDS_KEY = "love_bank_rewards";

const iconOptions = [
  { name: "Coffee", component: Coffee },
  { name: "Food", component: UtensilsCrossed },
  { name: "Sparkles", component: Sparkles },
  { name: "Home", component: Home },
  { name: "Music", component: Music },
  { name: "Heart", component: Heart },
  { name: "Gift", component: Gift },
];

export default function LoveBankScreen() {
  const insets = useSafeAreaInsets();
  const { points, spendPoints, isLoaded: pointsLoaded } = useLoveBank();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRewardTitle, setNewRewardTitle] = useState("");
  const [newRewardDescription, setNewRewardDescription] = useState("");
  const [newRewardPoints, setNewRewardPoints] = useState("");
  const [newRewardCategory, setNewRewardCategory] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(0);

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsLoaded, setRewardsLoaded] = useState(false);

  useEffect(() => {
    loadRewards();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rewardsLoaded) {
      saveRewards();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewards, rewardsLoaded]);

  const loadRewards = async () => {
    try {
      const stored = await AsyncStorage.getItem(REWARDS_KEY);
      if (stored) {
        const parsedRewards = JSON.parse(stored);
        const rewardsWithIcons = parsedRewards.map((reward: any) => {
          const iconName = reward.iconName || "Coffee";
          const iconOption = iconOptions.find(opt => opt.name === iconName);
          return {
            ...reward,
            icon: iconOption ? iconOption.component : Coffee,
          };
        });
        setRewards(rewardsWithIcons);
      } else {
        setRewards(getDefaultRewards());
      }
    } catch (error) {
      console.error("Error loading rewards:", error);
      setRewards(getDefaultRewards());
    } finally {
      setRewardsLoaded(true);
    }
  };

  const saveRewards = async () => {
    try {
      const rewardsToSave = rewards.map((reward) => {
        const iconName = iconOptions.find(opt => opt.component === reward.icon)?.name || "Coffee";
        return {
          ...reward,
          icon: undefined,
          iconName,
        };
      });
      await AsyncStorage.setItem(REWARDS_KEY, JSON.stringify(rewardsToSave));
    } catch (error) {
      console.error("Error saving rewards:", error);
    }
  };

  const getDefaultRewards = (): Reward[] => [
    {
      id: 1,
      title: "Morning Coffee",
      description: "Your partner makes you coffee",
      points: 10,
      icon: Coffee,
      category: "Sweet Gestures",
    },
    {
      id: 2,
      title: "Breakfast in Bed",
      description: "Wake up to a special meal",
      points: 30,
      icon: UtensilsCrossed,
      category: "Sweet Gestures",
    },
    {
      id: 3,
      title: "1 Hour Massage",
      description: "Relaxing full body massage",
      points: 50,
      icon: Sparkles,
      category: "Pampering",
    },
    {
      id: 4,
      title: "Movie Night Pick",
      description: "You choose what we watch",
      points: 15,
      icon: Home,
      category: "Fun",
    },
    {
      id: 5,
      title: "Concert Date",
      description: "Live music experience together",
      points: 100,
      icon: Music,
      category: "Adventures",
    },
    {
      id: 6,
      title: "Surprise Date",
      description: "Your partner plans everything",
      points: 75,
      icon: Heart,
      category: "Adventures",
    },
  ];

  const handleAddReward = () => {
    if (!newRewardTitle.trim()) {
      Alert.alert("Title Required", "Please enter a title for your reward.");
      return;
    }
    if (!newRewardPoints.trim() || isNaN(Number(newRewardPoints))) {
      Alert.alert("Points Required", "Please enter a valid number of points.");
      return;
    }

    const newReward: Reward = {
      id: Date.now(),
      title: newRewardTitle,
      description: newRewardDescription,
      points: Number(newRewardPoints),
      icon: iconOptions[selectedIcon].component,
      category: newRewardCategory || "Custom",
      claimed: false,
    };

    setRewards([...rewards, newReward]);
    setNewRewardTitle("");
    setNewRewardDescription("");
    setNewRewardPoints("");
    setNewRewardCategory("");
    setSelectedIcon(0);
    setShowAddModal(false);
  };

  const handleDeleteReward = (id: number) => {
    Alert.alert(
      "Delete Reward",
      "Are you sure you want to delete this reward?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setRewards(rewards.filter(r => r.id !== id)),
        },
      ]
    );
  };

  const handleClaimReward = (reward: Reward) => {
    const canAfford = points.myPoints >= reward.points;
    if (!canAfford) {
      Alert.alert("Not Enough Points", `You need ${reward.points - points.myPoints} more points to claim this reward.`);
      return;
    }

    Alert.alert(
      "Claim Reward?",
      `Are you sure you want to claim "${reward.title}" for ${reward.points} points?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Claim",
          onPress: () => {
            const success = spendPoints(reward.points);
            if (success) {
              const newBalance = points.myPoints - reward.points;
              setRewards(rewards.filter((r) => r.id !== reward.id));
              Alert.alert(
                "Reward Claimed! 🎉",
                `Enjoy your ${reward.title}! Your remaining balance is ${newBalance} points.`
              );
            }
          },
        },
      ]
    );
  };

  const RewardCard = ({ reward }: { reward: Reward }) => {
    const Icon = reward.icon;
    const canAfford = points.myPoints >= reward.points;

    return (
      <TouchableOpacity
        style={[styles.rewardCard, (!canAfford || reward.claimed) && styles.rewardCardDisabled]}
        onPress={() => !reward.claimed && handleClaimReward(reward)}
        disabled={reward.claimed}
      >
        <View style={styles.rewardIcon}>
          <Icon size={28} color={canAfford ? Colors.accentRose : Colors.textSecondary} />
        </View>
        <View style={styles.rewardContent}>
          <Text style={[styles.rewardTitle, !canAfford && styles.rewardTitleDisabled]}>
            {reward.title}
          </Text>
          <Text style={styles.rewardDescription}>{reward.description}</Text>
          <View style={styles.rewardFooter}>
            <Text style={styles.rewardCategory}>{reward.category}</Text>
            <View style={styles.pointsBadge}>
              <Coins size={14} color={canAfford ? Colors.accentRose : Colors.textSecondary} />
              <Text style={[styles.pointsText, (!canAfford || reward.claimed) && styles.pointsTextDisabled]}>
                {reward.points}
              </Text>
            </View>
          </View>
          {reward.claimed && (
            <View style={styles.claimedBadge}>
              <Text style={styles.claimedText}>Claimed ✓</Text>
            </View>
          )}
        </View>
        {!reward.claimed && (
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteReward(reward.id)}>
            <Trash2 size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (!pointsLoaded || !rewardsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.title, { color: Colors.textPrimary }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Love Bank</Text>
        <Text style={styles.subtitle}>Earn points, redeem rewards</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.accentRose, Colors.softRose]}
          style={styles.pointsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.pointsSection}>
            <Text style={styles.pointsLabel}>Your Points</Text>
            <View style={styles.pointsValue}>
              <Coins size={32} color={Colors.white} />
              <Text style={styles.pointsNumber}>{points.myPoints}</Text>
            </View>
          </View>
          <View style={styles.pointsDivider} />
          <View style={styles.pointsSection}>
            <Text style={styles.pointsLabel}>Partner&apos;s Points</Text>
            <View style={styles.pointsValue}>
              <Coins size={32} color={Colors.white} />
              <Text style={styles.pointsNumber}>{points.partnerPoints}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Rewards</Text>
          <Text style={styles.sectionSubtitle}>
            Complete goals to earn points and unlock rewards
          </Text>
        </View>

        {rewards.map((reward) => (
          <RewardCard key={reward.id} reward={reward} />
        ))}

        <TouchableOpacity style={styles.addRewardButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addRewardText}>+ Add Custom Reward</Text>
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
                    <Text style={styles.modalTitle}>Add Custom Reward</Text>
                    <TouchableOpacity onPress={() => setShowAddModal(false)}>
                      <X size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Text style={styles.label}>Icon</Text>
                    <View style={styles.iconSelector}>
                      {iconOptions.map((iconOption, index) => {
                        const IconComponent = iconOption.component;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[styles.iconOption, selectedIcon === index && styles.iconOptionSelected]}
                            onPress={() => setSelectedIcon(index)}
                          >
                            <IconComponent size={24} color={selectedIcon === index ? Colors.accentRose : Colors.textSecondary} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text style={styles.label}>Title</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Movie Night, Spa Day"
                      placeholderTextColor={Colors.mediumGray}
                      value={newRewardTitle}
                      onChangeText={setNewRewardTitle}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="What does this reward include?"
                      placeholderTextColor={Colors.mediumGray}
                      value={newRewardDescription}
                      onChangeText={setNewRewardDescription}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />

                    <Text style={styles.label}>Category (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Sweet Gestures, Pampering"
                      placeholderTextColor={Colors.mediumGray}
                      value={newRewardCategory}
                      onChangeText={setNewRewardCategory}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />

                    <Text style={styles.label}>Points Required</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 50"
                      placeholderTextColor={Colors.mediumGray}
                      value={newRewardPoints}
                      onChangeText={setNewRewardPoints}
                      keyboardType="numeric"
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleAddReward}>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pointsCard: {
    flexDirection: "row",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.deepSlate,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  pointsSection: {
    flex: 1,
    alignItems: "center",
  },
  pointsLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 12,
    fontWeight: "600" as const,
  },
  pointsValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pointsNumber: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  pointsDivider: {
    width: 1,
    backgroundColor: Colors.white,
    opacity: 0.3,
    marginHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rewardCard: {
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
    gap: 16,
  },
  rewardCardDisabled: {
    opacity: 0.5,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.lightRose,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardContent: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  rewardTitleDisabled: {
    color: Colors.textSecondary,
  },
  rewardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  rewardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rewardCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.lightRose,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.accentRose,
  },
  pointsTextDisabled: {
    color: Colors.textSecondary,
  },
  addRewardButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 2,
    borderColor: Colors.mediumGray,
    borderStyle: "dashed",
  },
  addRewardText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
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
    maxHeight: "90%",
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
  iconSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconOptionSelected: {
    backgroundColor: Colors.lightRose,
    borderColor: Colors.accentRose,
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
  claimedBadge: {
    alignSelf: "flex-start" as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.success,
    borderRadius: 8,
    marginTop: 8,
  },
  claimedText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
