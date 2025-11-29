import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageSquare, Lock, Shield, Heart as HeartIcon, Flame, Bandage, Baby, ChevronRight, Shuffle } from "lucide-react-native";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { usePurchases, PremiumFeature } from "@/contexts/PurchaseContext";
import { CONVERSATION_PACKS } from "@/constants/premiumContent";

type ConversationPack = "free" | "trust" | "intimacy" | "sex" | "healing" | "childhood";

export default function ConversationsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { hasFeature, purchaseFeature } = usePurchases();
  const [selectedPack, setSelectedPack] = useState<ConversationPack | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const packFeatureMap: Record<Exclude<ConversationPack, "free">, PremiumFeature> = {
    trust: "conversation_trust",
    intimacy: "conversation_intimacy",
    sex: "conversation_sex",
    healing: "conversation_healing",
    childhood: "conversation_childhood",
  };

  const packs = [
    {
      id: "free" as const,
      title: "Basic Questions",
      description: "Essential questions to strengthen your connection",
      icon: MessageSquare,
      isPremium: false,
      color: colors.accentRose,
    },
    {
      id: "trust" as const,
      title: "Trust Builder Pack",
      description: "Build deeper trust and security in your relationship",
      icon: Shield,
      isPremium: true,
      color: "#4A90E2",
    },
    {
      id: "intimacy" as const,
      title: "Emotional Intimacy Pack",
      description: "Connect on a deeper emotional level",
      icon: HeartIcon,
      isPremium: true,
      color: "#E24A90",
    },
    {
      id: "sex" as const,
      title: "Sex & Connection Pack",
      description: "Open conversations about physical intimacy",
      icon: Flame,
      isPremium: true,
      color: "#FF6B6B",
    },
    {
      id: "healing" as const,
      title: "Healing & Repair Pack",
      description: "Work through conflicts and past hurts together",
      icon: Bandage,
      isPremium: true,
      color: "#4ECDC4",
    },
    {
      id: "childhood" as const,
      title: "Childhood & Attachment Pack",
      description: "Understand how your past shapes your relationship",
      icon: Baby,
      isPremium: true,
      color: "#95E1D3",
    },
  ];

  const handlePackPress = async (packId: ConversationPack, isPremium: boolean) => {
    if (isPremium && packId !== "free") {
      const featureId = packFeatureMap[packId];
      if (!hasFeature(featureId)) {
        const purchased = await purchaseFeature(featureId);
        if (!purchased) return;
      }
    }
    setSelectedPack(packId);
    setCurrentQuestionIndex(0);
  };

  const getCurrentQuestions = (): string[] => {
    if (!selectedPack) return [];
    if (selectedPack === "free") return CONVERSATION_PACKS.free;
    return CONVERSATION_PACKS.premium[selectedPack];
  };

  const getRandomQuestion = () => {
    const questions = getCurrentQuestions();
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestionIndex(randomIndex);
  };

  const handleNextQuestion = () => {
    const questions = getCurrentQuestions();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      Alert.alert("Pack Complete!", "You've gone through all questions in this pack.", [
        { text: "Back to Packs", onPress: () => setSelectedPack(null) },
        { text: "Restart", onPress: () => setCurrentQuestionIndex(0) },
      ]);
    }
  };

  if (selectedPack) {
    const questions = getCurrentQuestions();
    const currentQuestion = questions[currentQuestionIndex];
    const pack = packs.find((p) => p.id === selectedPack);

    return (
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.lightGray }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.white }]}>
          <View style={styles.titleContainer}>
            <MessageSquare size={32} color={pack?.color || colors.accentRose} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>{pack?.title}</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.questionPlayArea}>
            <Text style={[styles.questionCounter, { color: colors.textSecondary }]}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>

            <View style={[styles.questionCard, { backgroundColor: colors.white }]}>
              <Text style={[styles.questionText, { color: colors.textPrimary }]}>
                {currentQuestion}
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.mediumGray, flex: 1 }]}
                  onPress={getRandomQuestion}
                >
                  <Shuffle size={20} color={colors.white} />
                  <Text style={styles.actionButtonText}>Random</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: pack?.color || colors.accentRose, flex: 1 }]}
                  onPress={handleNextQuestion}
                >
                  <Text style={styles.actionButtonText}>Next Question</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.mediumGray }]}
              onPress={() => setSelectedPack(null)}
            >
              <Text style={styles.backButtonText}>Back to Packs</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.lightGray }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.white }]}>
        <View style={styles.titleContainer}>
          <MessageSquare size={32} color={colors.accentRose} />
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Deep Conversations</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Strengthen your emotional connection
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Choose a Conversation Pack</Text>

        {packs.map((pack) => {
          const Icon = pack.icon;
          const isLocked = pack.isPremium && pack.id !== "free" && !hasFeature(packFeatureMap[pack.id]);

          return (
            <TouchableOpacity
              key={pack.id}
              style={[
                styles.packCard,
                { backgroundColor: colors.white },
                isLocked && styles.packCardLocked,
              ]}
              onPress={() => handlePackPress(pack.id, pack.isPremium)}
            >
              <View style={[styles.packIconContainer, { backgroundColor: pack.color + "20" }]}>
                <Icon size={28} color={isLocked ? colors.mediumGray : pack.color} />
              </View>

              <View style={styles.packInfo}>
                <View style={styles.packTitleRow}>
                  <Text style={[styles.packTitle, { color: isLocked ? colors.textSecondary : colors.textPrimary }]}>
                    {pack.title}
                  </Text>
                  {isLocked && <Lock size={16} color={colors.mediumGray} />}
                </View>
                <Text style={[styles.packDescription, { color: colors.textSecondary }]}>
                  {pack.description}
                </Text>
                {isLocked && (
                  <Text style={[styles.priceTag, { color: pack.color }]}>
                    Unlock for $1
                  </Text>
                )}
              </View>

              <ChevronRight size={24} color={colors.mediumGray} />
            </TouchableOpacity>
          );
        })}

        <View style={[styles.tipCard, { backgroundColor: colors.white }]}>
          <Text style={[styles.tipTitle, { color: colors.textPrimary }]}>💡 Pro Tip</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            These conversation packs are extremely popular with couples. They help create a safe space for
            vulnerable conversations and strengthen your emotional bond.
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
  packCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
  },
  packCardLocked: {
    opacity: 0.7,
  },
  packIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  packInfo: {
    flex: 1,
  },
  packTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  packTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  packDescription: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  priceTag: {
    fontSize: 13,
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
  questionPlayArea: {
    flex: 1,
  },
  questionCounter: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  questionCard: {
    padding: 32,
    borderRadius: 20,
    minHeight: 350,
    justifyContent: "center",
  },
  questionText: {
    fontSize: 22,
    fontWeight: "600" as const,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 34,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "white",
  },
  backButton: {
    marginTop: 24,
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
