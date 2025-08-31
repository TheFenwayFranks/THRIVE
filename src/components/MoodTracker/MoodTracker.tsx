import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  SafeAreaView,
  Animated,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StorageService } from '../../services/StorageService';

const { width } = Dimensions.get('window');

interface MoodTrackerProps {
  isVisible: boolean;
  workoutSession?: any;
  difficulty: 'gentle' | 'steady' | 'beast';
  onComplete: () => void;
}

interface Mood {
  id: number;
  emoji: string;
  label: string;
  description: string;
  color: string;
}

const moods: Mood[] = [
  { 
    id: 1, 
    emoji: '😫', 
    label: 'Exhausted', 
    description: 'Tired but pushed through',
    color: '#EF4444' 
  },
  { 
    id: 2, 
    emoji: '😐', 
    label: 'Okay', 
    description: 'Feeling neutral',
    color: '#F59E0B' 
  },
  { 
    id: 3, 
    emoji: '🙂', 
    label: 'Good', 
    description: 'Pretty good energy',
    color: '#3B82F6' 
  },
  { 
    id: 4, 
    emoji: '😄', 
    label: 'Great', 
    description: 'Feeling really good',
    color: '#10B981' 
  },
  { 
    id: 5, 
    emoji: '🔥', 
    label: 'Amazing!', 
    description: 'On top of the world',
    color: '#8B5CF6' 
  }
];

// THRIVE Phase 1 mood response messages
const MOOD_RESPONSES = {
  1: {
    message: "That's the THRIVE spirit! 💪",
    subtitle: "You showed up even when it was hard - that's real strength",
    encouragement: "Rest and recovery are part of the journey. You did something powerful today."
  },
  2: {
    message: "Every workout counts! 🌱",
    subtitle: "Sometimes 'okay' is exactly what we need",
    encouragement: "You're building the habit, and that's everything. Small steps lead to big changes."
  },
  3: {
    message: "Exercise is working its magic! ✨",
    subtitle: "That good feeling? That's your brain thanking you",
    encouragement: "Keep building on this positive momentum. You're doing great!"
  },
  4: {
    message: "Look at you THRIVING! 🌟",
    subtitle: "This is what taking care of yourself feels like",
    encouragement: "Your future self is grateful for this moment. You're building strength inside and out."
  },
  5: {
    message: "That's the THRIVE effect! 🔥",
    subtitle: "THIS is why movement matters for mental health",
    encouragement: "Remember this feeling - you earned it! You're not just surviving, you're thriving."
  }
};

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  isVisible,
  workoutSession,
  difficulty,
  onComplete
}) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [scaleAnims] = useState(() => 
    moods.map(() => new Animated.Value(1))
  );

  // Difficulty-based styling
  const difficultyColors = {
    gentle: '#10B981',
    steady: '#3B82F6',
    beast: '#EF4444'
  };

  const handleMoodSelect = async (moodId: number) => {
    // Animate selected mood
    const index = moods.findIndex(m => m.id === moodId);
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMood(moodId);
    
    // Save mood entry to storage
    await StorageService.saveMoodEntry({
      id: Date.now().toString(),
      mood: moodId,
      workoutSessionId: workoutSession?.id,
      timestamp: new Date().toISOString()
    });

    // Delay to show selection, then transition to response
    setTimeout(() => {
      setShowResponse(true);
    }, 800);
  };

  const handleComplete = () => {
    setShowResponse(false);
    setSelectedMood(null);
    
    // Reset animations
    scaleAnims.forEach(anim => anim.setValue(1));
    
    onComplete();
  };

  if (!isVisible) return null;

  const selectedMoodData = selectedMood ? moods.find(m => m.id === selectedMood) : null;
  const response = selectedMood ? MOOD_RESPONSES[selectedMood] : null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      statusBarTranslucent={true}
    >
      <SafeAreaView style={styles.container}>
        {!showResponse ? (
          // Mood Selection Screen
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: difficultyColors[difficulty] }]}>
                How are you feeling?
              </Text>
              <Text style={styles.subtitle}>
                Let's track how that workout made you feel 💙
              </Text>
              <Text style={styles.helperText}>
                This helps us understand what works best for you
              </Text>
            </View>

            <View style={styles.moodsContainer}>
              {moods.map((mood, index) => {
                const isSelected = selectedMood === mood.id;
                
                return (
                  <Animated.View
                    key={mood.id}
                    style={{ transform: [{ scale: scaleAnims[index] }] }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.moodOption,
                        isSelected && { 
                          borderColor: mood.color, 
                          borderWidth: 3,
                          backgroundColor: mood.color + '10'
                        }
                      ]}
                      onPress={() => handleMoodSelect(mood.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                      <Text style={[styles.moodLabel, { color: mood.color }]}>
                        {mood.label}
                      </Text>
                      <Text style={styles.moodDescription}>
                        {mood.description}
                      </Text>
                      
                      {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <Ionicons name="checkmark-circle" size={24} color={mood.color} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        ) : (
          // Response Screen
          <View style={styles.responseContainer}>
            {selectedMoodData && response && (
              <>
                {/* Mood Echo */}
                <View style={styles.responseHeader}>
                  <Text style={styles.responseEmoji}>
                    {selectedMoodData.emoji}
                  </Text>
                  <Text style={[styles.responseMoodLabel, { color: selectedMoodData.color }]}>
                    {selectedMoodData.label}
                  </Text>
                </View>

                {/* Response Message */}
                <View style={styles.messageContainer}>
                  <Text style={[styles.responseTitle, { color: difficultyColors[difficulty] }]}>
                    {response.message}
                  </Text>
                  <Text style={styles.responseSubtitle}>
                    {response.subtitle}
                  </Text>
                </View>

                {/* Encouragement Box */}
                <View style={[styles.encouragementBox, { borderColor: selectedMoodData.color }]}>
                  <Ionicons name="heart" size={24} color="#EF4444" />
                  <Text style={styles.encouragementText}>
                    {response.encouragement}
                  </Text>
                </View>

                {/* Difficulty-specific message */}
                <View style={[styles.difficultyMessage, { backgroundColor: difficultyColors[difficulty] + '20' }]}>
                  <Text style={[styles.difficultyText, { color: difficultyColors[difficulty] }]}>
                    {difficulty === 'gentle' && "Gentle movement, powerful impact! 🌱"}
                    {difficulty === 'steady' && "Steady progress builds lasting change! 🌊"}
                    {difficulty === 'beast' && "You unleashed your inner strength! 🔥"}
                  </Text>
                </View>

                {/* Complete Button */}
                <TouchableOpacity
                  style={[styles.completeButton, { backgroundColor: difficultyColors[difficulty] }]}
                  onPress={handleComplete}
                  activeOpacity={0.9}
                >
                  <Text style={styles.completeButtonText}>
                    Continue THRIVING
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  moodsContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingVertical: 20,
  },
  moodOption: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 120,
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  moodDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  responseContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responseHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  responseEmoji: {
    fontSize: 80,
    marginBottom: 15,
  },
  responseMoodLabel: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  responseTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  responseSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
  },
  encouragementBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: width * 0.9,
  },
  encouragementText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  difficultyMessage: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  completeButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MoodTracker;