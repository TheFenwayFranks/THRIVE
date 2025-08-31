import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StorageService } from '../../services/StorageService';

interface MorningFlowProps {
  isVisible: boolean;
  onComplete: (selectedDifficulty?: 'gentle' | 'steady' | 'beast') => void;
}

interface WeatherOption {
  id: 'sunny' | 'cloudy' | 'partlyCloudy' | 'rainy';
  emoji: string;
  title: string;
  message: string;
  subtitle: string;
  workoutSuggestion: 'gentle' | 'steady' | 'beast';
  mood: string;
}

// THRIVE Phase 1 Daily Affirmations
const DAILY_AFFIRMATIONS = [
  {
    text: "Your brain is powerful and unique 🧠",
    subtitle: "ADHD minds think differently, and that's your superpower"
  },
  {
    text: "Progress > Perfection ✨", 
    subtitle: "Every small step forward counts more than waiting for perfect"
  },
  {
    text: "One step forward is still forward 👟",
    subtitle: "Movement in any direction is progress worth celebrating"
  },
  {
    text: "You are worthy of care and kindness 💙",
    subtitle: "Especially the care and kindness you give yourself"
  },
  {
    text: "Your energy comes in waves, and that's okay 🌊",
    subtitle: "Honor your natural rhythms without judgment"
  },
  {
    text: "Done is better than perfect 🎯",
    subtitle: "Completion is an achievement, regardless of how it looks"
  },
  {
    text: "You're not behind - you're on your own timeline ⏰",
    subtitle: "Your journey is unique and unfolds at the right pace"
  },
  {
    text: "Every day you show up is a victory 🏆",
    subtitle: "Simply being here and trying is an act of courage"
  },
  {
    text: "Rest is productive too 😌",
    subtitle: "Your body and mind deserve gentle care and recovery"
  },
  {
    text: "You have everything you need within you 🌱",
    subtitle: "Trust your instincts and inner wisdom"
  }
];

// Weather-Responsive Motivation (Phase 1)
const WEATHER_OPTIONS: WeatherOption[] = [
  {
    id: 'sunny',
    emoji: '☀️',
    title: 'Sunny',
    message: "Perfect energy day!",
    subtitle: "The sun's warmth mirrors the light you bring to the world",
    workoutSuggestion: 'steady',
    mood: 'energetic'
  },
  {
    id: 'cloudy',
    emoji: '☁️',
    title: 'Cloudy',
    message: "Soft, gentle energy today",
    subtitle: "Cloudy skies invite calm, mindful movement",
    workoutSuggestion: 'gentle',
    mood: 'calm'
  },
  {
    id: 'partlyCloudy',
    emoji: '🌤️',
    title: 'Partly Cloudy',
    message: "Balanced vibes ahead!",
    subtitle: "Perfect mix of energy and calm - just like you",
    workoutSuggestion: 'steady',
    mood: 'balanced'
  },
  {
    id: 'rainy',
    emoji: '🌧️',
    title: 'Rainy',
    message: "Cozy indoor energy",
    subtitle: "Rainy days are for gentle self-care and healing",
    workoutSuggestion: 'gentle',
    mood: 'nurturing'
  }
];

export default function MorningFlow({ isVisible, onComplete }: MorningFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWeather, setSelectedWeather] = useState<WeatherOption | null>(null);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [progressData, setProgressData] = useState<any>(null);

  useEffect(() => {
    if (isVisible) {
      initializeMorningFlow();
    }
  }, [isVisible]);

  const initializeMorningFlow = async () => {
    // Get random daily affirmation
    const today = new Date().getDate();
    const affirmationIndex = today % DAILY_AFFIRMATIONS.length;
    setCurrentAffirmation(affirmationIndex);
    
    // Load progress data for proximity display
    const progress = await StorageService.getProgressData();
    setProgressData(progress);
  };

  const handleWeatherSelect = async (weather: WeatherOption) => {
    await Haptics.selectionAsync();
    setSelectedWeather(weather);
    
    // Animate to next step after selection
    setTimeout(() => {
      setCurrentStep(1);
    }, 500);
  };

  const handleContinueToWorkouts = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Save morning flow completion for today
    const today = new Date().toDateString();
    const settings = await StorageService.getSettings();
    settings.lastMorningFlow = today;
    settings.selectedWeatherMood = selectedWeather?.id || 'sunny';
    await StorageService.saveSettings(settings);
    
    onComplete(selectedWeather?.workoutSuggestion);
  };

  const handleSkipToWorkouts = async () => {
    await Haptics.selectionAsync();
    onComplete();
  };

  const getProgressProximityMessage = () => {
    if (!progressData) return "Start your THRIVE journey today!";
    
    const weeklyProgress = progressData.weeklyWorkouts || 0;
    const weeklyGoal = progressData.weeklyGoal || 3;
    const dailyStreak = progressData.dailyWorkoutStreak || 0;
    
    if (weeklyProgress === 0) {
      return "Ready to start your week strong! 💪";
    } else if (weeklyProgress < weeklyGoal) {
      const remaining = weeklyGoal - weeklyProgress;
      return `${remaining} workout${remaining > 1 ? 's' : ''} from your weekly goal! 🎯`;
    } else if (dailyStreak > 0) {
      return `${dailyStreak} day streak going strong! Keep it up! 🔥`;
    }
    
    return "You're crushing your goals! 🌟";
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleEmoji}>🌱</Text>
              <Text style={styles.title}>
                Ready to <Text style={styles.titleHighlight}>THRIVE</Text> today?
              </Text>
            </View>
            <Text style={styles.subtitle}>
              Your wellness journey starts now! Let's check in with how you're feeling.
            </Text>
          </View>

          {currentStep === 0 && (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Daily Affirmation */}
              <View style={styles.affirmationCard}>
                <Text style={styles.affirmationLabel}>Today's Affirmation</Text>
                <Text style={styles.affirmationText}>
                  {DAILY_AFFIRMATIONS[currentAffirmation].text}
                </Text>
                <Text style={styles.affirmationSubtitle}>
                  {DAILY_AFFIRMATIONS[currentAffirmation].subtitle}
                </Text>
              </View>

              {/* Progress Proximity */}
              <View style={styles.progressCard}>
                <Ionicons name="analytics" size={24} color="#16A34A" />
                <Text style={styles.progressText}>
                  {getProgressProximityMessage()}
                </Text>
              </View>

              {/* Weather Selector */}
              <View style={styles.weatherSection}>
                <Text style={styles.sectionTitle}>How's the weather in your world?</Text>
                <Text style={styles.sectionSubtitle}>
                  Choose what matches your inner climate today 🌈
                </Text>
                
                <View style={styles.weatherGrid}>
                  {WEATHER_OPTIONS.map((weather) => (
                    <TouchableOpacity
                      key={weather.id}
                      style={[
                        styles.weatherCard,
                        selectedWeather?.id === weather.id && styles.weatherCardSelected
                      ]}
                      onPress={() => handleWeatherSelect(weather)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.weatherEmoji}>{weather.emoji}</Text>
                      <Text style={styles.weatherTitle}>{weather.title}</Text>
                      
                      {selectedWeather?.id === weather.id && (
                        <View style={styles.selectedIndicator}>
                          <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {currentStep === 1 && selectedWeather && (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Weather Response */}
              <View style={styles.weatherResponseCard}>
                <Text style={styles.weatherResponseEmoji}>{selectedWeather.emoji}</Text>
                <Text style={styles.weatherResponseMessage}>
                  {selectedWeather.message}
                </Text>
                <Text style={styles.weatherResponseSubtitle}>
                  {selectedWeather.subtitle}
                </Text>
              </View>

              {/* Workout Recommendation */}
              <View style={styles.recommendationCard}>
                <Text style={styles.recommendationTitle}>
                  Perfect! We recommend <Text style={styles.titleHighlight}>
                    {selectedWeather.workoutSuggestion === 'gentle' ? 'Gentle' :
                     selectedWeather.workoutSuggestion === 'steady' ? 'Steady' : 'Beast Mode'}
                  </Text> today
                </Text>
                <Text style={styles.recommendationSubtitle}>
                  But remember - you know your body best. Choose what feels right! 💙
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleContinueToWorkouts}
                  activeOpacity={0.8}
                >
                  <Ionicons name="fitness" size={24} color="white" />
                  <Text style={styles.primaryButtonText}>
                    Let's THRIVE!
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleSkipToWorkouts}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>
                    Choose My Own Path
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)', // Light blue gradient
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  titleHighlight: {
    color: '#16A34A',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  affirmationCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  affirmationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  affirmationText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 28,
  },
  affirmationSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  progressCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 12,
    flex: 1,
  },
  weatherSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  weatherCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  weatherCardSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  weatherEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  weatherResponseCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  weatherResponseEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  weatherResponseMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  weatherResponseSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  recommendationCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  recommendationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#16A34A',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
});