import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Coins, Coffee, UtensilsCrossed, Sparkles, Home, Music, Heart } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

type Reward = {
  id: number;
  title: string;
  description: string;
  points: number;
  icon: any;
  category: string;
};

export default function LoveBankScreen() {
  const insets = useSafeAreaInsets();
  const myPoints = 125;
  const partnerPoints = 98;

  const rewards: Reward[] = [
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

  const RewardCard = ({ reward }: { reward: Reward }) => {
    const Icon = reward.icon;
    const canAfford = myPoints >= reward.points;

    return (
      <TouchableOpacity
        style={[styles.rewardCard, !canAfford && styles.rewardCardDisabled]}
        disabled={!canAfford}
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
              <Text style={[styles.pointsText, !canAfford && styles.pointsTextDisabled]}>
                {reward.points}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
              <Text style={styles.pointsNumber}>{myPoints}</Text>
            </View>
          </View>
          <View style={styles.pointsDivider} />
          <View style={styles.pointsSection}>
            <Text style={styles.pointsLabel}>Partner&apos;s Points</Text>
            <View style={styles.pointsValue}>
              <Coins size={32} color={Colors.white} />
              <Text style={styles.pointsNumber}>{partnerPoints}</Text>
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

        <TouchableOpacity style={styles.addRewardButton}>
          <Text style={styles.addRewardText}>+ Add Custom Reward</Text>
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
});
