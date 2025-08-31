import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simplified THRIVE Mobile App for better mobile compatibility
export default function AppSimple() {
  const [currentTab, setCurrentTab] = useState('move');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'gentle' | 'steady' | 'beast'>('gentle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [userStats, setUserStats] = useState({ xp: 0, streak: 0, totalWorkouts: 0 });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const stats = await AsyncStorage.getItem('@thrive_stats');
      if (stats) {
        setUserStats(JSON.parse(stats));
      }
    } catch (error) {
      console.log('No saved data found');
    }
  };

  const saveUserData = async (newStats: typeof userStats) => {
    try {
      await AsyncStorage.setItem('@thrive_stats', JSON.stringify(newStats));
      setUserStats(newStats);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const workouts = {
    gentle: [
      { name: '4-7-8 Breathing', duration: 3, description: 'Calming breathing exercise' },
      { name: 'Bed Stretches', duration: 5, description: 'Gentle stretches from bed' }
    ],
    steady: [
      { name: 'Morning Flow', duration: 12, description: 'Wake up your body and mind' },
      { name: 'Stress Release', duration: 15, description: 'Release tension and reset' }
    ],
    beast: [
      { name: 'Energy Burst HIIT', duration: 20, description: 'High-intensity energy boost' },
      { name: 'Strength & Power', duration: 25, description: 'Build strength and feel powerful' }
    ]
  };

  const startWorkout = (workout: any) => {
    setTimeLeft(workout.duration * 60); // Convert to seconds
    setIsTimerActive(true);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          completeWorkout(workout);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeWorkout = async (workout: any) => {
    setIsTimerActive(false);
    
    const xpGain = selectedDifficulty === 'gentle' ? 10 : 
                   selectedDifficulty === 'steady' ? 20 : 30;
    
    const newStats = {
      xp: userStats.xp + xpGain,
      streak: userStats.streak + 1,
      totalWorkouts: userStats.totalWorkouts + 1
    };
    
    await saveUserData(newStats);
    
    Alert.alert(
      '🎉 Workout Complete!',
      `Amazing work! You earned ${xpGain} XP!\n\nYour streak: ${newStats.streak} days\nTotal workouts: ${newStats.totalWorkouts}`,
      [{ text: 'Continue THRIVING! 💙', onPress: () => {} }]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isTimerActive) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.timerContainer}>
          <Text style={styles.timerTitle}>Workout in Progress</Text>
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
          <Text style={styles.encouragement}>
            You're doing great! Keep going! 💪
          </Text>
          <TouchableOpacity 
            style={styles.pauseButton}
            onPress={() => {
              setIsTimerActive(false);
              Alert.alert('Workout paused', 'Take your time! Resume when ready.');
            }}
          >
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>THRIVE Mobile</Text>
        <Text style={styles.subtitle}>Ready to THRIVE? 💙</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'move' && styles.activeTab]}
          onPress={() => setCurrentTab('move')}
        >
          <Text style={[styles.tabText, currentTab === 'move' && styles.activeTabText]}>
            Move
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'progress' && styles.activeTab]}
          onPress={() => setCurrentTab('progress')}
        >
          <Text style={[styles.tabText, currentTab === 'progress' && styles.activeTabText]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {currentTab === 'move' ? (
          // Move Tab
          <View>
            {/* Difficulty Selector */}
            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
            <View style={styles.difficultyContainer}>
              {(['gentle', 'steady', 'beast'] as const).map(difficulty => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.difficultyButton,
                    selectedDifficulty === difficulty && styles.activeDifficulty,
                    { backgroundColor: difficulty === 'gentle' ? '#D1FAE5' :
                                     difficulty === 'steady' ? '#DBEAFE' : '#FEE2E2' }
                  ]}
                  onPress={() => setSelectedDifficulty(difficulty)}
                >
                  <Text style={styles.difficultyTitle}>
                    {difficulty === 'gentle' ? '🌱 Gentle' :
                     difficulty === 'steady' ? '🌊 Steady' : '🔥 Beast Mode'}
                  </Text>
                  <Text style={styles.difficultyDesc}>
                    {difficulty === 'gentle' ? '2-8 min • Low energy perfect' :
                     difficulty === 'steady' ? '10-15 min • Ready to move' : 
                     '20-25 min • Bring the energy!'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Workouts */}
            <Text style={styles.sectionTitle}>Choose Your Workout</Text>
            {workouts[selectedDifficulty].map((workout, index) => (
              <TouchableOpacity
                key={index}
                style={styles.workoutCard}
                onPress={() => startWorkout(workout)}
              >
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDuration}>{workout.duration} minutes</Text>
                <Text style={styles.workoutDesc}>{workout.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          // Progress Tab
          <View>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            
            <View style={styles.statsCard}>
              <Text style={styles.statNumber}>⚡ {userStats.xp} XP</Text>
              <Text style={styles.statLabel}>Total Experience</Text>
            </View>
            
            <View style={styles.statsCard}>
              <Text style={styles.statNumber}>🔥 {userStats.streak} Days</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            
            <View style={styles.statsCard}>
              <Text style={styles.statNumber}>💪 {userStats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>

            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                Alert.alert(
                  'Reset Progress?',
                  'This will clear all your progress data.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Reset', 
                      style: 'destructive',
                      onPress: () => saveUserData({ xp: 0, streak: 0, totalWorkouts: 0 })
                    }
                  ]
                );
              }}
            >
              <Text style={styles.resetButtonText}>Reset Progress</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  difficultyContainer: {
    marginBottom: 30,
  },
  difficultyButton: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeDifficulty: {
    borderColor: '#3B82F6',
  },
  difficultyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  difficultyDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  workoutCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  workoutDuration: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 8,
  },
  workoutDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  resetButton: {
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  timerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 40,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  encouragement: {
    fontSize: 18,
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '600',
  },
  pauseButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});