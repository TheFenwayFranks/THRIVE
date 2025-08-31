import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import DifficultySelector from '../../components/DifficultySelector/DifficultySelector';
import WorkoutTimer from '../../components/WorkoutTimer/WorkoutTimer';
import CelebrationSystem from '../../components/CelebrationSystem/CelebrationSystem';
import MoodTracker from '../../components/MoodTracker/MoodTracker';
import { StorageService } from '../../services/StorageService';
import { WorkoutService, type Workout } from '../../services/WorkoutService';

interface MoveTabProps {
  route?: {
    params?: {
      recommendedDifficulty?: 'gentle' | 'steady' | 'beast';
    }
  }
}

export default function MoveTab({ route }: MoveTabProps) {
  const [currentDifficulty, setCurrentDifficulty] = useState<'gentle' | 'steady' | 'beast'>('gentle');
  const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [celebrationData, setCelebrationData] = useState({
    xpGained: 0,
    streakCount: 0,
    achievementUnlocked: undefined as string | undefined
  });

  useEffect(() => {
    loadWorkouts();
    loadUserSettings();
    
    // Check for recommended difficulty from morning flow
    if (route?.params?.recommendedDifficulty && route.params.recommendedDifficulty !== currentDifficulty) {
      setCurrentDifficulty(route.params.recommendedDifficulty);
    }
  }, [currentDifficulty, route?.params?.recommendedDifficulty]);

  const loadUserSettings = async () => {
    const settings = await StorageService.getSettings();
    if (settings.difficulty && settings.difficulty !== currentDifficulty) {
      setCurrentDifficulty(settings.difficulty);
    }
  };

  const loadWorkouts = async () => {
    const workouts = await WorkoutService.getWorkoutsByDifficulty(currentDifficulty);
    setAvailableWorkouts(workouts);
    setSelectedWorkout(null);
    setIsWorkoutActive(false);
  };

  const handleDifficultySelect = async (difficulty: 'gentle' | 'steady' | 'beast') => {
    setCurrentDifficulty(difficulty);
    
    // Save difficulty preference
    const settings = await StorageService.getSettings();
    settings.difficulty = difficulty;
    await StorageService.saveSettings(settings);
    
    await Haptics.selectionAsync();
  };

  const handleWorkoutSelect = async (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentExerciseIndex(0);
    setIsWorkoutActive(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleExerciseComplete = async () => {
    if (!selectedWorkout) return;

    const nextIndex = currentExerciseIndex + 1;
    
    if (nextIndex < selectedWorkout.exercises.length) {
      // Move to next exercise
      setCurrentExerciseIndex(nextIndex);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Workout complete!
      await handleWorkoutComplete();
    }
  };

  const handleWorkoutComplete = async () => {
    if (!selectedWorkout) return;
    
    setIsWorkoutActive(false);
    
    // Calculate XP reward
    const xpGained = WorkoutService.calculateXPReward(currentDifficulty, selectedWorkout.duration);
    
    // Update user stats and progress
    const stats = await StorageService.getUserStats();
    const progressData = await StorageService.getProgressData();
    
    if (stats) {
      stats.xp += xpGained;
      stats.totalWorkouts += 1;
      stats.lastWorkoutDate = new Date().toISOString();
      
      // Update streak
      const today = new Date().toDateString();
      const lastWorkout = stats.lastWorkoutDate ? new Date(stats.lastWorkoutDate).toDateString() : null;
      
      if (lastWorkout !== today) {
        stats.currentStreak += 1;
      }
      
      await StorageService.saveUserStats(stats);
    }

    // Update progress data
    if (progressData) {
      progressData.totalWorkouts += 1;
      progressData.lastWorkoutDate = new Date().toISOString();
      progressData.dailyWorkoutStreak = stats?.currentStreak || 0;
      await StorageService.saveProgressData(progressData);
    }

    // Save workout session
    await StorageService.saveWorkoutSession({
      workoutId: selectedWorkout.id,
      difficulty: currentDifficulty,
      duration: selectedWorkout.duration,
      completed: true,
      exercises: selectedWorkout.exercises.length
    });

    // Check for achievements
    let achievementUnlocked: string | undefined;
    if (stats?.currentStreak === 3) {
      achievementUnlocked = "First 3-Day Streak!";
    } else if (stats?.currentStreak === 7) {
      achievementUnlocked = "Week Warrior!";
    } else if (stats?.currentStreak === 30) {
      achievementUnlocked = "Month Master!";
    } else if (stats?.totalWorkouts === 10) {
      achievementUnlocked = "Perfect Ten!";
    } else if (stats?.totalWorkouts === 50) {
      achievementUnlocked = "Half Century Hero!";
    }

    // Show celebration
    setCelebrationData({
      xpGained,
      streakCount: stats?.currentStreak || 0,
      achievementUnlocked
    });
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setShowMoodTracker(true);
  };

  const handleMoodComplete = () => {
    setShowMoodTracker(false);
    setSelectedWorkout(null);
    setCurrentExerciseIndex(0);
  };

  const handleBackToWorkouts = () => {
    Alert.alert(
      "End Workout?",
      "Are you sure you want to end this workout?",
      [
        {
          text: "Keep Going",
          style: "cancel"
        },
        {
          text: "End Workout",
          style: "destructive",
          onPress: () => {
            setSelectedWorkout(null);
            setIsWorkoutActive(false);
            setCurrentExerciseIndex(0);
          }
        }
      ]
    );
  };

  const currentExercise = selectedWorkout?.exercises[currentExerciseIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {!isWorkoutActive ? (
            <>
              <View style={styles.titleContainer}>
                <Text style={styles.titleEmoji}>🌱</Text>
                <Text style={styles.title}>
                  Ready to <Text style={styles.titleHighlight}>THRIVE</Text> today?
                </Text>
              </View>
              <Text style={styles.subtitle}>
                Your wellness journey starts now! Every movement counts. You've got this! 💙
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackToWorkouts}
              >
                <Ionicons name="arrow-back" size={24} color="#6B7280" />
                <Text style={styles.backButtonText}>Back to Workouts</Text>
              </TouchableOpacity>
              <Text style={styles.workoutTitle}>{selectedWorkout?.name}</Text>
              {selectedWorkout && selectedWorkout.exercises.length > 1 && (
                <Text style={styles.progressText}>
                  Exercise {currentExerciseIndex + 1} of {selectedWorkout.exercises.length}
                </Text>
              )}
            </>
          )}
        </View>

        {!isWorkoutActive ? (
          <>
            {/* Difficulty Selector */}
            <DifficultySelector
              selectedDifficulty={currentDifficulty}
              onSelect={handleDifficultySelect}
            />

            {/* Motivational Message */}
            <View style={styles.motivationContainer}>
              <Text style={styles.motivationText}>
                {WorkoutService.getDifficultyMessage(currentDifficulty)}
              </Text>
            </View>

            {/* Available Workouts */}
            <View style={styles.workoutsSection}>
              <Text style={styles.sectionTitle}>
                Choose Your {currentDifficulty === 'gentle' ? 'Gentle' : 
                            currentDifficulty === 'steady' ? 'Steady' : 'Beast Mode'} Workout
              </Text>
              
              {availableWorkouts.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  style={styles.workoutCard}
                  onPress={() => handleWorkoutSelect(workout)}
                  activeOpacity={0.8}
                >
                  <View style={styles.workoutHeader}>
                    <Ionicons 
                      name={workout.icon as keyof typeof Ionicons.glyphMap} 
                      size={28} 
                      color="#16A34A" 
                    />
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutTitle}>
                        {workout.name}
                      </Text>
                      <Text style={styles.workoutDuration}>
                        {workout.duration} minutes • {workout.exercises.length} exercises
                      </Text>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </View>
                  <Text style={styles.workoutDescription}>
                    {workout.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          // Active Workout Screen
          <View style={styles.activeWorkoutContainer}>
            {currentExercise && (
              <WorkoutTimer
                duration={currentExercise.duration}
                onComplete={handleExerciseComplete}
                difficulty={currentDifficulty}
                exerciseName={currentExercise.name}
                instructions={currentExercise.instructions}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Celebration System */}
      <CelebrationSystem
        isVisible={showCelebration}
        xpGained={celebrationData.xpGained}
        streakCount={celebrationData.streakCount}
        achievementUnlocked={celebrationData.achievementUnlocked}
        difficulty={currentDifficulty}
        onComplete={handleCelebrationComplete}
      />

      {/* Mood Tracker */}
      <MoodTracker
        isVisible={showMoodTracker}
        workoutSession={selectedWorkout}
        difficulty={currentDifficulty}
        onComplete={handleMoodComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Extra space for tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleEmoji: {
    fontSize: 32,
    marginRight: 8,
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
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  workoutTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  motivationContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  motivationText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  workoutsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
    marginLeft: 16,
  },
  workoutDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  activeWorkoutContainer: {
    flex: 1,
    minHeight: 500,
  },
});