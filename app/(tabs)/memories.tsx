import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Plus, Heart, Sparkles, Camera, ImageIcon, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { analyzeImage, scanMemoryForInsights } from "@/constants/gemini";
import { usePhotoStorage, StoredPhoto } from "@/contexts/PhotoStorageContext";

const { width } = Dimensions.get("window");
const imageSize = (width - 60) / 2;



export default function MemoriesScreen() {
  const insets = useSafeAreaInsets();
  const { photos, getPhotosByCategory, addPhoto, updatePhoto, likePhoto } = usePhotoStorage();
  const [memories, setMemories] = useState<StoredPhoto[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<StoredPhoto | null>(null);
  const [showPickerModal, setShowPickerModal] = useState(false);

  useEffect(() => {
    const memoryPhotos = getPhotosByCategory("memory");
    setMemories(memoryPhotos);
  }, [photos, getPhotosByCategory]);

  const analyzeMutation = useMutation({
    mutationFn: async (imageUri: string) => {
      console.log("Analyzing image with Gemini:", imageUri);
      console.log("API Key present:", !!process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY);
      
      if (!process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY) {
        throw new Error("Gemini API key not configured. Please add EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY to your environment.");
      }
      
      return await analyzeImage(imageUri);
    },
    onSuccess: async (data, imageUri) => {
      console.log("Analysis complete:", data);
      try {
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
      } catch (storageError) {
        console.error("Storage error:", storageError);
        Alert.alert("Storage Failed", "Photo analyzed but failed to save. Please try again.");
      }
    },
    onError: (error: any) => {
      console.error("Analysis error:", error);
      const errorMessage = error?.message || "Could not analyze the image. Please try again.";
      Alert.alert("Analysis Failed", errorMessage);
    },
  });

  const insightMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const photo = memories.find(m => m.id === photoId);
      if (!photo) throw new Error("Photo not found");
      console.log("Getting insights for memory:", photoId);
      return await scanMemoryForInsights(photo.uri);
    },
    onSuccess: async (insight, photoId) => {
      console.log("Insight generated:", insight);
      await updatePhoto(photoId, { aiInsight: insight });
      if (selectedMemory?.id === photoId) {
        setSelectedMemory({ ...selectedMemory, aiInsight: insight });
      }
    },
    onError: (error) => {
      console.error("Insight error:", error);
      Alert.alert("Insight Failed", "Could not generate insights. Please try again.");
    },
  });

  const pickImage = async () => {
    try {
      console.log("Picking image...");
      setShowPickerModal(false);
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
        const imageUri = result.assets[0].uri;
        console.log("Selected image URI:", imageUri);
        analyzeMutation.mutate(imageUri);
      } else {
        console.log("Image picker cancelled");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const takePicture = async () => {
    try {
      console.log("Taking picture...");
      setShowPickerModal(false);
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
        const imageUri = result.assets[0].uri;
        console.log("Captured image URI:", imageUri);
        analyzeMutation.mutate(imageUri);
      } else {
        console.log("Camera cancelled");
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture. Please try again.");
    }
  };

  const handleGetInsight = (memory: StoredPhoto) => {
    console.log("Getting AI insight for memory:", memory.id);
    insightMutation.mutate(memory.id);
  };

  const handleLikePhoto = async (id: string) => {
    await likePhoto(id);
    if (selectedMemory?.id === id) {
      const updated = memories.find(m => m.id === id);
      if (updated) setSelectedMemory(updated);
    }
  };

  const MemoryCard = ({ memory }: { memory: StoredPhoto }) => (
    <TouchableOpacity 
      style={styles.memoryCard}
      onPress={() => setSelectedMemory(memory)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: memory.uri }} style={styles.memoryImage} contentFit="cover" />
      {memory.mood && (
        <View style={styles.moodBadge}>
          <Text style={styles.moodText}>{memory.mood}</Text>
        </View>
      )}
      <View style={styles.memoryOverlay}>
        <View style={styles.memoryInfo}>
          <Text style={styles.memoryCaption} numberOfLines={2}>
            {memory.caption}
          </Text>
          <Text style={styles.memoryDate}>{memory.date}</Text>
        </View>
        <TouchableOpacity 
          style={styles.memoryLikes}
          onPress={() => handleLikePhoto(memory.id)}
        >
          <Heart size={14} color={Colors.white} fill={Colors.white} />
          <Text style={styles.memoryLikesText}>{memory.likes || 0}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Memories</Text>
        <Text style={styles.subtitle}>Your love story in pictures</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {analyzeMutation.isPending && (
          <View style={styles.analyzingCard}>
            <ActivityIndicator size="large" color={Colors.accentRose} />
            <Text style={styles.analyzingText}>Analyzing your memory with AI...</Text>
            <Text style={styles.analyzingSubtext}>This may take a few moments</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.addButton, analyzeMutation.isPending && styles.addButtonDisabled]} 
          onPress={() => setShowPickerModal(true)}
          disabled={analyzeMutation.isPending}
        >
          <Plus size={28} color={Colors.accentRose} />
          <Text style={styles.addButtonText}>Add Memory</Text>
        </TouchableOpacity>

        <View style={styles.memoriesGrid}>
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showPickerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPickerModal(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Add Memory</Text>
              <TouchableOpacity onPress={() => setShowPickerModal(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.pickerOption} onPress={takePicture}>
              <View style={styles.pickerIconContainer}>
                <Camera size={28} color={Colors.accentRose} />
              </View>
              <View style={styles.pickerTextContainer}>
                <Text style={styles.pickerOptionTitle}>Take Photo</Text>
                <Text style={styles.pickerOptionSubtitle}>Capture a new memory with camera</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickerOption} onPress={pickImage}>
              <View style={styles.pickerIconContainer}>
                <ImageIcon size={28} color={Colors.accentRose} />
              </View>
              <View style={styles.pickerTextContainer}>
                <Text style={styles.pickerOptionTitle}>Choose from Library</Text>
                <Text style={styles.pickerOptionSubtitle}>Upload an existing photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {selectedMemory && (
        <View style={styles.detailOverlay}>
          <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedMemory(null)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Image 
              source={{ uri: selectedMemory.uri }} 
              style={styles.detailImage} 
              contentFit="cover" 
            />

            <View style={styles.detailContent}>
              <Text style={styles.detailCaption}>{selectedMemory.caption}</Text>
              <Text style={styles.detailDate}>
                {new Date(selectedMemory.date).toLocaleDateString("en-US", { 
                  month: "short", 
                  day: "numeric", 
                  year: "numeric" 
                })}
              </Text>

              {selectedMemory.relationshipMoment && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Moment Type</Text>
                  <Text style={styles.detailText}>{selectedMemory.relationshipMoment}</Text>
                </View>
              )}

              {selectedMemory.description && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Description</Text>
                  <Text style={styles.detailText}>{selectedMemory.description}</Text>
                </View>
              )}

              {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {selectedMemory.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedMemory.aiInsight ? (
                <View style={styles.detailSection}>
                  <View style={styles.insightHeader}>
                    <Sparkles size={20} color={Colors.accentRose} />
                    <Text style={styles.detailSectionTitle}>AI Insight</Text>
                  </View>
                  <Text style={styles.detailText}>{selectedMemory.aiInsight}</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.insightButton}
                  onPress={() => handleGetInsight(selectedMemory)}
                  disabled={insightMutation.isPending}
                >
                  {insightMutation.isPending ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Sparkles size={20} color={Colors.white} />
                  )}
                  <Text style={styles.insightButtonText}>
                    {insightMutation.isPending ? "Generating Insight..." : "Get AI Insight"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      )}
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
  addButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.lightRose,
    borderStyle: "dashed",
    shadowColor: Colors.deepSlate,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.accentRose,
    marginTop: 8,
  },
  memoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  memoryCard: {
    width: imageSize,
    height: imageSize,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.white,
  },
  memoryImage: {
    width: "100%",
    height: "100%",
  },
  memoryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  memoryInfo: {
    marginBottom: 8,
  },
  memoryCaption: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
    marginBottom: 2,
  },
  memoryDate: {
    fontSize: 11,
    color: Colors.white,
    opacity: 0.8,
  },
  memoryLikes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  memoryLikesText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  analyzingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: Colors.deepSlate,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  analyzingText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  addButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  moodBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.accentRose,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  moodText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.white,
    textTransform: "capitalize",
  },
  detailOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    zIndex: 100,
  },
  detailContainer: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 48,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: "300" as const,
  },
  detailImage: {
    width: "100%",
    height: 400,
  },
  detailContent: {
    padding: 24,
  },
  detailCaption: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.white,
    marginBottom: 8,
  },
  detailDate: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 24,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.white,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: "500" as const,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  insightButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accentRose,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 8,
  },
  insightButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  pickerModalContent: {
    backgroundColor: Colors.white,
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
    color: Colors.textPrimary,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    marginBottom: 12,
  },
  pickerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
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
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pickerOptionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
