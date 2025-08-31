import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal
} from 'react-native';
import { StorageService } from '../../services/StorageService';

interface MorningFlowSimpleProps {
  isVisible: boolean;
  onComplete: (selectedDifficulty?: 'gentle' | 'steady' | 'beast') => void;
}

// THRIVE Phase 1 Daily Affirmations (Rotating)
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

// Simplified Stable Morning Flow - No Weather Selection
export default function MorningFlowSimple({ isVisible, onComplete }: MorningFlowSimpleProps) {
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [progressMessage, setProgressMessage] = useState("Start your THRIVE journey today!");

  useEffect(() => {
    if (isVisible) {
      initializeMorningFlow();
    }
  }, [isVisible]);

  const initializeMorningFlow = async () => {
    try {
      // Get daily affirmation (rotate based on day of year)
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const affirmationIndex = dayOfYear % DAILY_AFFIRMATIONS.length;
      setCurrentAffirmation(affirmationIndex);
      
      // Load progress data for proximity display
      const progress = await StorageService.getProgressData();
      if (progress) {
        const message = getProgressProximityMessage(progress);
        setProgressMessage(message);
      }
    } catch (error) {
      console.log('Morning flow initialization error (non-critical):', error);
      // Graceful degradation - use defaults
    }
  };

  const getProgressProximityMessage = (progressData: any) => {
    if (!progressData) return "Start your THRIVE journey today! 💪";
    
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

  const handleContinueToWorkouts = () => {
    console.log('🌱 Start button clicked - navigating to main app');
    
    // Simple completion without async operations that might cause crashes
    try {
      onComplete();
    } catch (error) {
      console.error('Navigation error:', error);
      // Force close morning flow even if there's an error
      onComplete();
    }
  };

  const handleSkipMorningFlow = () => {
    console.log('🚀 Skip button clicked - bypassing morning flow');
    
    // Simple skip without any complex operations
    try {
      onComplete();
    } catch (error) {
      console.error('Skip navigation error:', error);
      onComplete();
    }
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
              Your wellness journey starts now! Let's set a positive tone for the day.
            </Text>
          </View>

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
            <Text style={styles.progressEmoji}>📊</Text>
            <Text style={styles.progressText}>
              {progressMessage}
            </Text>
          </View>

          {/* Motivational Message */}
          <View style={styles.motivationCard}>
            <Text style={styles.motivationText}>
              Remember: Every movement counts. Your ADHD brain is wired for creativity and action. 
              Today is a fresh start to show yourself kindness through movement! 💙
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContinueToWorkouts}
            >
              <Text style={styles.primaryButtonText}>
                🌱 Let's THRIVE! 🌱
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSkipMorningFlow}
            >
              <Text style={styles.secondaryButtonText}>
                Skip Morning Flow
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF', // Light blue gradient background
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
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  progressEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },
  motivationCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  motivationText: {
    fontSize: 16,
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#16A34A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
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