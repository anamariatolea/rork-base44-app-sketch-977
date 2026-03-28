import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Users, ChevronRight, CheckCircle } from "lucide-react-native";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useMutation } from "@tanstack/react-query";
import { generateText } from "@rork-ai/toolkit-sdk";

type Question = {
  id: string;
  question: string;
  category: "social" | "lifestyle" | "communication" | "values";
  options: { id: string; label: string; value: number }[];
};

type Answer = {
  questionId: string;
  value: number;
};

const questions: Question[] = [
  {
    id: "q1",
    category: "social",
    question: "How do you prefer to spend your weekends?",
    options: [
      { id: "a", label: "Quiet time at home", value: 1 },
      { id: "b", label: "Mix of both", value: 2 },
      { id: "c", label: "Out socializing with friends", value: 3 },
    ],
  },
  {
    id: "q2",
    category: "social",
    question: "How energized do you feel after social gatherings?",
    options: [
      { id: "a", label: "Drained, need alone time", value: 1 },
      { id: "b", label: "Depends on the event", value: 2 },
      { id: "c", label: "Energized and excited", value: 3 },
    ],
  },
  {
    id: "q3",
    category: "lifestyle",
    question: "How do you approach planning and organization?",
    options: [
      { id: "a", label: "Very structured, love planning", value: 3 },
      { id: "b", label: "Flexible, some planning", value: 2 },
      { id: "c", label: "Spontaneous, go with flow", value: 1 },
    ],
  },
  {
    id: "q4",
    category: "lifestyle",
    question: "How do you handle daily routines?",
    options: [
      { id: "a", label: "Love consistency and routine", value: 3 },
      { id: "b", label: "Some routine is good", value: 2 },
      { id: "c", label: "Prefer variety and change", value: 1 },
    ],
  },
  {
    id: "q5",
    category: "communication",
    question: "How do you prefer to resolve conflicts?",
    options: [
      { id: "a", label: "Talk immediately", value: 3 },
      { id: "b", label: "Take a break, then talk", value: 2 },
      { id: "c", label: "Need time to process", value: 1 },
    ],
  },
  {
    id: "q6",
    category: "communication",
    question: "How do you express affection?",
    options: [
      { id: "a", label: "Words and verbal affirmation", value: 1 },
      { id: "b", label: "Mix of words and actions", value: 2 },
      { id: "c", label: "Physical touch and gifts", value: 3 },
    ],
  },
  {
    id: "q7",
    category: "values",
    question: "What's your approach to finances?",
    options: [
      { id: "a", label: "Save for the future", value: 3 },
      { id: "b", label: "Balance saving and spending", value: 2 },
      { id: "c", label: "Live in the moment", value: 1 },
    ],
  },
  {
    id: "q8",
    category: "values",
    question: "How important is alone time to you?",
    options: [
      { id: "a", label: "Essential, need it daily", value: 1 },
      { id: "b", label: "Nice to have occasionally", value: 2 },
      { id: "c", label: "Prefer together time", value: 3 },
    ],
  },
  {
    id: "q9",
    category: "social",
    question: "How large is your ideal friend circle?",
    options: [
      { id: "a", label: "Few close friends", value: 1 },
      { id: "b", label: "Moderate sized group", value: 2 },
      { id: "c", label: "Large social network", value: 3 },
    ],
  },
  {
    id: "q10",
    category: "social",
    question: "How do you feel about hosting gatherings?",
    options: [
      { id: "a", label: "Prefer being a guest", value: 1 },
      { id: "b", label: "Occasionally enjoy hosting", value: 2 },
      { id: "c", label: "Love hosting parties", value: 3 },
    ],
  },
  {
    id: "q11",
    category: "lifestyle",
    question: "What's your ideal vacation style?",
    options: [
      { id: "a", label: "Planned itinerary", value: 3 },
      { id: "b", label: "Loose plan with flexibility", value: 2 },
      { id: "c", label: "No plans, pure adventure", value: 1 },
    ],
  },
  {
    id: "q12",
    category: "lifestyle",
    question: "How do you approach household chores?",
    options: [
      { id: "a", label: "Need things tidy always", value: 3 },
      { id: "b", label: "Clean regularly, not obsessive", value: 2 },
      { id: "c", label: "Relaxed about cleanliness", value: 1 },
    ],
  },
  {
    id: "q13",
    category: "lifestyle",
    question: "What's your approach to trying new things?",
    options: [
      { id: "a", label: "Prefer familiar experiences", value: 1 },
      { id: "b", label: "Open to new things occasionally", value: 2 },
      { id: "c", label: "Always seeking novelty", value: 3 },
    ],
  },
  {
    id: "q14",
    category: "lifestyle",
    question: "How do you handle stress?",
    options: [
      { id: "a", label: "Need isolation to cope", value: 1 },
      { id: "b", label: "Mix of alone time and support", value: 2 },
      { id: "c", label: "Seek others for support", value: 3 },
    ],
  },
  {
    id: "q15",
    category: "lifestyle",
    question: "What's your preferred sleep schedule?",
    options: [
      { id: "a", label: "Night owl, late to bed/rise", value: 1 },
      { id: "b", label: "Flexible schedule", value: 2 },
      { id: "c", label: "Early bird, early to bed/rise", value: 3 },
    ],
  },
  {
    id: "q16",
    category: "lifestyle",
    question: "What's your approach to technology use?",
    options: [
      { id: "a", label: "Minimal, prefer offline", value: 1 },
      { id: "b", label: "Balanced tech usage", value: 2 },
      { id: "c", label: "Very connected, love tech", value: 3 },
    ],
  },
  {
    id: "q17",
    category: "social",
    question: "How do you celebrate special occasions?",
    options: [
      { id: "a", label: "Low-key, intimate celebration", value: 1 },
      { id: "b", label: "Small gathering with close ones", value: 2 },
      { id: "c", label: "Big party with many people", value: 3 },
    ],
  },
  {
    id: "q18",
    category: "social",
    question: "How do you handle meeting new people?",
    options: [
      { id: "a", label: "Anxious, prefer familiar faces", value: 1 },
      { id: "b", label: "Comfortable after warmup", value: 2 },
      { id: "c", label: "Excited, love new connections", value: 3 },
    ],
  },
  {
    id: "q19",
    category: "communication",
    question: "How direct are you in communication?",
    options: [
      { id: "a", label: "Very direct and straightforward", value: 3 },
      { id: "b", label: "Balance directness with tact", value: 2 },
      { id: "c", label: "Indirect, avoid confrontation", value: 1 },
    ],
  },
  {
    id: "q20",
    category: "communication",
    question: "How do you handle criticism?",
    options: [
      { id: "a", label: "Take it personally, need time", value: 1 },
      { id: "b", label: "Consider it, then respond", value: 2 },
      { id: "c", label: "Welcome feedback openly", value: 3 },
    ],
  },
  {
    id: "q21",
    category: "communication",
    question: "How often do you need deep conversations?",
    options: [
      { id: "a", label: "Rarely, prefer light chat", value: 1 },
      { id: "b", label: "Regularly but not daily", value: 2 },
      { id: "c", label: "Frequently, very important", value: 3 },
    ],
  },
  {
    id: "q22",
    category: "communication",
    question: "How do you make major decisions?",
    options: [
      { id: "a", label: "Rely on intuition and feelings", value: 1 },
      { id: "b", label: "Mix of logic and emotion", value: 2 },
      { id: "c", label: "Analytical, weigh all options", value: 3 },
    ],
  },
  {
    id: "q23",
    category: "communication",
    question: "How do you prefer to spend quality time?",
    options: [
      { id: "a", label: "Quiet activities side by side", value: 1 },
      { id: "b", label: "Mix of talking and activities", value: 2 },
      { id: "c", label: "Deep conversations and sharing", value: 3 },
    ],
  },
  {
    id: "q24",
    category: "values",
    question: "How important is career ambition to you?",
    options: [
      { id: "a", label: "Work to live, not top priority", value: 1 },
      { id: "b", label: "Important but balanced", value: 2 },
      { id: "c", label: "Very ambitious, career focused", value: 3 },
    ],
  },
  {
    id: "q25",
    category: "values",
    question: "How do you view family involvement?",
    options: [
      { id: "a", label: "Keep family at distance", value: 1 },
      { id: "b", label: "Regular but not constant", value: 2 },
      { id: "c", label: "Family is central to life", value: 3 },
    ],
  },
  {
    id: "q26",
    category: "values",
    question: "What's your stance on religion/spirituality?",
    options: [
      { id: "a", label: "Not important to me", value: 1 },
      { id: "b", label: "Somewhat important", value: 2 },
      { id: "c", label: "Very important in my life", value: 3 },
    ],
  },
  {
    id: "q27",
    category: "values",
    question: "How do you approach health and fitness?",
    options: [
      { id: "a", label: "Not a major focus", value: 1 },
      { id: "b", label: "Moderately important", value: 2 },
      { id: "c", label: "Very high priority", value: 3 },
    ],
  },
  {
    id: "q28",
    category: "values",
    question: "What's your view on having children?",
    options: [
      { id: "a", label: "Don't want children", value: 1 },
      { id: "b", label: "Open to possibility", value: 2 },
      { id: "c", label: "Definitely want children", value: 3 },
    ],
  },
  {
    id: "q29",
    category: "values",
    question: "How important is personal growth to you?",
    options: [
      { id: "a", label: "Content with who I am", value: 1 },
      { id: "b", label: "Interested in some growth", value: 2 },
      { id: "c", label: "Constantly seeking improvement", value: 3 },
    ],
  },
  {
    id: "q30",
    category: "values",
    question: "What's your view on compromise in relationships?",
    options: [
      { id: "a", label: "Prefer not to compromise much", value: 1 },
      { id: "b", label: "Willing to meet halfway", value: 2 },
      { id: "c", label: "Very flexible, compromise easily", value: 3 },
    ],
  },
];

export default function CompatibilityScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [step, setStep] = useState<"intro" | "partner1" | "partner2" | "results">("intro");
  const [partner1Answers, setPartner1Answers] = useState<Answer[]>([]);
  const [partner2Answers, setPartner2Answers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      console.log("Analyzing compatibility...");
      
      const categories = ["social", "lifestyle", "communication", "values"];
      const analysis: { category: string; diff: number }[] = [];
      
      categories.forEach(category => {
        const p1 = partner1Answers
          .filter(a => questions.find(q => q.id === a.questionId)?.category === category)
          .reduce((sum, a) => sum + a.value, 0);
        const p2 = partner2Answers
          .filter(a => questions.find(q => q.id === a.questionId)?.category === category)
          .reduce((sum, a) => sum + a.value, 0);
        
        analysis.push({ category, diff: Math.abs(p1 - p2) });
      });

      const areasForGrowth = analysis
        .filter(a => a.diff >= 3)
        .map(a => a.category);

      const prompt = `You are a relationship counselor analyzing a couple's compatibility test results.

They have differences in these areas: ${areasForGrowth.join(", ")}.

Provide 4-5 specific, actionable compromise suggestions that:
1. Acknowledge both partners' needs
2. Create a "team mindset"
3. Include specific day-of-week or frequency recommendations
4. Are warm, supportive, and encouraging

Example format:
"Since one partner is more introverted while the other is extroverted, try this: Dedicate Tuesday evenings for cozy date nights at home (movie, cooking together), and Friday nights for double dates or group outings with friends."

Generate suggestions separated by "---". Be specific and practical.`;

      const response = await generateText(prompt);
      return response.split("---").map(s => s.trim()).filter(s => s.length > 0);
    },
    onSuccess: (data) => {
      console.log("Analysis complete:", data);
      setSuggestions(data);
      setStep("results");
    },
    onError: (error) => {
      console.error("Error analyzing:", error);
      Alert.alert("Error", "Failed to analyze compatibility. Please try again.");
    },
  });

  const handleAnswer = (value: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer: Answer = { questionId: currentQuestion.id, value };

    if (step === "partner1") {
      setPartner1Answers([...partner1Answers, answer]);
    } else if (step === "partner2") {
      setPartner2Answers([...partner2Answers, answer]);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (step === "partner1") {
        Alert.alert(
          "Partner 1 Complete!",
          "Great! Now let's have Partner 2 answer the same questions.",
          [{ text: "Continue", onPress: () => { setStep("partner2"); setCurrentQuestionIndex(0); } }]
        );
      } else if (step === "partner2") {
        analyzeMutation.mutate();
      }
    }
  };

  const calculateCompatibilityScore = () => {
    const totalQuestions = questions.length;
    let similarityScore = 0;

    partner1Answers.forEach((p1Answer) => {
      const p2Answer = partner2Answers.find(a => a.questionId === p1Answer.questionId);
      if (p2Answer) {
        const diff = Math.abs(p1Answer.value - p2Answer.value);
        similarityScore += (2 - diff);
      }
    });

    return Math.round((similarityScore / (totalQuestions * 2)) * 100);
  };

  const renderIntro = () => (
    <View style={styles.introContainer}>
      <Users size={80} color={colors.accentRose} />
      <Text style={[styles.introTitle, { color: colors.textPrimary }]}>
        Couple Compatibility Test
      </Text>
      <Text style={[styles.introDescription, { color: colors.textSecondary }]}>
        Discover your personality differences and get personalized suggestions on how to work better together as a team.
      </Text>

      <View style={[styles.infoCard, { backgroundColor: colors.lightRose }]}>
        <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>What to expect:</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          • 30 questions for each partner{"\n"}
          • AI-powered compatibility analysis{"\n"}
          • Personalized compromise suggestions{"\n"}
          • Team-building recommendations
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: colors.accentRose }]}
        onPress={() => { setStep("partner1"); setCurrentQuestionIndex(0); }}
      >
        <Text style={[styles.startButtonText, { color: colors.white }]}>Start Test</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const partnerName = step === "partner1" ? "Partner 1" : "Partner 2";

    return (
      <View style={styles.questionContainer}>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {partnerName} • Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.lightGray }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.accentRose }]} />
          </View>
        </View>

        <Text style={[styles.questionText, { color: colors.textPrimary }]}>
          {currentQuestion.question}
        </Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionButton, { backgroundColor: colors.white, borderColor: colors.lightRose }]}
              onPress={() => handleAnswer(option.value)}
            >
              <Text style={[styles.optionText, { color: colors.textPrimary }]}>{option.label}</Text>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderResults = () => {
    const score = calculateCompatibilityScore();

    return (
      <ScrollView
        style={styles.resultsContainer}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.scoreCard, { backgroundColor: colors.white, shadowColor: colors.deepSlate }]}>
          <Text style={[styles.scoreTitle, { color: colors.textPrimary }]}>Compatibility Score</Text>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreNumber, { color: colors.accentRose }]}>{score}%</Text>
          </View>
          <Text style={[styles.scoreDescription, { color: colors.textSecondary }]}>
            {score >= 80 ? "Highly Compatible! You naturally align on many things." :
             score >= 60 ? "Great Match! Some differences create growth opportunities." :
             "Different Perspectives! Use these differences to build a stronger team."}
          </Text>
        </View>

        {suggestions.length > 0 && (
          <View style={[styles.suggestionsSection, { backgroundColor: colors.white, shadowColor: colors.deepSlate }]}>
            <Text style={[styles.suggestionsTitle, { color: colors.textPrimary }]}>
              💡 Personalized Suggestions
            </Text>
            <Text style={[styles.suggestionsSubtitle, { color: colors.textSecondary }]}>
              Here&apos;s how you can work better together:
            </Text>

            {suggestions.map((suggestion, index) => (
              <View key={index} style={[styles.suggestionItem, { backgroundColor: colors.lightRose }]}>
                <CheckCircle size={20} color={colors.accentRose} />
                <Text style={[styles.suggestionText, { color: colors.textPrimary }]}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.retakeButton, { backgroundColor: colors.deepSlate }]}
          onPress={() => {
            setStep("intro");
            setPartner1Answers([]);
            setPartner2Answers([]);
            setCurrentQuestionIndex(0);
            setSuggestions([]);
          }}
        >
          <Text style={[styles.retakeButtonText, { color: colors.white }]}>Take Test Again</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.lightRose }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Compatibility</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Build a stronger team together
        </Text>
      </View>

      {analyzeMutation.isPending && (
        <View style={styles.loadingOverlay}>
          <Text style={[styles.loadingText, { color: colors.textPrimary }]}>
            Analyzing your compatibility...
          </Text>
        </View>
      )}

      {step === "intro" && renderIntro()}
      {(step === "partner1" || step === "partner2") && renderQuestion()}
      {step === "results" && renderResults()}
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
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  introContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  introDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  startButton: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: "100%",
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    textAlign: "center",
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600" as const,
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
  questionText: {
    fontSize: 24,
    fontWeight: "700" as const,
    marginBottom: 32,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    fontWeight: "500" as const,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  scoreCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginBottom: 20,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: "#ffe5f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "700" as const,
  },
  scoreDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  suggestionsSection: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  suggestionsTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  suggestionsSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  suggestionItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  retakeButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    zIndex: 999,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginTop: 16,
  },
});
