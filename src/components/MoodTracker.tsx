import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { StorageService } from '../services/StorageService';

interface MoodTrackerProps {
  visible: boolean;
  onComplete: (mood: number, response: string) => void;
  workoutDifficulty: 'gentle' | 'steady' | 'beast';
  xpGained: number;
  workoutName?: string;
  workoutDuration?: number;
}

const MOOD_OPTIONS = [
  { value: 1, label: 'Poor', description: 'Feeling drained or overwhelmed', color: '#DC2626' },
  { value: 2, label: 'Fair', description: 'Getting by, but could be better', color: '#F59E0B' },
  { value: 3, label: 'Good', description: 'Feeling positive and stable', color: '#3B82F6' },
  { value: 4, label: 'Great', description: 'Energized and optimistic', color: '#10B981' },
  { value: 5, label: 'Excellent', description: 'Outstanding mood and energy', color: '#8B5CF6' }
];

const MOOD_RESPONSES = {
  1: { // Exhausted
    gentle: "Rest is part of growth. You pushed through! 💙",
    steady: "Rest is part of growth. You pushed through! 💙",
    beast: "Rest is part of growth. You pushed through! 💙"
  },
  2: { // Okay
    gentle: "Progress isn't always linear - you showed up and that matters! 🌱",
    steady: "Progress isn't always linear - you showed up and that matters! 🌱",
    beast: "Progress isn't always linear - you showed up and that matters! 🌱"
  },
  3: { // Good
    gentle: "Every workout counts toward feeling better! 💪",
    steady: "Every workout counts toward feeling better! 💪",
    beast: "Every workout counts toward feeling better! 💪"
  },
  4: { // Great
    gentle: "Look at that post-workout glow! ✨ You're building something amazing!",
    steady: "Look at that post-workout glow! ✨ You're building something amazing!",
    beast: "Look at that post-workout glow! ✨ You're building something amazing!"
  },
  5: { // Amazing
    gentle: "That's the THRIVE effect! 🔥 Exercise is your superpower!",
    steady: "That's the THRIVE effect! 🔥 Exercise is your superpower!",
    beast: "That's the THRIVE effect! 🔥 Exercise is your superpower!"
  }
};

export default function MoodTracker({ visible, onComplete, workoutDifficulty, xpGained, workoutName, workoutDuration }: MoodTrackerProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [personalizedResponse, setPersonalizedResponse] = useState('');

  const handleMoodSelect = async (mood: number) => {
    setSelectedMood(mood);
    
    // Get personalized response
    const response = MOOD_RESPONSES[mood as keyof typeof MOOD_RESPONSES][workoutDifficulty];
    setPersonalizedResponse(response);
    
    // Save mood data with workout context
    try {
      const moodEntry = {
        id: Date.now().toString(),
        mood,
        workoutSessionId: `workout_${Date.now()}`,
        timestamp: new Date().toISOString(),
        notes: `Post-workout: ${workoutDifficulty} level, ${workoutName || 'workout'}, +${xpGained} XP`
      };
      
      await StorageService.addMoodEntry(moodEntry);
      
      // Also save workout session data
      const workoutSession = {
        workoutName: workoutName || 'Workout',
        difficulty: workoutDifficulty,
        duration: workoutDuration || 0,
        xpGained,
        postWorkoutMood: mood,
        moodResponse: response,
        timestamp: new Date().toISOString()
      };
      
      await StorageService.saveWorkoutSession(workoutSession);
    } catch (error) {
      console.error('Failed to save mood and workout data:', error);
    }
    
    // Show personalized response
    setShowResponse(true);
  };

  const handleComplete = () => {
    if (selectedMood) {
      onComplete(selectedMood, personalizedResponse);
      // Reset state
      setSelectedMood(null);
      setShowResponse(false);
      setPersonalizedResponse('');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {!showResponse ? (
            // Mood Selection Screen
            <>
              <Text style={styles.title}>How are you feeling now?</Text>
              <Text style={styles.subtitle}>
                Track your mental wellness progress after exercise
              </Text>
              
              <View style={styles.moodGrid}>
                {MOOD_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.moodOption,
                      selectedMood === option.value && { backgroundColor: option.color + '20', borderColor: option.color }
                    ]}
                    onPress={() => handleMoodSelect(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.moodRatingCircle, { backgroundColor: option.color }]}>
                      <Text style={styles.moodRatingNumber}>{option.value}</Text>
                    </View>
                    <View style={styles.moodTextContainer}>
                      <Text style={[styles.moodLabel, { color: option.color }]}>
                        {option.label}
                      </Text>
                      <Text style={styles.moodDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Skip Option */}
              <TouchableOpacity 
                style={styles.skipButton} 
                onPress={() => onComplete(0, 'Skipped mood tracking')}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Personalized Response Screen
            <>
              <View style={styles.responseHeader}>
                <View style={[styles.moodRatingCircle, { 
                  backgroundColor: MOOD_OPTIONS.find(m => m.value === selectedMood)?.color || '#10B981',
                  marginBottom: 16
                }]}>
                  <Text style={styles.moodRatingNumber}>{selectedMood}</Text>
                </View>
                <Text style={styles.responseTitle}>
                  Feeling {MOOD_OPTIONS.find(m => m.value === selectedMood)?.label}
                </Text>
              </View>
              
              <Text style={styles.personalizedMessage}>
                {personalizedResponse}
              </Text>
              
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Session Summary:</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statsText}>+{xpGained} XP earned</Text>
                  <Text style={styles.statsText}>
                    {workoutDifficulty.charAt(0).toUpperCase() + workoutDifficulty.slice(1)} level completed
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
                <Text style={styles.continueButtonText}>Continue Progress</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 350,
    margin: 20,
    minHeight: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  moodGrid: {
    width: '100%',
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minHeight: 80,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moodRatingCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  moodRatingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  moodTextContainer: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
    color: theme.colors.text,
  },
  moodDescription: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skipButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  responseHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },

  responseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  personalizedMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: theme.isDark ? theme.colors.surface : '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.success,
    marginBottom: 8,
  },
  statsRow: {
    gap: 4,
  },
  statsText: {
    fontSize: 14,
    color: theme.colors.success,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});