import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Lightbulb, Plus, MapPin, Calendar, TrendingUp, X, Trash2, Pin } from "lucide-react-native";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

type VisionCategory = "travel" | "dates" | "financial" | "lifestyle";

type VisionItem = {
  id: string;
  title: string;
  description: string;
  category: VisionCategory;
  createdAt: Date;
  isPinned?: boolean;
};

const categoryInfo = {
  travel: { icon: MapPin, label: "Travel Ideas", color: "#3B82F6" },
  dates: { icon: Calendar, label: "Date Ideas", color: "#EC4899" },
  financial: { icon: TrendingUp, label: "Financial Goals", color: "#10B981" },
  lifestyle: { icon: Lightbulb, label: "Lifestyle & Home", color: "#F59E0B" },
};

export default function VisionBoardScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [items, setItems] = useState<VisionItem[]>([
    {
      id: "1",
      title: "Trip to Japan",
      description: "Visit Tokyo, Kyoto, and Mt. Fuji in Spring 2026",
      category: "travel",
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Emergency Fund",
      description: "Save $10,000 for emergencies by end of year",
      category: "financial",
      createdAt: new Date(),
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VisionCategory>("travel");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleAddItem = () => {
    if (!newTitle.trim()) {
      Alert.alert("Title Required", "Please enter a title for your vision item.");
      return;
    }

    const newItem: VisionItem = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription,
      category: selectedCategory,
      createdAt: new Date(),
    };

    setItems([newItem, ...items]);
    setNewTitle("");
    setNewDescription("");
    setShowAddModal(false);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to remove this from your vision board?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setItems(items.filter(item => item.id !== id)),
        },
      ]
    );
  };

  const handleTogglePin = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    ));
  };

  const pinnedItems = items.filter(item => item.isPinned);
  const unpinnedItems = items.filter(item => !item.isPinned);

  const renderVisionItem = (item: VisionItem) => {
    const categoryData = categoryInfo[item.category];
    const Icon = categoryData.icon;

    return (
      <View
        key={item.id}
        style={[
          styles.visionItem,
          { backgroundColor: colors.white, shadowColor: colors.deepSlate },
          item.isPinned && styles.visionItemPinned,
        ]}
      >
        <View style={styles.itemHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryData.color + "20" }]}>
            <Icon size={16} color={categoryData.color} />
            <Text style={[styles.categoryLabel, { color: categoryData.color }]}>
              {categoryData.label}
            </Text>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity 
              onPress={() => handleTogglePin(item.id)}
              style={styles.actionButton}
            >
              <Pin 
                size={20} 
                color={item.isPinned ? colors.accentRose : colors.textSecondary}
                fill={item.isPinned ? colors.accentRose : "none"}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeleteItem(item.id)}
              style={styles.actionButton}
            >
              <Trash2 size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
        {item.description && (
          <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.lightRose }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Vision Board</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Dream together, achieve together
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accentRose }]}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoCard, { backgroundColor: colors.lightRose }]}>
          <Lightbulb size={24} color={colors.accentRose} />
          <Text style={[styles.infoText, { color: colors.textPrimary }]}>
            Pin your shared dreams here - travels, dates, savings goals, and lifestyle aspirations. 
            Building a vision together strengthens your team mindset! 💪
          </Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Lightbulb size={64} color={colors.mediumGray} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Start building your shared vision{"\n"}Tap the + button to add your first dream
            </Text>
          </View>
        ) : (
          <>
            {pinnedItems.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Pin size={20} color={colors.accentRose} />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Pinned</Text>
                </View>
                <View style={styles.itemsContainer}>
                  {pinnedItems.map(renderVisionItem)}
                </View>
              </View>
            )}
            {unpinnedItems.length > 0 && (
              <View style={styles.sectionContainer}>
                {pinnedItems.length > 0 && (
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 12 }]}>All Items</Text>
                )}
                <View style={styles.itemsContainer}>
                  {unpinnedItems.map(renderVisionItem)}
                </View>
              </View>
            )}
          </>
        )}

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
                <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add to Vision Board</Text>
                    <TouchableOpacity onPress={() => setShowAddModal(false)}>
                      <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Text style={[styles.label, { color: colors.textPrimary }]}>Category</Text>
                    <View style={styles.categorySelector}>
                      {(Object.keys(categoryInfo) as VisionCategory[]).map((category) => {
                        const categoryData = categoryInfo[category];
                        const Icon = categoryData.icon;
                        const isSelected = selectedCategory === category;

                        return (
                          <TouchableOpacity
                            key={category}
                            style={[
                              styles.categoryOption,
                              { backgroundColor: colors.lightGray },
                              isSelected && { backgroundColor: categoryData.color + "20", borderColor: categoryData.color },
                            ]}
                            onPress={() => setSelectedCategory(category)}
                          >
                            <Icon size={20} color={isSelected ? categoryData.color : colors.textSecondary} />
                            <Text
                              style={[
                                styles.categoryOptionText,
                                { color: colors.textSecondary },
                                isSelected && { color: categoryData.color, fontWeight: "600" },
                              ]}
                            >
                              {categoryData.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text style={[styles.label, { color: colors.textPrimary }]}>Title</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.lightGray, color: colors.textPrimary }]}
                      placeholder="e.g., Trip to Paris, New Apartment, Date Night"
                      placeholderTextColor={colors.mediumGray}
                      value={newTitle}
                      onChangeText={setNewTitle}
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />

                    <Text style={[styles.label, { color: colors.textPrimary }]}>Description (Optional)</Text>
                    <TextInput
                      style={[styles.textArea, { backgroundColor: colors.lightGray, color: colors.textPrimary }]}
                      placeholder="Add details about your vision..."
                      placeholderTextColor={colors.mediumGray}
                      value={newDescription}
                      onChangeText={setNewDescription}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />

                    <TouchableOpacity
                      style={[styles.saveButton, { backgroundColor: colors.accentRose }]}
                      onPress={handleAddItem}
                    >
                      <Text style={[styles.saveButtonText, { color: colors.white }]}>Add to Board</Text>
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
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  infoCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
  itemsContainer: {
    gap: 16,
  },
  visionItem: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  visionItemPinned: {
    borderWidth: 2,
    borderColor: "rgba(236, 72, 153, 0.3)",
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
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
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  categorySelector: {
    gap: 10,
    marginBottom: 20,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryOptionText: {
    fontSize: 15,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 24,
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
});
