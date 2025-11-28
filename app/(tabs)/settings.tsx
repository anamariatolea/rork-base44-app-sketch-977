import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Palette, Check, Globe, Layout, Heart, Image, Users, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePartner } from "@/contexts/PartnerContext";
import { THEMES, THEME_KEYS } from "@/constants/themes";
import { LANGUAGES, LANGUAGE_KEYS } from "@/constants/languages";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { currentTheme, colors, changeTheme } = useTheme();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { isPaired, partnerName } = usePartner();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <LinearGradient
        colors={[colors.softRose, colors.lightRose, colors.white]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={[styles.title, { color: colors.deepSlate }]}>{t("settings")}</Text>
        <Text style={[styles.subtitle, { color: colors.deepSlate }]}>
          {t("customizeExperience")}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { 
          backgroundColor: colors.white,
          shadowColor: colors.deepSlate,
        }]}>
          <View style={styles.sectionHeader}>
            <Palette size={24} color={colors.accentRose} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t("chooseTheme")}
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {t("themeDescription")}
          </Text>

          <View style={styles.themesGrid}>
            {THEME_KEYS.map((themeKey) => {
              const theme = THEMES[themeKey];
              const isSelected = currentTheme === themeKey;

              return (
                <TouchableOpacity
                  key={themeKey}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: colors.lightGray,
                      borderColor: isSelected ? colors.accentRose : "transparent",
                    },
                  ]}
                  onPress={() => changeTheme(themeKey)}
                >
                  <View style={styles.colorPreview}>
                    <View
                      style={[
                        styles.colorBlock,
                        { backgroundColor: theme.accentRose },
                      ]}
                    />
                    <View
                      style={[
                        styles.colorBlock,
                        { backgroundColor: theme.softRose },
                      ]}
                    />
                    <View
                      style={[
                        styles.colorBlock,
                        { backgroundColor: theme.lightRose },
                      ]}
                    />
                  </View>
                  <View style={styles.themeInfo}>
                    <Text style={[styles.themeName, { color: colors.textPrimary }]}>
                      {theme.name}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: colors.accentRose }]}>
                        <Check size={14} color={colors.white} strokeWidth={3} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.section, { 
          backgroundColor: colors.white,
          shadowColor: colors.deepSlate,
        }]}>
          <View style={styles.sectionHeader}>
            <Globe size={24} color={colors.accentRose} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t("chooseLanguage")}
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {t("languageDescription")}
          </Text>

          <View style={styles.languagesGrid}>
            {LANGUAGE_KEYS.map((languageKey) => {
              const language = LANGUAGES[languageKey];
              const isSelected = currentLanguage === languageKey;

              return (
                <TouchableOpacity
                  key={languageKey}
                  style={[
                    styles.languageCard,
                    {
                      backgroundColor: colors.lightGray,
                      borderColor: isSelected ? colors.accentRose : "transparent",
                    },
                  ]}
                  onPress={() => changeLanguage(languageKey)}
                >
                  <View style={styles.languageContent}>
                    <Text style={styles.languageFlag}>{language.flag}</Text>
                    <View style={styles.languageText}>
                      <Text style={[styles.languageName, { color: colors.textPrimary }]}>
                        {language.nativeName}
                      </Text>
                      <Text style={[styles.languageNameEnglish, { color: colors.textSecondary }]}>
                        {language.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: colors.accentRose }]}>
                        <Check size={14} color={colors.white} strokeWidth={3} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.section, { 
          backgroundColor: colors.white,
          shadowColor: colors.deepSlate,
          marginTop: 16,
        }]}>
          <View style={styles.sectionHeader}>
            <Users size={24} color={colors.accentRose} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Partner Connection</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {isPaired ? `Connected with ${partnerName || 'your partner'}` : 'Connect with your partner to share progress and goals'}
          </Text>

          <TouchableOpacity
            style={[styles.partnerCard, { backgroundColor: colors.lightRose }]}
            onPress={() => router.push('/partner-pairing' as any)}
          >
            <Users size={32} color={colors.accentRose} />
            <View style={styles.partnerCardInfo}>
              <Text style={[styles.partnerTitle, { color: colors.textPrimary }]}>
                {isPaired ? 'Manage Partner' : 'Link Partner'}
              </Text>
              <Text style={[styles.partnerDescription, { color: colors.textSecondary }]}>
                {isPaired ? 'View or unlink your connection' : 'Generate or enter a pairing code'}
              </Text>
            </View>
            <ChevronRight size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { 
          backgroundColor: colors.white,
          shadowColor: colors.deepSlate,
          marginTop: 16,
        }]}>
          <View style={styles.sectionHeader}>
            <Layout size={24} color={colors.accentRose} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Widget Setup</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Configure app widgets for your home screen to display daily affirmations and memories.
          </Text>

          <View style={styles.widgetOptions}>
            <TouchableOpacity
              style={[styles.widgetOption, { backgroundColor: colors.lightRose }]}
              onPress={() => Alert.alert(
                "Daily Affirmation Widget",
                "To add the Daily Affirmation widget:\n\n1. Long-press on your home screen\n2. Tap the '+' button (iOS) or 'Widgets' (Android)\n3. Search for 'Us & Co'\n4. Select 'Daily Affirmation' widget\n5. Tap 'Add Widget'\n\nThe widget will display a new inspirational quote each day!",
                [{ text: "Got it!", style: "default" }]
              )}
            >
              <Heart size={32} color={colors.accentRose} fill={colors.accentRose} />
              <View style={styles.widgetInfo}>
                <Text style={[styles.widgetTitle, { color: colors.textPrimary }]}>Daily Affirmation</Text>
                <Text style={[styles.widgetDescription, { color: colors.textSecondary }]}>Inspirational quote each day</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.widgetOption, { backgroundColor: colors.lightRose }]}
              onPress={() => Alert.alert(
                "Memories Widget",
                "To add the Memories widget:\n\n1. Long-press on your home screen\n2. Tap the '+' button (iOS) or 'Widgets' (Android)\n3. Search for 'Us & Co'\n4. Select 'Memories' widget\n5. Tap 'Add Widget'\n\nThe widget will cycle through your shared memories!",
                [{ text: "Got it!", style: "default" }]
              )}
            >
              <Image size={32} color={colors.accentRose} />
              <View style={styles.widgetInfo}>
                <Text style={[styles.widgetTitle, { color: colors.textPrimary }]}>Shared Memories</Text>
                <Text style={[styles.widgetDescription, { color: colors.textSecondary }]}>View your favorite moments</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.widgetNote, { backgroundColor: colors.lightGray }]}>
            <Text style={[styles.widgetNoteText, { color: colors.textSecondary }]}>
              💡 Note: Widgets are supported on iOS 14+ and Android 8+. Widget functionality works best on native mobile devices.
            </Text>
          </View>
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
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
  section: {
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  themesGrid: {
    gap: 12,
  },
  themeCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 3,
  },
  colorPreview: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  colorBlock: {
    flex: 1,
    height: 48,
    borderRadius: 8,
  },
  themeInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  themeName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  languagesGrid: {
    gap: 12,
  },
  languageCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 3,
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  languageFlag: {
    fontSize: 32,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  languageNameEnglish: {
    fontSize: 13,
  },
  widgetOptions: {
    gap: 12,
    marginBottom: 16,
  },
  widgetOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  widgetInfo: {
    flex: 1,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  widgetDescription: {
    fontSize: 14,
  },
  widgetNote: {
    padding: 16,
    borderRadius: 12,
  },
  widgetNoteText: {
    fontSize: 13,
    lineHeight: 20,
  },
  partnerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  partnerCardInfo: {
    flex: 1,
  },
  partnerTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  partnerDescription: {
    fontSize: 14,
  },
});
