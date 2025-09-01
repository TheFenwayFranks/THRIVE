import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  Animated
} from 'react-native';
import { useTheme } from './src/context/ThemeContext';
import { StorageService } from './src/services/StorageService';
import MoodTracker from './src/components/MoodTracker';
import VideoPlayerPlaceholder from './src/components/VideoPlayerPlaceholder';
import MorningFlow from './src/components/MorningFlow';
import SettingsModal from './src/components/SettingsModal';
import CommunityFeed from './src/components/CommunityFeed';
import StatsTab from './src/components/StatsTab';
import SwipeNavigation, { PageName } from './src/components/PureSwipeNavigation';
import HamburgerMenu from './src/components/HamburgerMenu';
import WebOnboarding from './web-onboarding';
import { OnboardingManager, OnboardingState } from './src/services/OnboardingManager';
import CollapsibleTaskCard from './src/components/CollapsibleTaskCard';

// ENHANCED THRIVE DASHBOARD - Full ADHD-Optimized Interface
// Includes: Quick Access + Dashboard + Smart Shortcuts + Minimal Navigation

// ENHANCED THRIVE Workout Database with Progressive Activities
const workoutDatabase = {
  gentle: [
    {
      id: 1, 
      name: "4-7-8 Breathing", 
      duration: 3, 
      description: "Calming breathing exercise perfect for anxiety and overwhelm",
      activities: [
        {id: '1-1', name: 'Find comfortable seated position', duration: 30},
        {id: '1-2', name: 'Inhale for 4 counts', duration: 30},
        {id: '1-3', name: 'Hold breath for 7 counts', duration: 60},
        {id: '1-4', name: 'Exhale slowly for 8 counts', duration: 60},
        {id: '1-5', name: 'Repeat cycle 3 times', duration: 60}
      ]
    },
    {
      id: 2, 
      name: "Bed Stretches", 
      duration: 5, 
      description: "Gentle stretches you can do from bed - perfect for low energy days",
      activities: [
        {id: '2-1', name: 'Knee-to-chest stretch', duration: 60},
        {id: '2-2', name: 'Spinal twist (both sides)', duration: 90},
        {id: '2-3', name: 'Cat-cow stretch', duration: 60},
        {id: '2-4', name: 'Shoulder rolls', duration: 45},
        {id: '2-5', name: 'Gentle neck stretches', duration: 45}
      ]
    },
    {
      id: 3, 
      name: "Mindful Movement", 
      duration: 6, 
      description: "Slow, intentional movements to reconnect with your body",
      activities: [
        {id: '3-1', name: 'Standing body scan', duration: 60},
        {id: '3-2', name: 'Arm circles', duration: 45},
        {id: '3-3', name: 'Hip circles', duration: 60},
        {id: '3-4', name: 'Gentle marching in place', duration: 90},
        {id: '3-5', name: 'Deep breathing with movement', duration: 105}
      ]
    },
    {
      id: 4, 
      name: "Wall Push-ups", 
      duration: 2, 
      description: "Gentle push-ups against the wall",
      activities: [
        {id: '4-1', name: 'Position arms against wall', duration: 15},
        {id: '4-2', name: '5 slow wall push-ups', duration: 30},
        {id: '4-3', name: 'Rest and breathe', duration: 15},
        {id: '4-4', name: '5 more wall push-ups', duration: 30},
        {id: '4-5', name: 'Gentle arm shakes', duration: 30}
      ]
    },
    {
      id: 5, 
      name: "Calf Raises", 
      duration: 2, 
      description: "Rise up on your toes slowly",
      activities: [
        {id: '5-1', name: 'Find balance position', duration: 15},
        {id: '5-2', name: '10 slow calf raises', duration: 45},
        {id: '5-3', name: 'Brief rest', duration: 15},
        {id: '5-4', name: '10 more calf raises', duration: 45}
      ]
    }
  ],
  steady: [
    {
      id: 6, 
      name: "Morning Energy Flow", 
      duration: 12, 
      description: "Wake up your body and mind with gentle movement",
      activities: [
        {id: '6-1', name: 'Dynamic warm-up', duration: 120},
        {id: '6-2', name: 'Sun salutation sequence', duration: 180},
        {id: '6-3', name: 'Standing poses flow', duration: 240},
        {id: '6-4', name: 'Balance poses', duration: 120},
        {id: '6-5', name: 'Cool-down stretches', duration: 60}
      ]
    },
    {
      id: 7, 
      name: "Stress Release Flow", 
      duration: 15, 
      description: "Release tension and reset your nervous system",
      activities: [
        {id: '7-1', name: 'Gentle movement warm-up', duration: 180},
        {id: '7-2', name: 'Hip opening sequence', duration: 240},
        {id: '7-3', name: 'Shoulder release poses', duration: 180},
        {id: '7-4', name: 'Spinal twists', duration: 180},
        {id: '7-5', name: 'Relaxation poses', duration: 120}
      ]
    },
    {
      id: 8, 
      name: "Body Reset Routine", 
      duration: 10, 
      description: "Full body movement to reset your energy",
      activities: [
        {id: '8-1', name: 'Joint mobility warm-up', duration: 120},
        {id: '8-2', name: 'Squat variations', duration: 150},
        {id: '8-3', name: 'Upper body activation', duration: 150},
        {id: '8-4', name: 'Core engagement', duration: 120},
        {id: '8-5', name: 'Integration flow', duration: 60}
      ]
    },
    {
      id: 9, 
      name: "Strength Builder", 
      duration: 8, 
      description: "Build functional strength",
      activities: [
        {id: '9-1', name: 'Dynamic warm-up', duration: 90},
        {id: '9-2', name: 'Bodyweight squats', duration: 120},
        {id: '9-3', name: 'Modified push-ups', duration: 120},
        {id: '9-4', name: 'Plank variations', duration: 90},
        {id: '9-5', name: 'Recovery stretches', duration: 60}
      ]
    },
    {
      id: 10, 
      name: "Flow & Stretch", 
      duration: 7, 
      description: "Combine movement with stretching",
      activities: [
        {id: '10-1', name: 'Flowing warm-up', duration: 90},
        {id: '10-2', name: 'Dynamic stretches', duration: 120},
        {id: '10-3', name: 'Balance flow', duration: 90},
        {id: '10-4', name: 'Deep stretching', duration: 120}
      ]
    }
  ],
  beast: [
    {
      id: 11, 
      name: "Energy Burst HIIT", 
      duration: 20, 
      description: "High-intensity intervals to boost mood and energy",
      activities: [
        {id: '11-1', name: 'High-energy warm-up', duration: 180},
        {id: '11-2', name: 'Jumping jacks interval', duration: 240},
        {id: '11-3', name: 'Burpees interval', duration: 240},
        {id: '11-4', name: 'Mountain climbers interval', duration: 240},
        {id: '11-5', name: 'High knees interval', duration: 180},
        {id: '11-6', name: 'Cool-down recovery', duration: 120}
      ]
    },
    {
      id: 12, 
      name: "Strength & Power", 
      duration: 25, 
      description: "Build strength and feel powerful in your body",
      activities: [
        {id: '12-1', name: 'Power warm-up', duration: 300},
        {id: '12-2', name: 'Push-up variations', duration: 360},
        {id: '12-3', name: 'Squat power moves', duration: 360},
        {id: '12-4', name: 'Core power sequence', duration: 300},
        {id: '12-5', name: 'Explosive movements', duration: 240},
        {id: '12-6', name: 'Power recovery', duration: 240}
      ]
    },
    {
      id: 13, 
      name: "Cardio Challenge", 
      duration: 15, 
      description: "Push your cardiovascular limits",
      activities: [
        {id: '13-1', name: 'Cardio warm-up', duration: 120},
        {id: '13-2', name: 'High-intensity interval 1', duration: 180},
        {id: '13-3', name: 'Active recovery', duration: 60},
        {id: '13-4', name: 'High-intensity interval 2', duration: 180},
        {id: '13-5', name: 'Active recovery', duration: 60},
        {id: '13-6', name: 'Final sprint interval', duration: 120},
        {id: '13-7', name: 'Cool-down cardio', duration: 180}
      ]
    },
    {
      id: 14, 
      name: "Power Flow", 
      duration: 18, 
      description: "Dynamic movements for maximum energy",
      activities: [
        {id: '14-1', name: 'Dynamic power warm-up', duration: 180},
        {id: '14-2', name: 'Power yoga flow', duration: 300},
        {id: '14-3', name: 'Explosive transitions', duration: 240},
        {id: '14-4', name: 'Strength flow sequence', duration: 300},
        {id: '14-5', name: 'Power cool-down', duration: 180}
      ]
    },
    {
      id: 15, 
      name: "Beast Mode HIIT", 
      duration: 22, 
      description: "Ultimate high-intensity experience",
      activities: [
        {id: '15-1', name: 'Beast mode activation', duration: 180},
        {id: '15-2', name: 'Extreme interval 1', duration: 300},
        {id: '15-3', name: 'Power recovery', duration: 120},
        {id: '15-4', name: 'Extreme interval 2', duration: 300},
        {id: '15-5', name: 'Power recovery', duration: 120},
        {id: '15-6', name: 'Final beast push', duration: 240},
        {id: '15-7', name: 'Victory cool-down', duration: 180}
      ]
    }
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
  
  // EMERGENCY BYPASS: Inline timer state to avoid navigation crashes
  const [showInlineTimer, setShowInlineTimer] = useState(false);
  const [inlineWorkout, setInlineWorkout] = useState<any>(null);

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

  // Dashboard states - UPDATED: Swipe navigation
  const [activePage, setActivePage] = useState<PageName>('home');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [dailyMood, setDailyMood] = useState<number | null>(null);
  const [todayGoal, setTodayGoal] = useState({ current: 0, target: 50 }); // XP goal

  // DYNAMIC CONTENT ANIMATION STATES
  const [contentOpacity] = useState(new Animated.Value(1));
  const [prevSelectedDifficulty, setPrevSelectedDifficulty] = useState<string | null>(null);

  // JOURNEY/POTENTIAL BUTTON STATES
  const [selectedJourney, setSelectedJourney] = useState<'new' | 'potential' | null>(null);

  // VIDEO DEMONSTRATION MODAL STATE
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideoActivity, setCurrentVideoActivity] = useState<string>('');

  // EXERCISE DETAILS MODAL STATE
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentDetailActivity, setCurrentDetailActivity] = useState<any>(null);

  // MASTER ONBOARDING STATE - SINGLE SOURCE OF TRUTH
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // DEMO MODE STATE
  const [demoMode, setDemoMode] = useState(false);
  const [showDemoOnboarding, setShowDemoOnboarding] = useState(false);
  
  // Removed debug state - no longer needed
  
  // EMERGENCY STATE MONITORING
  useEffect(() => {
    if (onboardingState) {
      console.log('🔍 ONBOARDING STATE MONITOR:', {
        isFirstTime: onboardingState.isFirstTime,
        showOnboarding: onboardingState.showOnboarding,
        onboardingType: onboardingState.onboardingType,
        hasCompletedOnboarding: onboardingState.hasCompletedOnboarding,
        debugInfo: onboardingState.debugInfo
      });
      
      console.log('📊 APP STATE SUMMARY:', {
        onboardingVisible: onboardingState.showOnboarding,
        userProfileExists: !!userProfile,
        userName: userProfile?.name || 'None'
      });
    }
  }, [onboardingState, userProfile]);

  // PROGRESSIVE TASK COMPLETION: Individual activity tracking
  const [completedActivities, setCompletedActivities] = useState<{[key: string]: boolean}>({});
  const [currentWorkoutProgress, setCurrentWorkoutProgress] = useState<{
    workoutId: number | null;
    completedCount: number;
    totalCount: number;
  }>({
    workoutId: null,
    completedCount: 0,
    totalCount: 0
  });

  // MULTIPLE TIMER SUPPORT - Each activity can have independent timer
  const [activeTimers, setActiveTimers] = useState<{
    [activityId: string]: {
      activityId: string;
      activityName: string;
      workoutId: number;
      duration: number;
      timeLeft: number;
      isRunning: boolean;
    }
  }>({});

  // Legacy single timer (for backwards compatibility, will be deprecated)
  const [activeInlineTimer, setActiveInlineTimer] = useState<{
    activityId: string;
    activityName: string;
    workoutId: number;
    duration: number;
    timeLeft: number;
    isRunning: boolean;
  } | null>(null);

  // Video player states
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideoWorkout, setSelectedVideoWorkout] = useState<any>(null);

  // DISABLED: Morning flow states (EMERGENCY DISABLE)
  // const [showMorningFlow, setShowMorningFlow] = useState(false);
  // const [hasSeenMorningFlowToday, setHasSeenMorningFlowToday] = useState(false);
  
  // Settings states
  const [showSettings, setShowSettings] = useState(false);

  // Community states
  const [showCommunity, setShowCommunity] = useState(false);

  // EMERGENCY ONBOARDING INITIALIZATION
  useEffect(() => {
    initializeOnboardingState();
    loadUserStats();
    loadCompletedWorkouts();
    loadCompletedActivities(); // PROGRESSIVE: Load individual activity completions
    // DISABLED: checkMorningFlowStatus(); // EMERGENCY DISABLE TO PREVENT CONFLICTS
  }, []);

  // EMERGENCY ONBOARDING STATE MANAGER
  const initializeOnboardingState = async () => {
    console.log('🚨 EMERGENCY INIT: Starting clean onboarding state');
    
    try {
      // Clean any potential conflicts automatically
      const conflicts = await OnboardingManager.debugConflicts();
      console.log('🔍 CONFLICT CHECK:', conflicts);
      
      // Initialize clean state
      const state = await OnboardingManager.getOnboardingState();
      setOnboardingState(state);
      
      console.log('✅ ONBOARDING STATE INITIALIZED:', state);
      
      // Try to load existing user profile
      try {
        const profile = await StorageService.getUserProfile();
        if (profile && state.hasCompletedOnboarding) {
          console.log('👤 EXISTING USER PROFILE FOUND:', profile.name);
          setUserProfile(profile);
          // Update state to reflect existing user
          await OnboardingManager.updateOnboardingState({
            isFirstTime: false,
            showOnboarding: false,
            hasCompletedOnboarding: true
          });
        } else {
          console.log('🆕 NEW USER OR INCOMPLETE ONBOARDING');
        }
      } catch (profileError) {
        console.log('📝 NO EXISTING PROFILE - SHOWING ONBOARDING');
      }
      
    } catch (error) {
      console.error('❌ EMERGENCY INIT ERROR:', error);
      // Fallback to clean state
      const fallbackState = await OnboardingManager.initializeCleanState();
      setOnboardingState(fallbackState);
    }
  };

  // MASTER ONBOARDING COMPLETION HANDLER
  const handleOnboardingComplete = async (profile: any) => {
    console.log('🎉 MASTER ONBOARDING: Completing onboarding flow', profile);
    
    try {
      // Use OnboardingManager to handle completion
      const newState = await OnboardingManager.completeOnboarding(profile);
      setOnboardingState(newState);
      setUserProfile(profile);
      
      console.log('✅ ONBOARDING COMPLETED:', newState);
      
      Alert.alert(
        'Welcome to THRIVE! 🎉',
        `Great to have you here, ${profile.name || 'THRIVE User'}! Your personalized wellness journey starts now.`
      );
    } catch (error) {
      console.error('❌ ONBOARDING COMPLETION ERROR:', error);
    }
  };

  // MULTIPLE TIMERS EFFECT - Handles all active timers simultaneously
  useEffect(() => {
    const timerRefs: NodeJS.Timeout[] = [];
    
    // Update all running timers
    Object.values(activeTimers).forEach(timer => {
      if (timer.isRunning && timer.timeLeft > 0) {
        const timerRef = setTimeout(() => {
          setActiveTimers(prev => ({
            ...prev,
            [timer.activityId]: {
              ...timer,
              timeLeft: timer.timeLeft - 1
            }
          }));
        }, 1000);
        timerRefs.push(timerRef);
      } else if (timer.timeLeft === 0 && timer.isRunning) {
        // Complete activity when timer reaches 0
        completeInlineActivity();
      }
    });
    
    return () => {
      timerRefs.forEach(ref => clearTimeout(ref));
    };
  }, [activeTimers]);

  // EMERGENCY INLINE TIMER EFFECT (Legacy - Single Timer)
  useEffect(() => {
    let inlineTimerRef: NodeJS.Timeout;
    
    if (activeInlineTimer?.isRunning && activeInlineTimer.timeLeft > 0) {
      inlineTimerRef = setTimeout(() => {
        setActiveInlineTimer(prev => {
          if (!prev) return null;
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1
          };
        });
      }, 1000);
    } else if (activeInlineTimer?.timeLeft === 0 && activeInlineTimer.isRunning) {
      // Complete activity when timer reaches 0
      console.log('🚨 INLINE TIMER: Activity completed!');
      completeInlineActivity();
    }

    return () => {
      if (inlineTimerRef) {
        clearTimeout(inlineTimerRef);
      }
    };
  }, [activeInlineTimer?.isRunning, activeInlineTimer?.timeLeft]);

  // Timer effect (keep existing for compatibility)
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Check if this is an individual activity or full workout
      if (currentWorkout?.isIndividualActivity) {
        completeIndividualActivity(currentWorkout.id, currentWorkout.workoutId);
      } else {
        completeWorkout();
      }
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

  // PROGRESSIVE COMPLETION: Load individual activity completions
  const loadCompletedActivities = async () => {
    try {
      // EMERGENCY RESET: Clear all activity completions to fix incorrect display
      console.log('🚨 EMERGENCY RESET: Clearing all completed activities to fix display bug');
      const emptyActivities = {};
      await StorageService.saveCompletedActivities(emptyActivities);
      setCompletedActivities(emptyActivities);
      
      // Previous code (disabled for emergency reset):
      // const activities = await StorageService.getCompletedActivities();
      // console.log('🎯 Loaded completed activities:', Object.keys(activities).length, 'activities');
      // setCompletedActivities(activities);
    } catch (error) {
      console.error('Failed to load completed activities:', error);
      setCompletedActivities({});
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
    console.log('🚨 DEBUG: startWorkout called with:', workout);
    
    try {
      console.log('🚨 DEBUG: Setting current workout...');
      setCurrentWorkout(workout);
      
      console.log('🚨 DEBUG: Setting time left...');
      setTimeLeft(workout.duration * 60); // Convert minutes to seconds
      
      console.log('🚨 DEBUG: Setting workout active...');
      setIsWorkoutActive(true);
      
      console.log('🚨 DEBUG: Setting running state...');
      setIsRunning(true);
      
      console.log('🚨 DEBUG: startWorkout completed successfully');
    } catch (error) {
      console.error('🚨 CRASH: startWorkout error:', error);
      console.error('🚨 CRASH: Error in startWorkout:', error.message);
    }
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
    console.log('🚨 AUTO-REDIRECT DEBUG: cancelWorkout() called - this will navigate to home');
    console.log('🚨 Stack trace:', new Error().stack);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsRunning(false);
    setIsWorkoutActive(false);
    setCurrentWorkout(null);
    setTimeLeft(0);
    
    // LEGITIMATE: This should return to home after canceling workout
    console.log('✅ LEGITIMATE AUTO-REDIRECT: Workout canceled, returning to home');
    setActivePage('home');
    setCurrentPageIndex(0);
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

  // MULTIPLE TIMER FUNCTIONS
  const startInlineActivity = (activity: any, workoutId: number) => {
    console.log('🚨 MULTI-TIMER: Starting activity:', activity.name);
    
    // Add to multiple timers map
    setActiveTimers(prev => ({
      ...prev,
      [activity.id]: {
        activityId: activity.id,
        activityName: activity.name,
        workoutId: workoutId,
        duration: activity.duration,
        timeLeft: activity.duration,
        isRunning: true
      }
    }));

    // Legacy single timer (for backwards compatibility)
    setActiveInlineTimer({
      activityId: activity.id,
      activityName: activity.name,
      workoutId: workoutId,
      duration: activity.duration,
      timeLeft: activity.duration,
      isRunning: true
    });
  };

  const completeInlineActivity = () => {
    if (!activeInlineTimer) return;
    
    console.log('🚨 INLINE TIMER: Completing activity:', activeInlineTimer.activityName);
    
    // Mark activity as completed
    const activityKey = `${activeInlineTimer.workoutId}-${activeInlineTimer.activityId}`;
    setCompletedActivities(prev => ({
      ...prev,
      [activityKey]: true
    }));
    
    // Clear the timer
    setActiveInlineTimer(null);
    
    console.log('✅ INLINE TIMER: Activity completed and marked');
  };

  const stopInlineActivity = (activityId?: string) => {
    if (activityId) {
      // Remove specific timer from multiple timers
      setActiveTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[activityId];
        return newTimers;
      });
      
      // Legacy: If this was the active single timer, clear it
      if (activeInlineTimer?.activityId === activityId) {
        setActiveInlineTimer(null);
      }
    } else {
      // Legacy: Stop the current active timer
      setActiveInlineTimer(null);
      
      // Also clear all timers if no specific ID provided
      setActiveTimers({});
    }
  };

  // DEMO MODE HANDLERS
  const startDemoMode = () => {
    console.log('✨ DEMO MODE: Starting tutorial/walkthrough');
    setDemoMode(true);
    setShowDemoOnboarding(true);
  };

  const handleDemoComplete = (profile: any) => {
    console.log('✨ DEMO MODE: Demo completed, returning to main app');
    // Don't save demo profile - it's just for demonstration
    setShowDemoOnboarding(false);
    setDemoMode(false);
    
    // Show completion message
    Alert.alert(
      'Demo Complete! ✨',
      'You\'ve completed the THRIVE tutorial. This was just a demo - your actual profile and settings remain unchanged.',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const exitDemoMode = () => {
    console.log('✨ DEMO MODE: User exited demo early');
    setShowDemoOnboarding(false);
    setDemoMode(false);
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
    
    // LEGITIMATE: Return to home page after workout completion  
    console.log('✅ LEGITIMATE AUTO-REDIRECT: Workout completed, returning to home');
    setActivePage('home');
    setCurrentPageIndex(0);
    setSelectedDifficulty(null);

    // Show celebration
    setShowCelebration(true);
  };

  // PROGRESSIVE ACTIVITY COMPLETION SYSTEM
  const toggleActivityCompletion = async (activityId: string, workoutId: number) => {
    console.log('🎯 PROGRESSIVE: Toggling activity completion for:', activityId);
    
    const isCompleted = completedActivities[activityId] || false;
    const newCompletedActivities = {
      ...completedActivities,
      [activityId]: !isCompleted
    };
    
    setCompletedActivities(newCompletedActivities);
    
    // Calculate progress for current workout
    const workout = Object.values(workoutDatabase)
      .flat()
      .find(w => w.id === workoutId);
    
    if (workout && workout.activities) {
      const workoutActivityIds = workout.activities.map(a => a.id);
      const completedInWorkout = workoutActivityIds.filter(id => 
        newCompletedActivities[id]
      ).length;
      
      setCurrentWorkoutProgress({
        workoutId,
        completedCount: completedInWorkout,
        totalCount: workout.activities.length
      });
      
      console.log(`🎯 PROGRESS: ${completedInWorkout}/${workout.activities.length} activities completed in workout ${workoutId}`);
      
      // Auto-complete workout when all activities are done
      if (completedInWorkout === workout.activities.length) {
        console.log('🎉 PROGRESSIVE: All activities completed! Auto-completing workout...');
        
        // Award bonus XP for progressive completion
        const baseXP = selectedDifficulty === 'gentle' ? 10 : 
                      selectedDifficulty === 'steady' ? 20 : 30;
        const progressiveBonus = Math.floor(baseXP * 0.5); // 50% bonus for completing all activities
        
        // Store enhanced completion data
        setCompletedWorkoutData({
          difficulty: selectedDifficulty!,
          xpGain: baseXP + progressiveBonus,
          workoutName: workout.name,
          workoutDuration: workout.duration
        });
        
        // Complete the workout
        await completeWorkout();
      }
    }
    
    // Persist activity completions
    await StorageService.saveCompletedActivities(newCompletedActivities);
  };

  const getActivityProgress = (workoutId: number) => {
    const workout = Object.values(workoutDatabase)
      .flat()
      .find(w => w.id === workoutId);
    
    if (!workout || !workout.activities) return { completed: 0, total: 0 };
    
    const workoutActivityIds = workout.activities.map(a => a.id);
    const completedCount = workoutActivityIds.filter(id => 
      completedActivities[id]
    ).length;
    
    return {
      completed: completedCount,
      total: workout.activities.length
    };
  };

  // VIDEO DEMONSTRATION HANDLER
  const showVideoDemo = (activityName: string) => {
    setCurrentVideoActivity(activityName);
    setShowVideoModal(true);
  };

  // EXERCISE DETAILS HANDLER
  const showExerciseDetails = (activity: any) => {
    setCurrentDetailActivity(activity);
    setShowDetailsModal(true);
  };

  // EXERCISE DETAILS DATABASE
  const getExerciseDetails = (activityName: string) => {
    const exerciseDetails: { [key: string]: { description: string; instructions: string[]; tips: string[] } } = {
      '4-7-8 Breathing': {
        description: 'A calming breathing technique that helps reduce anxiety and promote relaxation.',
        instructions: [
          'Sit or lie down in a comfortable position',
          'Place one hand on your chest, one on your belly',
          'Inhale through your nose for 4 counts',
          'Hold your breath for 7 counts',
          'Exhale slowly through your mouth for 8 counts',
          'Repeat 3-4 cycles'
        ],
        tips: [
          'Keep your shoulders relaxed',
          'Focus on making your exhale longer than your inhale',
          'If you feel dizzy, return to normal breathing'
        ]
      },
      'Body Scan Meditation': {
        description: 'A mindfulness practice that helps you connect with your body and release tension.',
        instructions: [
          'Lie down or sit comfortably',
          'Close your eyes and take a few deep breaths',
          'Start at the top of your head',
          'Slowly move your attention down through each body part',
          'Notice any sensations without judgment',
          'End at your toes'
        ],
        tips: [
          'There\'s no wrong way to feel',
          'If your mind wanders, gently return focus to your body',
          'Take your time with each area'
        ]
      },
      'Gentle Stretching': {
        description: 'Light stretching to improve flexibility and reduce muscle tension.',
        instructions: [
          'Start with neck rolls - slow and controlled',
          'Stretch shoulders by rolling them back',
          'Reach arms overhead and gently side bend',
          'Twist gently from your core',
          'Touch your toes or reach toward them',
          'Hold each stretch for 15-30 seconds'
        ],
        tips: [
          'Never force a stretch',
          'Breathe deeply throughout',
          'Stop if you feel pain'
        ]
      },
      'Power warm-up': {
        description: 'Dynamic movements to prepare your body for more intense exercise.',
        instructions: [
          'March in place with high knees',
          'Arm circles - forward and backward',
          'Leg swings - front to back and side to side',
          'Torso twists with arms extended',
          'Light jumping jacks',
          'Gradually increase intensity'
        ],
        tips: [
          'Start slow and build up',
          'Keep movements controlled',
          'Listen to your body'
        ]
      },
      'Push-up variations': {
        description: 'Modified push-ups to build upper body strength at your level.',
        instructions: [
          'Start with wall push-ups if you\'re a beginner',
          'Progress to knee push-ups',
          'Keep your core engaged',
          'Lower yourself slowly and controlled',
          'Push back up with steady force',
          'Maintain straight line from head to knees/feet'
        ],
        tips: [
          'Quality over quantity',
          'Modify as needed',
          'Focus on proper form'
        ]
      }
    };

    return exerciseDetails[activityName] || {
      description: 'A beneficial exercise for your physical and mental wellness.',
      instructions: [
        'Follow the timer and listen to your body',
        'Move at your own pace',
        'Focus on your breathing',
        'Stop if you feel any discomfort'
      ],
      tips: [
        'Stay hydrated',
        'Practice regularly for best results',
        'Modify as needed for your fitness level'
      ]
    };
  };

  const resetWorkoutProgress = async (workoutId: number) => {
    console.log('🔄 PROGRESSIVE: Resetting progress for workout:', workoutId);
    
    const workout = Object.values(workoutDatabase)
      .flat()
      .find(w => w.id === workoutId);
    
    if (workout && workout.activities) {
      const newCompletedActivities = { ...completedActivities };
      workout.activities.forEach(activity => {
        delete newCompletedActivities[activity.id];
      });
      
      setCompletedActivities(newCompletedActivities);
      setCurrentWorkoutProgress({
        workoutId: null,
        completedCount: 0,
        totalCount: 0
      });
      
      await StorageService.saveCompletedActivities(newCompletedActivities);
    }
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

  // EMERGENCY BYPASS: Inline timer to avoid navigation crashes
  const quickStartWorkout = (difficulty: 'gentle' | 'steady' | 'beast') => {
    console.log('🚨 EMERGENCY BYPASS: Starting inline timer for:', difficulty);
    
    try {
      // Create workout based on difficulty
      const workoutData = {
        'gentle': { name: "Mindful Movement", duration: 5, description: "Gentle stretches and breathing" },
        'steady': { name: "Balanced Flow", duration: 8, description: "Steady-paced movement routine" },
        'beast': { name: "Power Session", duration: 12, description: "High-intensity training" }
      };
      
      const selectedWorkout = workoutData[difficulty];
      console.log('🚨 EMERGENCY BYPASS: Created workout:', selectedWorkout);
      
      // BYPASS NAVIGATION: Show inline timer instead of separate screen
      setSelectedDifficulty(difficulty);
      setInlineWorkout(selectedWorkout);
      setTimeLeft(selectedWorkout.duration * 60);
      setShowInlineTimer(true);
      setIsRunning(false); // Start paused
      
      console.log('🚨 EMERGENCY BYPASS: Inline timer activated - no navigation needed!');
      
    } catch (error) {
      console.error('🚨 EMERGENCY BYPASS ERROR:', error);
      alert(`Error starting ${difficulty} workout. Please try again.`);
    }
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
    console.log('🚨 AUTO-REDIRECT DEBUG: backToDashboard() called - this will navigate to home');
    console.log('🚨 Stack trace:', new Error().stack);
    
    // LEGITIMATE: User explicitly requested to go back to dashboard
    console.log('✅ LEGITIMATE AUTO-REDIRECT: User clicked back to dashboard');
    setActivePage('home');
    setCurrentPageIndex(0);
    setSelectedDifficulty(null);
    if (isWorkoutActive) {
      cancelWorkout();
    }
  };

  const handlePageChange = (page: PageName, index: number) => {
    console.log('🎯 FORCE PAGE CHANGE: Page changed to:', page, 'index:', index);
    console.log('🎯 DOT UPDATE DEBUG: Setting currentPageIndex from', currentPageIndex, 'to', index);
    
    // FORCE STATE UPDATE: Always update both states immediately
    setActivePage(page);
    setCurrentPageIndex(index);
    
    // FORCE RE-RENDER: Log state after update
    setTimeout(() => {
      console.log('🎯 STATE VERIFICATION: currentPageIndex is now', currentPageIndex, 'activePage is', page);
    }, 100);
    
    console.log('✅ SWIPE COMPLETE: Now on page:', page);
    
    // Clear any selected difficulty when switching pages
    if (page !== 'home') {
      setSelectedDifficulty(null);
    }
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

  const showWorkoutVideoDemo = (workout: any) => {
    console.log('🎥 Showing workout video demo for:', workout.name);
    setSelectedVideoWorkout(workout);
    setShowVideoPlayer(true);
  };

  const closeVideoDemo = () => {
    console.log('🎥 Closing video demo');
    setShowVideoPlayer(false);
    setSelectedVideoWorkout(null);
  };

  // EMERGENCY DISABLE: Morning flow function completely disabled to prevent conflicts
  const checkMorningFlowStatus = async () => {
    console.log('🚨 EMERGENCY DISABLE: Morning flow system disabled to prevent onboarding conflicts');
    console.log('🔄 Use OnboardingManager for all onboarding state instead');
    return; // EMERGENCY EARLY RETURN
    
    // DISABLED CODE BELOW - kept for reference
    /*
    try {
      const lastMorningFlowDate = await StorageService.getMorningFlowDate();
      const today = new Date().toDateString();
      
      console.log('🌅 Checking morning flow status:', {
        lastDate: lastMorningFlowDate,
        today: today,
        hasSeenToday: lastMorningFlowDate === today
      });
      
      // DISABLED CODE SECTION
      /*
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
    */
  };

  // EMERGENCY DISABLE: Morning flow completion handlers
  const completeMorningFlow = () => {
    console.log('🚨 EMERGENCY DISABLE: Morning flow system disabled');
    return; // EMERGENCY EARLY RETURN
  };

  const startMorningFlow = () => {
    console.log('🚨 EMERGENCY DISABLE: Morning flow system disabled');
    return; // EMERGENCY EARLY RETURN
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

  // MISSING FUNCTION - ADDED TO FIX CRASHES
  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'gentle': return '🌱';
      case 'steady': return '🚶';
      case 'beast': return '🔥';
      default: return '💪';
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

  // PROGRESSIVE TASK REVELATION: Helper functions
  const getNextActivityIndex = (workoutId: number) => {
    const workout = Object.values(workoutDatabase).flat().find(w => w.id === workoutId);
    if (!workout?.activities) return 0;
    
    for (let i = 0; i < workout.activities.length; i++) {
      if (!completedActivities[workout.activities[i].id]) {
        return i;
      }
    }
    return workout.activities.length; // All completed
  };

  // EMERGENCY INLINE TIMER: NO NAVIGATION - Start activity inline
  const startActivityTimer = (activity: any, workoutId: number) => {
    console.log('🚨 INLINE TIMER: Starting activity inline - NO NAVIGATION');
    console.log('🚨 Activity:', activity.name, 'Duration:', activity.duration);
    
    // Set inline timer state - NO navigation, timer appears inline
    setActiveInlineTimer({
      activityId: activity.id,
      activityName: activity.name,
      workoutId: workoutId,
      duration: activity.duration,
      timeLeft: activity.duration,
      isRunning: true
    });
    
    console.log('🚨 INLINE TIMER: Timer activated inline');
  };



  // STOP INLINE TIMER: Stop current inline timer
  const stopInlineTimer = () => {
    console.log('🚨 INLINE TIMER: Stopping inline timer');
    setActiveInlineTimer(null);
  };

  // PAUSE/RESUME INLINE TIMER
  const toggleInlineTimer = (activityId?: string) => {
    if (activityId) {
      // Toggle specific timer in multiple timers map
      setActiveTimers(prev => {
        const timer = prev[activityId];
        if (!timer) return prev;
        
        return {
          ...prev,
          [activityId]: {
            ...timer,
            isRunning: !timer.isRunning
          }
        };
      });
      
      // Legacy: Also update single timer if it matches
      if (activeInlineTimer?.activityId === activityId) {
        setActiveInlineTimer(prev => {
          if (!prev) return null;
          return {
            ...prev,
            isRunning: !prev.isRunning
          };
        });
      }
    } else {
      // Legacy: Toggle the current active timer
      if (!activeInlineTimer) return;
      
      setActiveInlineTimer(prev => {
        if (!prev) return null;
        return {
          ...prev,
          isRunning: !prev.isRunning
        };
      });
    }
  };

  // 🔥 DIAGNOSTIC TEST STATES
  const [diagnosticTest, setDiagnosticTest] = useState('Ready');
  const [simpleCounter, setSimpleCounter] = useState(5);

  // 🔥 DIAGNOSTIC: Simple test functions
  const testBasicClick = () => {
    console.log('🔥 DIAGNOSTIC: Basic button clicked!');
    setDiagnosticTest('BUTTON WORKS!');
    alert('Basic button clicked successfully!');
  };

  const testSimpleTimer = () => {
    console.log('🔥 DIAGNOSTIC: Starting simple countdown');
    setDiagnosticTest('COUNTING...');
    let count = 5;
    const interval = setInterval(() => {
      count--;
      setSimpleCounter(count);
      console.log('🔥 DIAGNOSTIC: Count:', count);
      if (count <= 0) {
        clearInterval(interval);
        setDiagnosticTest('COUNTDOWN COMPLETE!');
        console.log('🔥 DIAGNOSTIC: Countdown finished');
      }
    }, 1000);
  };

  // 🔥 DIAGNOSTIC: Ultimate simple task list with full testing
  const renderDiagnosticTaskList = (workout: any) => {
    console.log('🔥 DIAGNOSTIC: Rendering task list, workout:', workout);
    
    if (!workout || !workout.activities) {
      console.log('🔥 DIAGNOSTIC: No workout or activities found');
      return (
        <View style={styles.diagnosticCard}>
          <Text style={styles.diagnosticTitle}>🔥 DIAGNOSTIC: No Activities Found</Text>
        </View>
      );
    }

    console.log('🔥 DIAGNOSTIC: Found', workout.activities.length, 'activities');

    return (
      <>
        {/* DIAGNOSTIC TEST CARD */}
        <View style={styles.diagnosticCard}>
          <Text style={styles.diagnosticTitle}>🔥 DIAGNOSTIC TEST PANEL</Text>
          <Text style={styles.diagnosticText}>Status: {diagnosticTest}</Text>
          <Text style={styles.diagnosticText}>Counter: {simpleCounter}</Text>
          
          <View style={styles.diagnosticButtons}>
            <TouchableOpacity 
              style={[styles.diagnosticButton, styles.thriveButtonPrimary]}
              onPress={testBasicClick}
            >
              <Text style={[styles.diagnosticButtonText, styles.thriveButtonPrimaryText]}>Test Click</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.diagnosticButton, styles.thriveButtonSecondary]}
              onPress={testSimpleTimer}
            >
              <Text style={[styles.diagnosticButtonText, styles.thriveButtonSecondaryText]}>Test Timer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ACTUAL TASK CARDS */}
        {workout.activities.map((activity: any, index: number) => {
          const isCompleted = completedActivities[activity.id] || false;
          const isTimerActive = activeInlineTimer?.activityId === activity.id;
          
          console.log('🔥 DIAGNOSTIC: Task', index, ':', activity.name, 'Completed:', isCompleted, 'Timer:', isTimerActive);

          return (
            <View key={activity.id} style={styles.diagnosticTaskCard}>
              <View style={styles.diagnosticTaskLeft}>
                <Text style={styles.diagnosticTaskName}>{activity.name}</Text>
                <Text style={styles.diagnosticTaskDuration}>
                  {Math.floor(activity.duration / 60)}:{(activity.duration % 60).toString().padStart(2, '0')}
                </Text>
              </View>
              
              <View style={styles.diagnosticTaskRight}>
                {!isCompleted && !isTimerActive && (
                  <TouchableOpacity 
                    style={styles.diagnosticStartButton}
                    onPress={() => {
                      console.log('🔥 DIAGNOSTIC: Start button pressed for:', activity.name);
                      console.log('🔥 DIAGNOSTIC: Activity object:', activity);
                      console.log('🔥 DIAGNOSTIC: Workout ID:', workout.id);
                      
                      try {
                        startActivityTimer(activity, workout.id);
                        console.log('🔥 DIAGNOSTIC: startActivityTimer completed without error');
                      } catch (error) {
                        console.error('🔥 DIAGNOSTIC: ERROR in startActivityTimer:', error);
                        alert('ERROR: ' + error.message);
                      }
                    }}
                  >
                    <Text style={styles.diagnosticStartButtonText}>START</Text>
                  </TouchableOpacity>
                )}
                
                {isTimerActive && (
                  <View style={styles.diagnosticTimerDisplay}>
                    <Text style={styles.diagnosticTimerText}>
                      {Math.floor(activeInlineTimer.timeLeft / 60)}:{(activeInlineTimer.timeLeft % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                )}
                
                {isCompleted && (
                  <View style={styles.diagnosticCompleted}>
                    <Text style={styles.diagnosticCompletedText}>✓ DONE</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </>
    );
  };

  // COMPLETE INDIVIDUAL ACTIVITY: Handle activity completion
  const completeIndividualActivity = async (activityId: string, workoutId: number) => {
    console.log('✅ Completing individual activity:', activityId);
    
    // Mark activity as completed
    const newCompletedActivities = {
      ...completedActivities,
      [activityId]: true
    };
    setCompletedActivities(newCompletedActivities);
    await StorageService.saveCompletedActivities(newCompletedActivities);
    
    // Check if all activities in workout are completed
    const workout = Object.values(workoutDatabase).flat().find(w => w.id === workoutId);
    if (workout?.activities) {
      const allCompleted = workout.activities.every(activity => 
        newCompletedActivities[activity.id] || activity.id === activityId
      );
      
      if (allCompleted) {
        console.log('🎉 All activities completed for workout:', workoutId);
        // Complete the entire workout
        if (!completedWorkouts.includes(workoutId)) {
          const updatedCompletedWorkouts = [...completedWorkouts, workoutId];
          setCompletedWorkouts(updatedCompletedWorkouts);
          await StorageService.saveCompletedWorkouts(updatedCompletedWorkouts);
          
          // Show celebration
          setShowCelebration(true);
          setCelebrationData({
            message: 'Workout Complete! 🎉',
            xp: 20,
            type: 'workout_complete'
          });
        }
      }
    }
    
    // Stop current timer
    setIsWorkoutActive(false);
    setCurrentWorkout(null);
    setIsRunning(false);
  };

  // OLD EMERGENCY TIMER - DISABLED (NOW USING INLINE TIMER)
  if (false && isWorkoutActive && currentWorkout) {
    console.log('🚨 EMERGENCY TIMER: Rendering safe timer component');
    console.log('🚨 Current workout data:', currentWorkout);
    console.log('🚨 Time left:', timeLeft);
    
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20 
      }}>
        
        {/* Back Button */}
        <TouchableOpacity 
          style={[{ 
            position: 'absolute',
            top: 50,
            left: 20,
            padding: 15,
            borderRadius: 25
          }, styles.thriveButtonPrimary]}
          onPress={() => {
            console.log('🚨 EMERGENCY TIMER: Going back to home');
            setIsWorkoutActive(false);
            setCurrentWorkout(null);
            setIsRunning(false);
          }}
        >
          <Text style={[{ fontSize: 18, fontWeight: 'bold' }, styles.thriveButtonPrimaryText]}>Back</Text>
        </TouchableOpacity>

        {/* Activity Title */}
        <Text style={[{ 
          marginBottom: 20,
          textAlign: 'center'
        }, styles.thriveHeader]}>
          {currentWorkout?.name || 'Activity Timer'}
        </Text>
        
        {/* Timer Display - Simple Box */}
        <View style={{
          backgroundColor: '#16A34A',
          padding: 40,
          borderRadius: 20,
          marginBottom: 40,
          minWidth: 200,
          alignItems: 'center'
        }}>
          <Text style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: 'white',
            fontFamily: 'monospace'
          }}>
            {(() => {
              const safeTime = timeLeft || 300; // Default 5 minutes
              const mins = Math.floor(safeTime / 60);
              const secs = safeTime % 60;
              return `${mins}:${secs.toString().padStart(2, '0')}`;
            })()}
          </Text>
        </View>
        
        {/* Simple Controls */}
        <View style={{ 
          flexDirection: 'row', 
          gap: 15,
          marginBottom: 30 
        }}>
          <TouchableOpacity 
            style={{
              backgroundColor: '#16A34A',
              paddingHorizontal: 20,
              paddingVertical: 15,
              borderRadius: 10,
              minWidth: 100,
              alignItems: 'center'
            }}
            onPress={() => {
              console.log('🚨 BASIC TIMER: Toggle pause/resume');
              setIsRunning(!isRunning);
            }}
          >
            <Text style={{ 
              color: 'white', 
              fontSize: 16, 
              fontWeight: 'bold'
            }}>
              {isRunning ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              backgroundColor: '#10B981',
              paddingHorizontal: 20,
              paddingVertical: 15,
              borderRadius: 10,
              minWidth: 100,
              alignItems: 'center'
            }}
            onPress={() => {
              console.log('🚨 EMERGENCY TIMER: Activity completed manually');
              if (currentWorkout?.isIndividualActivity) {
                completeIndividualActivity(currentWorkout.id, currentWorkout.workoutId);
              } else {
                setIsWorkoutActive(false);
                setCurrentWorkout(null);
                setIsRunning(false);
              }
            }}
          >
            <Text style={{ 
              color: 'white', 
              fontSize: 16, 
              fontWeight: 'bold'
            }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Simple Status */}
        <Text style={{
          fontSize: 16,
          color: isRunning ? '#10B981' : '#666',
          fontWeight: '600'
        }}>
          {isRunning ? 'Timer Running...' : 'Timer Paused'}
        </Text>
        
      </View>
    );
  }

  // Dashboard components
  const renderMinimalStats = () => (
    <View style={styles.minimalStatsContainer}>
      <View style={styles.streakDisplay}>
        <Text style={styles.streakNumber}>{userStats.streak}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
      </View>
      <View style={styles.progressDisplay}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercent}>{Math.round(getXPProgress())}%</Text>
        </View>
        <Text style={styles.progressLabel}>daily goal</Text>
      </View>
    </View>
  );

  // REDESIGNED: Selection-first approach with default selection
  const [selectedIntensity, setSelectedIntensity] = useState<'gentle' | 'steady' | 'beast'>('steady'); // Default to steady

  const renderFocusedActions = () => {
    const recommended = getRecommendedWorkout();
    
    // 🚨 EMERGENCY BYPASS: Show inline timer instead of difficulty selection if active
    if (showInlineTimer && inlineWorkout) {
      console.log('🚨 EMERGENCY BYPASS: Rendering inline timer component');
      
      return (
        <View style={styles.inlineTimerContainer}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.inlineBackButton}
            onPress={() => {
              console.log('🚨 EMERGENCY BYPASS: Going back to selection');
              setShowInlineTimer(false);
              setInlineWorkout(null);
              setIsRunning(false);
              setTimeLeft(0);
            }}
          >
            <Text style={styles.inlineBackButtonText}>← Back to Selection</Text>
          </TouchableOpacity>

          {/* Workout Header */}
          <View style={styles.inlineWorkoutHeader}>
            <Text style={styles.inlineWorkoutTitle}>{inlineWorkout.name}</Text>
            <Text style={styles.inlineWorkoutDescription}>{inlineWorkout.description}</Text>
            <View style={styles.inlineDifficultyBadge}>
              <Text style={[styles.inlineDifficultyText, { backgroundColor: getDifficultyColor(selectedDifficulty || 'steady') }]}>
                {getDifficultyEmoji(selectedDifficulty || 'steady')} {getDifficultyLabel(selectedDifficulty || 'steady')}
              </Text>
            </View>
          </View>

          {/* Timer Display */}
          <View style={[styles.inlineTimerDisplay, { backgroundColor: getDifficultyColor(selectedDifficulty || 'steady') }]}>
            <Text style={styles.inlineTimerText}>
              {(() => {
                const safeTime = timeLeft || (inlineWorkout.duration * 60);
                const mins = Math.floor(safeTime / 60);
                const secs = safeTime % 60;
                return `${mins}:${secs.toString().padStart(2, '0')}`;
              })()}
            </Text>
            <Text style={styles.inlineTimerStatus}>
              {isRunning ? 'Timer Running...' : 'Timer Paused'}
            </Text>
          </View>

          {/* Timer Controls */}
          <View style={styles.inlineTimerControls}>
            <TouchableOpacity 
              style={[styles.inlineControlButton, styles.inlineStartPauseButton]}
              onPress={() => {
                console.log('🚨 EMERGENCY BYPASS: Toggle start/pause');
                setIsRunning(!isRunning);
              }}
            >
              <Text style={styles.inlineControlButtonText}>
                {isRunning ? '⏸️ Pause' : '▶️ Start'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.inlineControlButton, styles.inlineCompleteButton]}
              onPress={() => {
                console.log('🚨 EMERGENCY BYPASS: Workout completed manually');
                // Mark as complete and show success
                setShowInlineTimer(false);
                setInlineWorkout(null);
                setIsRunning(false);
                setTimeLeft(0);
                
                // Show success alert
                Alert.alert(
                  "Great Job! 🎉",
                  `You completed your ${selectedDifficulty} workout!`,
                  [{ text: "Continue", style: "default" }]
                );
              }}
            >
              <Text style={styles.inlineControlButtonText}>
                ✅ Complete
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Info */}
          <View style={styles.inlineProgressInfo}>
            <Text style={styles.inlineProgressText}>
              Original Duration: {inlineWorkout.duration} minutes
            </Text>
            <Text style={styles.inlineProgressSubtext}>
              Take your time - you're doing great! 💪
            </Text>
          </View>
        </View>
      );
    }

    // 🎯 DEFAULT: Show normal difficulty selection if inline timer not active
    return (
      <View style={styles.redesignedWorkoutSelection}>
        {/* HEADER: Pick Your Level */}
        <View style={styles.selectionHeaderContainer}>
          <Text style={styles.selectionHeaderTitle}>Pick Your Level</Text>
          <Text style={styles.selectionHeaderSubtitle}>Choose the intensity that feels right for you today</Text>
        </View>

        {/* DIFFICULTY SELECTION: Top priority placement */}
        <View style={styles.difficultySelectionRow}>
          <TouchableOpacity 
            style={[
              styles.difficultyCard, 
              { backgroundColor: theme.colors.gentle },
              selectedIntensity === 'gentle' && styles.difficultyCardSelected
            ]}
            onPress={() => {
              console.log('🎯 REDESIGNED: Gentle difficulty selected');
              setSelectedIntensity('gentle');
            }}
          >
            <Text style={styles.difficultyEmoji}>🌱</Text>
            <Text style={styles.difficultyLabel}>Gentle</Text>
            <Text style={styles.difficultyDescription}>Easy & mindful</Text>
            {selectedIntensity === 'gentle' && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedCheckmark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.difficultyCard, 
              { backgroundColor: theme.colors.steady },
              selectedIntensity === 'steady' && styles.difficultyCardSelected
            ]}
            onPress={() => {
              console.log('🎯 REDESIGNED: Steady difficulty selected');
              setSelectedIntensity('steady');
            }}
          >
            <Text style={styles.difficultyEmoji}>🚶</Text>
            <Text style={styles.difficultyLabel}>Steady</Text>
            <Text style={styles.difficultyDescription}>Balanced flow</Text>
            {selectedIntensity === 'steady' && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedCheckmark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.difficultyCard, 
              { backgroundColor: theme.colors.beast },
              selectedIntensity === 'beast' && styles.difficultyCardSelected
            ]}
            onPress={() => {
              console.log('🎯 REDESIGNED: Intense difficulty selected');
              setSelectedIntensity('beast');
            }}
          >
            <Text style={styles.difficultyEmoji}>🔥</Text>
            <Text style={styles.difficultyLabel}>Intense</Text>
            <Text style={styles.difficultyDescription}>High energy</Text>
            {selectedIntensity === 'beast' && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedCheckmark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* START SECTION: Bottom placement with selection info */}
        <View style={styles.startWorkoutSection}>
          <View style={styles.readyToThriveContainer}>
            <Text style={styles.readyToThriveTitle}>Ready to THRIVE?</Text>
            <Text style={styles.readyToThriveSubtitle}>
              {selectedIntensity === 'gentle' && "Gentle movement perfect for mindful energy"}
              {selectedIntensity === 'steady' && "Steady pace for balanced focus and strength"}
              {selectedIntensity === 'beast' && "High-intensity training to unleash your power"}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.redesignedStartButton,
              { backgroundColor: getDifficultyColor(selectedIntensity) }
            ]}
            onPress={() => {
              console.log('🚨 DEBUG: START BUTTON CLICKED!');
              console.log('🚨 DEBUG: Selected intensity:', selectedIntensity);
              try {
                console.log('🚨 DEBUG: About to call quickStartWorkout...');
                quickStartWorkout(selectedIntensity);
                console.log('🚨 DEBUG: quickStartWorkout completed successfully');
              } catch (error) {
                console.error('🚨 CRASH: Start button error:', error);
                console.error('🚨 CRASH: Stack trace:', error.stack);
              }
            }}
            activeOpacity={0.85} // Smooth press feedback for premium feel
            onPressIn={() => {
              console.log('🎨 ANIMATION: Main start button pressed - premium feedback');
            }}
            onPressOut={() => {
              console.log('🎨 ANIMATION: Main start button released');
            }}
          >
            <Text style={styles.redesignedStartButtonText}>
              START {selectedIntensity.toUpperCase()}
            </Text>
            <Text style={styles.redesignedStartArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMinimalFeed = () => (
    <View style={styles.minimalFeedContainer}>
      {/* Motivational Message */}
      <View style={styles.inspirationCard}>
        <Text style={styles.inspirationText}>{getMotivationalMessage()}</Text>
      </View>

      {/* Quick Access */}
      <View style={styles.quickAccessCard}>
        <TouchableOpacity 
          style={styles.quickAccessButton}
          onPress={quickMoodCheckin}
        >
          <Text style={styles.quickAccessIcon}>😊</Text>
          <Text style={styles.quickAccessText}>How are you feeling?</Text>
        </TouchableOpacity>
      </View>

      {/* DISABLED: Morning Flow Status (EMERGENCY DISABLE) */}
      {/* Morning flow completely disabled to prevent onboarding conflicts */}
      {false && (
        <View style={styles.completionCard}>
          <Text style={styles.completionEmoji}>✨</Text>
          <Text style={styles.completionText}>Morning intention set</Text>
        </View>
      )}
    </View>
  );

  // ANIMATE CONTENT TRANSITIONS
  useEffect(() => {
    if (selectedDifficulty !== prevSelectedDifficulty) {
      // Fade out current content
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Update previous state
        setPrevSelectedDifficulty(selectedDifficulty);
        
        // Fade in new content
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [selectedDifficulty, prevSelectedDifficulty, contentOpacity]);

  // DYNAMIC CONTENT SWITCHING: Stats ↔ Workout Tasks
  const renderDynamicContent = () => {
    return (
      <Animated.View 
        style={[
          styles.dynamicContentContainer,
          { opacity: contentOpacity }
        ]}
      >
        {selectedDifficulty ? (
          renderWorkoutTasksContent()
        ) : (
          renderMotivationalStatsContent()
        )}
      </Animated.View>
    );
  };

  // MOTIVATIONAL STATS: Default browsing state
  const renderMotivationalStatsContent = () => {
    const currentLevel = Math.floor(userStats.xp / 100) + 1;
    const progressToNextLevel = userStats.xp % 100;
    const weeklyGoal = 5; // 5 workouts per week
    const weeklyProgress = Math.min(userStats.totalWorkouts % 7, weeklyGoal);
    const monthlyWorkouts = userStats.totalWorkouts % 30;
    
    // Journey-specific messaging
    const journeyMessage = selectedJourney === 'new' 
      ? "Building your foundation step by step 🌱" 
      : selectedJourney === 'potential'
      ? "Unlocking your maximum potential ✨"
      : "Select your journey above to personalize your experience";
    
    return (
      <Animated.View style={[styles.motivationalContainer]}>
        {/* Current Stats Overview */}
        <View style={styles.statsOverviewSection}>
          <Text style={styles.statsOverviewTitle}>Your THRIVE Journey</Text>
          
          {/* Main Stats Grid */}
          <View style={styles.statsGrid}>
            {/* Streak Card */}
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statNumber}>{userStats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
              {userStats.streak > 0 && (
                <Text style={styles.statSubtext}>Keep it going!</Text>
              )}
            </View>
            
            {/* XP & Level Card */}
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>💎</Text>
              <Text style={styles.statNumber}>{userStats.xp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
              <Text style={styles.statSubtext}>Level {currentLevel}</Text>
            </View>
            
            {/* Total Workouts Card */}
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>💪</Text>
              <Text style={styles.statNumber}>{userStats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
              <Text style={styles.statSubtext}>Total completed</Text>
            </View>
          </View>
        </View>
        
        {/* Progress & Goals Section */}
        <View style={styles.progressSection}>
          {/* Level Progress */}
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>⭐ Level {currentLevel} Progress</Text>
              <Text style={styles.progressValue}>{progressToNextLevel}/100 XP</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${progressToNextLevel}%` }
                ]} 
              />
            </View>
          </View>
          
          {/* Weekly Goal Progress */}
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>🏆 Weekly Goal</Text>
              <Text style={styles.progressValue}>{weeklyProgress}/{weeklyGoal} workouts</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${(weeklyProgress / weeklyGoal) * 100}%` }
                ]} 
              />
            </View>
            {weeklyProgress < weeklyGoal && (
              <Text style={styles.goalMotivation}>
                {weeklyGoal - weeklyProgress} more to reach your weekly goal!
              </Text>
            )}
          </View>
        </View>
        
        {/* Achievements & Badges */}
        <View style={styles.achievementsSection}>
          <Text style={styles.achievementsTitle}>Recent Achievements</Text>
          <View style={styles.badgesContainer}>
            {userStats.streak >= 7 && (
              <View style={styles.badge}>
                <Text style={styles.badgeEmoji}>⭐</Text>
                <Text style={styles.badgeText}>Week Warrior</Text>
              </View>
            )}
            {userStats.totalWorkouts >= 10 && (
              <View style={styles.badge}>
                <Text style={styles.badgeEmoji}>💪</Text>
                <Text style={styles.badgeText}>10 Workouts</Text>
              </View>
            )}
            {userStats.xp >= 250 && (
              <View style={styles.badge}>
                <Text style={styles.badgeEmoji}>💎</Text>
                <Text style={styles.badgeText}>XP Master</Text>
              </View>
            )}
            {/* Special first-time user badges */}
            {userStats.totalWorkouts === 0 && (
              <>
                <View style={styles.badge}>
                  <Text style={styles.badgeEmoji}>🌱</Text>
                  <Text style={styles.badgeText}>New Journey</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeEmoji}>✨</Text>
                  <Text style={styles.badgeText}>Full Potential</Text>
                </View>
              </>
            )}
            {/* Milestone badges for beginners */}
            {userStats.totalWorkouts === 1 && (
              <View style={styles.badge}>
                <Text style={styles.badgeEmoji}>🎉</Text>
                <Text style={styles.badgeText}>First Step!</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Journey Status & Call to Action */}
        <View style={styles.journeyStatusContainer}>
          <Text style={styles.journeyStatusText}>{journeyMessage}</Text>
        </View>
        
        <View style={styles.motivationalCTA}>
          {userStats.totalWorkouts === 0 ? (
            <>
              <Text style={styles.ctaTitle}>Welcome to THRIVE! 🚀</Text>
              <Text style={styles.ctaSubtitle}>
                {selectedJourney ? "Now select your intensity level to begin!" : "Choose your journey and intensity above to start!"}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.ctaTitle}>Ready to THRIVE? 💚</Text>
              <Text style={styles.ctaSubtitle}>
                {selectedJourney && selectedDifficulty ? "Perfect! Your personalized workout awaits below." : "Complete your selections above to continue!"}
              </Text>
            </>
          )}
        </View>
      </Animated.View>
    );
  };
  
  // WORKOUT TASKS: Selected difficulty state with journey modifications
  const renderWorkoutTasksContent = () => {
    return (
      <Animated.View style={[styles.workoutTasksContainer]}>
        {/* Journey Enhancement Message */}
        {selectedJourney && (
          <View style={styles.journeyEnhancementBanner}>
            <Text style={styles.journeyEnhancementText}>
              {selectedJourney === 'new' 
                ? "🌱 Tasks adapted for foundational learning and steady progress"
                : "✨ Tasks enhanced for maximum challenge and growth acceleration"
              }
            </Text>
          </View>
        )}
        {renderFreshWorkoutList()}
      </Animated.View>
    );
  };

  // NUCLEAR REBUILD: FRESH HOME PAGE FROM SCRATCH
  const renderDashboard = () => (
    <View style={styles.nuclearFreshPage}>
      {/* STEP 1: PAGE HEADER */}
      <View style={styles.freshPageHeader}>
        <Text style={styles.freshPageTitle}>Let's THRIVE Together!</Text>
        <Text style={styles.freshPageSubtitle}>Customize your workout experience</Text>
      </View>
      
      {/* STEP 2: JOURNEY/POTENTIAL SELECTOR (Above Difficulty) */}
      <View style={styles.freshJourneySection}>
        <Text style={styles.freshSectionTitle}>Choose Your Journey</Text>
        <Text style={styles.freshSectionSubtitle}>Select your mindset and approach for today's session</Text>
        
        <View style={styles.freshJourneyRow}>
          <TouchableOpacity 
            style={[styles.freshJourneyButton, selectedJourney === 'new' && styles.freshJourneyButtonSelected]}
            onPress={() => setSelectedJourney('new')}
          >
            <Text style={styles.freshJourneyEmoji}>🌱</Text>
            <Text style={styles.freshJourneyText}>New Journey</Text>
            <Text style={styles.freshJourneySubtext}>Building foundations</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.freshJourneyButton, selectedJourney === 'potential' && styles.freshJourneyButtonSelected]}
            onPress={() => setSelectedJourney('potential')}
          >
            <Text style={styles.freshJourneyEmoji}>✨</Text>
            <Text style={styles.freshJourneyText}>Full Potential</Text>
            <Text style={styles.freshJourneySubtext}>Maximizing growth</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* STEP 3: DIFFICULTY SELECTOR */}
      <View style={styles.freshDifficultySection}>
        <Text style={styles.freshSectionTitle}>Pick Your Intensity</Text>
        <Text style={styles.freshSectionSubtitle}>Choose the physical intensity that feels right for you today</Text>
        
        <View style={styles.freshDifficultyRow}>
          <TouchableOpacity 
            style={[styles.freshDifficultyButton, selectedDifficulty === 'gentle' && styles.freshDifficultyButtonSelected]}
            onPress={() => setSelectedDifficulty(selectedDifficulty === 'gentle' ? null : 'gentle')}
          >
            <Text style={styles.freshDifficultyText}>🌱 Gentle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.freshDifficultyButton, selectedDifficulty === 'steady' && styles.freshDifficultyButtonSelected]}
            onPress={() => setSelectedDifficulty(selectedDifficulty === 'steady' ? null : 'steady')}
          >
            <Text style={styles.freshDifficultyText}>⚡ Steady</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.freshDifficultyButton, selectedDifficulty === 'beast' && styles.freshDifficultyButtonSelected]}
            onPress={() => setSelectedDifficulty(selectedDifficulty === 'beast' ? null : 'beast')}
          >
            <Text style={styles.freshDifficultyText}>🔥 Beast</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* STEP 3: DYNAMIC CONTENT SWITCHING */}
      {renderDynamicContent()}
    </View>
  );

  // HELPER: Count completed activities for progressive revelation
  const getCompletedActivitiesCount = (workout: any) => {
    if (!workout || !workout.activities) return 0;
    return workout.activities.filter((activity: any) => {
      const activityKey = `${workout.id}-${activity.id}`;
      return completedActivities[activityKey];
    }).length;
  };

  // FRESH WORKOUT LIST - NO LEGACY CONSTRAINTS
  const renderFreshWorkoutList = () => {
    if (!selectedDifficulty) return null;

    const workouts = workoutDatabase[selectedDifficulty];
    if (!workouts || workouts.length === 0) return null;

    return (
      <View style={styles.freshWorkoutSection}>
        <Text style={styles.freshSectionTitle}>{selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Workouts:</Text>
        <Text style={styles.freshWorkoutSubtitle}>Click the selected difficulty above to return to stats</Text>

        {workouts.map((workout) => (
          <View key={workout.id} style={styles.freshWorkoutCard}>
            <View style={styles.freshWorkoutHeader}>
              <Text style={styles.freshWorkoutTitle}>{workout.name}</Text>
              <Text style={styles.freshWorkoutDuration}>{workout.duration} minutes</Text>
            </View>
            
            <Text style={styles.freshWorkoutDescription}>{workout.description}</Text>
            
            {/* FRESH PROGRESSIVE TASK SYSTEM */}
            {workout.activities && (
              <View style={styles.freshActivitiesList}>
                <Text style={styles.freshActivitiesTitle}>
                  Flexible Workout ({getCompletedActivitiesCount(workout)} / {workout.activities.length} activities completed)
                </Text>
                
                {getCompletedActivitiesCount(workout) === 0 && (
                  <View style={styles.freshProgressMessage}>
                    <Text style={styles.freshProgressText}>
                      🎯 Complete activities in any order you prefer. All exercises are available from the start!
                    </Text>
                  </View>
                )}
                
                {/* COMPLETED TASKS SECTION - Compact at top */}
                {workout.activities.filter((_, index) => {
                  const activityKey = `${workout.id}-${workout.activities[index].id}`;
                  return completedActivities[activityKey];
                }).length > 0 && (
                  <View style={styles.freshCompletedSection}>
                    <Text style={styles.freshCompletedSectionTitle}>
                      Completed Activities ({getCompletedActivitiesCount(workout)})
                    </Text>
                  </View>
                )}

                {workout.activities.map((activity, index) => {
                  const activityKey = `${workout.id}-${activity.id}`;
                  const isCompleted = completedActivities[activityKey];
                  const isActive = activeTimers[activity.id] || activeInlineTimer?.activityId === activity.id;
                  
                  // FLEXIBLE TASK SYSTEM: Show all tasks, allow any order completion
                  const completedCount = getCompletedActivitiesCount(workout);
                  
                  // Prepare active timer data for CollapsibleTaskCard
                  const currentTimer = activeTimers[activity.id] || (activeInlineTimer?.activityId === activity.id ? activeInlineTimer : null);
                  const activeTimerData = currentTimer ? {
                    timeLeft: currentTimer.timeLeft,
                    isRunning: currentTimer.isRunning // Use actual running state
                  } : null;
                  
                  return (
                    <CollapsibleTaskCard
                      key={activity.id}
                      activity={activity}
                      workoutId={workout.id}
                      index={index}
                      isCompleted={isCompleted}
                      isActive={isActive}
                      onStartActivity={startInlineActivity}
                      onShowDetails={showExerciseDetails}
                      onShowDemo={showVideoDemo}
                      onPauseResumeTimer={toggleInlineTimer}
                      onStopTimer={stopInlineActivity}
                      onCompleteActivity={completeInlineActivity}
                      activeTimer={activeTimerData}
                    />
                  );
                })}

                {/* WORKOUT COMPLETION CELEBRATION */}
                {getCompletedActivitiesCount(workout) === workout.activities.length && (
                  <View style={styles.freshWorkoutComplete}>
                    <Text style={styles.freshCelebrationTitle}>🎉 Workout Complete!</Text>
                    <Text style={styles.freshCelebrationText}>
                      Amazing work! You've completed all {workout.activities.length} activities.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

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
        <View>
  
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>No workouts available</Text>
          </View>
        </View>
      );
    }

    return (
      <View>

        
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

                {/* MOBILE-OPTIMIZED ACTIVITY LIST */}
                {workout.activities && (
                  <View style={styles.activitiesContainer}>
                    <Text style={styles.activitiesTitle}>Activities:</Text>
                    {workout.activities.map((activity, index) => {
                      const activityKey = `${workout.id}-${activity.id}`;
                      const isCompleted = completedActivities[activityKey];
                      const isActive = activeTimers[activity.id] || activeInlineTimer?.activityId === activity.id;
                      const currentTimer = activeTimers[activity.id] || (activeInlineTimer?.activityId === activity.id ? activeInlineTimer : null);
                      
                      return (
                        <View key={activity.id} style={styles.mobileActivityRow}>
                          {/* Activity Info - Takes most space but prevents overflow */}
                          <View style={styles.mobileActivityInfo}>
                            <Text style={styles.mobileActivityText} numberOfLines={2}>
                              • {activity.name}
                            </Text>
                            
                            {/* DYNAMIC TIMER DISPLAY - Shows time left when timer active */}
                            {isActive && currentTimer ? (
                              <View style={styles.timerDisplay}>
                                <Text style={[
                                  styles.timerDisplayText,
                                  currentTimer.isRunning ? styles.timerDisplayRunning : styles.timerDisplayPaused
                                ]}>
                                  ⏱️ {Math.floor(currentTimer.timeLeft / 60)}:{(currentTimer.timeLeft % 60).toString().padStart(2, '0')} 
                                  {currentTimer.isRunning ? ' (running)' : ' (paused)'}
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.mobileActivityDuration}>
                                {Math.floor(activity.duration / 60)}:{(activity.duration % 60).toString().padStart(2, '0')}
                              </Text>
                            )}
                          </View>
                          
                          {/* DYNAMIC TIMER BUTTON LAYOUT - Adapts based on timer state */}
                          {!isActive && !isCompleted ? (
                            // NO TIMER: Show single START button
                            <TouchableOpacity 
                              style={[styles.mobileActivityButton, styles.mobileActivityButtonDefault]}
                              onPress={() => startInlineActivity(activity, workout.id)}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.mobileActivityButtonText]}>
                                ▶️ START
                              </Text>
                            </TouchableOpacity>
                          ) : isCompleted ? (
                            // COMPLETED: Show DONE button
                            <TouchableOpacity 
                              style={[styles.mobileActivityButton, styles.mobileActivityButtonDisabled]}
                              disabled={true}
                            >
                              <Text style={[styles.mobileActivityButtonText, styles.mobileActivityButtonTextDisabled]}>
                                ✅ DONE
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            // TIMER ACTIVE: Show dual buttons (Pause/Resume + Stop)
                            <View style={styles.mobileTimerButtonGroup}>
                              <TouchableOpacity 
                                style={[
                                  styles.mobileTimerButton,
                                  activeTimers[activity.id]?.isRunning ? styles.mobileActivityButtonRunning : styles.mobileActivityButtonPaused
                                ]}
                                onPress={() => toggleInlineTimer(activity.id)}
                                activeOpacity={0.7}
                              >
                                <Text style={[styles.mobileTimerButtonText]}>
                                  {currentTimer?.isRunning ? '⏸️' : '▶️'}
                                </Text>
                              </TouchableOpacity>
                              
                              <TouchableOpacity 
                                style={[styles.mobileTimerButton, styles.mobileStopButton]}
                                onPress={() => stopInlineActivity(activity.id)}
                                activeOpacity={0.7}
                              >
                                <Text style={[styles.mobileTimerButtonText]}>
                                  ⏹️
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              
            </View>
            
            {/* MOBILE-OPTIMIZED BUTTON LAYOUT - Max 3 primary actions */}
            <View style={styles.mobileWorkoutActions}>
              {/* PRIMARY ACTION: Start/Restart Button */}
              <TouchableOpacity 
                style={[
                  styles.mobilePrimaryButton,
                  styles.mobileStartButton,
                  { backgroundColor: getDifficultyColor(selectedDifficulty) }
                ]}
                onPress={() => startWorkout(workout)}
                activeOpacity={0.7}
              >
                <Text style={styles.mobilePrimaryButtonText}>
                  {completedWorkouts.includes(workout.id) ? '↻ Restart' : '▶ Start'}
                </Text>
              </TouchableOpacity>

              {/* SECONDARY ACTION: Demo Button */}
              <TouchableOpacity 
                style={[styles.mobilePrimaryButton, styles.mobileSecondaryButton]}
                onPress={() => showVideoDemo(workout)}
                activeOpacity={0.7}
              >
                <Text style={[styles.mobilePrimaryButtonText, styles.mobileSecondaryButtonText]}>
                  📺 Demo
                </Text>
              </TouchableOpacity>

              {/* MORE ACTIONS: Future expandability */}
              <TouchableOpacity 
                style={[styles.mobilePrimaryButton, styles.mobileMoreButton]}
                onPress={() => {
                  // Future: Show more options like Details, Settings, etc.
                  console.log('More options for workout:', workout.id);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.mobilePrimaryButtonText, styles.mobileMoreButtonText]}>
                  ⋯ More
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
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, styles.thriveMainBackground]}>
      {/* Clean Header with Hamburger Menu */}
      <View style={styles.cleanHeader}>
        <HamburgerMenu
          onMorningFlow={() => console.log('🚨 EMERGENCY DISABLE: Morning flow disabled')} // EMERGENCY DISABLE
          onMoodCheckin={quickMoodCheckin}
          onSettings={() => setShowSettings(true)}
          onDemo={startDemoMode}
          userStats={userStats}
        />
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, styles.thriveHero]}>
            <Text style={[styles.highlight, styles.thrivePrimaryColor]}>THRIVE</Text>
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Swipe Navigation with Main Content */}
        <SwipeNavigation
          pageNames={['home', 'community', 'stats']}
          currentPage={currentPageIndex}
          onPageChange={handlePageChange}
        >
          {/* Home Page - ScrollView now handled by SwipeNavigation */}
          <View style={styles.pageContainer}>
            {renderDashboard()}
          </View>
          
          {/* Community Page */}
          <View style={styles.pageContainer}>
            <View style={styles.pageTitleContainer}>
              <Text style={[styles.pageTitle, styles.thriveHeader]}>Community</Text>
              <Text style={[styles.pageSubtitle, styles.thriveBody]}>Connect with fellow THRIVE members</Text>
            </View>
            <CommunityFeed userStats={userStats} />
          </View>
          
          {/* Stats Page */}
          <View style={styles.pageContainer}>
            <View style={styles.pageTitleContainer}>
              <Text style={[styles.pageTitle, styles.thriveHeader]}>Your Progress</Text>
              <Text style={[styles.pageSubtitle, styles.thriveBody]}>Track your THRIVE journey</Text>
            </View>
            <StatsTab userStats={userStats} />
          </View>
        </SwipeNavigation>

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
              style={[styles.celebrationButton, styles.thriveButtonPrimary]}
              onPress={hideCelebration}
            >
              <Text style={[styles.celebrationButtonText, styles.thriveButtonPrimaryText]}>Continue Progress</Text>
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

      {/* DISABLED: Morning Flow Modal (EMERGENCY DISABLE) */}
      {/* <MorningFlow
        visible={showMorningFlow}
        onComplete={completeMorningFlow}
        userStats={userStats}
      /> */}

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Video Demo Placeholder Modal */}
      <Modal
        visible={showVideoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVideoModal(false)}
      >
        <View style={styles.videoModalOverlay}>
          <View style={styles.videoModalContent}>
            <View style={styles.videoModalHeader}>
              <Text style={styles.videoModalTitle}>🎥 Exercise Demonstration</Text>
              <TouchableOpacity 
                style={styles.videoModalCloseButton}
                onPress={() => setShowVideoModal(false)}
              >
                <Text style={styles.videoModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.videoPlaceholderContainer}>
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoPlaceholderIcon}>🎬</Text>
                <Text style={styles.videoPlaceholderTitle}>Video Coming Soon!</Text>
                <Text style={styles.videoPlaceholderText}>
                  Exercise demonstration for "{currentVideoActivity}" will be available in a future update.
                </Text>
              </View>
            </View>
            
            <View style={styles.videoModalFooter}>
              <TouchableOpacity 
                style={styles.videoModalOkButton}
                onPress={() => setShowVideoModal(false)}
              >
                <Text style={styles.videoModalOkText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Exercise Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.detailsModalOverlay}>
          <View style={styles.detailsModalContent}>
            <View style={styles.detailsModalHeader}>
              <Text style={styles.detailsModalTitle}>
                📋 {currentDetailActivity?.name || 'Exercise Details'}
              </Text>
              <TouchableOpacity 
                style={styles.detailsModalCloseButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={styles.detailsModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.detailsModalScroll}>
              {currentDetailActivity && (
                <>
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Description</Text>
                    <Text style={styles.detailsDescription}>
                      {getExerciseDetails(currentDetailActivity.name).description}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Instructions</Text>
                    {getExerciseDetails(currentDetailActivity.name).instructions.map((instruction, index) => (
                      <View key={index} style={styles.instructionItem}>
                        <Text style={styles.instructionNumber}>{index + 1}.</Text>
                        <Text style={styles.instructionText}>{instruction}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Tips for Success</Text>
                    {getExerciseDetails(currentDetailActivity.name).tips.map((tip, index) => (
                      <View key={index} style={styles.tipItem}>
                        <Text style={styles.tipBullet}>💡</Text>
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsSectionTitle}>Duration</Text>
                    <Text style={styles.detailsDuration}>
                      {Math.floor(currentDetailActivity.duration / 60)}:{(currentDetailActivity.duration % 60).toString().padStart(2, '0')} minutes
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
            
            <View style={styles.detailsModalFooter}>
              <TouchableOpacity 
                style={styles.detailsModalStartButton}
                onPress={() => {
                  setShowDetailsModal(false);
                  if (currentDetailActivity) {
                    // Find the workout this activity belongs to
                    const workout = Object.values(workoutDatabase)
                      .flat()
                      .find(w => w.activities.some(a => a.id === currentDetailActivity.id));
                    if (workout) {
                      startInlineActivity(currentDetailActivity, workout.id);
                    }
                  }
                }}
              >
                <Text style={styles.detailsModalStartText}>▶️ Start This Exercise</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.detailsModalCloseButtonBottom}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={styles.detailsModalCloseTextBottom}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MASTER ONBOARDING FLOW - SINGLE SOURCE OF TRUTH */}
      <WebOnboarding
        visible={onboardingState?.showOnboarding || false}
        onComplete={handleOnboardingComplete}
      />
      
      {/* DEMO MODE ONBOARDING - NON-DESTRUCTIVE TUTORIAL */}
      <WebOnboarding
        visible={showDemoOnboarding}
        onComplete={handleDemoComplete}
        demoMode={true}
        onExit={exitDemoMode}
      />
      
      {/* Debug banner removed - clean UI */}

    </SafeAreaView>
  );
}

// Dynamic styles function that uses theme colors
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    // Theme-specific enhancements
    ...(theme.isDark ? {
      // Subtle gradient for dark theme
      background: `linear-gradient(180deg, ${theme.colors.background} 0%, rgba(10, 10, 10, 0.98) 100%)`,
    } : {
      // Clean, crisp white for light theme
      backgroundColor: '#FFFFFF',
    }),
  },
  content: {
    padding: 20,
    paddingBottom: 20, // No need for bottom tab space
  },
  
  // Page styles for swipe navigation
  pageContainer: {
    flex: 1,
    width: '100%',
    // Better background for dark theme
    backgroundColor: theme.colors.background,
  },
  pageContent: {
    paddingVertical: 20, // Only top and bottom padding
    paddingHorizontal: 4, // MINIMAL horizontal padding for full width
    paddingBottom: 100, // Space for page indicators
    minHeight: '100%',
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
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.2,
    // Theme-specific text effects
    ...(theme.isDark ? {
      textShadowColor: 'rgba(0, 230, 118, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    } : {
      // Clean, crisp text for light theme
      textShadowColor: 'transparent',
    }),
  },
  emergencySubtitle: {
    fontSize: 15, // Slightly larger
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16, // More space
    fontWeight: '400',
    opacity: theme.isDark ? 0.9 : 0.8, // Better contrast for dark theme
    lineHeight: 20,
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
    backgroundColor: theme.isDark ? theme.colors.surface : '#F0FDF4',
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: theme.isDark ? 2 : 1, // Thicker border for dark, subtle for light
    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : theme.colors.border,
    width: '100%',
    alignSelf: 'stretch',
    // Premium shadow system for both themes
    ...(theme.isDark ? {
      // Dark theme shadows
      shadowColor: 'rgba(0, 230, 118, 0.2)',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    } : {
      // Light theme crisp shadows
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, // Subtle but visible
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  completedWorkoutCard: {
    backgroundColor: theme.isDark 
      ? 'rgba(0, 230, 118, 0.08)' // Subtle green background for dark mode
      : '#E8F5E8', // Light green background for light mode
    borderColor: theme.colors.success,
    borderWidth: 3,
    // Theme-appropriate effects
    ...(theme.isDark ? {
      // Dark theme glow effect
      shadowColor: theme.colors.success,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    } : {
      // Light theme enhanced shadow
      shadowColor: '#4CAF50',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 5,
    }),
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
    fontSize: 18, // Larger for better hierarchy
    fontWeight: '700', // Bolder
    color: theme.colors.text,
    flex: 1,
    letterSpacing: 0.1, // Subtle spacing
    lineHeight: 22, // Better line height
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

  // FULL SCREEN WIDTH ACTIVITIES CONTAINER
  activitiesContainer: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 0, // ZERO horizontal padding
    marginHorizontal: 0, // ZERO margins for full width
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    width: '100%', // Force 100% width
    minWidth: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    borderColor: '#E3F2FD',
  },
  
  // COMPACT HEADER SECTION
  activitiesHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  activitiesHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A237E',
    letterSpacing: 0.3,
  },
  progressBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // MAXIMUM WIDTH CARDS CONTAINER - ZERO PADDING
  activityCardsContainer: {
    gap: 12,
    paddingHorizontal: 0, // ZERO horizontal padding for full width
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,255,0,0.1)', // TEMPORARY DEBUG: Green container
  },
  
  // PROPER HORIZONTAL WIDE TASK CARD
  vibrantActivityCard: {
    borderRadius: 12,
    paddingVertical: 16, // Moderate vertical padding
    paddingHorizontal: 24, // Good horizontal padding
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 70, // Fixed reasonable height
    maxHeight: 90, // Prevent vertical expansion
    position: 'relative',
    overflow: 'hidden',
    width: '100%', // Full width
    alignSelf: 'stretch',
    marginHorizontal: 0,
    // REMOVE flexDirection from card - let cardContent handle layout
  },
  
  // COMPACT COMPLETION OVERLAY
  completionOverlay: {
    position: 'absolute',
    top: 4,
    right: 6,
    zIndex: 10,
  },
  completionEmoji: {
    fontSize: 16,
  },
  
  // SIMPLE HORIZONTAL LAYOUT: Checkbox | Name | Duration | Button
  cardContent: {
    flexDirection: 'row', // Horizontal layout
    alignItems: 'center', // Center everything vertically
    gap: 12, // Space between elements
    width: '100%', // Full width
  },
  
  // PROFESSIONAL CHECKBOX FOR HORIZONTAL LAYOUT
  vibrantCheckbox: {
    width: 24, // Smaller for horizontal layout
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12, // Good spacing in horizontal layout
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  checkboxCenter: {
    width: 8, // Smaller for horizontal layout
    height: 8,
    borderRadius: 4,
  },
  largeCheckmark: {
    color: '#FFFFFF',
    fontSize: 16, // EMERGENCY: Reduced from 18 to 16
    fontWeight: '800',
  },

  // EMERGENCY INLINE TIMER STYLES - NO NAVIGATION
  inlineTimerCard: {
    backgroundColor: '#16A34A',
    borderColor: '#15803D',
    minHeight: 120,
    padding: 16,
  },
  inlineTimerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  inlineTimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  inlineTimerDisplay: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  inlineTimerTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  inlineTimerControls: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineTimerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  stopButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  inlineTimerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

  // NEW CLEAN TASK SYSTEM STYLES - REBUILT FROM SCRATCH
  newTaskContainer: {
    gap: 12,
    paddingHorizontal: 8, // Minimal padding for maximum width
    marginTop: 16,
  },

  newTaskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#E0E0E0',
    borderTopColor: '#E0E0E0',
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    alignSelf: 'stretch',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  newTaskLeft: {
    flex: 1,
    paddingRight: 16,
  },

  newTaskName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 24,
  },

  newTaskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  newTaskDuration: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  newTaskButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },

  newTaskButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  newTaskTimer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },

  newTaskTimerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'monospace',
  },

  newTaskCompleted: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },

  newTaskCompletedText: {
    fontWeight: '600',
    fontSize: 16,
  },

  // 🔥 DIAGNOSTIC STYLES - FULL TESTING SYSTEM
  diagnosticCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF9800',
  },

  diagnosticTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 8,
  },

  diagnosticText: {
    fontSize: 14,
    color: '#BF360C',
    marginBottom: 4,
  },

  diagnosticButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },

  diagnosticButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
  },

  diagnosticButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
  },

  diagnosticTaskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  diagnosticTaskLeft: {
    flex: 1,
  },

  diagnosticTaskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  diagnosticTaskDuration: {
    fontSize: 14,
    color: '#666666',
  },

  diagnosticTaskRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  diagnosticStartButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  diagnosticStartButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

  diagnosticTimerDisplay: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  diagnosticTimerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'monospace',
  },

  diagnosticCompleted: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  diagnosticCompletedText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
  },

  // ULTRA-SIMPLE TASK STYLES - BASIC TEXT ONLY
  simpleTaskContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 10,
    borderRadius: 8,
  },

  simpleTaskItem: {
    marginBottom: 15,
    paddingVertical: 5,
  },

  simpleTaskText: {
    fontSize: 18,
    color: '#333333',
    lineHeight: 24,
  },

  simpleStartButton: {
    color: '#16A34A',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  simpleTimer: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    backgroundColor: '#FFF3E0',
  },
  
  // NUCLEAR REBUILD: CLEAN TASK CARD STYLES FROM SCRATCH
  cleanTasksContainer: {
    marginTop: 20,
    paddingHorizontal: 16, // Small side padding
  },
  
  cleanTasksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  
  // CLEAN TASK CARD: 80% width, 60px height, horizontal layout
  cleanTaskCard: {
    width: '80%', // EXACTLY 80% of screen width
    height: 60, // EXACTLY 60px height - compact but readable
    alignSelf: 'center', // Center the 80% width card
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // HORIZONTAL FLEXBOX LAYOUT
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Activity name on LEFT
  cleanTaskName: {
    flex: 1, // Takes remaining space
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  
  // Timer on RIGHT
  cleanTaskTimer: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginRight: 12,
    minWidth: 40, // Ensure consistent width
  },
  
  // Start button on FAR RIGHT
  cleanStartButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  
  cleanStartButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // NUCLEAR REBUILD: Additional states for task cards
  cleanTaskCardCompleted: {
    backgroundColor: '#F0F9FF',
    borderColor: '#22C55E',
    borderWidth: 2,
  },
  
  cleanTaskCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#F97316',
    borderWidth: 2,
  },
  
  cleanTaskNameCompleted: {
    color: '#22C55E',
    textDecorationLine: 'line-through',
  },
  
  cleanTaskTimerActive: {
    color: '#F97316',
    fontWeight: '700',
  },
  
  cleanStopButton: {
    backgroundColor: '#EF4444',
  },
  
  cleanCompletedBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  
  cleanCompletedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // CREATIVE FREEDOM: FRESH MODERN WORKOUT FLOW DESIGN
  workoutFlow: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  // Modern Header with Progress
  flowHeader: {
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },

  flowTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: -0.5,
  },

  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 50,
  },

  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },

  // Activity Cards with Modern Flow Design
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },

  activityCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
  },

  activityCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#F59E0B',
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },

  activityCardNext: {
    backgroundColor: '#F8FAFC',
    borderColor: '#16A34A',
    borderWidth: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
  },

  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  statusIndicatorCompleted: {
    backgroundColor: '#10B981',
  },

  statusIndicatorActive: {
    backgroundColor: '#F59E0B',
  },

  statusIndicatorNext: {
    backgroundColor: '#16A34A',
  },

  stepNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  activityInfo: {
    flex: 1,
    paddingTop: 4,
  },

  activityName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 26,
  },

  activityNameCompleted: {
    color: '#059669',
  },

  activityMeta: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Controls Section
  cardControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  timerDisplay: {
    alignItems: 'center',
  },

  timerText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },

  timerLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },

  actionButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  actionButtonActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Completion State
  completedState: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  completedText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Flow Connectors
  connector: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -1,
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
  },

  connectorCompleted: {
    backgroundColor: '#10B981',
  },

  // Completion Celebration
  completionCelebration: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#10B981',
  },

  celebrationTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 8,
    textAlign: 'center',
  },

  celebrationText: {
    fontSize: 16,
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // COMPACT DURATION CONTAINER
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  durationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  vibrantDurationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  
  // COMPACT ACTION ARROW
  actionArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  arrowIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  // COMPACT PROGRESS SECTION
  vibrantProgressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F5E8',
    paddingHorizontal: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBarTrack: {
    height: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  vibrantProgressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
  },
  progressPercentage: {
    position: 'absolute',
    top: 0,
    right: 8,
    height: '100%',
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
    textAlignVertical: 'center',
    lineHeight: 16,
  },

  // PAGE TITLE STYLES
  pageTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // INDIVIDUAL START BUTTON STYLES
  workoutCardFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 12,
  },
  individualWorkoutStartButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    // Premium shadow system for both themes
    ...(theme.isDark ? {
      // Dark theme with glow
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: 'rgba(0, 230, 118, 0.2)',
    } : {
      // Light theme crisp shadows
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.18, // More prominent shadow
      shadowRadius: 10,
      elevation: 5,
    }),
  },
  individualWorkoutStartButtonText: {
    color: '#FFFFFF',
    fontSize: 17, // Slightly larger
    fontWeight: '800', // Bolder
    letterSpacing: 0.7, // More spacing for premium feel
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ACTIVITY START BUTTON STYLES
  activityStartButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  activityStartButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
  
  // MOBILE-FIRST ACTIVITY BUTTON STYLES - Prevents overflow, ensures accessibility
  activitiesContainer: {
    marginTop: 12,
    paddingHorizontal: 4, // Slight padding to prevent edge touch
  },
  activitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  mobileActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingVertical: 2,
    minHeight: 48, // WCAG-compliant touch target
  },
  mobileActivityInfo: {
    flex: 1, // Takes available space, prevents overflow
    marginRight: 12, // Space between text and button
    minWidth: 0, // Allows flex shrinking
  },
  mobileActivityText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 18,
    flexShrink: 1, // Allows text to shrink if needed
  },
  mobileActivityDuration: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  mobileActivityButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60, // Consistent button width
    minHeight: 44, // WCAG touch target requirement
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.isDark ? theme.colors.primary : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mobileActivityButtonActive: {
    backgroundColor: theme.colors.accent || '#EF4444', // Red for active/stop state
  },
  mobileActivityButtonDisabled: {
    backgroundColor: theme.colors.surface,
    opacity: 0.6,
  },
  mobileActivityButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mobileActivityButtonTextActive: {
    color: '#FFFFFF',
  },
  mobileActivityButtonTextDisabled: {
    color: theme.colors.textMuted,
  },

  // DYNAMIC TIMER STATE STYLES - Color-coded for clear visual feedback
  mobileActivityButtonDefault: {
    backgroundColor: '#10B981', // Green for start/play state
  },
  mobileActivityButtonRunning: {
    backgroundColor: '#F59E0B', // Orange/Yellow for running/pause state
  },
  mobileActivityButtonPaused: {
    backgroundColor: '#3B82F6', // Blue for paused/resume state
  },
  mobileActivityButtonTextRunning: {
    color: '#FFFFFF',
  },
  mobileActivityButtonTextPaused: {
    color: '#FFFFFF',
  },

  // TIMER BUTTON GROUP - When timer is active, show pause/resume + stop
  mobileTimerButtonGroup: {
    flexDirection: 'row',
    gap: 6, // Small gap between timer control buttons
    alignItems: 'center',
  },
  mobileTimerButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 36, // Smaller than main buttons
    minHeight: 36, // Still accessible but compact
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.isDark ? theme.colors.primary : '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: theme.isDark ? 0.2 : 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  mobileStopButton: {
    backgroundColor: '#EF4444', // Red for stop action
  },
  mobileTimerButtonText: {
    fontSize: 16, // Slightly larger for emoji visibility
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // TIMER DISPLAY - Shows live timer countdown
  timerDisplay: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  timerDisplayText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  timerDisplayRunning: {
    color: '#F59E0B', // Orange for running timer
  },
  timerDisplayPaused: {
    color: '#3B82F6', // Blue for paused timer
  },

  // MOBILE-FIRST WORKOUT ACTION BUTTONS - 3 primary buttons max
  mobileWorkoutActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 4,
    alignItems: 'stretch', // Equal height buttons
  },
  mobilePrimaryButton: {
    flex: 1, // Equal width distribution
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    minHeight: 48, // WCAG touch target
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.isDark ? theme.colors.primary : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.25 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mobileStartButton: {
    // backgroundColor set dynamically based on difficulty
  },
  mobileSecondaryButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mobileMoreButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mobilePrimaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    numberOfLines: 1,
  },
  mobileSecondaryButtonText: {
    color: theme.colors.text,
  },
  mobileMoreButtonText: {
    color: theme.colors.textSecondary,
  },
  workoutActions: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  startButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 88,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    // Theme-appropriate shadows
    ...(theme.isDark ? {
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    } : {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  startButtonText: {
    color: 'white',
    fontSize: 15, // Slightly larger
    fontWeight: '700', // Bolder
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  progressSummary: {
    backgroundColor: theme.isDark ? theme.colors.surface : '#F8F9FA',
    borderRadius: 12, // More rounded for consistency
    padding: 16, // More padding for premium feel
    marginTop: 12,
    alignItems: 'center',
    // Theme-specific enhancements
    ...(theme.isDark ? {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    } : {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }),
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
  // Clean Header Styles
  cleanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: theme.colors.background,
    // Theme-specific styling
    ...(theme.isDark ? {
      // Dark theme depth with shadow
      borderBottomWidth: 0,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    } : {
      // Light theme clean separator
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0', // Very subtle separator
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, // Very subtle shadow
      shadowRadius: 2,
      elevation: 1,
    }),
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 44, // Same width as hamburger button for balance
  },
  dashboardHeader: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
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
  // NUCLEAR REBUILD: FRESH PAGE STYLES - FULL WIDTH
  nuclearFreshPage: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF', // Clean white background
    paddingVertical: 20,
    paddingHorizontal: 16, // Standard mobile margins
  },

  freshPageHeader: {
    marginBottom: 30,
    alignItems: 'center',
  },

  freshPageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },

  freshPageSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },

  freshDifficultySection: {
    marginBottom: 30,
  },

  freshSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },

  freshSectionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },

  freshDifficultyRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },

  freshDifficultyButton: {
    flex: 1,
    backgroundColor: '#ECF0F1',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  freshDifficultyButtonSelected: {
    backgroundColor: '#16A34A',
    borderColor: '#15803D',
  },

  freshDifficultyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },

  freshWorkoutSection: {
    flex: 1,
  },

  freshWorkoutSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },

  freshWorkoutCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    width: '100%', // EXPLICIT FULL WIDTH
    alignSelf: 'stretch',
  },

  freshWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  freshWorkoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },

  freshWorkoutDuration: {
    fontSize: 14,
    color: '#7F8C8D',
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  freshWorkoutDescription: {
    fontSize: 14,
    color: '#5D6D7E',
    marginBottom: 16,
    lineHeight: 20,
  },

  freshActivitiesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    width: '100%', // EXPLICIT FULL WIDTH
    alignSelf: 'stretch',
  },

  freshActivitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },

  freshActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F7',
  },

  freshActivityText: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
    marginRight: 12,
  },

  freshActivityButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },

  freshActivityButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // ENHANCED PROGRESSIVE TASK STYLES
  freshActivityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%', // MAINTAIN FULL WIDTH
    alignSelf: 'stretch',
    borderWidth: 2,
    borderColor: '#E8EAF0',
    minHeight: 80, // Full size for current task
  },

  // COMPACT STYLE FOR COMPLETED TASKS
  freshActivityCardCompact: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    width: '100%',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#22C55E',
    minHeight: 30, // Much smaller for completed tasks
    maxHeight: 30, // Constrain height
  },

  freshActivityCardCompleted: {
    // Completed styling now handled by freshActivityCardCompact
    // No opacity fade since we're using compact size instead
  },

  freshActivityCardCurrent: {
    borderColor: '#16A34A',
    backgroundColor: '#FAFBFF',
  },

  freshActivityCardActive: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },

  freshActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  freshActivityInfo: {
    flex: 1,
  },

  freshActivityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },

  freshActivityNameCompleted: {
    color: '#22C55E',
    textDecorationLine: 'line-through',
  },

  freshActivityDuration: {
    fontSize: 14,
    color: '#7F8C8D',
    fontFamily: 'monospace',
  },

  freshTaskStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8EAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  freshTaskStatusIconCompleted: {
    backgroundColor: '#22C55E',
  },

  freshTaskStatusIconCurrent: {
    backgroundColor: '#16A34A',
  },

  freshTaskStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // INLINE TIMER STYLES
  freshInlineTimer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },

  freshTimerDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#16A34A',
    fontFamily: 'monospace',
    marginBottom: 4,
  },

  freshTimerLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },

  freshTimerControls: {
    flexDirection: 'row',
    gap: 12,
  },

  freshTimerButton: {
    backgroundColor: '#95A5A6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },

  freshCompleteButton: {
    backgroundColor: '#22C55E',
  },

  freshTimerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // START BUTTON STYLES
  freshStartButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  freshStartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // COMPLETION STYLES
  freshCompletionMessage: {
    backgroundColor: '#E8F5E8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },

  freshCompletionText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '500',
  },

  freshWorkoutComplete: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
  },

  freshCelebrationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 8,
  },

  freshCelebrationText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 20,
  },

  // PROGRESSIVE REVELATION MESSAGING
  freshProgressMessage: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },

  freshProgressText: {
    fontSize: 14,
    color: '#16A34A',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // NEW TASK REVEAL MESSAGING
  freshNewTaskReveal: {
    backgroundColor: '#E8F5E8',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },

  freshNewTaskText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },

  // COMPACT STYLES FOR COMPLETED TASKS
  freshCompactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  freshCompactTaskName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22C55E',
    flex: 1,
  },

  freshCompactDuration: {
    fontSize: 12,
    color: '#7F8C8D',
    fontFamily: 'monospace',
    marginLeft: 8,
  },

  // COMPLETED SECTION SEPARATOR
  freshCompletedSection: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAF0',
  },

  freshCompletedSectionTitle: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // TASK SEPARATOR
  freshTaskSeparator: {
    height: 1,
    backgroundColor: '#E8EAF0',
    marginVertical: 12,
    width: '100%',
  },
  
  // OLD - Keep for now but not used
  minimalDashboard: {
    flex: 1,
    paddingTop: 8,
  },
  
  // Minimal Stats
  minimalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  streakDisplay: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  progressDisplay: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dashboardProgressLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  
  // Focused Actions
  focusedActionsContainer: {
    marginBottom: 20,
  },
  primaryWorkoutCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    boxShadow: `0 4px 12px ${theme.colors.primary}20`,
  },
  primaryWorkoutHeader: {
    marginBottom: 16,
  },
  primaryWorkoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  primaryWorkoutSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  primaryWorkoutAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  primaryActionArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  // Quick Choice Cards
  quickChoiceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  choiceCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  choiceEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  choiceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // REDESIGNED WORKOUT SELECTION STYLES
  redesignedWorkoutSelection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  
  // HEADER STYLES
  selectionHeaderContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  selectionHeaderTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.primary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
    // Theme-specific text effects
    ...(theme.isDark ? {
      textShadowColor: 'rgba(0, 230, 118, 0.4)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    } : {
      // Light theme gets clean, crisp text with no shadow
      textShadowColor: 'transparent',
    }),
  },
  selectionHeaderSubtitle: {
    fontSize: 17, // Slightly larger
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24, // Better line height
    fontWeight: '400', // Regular weight
    opacity: theme.isDark ? 0.9 : 0.8, // Better opacity for dark theme
    letterSpacing: 0.1, // Subtle spacing
  },

  // DIFFICULTY SELECTION STYLES
  difficultySelectionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  difficultyCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 18,
    borderRadius: 20,
    position: 'relative',
    minHeight: 150,
    justifyContent: 'space-between',
    // Premium shadow system for both themes
    ...(theme.isDark ? {
      // Dark theme enhanced shadows
      shadowColor: 'rgba(0, 230, 118, 0.5)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(31, 31, 31, 0.95)',
    } : {
      // Light theme crisp shadows and borders
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12, // More prominent shadow for light theme
      shadowRadius: 10,
      elevation: 4,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      backgroundColor: '#FFFFFF',
    }),
  },
  difficultyCardSelected: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
    transform: [{ scale: 1.03 }],
    // Theme-specific selection effects
    ...(theme.isDark ? {
      // Dark theme glow effect
      backgroundColor: 'rgba(0, 230, 118, 0.08)',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 8,
    } : {
      // Light theme enhanced selection
      backgroundColor: '#E8F5E8', // Light green background
      shadowColor: '#4CAF50',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25, // Prominent shadow for selection
      shadowRadius: 15,
      elevation: 6,
    }),
  },
  selectionDifficultyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  difficultyLabel: {
    fontSize: 20, // Larger for better hierarchy
    fontWeight: '800', // Extra bold
    color: '#FFFFFF',
    marginBottom: 6, // More space
    textAlign: 'center',
    letterSpacing: 0.3, // Subtle letter spacing
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  difficultyDescription: {
    fontSize: 13, // Slightly larger
    color: '#FFFFFF',
    opacity: 0.95, // Slightly more opaque
    textAlign: 'center',
    fontWeight: '500', // Medium weight
    letterSpacing: 0.2, // Subtle spacing
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // START WORKOUT SECTION STYLES - Enhanced for prominence
  startWorkoutSection: {
    marginTop: 'auto',
  },
  readyToThriveContainer: {
    alignItems: 'center',
    marginBottom: 24, // Increased spacing
    paddingHorizontal: 16,
  },
  readyToThriveTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
    // Theme-appropriate text effects
    ...(theme.isDark ? {
      textShadowColor: 'rgba(0, 230, 118, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    } : {
      // Light theme gets crisp, clean text
      textShadowColor: 'transparent',
    }),
  },
  readyToThriveSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24, // Better line height
    opacity: theme.isDark ? 0.9 : 0.8, // Slightly reduced opacity for hierarchy
  },
  redesignedStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginHorizontal: 16,
    minHeight: 64,
    // Premium shadow system for both themes
    shadowColor: theme.isDark ? theme.colors.primary : '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: theme.isDark ? 0.4 : 0.3, // Enhanced shadow for light theme
    shadowRadius: 12,
    elevation: 8,
    // Theme-specific enhancements
    ...(theme.isDark ? {
      // Dark theme glow
      borderWidth: 1,
      borderColor: 'rgba(0, 230, 118, 0.3)',
    } : {
      // Light theme crisp shadow
      shadowOpacity: 0.25,
      shadowColor: '#2E7D32', // Darker green shadow for light theme
    }),
  },
  redesignedStartButtonText: {
    fontSize: 22, // Slightly larger
    fontWeight: '900', // Extra bold for prominence
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5, // Subtle letter spacing
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  redesignedStartArrow: {
    fontSize: 26, // Slightly larger
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 12, // Space from text
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // Minimal Feed
  minimalFeedContainer: {
    gap: 12,
  },
  inspirationCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: theme.isDark ? 2 : 1, // Subtle border for light theme
    borderColor: theme.isDark 
      ? 'rgba(0, 230, 118, 0.3)'
      : '#E0E0E0', // Clean border for light theme
    borderLeftWidth: 6, // Accent left border
    borderLeftColor: theme.colors.primary,
    // Theme-specific backgrounds
    backgroundColor: theme.isDark
      ? 'rgba(0, 230, 118, 0.02)' // Subtle green tint for dark
      : '#FFFFFF', // Pure white for light theme
    // Enhanced shadows for both themes
    ...(theme.isDark ? {
      shadowColor: 'rgba(0, 230, 118, 0.3)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    } : {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    }),
  },
  inspirationText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quickAccessCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  quickAccessIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  quickAccessText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  completionCard: {
    backgroundColor: theme.colors.success + '15',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardCompletionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  completionText: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '500',
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
    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
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
    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
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
  dashboardProgressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  comingSoonButton: {
    backgroundColor: theme.isDark ? theme.colors.surface : '#F0FDF4',
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

  // 🚨 EMERGENCY BYPASS: Inline Timer Styles
  inlineTimerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
    justifyContent: 'space-between',
  },
  inlineBackButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.textMuted,
    marginBottom: 20,
  },
  inlineBackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  inlineWorkoutHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  inlineWorkoutTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  inlineWorkoutDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  inlineDifficultyBadge: {
    alignItems: 'center',
  },
  inlineDifficultyText: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fullScreenTimerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  inlineTimerText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  inlineTimerStatus: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  fullScreenTimerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
    marginVertical: 20,
  },
  inlineControlButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inlineStartPauseButton: {
    backgroundColor: '#16A34A', // THRIVE green for start/pause
  },
  inlineCompleteButton: {
    backgroundColor: '#10B981', // Green for complete
  },
  inlineControlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inlineProgressInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  inlineProgressText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  inlineProgressSubtext: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },

  // DYNAMIC CONTENT SWITCHING STYLES
  dynamicContentContainer: {
    marginTop: 20,
  },

  // MOTIVATIONAL STATS STYLES
  motivationalContainer: {
    padding: 20,
  },

  statsOverviewSection: {
    marginBottom: 24,
  },

  statsOverviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16A34A',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },

  statSubtext: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '500',
    textAlign: 'center',
  },

  // PROGRESS SECTION
  progressSection: {
    marginBottom: 24,
  },

  progressItem: {
    marginBottom: 16,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },

  progressValue: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
  },

  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },

  goalMotivation: {
    fontSize: 12,
    color: '#16A34A',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },

  // ACHIEVEMENTS SECTION
  achievementsSection: {
    marginBottom: 24,
  },

  achievementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },

  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },

  badge: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },

  badgeEmoji: {
    fontSize: 14,
  },

  badgeText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
  },

  // MOTIVATIONAL CTA
  motivationalCTA: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16A34A',
  },

  ctaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 4,
    textAlign: 'center',
  },

  ctaSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // WORKOUT TASKS CONTAINER
  workoutTasksContainer: {
    // Inherits styles from existing workout list
  },

  // JOURNEY BUTTON STYLES (Matching Difficulty Button Design)
  freshJourneySection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },

  freshJourneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  freshJourneyButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  freshJourneyButtonSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
    shadowColor: '#16A34A',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  freshJourneyEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },

  freshJourneyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
    textAlign: 'center',
    marginBottom: 4,
  },

  freshJourneySubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // JOURNEY STATUS DISPLAY
  journeyStatusContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },

  journeyStatusText: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // JOURNEY ENHANCEMENT BANNER
  journeyEnhancementBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#16A34A',
  },

  journeyEnhancementText: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ACTION BUTTONS ROW (START + DEMO)
  freshActionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },

  freshDetailsButton: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  freshDetailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },

  freshDemoButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  freshDemoButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },

  freshTaskStatusIconAvailable: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },

  // VIDEO MODAL STYLES
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  videoModalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  videoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  videoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },

  videoModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoModalCloseText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  videoPlaceholderContainer: {
    padding: 20,
  },

  videoPlaceholder: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16A34A',
    borderStyle: 'dashed',
  },

  videoPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  videoPlaceholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 12,
    textAlign: 'center',
  },

  videoPlaceholderText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  videoModalFooter: {
    padding: 20,
    paddingTop: 16,
  },

  videoModalOkButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },

  videoModalOkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // EXERCISE DETAILS MODAL STYLES
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },

  detailsModalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  detailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  detailsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16A34A',
    flex: 1,
  },

  detailsModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailsModalCloseText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  detailsModalScroll: {
    flex: 1,
    padding: 20,
  },

  detailsSection: {
    marginBottom: 24,
  },

  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 12,
  },

  detailsDescription: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },

  instructionItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },

  instructionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16A34A',
    marginRight: 8,
    minWidth: 20,
  },

  instructionText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 18,
  },

  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },

  tipBullet: {
    fontSize: 14,
    marginRight: 8,
  },

  tipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  detailsDuration: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },

  detailsModalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  detailsModalStartButton: {
    flex: 2,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },

  detailsModalStartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  detailsModalCloseButtonBottom: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },

  detailsModalCloseTextBottom: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
  },

  // 🌱 THRIVE BRANDING SYSTEM STYLES
  // Revolutionary mental health-first design system
  
  // Main Background
  thriveMainBackground: {
    backgroundImage: 'linear-gradient(180deg, #fafafa 0%, #f0f9f0 100%)',
  },

  // Typography System
  thriveHero: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 32,
    fontWeight: '700',
    color: '#2E2E2E',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  
  thriveHeader: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 24,
    fontWeight: '600',
    color: '#2E2E2E',
    marginBottom: 12,
  },
  
  thriveSubheader: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 20,
    fontWeight: '500',
    color: '#2E2E2E',
    marginBottom: 8,
  },
  
  thriveBody: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: '400',
    color: '#2E2E2E',
    lineHeight: 24,
    marginBottom: 16,
  },
  
  thriveCaption: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 20,
  },

  // Color System
  thrivePrimaryColor: {
    color: '#4CAF50',
  },
  
  thriveSuccessColor: {
    color: '#66BB6A',
  },

  // Button System
  thriveButtonPrimary: {
    backgroundImage: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 120,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  thriveButtonPrimaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  
  thriveButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 120,
  },
  
  thriveButtonSecondaryText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  
  thriveButtonGentle: {
    backgroundColor: '#A5D6A7',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  
  thriveButtonGentleText: {
    color: '#006241',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },

  // Card System
  thriveCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  
  thriveCardWorkout: {
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  
  thriveCardAchievement: {
    backgroundColor: 'rgba(255, 248, 225, 0.9)',
    borderWidth: 2,
    borderColor: '#66BB6A',
  },
  
  thriveCardCommunity: {
    backgroundColor: 'rgba(232, 245, 232, 0.9)',
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },

  // Progress System
  thriveProgressContainer: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 8,
  },
  
  thriveProgressBar: {
    height: '100%',
    backgroundImage: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    borderRadius: 6,
    minWidth: 4,
  },

  // Form Elements
  thriveInput: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    fontSize: 16,
    color: '#2E2E2E',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  
  thriveInputFocused: {
    borderColor: '#4CAF50',
    backgroundColor: 'white',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  // Loading System
  thriveLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  
  thriveLoadingText: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
  },
});