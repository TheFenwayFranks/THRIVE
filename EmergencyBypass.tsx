import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';

// EMERGENCY BYPASS - Single Screen with Basic THRIVE Functionality
// NO NAVIGATION, NO COMPLEX COMPONENTS, JUST CORE FEATURES

const workoutDatabase = {
  gentle: [
    {id: 1, name: "Gentle Neck Rolls", duration: "30 seconds", description: "Slow, gentle neck circles"},
    {id: 2, name: "Seated Stretches", duration: "1 minute", description: "Simple stretches in your chair"},
    {id: 3, name: "Deep Breathing", duration: "2 minutes", description: "Calm, focused breathing"},
    {id: 4, name: "Wall Push-ups", duration: "30 seconds", description: "Gentle push-ups against the wall"},
    {id: 5, name: "Calf Raises", duration: "30 seconds", description: "Rise up on your toes slowly"}
  ],
  steady: [
    {id: 6, name: "Bodyweight Squats", duration: "1 minute", description: "Steady pace squats"},
    {id: 7, name: "Walking in Place", duration: "2 minutes", description: "March with high knees"},
    {id: 8, name: "Arm Circles", duration: "1 minute", description: "Forward and backward circles"},
    {id: 9, name: "Modified Push-ups", duration: "1 minute", description: "Knee push-ups or incline"},
    {id: 10, name: "Standing Stretches", duration: "1 minute", description: "Full body stretching routine"}
  ],
  beast: [
    {id: 11, name: "Jumping Jacks", duration: "1 minute", description: "High energy cardio burst"},
    {id: 12, name: "Burpees", duration: "45 seconds", description: "Full body explosive movement"},
    {id: 13, name: "Mountain Climbers", duration: "45 seconds", description: "Fast alternating legs"},
    {id: 14, name: "High Knees", duration: "1 minute", description: "Run in place with intensity"},
    {id: 15, name: "Push-up Variations", duration: "1 minute", description: "Standard or advanced push-ups"}
  ]
};

export default function EmergencyBypass() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'gentle' | 'steady' | 'beast' | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState<number[]>([]);

  const handleDifficultySelect = (difficulty: 'gentle' | 'steady' | 'beast') => {
    console.log(`🎯 Difficulty selected: ${difficulty}`);
    setSelectedDifficulty(difficulty);
  };

  const handleWorkoutComplete = (workoutId: number) => {
    if (!completedWorkouts.includes(workoutId)) {
      setCompletedWorkouts([...completedWorkouts, workoutId]);
      Alert.alert(
        "Great Job! 🌟", 
        "Workout completed! Keep up the amazing work!",
        [{ text: "Continue", style: "default" }]
      );
    }
  };

  const handleReset = () => {
    setSelectedDifficulty(null);
    setCompletedWorkouts([]);
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

  const renderWorkoutList = () => {
    if (!selectedDifficulty) return null;

    const workouts = workoutDatabase[selectedDifficulty];
    
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

        {workouts.map((workout) => (
          <View key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutDuration}>{workout.duration}</Text>
              <Text style={styles.workoutDescription}>{workout.description}</Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.completeButton,
                completedWorkouts.includes(workout.id) && styles.completedButton,
                { backgroundColor: completedWorkouts.includes(workout.id) ? '#10B981' : getDifficultyColor(selectedDifficulty) }
              ]}
              onPress={() => handleWorkoutComplete(workout.id)}
            >
              <Text style={styles.completeButtonText}>
                {completedWorkouts.includes(workout.id) ? '✓ Done!' : 'Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

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
        
        {/* Emergency Header */}
        <View style={styles.emergencyHeader}>
          <Text style={styles.emergencyTitle}>🚨 EMERGENCY BYPASS</Text>
          <Text style={styles.emergencySubtitle}>Basic THRIVE functionality - navigation bypassed</Text>
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

        {!selectedDifficulty ? (
          // Difficulty Selection
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Energy Level</Text>
            
            <TouchableOpacity 
              style={[styles.difficultyCard, styles.gentle]}
              onPress={() => handleDifficultySelect('gentle')}
            >
              <Text style={styles.difficultyEmoji}>🌱</Text>
              <Text style={styles.difficultyTitle}>Gentle</Text>
              <Text style={styles.difficultySubtitle}>Low energy? Perfect.</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.difficultyCard, styles.steady]}
              onPress={() => handleDifficultySelect('steady')}
            >
              <Text style={styles.difficultyEmoji}>🚶</Text>
              <Text style={styles.difficultyTitle}>Steady</Text>
              <Text style={styles.difficultySubtitle}>Ready to move</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.difficultyCard, styles.beast]}
              onPress={() => handleDifficultySelect('beast')}
            >
              <Text style={styles.difficultyEmoji}>🔥</Text>
              <Text style={styles.difficultyTitle}>Beast Mode</Text>
              <Text style={styles.difficultySubtitle}>Bring the energy!</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Workout List
          renderWorkoutList()
        )}

        {/* Status Message */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            ✅ WORKING: Basic difficulty selection and workout list{'\n'}
            🔧 BYPASSED: Navigation, complex components, morning flow{'\n'}
            🚀 NEXT: Fix navigation system gradually
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  emergencyHeader: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#991B1B',
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
  workoutName: {
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
  workoutDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  completeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#10B981',
  },
  completeButtonText: {
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
  statusContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statusText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
});