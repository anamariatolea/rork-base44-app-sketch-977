import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gamepad2, Lock, Zap, Brain, HelpCircle, Grid3x3, Heart, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { usePurchases } from "@/contexts/PurchaseContext";
import { MINI_GAMES } from "@/constants/premiumContent";

export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { hasFeature, purchaseFeature } = usePurchases();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const hasGamesAccess = hasFeature("games_pack");
  const allGames = [...MINI_GAMES.free, ...MINI_GAMES.premium];
  const accessibleGames = hasGamesAccess ? allGames : MINI_GAMES.free;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return Zap;
      case "Brain":
        return Brain;
      case "HelpCircle":
        return HelpCircle;
      case "Grid3x3":
        return Grid3x3;
      case "Heart":
        return Heart;
      default:
        return Gamepad2;
    }
  };

  const handleGamePress = async (gameId: string, isPremium: boolean) => {
    if (isPremium && !hasGamesAccess) {
      const purchased = await purchaseFeature("games_pack");
      if (!purchased) return;
    }
    setSelectedGame(gameId);
    setCurrentQuestionIndex(0);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
    setCurrentQuestionIndex(0);
  };

  const renderGameContent = () => {
    const game = allGames.find((g) => g.id === selectedGame);
    if (!game) return null;

    if (game.id === "this-or-that" && "questions" in game && game.questions) {
      const currentQ = game.questions[currentQuestionIndex];
      return (
        <View style={styles.gamePlayArea}>
          <Text style={[styles.gameTitle, { color: colors.textPrimary }]}>{game.title}</Text>
          <Text style={[styles.questionCounter, { color: colors.textSecondary }]}>
            Question {currentQuestionIndex + 1} of {game.questions.length}
          </Text>
          
          <View style={[styles.questionCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.questionText, { color: colors.textPrimary }]}>
              {typeof currentQ === 'object' && 'question' in currentQ ? currentQ.question : ''}
            </Text>
            
            <View style={styles.optionsContainer}>
              {(typeof currentQ === 'object' && 'options' in currentQ ? currentQ.options : []).map((option: string, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.optionButton, { backgroundColor: colors.accentRose }]}
                  onPress={() => {
                    if (currentQuestionIndex < game.questions.length - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                    } else {
                      Alert.alert("Game Complete!", "You've answered all questions! Play again?", [
                        { text: "Back to Menu", onPress: handleBackToMenu },
                        { text: "Play Again", onPress: () => setCurrentQuestionIndex(0) },
                      ]);
                    }
                  }}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.mediumGray }]}
            onPress={handleBackToMenu}
          >
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (game.id === "memory-match" && "questions" in game && game.questions && typeof game.questions[currentQuestionIndex] === 'string') {
      const currentQ = game.questions[currentQuestionIndex] as string;
      return (
        <View style={styles.gamePlayArea}>
          <Text style={[styles.gameTitle, { color: colors.textPrimary }]}>{game.title}</Text>
          <Text style={[styles.questionCounter, { color: colors.textSecondary }]}>
            Question {currentQuestionIndex + 1} of {game.questions.length}
          </Text>
          
          <View style={[styles.questionCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.questionText, { color: colors.textPrimary }]}>{currentQ}</Text>
            
            <TouchableOpacity
              style={[styles.answerButton, { backgroundColor: colors.accentRose }]}
              onPress={() => {
                if (currentQuestionIndex < game.questions.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                } else {
                  Alert.alert("Game Complete!", "Great job! Ready to play again?", [
                    { text: "Back to Menu", onPress: handleBackToMenu },
                    { text: "Play Again", onPress: () => setCurrentQuestionIndex(0) },
                  ]);
                }
              }}
            >
              <Text style={styles.optionText}>Next Question</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.mediumGray }]}
            onPress={handleBackToMenu}
          >
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (game.id === "guess-their-answer" && "scenarios" in game && game.scenarios) {
      const currentScenario = game.scenarios[currentQuestionIndex];
      return (
        <View style={styles.gamePlayArea}>
          <Text style={[styles.gameTitle, { color: colors.textPrimary }]}>{game.title}</Text>
          <Text style={[styles.questionCounter, { color: colors.textSecondary }]}>
            Scenario {currentQuestionIndex + 1} of {game.scenarios.length}
          </Text>
          
          <View style={[styles.questionCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.questionText, { color: colors.textPrimary }]}>{currentScenario}</Text>
            
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              Both partners write down their answers, then share and compare!
            </Text>
            
            <TouchableOpacity
              style={[styles.answerButton, { backgroundColor: colors.accentRose }]}
              onPress={() => {
                if (currentQuestionIndex < game.scenarios.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                } else {
                  Alert.alert("Game Complete!", "All scenarios completed!", [
                    { text: "Back to Menu", onPress: handleBackToMenu },
                    { text: "Play Again", onPress: () => setCurrentQuestionIndex(0) },
                  ]);
                }
              }}
            >
              <Text style={styles.optionText}>Next Scenario</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.mediumGray }]}
            onPress={handleBackToMenu}
          >
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (game.id === "truth-tiles" && "tiles" in game && game.tiles) {
      const currentTile = game.tiles[currentQuestionIndex];
      return (
        <View style={styles.gamePlayArea}>
          <Text style={[styles.gameTitle, { color: colors.textPrimary }]}>{game.title}</Text>
          <Text style={[styles.questionCounter, { color: colors.textSecondary }]}>
            Tile {currentQuestionIndex + 1} of {game.tiles.length}
          </Text>
          
          <View style={[styles.questionCard, { backgroundColor: colors.white }]}>
            <View style={[styles.tileCategoryBadge, { backgroundColor: colors.lightRose }]}>
              <Text style={[styles.tileCategoryText, { color: colors.accentRose }]}>
                {currentTile.category}
              </Text>
            </View>
            
            <Text style={[styles.questionText, { color: colors.textPrimary }]}>
              {currentTile.prompt}
            </Text>
            
            <TouchableOpacity
              style={[styles.answerButton, { backgroundColor: colors.accentRose }]}
              onPress={() => {
                if (currentQuestionIndex < game.tiles.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                } else {
                  Alert.alert("Game Complete!", "All tiles revealed!", [
                    { text: "Back to Menu", onPress: handleBackToMenu },
                    { text: "Play Again", onPress: () => setCurrentQuestionIndex(0) },
                  ]);
                }
              }}
            >
              <Text style={styles.optionText}>Next Tile</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.mediumGray }]}
            onPress={handleBackToMenu}
          >
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (game.id === "emotional-bingo" && "challenges" in game && game.challenges) {
      const currentChallenge = game.challenges[currentQuestionIndex];
      return (
        <View style={styles.gamePlayArea}>
          <Text style={[styles.gameTitle, { color: colors.textPrimary }]}>{game.title}</Text>
          <Text style={[styles.questionCounter, { color: colors.textSecondary }]}>
            Challenge {currentQuestionIndex + 1} of {game.challenges.length}
          </Text>
          
          <View style={[styles.questionCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.questionText, { color: colors.textPrimary }]}>
              {currentChallenge}
            </Text>
            
            <TouchableOpacity
              style={[styles.answerButton, { backgroundColor: colors.deepSlate }]}
              onPress={() => {
                if (currentQuestionIndex < game.challenges.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                } else {
                  Alert.alert("Bingo Complete!", "You've completed all challenges!", [
                    { text: "Back to Menu", onPress: handleBackToMenu },
                    { text: "Play Again", onPress: () => setCurrentQuestionIndex(0) },
                  ]);
                }
              }}
            >
              <Text style={styles.optionText}>Mark Complete</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.mediumGray }]}
            onPress={handleBackToMenu}
          >
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  if (selectedGame) {
    return (
      <View style={[styles.container, { backgroundColor: colors.lightGray }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.white }]}>
          <View style={styles.titleContainer}>
            <Gamepad2 size={32} color={colors.accentRose} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>Playing Game</Text>
          </View>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {renderGameContent()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.lightGray }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.white }]}>
        <View style={styles.titleContainer}>
          <Gamepad2 size={32} color={colors.accentRose} />
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Couple Mini-Games</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Play together, learn together
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {!hasGamesAccess && (
          <TouchableOpacity
            style={[styles.unlockBanner, { backgroundColor: colors.accentRose }]}
            onPress={() => purchaseFeature("games_pack")}
          >
            <Lock size={24} color={colors.white} />
            <View style={{ flex: 1 }}>
              <Text style={styles.unlockTitle}>Unlock Full Games Pack</Text>
              <Text style={styles.unlockSubtitle}>Get all 5 games for just $1</Text>
            </View>
            <ChevronRight size={24} color={colors.white} />
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {hasGamesAccess ? "All Games" : "Free Game"}
        </Text>

        {accessibleGames.map((game, index) => {
          const Icon = getIcon(game.icon);
          const isPremium = MINI_GAMES.premium.some((g) => g.id === game.id);
          const isLocked = isPremium && !hasGamesAccess;

          return (
            <TouchableOpacity
              key={game.id}
              style={[
                styles.gameCard,
                { backgroundColor: colors.white },
                isLocked && styles.gameCardLocked,
              ]}
              onPress={() => handleGamePress(game.id, isPremium)}
            >
              <View style={[styles.gameIconContainer, { backgroundColor: colors.lightRose }]}>
                <Icon size={28} color={colors.accentRose} />
              </View>
              
              <View style={styles.gameInfo}>
                <View style={styles.gameTitleRow}>
                  <Text style={[styles.gameTitle, { color: colors.textPrimary }]}>{game.title}</Text>
                  {isLocked && <Lock size={16} color={colors.mediumGray} />}
                </View>
                <Text style={[styles.gameDescription, { color: colors.textSecondary }]}>
                  {game.description}
                </Text>
              </View>

              <ChevronRight size={24} color={colors.mediumGray} />
            </TouchableOpacity>
          );
        })}

        {!hasGamesAccess && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 32 }]}>
              Premium Games (Locked)
            </Text>
            {MINI_GAMES.premium.map((game) => {
              const Icon = getIcon(game.icon);
              return (
                <TouchableOpacity
                  key={game.id}
                  style={[styles.gameCard, styles.gameCardLocked, { backgroundColor: colors.white }]}
                  onPress={() => handleGamePress(game.id, true)}
                >
                  <View style={[styles.gameIconContainer, { backgroundColor: colors.lightGray }]}>
                    <Icon size={28} color={colors.mediumGray} />
                  </View>
                  
                  <View style={styles.gameInfo}>
                    <View style={styles.gameTitleRow}>
                      <Text style={[styles.gameTitle, { color: colors.textSecondary }]}>
                        {game.title}
                      </Text>
                      <Lock size={16} color={colors.mediumGray} />
                    </View>
                    <Text style={[styles.gameDescription, { color: colors.textSecondary }]}>
                      {game.description}
                    </Text>
                  </View>

                  <ChevronRight size={24} color={colors.mediumGray} />
                </TouchableOpacity>
              );
            })}
          </>
        )}

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
  gameCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
  },
  gameCardLocked: {
    opacity: 0.6,
  },
  gameIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  gameInfo: {
    flex: 1,
  },
  gameTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  gameDescription: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  gamePlayArea: {
    flex: 1,
  },
  questionCounter: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  questionCard: {
    padding: 24,
    borderRadius: 20,
    minHeight: 300,
    justifyContent: "center",
  },
  questionText: {
    fontSize: 22,
    fontWeight: "600" as const,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "white",
  },
  answerButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  instructionText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  tileCategoryBadge: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  tileCategoryText: {
    fontSize: 14,
    fontWeight: "700" as const,
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
