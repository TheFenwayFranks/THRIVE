import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { StorageService } from '../services/StorageService';
import { WeatherService, WeatherData } from '../services/WeatherService';

interface MorningFlowProps {
  visible: boolean;
  onComplete: () => void;
  userStats: {
    xp: number;
    streak: number;
    totalWorkouts: number;
  };
}

// Revolutionary Morning Flow Affirmations
const MORNING_AFFIRMATIONS = [
  "Your brain is powerful and unique 🧠",
  "Progress > Perfection always 🌱", 
  "One step forward is still forward 👣",
  "You're building something amazing 💪",
  "Every movement matters 🌟",
  "ADHD minds THRIVE with movement 🚀",
  "You are exactly where you need to be 💙",
  "Small steps create big changes ✨",
  "Your journey is uniquely yours 🌈",
  "Today is full of possibilities 🎯",
  "Movement is your superpower 🦸‍♀️",
  "You've got this, one breath at a time 🌸"
];

// Weather conditions with motivational messages
const WEATHER_MESSAGES = {
  sunny: "Perfect conditions for outdoor movement and energy",
  rainy: "Indoor workout environment promotes focus",
  cloudy: "Comfortable conditions for sustained activity",
  snowy: "Winter conditions build resilience and strength",
  windy: "Dynamic weather matches your inner energy",
  foggy: "Peaceful conditions for mindful movement",
  default: "Every day is an opportunity to build wellness"
};

const WEATHER_CONDITIONS = [
  { key: 'sunny', label: 'Clear', description: 'Bright and sunny' },
  { key: 'rainy', label: 'Rain', description: 'Precipitation' },
  { key: 'cloudy', label: 'Cloudy', description: 'Overcast skies' },
  { key: 'snowy', label: 'Snow', description: 'Winter conditions' },
  { key: 'windy', label: 'Windy', description: 'Breezy conditions' },
  { key: 'foggy', label: 'Fog', description: 'Misty visibility' }
];

export default function MorningFlow({ visible, onComplete, userStats }: MorningFlowProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedWeather, setSelectedWeather] = useState<string>('sunny');
  const [dailyAffirmation, setDailyAffirmation] = useState('');
  
  // Native weather integration states
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [useManualWeather, setUseManualWeather] = useState(false);
  
  // Calculate progress proximity
  const getProgressProximity = () => {
    const weeklyGoal = 3; // 3 workouts per week
    const currentWeekWorkouts = userStats.totalWorkouts % weeklyGoal;
    const remaining = weeklyGoal - currentWeekWorkouts;
    
    if (remaining === 0) {
      return "🎉 Weekly goal achieved! Keep the momentum!";
    } else if (remaining === 1) {
      return "🔥 Just 1 workout from weekly streak!";
    } else {
      return `💪 ${remaining} workouts from weekly streak!`;
    }
  };

  // Select daily affirmation (same one per day)
  useEffect(() => {
    const today = new Date().toDateString();
    const dayIndex = new Date().getDay(); // 0-6
    const affirmationIndex = dayIndex % MORNING_AFFIRMATIONS.length;
    setDailyAffirmation(MORNING_AFFIRMATIONS[affirmationIndex]);
  }, []);

  // Screen transition animation
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, currentScreen]);

  const nextScreen = () => {
    if (currentScreen < 4) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        const nextScreenIndex = currentScreen + 1;
        setCurrentScreen(nextScreenIndex);
        
        // Load weather data when reaching weather screen (screen 3)
        if (nextScreenIndex === 3 && !weatherData && !useManualWeather) {
          loadWeatherData();
        }
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    } else {
      completeMorningFlow();
    }
  };

  const skipToWorkouts = () => {
    console.log('🏃‍♂️ User skipped to workouts from morning flow');
    completeMorningFlow();
  };

  const completeMorningFlow = async () => {
    console.log('🌅 Morning flow completed');
    
    // Save that user completed morning flow today
    try {
      const today = new Date().toDateString();
      await StorageService.setMorningFlowDate(today);
      
      // Save weather data and selection for personalization
      const settings = await StorageService.getSettings();
      await StorageService.saveSettings({
        ...settings,
        selectedWeatherMood: selectedWeather,
        lastMorningFlow: today,
        lastWeatherData: weatherData ? {
          temperature: weatherData.temperature,
          condition: weatherData.condition,
          location: weatherData.location,
          timestamp: today
        } : null
      });
    } catch (error) {
      console.error('Failed to save morning flow completion:', error);
    }
    
    onComplete();
  };

  // Load native weather data
  const loadWeatherData = async () => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    
    try {
      console.log('🌤️ Loading native weather data...');
      const weather = await WeatherService.getCompleteWeatherData();
      
      if (weather) {
        console.log('✅ Weather data loaded successfully:', weather);
        setWeatherData(weather);
        setSelectedWeather(weather.motivationKey);
        // Auto-advance after successful weather load
        setTimeout(() => {
          nextScreen();
        }, 2000);
      } else {
        console.log('⚠️ Could not load weather data, falling back to manual selection');
        setWeatherError('Could not access weather data');
        setUseManualWeather(true);
      }
    } catch (error) {
      console.error('❌ Weather loading error:', error);
      setWeatherError('Weather service unavailable');
      setUseManualWeather(true);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const retryWeatherLoad = () => {
    setUseManualWeather(false);
    setWeatherError(null);
    loadWeatherData();
  };

  const handleWeatherSelect = (weather: string) => {
    setSelectedWeather(weather);
    setTimeout(nextScreen, 500); // Auto-advance after selection
  };

  const handleManualWeatherFallback = () => {
    setUseManualWeather(true);
    setWeatherError(null);
  };

  if (!visible) return null;

  const renderScreen = () => {
    switch (currentScreen) {
      case 0: // Welcome Screen
        return (
          <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
            <Text style={styles.thriveTitle}>
              Ready to <Text style={styles.thriveHighlight}>THRIVE</Text> today? 🌱
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Let's set the tone for an amazing day ahead
            </Text>
            
            <View style={styles.brandingContainer}>
              <Text style={styles.brandingText}>THRIVE</Text>
              <Text style={styles.brandingSubtext}>Movement for Mental Health</Text>
            </View>
            
            <TouchableOpacity style={styles.continueButton} onPress={nextScreen}>
              <Text style={styles.continueButtonText}>Let's Begin ✨</Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case 1: // Daily Affirmation
        return (
          <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
            <Text style={styles.affirmationTitle}>Your Daily Reminder 💙</Text>
            
            <View style={styles.affirmationContainer}>
              <Text style={styles.affirmationText}>"{dailyAffirmation}"</Text>
            </View>
            
            <Text style={styles.affirmationNote}>
              Carry this with you today
            </Text>
            
            <TouchableOpacity style={styles.continueButton} onPress={nextScreen}>
              <Text style={styles.continueButtonText}>I'll Remember That 💪</Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case 2: // Progress Proximity
        return (
          <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
            <Text style={styles.progressTitle}>Your Progress 📊</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statCircle}>
                <Text style={styles.statValue}>{userStats.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCircle}>
                <Text style={styles.statValue}>{userStats.xp}</Text>
                <Text style={styles.statLabel}>Total XP</Text>
              </View>
            </View>
            
            <View style={styles.proximityContainer}>
              <Text style={styles.proximityText}>
                {getProgressProximity()}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.continueButton} onPress={nextScreen}>
              <Text style={styles.continueButtonText}>Keep Building 🚀</Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case 3: // Automatic Weather + Motivation (Combined Screen)
        return (
          <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
            {isLoadingWeather ? (
              // Loading Weather
              <>
                <Text style={styles.weatherTitle}>Getting your weather... 🌤️</Text>
                <Text style={styles.weatherSubtitle}>
                  Personalizing your morning motivation
                </Text>
                
                <View style={styles.weatherLoadingContainer}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={styles.loadingText}>Accessing weather data...</Text>
                </View>
              </>
            ) : weatherData ? (
              // Combined Weather + Motivation Display
              <>
                <Text style={styles.weatherTitle}>Good morning! 🌤️</Text>
                
                <View style={styles.nativeWeatherContainer}>
                  <View style={styles.weatherDisplay}>
                    <View style={styles.weatherBadge}>
                      <Text style={styles.weatherBadgeText}>
                        {weatherData.badge}
                      </Text>
                    </View>
                    <Text style={styles.temperatureText}>
                      {Math.round(weatherData.temperature)}°F
                    </Text>
                    <Text style={styles.conditionText}>
                      Current conditions
                    </Text>
                  </View>
                  
                  <Text style={styles.locationText}>
                    {weatherData.location}
                  </Text>
                </View>
                
                {/* Weather-Responsive Motivation */}
                <View style={styles.weatherMotivationContainer}>
                  <Text style={styles.weatherMotivationText}>
                    {WeatherService.getWeatherMotivation(selectedWeather, weatherData.temperature)}
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.continueButton} onPress={nextScreen}>
                  <Text style={styles.continueButtonText}>Ready to THRIVE</Text>
                </TouchableOpacity>
              </>
            ) : (
              // Generic motivation if weather fails
              <>
                <Text style={styles.weatherTitle}>Good morning! 🌅</Text>
                
                <View style={styles.weatherMotivationContainer}>
                  <Text style={styles.weatherMotivationText}>
                    Every day is a great day to THRIVE! 🌟
                  </Text>
                </View>
                
                <Text style={styles.weatherSubtitle}>
                  Your movement matters, regardless of the weather
                </Text>
                
                <TouchableOpacity style={styles.continueButton} onPress={nextScreen}>
                  <Text style={styles.continueButtonText}>Ready to THRIVE</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        );

      case 4: // Final Call-to-Action
        return (
          <Animated.View style={[styles.screenContainer, { opacity: fadeAnim }]}>
            <Text style={styles.finalTitle}>You're all set! 🎯</Text>
            
            <View style={styles.finalSummaryContainer}>
              <Text style={styles.finalSummaryText}>✨ Today's affirmation received</Text>
              <Text style={styles.finalSummaryText}>📊 Progress reviewed</Text>
              {weatherData && (
                <Text style={styles.finalSummaryText}>
                  🌤️ Weather personalization: {weatherData.emoji} {Math.round(weatherData.temperature)}°F
                </Text>
              )}
              <Text style={styles.finalSummaryText}>💪 Motivation loaded</Text>
            </View>
            
            <Text style={styles.finalMessage}>
              Let's make today count!
            </Text>
            
            <TouchableOpacity style={styles.thriveButton} onPress={nextScreen}>
              <Text style={styles.thriveButtonText}>Start THRIVING! 🌱</Text>
            </TouchableOpacity>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={skipToWorkouts}
    >
      <View style={styles.container}>
        {renderScreen()}
        
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={skipToWorkouts}>
          <Text style={styles.skipButtonText}>Jump to workouts →</Text>
        </TouchableOpacity>
        
        {/* Progress Dots */}
        <View style={styles.progressDots}>
          {[0, 1, 2, 3, 4].map((dot) => (
            <View
              key={dot}
              style={[
                styles.dot,
                currentScreen >= dot && styles.dotActive
              ]}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.isDark ? '#0F172A' : '#0F172A', // Keep morning flow dark for ambiance
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  
  // Welcome Screen Styles
  thriveTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  thriveHighlight: {
    color: '#10B981',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 40,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 60,
    padding: 30,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 20,
  },
  brandingText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
    letterSpacing: 3,
  },
  brandingSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    letterSpacing: 1,
  },
  
  // Affirmation Screen Styles
  affirmationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  affirmationContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    borderLeftWidth: 5,
    borderLeftColor: '#10B981',
  },
  affirmationText: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
    fontStyle: 'italic',
  },
  affirmationNote: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 40,
  },
  
  // Progress Screen Styles
  progressTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 40,
  },
  statCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#10B981',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  proximityContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
  },
  proximityText: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Weather Screen Styles
  weatherTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  weatherSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 40,
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  weatherOption: {
    width: 100,
    height: 100,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  weatherSelected: {
    borderColor: '#10B981',
    backgroundColor: '#065F46',
  },
  weatherEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  weatherLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  
  // Final Screen Styles
  finalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  weatherMotivationContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  weatherMotivationText: {
    fontSize: 20,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '600',
  },
  finalMessage: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '600',
  },
  
  // Button Styles
  continueButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  thriveButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    minWidth: 250,
    alignItems: 'center',
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  thriveButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Navigation Styles
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  skipButtonText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  progressDots: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  dotActive: {
    backgroundColor: theme.colors.success,
  },
  
  // Native Weather Styles
  weatherLoadingContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    marginVertical: 30,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  nativeWeatherContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  weatherDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  weatherBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.success,
    marginBottom: 8,
  },
  conditionText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  locationText: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 12,
    textAlign: 'center',
  },
  weatherDescription: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  autoAdvanceText: {
    fontSize: 14,
    color: theme.colors.success,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  retryButton: {
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  weatherSummary: {
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  weatherSummaryText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Final Screen Styles
  finalSummaryContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    alignItems: 'flex-start',
    width: '100%',
  },
  finalSummaryText: {
    color: theme.colors.success,
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'left',
  },
});