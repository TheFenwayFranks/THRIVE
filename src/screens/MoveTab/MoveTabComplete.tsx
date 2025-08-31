import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert
} from 'react-native';
import { StorageService } from '../../services/StorageService';
import MoodTracker from '../../components/MoodTracker';

// COMPLETE MOVE TAB - All Phase 1 THRIVE Features
// Includes: Enhanced Workouts + Timers + XP + Celebrations + Mood Tracking

// Phase 1 THRIVE Workout Database
const workoutDatabase = {
  gentle: [
    {id: 1, name: "4-7-8 Breathing", duration: 3, description: "Calming breathing exercise perfect for anxiety and overwhelm"},
    {id: 2, name: "Bed Stretches", duration: 5, description: "Gentle stretches you can do from bed - perfect for low energy days"},
    {id: 3, name: "Mindful Movement", duration: 6, description: "Slow, intentional movements to reconnect with your body"},
    {id: 4, name: "Seated Yoga Flow", duration: 4, description: "Gentle yoga you can do from your chair"},
    {id: 5, name: "Progressive Relaxation", duration: 7, description: "Release tension throughout your entire body"}
  ],
  steady: [
    {id: 6, name: "Morning Energy Flow", duration: 12, description: "Wake up your body and mind with gentle movement"},
    {id: 7, name: "Stress Release Flow", duration: 15, description: "Release tension and reset your nervous system"},
    {id: 8, name: "Body Reset Routine", duration: 10, description: "Full body movement to reset your energy"},
    {id: 9, name: "Strength Builder", duration: 13, description: "Build functional strength for daily life"},
    {id: 10, name: "Flow & Stretch", duration: 11, description: "Combine movement with deep stretching"}
  ],
  beast: [
    {id: 11, name: "Energy Burst HIIT", duration: 20, description: "High-intensity intervals to boost mood and energy"},
    {id: 12, name: "Strength & Power", duration: 25, description: "Build strength and feel powerful in your body"},
    {id: 13, name: "Cardio Challenge", duration: 18, description: "Push your cardiovascular limits and feel alive"},
    {id: 14, name: "Power Flow", duration: 22, description: "Dynamic movements for maximum energy release"},
    {id: 15, name: "Beast Mode HIIT", duration: 28, description: "Ultimate high-intensity experience for peak energy"}
  ]
};

interface UserStats {
  xp: number;
  streak: number;
  totalWorkouts: number;
  lastWorkoutDate?: string;
}

interface MoveTabProps {
  route?: {
    params?: {
      preselectedDifficulty?: 'gentle' | 'steady' | 'beast';
    };
  };
}

export default function MoveTabComplete({ route }: MoveTabProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'gentle' | 'steady' | 'beast' | null>(
    route?.params?.preselectedDifficulty || null
  );
  const [completedWorkouts, setCompletedWorkouts] = useState<number[]>([]);
  
  // Timer states
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  // User stats states
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 0,
    streak: 0,
    totalWorkouts: 0
  });

  // Celebration states
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{xpGain: number, message: string}>({xpGain: 0, message: ''});

  // Mood tracking states
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [completedWorkoutData, setCompletedWorkoutData] = useState<{difficulty: 'gentle' | 'steady' | 'beast', xpGain: number} | null>(null);

  // Load user stats on mount
  useEffect(() => {
    loadUserStats();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      completeWorkout();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const loadUserStats = async () => {
    try {
      const stats = await StorageService.getUserStats();
      if (stats) {
        setUserStats({
          xp: stats.xp || 0,
          streak: stats.currentStreak || 0,
          totalWorkouts: stats.totalWorkouts || 0,
          lastWorkoutDate: stats.lastWorkoutDate || undefined
        });
      }
    } catch (error) {
      console.log('Using default stats due to error:', error);
    }
  };

  const saveUserStats = async (newStats: UserStats) => {
    try {
      const storageStats = {
        xp: newStats.xp,
        currentStreak: newStats.streak,
        totalWorkouts: newStats.totalWorkouts,
        lastWorkoutDate: newStats.lastWorkoutDate || null,
        dailyTasksCompleted: 0
      };
      
      await StorageService.saveUserStats(storageStats);
      setUserStats(newStats);
    } catch (error) {
      console.error('Failed to save stats:', error);
      setUserStats(newStats);
    }
  };

  const handleDifficultySelect = (difficulty: 'gentle' | 'steady' | 'beast') => {
    console.log(`🎯 Difficulty selected: ${difficulty}`);
    console.log('📊 Current state before difficulty selection:');
    console.log('- userStats:', userStats);
    console.log('- completedWorkouts:', completedWorkouts);
    console.log('- workoutDatabase for', difficulty, ':', workoutDatabase[difficulty]);
    
    try {
      setSelectedDifficulty(difficulty);
      console.log('✅ Difficulty state updated successfully');
    } catch (error) {
      console.error('❌ Error setting difficulty:', error);
    }
  };

  const startWorkout = (workout: any) => {
    setCurrentWorkout(workout);
    setTimeLeft(workout.duration * 60); // Convert minutes to seconds
    setIsWorkoutActive(true);
    setIsRunning(true);
  };

  const pauseWorkout = () => {
    setIsRunning(!isRunning);
  };

  const endWorkout = () => {
    Alert.alert(
      "End Workout?",
      "Are you sure you want to end this workout?",
      [
        { text: "Continue", style: "cancel" },
        { text: "End Workout", onPress: cancelWorkout }
      ]
    );
  };

  const cancelWorkout = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsRunning(false);
    setIsWorkoutActive(false);
    setCurrentWorkout(null);
    setTimeLeft(0);
  };

  const completeWorkout = async () => {
    if (!currentWorkout || !selectedDifficulty) return;

    // Stop timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsRunning(false);

    // Calculate XP based on difficulty
    const xpGain = selectedDifficulty === 'gentle' ? 10 : 
                   selectedDifficulty === 'steady' ? 20 : 30;

    // Update completed workouts
    if (!completedWorkouts.includes(currentWorkout.id)) {
      setCompletedWorkouts([...completedWorkouts, currentWorkout.id]);
    }

    // Update user stats
    const newStats: UserStats = {
      xp: userStats.xp + xpGain,
      streak: userStats.streak + 1,
      totalWorkouts: userStats.totalWorkouts + 1,
      lastWorkoutDate: new Date().toISOString()
    };

    await saveUserStats(newStats);

    // Prepare celebration
    const celebrationMessages = {
      gentle: "Gentle movement, powerful impact! 🌱",
      steady: "Steady progress builds lasting change! 🌊", 
      beast: "You unleashed your inner strength! 🔥"
    };

    setCelebrationData({
      xpGain,
      message: celebrationMessages[selectedDifficulty]
    });

    // Store data for mood tracking
    setCompletedWorkoutData({
      difficulty: selectedDifficulty,
      xpGain
    });

    // Reset workout state
    setIsWorkoutActive(false);
    setCurrentWorkout(null);
    setTimeLeft(0);

    // Show celebration
    setShowCelebration(true);
  };

  const hideCelebration = () => {
    setShowCelebration(false);
    
    // After celebration, show mood tracker
    if (completedWorkoutData) {
      setShowMoodTracker(true);
    }
  };

  const handleMoodTrackingComplete = (mood: number, response: string) => {
    setShowMoodTracker(false);
    setCompletedWorkoutData(null);
  };

  const handleReset = () => {
    setSelectedDifficulty(null);
    setCompletedWorkouts([]);
    if (isWorkoutActive) {
      cancelWorkout();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'gentle': return '#10B981';
      case 'steady': return '#3B82F6';
      case 'beast': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'gentle': return '🌱';
      case 'steady': return '🚶';
      case 'beast': return '🔥';
      default: return '💪';
    }
  };

  // Render workout timer screen
  if (isWorkoutActive && currentWorkout) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.timerContainer}>
          <Text style={styles.workoutName}>{currentWorkout.name}</Text>
          <Text style={styles.workoutDescription}>{currentWorkout.description}</Text>
          
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
          
          <Text style={styles.encouragement}>
            You're doing great! Keep going! 💪
          </Text>
          
          <View style={styles.timerButtons}>
            <TouchableOpacity 
              style={[styles.timerButton, styles.pauseButton]}
              onPress={pauseWorkout}
            >
              <Text style={styles.timerButtonText}>
                {isRunning ? '⏸️ Pause' : '▶️ Resume'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.timerButton, styles.endButton]}
              onPress={endWorkout}
            >
              <Text style={styles.timerButtonText}>End Workout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const renderWorkoutList = () => {
    console.log('🔍 renderWorkoutList called with selectedDifficulty:', selectedDifficulty);
    
    if (!selectedDifficulty) {
      console.log('❌ No difficulty selected, returning null');
      return null;
    }

    try {
      const workouts = workoutDatabase[selectedDifficulty];
      console.log('📝 Workouts for', selectedDifficulty, ':', workouts);
      
      if (!workouts || workouts.length === 0) {
        console.error('❌ No workouts found for difficulty:', selectedDifficulty);
        return (
          <View style={styles.workoutContainer}>
            <Text style={styles.workoutTitle}>No workouts available</Text>
          </View>
        );
      }
    
    return (
      <View style={styles.workoutContainer}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>
            {getDifficultyEmoji(selectedDifficulty)} {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Workouts
          </Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Change Level</Text>
          </TouchableOpacity>
        </View>

        {workouts.map((workout) => {
          console.log('🏋️ Rendering workout:', workout.name, 'id:', workout.id);
          return (
          <View key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutCardName}>{workout.name}</Text>
              <Text style={styles.workoutDuration}>{workout.duration} minutes</Text>
              <Text style={styles.workoutCardDescription}>{workout.description}</Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.startButton,
                { backgroundColor: getDifficultyColor(selectedDifficulty) }
              ]}
              onPress={() => startWorkout(workout)}
            >
              <Text style={styles.startButtonText}>
                {completedWorkouts.includes(workout.id) ? '✓ Start Again' : 'Start'}
              </Text>
            </TouchableOpacity>
          </View>
        );
        })}
      } catch (error) {
        console.error('❌ Error in renderWorkoutList:', error);
        return (
          <View style={styles.workoutContainer}>
            <Text style={styles.workoutTitle}>Error loading workouts</Text>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }

        <View style={styles.progressSummary}>
          <Text style={styles.progressText}>
            Completed: {completedWorkouts.length} / {workouts.length} workouts
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Stats Header */}
        <View style={styles.statsHeader}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
          </View>
        </View>

        {/* Main THRIVE Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Ready to <Text style={styles.highlight}>THRIVE</Text>? 🌱
          </Text>
          <Text style={styles.subtitle}>
            Every movement counts. You've got this! 💙
          </Text>
        </View>

        {(() => {
          console.log('🎨 Rendering main content, selectedDifficulty:', selectedDifficulty);
          
          try {
            if (!selectedDifficulty) {
              console.log('📋 Rendering difficulty selection');
              return (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Choose Your Energy Level</Text>
                  
                  <TouchableOpacity 
                    style={[styles.difficultyCard, styles.gentle]}
                    onPress={() => handleDifficultySelect('gentle')}
                  >
                    <Text style={styles.difficultyEmoji}>🌱</Text>
                    <Text style={styles.difficultyTitle}>Gentle</Text>
                    <Text style={styles.difficultySubtitle}>Low energy? Perfect. (+10 XP per workout)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.difficultyCard, styles.steady]}
                    onPress={() => handleDifficultySelect('steady')}
                  >
                    <Text style={styles.difficultyEmoji}>🚶</Text>
                    <Text style={styles.difficultyTitle}>Steady</Text>
                    <Text style={styles.difficultySubtitle}>Ready to move (+20 XP per workout)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.difficultyCard, styles.beast]}
                    onPress={() => handleDifficultySelect('beast')}
                  >
                    <Text style={styles.difficultyEmoji}>🔥</Text>
                    <Text style={styles.difficultyTitle}>Beast Mode</Text>
                    <Text style={styles.difficultySubtitle}>Bring the energy! (+30 XP per workout)</Text>
                  </TouchableOpacity>
                </View>
              );
            } else {
              console.log('🏋️ Rendering workout list');
              return renderWorkoutList();
            }
          } catch (error) {
            console.error('❌ Error in main render logic:', error);
            return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Something went wrong</Text>
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={() => {
                    setSelectedDifficulty(null);
                    console.log('🔄 Reset to difficulty selection');
                  }}
                >
                  <Text style={styles.resetButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            );
          }
        })()}

      </ScrollView>

      {/* Celebration Modal */}
      <Modal
        visible={showCelebration}
        transparent={true}
        animationType="fade"
        onRequestClose={hideCelebration}
      >
        <View style={styles.celebrationOverlay}>
          <View style={styles.celebrationModal}>
            <Text style={styles.celebrationIcon}>🎉</Text>
            <Text style={styles.celebrationTitle}>Workout Complete!</Text>
            <Text style={styles.celebrationMessage}>
              {celebrationData.message}
            </Text>
            <Text style={styles.celebrationXP}>
              +{celebrationData.xpGain} XP earned!
            </Text>
            <Text style={styles.celebrationStreak}>
              Streak: {userStats.streak} days
            </Text>
            <TouchableOpacity 
              style={styles.celebrationButton}
              onPress={hideCelebration}
            >
              <Text style={styles.celebrationButtonText}>Continue THRIVING! 💙</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Mood Tracker Modal */}
      {completedWorkoutData && (
        <MoodTracker
          visible={showMoodTracker}
          onComplete={handleMoodTrackingComplete}
          workoutDifficulty={completedWorkoutData.difficulty}
          xpGained={completedWorkoutData.xpGain}
        />
      )}
    </SafeAreaView>
  );
}

// ... (styles would be the same as EmergencyEnhanced.tsx)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  statsHeader: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  statLabel: {
    fontSize: 12,
    color: '#3B82F6',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  highlight: {
    color: '#16A34A',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  difficultyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  gentle: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  steady: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  beast: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
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
  },
  workoutContainer: {
    marginBottom: 20,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  resetButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  workoutDuration: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 2,
  },
  workoutCardDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressSummary: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  // Timer Screen Styles
  timerContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  workoutDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  encouragement: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center',
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  timerButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#3B82F6',
  },
  endButton: {
    backgroundColor: '#EF4444',
  },
  timerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Celebration Modal Styles
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    maxWidth: 300,
    margin: 20,
  },
  celebrationIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  celebrationMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  celebrationXP: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 8,
  },
  celebrationStreak: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
  },
  celebrationButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  celebrationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});