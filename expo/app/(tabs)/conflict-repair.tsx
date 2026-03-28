import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShieldQuestion, Lock, AlertTriangle, MessageSquareX, CloudRain, HeartCrack, ThumbsDown, ChevronRight, CheckCircle } from "lucide-react-native";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { usePurchases, PremiumFeature } from "@/contexts/PurchaseContext";
import { CONFLICT_REPAIR_SCRIPTS } from "@/constants/premiumContent";

type ConflictIssue = "free" | "jealousy" | "miscommunication" | "stress" | "intimacy_mismatch" | "unappreciated";

export default function ConflictRepairScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { hasFeature, purchaseFeature } = usePurchases();
  const [selectedIssue, setSelectedIssue] = useState<ConflictIssue | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedIssues, setCompletedIssues] = useState<ConflictIssue[]>([]);

  const issueFeatureMap: Record<Exclude<ConflictIssue, "free">, PremiumFeature> = {
    jealousy: "conflict_jealousy",
    miscommunication: "conflict_miscommunication",
    stress: "conflict_stress",
    intimacy_mismatch: "conflict_intimacy_mismatch",
    unappreciated: "conflict_unappreciated",
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "AlertTriangle":
        return AlertTriangle;
      case "MessageSquareX":
        return MessageSquareX;
      case "CloudRain":
        return CloudRain;
      case "HeartCrack":
        return HeartCrack;
      case "ThumbsDown":
        return ThumbsDown;
      default:
        return ShieldQuestion;
    }
  };

  const issues = [
    {
      id: "free" as const,
      title: "General Conflict",
      description: "Basic conflict resolution prompt",
      icon: ShieldQuestion,
      isPremium: false,
      color: colors.accentRose,
    },
    {
      id: "jealousy" as const,
      title: "Jealousy Issues",
      description: "Navigate feelings of jealousy and insecurity",
      iconName: "AlertTriangle",
      isPremium: true,
      color: "#F39C12",
    },
    {
      id: "miscommunication" as const,
      title: "Miscommunication",
      description: "Clear up misunderstandings and improve communication",
      iconName: "MessageSquareX",
      isPremium: true,
      color: "#9B59B6",
    },
    {
      id: "stress" as const,
      title: "External Stress",
      description: "Handle outside stress affecting your relationship",
      iconName: "CloudRain",
      isPremium: true,
      color: "#34495E",
    },
    {
      id: "intimacy_mismatch" as const,
      title: "Intimacy Mismatch",
      description: "Address differences in intimacy needs",
      iconName: "HeartCrack",
      isPremium: true,
      color: "#E74C3C",
    },
    {
      id: "unappreciated" as const,
      title: "Feeling Unappreciated",
      description: "Rebuild appreciation and recognition",
      iconName: "ThumbsDown",
      isPremium: true,
      color: "#16A085",
    },
  ];

  const handleIssuePress = async (issueId: ConflictIssue, isPremium: boolean) => {
    setSelectedIssue(issueId);
    setCurrentStepIndex(0);
  };

  const handleNextStep = async () => {
    const content = getCurrentContent();
    if (!content || selectedIssue === "free") return;

    const steps = content.steps;
    const FREE_STEPS = 2;
    
    if (currentStepIndex < FREE_STEPS - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (currentStepIndex === FREE_STEPS - 1) {
      const featureId = issueFeatureMap[selectedIssue as Exclude<ConflictIssue, "free">];
      if (!hasFeature(featureId)) {
        Alert.alert(
          "Unlock Full Script",
          `You've completed the free steps. Unlock the full ${content.title} script for $1 to access ${steps.length - FREE_STEPS} more steps and complete the repair process.`,
          [
            { text: "Maybe Later", style: "cancel", onPress: () => setSelectedIssue(null) },
            {
              text: "Unlock for $1",
              onPress: async () => {
                const purchased = await purchaseFeature(featureId);
                if (purchased) {
                  setCurrentStepIndex(currentStepIndex + 1);
                } else {
                  setSelectedIssue(null);
                }
              },
            },
          ]
        );
        return;
      }
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setCompletedIssues(prev => [...prev, selectedIssue as Exclude<ConflictIssue, "free">]);
      Alert.alert(
        "Conflict Resolved! 🎉",
        content.reflection + "\n\nThis issue has been marked as completed and will no longer appear in your list.",
        [
          { text: "Back to Issues", onPress: () => setSelectedIssue(null) },
        ]
      );
    }
  };

  const getCurrentContent = () => {
    if (!selectedIssue || selectedIssue === "free") {
      return null;
    }
    return CONFLICT_REPAIR_SCRIPTS.premium[selectedIssue];
  };

  if (selectedIssue) {
    const issue = issues.find((i) => i.id === selectedIssue);
    const content = getCurrentContent();

    if (selectedIssue === "free") {
      const freeScript = CONFLICT_REPAIR_SCRIPTS.free[0];
      return (
        <View style={[styles.container, { backgroundColor: colors.lightGray }]}>
          <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.white }]}>
            <View style={styles.titleContainer}>
              <ShieldQuestion size={32} color={colors.accentRose} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>General Conflict</Text>
            </View>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <View style={[styles.scriptCard, { backgroundColor: colors.white }]}>
              <Text style={[styles.scriptTitle, { color: colors.textPrimary }]}>
                {freeScript.issue}
              </Text>
              <Text style={[styles.scriptText, { color: colors.textSecondary }]}>
                &quot;{freeScript.script}&quot;
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.mediumGray }]}
              onPress={() => setSelectedIssue(null)}
            >
              <Text style={styles.backButtonText}>Back to Issues</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    if (!content) return null;

    const currentStep = content.steps[currentStepIndex];
    const Icon = getIcon(content.icon);

    return (
      <View style={[styles.container, { backgroundColor: colors.lightGray }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.white }]}>
          <View style={styles.titleContainer}>
            <Icon size={32} color={issue?.color || colors.accentRose} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>{content.title}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.progressContainer}>
            <Text style={[styles.stepCounter, { color: colors.textSecondary }]}>
              Step {currentStepIndex + 1} of {content.steps.length}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.lightGray }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: issue?.color || colors.accentRose,
                    width: `${((currentStepIndex + 1) / content.steps.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={[styles.stepCard, { backgroundColor: colors.white }]}>
            <View style={[styles.stepHeader, { borderBottomColor: colors.lightGray }]}>
              <CheckCircle size={24} color={issue?.color || colors.accentRose} />
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                {currentStep.step}
              </Text>
            </View>

            <Text style={[styles.scriptLabel, { color: colors.textSecondary }]}>What to say:</Text>
            <Text style={[styles.scriptText, { color: colors.textPrimary }]}>
              &quot;{currentStep.script}&quot;
            </Text>

            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: issue?.color || colors.accentRose }]}
              onPress={handleNextStep}
            >
              <Text style={styles.nextButtonText}>
                {currentStepIndex < content.steps.length - 1 ? "Next Step" : "Complete & Reflect"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.mediumGray }]}
            onPress={() => setSelectedIssue(null)}
          >
            <Text style={styles.backButtonText}>Back to Issues</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.lightGray }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.white }]}>
        <View style={styles.titleContainer}>
          <ShieldQuestion size={32} color={colors.accentRose} />
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Conflict Repair Wizard</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Navigate difficult conversations with guidance
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          What are you struggling with?
        </Text>

        {completedIssues.length > 0 && (
          <View style={[styles.completedSection, { backgroundColor: colors.white }]}>
            <Text style={[styles.completedText, { color: colors.textSecondary }]}>
              ✅ {completedIssues.length} {completedIssues.length === 1 ? 'conflict' : 'conflicts'} resolved
            </Text>
          </View>
        )}

        {issues.filter(issue => !completedIssues.includes(issue.id)).map((issue) => {
          const Icon = issue.icon || getIcon(issue.iconName || "");
          const isFullyUnlocked = issue.id === "free" || !issue.isPremium || hasFeature(issueFeatureMap[issue.id]);

          return (
            <TouchableOpacity
              key={issue.id}
              style={[
                styles.issueCard,
                { backgroundColor: colors.white },
              ]}
              onPress={() => handleIssuePress(issue.id, issue.isPremium)}
            >
              <View style={[styles.issueIconContainer, { backgroundColor: issue.color + "20" }]}>
                <Icon size={28} color={issue.color} />
              </View>

              <View style={styles.issueInfo}>
                <View style={styles.issueTitleRow}>
                  <Text style={[styles.issueTitle, { color: colors.textPrimary }]}>
                    {issue.title}
                  </Text>
                  {!isFullyUnlocked && <Lock size={16} color={colors.mediumGray} />}
                </View>
                <Text style={[styles.issueDescription, { color: colors.textSecondary }]}>
                  {issue.description}
                </Text>
                {issue.isPremium && issue.id !== "free" && (
                  <Text style={[styles.freePreview, { color: issue.color }]}>
                    {isFullyUnlocked ? "Unlocked" : "2 free steps, unlock full for $1"}
                  </Text>
                )}
              </View>

              <ChevronRight size={24} color={colors.mediumGray} />
            </TouchableOpacity>
          );
        })}

        <View style={[styles.tipCard, { backgroundColor: colors.white }]}>
          <Text style={[styles.tipTitle, { color: colors.textPrimary }]}>🚨 Why This Works</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            When couples fight, they need help fast. These scripts provide proven frameworks to
            navigate difficult moments. Many couples report that having the right words during
            conflict can transform the outcome.
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 16,
  },
  issueCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
  },
  issueCardLocked: {
    opacity: 0.7,
  },
  issueIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  issueInfo: {
    flex: 1,
  },
  issueTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  issueDescription: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  priceTag: {
    fontSize: 13,
    fontWeight: "600" as const,
    marginTop: 6,
  },
  freePreview: {
    fontSize: 12,
    fontWeight: "600" as const,
    marginTop: 6,
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
  completedSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center" as const,
  },
  completedText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  scriptCard: {
    padding: 32,
    borderRadius: 20,
    marginBottom: 24,
  },
  scriptTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 16,
  },
  scriptText: {
    fontSize: 16,
    lineHeight: 26,
    fontStyle: "italic" as const,
  },
  progressContainer: {
    marginBottom: 24,
  },
  stepCounter: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  stepCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    flex: 1,
  },
  scriptLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    marginBottom: 12,
    letterSpacing: 1,
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  nextButtonText: {
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
