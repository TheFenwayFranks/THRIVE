import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal
} from 'react-native';

interface MorningFlowWebProps {
  isVisible: boolean;
  onComplete: (selectedDifficulty?: 'gentle' | 'steady' | 'beast') => void;
}

// Simplified Web-Compatible Morning Flow
export default function MorningFlowWeb({ isVisible, onComplete }: MorningFlowWebProps) {
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);

  const weatherOptions = [
    { id: 'sunny', emoji: '☀️', title: 'Sunny', suggestion: 'steady' as const },
    { id: 'cloudy', emoji: '☁️', title: 'Cloudy', suggestion: 'gentle' as const },
    { id: 'partlyCloudy', emoji: '🌤️', title: 'Partly Cloudy', suggestion: 'steady' as const },
    { id: 'rainy', emoji: '🌧️', title: 'Rainy', suggestion: 'gentle' as const }
  ];

  const todaysAffirmation = "Your brain is powerful and unique 🧠 - ADHD minds think differently, and that's your superpower";

  const handleWeatherSelect = (weather: typeof weatherOptions[0]) => {
    setSelectedWeather(weather.id);
    // Auto-complete after selection for web compatibility
    setTimeout(() => {
      onComplete(weather.suggestion);
    }, 1000);
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
            <Text style={styles.titleEmoji}>🌱</Text>
            <Text style={styles.title}>
              Ready to <Text style={styles.titleHighlight}>THRIVE</Text> today?
            </Text>
            <Text style={styles.subtitle}>
              Your wellness journey starts now! Let's check in with how you're feeling.
            </Text>
          </View>

          {/* Daily Affirmation */}
          <View style={styles.affirmationCard}>
            <Text style={styles.affirmationLabel}>Today's Affirmation</Text>
            <Text style={styles.affirmationText}>
              {todaysAffirmation}
            </Text>
          </View>

          {/* Weather Selector */}
          <View style={styles.weatherSection}>
            <Text style={styles.sectionTitle}>How's the weather in your world?</Text>
            <Text style={styles.sectionSubtitle}>
              Choose what matches your inner climate today 🌈
            </Text>
            
            <View style={styles.weatherGrid}>
              {weatherOptions.map((weather) => (
                <TouchableOpacity
                  key={weather.id}
                  style={[
                    styles.weatherCard,
                    selectedWeather === weather.id && styles.weatherCardSelected
                  ]}
                  onPress={() => handleWeatherSelect(weather)}
                >
                  <Text style={styles.weatherEmoji}>{weather.emoji}</Text>
                  <Text style={styles.weatherTitle}>{weather.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Skip Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => onComplete()}
          >
            <Text style={styles.skipButtonText}>
              Skip to Workouts
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
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
    marginBottom: 30,
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
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  affirmationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 26,
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
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  weatherCardSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  weatherEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  weatherTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  skipButton: {
    backgroundColor: '#16A34A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});