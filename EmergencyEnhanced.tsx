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
import SettingsModal from './src/components/SettingsModal';
import CommunityFeed from './src/components/CommunityFeed';
import StatsTab from './src/components/StatsTab';
import SwipeNavigation, { PageName } from './src/components/PureSwipeNavigation';
import NavigationDrawer from './src/components/NavigationDrawer';
import EdgeSwipeDetector from './src/components/EdgeSwipeDetector';
import ActivityPlaceholder from './src/components/ActivityPlaceholder';
import SlideBasedProfile from './src/components/SlideBasedProfile';
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
  // NUCLEAR RESET: Manual difficulty selection removed - app determines automatically
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

  // NUCLEAR RESET: Animation and previous state tracking removed (no journey selection needed)

  // NUCLEAR RESET: Journey selection removed - profile system handles this automatically

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

  // Navigation drawer state
  const [showDrawer, setShowDrawer] = useState(false);

  // Activity placeholder state
  const [showActivityPlaceholder, setShowActivityPlaceholder] = useState(false);
  const [currentActivityName, setCurrentActivityName] = useState('');

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

  // MOBILE DETECTION - Simple user agent check for mobile bypass
  const isMobile = () => {
    if (typeof window !== 'undefined' && window.navigator) {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
    }
    return false;
  };

  // EMERGENCY ONBOARDING STATE MANAGER
  const initializeOnboardingState = async () => {
    console.log('🚨 EMERGENCY INIT: Starting clean onboarding state');
    
    // MOBILE BYPASS: Skip onboarding on mobile to prevent white screen
    if (isMobile()) {
      console.log('📱 MOBILE DETECTED: Bypassing onboarding to prevent white screen');
      const mobileBypassState = {
        isFirstTime: false,
        showOnboarding: false,
        onboardingType: 'mobile-bypass' as const,
        hasCompletedOnboarding: true,
        debugInfo: {
          bypassReason: 'Mobile compatibility',
          timestamp: new Date().toISOString()
        }
      };
      setOnboardingState(mobileBypassState);
      
      // Set a default mobile-friendly profile
      setUserProfile({
        name: 'Mobile User',
        difficulty: 'steady',
        bypassMode: true
      });
      
      console.log('📱 MOBILE BYPASS COMPLETE: App ready for mobile use');
      return;
    }
    
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

  // NUCLEAR RESET: Manual difficulty selection function removed - app chooses intelligently

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
    // NUCLEAR RESET: No difficulty selection to clear
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
    if (!currentWorkout) return;

    // Stop timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsRunning(false);

    // NUCLEAR RESET: Intelligent XP calculation based on workout data (not user selection)
    const intelligentXPGain = calculateIntelligentXP(currentWorkout);
    const xpGain = intelligentXPGain;

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

    // NUCLEAR RESET: Intelligent celebration messaging based on workout type
    const intelligentMessage = getIntelligentCelebrationMessage(currentWorkout);

    setCelebrationData({
      xpGain,
      message: intelligentMessage
    });

    // Store data for mood tracking (no difficulty selection needed)
    setCompletedWorkoutData({
      difficulty: 'intelligent', // App-determined
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
    // NUCLEAR RESET: No difficulty selection to clear

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
        
        // NUCLEAR RESET: Intelligent XP calculation based on workout complexity
        const intelligentXP = calculateIntelligentXP(workout);
        const progressiveBonus = Math.floor(intelligentXP * 0.5); // 50% bonus for completing all activities
        
        // Store enhanced completion data
        setCompletedWorkoutData({
          difficulty: 'intelligent', // App-determined
          xpGain: intelligentXP + progressiveBonus,
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
      // NUCLEAR RESET: Removed setSelectedDifficulty - no longer needed
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
    // NUCLEAR RESET: Removed setSelectedDifficulty - no longer needed
    
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
    // NUCLEAR RESET: Removed setSelectedDifficulty - no longer needed
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
    
    // NUCLEAR RESET: Removed difficulty clearing - no longer needed with profile-driven system
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

  // INTELLIGENT XP CALCULATION: Based on workout complexity and duration
  const calculateIntelligentXP = (workout: any) => {
    const baseXP = 10;
    const durationBonus = Math.floor(workout.duration / 2); // 5 XP per 2 minutes
    const activityBonus = workout.activities ? workout.activities.length * 2 : 5;
    return baseXP + durationBonus + activityBonus;
  };
  
  // INTELLIGENT CELEBRATION MESSAGING: Based on workout characteristics
  const getIntelligentCelebrationMessage = (workout: any) => {
    const messages = [
      "Amazing progress on your wellness journey!",
      "You're building healthy habits that last!", 
      "Every session brings you closer to your goals!",
      "Your commitment to yourself is inspiring!",
      "Well done! Your body and mind thank you!"
    ];
    
    // Choose message based on workout characteristics
    if (workout.duration <= 3) {
      return "Small steps, big impact! Well done!";
    } else if (workout.duration <= 8) {
      return "Steady progress builds lasting change!";
    } else {
      return "You challenged yourself and succeeded!";
    }
  };

  // INTELLIGENT ACTIVITY RECOMMENDATION: Profile-driven, no user choice required
  const getRecommendedActivities = () => {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    
    // Intelligent difficulty determination (no user selection needed)
    let recommendedDifficulty = 'gentle'; // Default safe choice
    
    // Time-based intelligence
    if (hour >= 6 && hour < 10) {
      recommendedDifficulty = 'gentle'; // Morning: gentle start
    } else if (hour >= 10 && hour < 16) {
      recommendedDifficulty = 'steady'; // Midday: steady energy
    } else if (hour >= 16 && hour < 20) {
      recommendedDifficulty = userStats.streak > 3 ? 'steady' : 'gentle'; // Afternoon: adaptive
    } else {
      recommendedDifficulty = 'gentle'; // Evening: wind down
    }
    
    // Streak-based progression (app learns user capability)
    if (userStats.streak > 7) {
      // User has consistency, can handle more intensity
      if (recommendedDifficulty === 'gentle') recommendedDifficulty = 'steady';
      else if (recommendedDifficulty === 'steady') recommendedDifficulty = 'beast';
    }
    
    // Get activities from determined difficulty
    const availableWorkouts = workoutDatabase[recommendedDifficulty] || workoutDatabase.gentle;
    
    // Intelligent selection: prioritize uncompleted, then variety
    const uncompletedWorkouts = availableWorkouts.filter(w => !completedWorkouts.includes(w.id));
    const workoutsToShow = uncompletedWorkouts.length > 0 ? uncompletedWorkouts : availableWorkouts;
    
    // Return top 3 recommended activities
    return workoutsToShow.slice(0, 3).map(workout => ({
      ...workout,
      intelligentReason: `Recommended for ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'} wellness`
    }));
  };
  
  const getRecommendedWorkout = () => {
    const activities = getRecommendedActivities();
    return activities.length > 0 ? {
      difficulty: 'intelligent',
      reason: 'AI-curated based on your profile and patterns'
    } : {
      difficulty: 'gentle',
      reason: 'Gentle start for your wellness journey'
    };
  };

  // HOME SCREEN REDESIGN: getXPProgress function removed - no longer needed

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

  // NAVIGATION DRAWER HANDLERS
  const handleDrawerOpen = () => {
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
  };

  const handleDrawerMorningFlow = () => {
    console.log('📅 Morning Flow selected from drawer');
    // TODO: Navigate to Morning Flow when implemented
    Alert.alert('Morning Flow', 'Morning Flow feature coming soon!');
  };

  const handleDrawerMood = () => {
    console.log('😊 Mood selected from drawer');
    quickMoodCheckin();
  };

  const handleDrawerDemo = () => {
    console.log('🎥 Demo Tutorial selected from drawer');
    startDemoMode();
  };

  const handleDrawerHelp = () => {
    console.log('❓ Help and Support selected from drawer');
    Alert.alert('Help & Support', 'Help and Support feature coming soon!');
  };

  // NUCLEAR RESET: Morning flow functions removed - no longer needed

  const handleReset = () => {
    // NUCLEAR RESET: Removed setSelectedDifficulty - no longer needed
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
      case 'intelligent': return '#4CAF50'; // THRIVE green for AI-curated
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
      {/* HOME SCREEN REDESIGN: Daily Goal Percentage removed completely */}
    </View>
  );

  // PROFILE-BASED: Default difficulty determined by user's pathway from profile system
  const [selectedIntensity, setSelectedIntensity] = useState<'gentle' | 'steady' | 'beast'>('steady'); // Will be set from profile

  // Get difficulty level from user's fitness level in slide-based profile system
  const getDifficultyFromProfile = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      if (profile?.fitnessLevel) {
        // Map fitness level to difficulty level:
        // beginner -> gentle (easy, supportive movements)
        // intermediate -> steady (balanced, moderate intensity)
        // advanced/athlete -> beast (challenging, high intensity)
        switch (profile.fitnessLevel) {
          case 'beginner':
            return 'gentle';
          case 'intermediate':
            return 'steady';
          case 'advanced':
          case 'athlete':
            return 'beast';
          default:
            return 'steady'; // Default fallback
        }
      }
      
      // Legacy pathway fallback for existing users
      if (profile?.pathway) {
        switch (profile.pathway) {
          case 'wellness':
            return 'gentle';
          case 'fitness':
            return 'steady';
          case 'performance':
            return 'beast';
          default:
            return 'steady';
        }
      }
      
      return 'steady'; // Default if no profile
    } catch (error) {
      console.log('Could not load profile for difficulty:', error);
      return 'steady'; // Default fallback
    }
  };

  // Initialize difficulty from profile on component mount
  useEffect(() => {
    getDifficultyFromProfile().then(difficulty => {
      setSelectedIntensity(difficulty);
      console.log('🎯 PROFILE-BASED DIFFICULTY:', difficulty);
    });
  }, []);

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
              <Text style={[styles.inlineDifficultyText, { backgroundColor: getDifficultyColor('intelligent') }]}>
                💚 CURATED
              </Text>
            </View>
          </View>

          {/* Timer Display */}
          <View style={[styles.inlineTimerDisplay, { backgroundColor: getDifficultyColor('intelligent') }]}>
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
                  "You completed your curated workout!",
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

    // 🎯 PROFILE-BASED: Skip difficulty selection - go directly to workouts based on profile
    // Difficulty is now determined by user's pathway from the profile system
    return (
      <View style={styles.redesignedWorkoutSelection}>
        {/* HEADER: Ready to THRIVE */}
        <View style={styles.selectionHeaderContainer}>
          <Text style={styles.selectionHeaderTitle}>Ready to THRIVE?</Text>
          <Text style={styles.selectionHeaderSubtitle}>
            Your {selectedIntensity === 'gentle' ? 'gentle wellness' : 
                   selectedIntensity === 'steady' ? 'balanced fitness' : 'high-performance'} workouts await
          </Text>
        </View>

        {/* DIRECT WORKOUT ACCESS */}
        <View style={styles.directWorkoutAccess}>
          <TouchableOpacity 
            style={[
              styles.directStartButton,
              { backgroundColor: getDifficultyColor(selectedIntensity) }
            ]}
            onPress={() => {
              console.log('🚨 DEBUG: DIRECT START BUTTON CLICKED!');
              console.log('🚨 DEBUG: Profile-based intensity:', selectedIntensity);
              try {
                console.log('🚨 DEBUG: About to call quickStartWorkout...');
                quickStartWorkout(selectedIntensity);
                console.log('🚨 DEBUG: quickStartWorkout completed successfully');
              } catch (error) {
                console.error('🚨 CRASH: Start button error:', error);
                console.error('🚨 CRASH: Stack trace:', error.stack);
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.directStartButtonEmoji}>
              {getDifficultyEmoji(selectedIntensity)}
            </Text>
            <Text style={styles.directStartButtonText}>
              START {selectedIntensity.toUpperCase()} WORKOUT
            </Text>
            <Text style={styles.directStartButtonArrow}>→</Text>
          </TouchableOpacity>
          
          <Text style={styles.profileBasedText}>
            Based on your {selectedIntensity === 'gentle' ? 'Wellness' : 
                              selectedIntensity === 'steady' ? 'Fitness' : 'Performance'} journey
          </Text>
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

      {/* HOME SCREEN REDESIGN: "How are you feeling?" section completely removed */}
    </View>
  );

  // REMOVED: Animation effects for journey selection (no longer needed)

  // CLEAN PROFILE-DRIVEN CONTENT: No selection required
  const renderTodaysActivities = () => {
    // Automatically determine recommended activities based on profile/time/previous completion
    const recommendedActivities = getRecommendedActivities();
    
    return (
      <View style={styles.todaysActivitiesSection}>
        <Text style={styles.sectionTitle}>Today's Activities</Text>
        <Text style={styles.sectionSubtitle}>Curated for your wellness journey</Text>
        
        {recommendedActivities.map((activity, index) => (
          <View key={index} style={styles.activityCard}>
            <Text style={styles.activityName}>{activity.name}</Text>
            <Text style={styles.activityDuration}>{activity.duration} minutes</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
            
            <TouchableOpacity 
              style={styles.startActivityButton}
              onPress={() => {
                console.log('🎯 HOME REDESIGN: Start Activity pressed:', activity.name);
                console.log('🚀 STARTING REAL WORKOUT:', activity);
                startWorkout(activity);
              }}
              activeOpacity={0.7} // Visual feedback on press
            >
              <Text style={styles.startActivityButtonText}>Start Activity</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };
  
  const renderProfileDrivenContent = () => {
    return (
      <View style={styles.profileContentSection}>
        <View style={styles.quickStatsCard}>
          <Text style={styles.quickStatsTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.xp}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // NUCLEAR RESET: Removed renderMotivationalStatsContent function (replaced by profile-driven content)
  // NUCLEAR RESET: Large block of orphaned code removed completely

  // HELPER: Count completed activities for progressive revelation
  const getCompletedActivitiesCount = (workout: any) => {
    if (!workout || !workout.activities) return 0;
    return workout.activities.filter((activity: any) => {
      const activityKey = `${workout.id}-${activity.id}`;
      return completedActivities[activityKey];
    }).length;
  };

  // NUCLEAR RESET: renderFreshWorkoutList function removed - replaced by profile-driven activities

  // NUCLEAR RESET: All orphaned function code removed - clean slate ready

  // MAIN DASHBOARD RENDER FUNCTION
  const renderDashboard = () => {
    return (
      <ScrollView style={styles.minimalDashboard} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        {renderMinimalStats()}
        
        {/* Feed Section with Quick Access */}
        {renderMinimalFeed()}
        
        {/* Today's Activities */}
        {renderTodaysActivities()}
        
        {/* Profile-Driven Content */}
        {renderProfileDrivenContent()}
      </ScrollView>
    );
  };

  // Loading state check - show loading until onboarding state is initialized
  if (!onboardingState) {
    return (
      <SafeAreaView style={[styles.container, styles.thriveMainBackground]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, styles.thriveHero]}>
            {isMobile() ? '📱 Loading THRIVE Mobile...' : '🌟 Loading THRIVE...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // MAIN COMPONENT RENDER
  return (
    <EdgeSwipeDetector onSwipeFromEdge={handleDrawerOpen}>
      <SafeAreaView style={[styles.container, styles.thriveMainBackground]}>
        {/* HOME SCREEN REDESIGN: Clean Header without hamburger menu */}
        <View style={styles.cleanHeader}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, styles.thriveHero]}>
              <Text style={[styles.highlight, styles.thrivePrimaryColor]}>THRIVE</Text>
            </Text>
          </View>
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

      {/* NUCLEAR RESET: Morning Flow Modal removed - using new onboarding system */}

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

      {/* SLIDE-BASED PROFILE SETUP - NO SCROLLING, ADHD-FRIENDLY */}
      {/* Only show onboarding on desktop to prevent mobile white screen */}
      {!isMobile() && (
        <SlideBasedProfile
          visible={onboardingState?.showOnboarding || false}
          onComplete={handleOnboardingComplete}
        />
      )}
      
      {/* DEMO MODE SLIDE-BASED PROFILE - NON-DESTRUCTIVE TUTORIAL */}
      <SlideBasedProfile
        visible={showDemoOnboarding}
        onComplete={handleDemoComplete}
        onClose={exitDemoMode}
      />
      
      {/* Debug banner removed - clean UI */}

      {/* HOME SCREEN REDESIGN: Activity Placeholder Screen */}
      <ActivityPlaceholder
        visible={showActivityPlaceholder}
        onClose={() => setShowActivityPlaceholder(false)}
        activityName={currentActivityName}
      />

      {/* HOME SCREEN REDESIGN: Navigation Drawer */}
      <NavigationDrawer
        visible={showDrawer}
        onClose={handleDrawerClose}
        onMorningFlow={handleDrawerMorningFlow}
        onMood={handleDrawerMood}
        onSettings={() => setShowSettings(true)}
        onDemo={handleDrawerDemo}
        onHelp={handleDrawerHelp}
      />

    </SafeAreaView>
    </EdgeSwipeDetector>
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
  // NUCLEAR RESET STYLES - Clean, minimal home page
  nuclearCleanPage: {
    flex: 1,
    backgroundColor: '#ffffff', // Clean white background
    padding: 20,
  },
  cleanWelcomeHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2E7D32', // THRIVE green
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '400',
  },
  todaysActivitiesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF', // Clean white (Apple Health style)
    borderRadius: 16, // More rounded (iOS style)
    padding: 24, // Generous padding
    marginBottom: 20, // More space between cards
    marginHorizontal: 4, // Subtle margin for cleaner edges
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Subtle shadow (Apple style)
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)', // Very subtle border
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  activityDuration: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  startActivityButton: {
    backgroundColor: '#4CAF50', // THRIVE green
    paddingVertical: 14, // Larger touch target (44pt minimum)
    paddingHorizontal: 28,
    borderRadius: 12, // More rounded (iOS style)
    alignItems: 'center',
    minHeight: 44, // Apple accessibility standard
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  startActivityButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileContentSection: {
    marginBottom: 32,
  },
  quickStatsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
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
    backgroundColor: theme.colors.surface, // CLEANED: Using theme color
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
    fontSize: 12, // Smaller text for compact buttons
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // DYNAMIC TIMER STATE COLORS - Proper Play/Pause/Resume visual feedback
  timerPlayState: {
    backgroundColor: '#10B981', // Green for Play button
    borderColor: '#059669',
    borderWidth: 1,
  },
  timerPauseState: {
    backgroundColor: '#F59E0B', // Orange/Yellow for Pause button
    borderColor: '#D97706',
    borderWidth: 1,
  },
  timerResumeState: {
    backgroundColor: '#3B82F6', // Blue for Resume button
    borderColor: '#2563EB',
    borderWidth: 1,
  },
  timerCompleteState: {
    backgroundColor: '#22C55E', // Green for completed state
    borderColor: '#16A34A',
    borderWidth: 1,
    opacity: 0.8,
  },
  timerCompleteText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  timerDisplayActiveState: {
    backgroundColor: '#FEF3C7', // Light yellow background when running
    borderColor: '#F59E0B',
    borderWidth: 1,
  },
  timerDisplayPausedState: {
    backgroundColor: '#DBEAFE', // Light blue background when paused
    borderColor: '#3B82F6',
    borderWidth: 1,
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

  // SIMPLIFIED MOBILE ACTIONS - Clean 2-button layout for better UX
  simplifiedMobileActions: {
    flexDirection: 'row',
    gap: 16, // Bigger gap for easier tapping
    marginTop: 16,
    paddingHorizontal: 4,
    alignItems: 'stretch',
  },
  simplifiedPrimaryButton: {
    flex: 2, // Primary button takes more space
    paddingVertical: 16, // Bigger for easier tapping
    paddingHorizontal: 12,
    borderRadius: 12,
    minHeight: 56, // Larger touch target (WCAG++)
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.isDark ? theme.colors.primary : '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: theme.isDark ? 0.3 : 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  simplifiedStartButton: {
    backgroundColor: '#10B981', // Green for start
  },
  simplifiedCompletedButton: {
    backgroundColor: '#6B7280', // Gray for completed/restart
  },
  simplifiedSecondaryButton: {
    flex: 1, // More button is smaller
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    minHeight: 56, // Same height as primary
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    shadowColor: theme.isDark ? theme.colors.border : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.2 : 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  simplifiedPrimaryButtonText: {
    fontSize: 16, // Larger text for better readability
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  simplifiedSecondaryButtonText: {
    fontSize: 20, // Larger icon for More button
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
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
    justifyContent: 'center', // CENTER the logo (Apple Health style)
    paddingHorizontal: 24, // Generous padding (Apple style)
    paddingVertical: 24,
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
    justifyContent: 'center', // Center the streak (since we removed daily goal)
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Clean white card
    borderRadius: 16, // iOS-style rounded corners
    paddingVertical: 24, // Generous padding
    paddingHorizontal: 24,
    marginBottom: 24, // More space
    marginHorizontal: 4, // Subtle margin
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Apple-style subtle shadow
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)', // Very subtle border
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

  // DIRECT WORKOUT ACCESS STYLES (Profile-based, no selection needed)
  directWorkoutAccess: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  directStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28, // Bigger than original
    paddingHorizontal: 40,
    borderRadius: 24, // More rounded
    marginHorizontal: 16,
    minHeight: 72, // Bigger target
    marginBottom: 16,
    // Enhanced shadow for prominence
    shadowColor: theme.isDark ? theme.colors.primary : '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.isDark ? 0.5 : 0.35,
    shadowRadius: 16,
    elevation: 10,
    // Theme-specific enhancements
    ...(theme.isDark ? {
      borderWidth: 1,
      borderColor: 'rgba(0, 230, 118, 0.4)',
    } : {
      shadowColor: '#2E7D32',
    }),
  },
  directStartButtonEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  directStartButtonText: {
    fontSize: 24, // Larger than original
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  directStartButtonArrow: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  profileBasedText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  
  // Minimal Feed
  minimalFeedContainer: {
    gap: 12,
  },
  inspirationCard: {
    backgroundColor: '#FFFFFF', // Clean white (Apple Health style)
    borderRadius: 16, // iOS-style rounded corners
    padding: 24, // Generous padding
    alignItems: 'center',
    marginBottom: 20, // More space
    marginHorizontal: 4, // Subtle margin
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Apple-style subtle shadow
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)', // Very subtle border
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

  // NUCLEAR RESET: Removed journey button styles - no longer needed with profile-driven system

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

  // Mobile-specific loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
});