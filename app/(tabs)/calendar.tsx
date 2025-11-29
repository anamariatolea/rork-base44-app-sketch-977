import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Clock, MapPin, ChevronLeft, ChevronRight, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";

type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  created_at?: string;
};

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  const eventsQuery = trpc.calendar.getEvents.useQuery(
    { userId: user?.id || "", month: currentMonth, year: currentYear },
    { enabled: !!user }
  );

  const partnerEventsQuery = trpc.calendar.getPartnerEvents.useQuery(
    { userId: user?.id || "", month: currentMonth, year: currentYear },
    { enabled: !!user }
  );

  const createEventMutation = trpc.calendar.createEvent.useMutation({
    onSuccess: () => {
      eventsQuery.refetch();
      setShowAddEventModal(false);
      resetForm();
      Alert.alert("Success", "Event created successfully!");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create event");
    },
  });

  const deleteEventMutation = trpc.calendar.deleteEvent.useMutation({
    onSuccess: () => {
      eventsQuery.refetch();
      setShowEventDetailsModal(false);
      Alert.alert("Success", "Event deleted successfully!");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to delete event");
    },
  });

  const resetForm = () => {
    setEventTitle("");
    setEventDescription("");
    setEventStartTime("");
    setEventEndTime("");
    setEventLocation("");
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const myEvents = (eventsQuery.data || []).filter((event: CalendarEvent) => 
      event.date.startsWith(dateStr)
    );
    const theirEvents = (partnerEventsQuery.data || []).filter((event: CalendarEvent) => 
      event.date.startsWith(dateStr)
    );
    return { myEvents, theirEvents };
  };

  const handleDatePress = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
    setShowAddEventModal(true);
  };

  const handleEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const handleCreateEvent = () => {
    if (!eventTitle.trim()) {
      Alert.alert("Title Required", "Please enter an event title");
      return;
    }

    if (!selectedDate) return;

    const dateStr = selectedDate.toISOString();

    createEventMutation.mutate({
      userId: user?.id || "",
      title: eventTitle,
      description: eventDescription || undefined,
      date: dateStr,
      startTime: eventStartTime || undefined,
      endTime: eventEndTime || undefined,
      location: eventLocation || undefined,
    });
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteEventMutation.mutate({ eventId: selectedEvent.id }),
        },
      ]
    );
  };

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.lightGray }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.white }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Shared Calendar</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Plan your days together
        </Text>
      </View>

      <View style={[styles.monthNav, { backgroundColor: colors.white }]}>
        <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
          <ChevronLeft size={24} color={colors.accentRose} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.textPrimary }]}>
          {monthNames[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <ChevronRight size={24} color={colors.accentRose} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.calendarCard, { backgroundColor: colors.white }]}>
          <View style={styles.weekDays}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={[styles.weekDay, { color: colors.textSecondary }]}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const date = new Date(currentYear, currentMonth, day);
              const { myEvents, theirEvents } = getEventsForDate(date);
              const hasMyEvents = myEvents.length > 0;
              const hasTheirEvents = theirEvents.length > 0;
              const isToday =
                day === new Date().getDate() &&
                currentMonth === new Date().getMonth() &&
                currentYear === new Date().getFullYear();

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[
                    styles.dayCell,
                    isToday && { backgroundColor: colors.lightRose },
                  ]}
                  onPress={() => handleDatePress(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: colors.textPrimary },
                      isToday && { color: colors.accentRose, fontWeight: "700" as const },
                    ]}
                  >
                    {day}
                  </Text>
                  <View style={styles.eventIndicators}>
                    {hasMyEvents && (
                      <View style={[styles.eventDot, { backgroundColor: colors.accentRose }]} />
                    )}
                    {hasTheirEvents && (
                      <View style={[styles.eventDot, { backgroundColor: colors.mediumGray }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.eventsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Upcoming Events
          </Text>

          {eventsQuery.isLoading ? (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
          ) : (eventsQuery.data || []).length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No events this month. Tap a date to add one!
            </Text>
          ) : (
            (eventsQuery.data || []).map((event: CalendarEvent) => (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, { backgroundColor: colors.white }]}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.eventHeader}>
                  <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>
                    {event.title}
                  </Text>
                  <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
                    {new Date(event.date).toLocaleDateString()}
                  </Text>
                </View>
                {event.start_time && (
                  <View style={styles.eventDetail}>
                    <Clock size={14} color={colors.textSecondary} />
                    <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                      {event.start_time}
                      {event.end_time && ` - ${event.end_time}`}
                    </Text>
                  </View>
                )}
                {event.location && (
                  <View style={styles.eventDetail}>
                    <MapPin size={14} color={colors.textSecondary} />
                    <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                      {event.location}
                    </Text>
                  </View>
                )}
                {event.description && (
                  <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
                    {event.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showAddEventModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddEventModal(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <ScrollView
                  style={[styles.modalContent, { backgroundColor: colors.white }]}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                      Add Event
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowAddEventModal(false);
                        resetForm();
                      }}
                    >
                      <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.label, { color: colors.textPrimary }]}>Title *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.lightGray, color: colors.textPrimary }]}
                    placeholder="What are you doing?"
                    placeholderTextColor={colors.mediumGray}
                    value={eventTitle}
                    onChangeText={setEventTitle}
                    returnKeyType="next"
                  />

                  <Text style={[styles.label, { color: colors.textPrimary }]}>Description</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      { backgroundColor: colors.lightGray, color: colors.textPrimary },
                    ]}
                    placeholder="Add details..."
                    placeholderTextColor={colors.mediumGray}
                    value={eventDescription}
                    onChangeText={setEventDescription}
                    multiline
                    numberOfLines={3}
                    returnKeyType="next"
                  />

                  <Text style={[styles.label, { color: colors.textPrimary }]}>Start Time</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.lightGray, color: colors.textPrimary }]}
                    placeholder="e.g., 2:00 PM"
                    placeholderTextColor={colors.mediumGray}
                    value={eventStartTime}
                    onChangeText={setEventStartTime}
                    returnKeyType="next"
                  />

                  <Text style={[styles.label, { color: colors.textPrimary }]}>End Time</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.lightGray, color: colors.textPrimary }]}
                    placeholder="e.g., 4:00 PM"
                    placeholderTextColor={colors.mediumGray}
                    value={eventEndTime}
                    onChangeText={setEventEndTime}
                    returnKeyType="next"
                  />

                  <Text style={[styles.label, { color: colors.textPrimary }]}>Location</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.lightGray, color: colors.textPrimary }]}
                    placeholder="Where is this happening?"
                    placeholderTextColor={colors.mediumGray}
                    value={eventLocation}
                    onChangeText={setEventLocation}
                    returnKeyType="done"
                  />

                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.accentRose }]}
                    onPress={handleCreateEvent}
                    disabled={createEventMutation.isPending}
                  >
                    <Text style={[styles.saveButtonText, { color: colors.white }]}>
                      {createEventMutation.isPending ? "Creating..." : "Create Event"}
                    </Text>
                  </TouchableOpacity>
                  <View style={{ height: 40 }} />
                </ScrollView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showEventDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEventDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.detailsModalContent, { backgroundColor: colors.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Event Details
              </Text>
              <TouchableOpacity onPress={() => setShowEventDetailsModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedEvent && (
              <View style={styles.eventDetailsContent}>
                <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>
                  {selectedEvent.title}
                </Text>
                <Text style={[styles.detailDate, { color: colors.textSecondary }]}>
                  {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>

                {selectedEvent.start_time && (
                  <View style={styles.detailRow}>
                    <Clock size={20} color={colors.accentRose} />
                    <Text style={[styles.detailText, { color: colors.textPrimary }]}>
                      {selectedEvent.start_time}
                      {selectedEvent.end_time && ` - ${selectedEvent.end_time}`}
                    </Text>
                  </View>
                )}

                {selectedEvent.location && (
                  <View style={styles.detailRow}>
                    <MapPin size={20} color={colors.accentRose} />
                    <Text style={[styles.detailText, { color: colors.textPrimary }]}>
                      {selectedEvent.location}
                    </Text>
                  </View>
                )}

                {selectedEvent.description && (
                  <View style={styles.detailDescriptionContainer}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Description
                    </Text>
                    <Text style={[styles.detailDescription, { color: colors.textPrimary }]}>
                      {selectedEvent.description}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: colors.lightGray }]}
                  onPress={handleDeleteEvent}
                  disabled={deleteEventMutation.isPending}
                >
                  <Trash2 size={20} color={colors.accentRose} />
                  <Text style={[styles.deleteButtonText, { color: colors.accentRose }]}>
                    {deleteEventMutation.isPending ? "Deleting..." : "Delete Event"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  calendarCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weekDays: {
    flexDirection: "row",
    marginBottom: 12,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 4,
  },
  dayText: {
    fontSize: 14,
  },
  eventIndicators: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 16,
  },
  loadingText: {
    textAlign: "center",
    paddingVertical: 24,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: 24,
  },
  eventCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    flex: 1,
  },
  eventDate: {
    fontSize: 12,
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  eventDetailText: {
    fontSize: 14,
  },
  eventDescription: {
    fontSize: 14,
    marginTop: 8,
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
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  detailsModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "70%",
  },
  eventDetailsContent: {
    paddingVertical: 8,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  detailDate: {
    fontSize: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
  },
  detailDescriptionContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
