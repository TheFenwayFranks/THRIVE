import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated
} from 'react-native';
import { StorageService } from '../../services/StorageService';
import { WeatherService } from '../../services/WeatherService';

interface MorningFlowProps {
  isVisible: boolean;
  onComplete: (difficulty?: 'gentle' | 'steady' | 'beast') => void;
}

// Daily Motivational Affirmations (rotating)
const DAILY_AFFIRMATIONS = [
  {
    text: "Your body is wise. Today, listen to what it needs and honor that wisdom. 🌱",
    focus: "self-compassion"
  },
  {
    text: "Every small step counts. You don't need to be perfect - you just need to begin. 💙",
    focus: "progress over perfection"
  },
  {
    text: "Movement is medicine for your mind, body, and spirit. You deserve this gift. ✨",
    focus: "self-care"
  },
  {
    text: "Your energy is precious. Use it in ways that make you feel alive and strong. 🔥",
    focus: "energy management"
  },
  {
    text: "There's no wrong way to move your body. Trust yourself and find joy in motion. 🌊",
    focus: "body acceptance"
  },
  {
    text: "You've overcome challenges before. This moment is another opportunity to THRIVE. 💪",
    focus: "resilience"
  },
  {
    text: "Gentle movement can create powerful change. Start where you are, not where you think you should be. 🌱",
    focus: "gentle progress"
  }
];

// Weather-based difficulty suggestions
const WEATHER_SUGGESTIONS = {
  sunny: {
    primary: 'beast',
    message: "Beautiful sunny day! ☀️ Perfect energy for beast mode - or choose what feels right for you."
  },
  cloudy: {
    primary: 'steady',
    message: "Steady energy day ☁️ - great for consistent progress and building momentum."
  },
  rainy: {
    primary: 'gentle',
    message: "Cozy rainy day 🌧️ - perfect for gentle, nurturing movement that honors your energy."
  },
  default: {
    primary: 'steady',
    message: "Every day is a good day to THRIVE! 🌟 Choose the energy level that calls to you."
  }
};

export default function MorningFlowComplete({ isVisible, onComplete }: MorningFlowProps) {
  const [currentScreen, setCurrentScreen] = useState<'greeting' | 'affirmation' | 'progress' | 'difficulty'>('greeting');
  const [userStats, setUserStats] = useState<any>(null);
  const [todaysAffirmation, setTodaysAffirmation] = useState(DAILY_AFFIRMATIONS[0]);
  const [weatherSuggestion, setWeatherSuggestion] = useState(WEATHER_SUGGESTIONS.default);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isVisible) {
      initializeMorningFlow();
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const initializeMorningFlow = async () => {
    // Load user stats
    try {
      const stats = await StorageService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }

    // Get today's affirmation (based on day of year for consistency)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const affirmationIndex = dayOfYear % DAILY_AFFIRMATIONS.length;
    setTodaysAffirmation(DAILY_AFFIRMATIONS[affirmationIndex]);

    // Get weather suggestion (try automatic, fallback to default)
    try {
      const weather = await WeatherService.getCurrentWeather();
      if (weather?.condition) {
        const suggestion = WEATHER_SUGGESTIONS[weather.condition as keyof typeof WEATHER_SUGGESTIONS] || WEATHER_SUGGESTIONS.default;
        setWeatherSuggestion(suggestion);
      }
    } catch (error) {
      console.log('Using default weather suggestion:', error);
      // Keep default suggestion
    }
  };

  const getProgressProximity = () => {
    if (!userStats) return "You're starting your THRIVE journey! 🌱";

    const { currentStreak = 0, totalWorkouts = 0, xp = 0 } = userStats;

    // Check for milestone proximity
    if (currentStreak >= 6) {
      return `🔥 ${7 - currentStreak} more day${7 - currentStreak !== 1 ? 's' : ''} to Weekly Warrior status!`;
    }
    
    if (totalWorkouts >= 9) {
      return `⚡ ${10 - totalWorkouts} more workout${10 - totalWorkouts !== 1 ? 's' : ''} to Perfect Ten achievement!`;
    }

    if (xp >= 90) {
      return `✨ ${100 - xp} more XP to reach your first 100 XP milestone!`;
    }

    // General encouragement based on current progress
    if (currentStreak > 0) {
      return `💪 Amazing ${currentStreak}-day streak! You're building incredible momentum!`;
    }

    if (totalWorkouts > 0) {
      return `🌱 You've completed ${totalWorkouts} workout${totalWorkouts !== 1 ? 's' : ''}! Every session is building your strength.`;
    }

    return "Today is the perfect day to start your THRIVE journey! 🌟";
  };

  const handleNext = () => {
    switch (currentScreen) {
      case 'greeting':
        setCurrentScreen('affirmation');
        break;
      case 'affirmation':
        setCurrentScreen('progress');
        break;
      case 'progress':
        setCurrentScreen('difficulty');
        break;
      default:
        break;
    }
  };

  const handleDifficultySelect = (difficulty: 'gentle' | 'steady' | 'beast') => {
    onComplete(difficulty);
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={false}
      onRequestClose={() => onComplete()}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {currentScreen === 'greeting' && (
              <View style={styles.screen}>
                <View style={styles.header}>
                  <Text style={styles.emoji}>🌅</Text>
                  <Text style={styles.greeting}>Good morning!</Text>
                  <Text style={styles.question}>Ready to THRIVE today?</Text>
                </View>
                
                <View style={styles.messageCard}>
                  <Text style={styles.welcomeMessage}>
                    Every new day is a fresh start. You have the power to make today meaningful, 
                    no matter how you're feeling right now. 💙
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                    <Text style={styles.primaryButtonText}>Let's THRIVE! 🌱</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipButtonText}>Skip to workouts</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {currentScreen === 'affirmation' && (
              <View style={styles.screen}>
                <View style={styles.header}>
                  <Text style={styles.emoji}>✨</Text>
                  <Text style={styles.greeting}>Today's Affirmation</Text>
                </View>
                
                <View style={styles.affirmationCard}>
                  <Text style={styles.affirmationText}>
                    {todaysAffirmation.text}
                  </Text>
                  <Text style={styles.affirmationFocus}>
                    Focus: {todaysAffirmation.focus}
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                    <Text style={styles.primaryButtonText}>I'm ready! 💙</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipButtonText}>Skip to workouts</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {currentScreen === 'progress' && (
              <View style={styles.screen}>
                <View style={styles.header}>
                  <Text style={styles.emoji}>📈</Text>
                  <Text style={styles.greeting}>Your Progress</Text>
                </View>
                
                <View style={styles.progressCard}>
                  <Text style={styles.progressMessage}>
                    {getProgressProximity()}
                  </Text>
                  
                  {userStats && (
                    <View style={styles.statsPreview}>
                      <View style={styles.statPreviewItem}>
                        <Text style={styles.statPreviewValue}>{userStats.xp || 0}</Text>
                        <Text style={styles.statPreviewLabel}>XP</Text>
                      </View>
                      <View style={styles.statPreviewItem}>
                        <Text style={styles.statPreviewValue}>{userStats.currentStreak || 0}</Text>
                        <Text style={styles.statPreviewLabel}>Streak</Text>
                      </View>
                      <View style={styles.statPreviewItem}>
                        <Text style={styles.statPreviewValue}>{userStats.totalWorkouts || 0}</Text>
                        <Text style={styles.statPreviewLabel}>Workouts</Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                    <Text style={styles.primaryButtonText}>Choose workout 🚀</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {currentScreen === 'difficulty' && (
              <View style={styles.screen}>
                <View style={styles.header}>
                  <Text style={styles.emoji}>🎯</Text>
                  <Text style={styles.greeting}>Choose Your Energy</Text>
                </View>
                
                <View style={styles.weatherCard}>
                  <Text style={styles.weatherMessage}>
                    {weatherSuggestion.message}
                  </Text>
                </View>
                
                <View style={styles.difficultyOptions}>
                  <TouchableOpacity 
                    style={[styles.difficultyCard, styles.gentleCard]}
                    onPress={() => handleDifficultySelect('gentle')}
                  >
                    <Text style={styles.difficultyEmoji}>🌱</Text>
                    <Text style={styles.difficultyTitle}>Gentle</Text>
                    <Text style={styles.difficultySubtitle}>
                      Perfect for low energy or when you need nurturing movement
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.difficultyCard, 
                      styles.steadyCard,
                      weatherSuggestion.primary === 'steady' && styles.recommendedCard
                    ]}
                    onPress={() => handleDifficultySelect('steady')}
                  >
                    <Text style={styles.difficultyEmoji}>🚶</Text>
                    <Text style={styles.difficultyTitle}>Steady</Text>
                    <Text style={styles.difficultySubtitle}>
                      Consistent energy building for sustainable progress
                    </Text>
                    {weatherSuggestion.primary === 'steady' && (
                      <Text style={styles.recommendedTag}>Suggested for today</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.difficultyCard, 
                      styles.beastCard,
                      weatherSuggestion.primary === 'beast' && styles.recommendedCard
                    ]}
                    onPress={() => handleDifficultySelect('beast')}
                  >
                    <Text style={styles.difficultyEmoji}>🔥</Text>
                    <Text style={styles.difficultyTitle}>Beast Mode</Text>
                    <Text style={styles.difficultySubtitle}>
                      High energy for when you're ready to unleash your power
                    </Text>
                    {weatherSuggestion.primary === 'beast' && (
                      <Text style={styles.recommendedTag}>Suggested for today</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipButtonText}>I'll choose in the app</Text>
                </TouchableOpacity>
              </View>
            )}

          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Fallback
    backgroundColor: '#4F46E5', // Solid fallback
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
  },
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 600,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  question: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
    minHeight: 120,
    justifyContent: 'center',
  },
  welcomeMessage: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 26,
  },
  affirmationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 40,
    alignItems: 'center',
  },
  affirmationText: {
    fontSize: 20,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  affirmationFocus: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
    alignItems: 'center',
    minWidth: '100%',
  },
  progressMessage: {
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  statsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statPreviewItem: {
    alignItems: 'center',
  },
  statPreviewValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  statPreviewLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  weatherMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
  difficultyOptions: {
    width: '100%',
    marginBottom: 20,
  },
  difficultyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gentleCard: {
    borderColor: '#10B981',
  },
  steadyCard: {
    borderColor: '#3B82F6',
  },
  beastCard: {
    borderColor: '#EF4444',
  },
  recommendedCard: {
    borderWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  difficultyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  difficultyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  difficultySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  recommendedTag: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 8,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
});