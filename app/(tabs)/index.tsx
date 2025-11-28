import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, Target, Calendar, TrendingUp, Smile, Meh, Frown, Zap, Battery, Briefcase, Flame, History, Camera, ImageIcon, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useStreak } from "@/contexts/StreakContext";
import { useMood, MoodType } from "@/contexts/MoodContext";
import MoodHistoryModal from "@/components/MoodHistoryModal";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { analyzeImage } from "@/constants/gemini";
import { usePhotoStorage } from "@/contexts/PhotoStorageContext";

export default function HeartbeatScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { streak, recordActivity } = useStreak();
  const { currentMood, recordMood, moodHistory } = useMood();
  const [partnerMood] = useState<MoodType>("happy");
  const [showMoodHistory, setShowMoodHistory] = useState(false);
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const router = useRouter();
  const { addPhoto } = usePhotoStorage();

  useEffect(() => {
    recordActivity();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const relationshipScore = 85;
  const dailyGoals = [
    { id: 1, title: "Morning text", completed: true },
    { id: 2, title: "Share something funny", completed: true },
    { id: 3, title: "Evening call", completed: false },
  ];
  const upcomingEvents = [
    { id: 1, title: "Date Night: Italian Restaurant", date: "Tonight, 7 PM" },
    { id: 2, title: "Anniversary", date: "Dec 12" },
  ];

  const completedGoals = dailyGoals.filter(g => g.completed).length;
  const totalGoals = dailyGoals.length;

  const handleMoodPress = async (mood: MoodType) => {
    await recordMood(mood);
  };

  const analyzeMutation = useMutation({
    mutationFn: async (imageUri: string) => {
      console.log("Analyzing image with Gemini:", imageUri);
      return await analyzeImage(imageUri);
    },
    onSuccess: async (data, imageUri) => {
      console.log("Analysis complete:", data);
      await addPhoto({
        uri: imageUri,
        caption: data.caption,
        category: "memory",
        description: data.description,
        mood: data.mood,
        tags: data.suggestedTags,
        relationshipMoment: data.relationshipMoment,
      });
      Alert.alert("Memory Added!", "Your memory has been saved successfully.");
    },
    onError: (error) => {
      console.error("Analysis error:", error);
      Alert.alert("Analysis Failed", "Could not analyze the image. Please try again.");
    },
  });

  const pickImage = async () => {
    console.log("Picking image...");
    setShowAddMemoryModal(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("Permission status:", status);

    if (status !== "granted") {
      console.log("Permission denied");
      Alert.alert("Permission Required", "Please grant photo library access to add memories.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    console.log("Image picker result:", result);

    if (!result.canceled && result.assets[0]) {
      analyzeMutation.mutate(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    console.log("Taking picture...");
    setShowAddMemoryModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    console.log("Camera permission status:", status);

    if (status !== "granted") {
      console.log("Permission denied");
      Alert.alert("Permission Required", "Please grant camera access to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    console.log("Camera result:", result);

    if (!result.canceled && result.assets[0]) {
      analyzeMutation.mutate(result.assets[0].uri);
    }
  };

  const handleGetIdea = () => {
    console.log("Navigating to Spark tab");
    router.push("/spark");
  };

  const MoodButton = ({ mood, icon: Icon, label, isSelected, onPress }: any) => (
    <TouchableOpacity
      style={[
        styles.moodButton,
        { backgroundColor: colors.lightGray },
        isSelected && {
          backgroundColor: colors.lightRose,
          borderColor: colors.accentRose,
        },
      ]}
      onPress={onPress}
    >
      <Icon
        size={32}
        color={isSelected ? colors.accentRose : colors.textSecondary}
      />
      <Text
        style={[
          styles.moodLabel,
          { color: colors.textSecondary },
          isSelected && { color: colors.accentRose },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <LinearGradient
        colors={[colors.softRose, colors.lightRose, colors.white]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={[styles.greeting, { color: colors.deepSlate }]}>Good evening</Text>
        <Text style={[styles.title, { color: colors.deepSlate }]}>Us & Co</Text>
        <Text style={[styles.subtitle, { color: colors.deepSlate }]}>Your Relationship Dashboard</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.scoreCard, { backgroundColor: colors.white, shadowColor: colors.deepSlate }]}>
          <View style={styles.scoreHeader}>
            <Heart size={28} color={colors.accentRose} fill={colors.accentRose} />
            <Text style={[styles.scoreTitle, { color: colors.textPrimary }]}>Relationship Health</Text>
          </View>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreNumber, { color: colors.accentRose }]}>{relationshipScore}</Text>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Strong</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.mediumGray }]}>
            <View style={[styles.progressFill, { width: `${relationshipScore}%`, backgroundColor: colors.accentRose }]} />
          </View>
          <Text style={[styles.scoreDescription, { color: colors.textSecondary }]}>
            You&apos;re doing great! Keep nurturing your connection.
          </Text>
        </View>

        <View style={[styles.streakCard, { backgroundColor: colors.white, shadowColor: colors.deepSlate }]}>
          <View style={styles.streakHeader}>
            <Flame size={24} color={colors.accentRose} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Daily Streak</Text>
          </View>
          <View style={styles.streakContent}>
            <View style={styles.streakItem}>
              <Text style={[styles.streakNumber, { color: colors.accentRose }]}>{streak.currentStreak}</Text>
              <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Current</Text>
            </View>
            <View style={[styles.streakDivider, { backgroundColor: colors.lightGray }]} />
            <View style={styles.streakItem}>
              <Text style={[styles.streakNumber, { color: colors.accentRose }]}>{streak.longestStreak}</Text>
              <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Best</Text>
            </View>
            <View style={[styles.streakDivider, { backgroundColor: colors.lightGray }]} />
            <View style={styles.streakItem}>
              <Text style={[styles.streakNumber, { color: colors.accentRose }]}>{streak.totalDaysActive}</Text>
              <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Total</Text>
            </View>
          </View>
          <Text style={[styles.streakDescription, { color: colors.textSecondary }]}>Keep using the app daily to maintain your streak! 🔥</Text>
        </View>

        <View style={[styles.moodCard, { backgroundColor: colors.white, shadowColor: colors.deepSlate }]}>
          <View style={styles.moodCardHeader}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>How are you feeling today?</Text>
            <TouchableOpacity
              onPress={() => setShowMoodHistory(true)}
              style={[styles.historyButton, { backgroundColor: colors.lightGray }]}
            >
              <History size={18} color={colors.accentRose} />
              <Text style={[styles.historyButtonText, { color: colors.accentRose }]}>History</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.moodButtons}>
            <MoodButton
              mood="happy"
              icon={Smile}
              label="Happy"
              isSelected={currentMood === "happy"}
              onPress={() => handleMoodPress("happy")}
            />
            <MoodButton
              mood="neutral"
              icon={Meh}
              label="Okay"
              isSelected={currentMood === "neutral"}
              onPress={() => handleMoodPress("neutral")}
            />
            <MoodButton
              mood="sad"
              icon={Frown}
              label="Down"
              isSelected={currentMood === "sad"}
              onPress={() => handleMoodPress("sad")}
            />
          </View>
          <View style={[styles.moodButtons, { marginTop: 12 }]}>
            <MoodButton
              mood="tired"
              icon={Battery}
              label="Tired"
              isSelected={currentMood === "tired"}
              onPress={() => handleMoodPress("tired")}
            />
            <MoodButton
              mood="exciting"
              icon={Zap}
              label="Exciting"
              isSelected={currentMood === "exciting"}
              onPress={() => handleMoodPress("exciting")}
            />
            <MoodButton
              mood="busy"
              icon={Briefcase}
              label="Busy"
              isSelected={currentMood === "busy"}
              onPress={() => handleMoodPress("busy")}
            />
          </View>
          {partnerMood && (
            <View style={[styles.partnerMoodContainer, { backgroundColor: colors.lightRose }]}>
              <Text style={[styles.partnerMoodText, { color: colors.textPrimary }]}>
                Your partner is feeling {partnerMood === "happy" ? "😊 Happy" : partnerMood === "neutral" ? "😐 Okay" : "😔 Down"}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.goalsCard, { backgroundColor: colors.white, shadowColor: colors.deepSlate }]}>
          <View style={styles.cardHeader}>
            <Target size={22} color={colors.accentRose} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Today&apos;s Goals</Text>
          </View>
          <View style={[styles.goalProgress, { backgroundColor: colors.lightGray }]}>
            <Text style={[styles.goalProgressText, { color: colors.textPrimary }]}>
              {completedGoals} of {totalGoals} completed
            </Text>
            <TrendingUp size={18} color={colors.success} />
          </View>
          {dailyGoals.map((goal) => (
            <View key={goal.id} style={styles.goalItem}>
              <View
                style={[
                  styles.goalCheckbox,
                  { borderColor: colors.mediumGray },
                  goal.completed && {
                    backgroundColor: colors.success,
                    borderColor: colors.success,
                  },
                ]}
              >
                {goal.completed && <Text style={[styles.checkmark, { color: colors.white }]}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.goalText,
                  { color: colors.textPrimary },
                  goal.completed && { color: colors.textSecondary },
                ]}
              >
                {goal.title}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.eventsCard, { backgroundColor: colors.white, shadowColor: colors.deepSlate }]}>
          <View style={styles.cardHeader}>
            <Calendar size={22} color={colors.accentRose} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Upcoming</Text>
          </View>
          {upcomingEvents.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={[styles.eventDot, { backgroundColor: colors.accentRose }]} />
              <View style={styles.eventContent}>
                <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{event.title}</Text>
                <Text style={[styles.eventDate, { color: colors.textSecondary }]}>{event.date}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.deepSlate }]}
            onPress={() => setShowAddMemoryModal(true)}
          >
            <Text style={[styles.actionButtonText, { color: colors.white }]}>📝 Add Memory</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.deepSlate }]}
            onPress={handleGetIdea}
          >
            <Text style={[styles.actionButtonText, { color: colors.white }]}>💡 Get Idea</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <MoodHistoryModal
        visible={showMoodHistory}
        onClose={() => setShowMoodHistory(false)}
        moodHistory={moodHistory}
      />

      <Modal
        visible={showAddMemoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddMemoryModal(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={[styles.pickerModalContent, { backgroundColor: colors.white }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: colors.textPrimary }]}>Add Memory</Text>
              <TouchableOpacity onPress={() => setShowAddMemoryModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={[styles.pickerOption, { backgroundColor: colors.lightGray }]} onPress={takePicture}>
              <View style={[styles.pickerIconContainer, { backgroundColor: colors.white }]}>
                <Camera size={28} color={colors.accentRose} />
              </View>
              <View style={styles.pickerTextContainer}>
                <Text style={[styles.pickerOptionTitle, { color: colors.textPrimary }]}>Take Photo</Text>
                <Text style={[styles.pickerOptionSubtitle, { color: colors.textSecondary }]}>Capture a new memory with camera</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.pickerOption, { backgroundColor: colors.lightGray }]} onPress={pickImage}>
              <View style={[styles.pickerIconContainer, { backgroundColor: colors.white }]}>
                <ImageIcon size={28} color={colors.accentRose} />
              </View>
              <View style={styles.pickerTextContainer}>
                <Text style={[styles.pickerOptionTitle, { color: colors.textPrimary }]}>Choose from Library</Text>
                <Text style={[styles.pickerOptionSubtitle, { color: colors.textSecondary }]}>Upload an existing photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  greeting: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  scoreCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  scoreCircle: {
    alignItems: "center",
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: "700" as const,
  },
  scoreLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  moodCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  moodCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  historyButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 16,
  },
  moodButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  moodButton: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  moodLabel: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: "600" as const,
  },
  partnerMoodContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  partnerMoodText: {
    fontSize: 14,
    textAlign: "center",
  },
  streakCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  streakContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  streakItem: {
    alignItems: "center",
    flex: 1,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  streakDivider: {
    width: 1,
    height: 40,
  },
  streakDescription: {
    fontSize: 13,
    textAlign: "center",
  },
  goalsCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  goalProgress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  goalProgressText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  goalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  goalText: {
    fontSize: 15,
    flex: 1,
  },
  eventsCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    gap: 12,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 13,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  pickerModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  pickerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  pickerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  pickerTextContainer: {
    flex: 1,
  },
  pickerOptionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  pickerOptionSubtitle: {
    fontSize: 14,
  },
});
