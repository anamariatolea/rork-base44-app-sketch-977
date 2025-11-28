import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Zap, Lock, Eye, Heart, Star, MessageCircle, Hand, PenLine, Music, Sparkles as SparklesIcon, Timer, Activity } from "lucide-react-native";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { usePurchases } from "@/contexts/PurchaseContext";
import { SPARK_CHALLENGES } from "@/constants/premiumContent";

export default function SparkChallengesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { hasFeature, purchaseFeature } = usePurchases();
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  const hasSparkAccess = hasFeature("spark_challenges");

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Eye":
        return Eye;
      case "Heart":
        return Heart;
      case "Star":
        return Star;
      case "MessageCircle":
        return MessageCircle;
      case "Hand":
        return Hand;
      case "PenLine":
        return PenLine;
      case "Music":
        return Music;
      case "Sparkles":
        return SparklesIcon;
      default:
        return Zap;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "#2ECC71";
      case "Medium":
        return "#F39C12";
      case "Hard":
        return "#E74C3C";
      default:
        return colors.mediumGray;
    }
  };

  const handleChallengePress = async (challengeId: string) => {
    if (!hasSparkAccess) {
      const purchased = await purchaseFeature("spark_challenges");
      if (!purchased) return;
    }
    setSelectedChallenge(challengeId);
  };

  const handleCompleteChallenge = () => {
    Alert.alert(
      "Challenge Complete!",
      "Amazing work! Physical connection challenges like this strengthen your bond.",
      [
        { text: "Back to Challenges", onPress: () => setSelectedChallenge(null) },
        { text: "Try Another", onPress: () => setSelectedChallenge(null) },
      ]
    );
  };

  if (selectedChallenge) {
    const challenge = SPARK_CHALLENGES.find((c) => c.id === selectedChallenge);
    if (!challenge) return null;

    const Icon = getIcon(challenge.icon);
    const difficultyColor = getDifficultyColor(challenge.difficulty);

    return (
      <View style={[styles.container, { backgroundColor: colors.lightGray }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.white }]}>
          <View style={styles.titleContainer}>
            <Icon size={32} color={colors.accentRose} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>{challenge.title}</Text>
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.challengeDetailCard, { backgroundColor: colors.white }]}>
            <View style={styles.metaRow}>
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + "20" }]}>
                <Activity size={16} color={difficultyColor} />
                <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                  {challenge.difficulty}
                </Text>
              </View>
              <View style={[styles.durationBadge, { backgroundColor: colors.lightRose }]}>
                <Timer size={16} color={colors.accentRose} />
                <Text style={[styles.durationText, { color: colors.accentRose }]}>
                  {challenge.duration}
                </Text>
              </View>
            </View>

            <Text style={[styles.challengeDescription, { color: colors.textPrimary }]}>
              {challenge.description}
            </Text>

            <View style={[styles.benefitCard, { backgroundColor: colors.lightGray }]}>
              <Text style={[styles.benefitLabel, { color: colors.textSecondary }]}>
                💫 Why This Works
              </Text>
              <Text style={[styles.benefitText, { color: colors.textPrimary }]}>
                {challenge.benefit}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.completeButton, { backgroundColor: colors.accentRose }]}
              onPress={handleCompleteChallenge}
            >
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.mediumGray }]}
            onPress={() => setSelectedChallenge(null)}
          >
            <Text style={styles.backButtonText}>Back to Challenges</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.lightGray }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.white }]}>
        <View style={styles.titleContainer}>
          <Zap size={32} color={colors.accentRose} />
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Spark Pack</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Physical Connection Challenges
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {!hasSparkAccess && (
          <TouchableOpacity
            style={[styles.unlockBanner, { backgroundColor: colors.accentRose }]}
            onPress={() => purchaseFeature("spark_challenges")}
          >
            <Lock size={24} color={colors.white} />
            <View style={{ flex: 1 }}>
              <Text style={styles.unlockTitle}>Unlock Spark Pack</Text>
              <Text style={styles.unlockSubtitle}>
                Access all physical connection challenges for $1
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {hasSparkAccess ? "Your Challenges" : "Preview Challenges"}
        </Text>

        {SPARK_CHALLENGES.map((challenge) => {
          const Icon = getIcon(challenge.icon);
          const difficultyColor = getDifficultyColor(challenge.difficulty);
          const isLocked = !hasSparkAccess;

          return (
            <TouchableOpacity
              key={challenge.id}
              style={[
                styles.challengeCard,
                { backgroundColor: colors.white },
                isLocked && styles.challengeCardLocked,
              ]}
              onPress={() => handleChallengePress(challenge.id)}
            >
              <View style={[styles.challengeIconContainer, { backgroundColor: colors.lightRose }]}>
                <Icon size={28} color={isLocked ? colors.mediumGray : colors.accentRose} />
              </View>

              <View style={styles.challengeInfo}>
                <View style={styles.challengeTitleRow}>
                  <Text style={[styles.challengeTitle, { color: isLocked ? colors.textSecondary : colors.textPrimary }]}>
                    {challenge.title}
                  </Text>
                  {isLocked && <Lock size={16} color={colors.mediumGray} />}
                </View>
                <Text style={[styles.challengeSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                  {challenge.description}
                </Text>
                <View style={styles.challengeMeta}>
                  <View style={[styles.metaBadge, { backgroundColor: difficultyColor + "15" }]}>
                    <Text style={[styles.metaText, { color: difficultyColor }]}>
                      {challenge.difficulty}
                    </Text>
                  </View>
                  <View style={[styles.metaBadge, { backgroundColor: colors.lightRose }]}>
                    <Text style={[styles.metaText, { color: colors.accentRose }]}>
                      {challenge.duration}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.tipCard, { backgroundColor: colors.white }]}>
          <Text style={[styles.tipTitle, { color: colors.textPrimary }]}>🔥 Why Spark Pack?</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            These micro-challenges are designed to increase physical and emotional closeness.
            They&apos;re quick, impactful, and scientifically backed to release oxytocin (the bonding hormone).
            Couples who do these regularly report feeling more connected and attracted to each other.
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
    paddingBottom: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  unlockBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    gap: 16,
  },
  unlockTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "white",
  },
  unlockSubtitle: {
    fontSize: 14,
    color: "white",
    marginTop: 4,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 16,
  },
  challengeCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
  },
  challengeCardLocked: {
    opacity: 0.7,
  },
  challengeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    flex: 1,
  },
  challengeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  challengeMeta: {
    flexDirection: "row",
    gap: 8,
  },
  metaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  tipCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 22,
  },
  challengeDetailCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  durationText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  challengeDescription: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 20,
  },
  benefitCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  benefitLabel: {
    fontSize: 14,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 15,
    lineHeight: 24,
  },
  completeButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "white",
  },
  backButton: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "white",
  },
});
