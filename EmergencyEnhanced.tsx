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
import { useTheme } from './src/context/ThemeContext';
import { StorageService } from './src/services/StorageService';
import MoodTracker from './src/components/MoodTracker';
import VideoPlayerPlaceholder from './src/components/VideoPlayerPlaceholder';
import MorningFlow from './src/components/MorningFlow';
import SettingsModal from './src/components/SettingsModal';
import CommunityFeed from './src/components/CommunityFeed';

// ENHANCED THRIVE DASHBOARD - Full ADHD-Optimized Interface
// Includes: Quick Access + Dashboard + Smart Shortcuts + Minimal Navigation

// Phase 1 THRIVE Workout Database (with proper timers and descriptions)
const workoutDatabase = {
  gentle: [
    {id: 1, name: "4-7-8 Breathing", duration: 3, description: "Calming breathing exercise perfect for anxiety and overwhelm"},
    {id: 2, name: "Bed Stretches", duration: 5, description: "Gentle stretches you can do from bed - perfect for low energy days"},
    {id: 3, name: "Mindful Movement", duration: 6, description: "Slow, intentional movements to reconnect with your body"},
    {id: 4, name: "Wall Push-ups", duration: 2, description: "Gentle push-ups against the wall"},
    {id: 5, name: "Calf Raises", duration: 2, description: "Rise up on your toes slowly"}
  ],
  steady: [
    {id: 6, name: "Morning Energy Flow", duration: 12, description: "Wake up your body and mind with gentle movement"},
    {id: 7, name: "Stress Release Flow", duration: 15, description: "Release tension and reset your nervous system"},
    {id: 8, name: "Body Reset Routine", duration: 10, description: "Full body movement to reset your energy"},
    {id: 9, name: "Strength Builder", duration: 8, description: "Build functional strength"},
    {id: 10, name: "Flow & Stretch", duration: 7, description: "Combine movement with stretching"}
  ],
  beast: [
    {id: 11, name: "Energy Burst HIIT", duration: 20, description: "High-intensity intervals to boost mood and energy"},
    {id: 12, name: "Strength & Power", duration: 25, description: "Build strength and feel powerful in your body"},
    {id: 13, name: "Cardio Challenge", duration: 15, description: "Push your cardiovascular limits"},
    {id: 14, name: "Power Flow", duration: 18, description: "Dynamic movements for maximum energy"},
    {id: 15, name: "Beast Mode HIIT", duration: 22, description: "Ultimate high-intensity experience"}
  ]
};

// User stats interface
interface UserStats {
  xp: number;
  streak: number;
  totalWorkouts: number;
  lastWorkoutDate?: string;
}

export default function EmergencyEnhanced() {
  const { theme, toggleTheme, themeMode } = useTheme();
  const styles = createStyles(theme);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'gentle' | 'steady' | 'beast' | null>(null);
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
  const [completedWorkoutData, setCompletedWorkoutData] = useState<{
    difficulty: 'gentle' | 'steady' | 'beast', 
    xpGain: number,
    workoutName?: string,
    workoutDuration?: number
  } | null>(null);

  // Dashboard states
  const [currentView, setCurrentView] = useState<'dashboard' | 'workout' | 'timer' | 'community'>('dashboard');
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [dailyMood, setDailyMood] = useState<number | null>(null);
  const [todayGoal, setTodayGoal] = useState({ current: 0, target: 50 }); // XP goal

  // Video player states
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideoWorkout, setSelectedVideoWorkout] = useState<any>(null);

  // Morning flow states
  const [showMorningFlow, setShowMorningFlow] = useState(false);
  const [hasSeenMorningFlowToday, setHasSeenMorningFlowToday] = useState(false);
  
  // Settings states
  const [showSettings, setShowSettings] = useState(false);

  // Community states
  const [showCommunity, setShowCommunity] = useState(false);

  // Load user stats and check morning flow on mount
  useEffect(() => {
    loadUserStats();
    loadCompletedWorkouts();
    checkMorningFlowStatus();
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
        // Map StorageService format to our format
        setUserStats({
          xp: stats.xp || 0,
          streak: stats.currentStreak || 0,
          totalWorkouts: stats.totalWorkouts || 0,
          lastWorkoutDate: stats.lastWorkoutDate || undefined
        });
      } else {
        // Use default stats if none exist
        const defaultStats = {
          xp: 0,
          streak: 0,
          totalWorkouts: 0
        };
        setUserStats(defaultStats);
      }
    } catch (error) {
      console.log('Using default stats due to error:', error);
      // Use default stats if loading fails
      const defaultStats = {
        xp: 0,
        streak: 0,
        totalWorkouts: 0
      };
      setUserStats(defaultStats);
    }
  };

  const loadCompletedWorkouts = async () => {
    try {
      const completedIds = await StorageService.getCompletedWorkouts();
      console.log('📋 Loaded completed workouts:', completedIds);
      setCompletedWorkouts(completedIds);
    } catch (error) {
      console.error('Failed to load completed workouts:', error);
      setCompletedWorkouts([]);
    }
  };

  const saveUserStats = async (newStats: UserStats) => {
    try {
      // Map our format to StorageService format
      const storageStats = {
        xp: newStats.xp,
        currentStreak: newStats.streak,
        totalWorkouts: newStats.totalWorkouts,
        lastWorkoutDate: newStats.lastWorkoutDate || null,
        dailyTasksCompleted: 0 // Default value
      };
      
      await StorageService.saveUserStats(storageStats);
      setUserStats(newStats);
    } catch (error) {
      console.error('Failed to save stats:', error);
      // Still update local state even if save fails
      setUserStats(newStats);
    }
  };

  const handleDifficultySelect = (difficulty: 'gentle' | 'steady' | 'beast') => {
    console.log(`🎯 Difficulty selected: ${difficulty}`);
    console.log('📊 Current state before difficulty selection:');
    console.log('- userStats:', userStats);
    console.log('- selectedDifficulty (current):', selectedDifficulty);
    console.log('- workoutDatabase for', difficulty, ':', workoutDatabase[difficulty]);
    
    setSelectedDifficulty(difficulty);
    console.log('✅ setSelectedDifficulty called successfully');
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
      "Complete Workout?",
      "Mark this workout as complete and earn XP?",
      [
        { text: "Continue", style: "cancel" },
        { text: "Complete Workout", onPress: completeWorkout }
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
    setCurrentView('dashboard');
    setSelectedDifficulty(null);
  };

  const abandonWorkout = () => {
    Alert.alert(
      "Abandon Workout?",
      "Are you sure you want to abandon this workout without earning XP?",
      [
        { text: "Continue Workout", style: "cancel" },
        { text: "Abandon", style: "destructive", onPress: cancelWorkout }
      ]
    );
  };

  const completeWorkout = async () => {
    if (!currentWorkout || !selectedDifficulty) return;

    // Stop timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsRunning(false);

    // Calculate XP based on difficulty (Phase 1 system)
    const xpGain = selectedDifficulty === 'gentle' ? 10 : 
                   selectedDifficulty === 'steady' ? 20 : 30;

    // Update completed workouts
    if (!completedWorkouts.includes(currentWorkout.id)) {
      const updatedCompletedWorkouts = [...completedWorkouts, currentWorkout.id];
      setCompletedWorkouts(updatedCompletedWorkouts);
      // Persist to storage
      await StorageService.saveCompletedWorkouts(updatedCompletedWorkouts);
      console.log('✅ Workout marked as completed:', currentWorkout.id);
    }

    // Update user stats
    const newStats: UserStats = {
      xp: userStats.xp + xpGain,
      streak: userStats.streak + 1, // Simplified streak logic for now
      totalWorkouts: userStats.totalWorkouts + 1,
      lastWorkoutDate: new Date().toISOString()
    };

    await saveUserStats(newStats);

    // Prepare celebration
    const celebrationMessages = {
      gentle: "Gentle movement, powerful impact!",
      steady: "Steady progress builds lasting change!", 
      beast: "You unleashed your inner strength!"
    };

    setCelebrationData({
      xpGain,
      message: celebrationMessages[selectedDifficulty]
    });

    // Store data for mood tracking
    setCompletedWorkoutData({
      difficulty: selectedDifficulty,
      xpGain,
      workoutName: currentWorkout.name,
      workoutDuration: currentWorkout.duration
    });

    // Reset workout state
    setIsWorkoutActive(false);
    setCurrentWorkout(null);
    setTimeLeft(0);
    
    // Return to dashboard after workout completion
    setCurrentView('dashboard');
    setSelectedDifficulty(null);

    // Show celebration
    setShowCelebration(true);
  };

  const hideCelebration = () => {
    console.log('🎉 Celebration closed, triggering mood tracking');
    setShowCelebration(false);
    
    // After celebration, automatically show mood tracker
    if (completedWorkoutData) {
      console.log('😊 Showing mood tracker with workout data:', completedWorkoutData);
      setShowMoodTracker(true);
    }
  };

  const handleMoodTrackingComplete = (mood: number, response: string) => {
    console.log('😊 Mood tracking completed:', mood, response);
    setShowMoodTracker(false);
    setCompletedWorkoutData(null);
    setDailyMood(mood);
    console.log('🏠 Returning to dashboard after mood tracking');
  };

  // Quick access functions
  const quickStartWorkout = (difficulty: 'gentle' | 'steady' | 'beast') => {
    console.log(`🚀 Quick start ${difficulty} workout`);
    setSelectedDifficulty(difficulty);
    setCurrentView('workout');
  };

  const quickMoodCheckin = () => {
    console.log('😊 Quick mood check-in button pressed');
    setShowMoodTracker(true);
    setCompletedWorkoutData({ 
      difficulty: 'gentle', 
      xpGain: 0,
      workoutName: 'Quick Mood Check',
      workoutDuration: 0
    }); // Mock data for mood-only check
    console.log('😊 Mood tracker modal should be showing');
  };

  const testWorkoutFlow = () => {
    console.log('🧪 Testing complete workout to mood tracking flow');
    
    // Simulate workout completion
    const mockWorkout = { name: "Test Breathing", duration: 3 };
    setCurrentWorkout(mockWorkout);
    setSelectedDifficulty('gentle');
    
    // Trigger completion flow
    const mockCompletedData = {
      difficulty: 'gentle' as 'gentle' | 'steady' | 'beast',
      xpGain: 10,
      workoutName: mockWorkout.name,
      workoutDuration: mockWorkout.duration
    };
    
    setCompletedWorkoutData(mockCompletedData);
    
    // Update stats
    const newStats = {
      xp: userStats.xp + 10,
      streak: userStats.streak + 1,
      totalWorkouts: userStats.totalWorkouts + 1,
      lastWorkoutDate: new Date().toISOString()
    };
    setUserStats(newStats);
    
    // Show celebration first
    console.log('🎉 Showing celebration modal');
    setShowCelebration(true);
  };

  const backToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedDifficulty(null);
    if (isWorkoutActive) {
      cancelWorkout();
    }
  };

  const showCommunityView = () => {
    console.log('🏟️ Navigating to Community Feed');
    console.log('🏟️ Current state before community nav:', { currentView, selectedDifficulty, isWorkoutActive });
    setCurrentView('community');
    console.log('🏟️ Community view set successfully');
  };

  const getMotivationalMessage = () => {
    const messages = [
      "You're building strength with every session",
      "Consistent small steps create lasting change",
      "Your mental wellness is a priority",
      "Focus on progress over perfection",
      "You have the power to THRIVE today"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getRecommendedWorkout = () => {
    const hour = new Date().getHours();
    if (hour < 10) return { difficulty: 'gentle', reason: 'Gentle start for morning energy' };
    if (hour < 16) return { difficulty: 'steady', reason: 'Steady pace for midday focus' };
    return { difficulty: 'beast', reason: 'High intensity to finish strong' };
  };

  const getXPProgress = () => {
    const todayXP = userStats.xp % 100; // Simulate daily XP
    const percentage = (todayXP / 50) * 100; // Daily goal of 50 XP
    return Math.min(percentage, 100);
  };

  const showVideoDemo = (workout: any) => {
    console.log('🎥 Showing video demo for:', workout.name);
    setSelectedVideoWorkout(workout);
    setShowVideoPlayer(true);
  };

  const closeVideoDemo = () => {
    console.log('🎥 Closing video demo');
    setShowVideoPlayer(false);
    setSelectedVideoWorkout(null);
  };

  const checkMorningFlowStatus = async () => {
    try {
      const lastMorningFlowDate = await StorageService.getMorningFlowDate();
      const today = new Date().toDateString();
      
      console.log('🌅 Checking morning flow status:', {
        lastDate: lastMorningFlowDate,
        today: today,
        hasSeenToday: lastMorningFlowDate === today
      });
      
      if (lastMorningFlowDate !== today) {
        // User hasn't seen morning flow today
        console.log('🌅 Showing morning flow for new day');
        setHasSeenMorningFlowToday(false);
        // Show morning flow after a brief delay
        setTimeout(() => {
          setShowMorningFlow(true);
        }, 1000);
      } else {
        console.log('🌅 User already completed morning flow today');
        setHasSeenMorningFlowToday(true);
      }
    } catch (error) {
      console.error('Failed to check morning flow status:', error);
      // Default to showing morning flow if we can't check
      setShowMorningFlow(true);
    }
  };

  const completeMorningFlow = () => {
    console.log('🌅 Morning flow completed, proceeding to dashboard');
    setShowMorningFlow(false);
    setHasSeenMorningFlowToday(true);
  };

  const startMorningFlow = () => {
    console.log('🌅 Morning Flow button pressed');
    console.log('🌅 Current morning flow state:', { showMorningFlow, hasSeenMorningFlowToday });
    setShowMorningFlow(true);
    console.log('🌅 Morning flow modal should be showing');
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

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'gentle': return 'GENTLE';
      case 'steady': return 'STEADY';
      case 'beast': return 'INTENSE';
      default: return 'WORKOUT';
    }
  };

  // Render workout timer screen
  if (isWorkoutActive && currentWorkout) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.timerContainer}>
          {/* Back Button */}
          <TouchableOpacity style={styles.floatingBackButton} onPress={backToDashboard}>
            <Text style={styles.floatingBackText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.workoutName}>{currentWorkout.name}</Text>
          <Text style={styles.workoutDescription}>{currentWorkout.description}</Text>
          
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
          
          <Text style={styles.encouragement}>
            You're doing great! Keep going!
          </Text>
          
          <View style={styles.timerButtons}>
            <TouchableOpacity 
              style={[styles.timerButton, styles.pauseButton]}
              onPress={pauseWorkout}
            >
              <Text style={styles.timerButtonText}>
                {isRunning ? 'Pause' : 'Resume'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.timerButton, styles.endButton]}
              onPress={endWorkout}
            >
              <Text style={styles.timerButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>

          {/* Abandon Option */}
          <TouchableOpacity 
            style={styles.abandonButton}
            onPress={abandonWorkout}
          >
            <Text style={styles.abandonButtonText}>Abandon Workout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Dashboard components
  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <View style={styles.quickStatCard}>
        <Text style={styles.quickStatValue}>{userStats.streak}</Text>
        <Text style={styles.quickStatLabel}>Day Streak</Text>
      </View>
      <View style={styles.quickStatCard}>
        <Text style={styles.quickStatValue}>{userStats.xp}</Text>
        <Text style={styles.quickStatLabel}>Total XP</Text>
      </View>
      <View style={styles.quickStatCard}>
        <Text style={styles.quickStatValue}>{Math.round(getXPProgress())}%</Text>
        <Text style={styles.quickStatLabel}>Daily Goal</Text>
      </View>
      <View style={styles.quickStatCard}>
        <Text style={styles.quickStatValue}>{dailyMood ? ['Poor','Fair','Good','Great','Excellent'][dailyMood-1] || 'N/A' : 'N/A'}</Text>
        <Text style={styles.quickStatLabel}>Today's Mood</Text>
      </View>
    </View>
  );

  const renderQuickActions = () => {
    const recommended = getRecommendedWorkout();
    return (
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionRow}>
          <TouchableOpacity 
            style={[styles.quickActionButton, styles.primaryAction]}
            onPress={() => quickStartWorkout(recommended.difficulty as 'gentle' | 'steady' | 'beast')}
          >
            <Text style={styles.quickActionText}>Start Workout</Text>
            <Text style={styles.quickActionSubtext}>{recommended.reason}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionButton, styles.secondaryAction]}
            onPress={quickMoodCheckin}
          >
            <Text style={styles.quickActionText}>Mood Check-in</Text>
            <Text style={styles.quickActionSubtext}>Track your progress</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActionRow}>
          <TouchableOpacity 
            style={[styles.quickActionButton, styles.gentleAction]}
            onPress={() => quickStartWorkout('gentle')}
          >
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyBadgeText}>GENTLE</Text>
            </View>
            <Text style={styles.quickActionText}>Light Movement</Text>
            <Text style={styles.quickActionSubtext}>2-6 minutes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionButton, styles.steadyAction]}
            onPress={() => quickStartWorkout('steady')}
          >
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyBadgeText}>STEADY</Text>
            </View>
            <Text style={styles.quickActionText}>Moderate Activity</Text>
            <Text style={styles.quickActionSubtext}>7-15 minutes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionButton, styles.beastAction]}
            onPress={() => quickStartWorkout('beast')}
          >
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyBadgeText}>INTENSE</Text>
            </View>
            <Text style={styles.quickActionText}>High Energy</Text>
            <Text style={styles.quickActionSubtext}>15-25 minutes</Text>
          </TouchableOpacity>
        </View>

        {/* Development Tools */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: theme.colors.mood }]}
            onPress={testWorkoutFlow}
          >
            <Text style={styles.quickActionText}>Test Flow</Text>
            <Text style={styles.quickActionSubtext}>Demo experience</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: theme.colors.warning }]}
            onPress={() => showVideoDemo({ name: 'Demo Exercise', duration: 5 })}
          >
            <Text style={styles.quickActionText}>Video Preview</Text>
            <Text style={styles.quickActionSubtext}>Exercise guide</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: '#0F172A' }]}
            onPress={startMorningFlow}
          >
            <Text style={styles.quickActionIcon}>🌅</Text>
            <Text style={styles.quickActionText}>Morning Flow</Text>
            <Text style={styles.quickActionSubtext}>Daily motivation</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHomeFeed = () => (
    <View style={styles.homeFeedContainer}>
      <Text style={styles.sectionTitle}>🏠 Today's Focus</Text>
      
      <View style={styles.feedCard}>
        <Text style={styles.feedCardTitle}>💪 {getMotivationalMessage()}</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${getXPProgress()}%` }]} />
          </View>
          <Text style={styles.progressText}>XP Progress: {Math.round(getXPProgress())}%</Text>
        </View>
      </View>

      {userStats.totalWorkouts > 0 && (
        <View style={styles.feedCard}>
          <Text style={styles.feedCardTitle}>🎉 You've completed {userStats.totalWorkouts} workouts!</Text>
          <Text style={styles.feedCardText}>Keep up the amazing progress!</Text>
        </View>
      )}

      <View style={styles.feedCard}>
        <Text style={styles.feedCardTitle}>Progress Summary</Text>
        <Text style={styles.feedCardText}>
          • Current streak: {userStats.streak} consecutive days
        </Text>
        <Text style={styles.feedCardText}>
          • Total experience: {userStats.xp} points
        </Text>
        {dailyMood && (
          <Text style={styles.feedCardText}>
            • Today's mood: {['Poor','Fair','Good','Great','Excellent'][dailyMood-1]}
          </Text>
        )}
      </View>

      {hasSeenMorningFlowToday && (
        <View style={[styles.feedCard, { backgroundColor: theme.isDark ? theme.colors.surface : '#F0FDF4', borderLeftColor: theme.colors.primary }]}>
          <Text style={styles.feedCardTitle}>Morning Flow Complete</Text>
          <Text style={styles.feedCardText}>
            Excellent work setting your daily intention. Your mind and body are prepared to THRIVE today.
          </Text>
          <TouchableOpacity 
            style={styles.comingSoonButton}
            onPress={startMorningFlow}
          >
            <Text style={styles.comingSoonButtonText}>Experience Again</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.feedCard}>
        <Text style={styles.feedCardTitle}>🎥 Video Demos Coming Soon!</Text>
        <Text style={styles.feedCardText}>
          We're working on high-quality exercise demonstration videos to help you perform each movement safely and effectively.
        </Text>
        <TouchableOpacity 
          style={styles.comingSoonButton}
          onPress={() => showVideoDemo({ name: 'Sample Exercise' })}
        >
          <Text style={styles.comingSoonButtonText}>Preview Video Player 🎥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDashboard = () => (
    <View style={styles.dashboardContainer}>
      {renderQuickStats()}
      {renderQuickActions()}
      {renderHomeFeed()}
    </View>
  );

  const renderWorkoutList = () => {
    console.log('🔍 renderWorkoutList called with selectedDifficulty:', selectedDifficulty);
    
    if (!selectedDifficulty) {
      console.log('❌ No difficulty selected, returning null');
      return null;
    }

    const workouts = workoutDatabase[selectedDifficulty];
    console.log('📝 Workouts for', selectedDifficulty, ':', workouts);
    
    if (!workouts || workouts.length === 0) {
      console.error('❌ No workouts found for difficulty:', selectedDifficulty);
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>No workouts available</Text>
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
          const isCompleted = completedWorkouts.includes(workout.id);
          return (
            <View key={workout.id} style={[
              styles.workoutCard,
              isCompleted && styles.completedWorkoutCard
            ]}>
              <View style={styles.workoutInfo}>
                <View style={styles.workoutNameRow}>
                  <Text style={[
                    styles.workoutCardName,
                    isCompleted && styles.completedWorkoutName
                  ]}>
                    {workout.name}
                  </Text>
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.workoutDuration,
                  isCompleted && styles.completedText
                ]}>
                  {workout.duration} minutes
                </Text>
                <Text style={[
                  styles.workoutCardDescription,
                  isCompleted && styles.completedText
                ]}>
                  {workout.description}
                </Text>
              
              {/* Video Demo Button */}
              <TouchableOpacity 
                style={styles.videoDemoButton}
                onPress={() => showVideoDemo(workout)}
                activeOpacity={0.7}
              >
                <Text style={styles.videoDemoText}>Show Demo</Text>
                <Text style={styles.videoDemoSubtext}>(Coming Soon)</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.workoutActions}>
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
          </View>
          );
        })}

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
        
        {/* Streamlined Dashboard Header */}
        <View style={styles.dashboardHeader}>
          <View style={styles.headerTop}>
            <Text style={styles.dashboardTitle}>
              <Text style={styles.highlight}>THRIVE</Text> Dashboard
            </Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.professionalButton} onPress={startMorningFlow}>
                <Text style={styles.professionalButtonText}>Morning</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.professionalButton} onPress={quickMoodCheckin}>
                <Text style={styles.professionalButtonText}>Check-in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.professionalButton} onPress={showCommunityView}>
                <Text style={styles.professionalButtonText}>Community</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.professionalButton} onPress={() => setShowSettings(true)}>
                <Text style={styles.professionalButtonText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.dashboardSubtitle}>
            {getMotivationalMessage()}
          </Text>
        </View>

        {/* Main Content based on current view */}
        {(() => {
          console.log('🎨 Rendering main content, currentView:', currentView, 'selectedDifficulty:', selectedDifficulty);
          
          if (currentView === 'dashboard') {
            return renderDashboard();
          } else if (currentView === 'workout' && selectedDifficulty) {
            return (
              <View>
                {/* Back to Dashboard Button */}
                <TouchableOpacity style={styles.backButton} onPress={backToDashboard}>
                  <Text style={styles.backButtonText}>← Back to Dashboard</Text>
                </TouchableOpacity>
                {renderWorkoutList()}
              </View>
            );
          } else if (currentView === 'community') {
            return (
              <View>
                {/* Back to Dashboard Button */}
                <TouchableOpacity style={styles.backButton} onPress={backToDashboard}>
                  <Text style={styles.backButtonText}>← Back to Dashboard</Text>
                </TouchableOpacity>
                <CommunityFeed userStats={userStats} />
              </View>
            );
          } else {
            // Fallback to dashboard
            return renderDashboard();
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
            <View style={styles.celebrationBadge}>
              <Text style={styles.celebrationBadgeText}>✓</Text>
            </View>
            <Text style={styles.celebrationTitle}>Session Complete</Text>
            <Text style={styles.celebrationMessage}>
              {celebrationData.message}
            </Text>
            <Text style={styles.celebrationXP}>
              +{celebrationData.xpGain} XP earned
            </Text>
            <Text style={styles.celebrationStreak}>
              Current streak: {userStats.streak} days
            </Text>
            <TouchableOpacity 
              style={styles.celebrationButton}
              onPress={hideCelebration}
            >
              <Text style={styles.celebrationButtonText}>Continue Progress</Text>
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
          workoutName={currentWorkout?.name}
          workoutDuration={currentWorkout?.duration}
        />
      )}

      {/* Video Player Placeholder Modal */}
      <VideoPlayerPlaceholder
        visible={showVideoPlayer}
        onClose={closeVideoDemo}
        workoutName={selectedVideoWorkout?.name || 'Exercise Demo'}
      />

      {/* Morning Flow Modal */}
      <MorningFlow
        visible={showMorningFlow}
        onComplete={completeMorningFlow}
        userStats={userStats}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}

// Dynamic styles function that uses theme colors
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
  },
  enhancedHeader: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  emergencySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
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
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  highlight: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  difficultyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  gentle: {
    borderColor: theme.colors.gentle,
    backgroundColor: theme.isDark ? theme.colors.surface : '#F0FDF4',
  },
  steady: {
    borderColor: theme.colors.steady,
    backgroundColor: theme.isDark ? theme.colors.surface : '#EFF6FF',
  },
  beast: {
    borderColor: theme.colors.beast,
    backgroundColor: theme.isDark ? theme.colors.surface : '#FEF2F2',
  },
  difficultyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  difficultyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  difficultySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
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
    color: theme.colors.text,
  },
  resetButton: {
    backgroundColor: theme.colors.textMuted,
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
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  completedWorkoutCard: {
    backgroundColor: theme.isDark ? theme.colors.surface : '#F0FDF4',
    borderColor: theme.colors.success,
    borderWidth: 2,
  },
  workoutNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  completedWorkoutName: {
    textDecorationLine: 'line-through',
    color: theme.colors.success,
  },
  completedText: {
    color: theme.colors.success,
    opacity: 0.8,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  completedBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  workoutDuration: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '500',
    marginBottom: 2,
  },
  workoutCardDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  videoDemoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  videoDemoIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  videoDemoText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
    marginRight: 4,
  },
  videoDemoSubtext: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  workoutActions: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
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
    backgroundColor: theme.isDark ? theme.colors.surface : '#DBEAFE',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.info,
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
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  workoutDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: theme.colors.shadow,
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
    color: theme.colors.success,
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
    backgroundColor: theme.colors.info,
  },
  endButton: {
    backgroundColor: theme.colors.success,
  },
  abandonButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  abandonButtonText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  timerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Dashboard Styles
  dashboardHeader: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  dashboardSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 20,
    color: theme.colors.text,
  },
  professionalButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 70,
    alignItems: 'center',
  },
  professionalButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dashboardContainer: {
    gap: 16,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  quickActionsContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: theme.colors.primary,
  },
  secondaryAction: {
    backgroundColor: theme.colors.info,
  },
  gentleAction: {
    backgroundColor: theme.colors.gentle,
  },
  steadyAction: {
    backgroundColor: theme.colors.steady,
  },
  beastAction: {
    backgroundColor: theme.colors.beast,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
    alignSelf: 'center',
  },
  difficultyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickActionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  homeFeedContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  feedCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  feedCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  feedCardText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  comingSoonButton: {
    backgroundColor: theme.isDark ? theme.colors.surface : '#EFF6FF',
    borderWidth: 1,
    borderColor: theme.colors.info,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  comingSoonButtonText: {
    fontSize: 14,
    color: theme.colors.info,
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: theme.colors.textMuted,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  floatingBackButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  floatingBackText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  
  // Celebration Modal Styles
  celebrationOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationModal: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    maxWidth: 300,
    margin: 20,
  },
  celebrationBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  celebrationBadgeText: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  celebrationMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  celebrationXP: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.celebration,
    marginBottom: 8,
  },
  celebrationStreak: {
    fontSize: 16,
    color: theme.colors.error,
    marginBottom: 20,
  },
  celebrationButton: {
    backgroundColor: theme.colors.primary,
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