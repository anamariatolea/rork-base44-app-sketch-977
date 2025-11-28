import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkles, MessageCircle, MapPin, Lightbulb, RefreshCw, Send, Clock, DollarSign } from "lucide-react-native";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateText } from "@rork-ai/toolkit-sdk";
import Colors from "@/constants/colors";

type SuggestionCategory = "date" | "conversation" | "activity" | "advice";

export default function SparkScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<SuggestionCategory>("date");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [adviceMessage, setAdviceMessage] = useState("");
  const [senderEmail, setSenderEmail] = useState("");

  const generateMutation = useMutation({
    mutationFn: async (category: SuggestionCategory) => {
      console.log("Generating suggestions for category:", category);
      
      const prompts = {
        date: "Generate 3 unique and creative date night ideas for a couple. Make them specific, romantic, and varied in activity type (e.g., adventurous, cozy, cultural). Format each as a short 2-3 sentence description. Separate each idea with '---'.",
        conversation: "Generate 3 deep, meaningful conversation starters for couples to strengthen their emotional connection. Make them thought-provoking but not too heavy. Format as questions. Separate each with '---'.",
        activity: "Generate 3 fun activities couples can do together to bond and create memories. Include indoor and outdoor options. Make them creative and engaging. Format each as a short 2-3 sentence description. Separate each with '---'.",
        advice: "Generate 3 pieces of relationship advice for couples to maintain a healthy, loving relationship. Make them practical, actionable, and heartfelt. Format each as a short 2-3 sentence tip. Separate each with '---'.",
      };

      const response = await generateText(prompts[category]);
      console.log("AI Response:", response);
      
      return response.split("---").map((s) => s.trim()).filter((s) => s.length > 0);
    },
    onSuccess: (data) => {
      console.log("Generated suggestions:", data);
      setSuggestions(data);
    },
    onError: (error) => {
      console.error("Error generating suggestions:", error);
    },
  });

  const handleGenerate = () => {
    console.log("Generate button clicked");
    generateMutation.mutate(activeCategory);
  };

  const handleSendAdviceRequest = () => {
    if (!adviceMessage.trim()) {
      Alert.alert("Message Required", "Please enter your dating advice question before sending.");
      return;
    }
    if (!senderEmail.trim() || !senderEmail.includes('@')) {
      Alert.alert("Email Required", "Please enter a valid email address so we can respond to you.");
      return;
    }

    const subject = "Dating Advice Request - Us & Co";
    const body = `Email: ${senderEmail}\n\nMessage:\n${adviceMessage}\n\n---\nNote: This is a paid request ($1). Payment processing will be handled separately.`;
    const mailtoUrl = `mailto:anamaria_tolea@live.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Alert.alert(
      "Send Advice Request?",
      "This will cost $1 and you'll receive a response within 24-48 hours. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            Linking.openURL(mailtoUrl).then(() => {
              Alert.alert(
                "Request Sent!",
                "Thank you! Your dating advice request has been submitted. You'll receive a response within 24-48 hours."
              );
              setAdviceMessage("");
              setSenderEmail("");
            }).catch(() => {
              Alert.alert(
                "Unable to Send",
                "Please contact support directly at anamaria_tolea@live.com"
              );
            });
          },
        },
      ]
    );
  };

  const CategoryButton = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: SuggestionCategory;
    icon: any;
  }) => (
    <TouchableOpacity
      style={[styles.categoryButton, activeCategory === value && styles.categoryButtonActive]}
      onPress={() => {
        setActiveCategory(value);
        setSuggestions([]);
      }}
    >
      <Icon
        size={20}
        color={activeCategory === value ? Colors.white : Colors.accentRose}
      />
      <Text
        style={[
          styles.categoryText,
          activeCategory === value && styles.categoryTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.titleContainer}>
          <Sparkles size={32} color={Colors.accentRose} />
          <View>
            <Text style={styles.title}>The Spark</Text>
            <Text style={styles.subtitle}>AI-Powered Relationship Coach</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>What do you need inspiration for?</Text>

        <View style={styles.categories}>
          <CategoryButton label="Date Ideas" value="date" icon={MapPin} />
          <CategoryButton label="Conversations" value="conversation" icon={MessageCircle} />
        </View>
        <View style={styles.categories}>
          <CategoryButton label="Activities" value="activity" icon={Lightbulb} />
          <CategoryButton label="Advice" value="advice" icon={Sparkles} />
        </View>

        <TouchableOpacity
          style={[
            styles.generateButton,
            generateMutation.isPending && styles.generateButtonDisabled,
          ]}
          onPress={handleGenerate}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <RefreshCw size={20} color={Colors.white} />
          )}
          <Text style={styles.generateButtonText}>
            {generateMutation.isPending ? "Generating..." : "Generate Ideas"}
          </Text>
        </TouchableOpacity>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Here are your personalized suggestions:</Text>
            {suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionCard}>
                <View style={styles.suggestionNumber}>
                  <Text style={styles.suggestionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}

        {!generateMutation.isPending && suggestions.length === 0 && (
          <View style={styles.emptyState}>
            <Sparkles size={64} color={Colors.mediumGray} />
            <Text style={styles.emptyStateText}>
              Tap &quot;Generate Ideas&quot; to get AI-powered suggestions
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.personalAdviceSection}>
          <View style={styles.personalAdviceHeader}>
            <MessageCircle size={28} color={Colors.accentRose} />
            <View style={{ flex: 1 }}>
              <Text style={styles.personalAdviceTitle}>Personal Dating Advice</Text>
              <Text style={styles.personalAdviceSubtitle}>
                Get personalized advice directly from our relationship expert
              </Text>
            </View>
          </View>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Clock size={18} color={Colors.textSecondary} />
              <Text style={styles.featureText}>24-48 hour response time</Text>
            </View>
            <View style={styles.featureItem}>
              <DollarSign size={18} color={Colors.textSecondary} />
              <Text style={styles.featureText}>$1 per message</Text>
            </View>
          </View>

          <TextInput
            style={styles.emailInput}
            placeholder="Your email address"
            placeholderTextColor={Colors.mediumGray}
            value={senderEmail}
            onChangeText={setSenderEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.adviceInput}
            placeholder="Share your situation and ask for advice..."
            placeholderTextColor={Colors.mediumGray}
            value={adviceMessage}
            onChangeText={setAdviceMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendAdviceRequest}
          >
            <Send size={20} color={Colors.white} />
            <Text style={styles.sendButtonText}>Send Request ($1)</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Payment will be processed securely. You&apos;ll receive expert dating advice tailored to your situation.
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
    backgroundColor: Colors.lightGray,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: Colors.white,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  categories: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  categoryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.lightRose,
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: Colors.accentRose,
    borderColor: Colors.accentRose,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.accentRose,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.deepSlate,
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 24,
    gap: 10,
    shadowColor: Colors.deepSlate,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700" as const,
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  suggestionCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.deepSlate,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  suggestionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightRose,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionNumberText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.accentRose,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightRose,
    marginVertical: 32,
  },
  personalAdviceSection: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.deepSlate,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  personalAdviceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
  },
  personalAdviceTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  personalAdviceSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  featuresList: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  emailInput: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.lightRose,
  },
  adviceInput: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 120,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.lightRose,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accentRose,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700" as const,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
