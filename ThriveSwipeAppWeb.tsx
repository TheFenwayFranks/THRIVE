import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder, TextInput, ScrollView, Alert } from 'react-native';
import CalendarSyncService, { CalendarEvent, SyncStatus } from './CalendarSyncService';
import CalendarSettings from './CalendarSettings';
import EventCreationModal, { EventFormData, EVENT_CATEGORIES } from './EventCreationModal';
import AICoachModal from './AICoachModal';

const { width: screenWidth } = Dimensions.get('window');

// 🌱 NEW THRIVE BRAND COLORS
const THRIVE_COLORS = {
  primary: '#27AE60',        // Leaf Green
  accent: '#74B9FF',         // Sky Blue  
  highlight: '#FF7675',      // Peach Coral
  neutral: '#ECECEC',        // Stone Gray
  white: '#FFFFFF',
  black: '#2C3E50',          // Dark text
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  shadow: 'rgba(44, 62, 80, 0.1)',
  // New logo colors from provided design
  logoGreen: '#4CAF50',      // Primary green for plant
  logoLightGreen: '#7BC142', // Lighter green for gradient
  logoPink: '#FF5252'        // Pink/coral for circle
};

// 🌟 THRIVE Logo Component
const ThriveLogoComponent = ({ size = 40, showText = false, textSize = 24 }) => {
  const logoSize = size;
  const stemWidth = logoSize * 0.15;
  const leafWidth = logoSize * 0.35;
  const leafHeight = logoSize * 0.25;
  const circleSize = logoSize * 0.2;
  
  return (
    <View style={[styles.logoContainer, { width: showText ? logoSize * 4 : logoSize, height: logoSize }]}>
      {/* Circular white background */}
      <View style={[styles.logoCircle, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
        {/* Plant stem */}
        <View style={[
          styles.logoStem,
          {
            width: stemWidth,
            height: logoSize * 0.45,
            backgroundColor: THRIVE_COLORS.logoGreen
          }
        ]} />
        
        {/* Left leaf */}
        <View style={[
          styles.logoLeafLeft,
          {
            width: leafWidth,
            height: leafHeight,
            backgroundColor: THRIVE_COLORS.logoGreen,
            left: logoSize * 0.15,
            top: logoSize * 0.35
          }
        ]} />
        
        {/* Right leaf */}
        <View style={[
          styles.logoLeafRight,
          {
            width: leafWidth,
            height: leafHeight,
            backgroundColor: THRIVE_COLORS.logoLightGreen,
            right: logoSize * 0.15,
            top: logoSize * 0.35
          }
        ]} />
        
        {/* Pink circle/bud */}
        <View style={[
          styles.logoCircleTop,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: THRIVE_COLORS.logoPink,
            top: logoSize * 0.15
          }
        ]} />
      </View>
      
      {/* THRIVE text with new typography */}
      {showText && (
        <Text style={[styles.thriveLogoText, { fontSize: textSize, marginLeft: logoSize * 0.3 }]}>
          THRIVE
        </Text>
      )}
    </View>
  );
};

const ThriveSwipeAppWeb = () => {
  const [currentPage, setCurrentPage] = useState(2); // 0: Calendar, 1: Profile, 2: Dashboard, 3: Goals, 4: Social
  const translateX = useRef(new Animated.Value(-screenWidth * 2)).current; // Start at Dashboard (third page)
  const lastGestureState = useRef(0);
  
  // Menu state and animation
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuTranslateX = useRef(new Animated.Value(-260)).current; // Menu starts hidden (260px wide, fully off-screen)
  
  // Card animation state
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const expandedCardScale = useRef(new Animated.Value(0)).current;
  const expandedCardOpacity = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  
  // Profile data state
  const [profileData, setProfileData] = useState({
    name: '',
    weight: '',
    height: '',
    birthday: '',
    fitnessLevel: '',
    mainGoal: '',
    email: ''
  });
  
  // Editing state
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  
  // Dropdown states
  const [showFitnessDropdown, setShowFitnessDropdown] = useState(false);
  const [showMainGoalDropdown, setShowMainGoalDropdown] = useState(false);
  
  // Dropdown options
  const fitnessOptions = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const goalOptions = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Strength', 'General Fitness', 'Sport Specific'];

  // Fitness Dashboard data structure
  const [dashboardData, setDashboardData] = useState({
    // Weight card data
    weight: {
      current: 0,
      goal: 0,
      trend: 'neutral', // 'up', 'down', 'neutral'
      progress: 0 // percentage
    },
    // Goal progress card data
    goalProgress: {
      type: '',
      percentage: 0,
      achieved: 0,
      target: 0,
      trend: 'neutral'
    },
    // Today's tasks card data
    todayTasks: {
      completed: 0,
      total: 0,
      tasks: [],
      trend: 'neutral'
    },
    // Streak counter card data
    streakCounter: {
      current: 0,
      type: 'Daily Logging',
      trend: 'up',
      progress: 0
    }
  });

  // Mental Challenges data structure
  const [mentalData, setMentalData] = useState({
    // Mindfulness/Meditation card
    mindfulness: {
      current: 12, // minutes today
      goal: 20, // minutes goal
      trend: 'up',
      progress: 60 // percentage of goal
    },
    // Mood tracking card
    mood: {
      current: 7, // today's mood (1-10 scale)
      average: 6.8, // weekly average
      trend: 'up',
      progress: 70 // positivity percentage
    },
    // Learning/Reading card
    learning: {
      completed: 1, // pages/articles read today
      goal: 3, // daily goal
      streak: 8, // consecutive days
      trend: 'up'
    },
    // Gratitude/Reflection card
    gratitude: {
      entries: 2, // gratitude entries today
      goal: 3, // daily goal
      streak: 15, // consecutive days
      trend: 'up'
    }
  });

  // Dashboard view state
  const [dashboardView, setDashboardView] = useState('overview'); // 'overview' or 'graph'
  const [selectedCard, setSelectedCard] = useState(null); // which card is expanded
  const [showGraph, setShowGraph] = useState(false); // show graph view
  const [graphType, setGraphType] = useState(null); // 'weight', 'goal', 'tasks', 'streak'
  const [challengeMode, setChallengeMode] = useState('fitness'); // 'fitness' or 'mental'
  const [cardJustOpened, setCardJustOpened] = useState(false); // prevent immediate close
  const [cardsDisabled, setCardsDisabled] = useState(false); // prevent immediate reopen after close
  const [dateRange, setDateRange] = useState('week'); // 'week' or 'month' for stats range
  const [calendarView, setCalendarView] = useState('week'); // 'week' or 'month' for calendar page
  
  // Calendar sync state
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);
  const [showEventCreation, setShowEventCreation] = useState(false);
  
  // AI Coach state
  const [showAICoach, setShowAICoach] = useState(false);
  const [syncedEvents, setSyncedEvents] = useState<CalendarEvent[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    isEnabled: false,
    connectedCalendars: [],
    syncInProgress: false,
    errors: []
  });
  const [calendarService] = useState(() => CalendarSyncService.getInstance());
  
  // Month calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const calendarScrollRef = useRef<ScrollView>(null);
  
  // 🌐 COMPREHENSIVE SOCIAL NETWORK FEATURES STATE
  const [activeProfileTab, setActiveProfileTab] = useState(0); // 0: Overview, 1: Progress, 2: Routines, 3: Q&A
  
  // Modal/Screen Navigation State
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [showFollowingList, setShowFollowingList] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showChallengeSelector, setShowChallengeSelector] = useState(false);
  const [showPlaylistDetail, setShowPlaylistDetail] = useState(null);
  const [showBadgeDetail, setShowBadgeDetail] = useState(null);
  
  // Expandable playlist/routine items state
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);
  const [expandedRoutine, setExpandedRoutine] = useState(null);
  
  // Task execution state
  const [activeTask, setActiveTask] = useState(null);
  const [taskTimer, setTaskTimer] = useState(0);
  const [isTaskRunning, setIsTaskRunning] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showQAInterface, setShowQAInterface] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // 🎨 Profile Edit Mode System
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [cardPositions, setCardPositions] = useState({});
  const [editableProfileData, setEditableProfileData] = useState({
    name: 'Anthony B.',
    username: '@anthony • Wellness & Fitness',
    location: 'he/him • Manchester, NH',
    bio: 'Building healthier habits with my THRIVE crew. Daily workouts, mood check-ins, and family wins. ✨',
    links: ['thrive.app/anthony', 'YouTube', '+2 more'],
    tags: ['Coaching']
  });
  const [showSearch, setShowSearch] = useState(false);


  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // 🎯 Customizable Routine System State
  const [showRoutineCustomizer, setShowRoutineCustomizer] = useState(false);
  const [selectedRoutines, setSelectedRoutines] = useState([
    'meal_prepping', 'fitness_goals', 'mindset_tools' // Default 3 selections
  ]);
  
  // 🛠️ User Customization State
  const [showRoutineEditor, setShowRoutineEditor] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState(null);
  const [showDetailedSteps, setShowDetailedSteps] = useState({});
  const [showTaskStarter, setShowTaskStarter] = useState(null);
  const [userCustomizations, setUserCustomizations] = useState({
    // Users can customize content for each routine
    meal_prepping: {
      customDetails: [],
      customTasks: [],
    },
    fitness_goals: {
      customDetails: [],
      customTasks: [],
    },
    mindset_tools: {
      customDetails: [],
      customTasks: [],
    }
  });

  // Available routine categories with extensive details
  const routineCategories = {
    meal_prepping: {
      id: 'meal_prepping',
      title: 'Meal Prepping Mastery',
      icon: '🍱',
      color: '#4CAF50',
      description: 'Complete meal preparation system for optimal nutrition and time management',
      details: [
        {
          title: 'Weekly meal planning strategy with macro calculations',
          steps: [
            '1. Calculate your daily caloric needs based on age, weight, activity level',
            '2. Set macro ratios (typically 40% carbs, 30% protein, 30% fats)',
            '3. Plan 5-7 days of meals focusing on variety and nutrient density',
            '4. Use a food tracking app to verify macro targets',
            '5. Create a visual meal calendar for the week',
            '6. Prep ingredient lists based on planned meals'
          ]
        },
        {
          title: 'Batch cooking techniques for proteins, grains, and vegetables',
          steps: [
            '1. Choose 2-3 protein sources (chicken, fish, tofu, beans)',
            '2. Season proteins with different spice blends for variety',
            '3. Cook grains in large batches (rice, quinoa, pasta)',
            '4. Roast mixed vegetables at 400°F for 20-25 minutes',
            '5. Use sheet pans and slow cookers for hands-off cooking',
            '6. Cool completely before storing in portioned containers'
          ]
        },
        {
          title: 'Container organization system for portion control',
          steps: [
            '1. Invest in glass containers with compartments',
            '2. Use the plate method: 1/2 vegetables, 1/4 protein, 1/4 complex carbs',
            '3. Label containers with contents and date prepared',
            '4. Stack containers efficiently in refrigerator',
            '5. Keep healthy snacks in grab-and-go portions',
            '6. Use clear containers to easily see meal options'
          ]
        },
        {
          title: 'Shopping list optimization and budget-friendly selections',
          steps: [
            '1. Shop the perimeter first (fresh produce, proteins, dairy)',
            '2. Buy seasonal vegetables and fruits for best prices',
            '3. Compare unit prices rather than package prices',
            '4. Use store loyalty programs and digital coupons',
            '5. Buy proteins in bulk and freeze portions',
            '6. Choose generic brands for pantry staples'
          ]
        },
        {
          title: 'Food safety and storage guidelines for maximum freshness',
          steps: [
            '1. Cool cooked foods within 2 hours of preparation',
            '2. Store proteins and dairy at 40°F or below',
            '3. Use prepared meals within 3-4 days for optimal quality',
            '4. Freeze meals if storing longer than 4 days',
            '5. Reheat foods to 165°F internal temperature',
            '6. Practice FIFO: First In, First Out rotation system'
          ]
        },
        {
          title: 'Quick assembly recipes for busy weekdays',
          steps: [
            '1. Create template meals with interchangeable components',
            '2. Prep sauce bases that work with multiple proteins',
            '3. Keep emergency meals that assemble in under 5 minutes',
            '4. Use pre-cut vegetables when time is limited',
            '5. Master 3-4 go-to combinations you can make blindfolded',
            '6. Keep backup options like healthy frozen meals available'
          ]
        }
      ],
      tasks: [
        {
          name: 'Sunday Meal Prep Session',
          duration: '2 hours',
          type: 'preparation',
          difficulty: 'medium',
          steps: [
            'Plan weekly meals and create shopping list',
            'Grocery shopping with focus on whole foods',
            'Batch cook proteins (chicken, fish, tofu)',
            'Prepare grain bases (rice, quinoa, pasta)',
            'Chop and roast vegetables for easy assembly',
            'Portion meals into containers with balanced macros'
          ]
        },
        {
          name: 'Daily Meal Assembly',
          duration: '10 minutes',
          type: 'execution',
          difficulty: 'easy'
        }
      ]
    },
    fitness_goals: {
      id: 'fitness_goals',
      title: 'Daily Fitness Routine',
      icon: '💪',
      color: '#FF5722',
      description: 'Comprehensive fitness system for strength, cardio, and recovery',
      details: [
        {
          title: 'Progressive strength training with compound movements',
          steps: [
            '1. Master bodyweight versions first (squats, push-ups, planks)',
            '2. Learn proper form with light weights or resistance bands',
            '3. Focus on compound exercises: squats, deadlifts, presses, rows',
            '4. Increase weight by 2.5-5lbs when you can complete all sets easily',
            '5. Track workouts to ensure progressive overload',
            '6. Rest 48-72 hours between training same muscle groups'
          ]
        },
        {
          title: 'High-intensity interval training (HIIT) protocols',
          steps: [
            '1. Start with 1:2 work-to-rest ratio (30 sec work, 60 sec rest)',
            '2. Choose exercises that engage multiple muscle groups',
            '3. Begin with 10-15 minutes total including warm-up/cool-down',
            '4. Progress to 1:1 ratio as fitness improves',
            '5. Limit HIIT to 2-3 sessions per week maximum',
            '6. Monitor heart rate to ensure proper intensity zones'
          ]
        },
        {
          title: 'Mobility and flexibility sessions for injury prevention',
          steps: [
            '1. Perform dynamic warm-up before any workout (5-10 minutes)',
            '2. Include static stretching post-workout when muscles are warm',
            '3. Address common tight areas: hips, shoulders, thoracic spine',
            '4. Use foam rolling 2-3 times per week for muscle maintenance',
            '5. Practice deep breathing during stretching for relaxation',
            '6. Hold static stretches for 30-60 seconds per muscle group'
          ]
        },
        {
          title: 'Active recovery techniques and rest day activities',
          steps: [
            '1. Take light walks or easy bike rides on rest days',
            '2. Practice yoga or gentle stretching routines',
            '3. Use massage tools or self-massage techniques',
            '4. Focus on sleep quality and stress management',
            '5. Stay hydrated and eat nutrient-dense recovery foods',
            '6. Listen to your body and adjust intensity accordingly'
          ]
        },
        {
          title: 'Nutrition timing around workouts for optimal performance',
          steps: [
            '1. Eat balanced meal 2-3 hours before workout',
            '2. Have light snack 30-60 minutes pre-workout if needed',
            '3. Focus on easily digestible carbs before training',
            '4. Consume protein within 30 minutes post-workout',
            '5. Rehydrate with water during and after exercise',
            '6. Plan larger meals around your training schedule'
          ]
        },
        {
          title: 'Progress tracking and goal adjustment strategies',
          steps: [
            '1. Take baseline measurements and photos',
            '2. Log workouts with weights, reps, and sets',
            '3. Track subjective measures: energy, sleep, mood',
            '4. Reassess goals every 4-6 weeks',
            '5. Celebrate small wins and milestone achievements',
            '6. Adjust program based on progress and life changes'
          ]
        }
      ],
      tasks: [
        {
          name: 'Morning Strength Session',
          duration: '45 minutes',
          type: 'workout',
          difficulty: 'hard',
          steps: [
            '5-minute dynamic warm-up',
            'Compound movements: squats, deadlifts, presses',
            'Accessory exercises targeting weak points',
            'Core strengthening circuit',
            '10-minute cool-down and stretching'
          ]
        },
        {
          name: 'Evening Cardio & Mobility',
          duration: '30 minutes',
          type: 'recovery',
          difficulty: 'easy'
        }
      ]
    },
    mindset_tools: {
      id: 'mindset_tools',
      title: 'Mindset & Mental Wellness',
      icon: '🧠',
      color: '#9C27B0',
      description: 'Mental wellness toolkit for anxiety management and emotional grounding',
      details: [
        {
          title: 'Daily mindfulness and meditation practices',
          steps: [
            '1. Start with just 5 minutes of focused breathing daily',
            '2. Use guided meditation apps or videos for structure',
            '3. Find a consistent time and quiet space for practice',
            '4. Focus on observing thoughts without judgment',
            '5. Gradually increase session length as comfort grows',
            '6. Try different styles: body scan, loving-kindness, walking meditation'
          ]
        },
        {
          title: 'Cognitive behavioral therapy (CBT) techniques',
          steps: [
            '1. Identify negative thought patterns and triggers',
            '2. Challenge thoughts with evidence-based questions',
            '3. Practice thought replacement with realistic alternatives',
            '4. Use the ABC model: Antecedent, Behavior, Consequence',
            '5. Keep a thought diary to track patterns over time',
            '6. Implement behavioral experiments to test assumptions'
          ]
        },
        {
          title: 'Breathing exercises for anxiety and stress relief',
          steps: [
            '1. Practice 4-7-8 breathing: inhale 4, hold 7, exhale 8',
            '2. Use box breathing: 4 counts in, hold 4, out 4, hold 4',
            '3. Try diaphragmatic breathing with hand on chest and belly',
            '4. Practice coherent breathing: 5 seconds in, 5 seconds out',
            '5. Use breath work during stressful moments as anchor',
            '6. Combine with progressive muscle relaxation for deeper effect'
          ]
        },
        {
          title: 'Gratitude journaling and positive mindset cultivation',
          steps: [
            '1. Write 3 specific things you\'re grateful for each morning',
            '2. Include why each item is meaningful to you',
            '3. Notice small positive moments throughout the day',
            '4. Practice gratitude for challenges as growth opportunities',
            '5. Share appreciation with others through words or actions',
            '6. Review past entries during difficult times for perspective'
          ]
        },
        {
          title: 'Boundary setting and healthy relationship management',
          steps: [
            '1. Identify your personal values and non-negotiables',
            '2. Communicate boundaries clearly and consistently',
            '3. Practice saying "no" without over-explaining or apologizing',
            '4. Recognize boundary violations and address them promptly',
            '5. Surround yourself with people who respect your limits',
            '6. Regularly reassess and adjust boundaries as needed'
          ]
        },
        {
          title: 'Sleep hygiene and relaxation protocols',
          steps: [
            '1. Establish consistent sleep and wake times, even on weekends',
            '2. Create a relaxing bedtime routine 1 hour before sleep',
            '3. Limit screens and blue light 2 hours before bedtime',
            '4. Keep bedroom cool, dark, and quiet for optimal rest',
            '5. Avoid caffeine after 2 PM and large meals before bed',
            '6. Use relaxation techniques if mind is racing at bedtime'
          ]
        }
      ],
      tasks: [
        {
          name: 'Morning Mindfulness Routine',
          duration: '15 minutes',
          type: 'meditation',
          difficulty: 'easy',
          steps: [
            '5 minutes of deep breathing exercises',
            'Guided meditation or mindfulness practice',
            'Set positive intentions for the day',
            'Gratitude reflection (3 things)'
          ]
        },
        {
          name: 'Evening Wind-Down Protocol',
          duration: '20 minutes',
          type: 'relaxation',
          difficulty: 'easy'
        }
      ]
    },
    productivity_systems: {
      id: 'productivity_systems',
      title: 'Productivity Systems',
      icon: '⚡',
      color: '#2196F3',
      description: 'Optimize focus, time management, and goal achievement',
      details: [
        {
          title: 'Time-blocking and calendar management strategies',
          steps: [
            '1. Audit current time usage for one week to identify patterns',
            '2. Block time for deep work during your peak energy hours',
            '3. Batch similar tasks together to minimize context switching',
            '4. Schedule buffer time between meetings and commitments',
            '5. Use calendar blocking for personal time and self-care',
            '6. Review and adjust time blocks weekly based on effectiveness'
          ]
        },
        {
          title: 'Task prioritization using Eisenhower Matrix',
          steps: [
            '1. List all tasks and categorize: Urgent/Important, Important/Not Urgent, etc.',
            '2. Focus 80% of energy on Important/Not Urgent quadrant',
            '3. Delegate or eliminate tasks that are Neither Important nor Urgent',
            '4. Handle Urgent/Important items immediately but investigate root causes',
            '5. Schedule Important/Not Urgent tasks before they become urgent',
            '6. Regularly review priorities as circumstances change'
          ]
        }
      ]
    },
    sleep_optimization: {
      id: 'sleep_optimization',
      title: 'Sleep Optimization',
      icon: '😴',
      color: '#673AB7',
      description: 'Master sleep quality for recovery and cognitive performance',
      details: [
        'Sleep hygiene principles and bedroom optimization',
        'Circadian rhythm regulation techniques',
        'Pre-sleep routines for better sleep onset',
        'Morning light exposure and wake-up strategies',
        'Nutrition and supplement timing for sleep',
        'Sleep tracking and pattern analysis'
      ]
    },
    stress_management: {
      id: 'stress_management',
      title: 'Stress Management',
      icon: '🌿',
      color: '#4CAF50',
      description: 'Comprehensive stress reduction and resilience building',
      details: [
        'Stress identification and trigger awareness',
        'Progressive muscle relaxation techniques',
        'Time management for work-life balance',
        'Social support system development',
        'Healthy coping mechanisms and habits',
        'Emergency stress relief protocols'
      ]
    }
  };
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTutorials, setShowTutorials] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [showPhotoEdit, setShowPhotoEdit] = useState(false);
  
  // Personal messaging states
  const [showPersonalChat, setShowPersonalChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [personalChatHistory, setPersonalChatHistory] = useState([
    {
      id: 1,
      text: "Hi! Welcome to THRIVE! 👋",
      sender: 'user',
      timestamp: new Date(Date.now() - 10000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isCurrentUser: false
    }
  ]);
  
  // Challenge task walkthrough states
  const [showChallengeWalkthrough, setShowChallengeWalkthrough] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [currentTaskStep, setCurrentTaskStep] = useState(0);
  const [challengeCompletedTasks, setChallengeCompletedTasks] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  
  // Social Features Data
  const [followers] = useState([
    { id: 1, name: 'Sarah Wilson', username: '@sarah_fit', avatar: 'SW', verified: true, following: false },
    { id: 2, name: 'Mike Chen', username: '@miketrains', avatar: 'MC', verified: false, following: true },
    { id: 3, name: 'Emma Rodriguez', username: '@emma_wellness', avatar: 'ER', verified: true, following: false },
    { id: 4, name: 'Alex Johnson', username: '@alexthrive', avatar: 'AJ', verified: false, following: true },
    { id: 5, name: 'Jessica Lee', username: '@jess_mindful', avatar: 'JL', verified: true, following: false }
  ]);
  
  // Removed photo management state variables - not needed in profile
  
  // 🔔 Comprehensive Notification System
  const [notifications, setNotifications] = useState([
    // Sample notifications for demonstration
    {
      id: 1,
      type: 'profile_interaction',
      title: 'New Follower',
      message: 'Sarah M. started following you',
      timestamp: new Date(Date.now() - 30 * 60000), // 30 mins ago
      read: false,
      icon: '👥'
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      message: 'Mike sent you a message about your workout routine',
      timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
      read: false,
      icon: '💬'
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Goal Completed!',
      message: 'Congratulations! You completed your daily workout streak',
      timestamp: new Date(Date.now() - 4 * 60 * 60000), // 4 hours ago
      read: false,
      icon: '🏆'
    },
    {
      id: 4,
      type: 'question',
      title: 'New Question',
      message: 'Sarah M. asked: "What\'s your favorite pre-workout meal?"',
      timestamp: new Date(Date.now() - 6 * 60 * 60000), // 6 hours ago
      read: false,
      icon: '❓'
    }
  ]);
  // Removed photo-related state variables
  
  // Follow System State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(4200); // 4.2k initial count
  const [followingCount, setFollowingCount] = useState(310);
  
  // Q&A System State
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [incomingQuestions, setIncomingQuestions] = useState([
    {
      id: 1,
      question: "What's your favorite pre-workout meal?",
      asker: "Sarah M.",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      isAnswered: false,
      answer: null
    },
    {
      id: 2,
      question: "How do you stay motivated on tough days?",
      asker: "Mike R.",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      isAnswered: true,
      answer: "I focus on small wins and remember my 'why'. Even 10 minutes of movement counts! 💪"
    },
    {
      id: 3,
      question: "Can you share your marathon training schedule?",
      asker: "Emma L.",
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      isAnswered: false,
      answer: null
    }
  ]);
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionAnswer, setQuestionAnswer] = useState('');
  
  const [messages] = useState([
    { id: 1, sender: 'Sarah Wilson', message: 'Great workout today! 💪', time: '2m ago', avatar: 'SW', unread: true },
    { id: 2, sender: 'Mike Chen', message: 'Want to join my morning run?', time: '1h ago', avatar: 'MC', unread: false },
    { id: 3, sender: 'Emma Rodriguez', message: 'Thanks for the meal prep tips!', time: '3h ago', avatar: 'ER', unread: false }
  ]);
  
  const [challenges] = useState([
    { 
      id: 1, 
      title: '30-Day Fitness Challenge', 
      description: 'Complete daily workouts for 30 days', 
      participants: 1247, 
      difficulty: 'Intermediate', 
      duration: '30 days', 
      category: 'fitness',
      tasks: [
        { id: 1, title: 'Warm-up Stretch', description: '5-minute full body stretch routine', duration: '5 min', type: 'exercise' },
        { id: 2, title: 'Cardio Workout', description: '15 minutes of cardio (running, cycling, or jumping jacks)', duration: '15 min', type: 'exercise' },
        { id: 3, title: 'Strength Training', description: '20 minutes of bodyweight exercises (push-ups, squats, lunges)', duration: '20 min', type: 'exercise' },
        { id: 4, title: 'Cool Down', description: '10-minute relaxation and breathing exercises', duration: '10 min', type: 'recovery' },
        { id: 5, title: 'Log Progress', description: 'Record your workout completion and how you feel', duration: '2 min', type: 'tracking' }
      ]
    },
    { 
      id: 2, 
      title: 'Mindful Meditation', 
      description: '10 minutes of daily meditation', 
      participants: 856, 
      difficulty: 'Beginner', 
      duration: '21 days', 
      category: 'mental',
      tasks: [
        { id: 1, title: 'Find Quiet Space', description: 'Find a comfortable, quiet place to sit', duration: '1 min', type: 'preparation' },
        { id: 2, title: 'Breathing Focus', description: 'Focus on your breath for 3 minutes', duration: '3 min', type: 'meditation' },
        { id: 3, title: 'Body Scan', description: 'Scan your body from head to toe, releasing tension', duration: '4 min', type: 'meditation' },
        { id: 4, title: 'Gratitude Practice', description: 'Think of 3 things you are grateful for', duration: '2 min', type: 'reflection' }
      ]
    },
    { 
      id: 3, 
      title: 'Healthy Eating Habits', 
      description: 'Track nutrition and meal prep', 
      participants: 2103, 
      difficulty: 'Beginner', 
      duration: '14 days', 
      category: 'nutrition',
      tasks: [
        { id: 1, title: 'Plan Your Meals', description: 'Choose 3 healthy meals and 2 snacks for the day', duration: '10 min', type: 'planning' },
        { id: 2, title: 'Prep Ingredients', description: 'Wash, chop, and prepare ingredients for your meals', duration: '15 min', type: 'preparation' },
        { id: 3, title: 'Cook Mindfully', description: 'Prepare your meals with attention and care', duration: '30 min', type: 'cooking' },
        { id: 4, title: 'Track Intake', description: 'Log your meals and water consumption', duration: '5 min', type: 'tracking' }
      ]
    }
  ]);
  
  // Short-term goals (week view) - daily/weekly targets
  const [shortTermGoals] = useState([
    {
      id: 1,
      title: 'WATER',
      icon: '💧',
      currentValue: 6,
      targetValue: 8,
      unit: 'cups',
      color: '#2196F3', // Blue
      progress: 75,
      timeframe: 'today'
    },
    {
      id: 2,
      title: 'WORKOUTS',
      icon: '💪',
      currentValue: 3,
      targetValue: 5,
      unit: 'sessions',
      color: '#4CAF50', // Green
      progress: 60,
      timeframe: 'this week'
    },
    {
      id: 3,
      title: 'CALORIES',
      icon: '🔥',
      currentValue: 1850,
      targetValue: 2000,
      unit: 'kcal',
      color: '#FF5722', // Red-Orange
      progress: 92,
      timeframe: 'today'
    }
  ]);

  // Long-term goals (month view) - monthly/quarterly targets
  const [longTermGoals] = useState([
    {
      id: 1,
      title: 'WEIGHT',
      icon: '⚖️',
      currentValue: 2.3,
      targetValue: 5.0,
      unit: 'lbs lost',
      color: '#9C27B0', // Purple
      progress: 46,
      timeframe: 'this month'
    },
    {
      id: 2,
      title: 'MEDITATION',
      icon: '🧘',
      currentValue: 12,
      targetValue: 30,
      unit: 'days',
      color: '#3F51B5', // Indigo
      progress: 40,
      timeframe: 'this month'
    },
    {
      id: 3,
      title: 'BOOKS',
      icon: '📚',
      currentValue: 1,
      targetValue: 3,
      unit: 'books',
      color: '#795548', // Brown
      progress: 33,
      timeframe: 'this month'
    }
  ]);

  // Get current goals based on date range
  const getCurrentGoals = () => {
    return dateRange === 'week' ? shortTermGoals : longTermGoals;
  };

  // Initialize dashboard with mock data (will be replaced with real data later)
  const initializeDashboardData = () => {
    const currentWeight = parseFloat(profileData.weight) || 150;
    const goalWeight = currentWeight - 10; // Mock goal: lose 10 lbs
    const weightLost = currentWeight - goalWeight;
    const progress = Math.min((weightLost / 10) * 100, 100); // Progress towards goal
    
    setDashboardData({
      weight: {
        current: currentWeight,
        goal: goalWeight,
        trend: 'down', // losing weight is good
        progress: Math.max(0, progress)
      },
      goalProgress: {
        type: profileData.mainGoal || 'Weight Loss',
        percentage: Math.max(0, progress),
        achieved: Math.max(0, weightLost),
        target: 10,
        trend: 'up'
      },
      todayTasks: {
        completed: 2,
        total: 4,
        tasks: ['Weigh-in ✅', 'Workout ⏳', 'Water ⏳', 'Log meals ⏳'],
        trend: 'neutral'
      },
      streakCounter: {
        current: 12,
        type: 'Daily Logging',
        trend: 'up',
        progress: 80
      }
    });
  };

  // Load profile data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('thriveProfileData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setProfileData(parsed);
      } catch (error) {
        console.log('Error loading profile data:', error);
      }
    }
    
    // Load initial calendar sync status
    loadCalendarSyncStatus();
  }, []);

  // Save profile data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('thriveProfileData', JSON.stringify(profileData));
  }, [profileData]);
  
  // Calendar sync functions
  const loadCalendarSyncStatus = async () => {
    try {
      const status = calendarService.getSyncStatus();
      setSyncStatus(status);
      
      if (status.isEnabled) {
        await loadSyncedEvents();
      }
    } catch (error) {
      console.error('Error loading calendar sync status:', error);
    }
  };
  
  const loadSyncedEvents = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // 1 week ago
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14); // 2 weeks future
      
      const events = await calendarService.getDeviceEvents(startDate, endDate);
      setSyncedEvents(events);
    } catch (error) {
      console.error('Error loading synced events:', error);
    }
  };
  
  const handleCalendarSync = async () => {
    try {
      // Set sync status to in progress
      setSyncStatus(prev => ({ ...prev, syncInProgress: true, errors: [] }));
      
      console.log('🔄 Starting calendar sync...');
      
      // Request permissions first
      const hasPermission = await calendarService.requestCalendarPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permission not granted. Please enable calendar access in your device settings.');
      }
      
      // Perform the sync
      await calendarService.syncCalendars();
      
      // Reload events
      await loadSyncedEvents();
      
      // Update sync status
      const newStatus = calendarService.getSyncStatus();
      setSyncStatus(newStatus);
      
      // Show success message
      const eventCount = getCombinedEvents().length;
      console.log(`✅ Sync complete: ${eventCount} events loaded`);
      Alert.alert(
        'Sync Complete! 🎉', 
        `Successfully synchronized your calendar.\n\nFound ${eventCount} events across your calendars.`,
        [{ text: 'Great!', style: 'default' }]
      );
      
    } catch (error) {
      console.error('❌ Sync error:', error);
      setSyncStatus(prev => ({ 
        ...prev, 
        syncInProgress: false, 
        errors: [String(error)] 
      }));
      
      Alert.alert(
        'Sync Error', 
        error instanceof Error ? error.message : 'There was an error syncing your calendar. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => handleCalendarSync() }
        ]
      );
    }
  };
  
  const createThriveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      const success = await calendarService.createDeviceEvent(eventData as CalendarEvent);
      if (success) {
        await loadSyncedEvents();
        Alert.alert('Event Created', 'Your THRIVE event has been added to your calendar.');
      } else {
        Alert.alert('Error', 'Could not create calendar event.');
      }
    } catch (error) {
      Alert.alert('Error', 'There was an error creating the event.');
    }
  };
  
  const handleEventCreation = async (formData: EventFormData) => {
    console.log('🎯 handleEventCreation called with:', formData);
    
    try {
      // Create the event data
      const eventData: CalendarEvent = {
        id: `thrive-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        allDay: formData.isAllDay,
        category: formData.category,
        isThrive: true,
        lastModified: new Date(),
      };
      
      console.log('📝 Created event data:', eventData);
      
      // Add to local events list immediately (this ensures it appears right away)
      setSyncedEvents(prev => {
        const newEvents = [...prev, eventData];
        console.log('📋 Updated synced events:', newEvents);
        return newEvents.sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      });
      
      console.log('✅ Event added to local list');
      
      // Try to sync with device calendar in background (don't fail if this doesn't work)
      try {
        console.log('🔄 Attempting device calendar sync...');
        const success = await calendarService.createDeviceEvent(eventData);
        if (success) {
          console.log('✅ Device calendar sync successful');
        } else {
          console.log('⚠️ Device calendar sync failed but continuing');
        }
      } catch (syncError) {
        console.warn('⚠️ Device calendar sync error (continuing anyway):', syncError);
      }
      
      // Show success message
      const categoryName = EVENT_CATEGORIES[formData.category]?.name || 'Event';
      Alert.alert(
        'Event Created! 🎉', 
        `Your ${categoryName} "${formData.title}" has been added to your calendar.`
      );
      
      console.log('🎉 Event creation completed successfully');
      
    } catch (error) {
      console.error('❌ Error in handleEventCreation:', error);
      throw error; // Re-throw to let modal handle it
    }
  };

  // Initialize dashboard data when profile data changes
  useEffect(() => {
    initializeDashboardData();
  }, [profileData.weight, profileData.mainGoal]);

  // Generate mock graph data for different stat types
  const generateGraphData = (type) => {
    const days = dateRange === 'week' ? 7 : 30; // 7 days for week, 30 for month
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      let value;
      if (challengeMode === 'fitness') {
        switch (type) {
          case 'weight':
            const baseWeight = parseFloat(profileData.weight) || 150;
            const trend = (days - i) * 0.3;
            const fluctuation = (Math.random() - 0.5) * 2;
            value = Math.max(baseWeight - trend + fluctuation, baseWeight - 10);
            break;
          case 'goal':
            value = Math.min((days - i) * 10 + Math.random() * 15, 100);
            break;
          case 'tasks':
            value = Math.floor(Math.random() * 5);
            break;
          case 'streak':
            value = Math.max(0, days - i + Math.floor(Math.random() * 3));
            break;
          default:
            value = Math.random() * 100;
        }
      } else {
        // Mental challenges data
        switch (type) {
          case 'mindfulness':
            value = Math.floor(Math.random() * 25) + 5; // 5-30 minutes
            break;
          case 'mood':
            value = Math.floor(Math.random() * 4) + 6; // 6-10 mood scale
            break;
          case 'learning':
            value = Math.floor(Math.random() * 4); // 0-3 articles/pages
            break;
          case 'gratitude':
            value = Math.floor(Math.random() * 4) + 1; // 1-4 gratitude entries
            break;
          default:
            value = Math.random() * 100;
        }
      }
      
      data.push({
        date: dateRange === 'week' 
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(value * 10) / 10
      });
    }
    
    return data;
  };

  // Get graph info
  const getGraphInfo = (type) => {
    if (challengeMode === 'fitness') {
      switch (type) {
        case 'weight':
          return { title: 'Weight Progress', unit: 'lbs', color: '#34C759' };
        case 'goal':
          return { title: 'Goal Achievement', unit: '%', color: '#2196F3' };
        case 'tasks':
          return { title: 'Daily Tasks', unit: ' tasks', color: '#FF9800' };
        case 'streak':
          return { title: 'Logging Streak', unit: ' days', color: '#9C27B0' };
        default:
          return { title: 'Progress', unit: '', color: '#666' };
      }
    } else {
      switch (type) {
        case 'mindfulness':
          return { title: 'Mindfulness Progress', unit: ' min', color: '#34C759' };
        case 'mood':
          return { title: 'Mood Tracking', unit: '/10', color: '#2196F3' };
        case 'learning':
          return { title: 'Learning Progress', unit: ' items', color: '#FF9800' };
        case 'gratitude':
          return { title: 'Gratitude Practice', unit: ' entries', color: '#9C27B0' };
        default:
          return { title: 'Progress', unit: '', color: '#666' };
      }
    }
  };

  // Animate card opening
  const animateCardOpen = (cardType) => {
    if (isAnimating) return;
    
    console.log(`Animating card open for: ${cardType}`);
    setIsAnimating(true);
    setCardJustOpened(true);
    
    // Start the animations in parallel
    Animated.parallel([
      // Shrink the grid cards
      Animated.timing(cardScale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
      // Grow the expanded card
      Animated.timing(expandedCardScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(expandedCardOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animation complete
      setIsAnimating(false);
      setTimeout(() => {
        setCardJustOpened(false);
      }, 300);
    });
    
    // Set the card states
    setSelectedCard(cardType);
    setGraphType(cardType);
    setShowGraph(true);
    setDashboardView('graph');
  };

  // Close graph view with smooth animation
  const closeGraphView = () => {
    // Prevent immediate closing if card was just opened
    if (cardJustOpened || isAnimating) {
      return;
    }
    
    console.log('Animating card close');
    setIsAnimating(true);
    setCardJustOpened(true);
    setCardsDisabled(true);
    
    // Start the reverse animations
    Animated.parallel([
      // Restore the grid cards
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Shrink the expanded card
      Animated.timing(expandedCardScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(expandedCardOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animation complete - reset states
      setShowGraph(false);
      setDashboardView('overview');
      setGraphType(null);
      setSelectedCard(null);
      setIsAnimating(false);
      
      // Re-enable card interactions after animation
      setTimeout(() => {
        setCardJustOpened(false);
        setCardsDisabled(false);
      }, 100);
    });
  };

  // 🎯 TASK EXECUTION FUNCTIONS
  
  // Start individual task with adaptive UI
  const startTask = (task, routineContext = null) => {
    setActiveTask({
      ...task,
      routineContext,
      startTime: new Date(),
      totalDuration: parseDuration(task.duration)
    });
    setTaskTimer(0);
    setTaskProgress(0);
    setIsTaskRunning(true);
  };
  
  // Parse duration string to seconds
  const parseDuration = (durationStr) => {
    const match = durationStr.match(/(\d+)\s*min/);
    return match ? parseInt(match[1]) * 60 : 60; // Default 1 minute
  };
  
  // Complete current task
  const completeTask = () => {
    if (activeTask) {
      const newCompleted = [...completedTasks, `${activeTask.name}_${Date.now()}`];
      setCompletedTasks(newCompleted);
      
      Alert.alert(
        '🎉 Task Complete!',
        `Great job completing "${activeTask.name}"!`,
        [
          {
            text: 'Continue',
            onPress: () => {
              setActiveTask(null);
              setIsTaskRunning(false);
              setTaskTimer(0);
              setTaskProgress(0);
            }
          }
        ]
      );
    }
  };
  
  // Get task-specific UI configuration
  const getTaskUIConfig = (taskType) => {
    switch (taskType) {
      case 'Movement':
      case 'Exercise':
        return {
          primaryColor: '#FF6B35',
          icon: '🏃‍♂️',
          title: 'Get Moving',
          timerLabel: 'Exercise Time',
          completionAction: 'Finish Workout'
        };
      case 'Wellness':
      case 'Mindfulness':
        return {
          primaryColor: '#6B73FF',
          icon: '🧘‍♀️',
          title: 'Mindful Moment',
          timerLabel: 'Meditation Time',
          completionAction: 'Complete Session'
        };
      case 'Nutrition':
        return {
          primaryColor: '#4ECDC4',
          icon: '🥗',
          title: 'Nourish Yourself',
          timerLabel: 'Meal Time',
          completionAction: 'Mark as Done'
        };
      case 'Planning':
        return {
          primaryColor: '#45B7D1',
          icon: '📋',
          title: 'Plan & Organize',
          timerLabel: 'Planning Time',
          completionAction: 'Save Progress'
        };
      case 'Mindset':
        return {
          primaryColor: '#96CEB4',
          icon: '💭',
          title: 'Mindset Work',
          timerLabel: 'Reflection Time',
          completionAction: 'Complete Reflection'
        };
      case 'Habit':
        return {
          primaryColor: '#FECA57',
          icon: '⭐',
          title: 'Build Habit',
          timerLabel: 'Habit Time',
          completionAction: 'Mark Complete'
        };
      default:
        return {
          primaryColor: THRIVE_COLORS.primary,
          icon: '✨',
          title: 'Focus Time',
          timerLabel: 'Activity Time',
          completionAction: 'Complete Task'
        };
    }
  };

  // Get current challenge data based on mode
  const getCurrentChallengeData = () => {
    return challengeMode === 'fitness' ? dashboardData : mentalData;
  };

  // Get card info based on mode and type
  const getCardInfo = (type) => {
    if (challengeMode === 'fitness') {
      switch (type) {
        case 'weight': return { title: 'WEIGHT', icon: '⚖️', color: '#34C759' };
        case 'goal': return { title: 'PROGRESS', icon: '🎯', color: '#2196F3' };
        case 'tasks': return { title: 'TODAY', icon: '✅', color: '#FF9800' };
        case 'streak': return { title: 'STREAK', icon: '🔥', color: '#9C27B0' };
      }
    } else {
      switch (type) {
        case 'mindfulness': return { title: 'MINDFUL', icon: '🧘', color: '#D32F2F' }; // Red
        case 'mood': return { title: 'MOOD', icon: '😊', color: '#7B1FA2' }; // Deep Purple
        case 'learning': return { title: 'LEARN', icon: '📚', color: '#F57C00' }; // Deep Orange
        case 'gratitude': return { title: 'GRATITUDE', icon: '🙏', color: '#388E3C' }; // Dark Green
      }
    }
  };

  // Get card types for current mode
  const getCurrentCardTypes = () => {
    return challengeMode === 'fitness' 
      ? ['weight', 'goal', 'tasks', 'streak'] 
      : ['mindfulness', 'mood', 'learning', 'gratitude'];
  };

  // Get card data for specific type and mode
  const getCardData = (type) => {
    const data = challengeMode === 'fitness' ? dashboardData : mentalData;
    return data[type] || {};
  };

  // Get dynamic card display value based on date range
  const getCardDisplayValue = (type) => {
    const data = getCardData(type);
    const graphData = generateGraphData(type);
    
    if (challengeMode === 'fitness') {
      switch (type) {
        case 'weight': 
          const latestWeight = graphData[graphData.length - 1]?.value || data.current || 150;
          return `${Math.round(latestWeight)}`;
        case 'goal': 
          const avgProgress = graphData.reduce((sum, point) => sum + point.value, 0) / graphData.length;
          return `${Math.round(avgProgress)}%`;
        case 'tasks': 
          const totalCompleted = graphData.reduce((sum, point) => sum + point.value, 0);
          const maxTasks = dateRange === 'week' ? 28 : 120;
          return `${Math.round(totalCompleted)}/${maxTasks}`;
        case 'streak':
          const currentStreak = graphData[graphData.length - 1]?.value || data.current || 0;
          return `${Math.round(currentStreak)}`;
      }
    } else {
      switch (type) {
        case 'mindfulness':
          const totalMinutes = graphData.reduce((sum, point) => sum + point.value, 0);
          return `${Math.round(totalMinutes)}`;
        case 'mood':
          const avgMood = graphData.reduce((sum, point) => sum + point.value, 0) / graphData.length;
          return `${Math.round(avgMood * 10) / 10}`;
        case 'learning':
          const totalLearning = graphData.reduce((sum, point) => sum + point.value, 0);
          const maxLearning = dateRange === 'week' ? 21 : 90;
          return `${Math.round(totalLearning)}/${maxLearning}`;
        case 'gratitude':
          const totalEntries = graphData.reduce((sum, point) => sum + point.value, 0);
          return `${Math.round(totalEntries)}`;
      }
    }
  };

  // Get dynamic card subtitle based on date range
  const getCardSubtitle = (type) => {
    const data = getCardData(type);
    if (challengeMode === 'fitness') {
      switch (type) {
        case 'weight': return `Goal: ${data.goal || 145} lbs`;
        case 'goal': return data.type || 'Weight Loss';
        case 'tasks': return `${dateRange === 'week' ? 'Week' : 'Month'} Progress`;
        case 'streak': return 'Days Logging';
      }
    } else {
      switch (type) {
        case 'mindfulness': 
          const targetMinutes = dateRange === 'week' ? 140 : 600;
          return `Goal: ${targetMinutes} min ${dateRange}`;
        case 'mood': 
          return `${dateRange === 'week' ? 'Week' : 'Month'} Average`;
        case 'learning': 
          return `${dateRange === 'week' ? 'Week' : 'Month'} Progress`;
        case 'gratitude': 
          const targetEntries = dateRange === 'week' ? 21 : 90;
          return `Goal: ${targetEntries} entries ${dateRange}`;
      }
    }
  };

  // Get dynamic progress percentage
  const getCardProgressPercentage = (type) => {
    const graphData = generateGraphData(type);
    
    if (challengeMode === 'fitness') {
      switch (type) {
        case 'weight': 
          const avgProgress = graphData.reduce((sum, point) => sum + point.value, 0) / graphData.length;
          return Math.min((avgProgress / 150) * 100, 100);
        case 'goal': 
          const avgGoal = graphData.reduce((sum, point) => sum + point.value, 0) / graphData.length;
          return avgGoal;
        case 'tasks': 
          const totalCompleted = graphData.reduce((sum, point) => sum + point.value, 0);
          const maxTasks = dateRange === 'week' ? 28 : 120;
          return (totalCompleted / maxTasks) * 100;
        case 'streak':
          const currentStreak = graphData[graphData.length - 1]?.value || 0;
          return Math.min((currentStreak / 30) * 100, 100);
      }
    } else {
      switch (type) {
        case 'mindfulness':
          const totalMinutes = graphData.reduce((sum, point) => sum + point.value, 0);
          const targetMinutes = dateRange === 'week' ? 140 : 600;
          return (totalMinutes / targetMinutes) * 100;
        case 'mood':
          const avgMood = graphData.reduce((sum, point) => sum + point.value, 0) / graphData.length;
          return (avgMood / 10) * 100;
        case 'learning':
          const totalLearning = graphData.reduce((sum, point) => sum + point.value, 0);
          const targetLearning = dateRange === 'week' ? 21 : 90;
          return (totalLearning / targetLearning) * 100;
        case 'gratitude':
          const totalEntries = graphData.reduce((sum, point) => sum + point.value, 0);
          const targetEntries = dateRange === 'week' ? 21 : 90;
          return (totalEntries / targetEntries) * 100;
      }
    }
    return 50;
  };
  
  // Combine THRIVE events with synced calendar events
  const getCombinedEvents = () => {
    const thriveEvents = [
      {
        id: 'thrive-1',
        title: 'Healthy Breakfast',
        description: 'Log your morning meal',
        startDate: new Date(new Date().setHours(9, 0, 0, 0)),
        endDate: new Date(new Date().setHours(9, 30, 0, 0)),
        category: 'nutrition' as const,
        isThrive: true
      },
      {
        id: 'thrive-2', 
        title: 'Mindfulness Break',
        description: '10 minute meditation',
        startDate: new Date(new Date().setHours(12, 0, 0, 0)),
        endDate: new Date(new Date().setHours(12, 10, 0, 0)),
        category: 'mental' as const,
        isThrive: true
      },
      {
        id: 'thrive-3',
        title: 'Strength Training', 
        description: 'Upper body workout session',
        startDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // Tomorrow 6 PM
        endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // Tomorrow 7 PM
        category: 'fitness' as const,
        isThrive: true
      }
    ];
    
    // Combine with synced events
    return [...thriveEvents, ...syncedEvents].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  };
  
  // Get category color for events
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness': return '#FF3B30';
      case 'mental': return '#007AFF';
      case 'nutrition': return '#FF9500';
      case 'medical': return '#AF52DE';
      case 'work': return '#5856D6';
      case 'personal': default: return '#8E8E93';
    }
  };
  
  // Get category icon for events
  const getCategoryIcon = (category: string, title: string) => {
    if (title.toLowerCase().includes('breakfast') || title.toLowerCase().includes('meal')) return '🥗';
    if (title.toLowerCase().includes('run')) return '🏃‍♂️';
    if (title.toLowerCase().includes('meditation') || title.toLowerCase().includes('mindfulness')) return '🧘‍♀️';
    if (title.toLowerCase().includes('strength') || title.toLowerCase().includes('gym')) return '💪';
    
    switch (category) {
      case 'fitness': return '💪';
      case 'mental': return '🧘‍♀️';
      case 'nutrition': return '🍎';
      case 'medical': return '🏥';
      case 'work': return '💼';
      case 'personal': default: return '📅';
    }
  };
  
  // Format event time for display
  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Get relative date string
  const getRelativeDateString = (date: Date) => {
    const today = new Date();
    const eventDate = new Date(date);
    
    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1) return `${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    
    return eventDate.toLocaleDateString();
  };

  // Month calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const getMonthCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }
    
    return days;
  };
  
  const getEventsForDate = (date: Date) => {
    if (!date) return [];
    
    return getCombinedEvents().filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Create PanResponder for web-compatible gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Activate pan responder when moving horizontally more than vertically
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderGrant: () => {
      // Store the current translate value when gesture starts
      lastGestureState.current = translateX._value;
    },
    onPanResponderMove: (evt, gestureState) => {
      // Update position based on gesture
      const newValue = lastGestureState.current + gestureState.dx;
      translateX.setValue(newValue);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, vx } = gestureState;
      let newPage = currentPage;
      
      // Determine which page to snap to based on gesture
      if (dx > 50 || vx > 0.5) {
        // Swipe right - go to previous page
        newPage = Math.max(0, currentPage - 1);
      } else if (dx < -50 || vx < -0.5) {
        // Swipe left - go to next page
        newPage = Math.min(4, currentPage + 1);
      }
      
      // Animate to the target page with no bounce
      const targetTranslateX = -newPage * screenWidth;
      
      Animated.timing(translateX, {
        toValue: targetTranslateX,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      setCurrentPage(newPage);
    },
  });

  // Initialize position on component mount
  useEffect(() => {
    translateX.setValue(-screenWidth * 2); // Start at Dashboard page (index 2)
  }, []);

  // Timer effect for active tasks
  useEffect(() => {
    let interval = null;
    if (isTaskRunning && activeTask) {
      interval = setInterval(() => {
        setTaskTimer(prevTimer => {
          const newTimer = prevTimer + 1;
          const progress = (newTimer / activeTask.totalDuration) * 100;
          setTaskProgress(Math.min(progress, 100));
          
          // Auto-complete when timer reaches duration
          if (newTimer >= activeTask.totalDuration) {
            completeTask();
            return 0;
          }
          
          return newTimer;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTaskRunning, activeTask]);

  const pages = ['Calendar', 'Profile', 'Dashboard', 'Goals', 'Social'];

  // Handle page indicator clicks
  const goToPage = (pageIndex: number) => {
    const targetTranslateX = -pageIndex * screenWidth;
    
    Animated.timing(translateX, {
      toValue: targetTranslateX,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setCurrentPage(pageIndex);
  };

  // Toggle menu function
  const toggleMenu = () => {
    const toValue = isMenuOpen ? -260 : 0;
    
    Animated.timing(menuTranslateX, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setIsMenuOpen(!isMenuOpen);
  };



  // Handle field editing with auto-save
  const startEditing = (fieldName, currentValue) => {
    // Auto-save any currently editing field before switching
    if (editingField && tempValue !== '') {
      setProfileData(prev => ({
        ...prev,
        [editingField]: tempValue
      }));
    }
    
    // Close any open dropdowns when starting to edit a text field
    closeAllDropdowns();
    
    setEditingField(fieldName);
    setTempValue(currentValue || '');
  };

  const saveField = () => {
    if (editingField) {
      setProfileData(prev => ({
        ...prev,
        [editingField]: tempValue
      }));
      setEditingField(null);
      setTempValue('');
    }
  };
  
  // Real-time save as user types (with debounce effect)
  const handleTextChange = (value) => {
    setTempValue(value);
    
    // Auto-save after user stops typing for 500ms
    if (editingField) {
      clearTimeout(window.autoSaveTimeout);
      window.autoSaveTimeout = setTimeout(() => {
        setProfileData(prev => ({
          ...prev,
          [editingField]: value
        }));
      }, 500);
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue('');
  };
  
  // Dropdown handlers with text field auto-save
  const closeAllDropdowns = () => {
    setShowFitnessDropdown(false);
    setShowMainGoalDropdown(false);
  };
  
  const closeAllDropdownsWithAutoSave = () => {
    // Auto-save any currently editing text field
    if (editingField && tempValue !== '') {
      setProfileData(prev => ({
        ...prev,
        [editingField]: tempValue
      }));
      setEditingField(null);
      setTempValue('');
    }
    
    closeAllDropdowns();
  };
  
  const openDropdown = (dropdownType) => {
    // Auto-save any currently editing text field before opening dropdown
    if (editingField && tempValue !== '') {
      setProfileData(prev => ({
        ...prev,
        [editingField]: tempValue
      }));
      setEditingField(null);
      setTempValue('');
    }
    
    // Close all dropdowns first
    closeAllDropdowns();
    
    // Open the requested dropdown
    if (dropdownType === 'fitness') {
      setShowFitnessDropdown(true);
    } else if (dropdownType === 'mainGoal') {
      setShowMainGoalDropdown(true);
    }
  };
  
  const selectFitnessLevel = (level) => {
    setProfileData(prev => ({ ...prev, fitnessLevel: level }));
    setShowFitnessDropdown(false);
  };
  
  const selectMainGoal = (goal) => {
    setProfileData(prev => ({ ...prev, mainGoal: goal }));
    setShowMainGoalDropdown(false);
  };

  // Formatting functions for field display and input
  const formatBirthday = (value) => {
    // Remove non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Add slashes for MM/DD/YY format
    if (cleaned.length >= 2 && cleaned.length < 4) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    } else if (cleaned.length >= 4) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4) + '/' + cleaned.substring(4, 6);
    }
    return cleaned;
  };

  const formatWeight = (value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned + (cleaned ? ' lb' : '');
  };

  const formatHeight = (value) => {
    // Expected format: "5'8" or "5 ft 8 in" 
    const cleaned = value.replace(/[^\d'"\s]/g, '');
    
    // If user enters just numbers, assume feet'inches format
    if (/^\d+$/.test(cleaned) && cleaned.length <= 2) {
      return cleaned + (cleaned ? ' ft' : '');
    } else if (/^\d+'?\d*"?$/.test(cleaned)) {
      // Handle feet'inches format like 5'8 or 5'8"
      return cleaned.includes("'") ? cleaned : cleaned + "'";
    }
    return cleaned;
  };

  const handleFormattedTextChange = (value, fieldName) => {
    let formattedValue = value;
    
    if (fieldName === 'birthday') {
      formattedValue = formatBirthday(value);
    } else if (fieldName === 'weight') {
      formattedValue = value.replace(' lb', ''); // Store without units
    } else if (fieldName === 'height') {
      formattedValue = value.replace(/( ft| in)/g, ''); // Store without units
    }
    
    setTempValue(formattedValue);
    
    // Auto-save after user stops typing for 500ms
    if (editingField) {
      clearTimeout(window.autoSaveTimeout);
      window.autoSaveTimeout = setTimeout(() => {
        setProfileData(prev => ({
          ...prev,
          [editingField]: formattedValue
        }));
      }, 500);
    }
  };

  // Removed photo management functions

  // Removed photo submit function

  // Removed photo pin/delete/display functions

  // Removed attachment handling functions

  // Removed large attachment handling function

  // Removed post submission function

  // 🗑️ DATA MANAGEMENT: Clear all user data for clean state
  const handleClearAllData = () => {
    const confirmed = window.confirm(
      '🗑️ Clear All Data?\n\nThis will remove all your profile info, notifications, routines, customizations, and reset the app to a clean state.\n\nAre you sure?'
    );
    
    if (confirmed) {
      // Clear profile data
      setProfileData({
        name: '',
        weight: '',
        height: '',
        birthday: '',
        fitnessLevel: '',
        mainGoal: '',
        email: '',
        phone: '',
        emergencyContact: '',
        medicalConditions: '',
        allergies: '',
        medications: '',
        bio: ''
      });
      
      // Clear editable profile data
      setEditableProfileData({
        name: '',
        username: '',
        location: '',
        bio: '',
        links: [],
        tags: []
      });
      
      // Clear notifications
      setNotifications([]);
      
      // Reset dashboard data to clean state
      setDashboardData({
        weight: { current: 0, goal: 0, trend: 'neutral', progress: 0 },
        goalProgress: { type: '', percentage: 0, achieved: 0, target: 100 },
        tasksCompleted: { today: 0, total: 0, streak: 0 },
        mindfulnessMins: { today: 0, target: 20, streak: 0, trend: 'up' }
      });
      
      // Reset mental data
      setMentalData({
        currentLevel: 0,
        dailyGoal: 0,
        weeklyStreak: 0,
        progressHistory: [],
        achievements: []
      });
      
      // Clear chat history  
      setPersonalChatHistory([]);
      
      // Clear tasks and challenges
      setCompletedTasks([]);
      setCompletedChallenges([]);
      setChallengeCompletedTasks([]);
      setActiveTask(null);
      setTaskTimer(0);
      setTaskProgress(0);
      setIsTaskRunning(false);
      
      // Reset routine customizations
      setSelectedRoutines([]);
      setUserCustomizations({});
      setExpandedRoutine(null);
      setEditingRoutineId(null);
      setShowDetailedSteps({});
      
      // Clear Q&A data
      setIncomingQuestions([]);
      setSelectedQuestion(null);
      setQuestionAnswer('');
      setNewQuestion('');
      
      // Reset social data  
      setFollowerCount(0);
      setFollowingCount(0);
      setIsFollowing(false);
      
      // Reset form states
      setNewMessage('');
      setEditingField(null);
      setTempValue('');
      
      // Reset UI states and close all modals
      setCurrentPage(2); // Back to dashboard
      setActiveProfileTab(0); // Reset to Overview tab
      setShowAICoach(false);
      setShowNotifications(false);
      setShowProfileSettings(false);
      setShowSearch(false);
      setShowAnalytics(false);
      setShowAchievements(false);
      setShowRoutineCustomizer(false);
      setShowRoutineEditor(false);
      setShowTaskStarter(null);
      setShowPersonalChat(false);
      setShowChallengeWalkthrough(false);
      setShowFollowersList(false);
      setShowFollowingList(false);
      setShowMessaging(false);
      setShowChallengeSelector(false);
      setShowAskQuestion(false);
      setShowQuestionManager(false);
      setIsProfileEditMode(false);
      setEditingCardId(null);
      
      // Reset dashboard view states
      setDashboardView('overview');
      setSelectedCard(null);
      setShowGraph(false);
      setGraphType(null);
      setChallengeMode('fitness');
      setDateRange('week');
      setCalendarView('week');
      
      console.log('🗑️ All user data cleared - complete clean state restored');
      alert('✅ All data cleared! App is now in completely clean state.');
    }
  };

  // 🎭 DATA MANAGEMENT: Add demo data for presentation
  const handleAddDemoData = () => {
    const confirmed = window.confirm(
      '🎭 Add Demo Data?\n\nThis will populate the app with example profile, posts, and notifications for demonstration purposes.\n\nAdd demo data?'
    );
    
    if (confirmed) {
      // Add demo profile data
      setProfileData({
        name: 'Alex Johnson',
        weight: '165',
        height: '5\'8"',
        birthday: '1992-03-15',
        fitnessLevel: 'Intermediate',
        mainGoal: 'Weight Loss',
        email: 'alex.johnson@email.com',
        phone: '(555) 123-4567',
        emergencyContact: 'Sarah Johnson - (555) 987-6543',
        medicalConditions: 'None',
        allergies: 'None',
        medications: 'None',
        bio: 'Wellness enthusiast on a journey to better health and mindfulness. Love hiking, yoga, and healthy cooking! 🌱'
      });
      
      // Demo posts removed - no longer using post system in profile
      
      // Add demo notifications
      const demoNotifications = [
        {
          id: 1,
          type: 'achievement',
          title: '🎉 Week Streak!',
          message: 'You\'ve completed workouts 7 days in a row!',
          timestamp: new Date(Date.now() - 1800000), // 30 min ago
          read: false,
          icon: '🏆'
        },
        {
          id: 2,
          type: 'reminder',
          title: '💧 Hydration Reminder',
          message: 'Don\'t forget to drink water! You\'re at 6/8 glasses today.',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          read: false,
          icon: '💧'
        },
        {
          id: 3,
          type: 'social',
          title: '👥 New Follower',
          message: 'Sarah M. started following your wellness journey!',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          read: true,
          icon: '👤'
        }
      ];
      setNotifications(demoNotifications);
      
      // Add demo chat message
      setPersonalChatHistory([
        {
          id: 1,
          text: "Hi Alex! Welcome to THRIVE! 👋 I'm here to support your wellness journey. How are you feeling about your goals today?",
          sender: 'coach',
          timestamp: new Date(Date.now() - 1800000)
        }
      ]);
      
      console.log('🎭 Demo data added successfully');
      alert('✅ Demo data added! App now shows example content.');
    }
  };

  // 📤 DATA MANAGEMENT: Export all app data to JSON file
  const handleExportData = () => {
    try {
      // Collect all app data
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          profileData,
          editableProfileData,
          notifications,
          selectedRoutines,
          userCustomizations,
          taskProgress,
          completedTasks,
          dateRange,
          calendarView,
          // Add any other state that should be preserved
        }
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create downloadable file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `thrive-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      alert('✅ Data exported successfully! Check your downloads folder.');
      console.log('📤 Data exported successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('❌ Export failed. Please try again.');
    }
  };

  // 📥 DATA MANAGEMENT: Import app data from JSON file
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          // Validate import data structure
          if (!importData.data || !importData.version) {
            throw new Error('Invalid backup file format');
          }
          
          // Confirm import
          const confirmed = window.confirm(
            `📥 Import Data?\n\nThis will replace all current data with the backup from ${new Date(importData.timestamp).toLocaleDateString()}.\n\n⚠️ Current data will be lost!\n\nProceed with import?`
          );
          
          if (confirmed) {
            // Restore all data
            const data = importData.data;
            
            if (data.profileData) setProfileData(data.profileData);
            if (data.editableProfileData) setEditableProfileData(data.editableProfileData);
            if (data.notifications) setNotifications(data.notifications);
            if (data.selectedRoutines) setSelectedRoutines(data.selectedRoutines);
            if (data.userCustomizations) setUserCustomizations(data.userCustomizations);
            if (data.taskProgress) setTaskProgress(data.taskProgress);
            if (data.completedTasks) setCompletedTasks(data.completedTasks);
            if (data.dateRange) setDateRange(data.dateRange);
            if (data.calendarView) setCalendarView(data.calendarView);
            
            alert('✅ Data imported successfully! Your backup has been restored.');
            console.log('📥 Data imported successfully from:', importData.timestamp);
          }
        } catch (error) {
          console.error('❌ Import failed:', error);
          alert('❌ Import failed. Please check that you selected a valid THRIVE backup file.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  // Removed camera capture function

  // Removed library selection function

  // Removed retake photo function

  // 🔔 Notification System Functions
  const getUnreadNotificationCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const addNotification = (type, title, message, icon = '🔔') => {
    const newNotification = {
      id: Date.now(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      icon
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Notification Navigation Handler
  const handleNotificationTap = (notification) => {
    // Mark notification as read
    markNotificationAsRead(notification.id);
    
    // Force close hamburger menu immediately
    setIsMenuOpen(false);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'message':
        // Navigate to Profile page for messages (can be expanded later with dedicated message system)
        goToPage(1); // Profile page for now
        break;
        
      case 'profile_interaction':
        // Navigate to Profile page for follower/like notifications  
        goToPage(1); // Profile page
        break;
        
      case 'achievement':
        // Navigate to Goals page for achievements
        goToPage(3); // Goals page
        break;
        
      case 'question':
        // Navigate to Profile page and open Q&A modal for questions
        setShowAskQuestion(true); // Open Q&A modal first
        goToPage(1); // Navigate to Profile page
        break;
        
      default:
        // Default to Profile page for unknown notification types
        goToPage(1);
        break;
    }
  };

  // Follow System Functions
  const handleFollowToggle = () => {
    if (isFollowing) {
      // Unfollow
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
    } else {
      // Follow
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      
      // Trigger notification for profile interaction
      addNotification(
        'profile_interaction',
        'New Follower!',
        'Someone started following you',
        '👥'
      );
    }
  };

  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Q&A System Functions
  const handleAskQuestion = () => {
    setShowAskQuestion(true);
    setNewQuestion('');
  };

  const handleSubmitQuestion = () => {
    if (newQuestion.trim()) {
      const question = {
        id: Date.now(),
        question: newQuestion.trim(),
        asker: "Anonymous User", // In real app, this would be the current user's name
        timestamp: new Date(),
        isAnswered: false,
        answer: null
      };
      
      setIncomingQuestions(prev => [question, ...prev]);
      setNewQuestion('');
      setShowAskQuestion(false);
      
      // Show notification that question was submitted
      setTimeout(() => {
        alert('Question submitted! The user will be notified.');
      }, 100);
    }
  };

  const handleQuestionAction = (questionId, action) => {
    if (action === 'answer') {
      const question = incomingQuestions.find(q => q.id === questionId);
      setSelectedQuestion(question);
      setQuestionAnswer(question.answer || '');
      setShowQuestionManager(true);
    } else if (action === 'delete') {
      setIncomingQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  const handleAnswerQuestion = () => {
    if (questionAnswer.trim() && selectedQuestion) {
      setIncomingQuestions(prev => 
        prev.map(q => 
          q.id === selectedQuestion.id 
            ? { ...q, isAnswered: true, answer: questionAnswer.trim() }
            : q
        )
      );
      setShowQuestionManager(false);
      setSelectedQuestion(null);
      setQuestionAnswer('');
    }
  };

  const getUnansweredQuestionsCount = () => {
    return incomingQuestions.filter(q => !q.isAnswered).length;
  };

  const getAnsweredQuestions = () => {
    return incomingQuestions.filter(q => q.isAnswered);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Hamburger Button with Notification Indicator */}
        <View
          style={styles.hamburgerButton}
          onTouchStart={toggleMenu}
          onClick={toggleMenu}
        >
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          {/* Notification Indicator */}
          {getUnreadNotificationCount() > 0 && (
            <View style={styles.hamburgerNotificationBadge}>
              <Text style={styles.hamburgerNotificationText}>
                {getUnreadNotificationCount()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerCenter}>
          {/* New THRIVE Logo Implementation - Prominently Centered - BIGGER! */}
          <ThriveLogoComponent size={50} showText={true} textSize={28} />
          {/* Page title moved to subtitle position */}
          <Text style={styles.pageSubtitle}>{pages[currentPage]}</Text>
        </View>
        
        {/* AI Coach Button */}
        <View
          style={[styles.aiCoachButton, { cursor: 'pointer' }]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => setShowAICoach(!showAICoach)}
        >
          <View style={styles.aiCoachAvatar}>
            <Text style={styles.aiCoachAvatarText}>🧠</Text>
          </View>
        </View>

      </View>
      
      {/* Sliding Menu */}
      <Animated.View
        style={[
          styles.slideMenu,
          {
            transform: [{ translateX: menuTranslateX }],
          },
        ]}
      >
        <View style={styles.menuContent}>
          {/* New THRIVE Logo Implementation - BIGGER! */}
          <ThriveLogoComponent size={45} showText={true} textSize={24} />
          
          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { setShowSearch(true); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>🔍</Text>
            <Text style={styles.menuItemText}>Search</Text>
          </View>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { setShowNotifications(true); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>🔔</Text>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemText}>Notifications</Text>
              {getUnreadNotificationCount() > 0 && (
                <View style={styles.menuNotificationBadge}>
                  <Text style={styles.menuNotificationBadgeText}>
                    {getUnreadNotificationCount()}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Insights & Tools */}
          <Text style={styles.sectionTitle}>Insights & Tools</Text>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { setShowAnalytics(true); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>📊</Text>
            <Text style={styles.menuItemText}>Progress</Text>
          </View>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { setShowAchievements(true); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>🏆</Text>
            <Text style={styles.menuItemText}>Achievements</Text>
          </View>
          
          {/* Resources */}
          <Text style={styles.sectionTitle}>Resources</Text>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { setShowTutorials(true); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>📚</Text>
            <Text style={styles.menuItemText}>Tutorials</Text>
          </View>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { setShowHelp(true); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>❓</Text>
            <Text style={styles.menuItemText}>Help</Text>
          </View>
          
          {/* Settings */}
          <Text style={styles.sectionTitle}>Settings</Text>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { setShowCalendarSettings(true); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>📅</Text>
            <Text style={styles.menuItemText}>Map Settings</Text>
          </View>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { setShowProfileSettings(true); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>🎨</Text>
            <Text style={styles.menuItemText}>Theme</Text>
          </View>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { setShowProfileSettings(true); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>📱</Text>
            <Text style={styles.menuItemText}>Devices</Text>
          </View>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { setShowAppInfo(true); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>ℹ️</Text>
            <Text style={styles.menuItemText}>App Info</Text>
          </View>
          
          {/* Data Management */}
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { handleClearAllData(); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>🗑️</Text>
            <Text style={styles.menuItemText}>Clear All Data</Text>
          </View>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { handleAddDemoData(); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>🎭</Text>
            <Text style={styles.menuItemText}>Add Demo Data</Text>
          </View>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { handleExportData(); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>📤</Text>
            <Text style={styles.menuItemText}>Export Data</Text>
          </View>
          <View 
            style={styles.menuItem}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => { handleImportData(); toggleMenu(); }}
          >
            <Text style={styles.menuItemIcon}>📥</Text>
            <Text style={styles.menuItemText}>Import Data</Text>
          </View>
          
          {/* Logout */}
          <View style={styles.logoutItem}>
            <Text style={styles.menuItemIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Menu Overlay */}
      {isMenuOpen && (
        <View
          style={styles.menuOverlay}
          onTouchStart={toggleMenu}
          onClick={toggleMenu}
        />
      )}
      

      

      
      {/* Modal Dropdown Overlays */}
      {(showFitnessDropdown || showMainGoalDropdown) && (
        <View 
          style={styles.modalOverlay}
          onTouchStart={closeAllDropdownsWithAutoSave}
          onClick={closeAllDropdownsWithAutoSave}
        />
      )}
      
      {/* Fitness Level Modal Dropdown */}
      {showFitnessDropdown && (
        <View style={styles.modalDropdown}>
          <View style={styles.modalDropdownMenu}>
            <Text style={styles.modalDropdownTitle}>Select Fitness Level</Text>
            {fitnessOptions.map((option) => (
              <View
                key={option}
                style={styles.modalDropdownItem}
                onTouchStart={() => selectFitnessLevel(option)}
                onClick={() => selectFitnessLevel(option)}
              >
                <Text style={styles.modalDropdownItemText}>{option}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Main Goal Modal Dropdown */}
      {showMainGoalDropdown && (
        <View style={styles.modalDropdown}>
          <View style={styles.modalDropdownMenu}>
            <Text style={styles.modalDropdownTitle}>Select Main Goal</Text>
            {goalOptions.map((option) => (
              <View
                key={option}
                style={styles.modalDropdownItem}
                onTouchStart={() => selectMainGoal(option)}
                onClick={() => selectMainGoal(option)}
              >
                <Text style={styles.modalDropdownItemText}>{option}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Swipeable Pages */}
      <View style={styles.pagesWrapper}>
        <Animated.View
          style={[
            styles.pagesContainer,
            {
              transform: [{ translateX }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Schedule Page */}
          {/* Schedule Page - Light tint of accent blue */}
          <View style={[styles.page, { backgroundColor: '#F0F9FF' }]}>
            
            {/* Calendar Container */}
            <View style={styles.calendarContainer}>
              
              {/* Week/Month Toggle Buttons */}
              <View style={styles.calendarToggleContainer}>
                <View 
                  style={[styles.calendarToggleButton, calendarView === 'week' ? styles.activeCalendarButton : styles.inactiveCalendarButton]}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={() => {
                    console.log('Week view selected');
                    setCalendarView('week');
                  }}
                >
                  <Text style={[styles.calendarToggleText, calendarView === 'week' ? styles.activeCalendarText : styles.inactiveCalendarText]}>
                    WEEK
                  </Text>
                </View>
                
                <View 
                  style={[styles.calendarToggleButton, calendarView === 'month' ? styles.activeCalendarButton : styles.inactiveCalendarButton]}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={() => {
                    console.log('Month view selected');
                    setCalendarView('month');
                  }}
                >
                  <Text style={[styles.calendarToggleText, calendarView === 'month' ? styles.activeCalendarText : styles.inactiveCalendarText]}>
                    MONTH
                  </Text>
                </View>
              </View>
              
              {/* Calendar Content Area */}
              <View style={styles.calendarContent}>
                {calendarView === 'week' ? (
                  /* Week View - 7-Day Calendar */
                  <ScrollView showsVerticalScrollIndicator={false} style={styles.weekScrollView}>
                    
                    {/* 7-Day Header Row */}
                    <View style={styles.weekDaysHeader}>
                      {(() => {
                        const days = [];
                        const today = new Date();
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
                        
                        for (let i = 0; i < 7; i++) {
                          const date = new Date(startOfWeek);
                          date.setDate(startOfWeek.getDate() + i);
                          const isToday = date.toDateString() === today.toDateString();
                          
                          days.push(
                            <View key={i} style={[styles.dayColumn, isToday && styles.todayColumn]}>
                              <Text style={[styles.dayNumber, isToday && styles.todayNumber]}>
                                {date.getDate()}
                              </Text>
                              <Text style={[styles.dayName, isToday && styles.todayName]}>
                                {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                              </Text>
                            </View>
                          );
                        }
                        return days;
                      })()}
                    </View>
                    
                    {/* Events Section */}
                    <View style={styles.eventsContainer}>
                      <Text style={styles.eventsTitle}>Upcoming & Recent</Text>
                      
                      {/* Dynamic Events from Calendar Sync */}
                      <View style={styles.eventsList}>
                        {getCombinedEvents().slice(0, 8).map((event, index) => {
                          const eventTime = formatEventTime(event.startDate);
                          const eventDate = getRelativeDateString(event.startDate);
                          const categoryColor = getCategoryColor(event.category || 'personal');
                          const categoryIcon = getCategoryIcon(event.category || 'personal', event.title);
                          const isPastEvent = new Date(event.startDate) < new Date();
                          const progressWidth = isPastEvent ? '100%' : '0%';
                          const statusIcon = isPastEvent ? '✅' : (eventDate === 'Today' ? '⏳' : '📅');
                          
                          return (
                            <View 
                              key={event.id || index} 
                              style={[
                                styles.eventCard, 
                                isPastEvent && styles.completedEventCard
                              ]}
                            >
                              <View style={styles.eventTime}>
                                <Text style={styles.eventTimeText}>{eventTime}</Text>
                                <Text style={styles.eventDateText}>{eventDate}</Text>
                              </View>
                              <View style={styles.eventContent}>
                                <View style={styles.eventHeader}>
                                  <Text style={styles.eventIcon}>{categoryIcon}</Text>
                                  <Text style={styles.eventTitle}>{event.title}</Text>
                                  {event.isThrive && (
                                    <View style={styles.thriveEventBadge}>
                                      <Text style={styles.thriveEventBadgeText}>THRIVE</Text>
                                    </View>
                                  )}
                                </View>
                                <Text style={styles.eventDescription} numberOfLines={1}>
                                  {event.description || 'No description'}
                                </Text>
                                <View style={styles.eventProgressContainer}>
                                  <View style={[
                                    styles.eventProgressBar, 
                                    { 
                                      width: progressWidth, 
                                      backgroundColor: categoryColor 
                                    }
                                  ]} />
                                </View>
                              </View>
                              <View style={styles.eventStatus}>
                                <Text style={styles.eventStatusIcon}>{statusIcon}</Text>
                              </View>
                            </View>
                          );
                        })}
                        
                        {/* Calendar Integration Tip */}
                        {!syncStatus.isEnabled && getCombinedEvents().length === 0 && (
                          <View style={styles.calendarTipCard}>
                            <Text style={styles.calendarTipIcon}>📱</Text>
                            <Text style={styles.calendarTipTitle}>Sync Your iPhone Calendar</Text>
                            <Text style={styles.calendarTipSubtitle}>
                              Connect your iPhone calendar to see all your events here. Your workouts, appointments, and reminders will appear in THRIVE.{`\n\n`}✨ Tap "Sync iPhone" above to get started!
                            </Text>
                          </View>
                        )}
                        
                        {/* No Events Message */}
                        {getCombinedEvents().length === 0 && (
                          <View style={styles.noEventsCard}>
                            <Text style={styles.noEventsIcon}>📅</Text>
                            <Text style={styles.noEventsTitle}>No Events</Text>
                            <Text style={styles.noEventsSubtitle}>
                              Tap the + button to add your first event
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </ScrollView>
                ) : (
                  /* Month View - Full Calendar Grid */
                  <ScrollView 
                    ref={calendarScrollRef}
                    showsVerticalScrollIndicator={false} 
                    style={styles.monthScrollView}
                  >
                    {/* Month Header with Navigation */}
                    <View style={styles.monthHeader}>
                      <View 
                        style={styles.monthNavButton}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={() => navigateMonth('prev')}
                      >
                        <Text style={styles.monthNavButtonText}>‹</Text>
                      </View>
                      
                      <Text style={styles.monthTitle}>
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </Text>
                      
                      <View 
                        style={styles.monthNavButton}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={() => navigateMonth('next')}
                      >
                        <Text style={styles.monthNavButtonText}>›</Text>
                      </View>
                    </View>
                    
                    {/* Days of Week Header */}
                    <View style={styles.weekdayHeader}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <View key={index} style={styles.weekdayCell}>
                          <Text style={styles.weekdayText}>{day}</Text>
                        </View>
                      ))}
                    </View>
                    
                    {/* Calendar Grid */}
                    <View style={styles.calendarGrid}>
                      {getMonthCalendarDays().map((date, index) => {
                        if (!date) {
                          // Empty cell for days before first day of month
                          return <View key={index} style={styles.emptyCellContainer} />;
                        }
                        
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                        const dayEvents = getEventsForDate(date);
                        const hasEvents = dayEvents.length > 0;
                        
                        return (
                          <View 
                            key={index} 
                            style={styles.dateCell}
                            onStartShouldSetResponder={() => true}
                            onResponderGrant={() => {
                              setSelectedDate(date);
                              console.log('Selected date:', date.toDateString());
                              // Smooth scroll to events section after a short delay
                              setTimeout(() => {
                                calendarScrollRef.current?.scrollToEnd({ animated: true });
                              }, 100);
                            }}
                          >
                            <View style={[
                              styles.dateCellContent,
                              isToday && styles.todayCell,
                              isSelected && styles.selectedCell
                            ]}>
                              <Text style={[
                                styles.dateText,
                                isToday && styles.todayText,
                                isSelected && styles.selectedText
                              ]}>
                                {date.getDate()}
                              </Text>
                              
                              {/* Event Indicators */}
                              {hasEvents && (
                                <View style={styles.eventIndicators}>
                                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                                    <View 
                                      key={eventIndex}
                                      style={[
                                        styles.eventDot,
                                        { backgroundColor: getCategoryColor(event.category || 'personal') }
                                      ]}
                                    />
                                  ))}
                                  {dayEvents.length > 3 && (
                                    <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
                                  )}
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                    
                    {/* Selected Date Events */}
                    {selectedDate && (
                      <View style={styles.selectedDateEvents}>
                        <Text style={styles.selectedDateTitle}>
                          {selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Text>
                        
                        {getEventsForDate(selectedDate).length > 0 ? (
                          <View style={styles.selectedDateEventsList}>
                            {getEventsForDate(selectedDate).map((event, index) => (
                              <View key={event.id || index} style={[
                                styles.selectedEventCard,
                                { borderLeftColor: getCategoryColor(event.category || 'personal') }
                              ]}>
                                <Text style={styles.selectedEventIcon}>
                                  {getCategoryIcon(event.category || 'personal', event.title)}
                                </Text>
                                <View style={styles.selectedEventInfo}>
                                  <Text style={styles.selectedEventTitle}>{event.title}</Text>
                                  <Text style={styles.selectedEventTime}>
                                    {formatEventTime(event.startDate)}
                                  </Text>
                                  {event.description && (
                                    <Text style={styles.selectedEventDescription}>
                                      {event.description}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <View style={styles.noSelectedEventsContainer}>
                            <Text style={styles.noSelectedEvents}>No events on this date</Text>
                            <View
                              style={[styles.addEventForDateButton, { cursor: 'pointer' }]}
                              onStartShouldSetResponder={() => true}
                              onResponderGrant={() => setShowEventCreation(true)}
                            >
                              <Text style={styles.addEventForDateButtonText}>+ Add Event</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </ScrollView>
                )}
              </View>
              
              {/* Add Event Button - Keep in original position */}
              <View style={styles.calendarAddButtonContainer}>
                <View 
                  style={styles.calendarAddButton}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={() => {
                    setShowEventCreation(true);
                  }}
                >
                  <Text style={styles.calendarAddButtonText}>+</Text>
                </View>
              </View>
              
            </View>
            

          </View>
          
          {/* Profile Page */}
          {/* Profile Page - Clean White Background */}
          <View style={[styles.page, { backgroundColor: THRIVE_COLORS.white }]}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.profileScrollView}>
              
              {/* Profile Header - No Cover Background */}
              <View style={styles.profileHeader}>
                {/* Edit Mode Toggle Button - Top Right */}
                <View 
                  style={[
                    styles.profileEditModeButton,
                    isProfileEditMode && styles.profileEditModeButtonActive
                  ]}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={() => setIsProfileEditMode(!isProfileEditMode)}
                >
                  <Text style={styles.profileEditModeIcon}>
                    {isProfileEditMode ? '✓' : '✏️'}
                  </Text>
                </View>
                
                {/* Edit Mode Indicator */}
                {isProfileEditMode && (
                  <View style={styles.editModeIndicator}>
                    <Text style={styles.editModeIndicatorText}>✨ Tap to edit • Drag to move</Text>
                  </View>
                )}
                
                {/* Avatar moved to top */}
                <View style={styles.profileAvatarContainerTop}>
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileAvatarText}>AB</Text>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedBadgeText}>✓</Text>
                  </View>
                </View>
                
                {/* User Info */}
                <View style={styles.profileInfo}>
                  {/* Name - Editable */}
                  <View 
                    style={[
                      styles.editableInlineCard,
                      isProfileEditMode && styles.editableCardActive
                    ]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => {
                      if (isProfileEditMode) {
                        setEditingCardId(editingCardId === 'name' ? null : 'name');
                      }
                    }}
                  >
                    {editingCardId === 'name' ? (
                      <TextInput
                        style={[styles.profileName, styles.editableTextInputInline]}
                        value={editableProfileData.name}
                        onChangeText={(text) => 
                          setEditableProfileData(prev => ({ ...prev, name: text }))
                        }
                        onBlur={() => setEditingCardId(null)}
                        autoFocus
                      />
                    ) : (
                      <Text style={[
                        styles.profileName,
                        isProfileEditMode && styles.editableText
                      ]}>
                        {editableProfileData.name}
                      </Text>
                    )}
                  </View>
                  
                  {/* Username - Editable */}
                  <View 
                    style={[
                      styles.editableInlineCard,
                      isProfileEditMode && styles.editableCardActive
                    ]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => {
                      if (isProfileEditMode) {
                        setEditingCardId(editingCardId === 'username' ? null : 'username');
                      }
                    }}
                  >
                    {editingCardId === 'username' ? (
                      <TextInput
                        style={[styles.profileUsername, styles.editableTextInputInline]}
                        value={editableProfileData.username}
                        onChangeText={(text) => 
                          setEditableProfileData(prev => ({ ...prev, username: text }))
                        }
                        onBlur={() => setEditingCardId(null)}
                        autoFocus
                      />
                    ) : (
                      <Text style={[
                        styles.profileUsername,
                        isProfileEditMode && styles.editableText
                      ]}>
                        {editableProfileData.username}
                      </Text>
                    )}
                  </View>
                  
                  {/* Location - Editable */}
                  <View 
                    style={[
                      styles.editableInlineCard,
                      isProfileEditMode && styles.editableCardActive
                    ]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => {
                      if (isProfileEditMode) {
                        setEditingCardId(editingCardId === 'location' ? null : 'location');
                      }
                    }}
                  >
                    {editingCardId === 'location' ? (
                      <TextInput
                        style={[styles.profileLocation, styles.editableTextInputInline]}
                        value={editableProfileData.location}
                        onChangeText={(text) => 
                          setEditableProfileData(prev => ({ ...prev, location: text }))
                        }
                        onBlur={() => setEditingCardId(null)}
                        autoFocus
                      />
                    ) : (
                      <Text style={[
                        styles.profileLocation,
                        isProfileEditMode && styles.editableText
                      ]}>
                        {editableProfileData.location}
                      </Text>
                    )}
                  </View>
                  
                  {/* Stats - Now Interactive with Live Updates */}
                  <View style={styles.profileStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>152</Text>
                      <Text style={styles.statLabel}>posts</Text>
                    </View>
                    <View 
                      style={[styles.statItem, styles.clickableStatItem]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={() => setShowFollowersList(true)}
                    >
                      <Text style={styles.statNumber}>{formatCount(followerCount)}</Text>
                      <Text style={styles.statLabel}>followers</Text>
                    </View>
                    <View 
                      style={[styles.statItem, styles.clickableStatItem]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={() => setShowFollowingList(true)}
                    >
                      <Text style={styles.statNumber}>{followingCount}</Text>
                      <Text style={styles.statLabel}>following</Text>
                    </View>
                  </View>
                  
                  {/* Bio - Editable Card */}
                  <View 
                    style={[
                      styles.editableCard,
                      isProfileEditMode && styles.editableCardActive,
                      editingCardId === 'bio' && styles.editableCardEditing
                    ]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => {
                      if (isProfileEditMode) {
                        setEditingCardId(editingCardId === 'bio' ? null : 'bio');
                      }
                    }}
                  >
                    {isProfileEditMode && (
                      <View style={styles.editCardHeader}>
                        <Text style={styles.editCardLabel}>Bio</Text>
                        {editingCardId === 'bio' && (
                          <View style={styles.editCardActions}>
                            <View 
                              style={styles.saveCardButton}
                              onStartShouldSetResponder={() => true}
                              onResponderGrant={() => setEditingCardId(null)}
                            >
                              <Text style={styles.saveCardButtonText}>✓</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                    
                    {editingCardId === 'bio' ? (
                      <TextInput
                        style={styles.editableTextInput}
                        value={editableProfileData.bio}
                        onChangeText={(text) => 
                          setEditableProfileData(prev => ({ ...prev, bio: text }))
                        }
                        multiline={true}
                        placeholder="Tell people about yourself..."
                        autoFocus
                      />
                    ) : (
                      <Text style={[
                        styles.profileBio,
                        isProfileEditMode && styles.editableText
                      ]}>
                        {editableProfileData.bio}
                      </Text>
                    )}
                  </View>
                  
                  {/* Links - Editable Card */}
                  <View 
                    style={[
                      styles.editableCard,
                      isProfileEditMode && styles.editableCardActive,
                      editingCardId === 'links' && styles.editableCardEditing
                    ]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => {
                      if (isProfileEditMode) {
                        setEditingCardId(editingCardId === 'links' ? null : 'links');
                      }
                    }}
                  >
                    {isProfileEditMode && (
                      <View style={styles.editCardHeader}>
                        <Text style={styles.editCardLabel}>Links & Tags</Text>
                        {editingCardId === 'links' && (
                          <View style={styles.editCardActions}>
                            <View 
                              style={styles.saveCardButton}
                              onStartShouldSetResponder={() => true}
                              onResponderGrant={() => setEditingCardId(null)}
                            >
                              <Text style={styles.saveCardButtonText}>✓</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                    
                    <View style={styles.profileLinks}>
                      {editableProfileData.links.map((link, index) => (
                        <View key={index} style={styles.editableLinkContainer}>
                          {editingCardId === 'links' ? (
                            <TextInput
                              style={styles.editableLinkInput}
                              value={link}
                              onChangeText={(text) => {
                                const newLinks = [...editableProfileData.links];
                                newLinks[index] = text;
                                setEditableProfileData(prev => ({ ...prev, links: newLinks }));
                              }}
                              placeholder={`Link ${index + 1}`}
                            />
                          ) : (
                            <Text style={[
                              styles.profileLink,
                              isProfileEditMode && styles.editableText
                            ]}>
                              {link}
                            </Text>
                          )}
                        </View>
                      ))}
                      
                      {editableProfileData.tags.map((tag, index) => (
                        <View key={`tag-${index}`} style={styles.profileTag}>
                          {editingCardId === 'links' ? (
                            <TextInput
                              style={styles.editableTagInput}
                              value={tag}
                              onChangeText={(text) => {
                                const newTags = [...editableProfileData.tags];
                                newTags[index] = text;
                                setEditableProfileData(prev => ({ ...prev, tags: newTags }));
                              }}
                              placeholder="Tag"
                            />
                          ) : (
                            <Text style={[
                              styles.profileTagText,
                              isProfileEditMode && styles.editableText
                            ]}>
                              {tag}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  {/* Action Buttons - Now Functional */}
                  <View style={styles.profileActions}>
                    <View 
                      style={[styles.followButton, isFollowing && styles.followingButton]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={handleFollowToggle}
                    >
                      <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                        {isFollowing ? '✓ Following' : '+ Follow'}
                      </Text>
                    </View>
                    <View 
                      style={styles.messageButton}
                      onClick={() => setShowPersonalChat(true)}
                    >
                      <Text style={styles.messageButtonText}>Message</Text>
                    </View>
                  </View>
                  
                  <View 
                    style={styles.challengeButton}
                    onClick={() => setShowChallengeSelector(true)}
                  >
                    <Text style={styles.challengeButtonText}>Start Challenge</Text>
                  </View>
                </View>
              </View>
              

              
              {/* Tab Navigation - Now Interactive */}
              <View style={styles.profileTabs}>
                {['Overview', 'Progress', 'Routines', 'Q&A'].map((tab, index) => (
                  <View 
                    key={tab} 
                    style={[styles.profileTab, index === activeProfileTab && styles.activeProfileTab]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => setActiveProfileTab(index)}
                  >
                    <Text style={[styles.profileTabText, index === activeProfileTab && styles.activeProfileTabText]}>
                      {tab}
                    </Text>
                  </View>
                ))}
              </View>
              
              {/* Tab Content */}
              <View style={styles.profileContent}>
                
                {/* Overview Tab Content */}
                {activeProfileTab === 0 && (
                  <View>
                
                {/* Removed post creation section - profile now focuses on wellness routines */}

                {/* Success Routines - Customizable Playlists */}
                <View style={styles.profileSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Success Routines</Text>
                    <View 
                      style={styles.customizeRoutinesButtonSmall}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={() => setShowRoutineCustomizer(true)}
                    >
                      <Text style={styles.customizeRoutinesTextSmall}>⚙️ Edit</Text>
                    </View>
                  </View>
                  
                  <View style={styles.playlistsContainer}>
                    {selectedRoutines.map((routineId, index) => {
                      const routine = routineCategories[routineId];
                      if (!routine) return null;
                      
                      const taskCount = routine.details.length + (routine.tasks ? routine.tasks.length : 0);
                      
                      return (
                        <View key={routine.id}>
                          <View 
                            style={[
                              styles.playlistItem, 
                              { borderColor: routine.color },
                              expandedPlaylist === routine.id && styles.playlistItemExpanded
                            ]}
                            onStartShouldSetResponder={() => true}
                            onResponderGrant={() => {
                              setExpandedPlaylist(expandedPlaylist === routine.id ? null : routine.id);
                            }}
                          >
                            <View style={styles.playlistContent}>
                              <View style={styles.playlistTitleRow}>
                                <Text style={styles.playlistIcon}>{routine.icon}</Text>
                                <View style={styles.playlistInfo}>
                                  <Text style={styles.playlistName}>{routine.title}</Text>
                                  <Text style={styles.playlistCount}>{taskCount} guidance areas</Text>
                                </View>
                              </View>
                            </View>
                            <Text style={[
                              styles.playlistArrow,
                              expandedPlaylist === routine.id && styles.playlistArrowExpanded
                            ]}>
                              {expandedPlaylist === routine.id ? '⌄' : '›'}
                            </Text>
                          </View>
                          
                          {/* Expanded Content */}
                          {expandedPlaylist === routine.id && (
                            <View style={[styles.playlistExpandedContent, { borderLeftColor: routine.color }]}>
                              <Text style={styles.playlistDescription}>{routine.description}</Text>
                              
                              <View style={styles.playlistTasksContainer}>
                                <Text style={styles.playlistTasksTitle}>Key Areas & Guidance</Text>
                                {routine.details.slice(0, 4).map((detail, detailIndex) => {
                                  const detailKey = `${routine.id}-detail-${detailIndex}`;
                                  const isExpanded = showDetailedSteps[detailKey];
                                  
                                  return (
                                    <View key={detailIndex}>
                                      <View style={styles.playlistTask}>
                                        <View style={styles.playlistTaskInfo}>
                                          <Text style={styles.playlistTaskName}>
                                            {typeof detail === 'object' ? detail.title : detail}
                                          </Text>
                                          <View style={styles.playlistTaskMeta}>
                                            <Text style={styles.playlistTaskType}>Core Principle</Text>
                                            <Text style={styles.playlistTaskDivider}>•</Text>
                                            <Text style={[styles.playlistTaskDifficulty, styles.difficultyMedium]}>
                                              Essential
                                            </Text>
                                          </View>
                                        </View>
                                        <View 
                                          style={[styles.playlistTaskAction, { backgroundColor: routine.color }]}
                                          onStartShouldSetResponder={() => true}
                                          onResponderGrant={() => {
                                            setShowDetailedSteps(prev => ({
                                              ...prev,
                                              [detailKey]: !prev[detailKey]
                                            }));
                                          }}
                                        >
                                          <Text style={styles.playlistTaskActionText}>
                                            {isExpanded ? 'Hide' : 'Learn'}
                                          </Text>
                                        </View>
                                      </View>
                                      
                                      {/* Expandable Steps Section */}
                                      {isExpanded && typeof detail === 'object' && detail.steps && (
                                        <View style={[styles.expandedStepsContainer, { borderLeftColor: routine.color }]}>
                                          <Text style={styles.expandedStepsTitle}>Step-by-step guide:</Text>
                                          {detail.steps.map((step, stepIndex) => (
                                            <View key={stepIndex} style={styles.expandedStep}>
                                              <View style={[styles.stepNumber, { backgroundColor: routine.color }]}>
                                                <Text style={styles.stepNumberText}>{stepIndex + 1}</Text>
                                              </View>
                                              <Text style={styles.stepText}>{step}</Text>
                                            </View>
                                          ))}
                                        </View>
                                      )}
                                    </View>
                                  );
                                })}
                                
                                {routine.tasks && routine.tasks.length > 0 && (
                                  <>
                                    <Text style={[styles.playlistTasksTitle, { marginTop: 16 }]}>Action Tasks</Text>
                                    {routine.tasks.map((task, taskIndex) => (
                                      <View key={`task-${taskIndex}`} style={styles.playlistTask}>
                                        <View style={styles.playlistTaskInfo}>
                                          <Text style={styles.playlistTaskName}>{task.name}</Text>
                                          <View style={styles.playlistTaskMeta}>
                                            <Text style={styles.playlistTaskDuration}>{task.duration}</Text>
                                            <Text style={styles.playlistTaskDivider}>•</Text>
                                            <Text style={styles.playlistTaskType}>{task.type}</Text>
                                            <Text style={styles.playlistTaskDivider}>•</Text>
                                            <Text style={[
                                              styles.playlistTaskDifficulty,
                                              task.difficulty === 'easy' ? styles.difficultyEasy :
                                              task.difficulty === 'medium' ? styles.difficultyMedium : 
                                              styles.difficultyHard
                                            ]}>{task.difficulty}</Text>
                                          </View>
                                        </View>
                                        <View 
                                          style={[styles.playlistTaskAction, { backgroundColor: routine.color }]}
                                          onStartShouldSetResponder={() => true}
                                          onResponderGrant={() => {
                                            setShowTaskStarter(`${routine.id}-task-${taskIndex}`);
                                          }}
                                        >
                                          <Text style={styles.playlistTaskActionText}>Start</Text>
                                        </View>
                                      </View>
                                    ))}
                                  </>
                                )}
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
                
                {/* Q&A Section - Now Functional */}
                <View style={styles.profileSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Q&A</Text>
                    <View 
                      style={styles.askQuestionButton}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={handleAskQuestion}
                    >
                      <Text style={styles.askQuestionText}>Ask Question</Text>
                    </View>
                  </View>
                  <Text style={styles.qaDescription}>
                    Ask me anything about workouts, ADHD-friendly habits, or lawn-care balance 🌱
                  </Text>
                  
                  {/* Preview of Recent Q&A */}
                  <View style={styles.qaPreview}>
                    {getAnsweredQuestions().slice(0, 2).map((qa) => (
                      <View key={qa.id} style={styles.qaPreviewItem}>
                        <Text style={styles.qaPreviewQuestion}>Q: {qa.question}</Text>
                        <Text style={styles.qaPreviewAnswer}>A: {qa.answer}</Text>
                      </View>
                    ))}
                    {getAnsweredQuestions().length > 2 && (
                      <View 
                        style={styles.seeMoreQA}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={() => setActiveProfileTab(3)}
                      >
                        <Text style={styles.seeMoreQAText}>View all Q&As →</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Badges - Now Interactive */}
                <View style={styles.profileSection}>
                  <Text style={styles.sectionTitle}>Badges</Text>
                  <View style={styles.badgesContainer}>
                    {[
                      { name: '30-Day Streak', color: '#FF9500', description: 'Completed 30 consecutive days of workouts' },
                      { name: 'Early Supporter', color: THRIVE_COLORS.primary, description: 'One of the first 1000 THRIVE members' },
                      { name: 'Coach', color: THRIVE_COLORS.accent, description: 'Certified fitness and wellness coach' },
                    ].map((badge, index) => (
                      <View 
                        key={index} 
                        style={[styles.badgeItem, { backgroundColor: badge.color + '15' }]}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={() => setShowBadgeDetail(badge)}
                      >
                        <Text style={[styles.badgeName, { color: badge.color }]}>{badge.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Share Profile */}
                <View style={styles.profileSection}>
                  <Text style={styles.sectionTitle}>Share Profile</Text>
                  <View style={styles.shareProfileContainer}>
                    <View style={styles.qrCodePlaceholder}>
                      <Text style={styles.qrCodeIcon}>📱</Text>
                    </View>
                    <Text style={styles.shareDescription}>Scan to follow on THRIVE</Text>
                  </View>
                </View>
                
                  </View>
                )}
                
                {/* Progress Tab Content */}
                {activeProfileTab === 1 && (
                  <View>
                    <Text style={styles.tabContentTitle}>My Progress</Text>
                    <Text style={styles.tabContentSubtitle}>Achievements, milestones, and personal growth tracking</Text>
                    
                    {/* Top Accomplished Goals */}
                    <View style={styles.progressSection}>
                      <Text style={styles.progressSectionTitle}>🏆 Top Accomplished Goals</Text>
                      <View style={styles.accomplishedGoalsContainer}>
                        {[
                          {
                            id: 1,
                            title: 'Lost 15 lbs',
                            description: 'Achieved weight loss goal',
                            completedDate: '2 weeks ago',
                            category: 'Weight Loss',
                            icon: '🏋️‍♂️',
                            color: THRIVE_COLORS.primary,
                            progress: 100
                          },
                          {
                            id: 2,
                            title: '30-Day Meditation Streak',
                            description: 'Completed daily mindfulness practice',
                            completedDate: '1 week ago',
                            category: 'Mental Health',
                            icon: '🧘‍♀️',
                            color: THRIVE_COLORS.accent,
                            progress: 100
                          },
                          {
                            id: 3,
                            title: 'Marathon Training Complete',
                            description: '16-week training program finished',
                            completedDate: '3 weeks ago',
                            category: 'Fitness',
                            icon: '🏃‍♂️',
                            color: '#FF6B35',
                            progress: 100
                          }
                        ].map((goal, index) => (
                          <View key={goal.id} style={[styles.accomplishedGoalCard, { borderLeftColor: goal.color }]}>
                            <View style={styles.accomplishedGoalHeader}>
                              <Text style={styles.accomplishedGoalIcon}>{goal.icon}</Text>
                              <View style={styles.accomplishedGoalInfo}>
                                <Text style={styles.accomplishedGoalTitle}>{goal.title}</Text>
                                <Text style={styles.accomplishedGoalDescription}>{goal.description}</Text>
                              </View>
                              <View style={styles.accomplishedGoalBadge}>
                                <Text style={styles.accomplishedGoalBadgeText}>✓</Text>
                              </View>
                            </View>
                            <View style={styles.accomplishedGoalFooter}>
                              <Text style={styles.accomplishedGoalCategory}>{goal.category}</Text>
                              <Text style={styles.accomplishedGoalDate}>{goal.completedDate}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Weight Loss Progress */}
                    <View style={styles.progressSection}>
                      <Text style={styles.progressSectionTitle}>📉 Weight Loss Journey</Text>
                      <View style={styles.weightProgressContainer}>
                        <View style={styles.weightProgressSummary}>
                          <View style={styles.weightStat}>
                            <Text style={styles.weightStatValue}>15 lbs</Text>
                            <Text style={styles.weightStatLabel}>Total Lost</Text>
                          </View>
                          <View style={styles.weightStat}>
                            <Text style={styles.weightStatValue}>165 lbs</Text>
                            <Text style={styles.weightStatLabel}>Current</Text>
                          </View>
                          <View style={styles.weightStat}>
                            <Text style={styles.weightStatValue}>155 lbs</Text>
                            <Text style={styles.weightStatLabel}>Goal</Text>
                          </View>
                        </View>
                        
                        <View style={styles.weightProgressChart}>
                          <Text style={styles.weightProgressChartTitle}>Last 6 Months</Text>
                          <View style={styles.weightChartContainer}>
                            {[180, 175, 172, 168, 165, 165].map((weight, index) => (
                              <View key={index} style={styles.weightChartBar}>
                                <View 
                                  style={[
                                    styles.weightChartBarFill, 
                                    { 
                                      height: `${((weight - 150) / 30) * 100}%`,
                                      backgroundColor: weight === 165 ? THRIVE_COLORS.primary : '#E5E5E5'
                                    }
                                  ]} 
                                />
                                <Text style={styles.weightChartLabel}>
                                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>

                        <View style={styles.weightMilestones}>
                          <Text style={styles.weightMilestonesTitle}>Weight Milestones</Text>
                          <View style={styles.milestonesContainer}>
                            {[
                              { milestone: 'First 5 lbs', date: '4 months ago', achieved: true },
                              { milestone: 'First 10 lbs', date: '2 months ago', achieved: true },
                              { milestone: 'First 15 lbs', date: '2 weeks ago', achieved: true },
                              { milestone: 'Goal Weight', date: 'In progress', achieved: false }
                            ].map((milestone, index) => (
                              <View key={index} style={styles.milestoneItem}>
                                <View style={[
                                  styles.milestoneIcon, 
                                  { backgroundColor: milestone.achieved ? THRIVE_COLORS.primary : '#E5E5E5' }
                                ]}>
                                  <Text style={[
                                    styles.milestoneIconText,
                                    { color: milestone.achieved ? 'white' : '#999' }
                                  ]}>
                                    {milestone.achieved ? '✓' : '○'}
                                  </Text>
                                </View>
                                <View style={styles.milestoneInfo}>
                                  <Text style={styles.milestoneTitle}>{milestone.milestone}</Text>
                                  <Text style={styles.milestoneDate}>{milestone.date}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Mental Achievements */}
                    <View style={styles.progressSection}>
                      <Text style={styles.progressSectionTitle}>🧠 Mental Achievements</Text>
                      <View style={styles.achievementsGrid}>
                        {[
                          {
                            title: 'Mindful Master',
                            description: '100+ meditation sessions',
                            progress: 100,
                            icon: '🧘‍♀️',
                            color: THRIVE_COLORS.accent,
                            achieved: true,
                            level: 'Advanced'
                          },
                          {
                            title: 'Mood Tracker',
                            description: '60-day mood logging streak',
                            progress: 85,
                            icon: '😊',
                            color: '#FFB800',
                            achieved: false,
                            level: 'Intermediate'
                          },
                          {
                            title: 'Gratitude Guardian',
                            description: '30 days of gratitude journaling',
                            progress: 100,
                            icon: '🙏',
                            color: '#AF52DE',
                            achieved: true,
                            level: 'Beginner'
                          },
                          {
                            title: 'Stress Buster',
                            description: 'Reduced stress by 40%',
                            progress: 75,
                            icon: '😌',
                            color: '#34C759',
                            achieved: false,
                            level: 'Intermediate'
                          }
                        ].map((achievement, index) => (
                          <View key={index} style={[styles.achievementCard, { borderTopColor: achievement.color }]}>
                            <View style={styles.achievementHeader}>
                              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                              <View style={[styles.achievementBadge, { backgroundColor: achievement.color + '20' }]}>
                                <Text style={[styles.achievementLevel, { color: achievement.color }]}>
                                  {achievement.level}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.achievementTitle}>{achievement.title}</Text>
                            <Text style={styles.achievementDescription}>{achievement.description}</Text>
                            <View style={styles.achievementProgressContainer}>
                              <View style={styles.achievementProgressTrack}>
                                <View 
                                  style={[
                                    styles.achievementProgressFill, 
                                    { 
                                      width: `${achievement.progress}%`,
                                      backgroundColor: achievement.color 
                                    }
                                  ]} 
                                />
                              </View>
                              <Text style={[styles.achievementProgressText, { color: achievement.color }]}>
                                {achievement.progress}%
                              </Text>
                            </View>
                            {achievement.achieved && (
                              <View style={styles.achievedOverlay}>
                                <Text style={styles.achievedBadge}>🏆 ACHIEVED</Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Physical Achievements */}
                    <View style={styles.progressSection}>
                      <Text style={styles.progressSectionTitle}>💪 Physical Achievements</Text>
                      <View style={styles.physicalAchievementsContainer}>
                        <View style={styles.fitnessMetrics}>
                          <View style={styles.fitnessMetricCard}>
                            <Text style={styles.fitnessMetricIcon}>🏃‍♂️</Text>
                            <Text style={styles.fitnessMetricValue}>156</Text>
                            <Text style={styles.fitnessMetricLabel}>Workouts Completed</Text>
                            <Text style={styles.fitnessMetricChange}>+12 this month</Text>
                            <View 
                              style={styles.completeGoalButton}
                              onStartShouldSetResponder={() => true}
                              onResponderGrant={() => {
                                // Simulate goal completion
                                addNotification(
                                  'achievement',
                                  'Daily Workout Complete! 🎉',
                                  'You completed your daily workout goal. Great job!',
                                  '🏆'
                                );
                              }}
                            >
                              <Text style={styles.completeGoalButtonText}>Complete Daily Workout</Text>
                            </View>
                          </View>
                          <View style={styles.fitnessMetricCard}>
                            <Text style={styles.fitnessMetricIcon}>⏱️</Text>
                            <Text style={styles.fitnessMetricValue}>45h 32m</Text>
                            <Text style={styles.fitnessMetricLabel}>Total Exercise Time</Text>
                            <Text style={styles.fitnessMetricChange}>+8h this month</Text>
                          </View>
                          <View style={styles.fitnessMetricCard}>
                            <Text style={styles.fitnessMetricIcon}>🔥</Text>
                            <Text style={styles.fitnessMetricValue}>18,450</Text>
                            <Text style={styles.fitnessMetricLabel}>Calories Burned</Text>
                            <Text style={styles.fitnessMetricChange}>+2,100 this month</Text>
                          </View>
                        </View>

                        <View style={styles.strengthProgress}>
                          <Text style={styles.strengthProgressTitle}>Strength Progress</Text>
                          <View style={styles.strengthMetrics}>
                            {[
                              { exercise: 'Push-ups', start: 10, current: 25, goal: 50, unit: 'reps' },
                              { exercise: 'Plank Hold', start: 30, current: 90, goal: 120, unit: 'sec' },
                              { exercise: 'Squats', start: 15, current: 35, goal: 100, unit: 'reps' }
                            ].map((metric, index) => (
                              <View key={index} style={styles.strengthMetricItem}>
                                <Text style={styles.strengthExercise}>{metric.exercise}</Text>
                                <View style={styles.strengthProgressBar}>
                                  <View 
                                    style={[
                                      styles.strengthProgressFill, 
                                      { width: `${((metric.current - metric.start) / (metric.goal - metric.start)) * 100}%` }
                                    ]} 
                                  />
                                </View>
                                <Text style={styles.strengthNumbers}>
                                  {metric.current} / {metric.goal} {metric.unit}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Key Progress Metrics */}
                    <View style={styles.progressSection}>
                      <Text style={styles.progressSectionTitle}>📊 Key Progress Metrics</Text>
                      <View style={styles.keyMetricsContainer}>
                        <View style={styles.metricsSummaryCard}>
                          <Text style={styles.metricsSummaryTitle}>Overall Health Score</Text>
                          <View style={styles.healthScoreCircle}>
                            <Text style={styles.healthScoreValue}>8.4</Text>
                            <Text style={styles.healthScoreMax}>/10</Text>
                          </View>
                          <View style={styles.healthScoreBreakdown}>
                            <View style={styles.scoreBreakdownItem}>
                              <Text style={styles.scoreBreakdownLabel}>Physical</Text>
                              <Text style={styles.scoreBreakdownValue}>8.7</Text>
                            </View>
                            <View style={styles.scoreBreakdownItem}>
                              <Text style={styles.scoreBreakdownLabel}>Mental</Text>
                              <Text style={styles.scoreBreakdownValue}>8.1</Text>
                            </View>
                            <View style={styles.scoreBreakdownItem}>
                              <Text style={styles.scoreBreakdownLabel}>Nutrition</Text>
                              <Text style={styles.scoreBreakdownValue}>8.4</Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.streaksContainer}>
                          <Text style={styles.streaksTitle}>Current Streaks</Text>
                          <View style={styles.streaksList}>
                            {[
                              { name: 'Daily Movement', count: 23, icon: '🏃‍♂️', color: THRIVE_COLORS.primary },
                              { name: 'Hydration Goal', count: 15, icon: '💧', color: THRIVE_COLORS.accent },
                              { name: 'Sleep Schedule', count: 12, icon: '😴', color: '#9C27B0' },
                              { name: 'Mood Check-ins', count: 8, icon: '😊', color: '#FFB800' }
                            ].map((streak, index) => (
                              <View key={index} style={styles.streakItem}>
                                <Text style={styles.streakIcon}>{streak.icon}</Text>
                                <View style={styles.streakInfo}>
                                  <Text style={styles.streakName}>{streak.name}</Text>
                                  <View style={styles.streakCountContainer}>
                                    <Text style={[styles.streakCount, { color: streak.color }]}>{streak.count}</Text>
                                    <Text style={styles.streakDays}>days</Text>
                                  </View>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Monthly Summary */}
                    <View style={styles.progressSection}>
                      <Text style={styles.progressSectionTitle}>📅 This Month's Highlights</Text>
                      <View style={styles.monthlyHighlights}>
                        <View style={styles.highlightCard}>
                          <Text style={styles.highlightTitle}>🎯 Goals Achieved</Text>
                          <Text style={styles.highlightValue}>7 of 10</Text>
                          <Text style={styles.highlightSubtext}>70% completion rate</Text>
                        </View>
                        <View style={styles.highlightCard}>
                          <Text style={styles.highlightTitle}>🔥 Most Active Day</Text>
                          <Text style={styles.highlightValue}>March 15</Text>
                          <Text style={styles.highlightSubtext}>95 minutes active</Text>
                        </View>
                        <View style={styles.highlightCard}>
                          <Text style={styles.highlightTitle}>⭐ Biggest Win</Text>
                          <Text style={styles.highlightValue}>Marathon PR</Text>
                          <Text style={styles.highlightSubtext}>Personal record!</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
                
                {/* Routines Tab Content */}
                {activeProfileTab === 2 && (
                  <View>
                    <Text style={styles.tabContentTitle}>My Success Routines</Text>
                    <Text style={styles.tabContentSubtitle}>3 vital areas customized for your success</Text>
                    
                    {/* Customize Button */}
                    <View style={styles.routineCustomizeSection}>
                      <View 
                        style={styles.customizeRoutinesButton}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={() => setShowRoutineCustomizer(true)}
                      >
                        <Text style={styles.customizeRoutinesText}>⚙️ Customize My 3 Vital Areas</Text>
                      </View>
                    </View>

                    {/* Selected Routines */}
                    <View style={styles.routinesContainer}>
                      {selectedRoutines.map((routineId, index) => {
                        const routine = routineCategories[routineId];
                        if (!routine) return null;
                        
                        return (
                          <View key={routine.id}>
                            <View 
                              style={[
                                styles.routineItem,
                                { borderLeftColor: routine.color },
                                expandedRoutine === routine.id && styles.routineItemExpanded
                              ]}
                              onStartShouldSetResponder={() => true}
                              onResponderGrant={() => {
                                setExpandedRoutine(expandedRoutine === routine.id ? null : routine.id);
                              }}
                            >
                              <View style={styles.routineHeader}>
                                <View style={styles.routineInfo}>
                                  <View style={styles.routineNameRow}>
                                    <Text style={styles.routineIcon}>{routine.icon}</Text>
                                    <Text style={styles.routineName}>{routine.title}</Text>
                                  </View>
                                  <Text style={styles.routineDescription}>{routine.description}</Text>
                                </View>
                                <Text style={[
                                  styles.routineArrow,
                                  expandedRoutine === routine.id && styles.routineArrowExpanded
                                ]}>
                                  {expandedRoutine === routine.id ? '⌄' : '›'}
                                </Text>
                              </View>
                            </View>
                            
                            {/* Expanded Routine Content */}
                            {expandedRoutine === routine.id && (
                              <View style={[styles.routineExpandedContent, { borderLeftColor: routine.color }]}>
                                <View style={styles.routineDetailSection}>
                                  <Text style={styles.routineDetailTitle}>Key Areas Covered:</Text>
                                  {routine.details.map((detail, detailIndex) => {
                                    const detailKey = `${routine.id}-detail-${detailIndex}-full`;
                                    const isExpanded = showDetailedSteps[detailKey];
                                    
                                    return (
                                      <View key={detailIndex}>
                                        <View style={styles.routineDetailItem}>
                                          <Text style={styles.routineDetailBullet}>•</Text>
                                          <View style={styles.routineDetailContent}>
                                            <Text style={styles.routineDetailText}>
                                              {typeof detail === 'object' ? detail.title : detail}
                                            </Text>
                                            {typeof detail === 'object' && detail.steps && (
                                              <View 
                                                style={styles.learnButton}
                                                onStartShouldSetResponder={() => true}
                                                onResponderGrant={() => {
                                                  setShowDetailedSteps(prev => ({
                                                    ...prev,
                                                    [detailKey]: !prev[detailKey]
                                                  }));
                                                }}
                                              >
                                                <Text style={styles.learnButtonText}>
                                                  {isExpanded ? '▲ Hide Steps' : '▼ Learn More'}
                                                </Text>
                                              </View>
                                            )}
                                          </View>
                                        </View>
                                        
                                        {/* Expandable Steps for Routines Tab */}
                                        {isExpanded && typeof detail === 'object' && detail.steps && (
                                          <View style={[styles.routineExpandedSteps, { borderLeftColor: routine.color }]}>
                                            <Text style={styles.routineStepsTitle}>Detailed Steps:</Text>
                                            {detail.steps.map((step, stepIndex) => (
                                              <View key={stepIndex} style={styles.routineStep}>
                                                <View style={[styles.routineStepNumber, { backgroundColor: routine.color }]}>
                                                  <Text style={styles.routineStepNumberText}>{stepIndex + 1}</Text>
                                                </View>
                                                <Text style={styles.routineStepText}>{step}</Text>
                                              </View>
                                            ))}
                                          </View>
                                        )}
                                      </View>
                                    );
                                  })}
                                </View>
                                
                                {routine.tasks && routine.tasks.length > 0 && (
                                  <View style={styles.routineTasksContainer}>
                                    <Text style={styles.routineTasksTitle}>Sample Tasks</Text>
                                    {routine.tasks.map((task, taskIndex) => (
                                      <View key={taskIndex} style={styles.routineTask}>
                                        <View style={styles.routineTaskNumber}>
                                          <Text style={styles.routineTaskNumberText}>{taskIndex + 1}</Text>
                                        </View>
                                        <View style={styles.routineTaskInfo}>
                                          <Text style={styles.routineTaskName}>{task.name}</Text>
                                          <View style={styles.routineTaskMeta}>
                                            <Text style={styles.routineTaskDuration}>{task.duration}</Text>
                                            <Text style={styles.routineTaskDivider}>•</Text>
                                            <Text style={styles.routineTaskType}>{task.type}</Text>
                                            <Text style={styles.routineTaskDivider}>•</Text>
                                            <Text style={[styles.routineTaskDifficulty, 
                                              task.difficulty === 'easy' ? styles.difficultyEasy : 
                                              task.difficulty === 'medium' ? styles.difficultyMedium : styles.difficultyHard
                                            ]}>{task.difficulty}</Text>
                                          </View>
                                          {task.steps && (
                                            <View style={styles.taskStepsContainer}>
                                              {task.steps.map((step, stepIndex) => (
                                                <Text key={stepIndex} style={styles.taskStep}>
                                                  {stepIndex + 1}. {step}
                                                </Text>
                                              ))}
                                            </View>
                                          )}
                                        </View>
                                      </View>
                                    ))}
                                  </View>
                                )}
                                
                                <View style={styles.routineActions}>
                                  <View 
                                    style={styles.routineActionRow}
                                  >
                                    <View 
                                      style={[styles.routineEditButton, { borderColor: routine.color }]}
                                      onStartShouldSetResponder={() => true}
                                      onResponderGrant={() => {
                                        setEditingRoutineId(routine.id);
                                        setShowRoutineEditor(true);
                                      }}
                                    >
                                      <Text style={[styles.routineEditButtonText, { color: routine.color }]}>✏️ Customize</Text>
                                    </View>
                                    <View 
                                      style={[styles.routineStartButton, { backgroundColor: routine.color }]}
                                      onStartShouldSetResponder={() => true}
                                      onResponderGrant={() => {
                                        setShowTaskStarter(`${routine.id}-main`);
                                      }}
                                    >
                                      <Text style={styles.routineStartButtonText}>▶️ Start Routine</Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
                
                {/* Q&A Tab Content */}
                {activeProfileTab === 3 && (
                  <View>
                    <View style={styles.qaTabHeader}>
                      <Text style={styles.tabContentTitle}>Questions & Answers</Text>
                      <View 
                        style={styles.notificationBadge}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={() => setShowQuestionManager(true)}
                      >
                        <Text style={styles.notificationBadgeText}>
                          {getUnansweredQuestionsCount()}
                        </Text>
                        <Text style={styles.notificationBadgeLabel}>new</Text>
                      </View>
                    </View>
                    <Text style={styles.tabContentSubtitle}>Manage your questions and answers</Text>
                    
                    {/* Question Management Actions */}
                    <View style={styles.qaActions}>
                      <View 
                        style={styles.qaActionButton}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={() => setShowQuestionManager(true)}
                      >
                        <Text style={styles.qaActionButtonText}>
                          📥 Manage Questions ({getUnansweredQuestionsCount()})
                        </Text>
                      </View>
                      <View 
                        style={styles.qaActionButton}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={handleAskQuestion}
                      >
                        <Text style={styles.qaActionButtonText}>❓ Ask Question</Text>
                      </View>
                    </View>

                    {/* Answered Questions Display */}
                    <View style={styles.answeredQuestionsSection}>
                      <Text style={styles.sectionTitle}>Answered Questions</Text>
                      {getAnsweredQuestions().length > 0 ? (
                        <View style={styles.answeredQuestionsList}>
                          {getAnsweredQuestions().map((qa) => (
                            <View key={qa.id} style={styles.answeredQuestionCard}>
                              <View style={styles.questionHeader}>
                                <Text style={styles.questionAsker}>From {qa.asker}</Text>
                                <Text style={styles.questionTimestamp}>
                                  {qa.timestamp.toLocaleDateString()}
                                </Text>
                              </View>
                              <View style={styles.questionContent}>
                                <Text style={styles.questionText}>Q: {qa.question}</Text>
                                <Text style={styles.answerText}>A: {qa.answer}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <View style={styles.noQuestionsCard}>
                          <Text style={styles.noQuestionsIcon}>💬</Text>
                          <Text style={styles.noQuestionsTitle}>No Answered Questions</Text>
                          <Text style={styles.noQuestionsSubtitle}>
                            Questions you answer will appear here for others to see
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              
              </View>
            </ScrollView>
          </View>
          
          {/* Dashboard Page */}
          {/* Dashboard Page - Pure white */}
          <View style={[styles.page, { backgroundColor: THRIVE_COLORS.white }]}>
            {/* Dashboard Grid Container - 2x2 Grid */}
            <View style={styles.dashboardContainer}>
              
              {/* Date Range Toggle Buttons */}
              {!showGraph && (
                <View style={styles.dateRangeButtonContainer}>
                  <View 
                    style={[styles.dateRangeButton, dateRange === 'week' ? styles.activeDateButton : styles.inactiveDateButton]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => {
                      console.log('Week range selected');
                      setDateRange('week');
                    }}
                  >
                    <Text style={[styles.dateRangeButtonText, dateRange === 'week' ? styles.activeDateButtonText : styles.inactiveDateButtonText]}>
                      WEEK
                    </Text>
                  </View>
                  
                  <View 
                    style={[styles.dateRangeButton, dateRange === 'month' ? styles.activeDateButton : styles.inactiveDateButton]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => {
                      console.log('Month range selected');
                      setDateRange('month');
                    }}
                  >
                    <Text style={[styles.dateRangeButtonText, dateRange === 'month' ? styles.activeDateButtonText : styles.inactiveDateButtonText]}>
                      MONTH
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Show either grid view or expanded card view */}
              {!showGraph ? (
                /* Normal 2x2 Grid */
                <Animated.View 
                  style={[
                    styles.dashboardGrid,
                    {
                      transform: [{ scale: cardScale }],
                      opacity: cardOpacity,
                    }
                  ]}
                >
                
                {/* Dynamic Cards Based on Mode */}
                {getCurrentCardTypes().map((cardType, index) => {
                  const cardInfo = getCardInfo(cardType);
                  const cardStyleMap = challengeMode === 'fitness' ? {
                    0: styles.weightCard, // Green
                    1: styles.goalCard,   // Blue
                    2: styles.tasksCard,  // Orange
                    3: styles.streakCard  // Purple
                  } : {
                    0: styles.mindfulnessCard, // Purple (different from fitness)
                    1: styles.moodCard,        // Orange-Red
                    2: styles.learningCard,    // Cyan
                    3: styles.gratitudeCard    // Amber
                  };
                  
                  return (
                    <View 
                      key={`${challengeMode}-${cardType}`}
                      style={[styles.dashboardCard, cardStyleMap[index]]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={() => {
                        // Prevent opening if cards are disabled or animating
                        if (cardsDisabled || isAnimating) {
                          console.log('Card opening disabled - animation in progress or waiting');
                          return;
                        }
                        
                        console.log(`${cardInfo.title} card clicked - starting smooth animation!`);
                        animateCardOpen(cardType);
                      }}
                    >
                      {/* Card Header */}
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>{cardInfo.icon}</Text>
                      </View>
                      
                      {/* Main Content */}
                      <View style={styles.cardContent}>
                        <Text style={[styles.cardMainValue, challengeMode === 'fitness' ? 
                          (index === 0 ? styles.weightMainValue : index === 1 ? styles.goalMainValue : index === 2 ? styles.tasksMainValue : styles.streakMainValue) :
                          (index === 0 ? styles.mindfulnessMainValue : index === 1 ? styles.moodMainValue : index === 2 ? styles.learningMainValue : styles.gratitudeMainValue)
                        ]}>
                          {getCardDisplayValue(cardType)}
                        </Text>
                        
                        <Text style={[styles.cardLabel, challengeMode === 'fitness' ?
                          (index === 0 ? styles.weightLabel : index === 1 ? styles.goalLabel : index === 2 ? styles.tasksLabel : styles.streakLabel) :
                          (index === 0 ? styles.mindfulnessLabel : index === 1 ? styles.moodLabel : index === 2 ? styles.learningLabel : styles.gratitudeLabel)
                        ]}>
                          {cardInfo.title}
                        </Text>
                        
                        <Text style={[styles.cardSubtext, challengeMode === 'fitness' ?
                          (index === 0 ? styles.weightSubtext : index === 1 ? styles.goalSubtext : index === 2 ? styles.tasksSubtext : styles.streakSubtext) :
                          (index === 0 ? styles.mindfulnessSubtext : index === 1 ? styles.moodSubtext : index === 2 ? styles.learningSubtext : styles.gratitudeSubtext)
                        ]}>
                          {getCardSubtitle(cardType)}
                        </Text>
                      </View>
                      
                      {/* Progress Bar */}
                      <View style={styles.progressBarContainer}>
                        <View 
                          style={[
                            styles.progressBar, 
                            challengeMode === 'fitness' ?
                              (index === 0 ? styles.weightProgressBar : index === 1 ? styles.goalProgressBar : index === 2 ? styles.tasksProgressBar : styles.streakProgressBar) :
                              (index === 0 ? styles.mindfulnessProgressBar : index === 1 ? styles.moodProgressBar : index === 2 ? styles.learningProgressBar : styles.gratitudeProgressBar),
                            { width: `${Math.min(getCardProgressPercentage(cardType), 100)}%` }
                          ]} 
                        />
                      </View>
                    </View>
                  );
                })}
                

                
                </Animated.View>
              ) : (
                /* Expanded Card View */
                <Animated.View 
                  style={[
                    styles.expandedCardContainer,
                    {
                      transform: [{ scale: expandedCardScale }],
                      opacity: expandedCardOpacity,
                    }
                  ]}
                >
                  {selectedCard === 'weight' && (
                    <View 
                      style={[styles.expandedCard, styles.expandedWeightCard]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={closeGraphView}
                    >
                      {/* Expanded Card Header */}
                      <View style={styles.expandedCardHeader}>
                        <View style={styles.expandedCardTitleSection}>
                          <Text style={styles.expandedCardIcon}>⚖️</Text>
                          <View>
                            <Text style={[styles.expandedCardTitle, styles.weightTitle]}>WEIGHT</Text>
                            <Text style={[styles.expandedCardValue, styles.weightValue]}>
                              {dashboardData.weight.current || 150} lbs
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      {/* Graph inside expanded card */}
                      <View style={styles.expandedCardGraph}>
                        <Text style={styles.expandedGraphTitle}>{dateRange === 'week' ? '7-Day' : '30-Day'} Progress</Text>
                        {dateRange === 'week' ? (
                          /* Bar Chart for Week View */
                          <View style={styles.expandedGraphArea}>
                            {generateGraphData('weight').map((point, index) => {
                              const allData = generateGraphData('weight');
                              const maxValue = Math.max(...allData.map(p => p.value));
                              const minValue = Math.min(...allData.map(p => p.value));
                              const normalizedHeight = ((point.value - minValue) / Math.max(maxValue - minValue, 1)) * 60 + 20;
                              
                              return (
                                <View key={index} style={styles.expandedGraphColumn}>
                                  <View 
                                    style={[styles.expandedGraphBar, {
                                      height: normalizedHeight,
                                      backgroundColor: '#34C759'
                                    }]}
                                  />
                                  <Text style={styles.expandedGraphLabel}>{point.date.split(' ')[1]}</Text>
                                  <Text style={styles.expandedGraphValue}>{Math.round(point.value)}lbs</Text>
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          /* Line Graph for Month View */
                          <View style={styles.lineGraphContainer}>
                            <View style={styles.lineGraphArea}>
                              {/* Render line path */}
                              {generateGraphData('weight').map((point, index, array) => {
                                const allData = array;
                                const maxValue = Math.max(...allData.map(p => p.value));
                                const minValue = Math.min(...allData.map(p => p.value));
                                const normalizedY = 100 - (((point.value - minValue) / Math.max(maxValue - minValue, 1)) * 80);
                                const x = (index / (array.length - 1)) * 100;
                                
                                return (
                                  <View key={index}>
                                    {/* Data Point */}
                                    <View 
                                      style={[styles.lineGraphPoint, {
                                        left: `${x}%`,
                                        top: `${normalizedY}%`,
                                        backgroundColor: '#34C759'
                                      }]}
                                    />
                                    {/* Line to next point */}
                                    {index < array.length - 1 && (
                                      <View 
                                        style={[styles.lineGraphLine, {
                                          left: `${x}%`,
                                          top: `${normalizedY}%`,
                                          width: `${100 / (array.length - 1)}%`,
                                          backgroundColor: '#34C759'
                                        }]}
                                      />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                            {/* Show min/max values */}
                            <View style={styles.lineGraphLabels}>
                              <Text style={styles.lineGraphStartLabel}>
                                {generateGraphData('weight')[0]?.date.split(' ')[1]}
                              </Text>
                              <Text style={styles.lineGraphEndLabel}>
                                {generateGraphData('weight')[generateGraphData('weight').length - 1]?.date.split(' ')[1]}
                              </Text>
                            </View>
                            <Text style={styles.lineGraphSummary}>
                              Avg: {Math.round(generateGraphData('weight').reduce((sum, p) => sum + p.value, 0) / generateGraphData('weight').length)} lbs
                            </Text>
                          </View>
                        )}
                        <Text style={styles.expandedGraphGoal}>Goal: {dashboardData.weight.goal || 145} lbs</Text>
                      </View>
                    </View>
                  )}
                  
                  {selectedCard === 'goal' && (
                    <View 
                      style={[styles.expandedCard, styles.expandedGoalCard]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={closeGraphView}
                    >
                      <View style={styles.expandedCardHeader}>
                        <View style={styles.expandedCardTitleSection}>
                          <Text style={styles.expandedCardIcon}>🎯</Text>
                          <View>
                            <Text style={[styles.expandedCardTitle, styles.goalTitle]}>PROGRESS</Text>
                            <Text style={[styles.expandedCardValue, styles.goalValue]}>
                              {Math.round(dashboardData.goalProgress.percentage || 0)}%
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.expandedCardGraph}>
                        <Text style={styles.expandedGraphTitle}>{dateRange === 'week' ? '7-Day' : '30-Day'} Achievement Progress</Text>
                        {dateRange === 'week' ? (
                          /* Bar Chart for Week View */
                          <View style={styles.expandedGraphArea}>
                            {generateGraphData('goal').map((point, index) => {
                              const normalizedHeight = (point.value / 100) * 60 + 20;
                              
                              return (
                                <View key={index} style={styles.expandedGraphColumn}>
                                  <View 
                                    style={[styles.expandedGraphBar, {
                                      height: normalizedHeight,
                                      backgroundColor: '#2196F3'
                                    }]}
                                  />
                                  <Text style={styles.expandedGraphLabel}>{point.date.split(' ')[1]}</Text>
                                  <Text style={styles.expandedGraphValue}>{Math.round(point.value)}%</Text>
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          /* Line Graph for Month View */
                          <View style={styles.lineGraphContainer}>
                            <View style={styles.lineGraphArea}>
                              {generateGraphData('goal').map((point, index, array) => {
                                const normalizedY = 100 - (point.value * 0.8);
                                const x = (index / (array.length - 1)) * 100;
                                
                                return (
                                  <View key={index}>
                                    <View 
                                      style={[styles.lineGraphPoint, {
                                        left: `${x}%`,
                                        top: `${normalizedY}%`,
                                        backgroundColor: '#2196F3'
                                      }]}
                                    />
                                    {index < array.length - 1 && (
                                      <View 
                                        style={[styles.lineGraphLine, {
                                          left: `${x}%`,
                                          top: `${normalizedY}%`,
                                          width: `${100 / (array.length - 1)}%`,
                                          backgroundColor: '#2196F3'
                                        }]}
                                      />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                            <View style={styles.lineGraphLabels}>
                              <Text style={styles.lineGraphStartLabel}>
                                {generateGraphData('goal')[0]?.date.split(' ')[1]}
                              </Text>
                              <Text style={styles.lineGraphEndLabel}>
                                {generateGraphData('goal')[generateGraphData('goal').length - 1]?.date.split(' ')[1]}
                              </Text>
                            </View>
                            <Text style={styles.lineGraphSummary}>
                              Avg: {Math.round(generateGraphData('goal').reduce((sum, p) => sum + p.value, 0) / generateGraphData('goal').length)}%
                            </Text>
                          </View>
                        )}
                        <Text style={styles.expandedGraphGoal}>Target: {dashboardData.goalProgress.type || 'Weight Loss'}</Text>
                      </View>
                    </View>
                  )}
                  
                  {selectedCard === 'tasks' && (
                    <View 
                      style={[styles.expandedCard, styles.expandedTasksCard]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={closeGraphView}
                    >
                      <View style={styles.expandedCardHeader}>
                        <View style={styles.expandedCardTitleSection}>
                          <Text style={styles.expandedCardIcon}>✅</Text>
                          <View>
                            <Text style={[styles.expandedCardTitle, styles.tasksTitle]}>TODAY</Text>
                            <Text style={[styles.expandedCardValue, styles.tasksValue]}>
                              {dashboardData.todayTasks.completed}/{dashboardData.todayTasks.total}
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.expandedCardGraph}>
                        <Text style={styles.expandedGraphTitle}>{dateRange === 'week' ? '7-Day' : '30-Day'} Task Completion</Text>
                        {dateRange === 'week' ? (
                          <View style={styles.expandedGraphArea}>
                            {generateGraphData('tasks').map((point, index) => {
                              const normalizedHeight = (point.value / 4) * 60 + 20;
                              
                              return (
                                <View key={index} style={styles.expandedGraphColumn}>
                                  <View 
                                    style={[styles.expandedGraphBar, {
                                      height: normalizedHeight,
                                      backgroundColor: '#FF9800'
                                    }]}
                                  />
                                  <Text style={styles.expandedGraphLabel}>{point.date.split(' ')[1]}</Text>
                                  <Text style={styles.expandedGraphValue}>{point.value}</Text>
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          <View style={styles.lineGraphContainer}>
                            <View style={styles.lineGraphArea}>
                              {generateGraphData('tasks').map((point, index, array) => {
                                const normalizedY = 100 - ((point.value / 4) * 80);
                                const x = (index / (array.length - 1)) * 100;
                                
                                return (
                                  <View key={index}>
                                    <View 
                                      style={[styles.lineGraphPoint, {
                                        left: `${x}%`,
                                        top: `${normalizedY}%`,
                                        backgroundColor: '#FF9800'
                                      }]}
                                    />
                                    {index < array.length - 1 && (
                                      <View 
                                        style={[styles.lineGraphLine, {
                                          left: `${x}%`,
                                          top: `${normalizedY}%`,
                                          width: `${100 / (array.length - 1)}%`,
                                          backgroundColor: '#FF9800'
                                        }]}
                                      />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                            <View style={styles.lineGraphLabels}>
                              <Text style={styles.lineGraphStartLabel}>
                                {generateGraphData('tasks')[0]?.date.split(' ')[1]}
                              </Text>
                              <Text style={styles.lineGraphEndLabel}>
                                {generateGraphData('tasks')[generateGraphData('tasks').length - 1]?.date.split(' ')[1]}
                              </Text>
                            </View>
                            <Text style={styles.lineGraphSummary}>
                              Avg: {Math.round(generateGraphData('tasks').reduce((sum, p) => sum + p.value, 0) / generateGraphData('tasks').length)} tasks/day
                            </Text>
                          </View>
                        )}
                        <Text style={styles.expandedGraphGoal}>Tasks: {dashboardData.todayTasks.tasks.join(', ')}</Text>
                      </View>
                    </View>
                  )}
                  
                  {selectedCard === 'streak' && (
                    <View 
                      style={[styles.expandedCard, styles.expandedStreakCard]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={closeGraphView}
                    >
                      <View style={styles.expandedCardHeader}>
                        <View style={styles.expandedCardTitleSection}>
                          <Text style={styles.expandedCardIcon}>🔥</Text>
                          <View>
                            <Text style={[styles.expandedCardTitle, styles.streakTitle]}>STREAK</Text>
                            <Text style={[styles.expandedCardValue, styles.streakValue]}>
                              {dashboardData.streakCounter.current || 0} days
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.expandedCardGraph}>
                        <Text style={styles.expandedGraphTitle}>{dateRange === 'week' ? '7-Day' : '30-Day'} Logging Consistency</Text>
                        {dateRange === 'week' ? (
                          <View style={styles.expandedGraphArea}>
                            {generateGraphData('streak').map((point, index) => {
                              const maxStreak = Math.max(...generateGraphData('streak').map(p => p.value));
                              const normalizedHeight = (point.value / Math.max(maxStreak, 1)) * 60 + 20;
                              
                              return (
                                <View key={index} style={styles.expandedGraphColumn}>
                                  <View 
                                    style={[styles.expandedGraphBar, {
                                      height: normalizedHeight,
                                      backgroundColor: '#9C27B0'
                                    }]}
                                  />
                                  <Text style={styles.expandedGraphLabel}>{point.date.split(' ')[1]}</Text>
                                  <Text style={styles.expandedGraphValue}>{point.value}</Text>
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          <View style={styles.lineGraphContainer}>
                            <View style={styles.lineGraphArea}>
                              {generateGraphData('streak').map((point, index, array) => {
                                const maxStreak = Math.max(...array.map(p => p.value));
                                const normalizedY = 100 - ((point.value / Math.max(maxStreak, 1)) * 80);
                                const x = (index / (array.length - 1)) * 100;
                                
                                return (
                                  <View key={index}>
                                    <View 
                                      style={[styles.lineGraphPoint, {
                                        left: `${x}%`,
                                        top: `${normalizedY}%`,
                                        backgroundColor: '#9C27B0'
                                      }]}
                                    />
                                    {index < array.length - 1 && (
                                      <View 
                                        style={[styles.lineGraphLine, {
                                          left: `${x}%`,
                                          top: `${normalizedY}%`,
                                          width: `${100 / (array.length - 1)}%`,
                                          backgroundColor: '#9C27B0'
                                        }]}
                                      />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                            <View style={styles.lineGraphLabels}>
                              <Text style={styles.lineGraphStartLabel}>
                                {generateGraphData('streak')[0]?.date.split(' ')[1]}
                              </Text>
                              <Text style={styles.lineGraphEndLabel}>
                                {generateGraphData('streak')[generateGraphData('streak').length - 1]?.date.split(' ')[1]}
                              </Text>
                            </View>
                            <Text style={styles.lineGraphSummary}>
                              Current: {generateGraphData('streak')[generateGraphData('streak').length - 1]?.value} days
                            </Text>
                          </View>
                        )}
                        <Text style={styles.expandedGraphGoal}>Keep the momentum going!</Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Mental Health Card Expanded Views */}
                  {selectedCard === 'mindfulness' && (
                    <View 
                      style={[styles.expandedCard, styles.expandedMindfulnessCard]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={closeGraphView}
                    >
                      <View style={styles.expandedCardHeader}>
                        <View style={styles.expandedCardTitleSection}>
                          <Text style={styles.expandedCardIcon}>🧘</Text>
                          <View>
                            <Text style={[styles.expandedCardTitle, styles.mindfulnessTitle]}>MINDFULNESS</Text>
                            <Text style={[styles.expandedCardValue, styles.mindfulnessValue]}>
                              {mentalData.mindfulness.current || 0} min
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.expandedCardGraph}>
                        <Text style={styles.expandedGraphTitle}>{dateRange === 'week' ? '7-Day' : '30-Day'} Mindfulness Practice</Text>
                        {dateRange === 'week' ? (
                          <View style={styles.expandedGraphArea}>
                            {generateGraphData('mindfulness').map((point, index) => {
                              const maxValue = Math.max(...generateGraphData('mindfulness').map(p => p.value));
                              const normalizedHeight = (point.value / Math.max(maxValue, 1)) * 60 + 20;
                              
                              return (
                                <View key={index} style={styles.expandedGraphColumn}>
                                  <View 
                                    style={[styles.expandedGraphBar, {
                                      height: normalizedHeight,
                                      backgroundColor: '#D32F2F'
                                    }]}
                                  />
                                  <Text style={styles.expandedGraphLabel}>{point.date.split(' ')[1]}</Text>
                                  <Text style={styles.expandedGraphValue}>{point.value}m</Text>
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          <View style={styles.lineGraphContainer}>
                            <View style={styles.lineGraphArea}>
                              {generateGraphData('mindfulness').map((point, index, array) => {
                                const maxValue = Math.max(...array.map(p => p.value));
                                const normalizedY = 100 - ((point.value / Math.max(maxValue, 1)) * 80);
                                const x = (index / (array.length - 1)) * 100;
                                
                                return (
                                  <View key={index}>
                                    <View 
                                      style={[styles.lineGraphPoint, {
                                        left: `${x}%`,
                                        top: `${normalizedY}%`,
                                        backgroundColor: '#D32F2F'
                                      }]}
                                    />
                                    {index < array.length - 1 && (
                                      <View 
                                        style={[styles.lineGraphLine, {
                                          left: `${x}%`,
                                          top: `${normalizedY}%`,
                                          width: `${100 / (array.length - 1)}%`,
                                          backgroundColor: '#D32F2F'
                                        }]}
                                      />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                            <View style={styles.lineGraphLabels}>
                              <Text style={styles.lineGraphStartLabel}>
                                {generateGraphData('mindfulness')[0]?.date.split(' ')[1]}
                              </Text>
                              <Text style={styles.lineGraphEndLabel}>
                                {generateGraphData('mindfulness')[generateGraphData('mindfulness').length - 1]?.date.split(' ')[1]}
                              </Text>
                            </View>
                            <Text style={styles.lineGraphSummary}>
                              Avg: {Math.round(generateGraphData('mindfulness').reduce((sum, p) => sum + p.value, 0) / generateGraphData('mindfulness').length)} min/day
                            </Text>
                          </View>
                        )}
                        <Text style={styles.expandedGraphGoal}>Target: {mentalData.mindfulness.goal || 20} minutes daily</Text>
                      </View>
                    </View>
                  )}
                  
                  {selectedCard === 'mood' && (
                    <View 
                      style={[styles.expandedCard, styles.expandedMoodCard]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={closeGraphView}
                    >
                      <View style={styles.expandedCardHeader}>
                        <View style={styles.expandedCardTitleSection}>
                          <Text style={styles.expandedCardIcon}>😊</Text>
                          <View>
                            <Text style={[styles.expandedCardTitle, styles.moodTitle]}>MOOD</Text>
                            <Text style={[styles.expandedCardValue, styles.moodValue]}>
                              {mentalData.mood.current || 7}/10
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.expandedCardGraph}>
                        <Text style={styles.expandedGraphTitle}>{dateRange === 'week' ? '7-Day' : '30-Day'} Mood Progress</Text>
{dateRange === 'week' ? (
                          <View style={styles.expandedGraphArea}>
                            {generateGraphData('mood').map((point, index) => {
                              const normalizedHeight = (point.value / 10) * 60 + 20;
                              
                              return (
                                <View key={index} style={styles.expandedGraphColumn}>
                                  <View 
                                    style={[styles.expandedGraphBar, {
                                      height: normalizedHeight,
                                      backgroundColor: '#7B1FA2'
                                    }]}
                                  />
                                  <Text style={styles.expandedGraphLabel}>{point.date.split(' ')[1]}</Text>
                                  <Text style={styles.expandedGraphValue}>{point.value}/10</Text>
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          <View style={styles.lineGraphContainer}>
                            <View style={styles.lineGraphArea}>
                              {generateGraphData('mood').map((point, index, array) => {
                                const normalizedY = 100 - ((point.value / 10) * 80);
                                const x = (index / (array.length - 1)) * 100;
                                
                                return (
                                  <View key={index}>
                                    <View 
                                      style={[styles.lineGraphPoint, {
                                        left: `${x}%`,
                                        top: `${normalizedY}%`,
                                        backgroundColor: '#7B1FA2'
                                      }]}
                                    />
                                    {index < array.length - 1 && (
                                      <View 
                                        style={[styles.lineGraphLine, {
                                          left: `${x}%`,
                                          top: `${normalizedY}%`,
                                          width: `${100 / (array.length - 1)}%`,
                                          backgroundColor: '#7B1FA2'
                                        }]}
                                      />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                            <View style={styles.lineGraphLabels}>
                              <Text style={styles.lineGraphStartLabel}>
                                {generateGraphData('mood')[0]?.date.split(' ')[1]}
                              </Text>
                              <Text style={styles.lineGraphEndLabel}>
                                {generateGraphData('mood')[generateGraphData('mood').length - 1]?.date.split(' ')[1]}
                              </Text>
                            </View>
                            <Text style={styles.lineGraphSummary}>
                              Avg: {(generateGraphData('mood').reduce((sum, p) => sum + p.value, 0) / generateGraphData('mood').length).toFixed(1)}/10
                            </Text>
                          </View>
                        )}
                        <Text style={styles.expandedGraphGoal}>Average: {mentalData.mood.average || 6.8}/10 this week</Text>
                      </View>
                    </View>
                  )}
                  
                  {selectedCard === 'learning' && (
                    <View 
                      style={[styles.expandedCard, styles.expandedLearningCard]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={closeGraphView}
                    >
                      <View style={styles.expandedCardHeader}>
                        <View style={styles.expandedCardTitleSection}>
                          <Text style={styles.expandedCardIcon}>📚</Text>
                          <View>
                            <Text style={[styles.expandedCardTitle, styles.learningTitle]}>LEARNING</Text>
                            <Text style={[styles.expandedCardValue, styles.learningValue]}>
                              {mentalData.learning.completed || 0}/{mentalData.learning.goal || 3}
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.expandedCardGraph}>
                        <Text style={styles.expandedGraphTitle}>{dateRange === 'week' ? '7-Day' : '30-Day'} Learning Activity</Text>
{dateRange === 'week' ? (
                          <View style={styles.expandedGraphArea}>
                            {generateGraphData('learning').map((point, index) => {
                              const normalizedHeight = (point.value / 3) * 60 + 20;
                              
                              return (
                                <View key={index} style={styles.expandedGraphColumn}>
                                  <View 
                                    style={[styles.expandedGraphBar, {
                                      height: normalizedHeight,
                                      backgroundColor: '#F57C00'
                                    }]}
                                  />
                                  <Text style={styles.expandedGraphLabel}>{point.date.split(' ')[1]}</Text>
                                  <Text style={styles.expandedGraphValue}>{point.value}</Text>
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          <View style={styles.lineGraphContainer}>
                            <View style={styles.lineGraphArea}>
                              {generateGraphData('learning').map((point, index, array) => {
                                const normalizedY = 100 - ((point.value / 3) * 80);
                                const x = (index / (array.length - 1)) * 100;
                                
                                return (
                                  <View key={index}>
                                    <View 
                                      style={[styles.lineGraphPoint, {
                                        left: `${x}%`,
                                        top: `${normalizedY}%`,
                                        backgroundColor: '#F57C00'
                                      }]}
                                    />
                                    {index < array.length - 1 && (
                                      <View 
                                        style={[styles.lineGraphLine, {
                                          left: `${x}%`,
                                          top: `${normalizedY}%`,
                                          width: `${100 / (array.length - 1)}%`,
                                          backgroundColor: '#F57C00'
                                        }]}
                                      />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                            <View style={styles.lineGraphLabels}>
                              <Text style={styles.lineGraphStartLabel}>
                                {generateGraphData('learning')[0]?.date.split(' ')[1]}
                              </Text>
                              <Text style={styles.lineGraphEndLabel}>
                                {generateGraphData('learning')[generateGraphData('learning').length - 1]?.date.split(' ')[1]}
                              </Text>
                            </View>
                            <Text style={styles.lineGraphSummary}>
                              Total: {generateGraphData('learning').reduce((sum, p) => sum + p.value, 0)} items this month
                            </Text>
                          </View>
                        )}
                        <Text style={styles.expandedGraphGoal}>Streak: {mentalData.learning.streak || 8} days of continuous learning</Text>
                      </View>
                    </View>
                  )}
                  
                  {selectedCard === 'gratitude' && (
                    <View 
                      style={[styles.expandedCard, styles.expandedGratitudeCard]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={closeGraphView}
                    >
                      <View style={styles.expandedCardHeader}>
                        <View style={styles.expandedCardTitleSection}>
                          <Text style={styles.expandedCardIcon}>🙏</Text>
                          <View>
                            <Text style={[styles.expandedCardTitle, styles.gratitudeTitle]}>GRATITUDE</Text>
                            <Text style={[styles.expandedCardValue, styles.gratitudeValue]}>
                              {mentalData.gratitude.entries || 0} entries
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.expandedCardGraph}>
                        <Text style={styles.expandedGraphTitle}>{dateRange === 'week' ? '7-Day' : '30-Day'} Gratitude Practice</Text>
{dateRange === 'week' ? (
                          <View style={styles.expandedGraphArea}>
                            {generateGraphData('gratitude').map((point, index) => {
                              const maxEntries = Math.max(...generateGraphData('gratitude').map(p => p.value));
                              const normalizedHeight = (point.value / Math.max(maxEntries, 1)) * 60 + 20;
                              
                              return (
                                <View key={index} style={styles.expandedGraphColumn}>
                                  <View 
                                    style={[styles.expandedGraphBar, {
                                      height: normalizedHeight,
                                      backgroundColor: '#388E3C'
                                    }]}
                                  />
                                  <Text style={styles.expandedGraphLabel}>{point.date.split(' ')[1]}</Text>
                                  <Text style={styles.expandedGraphValue}>{point.value}</Text>
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          <View style={styles.lineGraphContainer}>
                            <View style={styles.lineGraphArea}>
                              {generateGraphData('gratitude').map((point, index, array) => {
                                const maxEntries = Math.max(...array.map(p => p.value));
                                const normalizedY = 100 - ((point.value / Math.max(maxEntries, 1)) * 80);
                                const x = (index / (array.length - 1)) * 100;
                                
                                return (
                                  <View key={index}>
                                    <View 
                                      style={[styles.lineGraphPoint, {
                                        left: `${x}%`,
                                        top: `${normalizedY}%`,
                                        backgroundColor: '#388E3C'
                                      }]}
                                    />
                                    {index < array.length - 1 && (
                                      <View 
                                        style={[styles.lineGraphLine, {
                                          left: `${x}%`,
                                          top: `${normalizedY}%`,
                                          width: `${100 / (array.length - 1)}%`,
                                          backgroundColor: '#388E3C'
                                        }]}
                                      />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                            <View style={styles.lineGraphLabels}>
                              <Text style={styles.lineGraphStartLabel}>
                                {generateGraphData('gratitude')[0]?.date.split(' ')[1]}
                              </Text>
                              <Text style={styles.lineGraphEndLabel}>
                                {generateGraphData('gratitude')[generateGraphData('gratitude').length - 1]?.date.split(' ')[1]}
                              </Text>
                            </View>
                            <Text style={styles.lineGraphSummary}>
                              Avg: {(generateGraphData('gratitude').reduce((sum, p) => sum + p.value, 0) / generateGraphData('gratitude').length).toFixed(1)} entries/day
                            </Text>
                          </View>
                        )}
                        <Text style={styles.expandedGraphGoal}>Goal: {mentalData.gratitude.goal || 3} entries daily</Text>
                      </View>
                    </View>
                  )}
                </Animated.View>
              )}
              

              
              {/* Dynamic Goal Cards - Short-term (week) / Long-term (month) */}
              {!showGraph && (
                <View style={styles.customGoalsContainer}>
                  <Text style={styles.customGoalsTitle}>
                    {dateRange === 'week' ? 'Short-Term Goals' : 'Long-Term Goals'}
                  </Text>
                  <View style={styles.customGoalsGrid}>
                    {getCurrentGoals().map((goal, index) => (
                      <View 
                        key={goal.id}
                        style={[styles.customGoalCard, { borderLeftColor: goal.color, borderLeftWidth: 4 }]}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={() => {
                          console.log(`Custom goal ${goal.title} tapped`);
                          // TODO: Add goal editing functionality
                        }}
                      >
                        <View style={styles.customGoalHeader}>
                          <Text style={styles.customGoalIcon}>{goal.icon}</Text>
                          <Text style={[styles.customGoalTitle, { color: goal.color }]}>{goal.title}</Text>
                        </View>
                        
                        <View style={styles.customGoalContent}>
                          <Text style={[styles.customGoalValue, { color: goal.color }]}>
                            {goal.currentValue}
                            {goal.unit === 'hours' ? 'h' : 
                             goal.unit === 'steps' ? '' : 
                             goal.unit === 'kcal' ? '' :
                             goal.unit === 'lbs lost' ? '' :
                             goal.unit}
                          </Text>
                          <Text style={styles.customGoalTarget}>
                            of {goal.targetValue} {goal.unit === 'hours' ? 'hrs' : goal.unit}
                          </Text>
                          <Text style={styles.customGoalTimeframe}>
                            {goal.timeframe}
                          </Text>
                        </View>
                        
                        <View style={styles.customGoalProgressContainer}>
                          <View 
                            style={[styles.customGoalProgressBar, {
                              width: `${Math.min(goal.progress, 100)}%`,
                              backgroundColor: goal.color
                            }]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Mode Toggle Buttons - Moved to bottom */}
              {!showGraph && (
                <View style={styles.modeButtonContainer}>
                  <View 
                    style={[styles.modeButton, challengeMode === 'fitness' ? styles.activeButton : styles.inactiveButton]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => {
                      console.log('Fitness mode selected');
                      setChallengeMode('fitness');
                    }}
                  >
                    <Text style={[styles.modeButtonText, challengeMode === 'fitness' ? styles.activeButtonText : styles.inactiveButtonText]}>
                      FITNESS
                    </Text>
                  </View>
                  
                  <View 
                    style={[styles.modeButton, challengeMode === 'mental' ? styles.activeButton : styles.inactiveButton]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => {
                      console.log('Mental mode selected');
                      setChallengeMode('mental');
                    }}
                  >
                    <Text style={[styles.modeButtonText, challengeMode === 'mental' ? styles.activeButtonText : styles.inactiveButtonText]}>
                      MENTAL
                    </Text>
                  </View>
                </View>
              )}
              </View>
          </View>
          
          {/* Goals Page */}
          {/* Goals Page - Light tint of primary green */}
          <View style={[styles.page, { backgroundColor: '#F8FCF8' }]}>
            <Text style={[styles.pageLabel, { color: THRIVE_COLORS.black }]}>Goals</Text>
            <Text style={[styles.pageDescription, { color: THRIVE_COLORS.black }]}>Set and track your wellness goals</Text>
          </View>
          
          {/* Social Page */}
          {/* Social Page - Light tint of accent blue */}
          <View style={[styles.page, { backgroundColor: '#F0F7FF' }]}>
            <Text style={[styles.pageLabel, { color: THRIVE_COLORS.black }]}>Social</Text>
            <Text style={[styles.pageDescription, { color: THRIVE_COLORS.black }]}>Connect with the community</Text>
          </View>
        </Animated.View>
      </View>
      
      {/* Page Indicators */}
      <View style={styles.indicators}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicatorWrapper,
              { cursor: 'pointer' } // Web-specific cursor style
            ]}
            // Web-compatible click handler
            onTouchStart={() => goToPage(index)}
            onClick={() => goToPage(index)}
          >
            <View
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentPage ? THRIVE_COLORS.primary : THRIVE_COLORS.neutral,
                  transform: [{ scale: index === currentPage ? 1.2 : 1 }],
                },
              ]}
            />
          </View>
        ))}
      </View>
      

      {/* Calendar Settings Modal */}
      {showCalendarSettings && (
        <View style={styles.modalOverlay}>
          <CalendarSettings 
            onClose={() => setShowCalendarSettings(false)} 
          />
        </View>
      )}
      
      {/* AI Coach Modal */}
      <AICoachModal
        visible={showAICoach}
        onClose={() => setShowAICoach(false)}
      />
      
      {/* Personal Chat Modal */}
      {showPersonalChat && (
        <View style={styles.modalOverlay}>
          <View style={styles.personalChatModal}>
            {/* Chat Header */}
            <View style={styles.personalChatHeader}>
              <View style={styles.chatUserInfo}>
                <View style={styles.chatUserAvatar}>
                  <Text style={styles.chatUserAvatarText}>AB</Text>
                </View>
                <View style={styles.chatUserDetails}>
                  <Text style={styles.chatUserName}>Anthony B.</Text>
                  <Text style={styles.chatUserStatus}>Active now</Text>
                </View>
              </View>
              <View 
                style={styles.modalCloseButton}
                onClick={() => setShowPersonalChat(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </View>
            </View>
            
            {/* Chat Messages */}
            <ScrollView style={styles.chatMessages}>
              {personalChatHistory.map(message => (
                <View 
                  key={message.id} 
                  style={[
                    styles.chatMessageItem,
                    message.isCurrentUser ? styles.chatMessageItemOwn : styles.chatMessageItemOther
                  ]}
                >
                  <View style={[
                    styles.chatMessageBubble,
                    message.isCurrentUser ? styles.chatMessageBubbleOwn : styles.chatMessageBubbleOther
                  ]}>
                    <Text style={[
                      styles.chatMessageText,
                      message.isCurrentUser ? styles.chatMessageTextOwn : styles.chatMessageTextOther
                    ]}>
                      {message.text}
                    </Text>
                    <Text style={[
                      styles.chatMessageTime,
                      message.isCurrentUser ? styles.chatMessageTimeOwn : styles.chatMessageTimeOther
                    ]}>
                      {message.timestamp}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            {/* Chat Input */}
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                multiline={false}
              />
              <View 
                style={[
                  styles.chatSendButton,
                  newMessage.trim() ? styles.chatSendButtonActive : styles.chatSendButtonInactive
                ]}
                onClick={() => {
                  if (newMessage.trim()) {
                    const message = {
                      id: personalChatHistory.length + 1,
                      text: newMessage.trim(),
                      sender: 'currentUser',
                      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                      isCurrentUser: true
                    };
                    setPersonalChatHistory([...personalChatHistory, message]);
                    setNewMessage('');
                    
                    // Simulate response after 1 second
                    setTimeout(() => {
                      const response = {
                        id: personalChatHistory.length + 2,
                        text: "Thanks for the message! 😊",
                        sender: 'user',
                        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                        isCurrentUser: false
                      };
                      setPersonalChatHistory(prev => [...prev, response]);
                    }, 1000);
                  }
                }}
              >
                <Text style={styles.chatSendButtonText}>➤</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* Challenge Walkthrough Modal */}
      {showChallengeWalkthrough && selectedChallenge && (
        <View style={styles.modalOverlay}>
          <View style={styles.challengeWalkthroughModal}>
            {/* Header */}
            <View style={styles.challengeWalkthroughHeader}>
              <Text style={styles.challengeWalkthroughTitle}>{selectedChallenge.title}</Text>
              <View 
                style={styles.modalCloseButton}
                onClick={() => {
                  setShowChallengeWalkthrough(false);
                  setSelectedChallenge(null);
                  setCurrentTaskStep(0);
                  setChallengeCompletedTasks([]);
                }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.taskProgressContainer}>
              <View style={styles.taskProgressBar}>
                <View style={[
                  styles.taskProgressFill,
                  { width: `${((challengeCompletedTasks.length) / selectedChallenge.tasks.length) * 100}%` }
                ]} />
              </View>
              <Text style={styles.taskProgressText}>
                {challengeCompletedTasks.length} of {selectedChallenge.tasks.length} tasks completed
              </Text>
            </View>
            
            {/* Current Task */}
            {currentTaskStep < selectedChallenge.tasks.length && (
              <View style={styles.currentTaskContainer}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskStepNumber}>Step {currentTaskStep + 1}</Text>
                  <View style={styles.taskTypeChip}>
                    <Text style={styles.taskTypeText}>{selectedChallenge.tasks[currentTaskStep].type}</Text>
                  </View>
                </View>
                
                <Text style={styles.taskTitle}>{selectedChallenge.tasks[currentTaskStep].title}</Text>
                <Text style={styles.taskDescription}>{selectedChallenge.tasks[currentTaskStep].description}</Text>
                
                <View style={styles.taskDuration}>
                  <Text style={styles.taskDurationIcon}>⏱️</Text>
                  <Text style={styles.taskDurationText}>{selectedChallenge.tasks[currentTaskStep].duration}</Text>
                </View>
                
                {/* Task Action Buttons */}
                <View style={styles.taskActionButtons}>
                  <View 
                    style={styles.taskCompleteButton}
                    onClick={() => {
                      const currentTaskId = selectedChallenge.tasks[currentTaskStep].id;
                      
                      // Only proceed if current task is not already completed
                      if (!challengeCompletedTasks.includes(currentTaskId)) {
                        const newCompleted = [...challengeCompletedTasks, currentTaskId];
                        setChallengeCompletedTasks(newCompleted);
                        
                        // Check if this was the last task
                        if (currentTaskStep + 1 >= selectedChallenge.tasks.length) {
                          // All tasks completed - mark challenge as complete
                          const newCompletedChallenges = [...completedChallenges, selectedChallenge.id];
                          setCompletedChallenges(newCompletedChallenges);
                          
                          // Show success message and return to challenge list
                          Alert.alert(
                            'Challenge Complete! 🎉', 
                            `Congratulations! You have completed ${selectedChallenge.title}.`,
                            [
                              {
                                text: 'View Challenges',
                                onPress: () => {
                                  setShowChallengeWalkthrough(false);
                                  setSelectedChallenge(null);
                                  setCurrentTaskStep(0);
                                  setChallengeCompletedTasks([]);
                                  setShowChallengeSelector(true);
                                }
                              }
                            ]
                          );
                        } else {
                          // Move to next task
                          setCurrentTaskStep(currentTaskStep + 1);
                        }
                      }
                    }}
                  >
                    <Text style={styles.taskCompleteButtonText}>
                      {challengeCompletedTasks.includes(selectedChallenge.tasks[currentTaskStep].id) ? '✓ Completed' : '✓ Complete Task'}
                    </Text>
                  </View>
                  
                  {currentTaskStep > 0 && (
                    <View 
                      style={styles.taskPreviousButton}
                      onClick={() => {
                        setCurrentTaskStep(currentTaskStep - 1);
                        const newCompleted = challengeCompletedTasks.filter(id => id !== selectedChallenge.tasks[currentTaskStep].id);
                        setChallengeCompletedTasks(newCompleted);
                      }}
                    >
                      <Text style={styles.taskPreviousButtonText}>← Previous</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* Removed Photo Edit Modal */}
      
      {/* Event Creation Modal */}
      <EventCreationModal
        visible={showEventCreation}
        onClose={() => setShowEventCreation(false)}
        onSave={handleEventCreation}
        initialDate={selectedDate || new Date()}
      />
      
      {/* Removed Attachment Picker Modal */}

      {/* Removed Photo Source Selector Modal */}
      
      {/* Removed disabled Photo Upload Modal */}






      
      {/* Removed Photo Detail Modal */}
      
      {/* Ask Question Modal */}
      {showAskQuestion && (
        <View style={styles.qaModalOverlay}>
          <View style={styles.qaModal}>
            <View style={styles.qaModalHeader}>
              <Text style={styles.qaModalTitle}>Ask a Question</Text>
              <View 
                style={styles.qaCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowAskQuestion(false)}
              >
                <Text style={styles.qaCloseButtonText}>×</Text>
              </View>
            </View>
            
            <View style={styles.qaModalContent}>
              <Text style={styles.qaModalDescription}>
                Ask Anthony anything about fitness, wellness, or lifestyle!
              </Text>
              
              <View style={styles.qaInputSection}>
                <Text style={styles.qaInputLabel}>Your Question</Text>
                <View style={styles.qaTextInput}>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="What would you like to know?"
                    style={styles.qaTextArea}
                    rows={4}
                  />
                </View>
                <Text style={styles.qaInputHint}>
                  {300 - newQuestion.length} characters remaining
                </Text>
              </View>
              
              <View style={styles.qaModalActions}>
                <View 
                  style={styles.qaCancelButton}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={() => setShowAskQuestion(false)}
                >
                  <Text style={styles.qaCancelButtonText}>Cancel</Text>
                </View>
                <View 
                  style={[styles.qaSubmitButton, !newQuestion.trim() && styles.qaSubmitButtonDisabled]}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={newQuestion.trim() ? handleSubmitQuestion : undefined}
                >
                  <Text style={[styles.qaSubmitButtonText, !newQuestion.trim() && styles.qaSubmitButtonTextDisabled]}>
                    Submit Question
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* Question Manager Modal */}
      {showQuestionManager && (
        <View style={styles.qaModalOverlay}>
          <View style={styles.qaManagerModal}>
            <View style={styles.qaModalHeader}>
              <Text style={styles.qaModalTitle}>Manage Questions</Text>
              <View 
                style={styles.qaCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowQuestionManager(false)}
              >
                <Text style={styles.qaCloseButtonText}>×</Text>
              </View>
            </View>
            
            <View style={styles.qaModalContent}>
              <Text style={styles.qaModalDescription}>
                {getUnansweredQuestionsCount()} questions waiting for your response
              </Text>
              
              <ScrollView style={styles.questionsList} showsVerticalScrollIndicator={false}>
                {incomingQuestions.map((question) => (
                  <View key={question.id} style={styles.questionManagerCard}>
                    <View style={styles.questionManagerHeader}>
                      <View style={styles.questionManagerInfo}>
                        <Text style={styles.questionManagerAsker}>From {question.asker}</Text>
                        <Text style={styles.questionManagerTime}>
                          {question.timestamp.toLocaleString()}
                        </Text>
                      </View>
                      <View style={[
                        styles.questionStatusBadge, 
                        question.isAnswered ? styles.answeredBadge : styles.unansweredBadge
                      ]}>
                        <Text style={[
                          styles.questionStatusText,
                          question.isAnswered ? styles.answeredText : styles.unansweredText
                        ]}>
                          {question.isAnswered ? 'Answered' : 'New'}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.questionManagerText}>{question.question}</Text>
                    
                    {question.isAnswered ? (
                      <View style={styles.existingAnswer}>
                        <Text style={styles.existingAnswerLabel}>Your Answer:</Text>
                        <Text style={styles.existingAnswerText}>{question.answer}</Text>
                      </View>
                    ) : (
                      <View style={styles.questionManagerActions}>
                        <View 
                          style={styles.answerQuestionButton}
                          onStartShouldSetResponder={() => true}
                          onResponderGrant={() => handleQuestionAction(question.id, 'answer')}
                        >
                          <Text style={styles.answerQuestionButtonText}>✏️ Answer</Text>
                        </View>
                        <View 
                          style={styles.deleteQuestionButton}
                          onStartShouldSetResponder={() => true}
                          onResponderGrant={() => handleQuestionAction(question.id, 'delete')}
                        >
                          <Text style={styles.deleteQuestionButtonText}>🗑️ Delete</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      )}
      
      {/* Answer Question Modal */}
      {selectedQuestion && (
        <View style={styles.qaModalOverlay}>
          <View style={styles.qaModal}>
            <View style={styles.qaModalHeader}>
              <Text style={styles.qaModalTitle}>Answer Question</Text>
              <View 
                style={styles.qaCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => {
                  setSelectedQuestion(null);
                  setQuestionAnswer('');
                }}
              >
                <Text style={styles.qaCloseButtonText}>×</Text>
              </View>
            </View>
            
            <View style={styles.qaModalContent}>
              <View style={styles.questionToAnswer}>
                <Text style={styles.questionToAnswerLabel}>Question from {selectedQuestion.asker}:</Text>
                <Text style={styles.questionToAnswerText}>{selectedQuestion.question}</Text>
              </View>
              
              <View style={styles.qaInputSection}>
                <Text style={styles.qaInputLabel}>Your Answer</Text>
                <View style={styles.qaTextInput}>
                  <textarea
                    value={questionAnswer}
                    onChange={(e) => setQuestionAnswer(e.target.value)}
                    placeholder="Share your knowledge and experience..."
                    style={styles.qaTextArea}
                    rows={4}
                  />
                </View>
                <Text style={styles.qaInputHint}>
                  {500 - questionAnswer.length} characters remaining
                </Text>
              </View>
              
              <View style={styles.qaModalActions}>
                <View 
                  style={styles.qaCancelButton}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={() => {
                    setSelectedQuestion(null);
                    setQuestionAnswer('');
                  }}
                >
                  <Text style={styles.qaCancelButtonText}>Cancel</Text>
                </View>
                <View 
                  style={[styles.qaSubmitButton, !questionAnswer.trim() && styles.qaSubmitButtonDisabled]}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={questionAnswer.trim() ? handleAnswerQuestion : undefined}
                >
                  <Text style={[styles.qaSubmitButtonText, !questionAnswer.trim() && styles.qaSubmitButtonTextDisabled]}>
                    Submit Answer
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* 🎯 ADAPTIVE TASK EXECUTION MODAL */}
      {activeTask && (
        <View style={styles.taskExecutionOverlay}>
          <View style={[styles.taskExecutionModal, { borderTopColor: getTaskUIConfig(activeTask.type).primaryColor }]}>
            {/* Task Header */}
            <View style={styles.taskExecutionHeader}>
              <View style={styles.taskExecutionTitleSection}>
                <Text style={styles.taskExecutionIcon}>{getTaskUIConfig(activeTask.type).icon}</Text>
                <View>
                  <Text style={styles.taskExecutionTitle}>{getTaskUIConfig(activeTask.type).title}</Text>
                  <Text style={styles.taskExecutionTaskName}>{activeTask.name}</Text>
                </View>
              </View>
              <View 
                style={styles.taskExecutionCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => {
                  setActiveTask(null);
                  setIsTaskRunning(false);
                  setTaskTimer(0);
                  setTaskProgress(0);
                }}
              >
                <Text style={styles.taskExecutionCloseText}>✕</Text>
              </View>
            </View>
            
            {/* Timer Display */}
            <View style={styles.taskTimerSection}>
              <View style={[styles.taskTimerCircle, { borderColor: getTaskUIConfig(activeTask.type).primaryColor }]}>
                <Text style={[styles.taskTimerTime, { color: getTaskUIConfig(activeTask.type).primaryColor }]}>
                  {Math.floor(taskTimer / 60)}:{(taskTimer % 60).toString().padStart(2, '0')}
                </Text>
                <Text style={styles.taskTimerLabel}>{getTaskUIConfig(activeTask.type).timerLabel}</Text>
              </View>
              
              {/* Progress Ring */}
              <View style={styles.taskProgressRing}>
                <View style={[
                  styles.taskProgressFill,
                  { 
                    backgroundColor: getTaskUIConfig(activeTask.type).primaryColor,
                    width: `${taskProgress}%`
                  }
                ]} />
              </View>
              
              <Text style={styles.taskDurationRemaining}>
                {Math.floor((activeTask.totalDuration - taskTimer) / 60)} min remaining
              </Text>
            </View>
            
            {/* Task-Specific Content */}
            <View style={styles.taskContentSection}>
              {activeTask.type === 'Movement' || activeTask.type === 'Exercise' ? (
                <View style={styles.exerciseContent}>
                  <Text style={styles.taskInstruction}>Keep moving and stay active!</Text>
                  <View style={styles.exerciseStats}>
                    <View style={styles.exerciseStat}>
                      <Text style={styles.exerciseStatLabel}>Duration</Text>
                      <Text style={styles.exerciseStatValue}>{activeTask.duration}</Text>
                    </View>
                    <View style={styles.exerciseStat}>
                      <Text style={styles.exerciseStatLabel}>Type</Text>
                      <Text style={styles.exerciseStatValue}>{activeTask.type}</Text>
                    </View>
                  </View>
                </View>
              ) : activeTask.type === 'Wellness' || activeTask.type === 'Mindfulness' ? (
                <View style={styles.mindfulnessContent}>
                  <Text style={styles.taskInstruction}>Focus on your breathing and be present</Text>
                  <View style={styles.breathingGuide}>
                    <Text style={styles.breathingText}>Breathe in... Breathe out...</Text>
                  </View>
                </View>
              ) : activeTask.type === 'Nutrition' ? (
                <View style={styles.nutritionContent}>
                  <Text style={styles.taskInstruction}>Nourish your body mindfully</Text>
                  <View style={styles.nutritionTips}>
                    <Text style={styles.nutritionTip}>• Eat slowly and savor each bite</Text>
                    <Text style={styles.nutritionTip}>• Stay hydrated</Text>
                    <Text style={styles.nutritionTip}>• Listen to your body</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.generalContent}>
                  <Text style={styles.taskInstruction}>Focus on the current task</Text>
                  <Text style={styles.taskDescription}>Take your time and do your best!</Text>
                </View>
              )}
            </View>
            
            {/* Action Buttons */}
            <View style={styles.taskActionButtons}>
              <View 
                style={[styles.taskPauseButton, isTaskRunning ? styles.taskPauseButtonActive : styles.taskPauseButtonInactive]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setIsTaskRunning(!isTaskRunning)}
              >
                <Text style={styles.taskPauseButtonText}>
                  {isTaskRunning ? '⏸️ Pause' : '▶️ Resume'}
                </Text>
              </View>
              
              <View 
                style={[styles.taskCompleteButton, { backgroundColor: getTaskUIConfig(activeTask.type).primaryColor }]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={completeTask}
              >
                <Text style={styles.taskCompleteButtonText}>
                  {getTaskUIConfig(activeTask.type).completionAction}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* 🌐 COMPREHENSIVE SOCIAL NETWORK MODALS */}
      
      {/* Followers List Modal */}
      {showFollowersList && (
        <View style={styles.modalOverlay}>
          <View style={styles.socialModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Followers</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowFollowersList(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            <ScrollView style={styles.userList}>
              {followers.map(follower => (
                <View key={follower.id} style={styles.userListItem}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>{follower.avatar}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{follower.name}</Text>
                      {follower.verified && <Text style={styles.verifiedIcon}>✓</Text>}
                    </View>
                    <Text style={styles.userUsername}>{follower.username}</Text>
                  </View>
                  <View style={[styles.followUserButton, follower.following && styles.followingButton]}>
                    <Text style={[styles.followUserText, follower.following && styles.followingText]}>
                      {follower.following ? 'Following' : 'Follow'}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      
      {/* Following List Modal */}
      {showFollowingList && (
        <View style={styles.modalOverlay}>
          <View style={styles.socialModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Following</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowFollowingList(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            <ScrollView style={styles.userList}>
              {followers.filter(f => f.following).map(user => (
                <View key={user.id} style={styles.userListItem}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>{user.avatar}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{user.name}</Text>
                      {user.verified && <Text style={styles.verifiedIcon}>✓</Text>}
                    </View>
                    <Text style={styles.userUsername}>{user.username}</Text>
                  </View>
                  <View style={styles.unfollowButton}>
                    <Text style={styles.unfollowText}>Unfollow</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      
      {/* Messaging Modal */}
      {showMessaging && (
        <View style={styles.modalOverlay}>
          <View style={styles.messagingModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Messages</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowMessaging(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            <ScrollView style={styles.messagesList}>
              {messages.map(message => (
                <View key={message.id} style={styles.messageItem}>
                  <View style={styles.messageAvatar}>
                    <Text style={styles.messageAvatarText}>{message.avatar}</Text>
                  </View>
                  <View style={styles.messageContent}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageSender}>{message.sender}</Text>
                      <Text style={styles.messageTime}>{message.time}</Text>
                    </View>
                    <Text style={styles.messageText}>{message.message}</Text>
                  </View>
                  {message.unread && <View style={styles.unreadDot} />}
                </View>
              ))}
            </ScrollView>
            <View style={styles.messageComposer}>
              <TextInput 
                style={styles.messageInput}
                placeholder="Type a message..."
                placeholderTextColor="#999"
              />
              <View style={styles.sendButton}>
                <Text style={styles.sendButtonText}>➤</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* Challenge Selector Modal */}
      {showChallengeSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.challengeModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start Challenge</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowChallengeSelector(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            <ScrollView style={styles.challengesList}>
              {challenges.map(challenge => {
                const isCompleted = completedChallenges.includes(challenge.id);
                return (
                  <View 
                    key={challenge.id} 
                    style={[
                      styles.challengeItem,
                      isCompleted ? styles.challengeItemCompleted : null
                    ]}
                  >
                    <View style={styles.challengeInfo}>
                      <View style={styles.challengeTitleContainer}>
                        <Text style={[
                          styles.challengeTitle,
                          isCompleted ? styles.challengeTitleCompleted : null
                        ]}>
                          {challenge.title}
                        </Text>
                        {isCompleted && (
                          <View style={styles.completedBadge}>
                            <Text style={styles.completedBadgeText}>✓ Complete</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[
                        styles.challengeDescription,
                        isCompleted ? styles.challengeDescriptionCompleted : null
                      ]}>
                        {challenge.description}
                      </Text>
                      <View style={styles.challengeStats}>
                        <Text style={[
                          styles.challengeStat,
                          isCompleted ? styles.challengeStatCompleted : null
                        ]}>
                          👥 {challenge.participants} participants
                        </Text>
                        <Text style={[
                          styles.challengeStat,
                          isCompleted ? styles.challengeStatCompleted : null
                        ]}>
                          ⏱️ {challenge.duration}
                        </Text>
                        <Text style={[
                          styles.challengeStat,
                          isCompleted ? styles.challengeStatCompleted : null
                        ]}>
                          🏅 {challenge.difficulty}
                        </Text>
                      </View>
                    </View>
                    <View 
                      style={[
                        styles.joinChallengeButton,
                        isCompleted ? styles.joinChallengeButtonCompleted : null
                      ]}
                      onClick={() => {
                        if (!isCompleted) {
                          setSelectedChallenge(challenge);
                          setCurrentTaskStep(0);
                          setCompletedTasks([]);
                          setShowChallengeSelector(false);
                          setShowChallengeWalkthrough(true);
                        } else {
                          Alert.alert('Challenge Complete', 'You have already completed this challenge! Great work! 🎉');
                        }
                      }}
                    >
                      <Text style={[
                        styles.joinChallengeText,
                        isCompleted ? styles.joinChallengeTextCompleted : null
                      ]}>
                        {isCompleted ? '✓ Done' : 'Start'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}
      
      {/* Notifications Modal */}
      {showNotifications && (
        <View style={styles.modalOverlay}>
          <View style={styles.notificationsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowNotifications(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            <View style={styles.notificationActions}>
              <View 
                style={styles.markAllReadButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={markAllNotificationsAsRead}
              >
                <Text style={styles.markAllReadButtonText}>Mark All Read</Text>
              </View>
            </View>
            <ScrollView style={styles.notificationsList}>
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <View 
                    key={notification.id} 
                    style={[styles.notificationItem, !notification.read && styles.unreadNotification]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => handleNotificationTap(notification)}
                  >
                    <View style={styles.notificationIcon}>
                      <Text style={styles.notificationIconText}>
                        {notification.icon}
                      </Text>
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatNotificationTime(notification.timestamp)}
                      </Text>
                    </View>
                    <View style={styles.notificationActions}>
                      {!notification.read && <View style={styles.unreadDot} />}
                      <View 
                        style={styles.deleteNotificationButton}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Text style={styles.deleteNotificationText}>×</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noNotifications}>
                  <Text style={styles.noNotificationsIcon}>🔔</Text>
                  <Text style={styles.noNotificationsTitle}>No Notifications</Text>
                  <Text style={styles.noNotificationsMessage}>
                    You're all caught up! New notifications will appear here.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
      
      {/* Search Modal */}
      {showSearch && (
        <View style={styles.modalOverlay}>
          <View style={styles.searchModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search THRIVE</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowSearch(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            <View style={styles.searchContainer}>
              <TextInput 
                style={styles.searchInput}
                placeholder="Search users, workouts, challenges..."
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.searchResults}>
              <Text style={styles.searchSectionTitle}>Popular Searches</Text>
              {['#30DayChallenge', '#MorningYoga', '#HealthyEating', 'HIIT Workouts', 'Meditation'].map((term, index) => (
                <View key={index} style={styles.searchResultItem}>
                  <Text style={styles.searchResultText}>{term}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Routine Customizer Modal */}
      {showRoutineCustomizer && (
        <View style={styles.modalOverlay}>
          <View style={styles.routineCustomizerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customize Your Success Routines</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowRoutineCustomizer(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            
            <View style={styles.routineCustomizerContent}>
              <Text style={styles.routineCustomizerDescription}>
                Choose 3 areas that are most vital to your success. These will become your personalized routines with detailed guidance and actionable steps.
              </Text>
              
              <ScrollView style={styles.routineCategoriesList} showsVerticalScrollIndicator={false}>
                {Object.values(routineCategories).map((category) => {
                  const isSelected = selectedRoutines.includes(category.id);
                  const canSelect = !isSelected && selectedRoutines.length < 3;
                  
                  return (
                    <View 
                      key={category.id}
                      style={[
                        styles.routineCategoryItem,
                        { borderLeftColor: category.color },
                        isSelected && styles.selectedRoutineCategory,
                        !canSelect && !isSelected && styles.disabledRoutineCategory
                      ]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={() => {
                        if (isSelected) {
                          // Remove from selection
                          setSelectedRoutines(prev => prev.filter(id => id !== category.id));
                        } else if (canSelect) {
                          // Add to selection
                          setSelectedRoutines(prev => [...prev, category.id]);
                        }
                      }}
                    >
                      <View style={styles.routineCategoryHeader}>
                        <View style={styles.routineCategoryInfo}>
                          <View style={styles.routineCategoryTitleRow}>
                            <Text style={styles.routineCategoryIcon}>{category.icon}</Text>
                            <Text style={[
                              styles.routineCategoryTitle,
                              isSelected && styles.selectedRoutineCategoryTitle
                            ]}>
                              {category.title}
                            </Text>
                            {isSelected && (
                              <View style={[styles.selectedIndicator, { backgroundColor: category.color }]}>
                                <Text style={styles.selectedIndicatorText}>✓</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.routineCategoryDescription}>{category.description}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.routineCategoryDetails}>
                        <Text style={styles.routineCategoryDetailsTitle}>What you'll learn:</Text>
                        {category.details.slice(0, 3).map((detail, index) => (
                          <View key={index} style={styles.routineCategoryDetailItem}>
                            <Text style={styles.routineCategoryDetailBullet}>•</Text>
                            <Text style={styles.routineCategoryDetailText}>{detail}</Text>
                          </View>
                        ))}
                        {category.details.length > 3 && (
                          <Text style={styles.routineCategoryMoreDetails}>
                            +{category.details.length - 3} more areas covered
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
              
              <View style={styles.routineCustomizerFooter}>
                <Text style={styles.selectedCountText}>
                  {selectedRoutines.length}/3 selected
                </Text>
                <View 
                  style={[
                    styles.saveRoutinesButton,
                    selectedRoutines.length === 3 && styles.saveRoutinesButtonActive
                  ]}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={() => {
                    if (selectedRoutines.length === 3) {
                      setShowRoutineCustomizer(false);
                      // Add notification for successful customization
                      addNotification(
                        'achievement',
                        'Routines Customized! 🎯',
                        `Your 3 vital success areas have been set. Ready to THRIVE!`,
                        '⚙️'
                      );
                    }
                  }}
                >
                  <Text style={[
                    styles.saveRoutinesButtonText,
                    selectedRoutines.length === 3 && styles.saveRoutinesButtonTextActive
                  ]}>
                    {selectedRoutines.length === 3 ? 'Save My Routines' : 'Select 3 Areas'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* Routine Editor Modal */}
      {showRoutineEditor && editingRoutineId && (
        <View style={styles.modalOverlay}>
          <View style={styles.routineEditorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customize Routine Content</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => {
                  setShowRoutineEditor(false);
                  setEditingRoutineId(null);
                }}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            
            <ScrollView style={styles.routineEditorContent} showsVerticalScrollIndicator={false}>
              {(() => {
                const routine = routineCategories[editingRoutineId];
                if (!routine) return null;
                
                return (
                  <View>
                    <View style={styles.routineEditorHeader}>
                      <Text style={styles.routineEditorIcon}>{routine.icon}</Text>
                      <Text style={styles.routineEditorTitle}>{routine.title}</Text>
                    </View>
                    
                    <Text style={styles.routineEditorDescription}>
                      Add your own custom content to personalize this routine. You can add custom guidance areas and create your own tasks.
                    </Text>
                    
                    {/* Custom Details Section */}
                    <View style={styles.customDetailsSection}>
                      <Text style={styles.customSectionTitle}>📚 Custom Guidance Areas</Text>
                      <Text style={styles.customSectionSubtitle}>
                        Add your own detailed guidance areas with step-by-step instructions
                      </Text>
                      
                      {userCustomizations[routine.id]?.customDetails?.map((detail, index) => (
                        <View key={index} style={[styles.customDetailItem, { borderLeftColor: routine.color }]}>
                          <Text style={styles.customDetailTitle}>{detail.title}</Text>
                          <Text style={styles.customDetailSteps}>{detail.steps?.length || 0} steps</Text>
                        </View>
                      ))}
                      
                      <View 
                        style={[styles.addCustomButton, { borderColor: routine.color }]}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={() => {
                          // Add a new custom detail
                          const newDetail = {
                            title: 'New Guidance Area',
                            steps: ['Add your first step here']
                          };
                          setUserCustomizations(prev => ({
                            ...prev,
                            [routine.id]: {
                              ...prev[routine.id],
                              customDetails: [...(prev[routine.id]?.customDetails || []), newDetail]
                            }
                          }));
                        }}
                      >
                        <Text style={[styles.addCustomButtonText, { color: routine.color }]}>+ Add Guidance Area</Text>
                      </View>
                    </View>
                    
                    {/* Custom Tasks Section */}
                    <View style={styles.customTasksSection}>
                      <Text style={styles.customSectionTitle}>🎯 Custom Action Tasks</Text>
                      <Text style={styles.customSectionSubtitle}>
                        Create your own action tasks with specific durations and difficulty levels
                      </Text>
                      
                      {userCustomizations[routine.id]?.customTasks?.map((task, index) => (
                        <View key={index} style={[styles.customTaskItem, { borderLeftColor: routine.color }]}>
                          <Text style={styles.customTaskName}>{task.name}</Text>
                          <Text style={styles.customTaskMeta}>{task.duration} • {task.difficulty}</Text>
                        </View>
                      ))}
                      
                      <View 
                        style={[styles.addCustomButton, { borderColor: routine.color }]}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={() => {
                          // Add a new custom task
                          const newTask = {
                            name: 'New Custom Task',
                            duration: '15 minutes',
                            type: 'custom',
                            difficulty: 'medium'
                          };
                          setUserCustomizations(prev => ({
                            ...prev,
                            [routine.id]: {
                              ...prev[routine.id],
                              customTasks: [...(prev[routine.id]?.customTasks || []), newTask]
                            }
                          }));
                        }}
                      >
                        <Text style={[styles.addCustomButtonText, { color: routine.color }]}>+ Add Action Task</Text>
                      </View>
                    </View>
                  </View>
                );
              })()}
            </ScrollView>
            
            <View style={styles.routineEditorFooter}>
              <View 
                style={styles.saveCustomizationButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => {
                  setShowRoutineEditor(false);
                  setEditingRoutineId(null);
                  addNotification(
                    'achievement',
                    'Customization Saved! ✨',
                    'Your routine has been personalized with your custom content.',
                    '💾'
                  );
                }}
              >
                <Text style={styles.saveCustomizationButtonText}>💾 Save Customizations</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* Task Starter Modal */}
      {showTaskStarter && (
        <View style={styles.modalOverlay}>
          <View style={styles.taskStarterModal}>
            {(() => {
              // Parse the task starter ID to get routine and task info
              const [routineId, type, taskIndex] = showTaskStarter.split('-');
              const routine = routineCategories[routineId];
              if (!routine) return null;
              
              const isMainRoutine = type === 'main';
              const task = isMainRoutine ? null : routine.tasks?.[parseInt(taskIndex)];
              
              return (
                <View>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {isMainRoutine ? `Start ${routine.title}` : `Start: ${task?.name}`}
                    </Text>
                    <View 
                      style={styles.modalCloseButton}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={() => setShowTaskStarter(null)}
                    >
                      <Text style={styles.modalCloseText}>×</Text>
                    </View>
                  </View>
                  
                  <View style={styles.taskStarterContent}>
                    <View style={styles.taskStarterHeader}>
                      <Text style={styles.taskStarterIcon}>{routine.icon}</Text>
                      <Text style={styles.taskStarterTitle}>
                        {isMainRoutine ? routine.title : task?.name}
                      </Text>
                      <Text style={styles.taskStarterDescription}>
                        {isMainRoutine ? routine.description : `${task?.duration} • ${task?.type}`}
                      </Text>
                    </View>
                    
                    <View style={styles.taskStarterGuide}>
                      <Text style={styles.taskStarterGuideTitle}>🎯 Getting Started</Text>
                      
                      {isMainRoutine ? (
                        <View>
                          <Text style={styles.taskStarterInstructions}>
                            This is your comprehensive {routine.title.toLowerCase()} routine. Choose how you'd like to begin:
                          </Text>
                          
                          <View style={styles.startOptionsContainer}>
                            <View 
                              style={[styles.startOption, { borderLeftColor: routine.color }]}
                              onStartShouldSetResponder={() => true}
                              onResponderGrant={() => {
                                setShowTaskStarter(null);
                                startTask({
                                  name: `${routine.title} - Full Routine`,
                                  duration: '45 minutes',
                                  type: 'Planning',
                                  difficulty: 'medium'
                                }, routine);
                              }}
                            >
                              <Text style={styles.startOptionTitle}>🚀 Full Routine (45 min)</Text>
                              <Text style={styles.startOptionDescription}>
                                Complete guided session covering all key areas
                              </Text>
                            </View>
                            
                            <View 
                              style={[styles.startOption, { borderLeftColor: routine.color }]}
                              onStartShouldSetResponder={() => true}
                              onResponderGrant={() => {
                                setShowTaskStarter(null);
                                startTask({
                                  name: `${routine.title} - Quick Start`,
                                  duration: '15 minutes',
                                  type: 'Planning',
                                  difficulty: 'easy'
                                }, routine);
                              }}
                            >
                              <Text style={styles.startOptionTitle}>⚡ Quick Start (15 min)</Text>
                              <Text style={styles.startOptionDescription}>
                                Essential actions to get you moving today
                              </Text>
                            </View>
                            
                            <View 
                              style={[styles.startOption, { borderLeftColor: routine.color }]}
                              onStartShouldSetResponder={() => true}
                              onResponderGrant={() => {
                                setShowTaskStarter(null);
                                // Navigate to expanded routine view
                                setExpandedRoutine(routine.id);
                                setActiveProfileTab(2); // Switch to Routines tab first
                                goToPage(1); // Go to Profile page
                              }}
                            >
                              <Text style={styles.startOptionTitle}>📖 Browse & Learn</Text>
                              <Text style={styles.startOptionDescription}>
                                Explore detailed guidance at your own pace
                              </Text>
                            </View>
                          </View>
                        </View>
                      ) : task ? (
                        <View>
                          <Text style={styles.taskStarterInstructions}>
                            Ready to start "{task.name}"? Here's what you'll be doing:
                          </Text>
                          
                          {task.steps && (
                            <View style={styles.taskStepsPreview}>
                              <Text style={styles.taskStepsTitle}>📋 Task Steps:</Text>
                              {task.steps.map((step, index) => (
                                <View key={index} style={styles.taskStepPreview}>
                                  <View style={[styles.stepPreviewNumber, { backgroundColor: routine.color }]}>
                                    <Text style={styles.stepPreviewNumberText}>{index + 1}</Text>
                                  </View>
                                  <Text style={styles.stepPreviewText}>{step}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                          
                          <View style={styles.startTaskActions}>
                            <View 
                              style={[styles.startTaskButton, { backgroundColor: routine.color }]}
                              onStartShouldSetResponder={() => true}
                              onResponderGrant={() => {
                                setShowTaskStarter(null);
                                startTask(task, routine);
                              }}
                            >
                              <Text style={styles.startTaskButtonText}>▶️ Start {task.name}</Text>
                            </View>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })()}
          </View>
        </View>
      )}
      
      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings & Data Management</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowProfileSettings(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            
            <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
              
              {/* Data Management Section */}
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>📊 Data Management</Text>
                <Text style={styles.settingsSectionDescription}>
                  Manage your app data, create backups, and restore from previous saves.
                </Text>
                
                {/* Export Data */}
                <View 
                  style={styles.settingsButton}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={() => {
                    setShowProfileSettings(false);
                    handleExportData();
                  }}
                >
                  <View style={styles.settingsButtonLeft}>
                    <Text style={styles.settingsButtonIcon}>📤</Text>
                    <View>
                      <Text style={styles.settingsButtonTitle}>Export Data</Text>
                      <Text style={styles.settingsButtonSubtitle}>Download backup of all your data</Text>
                    </View>
                  </View>
                  <Text style={styles.settingsButtonArrow}>›</Text>
                </View>
                
                {/* Import Data */}
                <View 
                  style={styles.settingsButton}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={() => {
                    setShowProfileSettings(false);
                    handleImportData();
                  }}
                >
                  <View style={styles.settingsButtonLeft}>
                    <Text style={styles.settingsButtonIcon}>📥</Text>
                    <View>
                      <Text style={styles.settingsButtonTitle}>Import Data</Text>
                      <Text style={styles.settingsButtonSubtitle}>Restore from backup file</Text>
                    </View>
                  </View>
                  <Text style={styles.settingsButtonArrow}>›</Text>
                </View>
                
                {/* Add Demo Data */}
                <View 
                  style={styles.settingsButton}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={() => {
                    setShowProfileSettings(false);
                    handleAddDemoData();
                  }}
                >
                  <View style={styles.settingsButtonLeft}>
                    <Text style={styles.settingsButtonIcon}>🎭</Text>
                    <View>
                      <Text style={styles.settingsButtonTitle}>Add Demo Data</Text>
                      <Text style={styles.settingsButtonSubtitle}>Populate with example content</Text>
                    </View>
                  </View>
                  <Text style={styles.settingsButtonArrow}>›</Text>
                </View>
                
                {/* Clear All Data */}
                <View 
                  style={[styles.settingsButton, styles.settingsButtonDanger]}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={() => {
                    setShowProfileSettings(false);
                    handleClearAllData();
                  }}
                >
                  <View style={styles.settingsButtonLeft}>
                    <Text style={styles.settingsButtonIcon}>🗑️</Text>
                    <View>
                      <Text style={[styles.settingsButtonTitle, styles.settingsDangerText]}>Clear All Data</Text>
                      <Text style={styles.settingsButtonSubtitle}>Remove all content and reset app</Text>
                    </View>
                  </View>
                  <Text style={[styles.settingsButtonArrow, styles.settingsDangerText]}>›</Text>
                </View>
              </View>
              
              {/* App Information Section */}
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>ℹ️ App Information</Text>
                <View style={styles.settingsInfoCard}>
                  <Text style={styles.settingsInfoTitle}>THRIVE Wellness App</Text>
                  <Text style={styles.settingsInfoSubtitle}>Version 2.0 - Web Edition</Text>
                  <Text style={styles.settingsInfoDescription}>
                    Your personal wellness companion for building healthier habits and tracking progress.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <View style={styles.modalOverlay}>
          <View style={styles.analyticsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📊 Progress Analytics</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowAnalytics(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            
            <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.analyticsContent}>
                <Text style={styles.analyticsSection}>🎯 Weekly Progress</Text>
                <View style={styles.progressCard}>
                  <Text style={styles.progressTitle}>Wellness Score</Text>
                  <Text style={styles.progressValue}>87%</Text>
                  <Text style={styles.progressSubtext}>+12% from last week</Text>
                </View>
                
                <Text style={styles.analyticsSection}>📈 Trend Analysis</Text>
                <View style={styles.trendGrid}>
                  <View style={styles.trendCard}>
                    <Text style={styles.trendIcon}>💪</Text>
                    <Text style={styles.trendTitle}>Fitness</Text>
                    <Text style={styles.trendValue}>↗️ +15%</Text>
                  </View>
                  <View style={styles.trendCard}>
                    <Text style={styles.trendIcon}>🧘</Text>
                    <Text style={styles.trendTitle}>Mindfulness</Text>
                    <Text style={styles.trendValue}>↗️ +8%</Text>
                  </View>
                </View>
                
                <Text style={styles.analyticsSection}>🏆 Achievements This Month</Text>
                <Text style={styles.achievementText}>• 7-day workout streak completed</Text>
                <Text style={styles.achievementText}>• 50+ mindful minutes logged</Text>
                <Text style={styles.achievementText}>• 3 new wellness habits formed</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <View style={styles.modalOverlay}>
          <View style={styles.achievementsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏆 Your Achievements</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowAchievements(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            
            <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.achievementsContent}>
                <View style={styles.achievementBadge}>
                  <Text style={styles.badgeIcon}>🔥</Text>
                  <Text style={styles.badgeTitle}>Week Warrior</Text>
                  <Text style={styles.badgeDescription}>Complete workouts for 7 days straight</Text>
                  <Text style={styles.badgeStatus}>✅ Earned 2 days ago</Text>
                </View>
                
                <View style={styles.achievementBadge}>
                  <Text style={styles.badgeIcon}>🧘</Text>
                  <Text style={styles.badgeTitle}>Mindful Master</Text>
                  <Text style={styles.badgeDescription}>Log 100+ minutes of mindfulness</Text>
                  <Text style={styles.badgeStatus}>✅ Earned 1 week ago</Text>
                </View>
                
                <View style={[styles.achievementBadge, styles.lockedBadge]}>
                  <Text style={styles.badgeIcon}>🎯</Text>
                  <Text style={styles.badgeTitle}>Goal Crusher</Text>
                  <Text style={styles.badgeDescription}>Achieve 3 major wellness goals</Text>
                  <Text style={styles.badgeStatus}>🔒 2/3 completed</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Tutorials Modal */}
      {showTutorials && (
        <View style={styles.modalOverlay}>
          <View style={styles.tutorialsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📚 App Tutorials</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowTutorials(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            
            <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.tutorialsContent}>
                <View style={styles.tutorialCard}>
                  <Text style={styles.tutorialIcon}>🚀</Text>
                  <Text style={styles.tutorialTitle}>Getting Started</Text>
                  <Text style={styles.tutorialDescription}>Learn the basics of THRIVE wellness tracking</Text>
                  <View style={styles.tutorialButton}>
                    <Text style={styles.tutorialButtonText}>Watch Tutorial</Text>
                  </View>
                </View>
                
                <View style={styles.tutorialCard}>
                  <Text style={styles.tutorialIcon}>💪</Text>
                  <Text style={styles.tutorialTitle}>Setting Up Routines</Text>
                  <Text style={styles.tutorialDescription}>Create and customize your wellness routines</Text>
                  <View style={styles.tutorialButton}>
                    <Text style={styles.tutorialButtonText}>Watch Tutorial</Text>
                  </View>
                </View>
                
                <View style={styles.tutorialCard}>
                  <Text style={styles.tutorialIcon}>📊</Text>
                  <Text style={styles.tutorialTitle}>Understanding Analytics</Text>
                  <Text style={styles.tutorialDescription}>Track your progress and view insights</Text>
                  <View style={styles.tutorialButton}>
                    <Text style={styles.tutorialButtonText}>Watch Tutorial</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Help Modal */}
      {showHelp && (
        <View style={styles.modalOverlay}>
          <View style={styles.helpModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>❓ Help & Support</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowHelp(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            
            <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.helpContent}>
                <Text style={styles.helpSection}>❓ Frequently Asked Questions</Text>
                
                <View style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>How do I customize my routines?</Text>
                  <Text style={styles.faqAnswer}>Tap the ⚙️ Edit button in the routines section on your profile to customize your 3 vital success areas.</Text>
                </View>
                
                <View style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>How do I export my data?</Text>
                  <Text style={styles.faqAnswer}>Go to Settings → Data Management → Export Data to download your complete wellness backup.</Text>
                </View>
                
                <View style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>Can I sync with other apps?</Text>
                  <Text style={styles.faqAnswer}>Yes! Use the Map Settings to connect with Google Calendar and other wellness apps.</Text>
                </View>
                
                <Text style={styles.helpSection}>📧 Contact Support</Text>
                <Text style={styles.contactInfo}>Email: support@thrive-wellness.app</Text>
                <Text style={styles.contactInfo}>Response time: Within 24 hours</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* App Info Modal */}
      {showAppInfo && (
        <View style={styles.modalOverlay}>
          <View style={styles.appInfoModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ℹ️ About THRIVE</Text>
              <View 
                style={styles.modalCloseButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => setShowAppInfo(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </View>
            </View>
            
            <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.appInfoContent}>
                <View style={styles.appLogoSection}>
                  <ThriveLogoComponent size={80} showText={true} textSize={28} />
                  <Text style={styles.appVersion}>Version 2.0 - Web Edition</Text>
                </View>
                
                <Text style={styles.appDescription}>
                  THRIVE is your personal wellness companion designed to help you build healthier habits, 
                  track your progress, and achieve your wellness goals through customizable routines and 
                  mindful practices.
                </Text>
                
                <View style={styles.appFeatures}>
                  <Text style={styles.featureTitle}>✨ Key Features</Text>
                  <Text style={styles.featureItem}>• Customizable wellness routines</Text>
                  <Text style={styles.featureItem}>• Progress tracking & analytics</Text>
                  <Text style={styles.featureItem}>• Mindfulness & fitness integration</Text>
                  <Text style={styles.featureItem}>• Data export & backup</Text>
                  <Text style={styles.featureItem}>• Calendar sync capabilities</Text>
                </View>
                
                <Text style={styles.appCopyright}>© 2025 THRIVE Wellness. All rights reserved.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THRIVE_COLORS.white,
    minHeight: '100vh', // Web-specific full height
    overflow: 'hidden', // Prevent scrolling when menus slide
    position: 'relative', // Ensure proper positioning context
    // Comprehensive anti-zoom properties for web
    touchAction: 'pan-x pan-y', // Only allow panning, no zoom
    userSelect: 'none', // Prevent text selection
    webkitUserSelect: 'none', // Safari
    msUserSelect: 'none', // IE/Edge
    webkitTouchCallout: 'none', // iOS Safari
    webkitTapHighlightColor: 'transparent', // Remove tap highlights
    msContentZooming: 'none', // IE/Edge
    msTouchAction: 'pan-x pan-y', // IE/Edge
    zoom: 1, // Force zoom level
    transform: 'scale(1)', // Force scale
  },
  header: {
    paddingTop: 50, // Reduced from 65 to save 15px
    paddingBottom: 15, // Reduced from 25 to save 10px
    paddingHorizontal: 0, // Remove horizontal padding to avoid conflicts
    backgroundColor: THRIVE_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: THRIVE_COLORS.neutral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the content
    position: 'relative', // Allow absolute positioning of side elements
    minHeight: 80, // Reduced from 100 to save 20px
    zIndex: 10,
  },
  hamburgerButton: {
    position: 'absolute', // Position absolutely on left side
    left: 20, // More spacing from edge
    top: '50%', // Center vertically
    marginTop: -15, // Half of height for perfect vertical centering
    width: 30,
    height: 30,
    justifyContent: 'space-between',
    paddingVertical: 4,
    cursor: 'pointer',
    zIndex: 10, // Ensure it stays on top
  },
  hamburgerLine: {
    width: 25,
    height: 3,
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 2,
  },
  
  hamburgerNotificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  
  hamburgerNotificationText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  
  // AI Coach Button Styles
  aiCoachButton: {
    position: 'absolute',
    right: 20, // More spacing from edge
    top: '50%', // Center vertically
    marginTop: -22, // Half of height for perfect vertical centering
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    zIndex: 10, // Ensure it stays on top
  },
  
  aiCoachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THRIVE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: THRIVE_COLORS.white,
  },
  
  aiCoachAvatarText: {
    fontSize: 20,
  },
  
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column', // Stack logo and title vertically
    paddingVertical: 4, // Reduced from 8 to save space
    flex: 1, // Take available space for centering
    marginHorizontal: 60, // Leave space for hamburger (left) and brain button (right)
  },
  
  /* 🌱 EXACT THRIVE LOGO STYLES */
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 12,
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  menuLogoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  
  menuLogo: {
    width: 56,
    height: 56,
    marginBottom: 12,
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  logoPlant: {
    width: '60%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  logoStem: {
    position: 'absolute',
    width: 3,
    height: 12,
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 1.5,
    bottom: 0,
    alignSelf: 'center',
  },
  
  logoLeafLeft: {
    position: 'absolute',
    width: 10,
    height: 14,
    backgroundColor: THRIVE_COLORS.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 8,
    bottom: 8,
    left: -2,
    transform: [{ rotate: '-25deg' }],
  },
  
  logoLeafRight: {
    position: 'absolute',
    width: 10,
    height: 14,
    backgroundColor: THRIVE_COLORS.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 2,
    bottom: 8,
    right: -2,
    transform: [{ rotate: '25deg' }],
  },
  
  logoAccentDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: THRIVE_COLORS.highlight,
    borderRadius: 3,
    top: -2,
    alignSelf: 'center',
  },

  thriveTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333', // Updated to match new logo design
    letterSpacing: 2,
    marginBottom: 5,
    fontFamily: 'sans-serif',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
  },
  
  pageSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THRIVE_COLORS.secondary,
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  pagesWrapper: {
    flex: 1,
    overflow: 'hidden', // Hide horizontal scroll on web
  },
  pagesContainer: {
    flex: 1,
    flexDirection: 'row',
    width: screenWidth * 5, // 5 pages side by side
  },
  page: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pageLabel: {
    fontSize: 32, // Bigger page label for better visibility
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8, // Slightly more margin
  },
  pageDescription: {
    fontSize: 18, // Bigger description for better readability
    color: '#999999',
    textAlign: 'center',
    opacity: 0.7,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8, // Further reduced from 12 to 8px to save space
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  indicatorWrapper: {
    padding: 6, // Reduced from 8 to make footer more compact
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transition: 'all 0.3s ease', // Web-specific smooth transitions
  },

  slideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 260, // Menu width
    height: '100%',
    backgroundColor: THRIVE_COLORS.white, // Brand white background
    borderRightWidth: 0, // Remove border for cleaner look
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 }, // Stronger shadow
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  menuContent: {
    flex: 1,
    paddingTop: 100, // Account for header height
    paddingHorizontal: 24, // More padding for cleaner look
    paddingBottom: 20,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold', // Bold sans-serif font
    color: '#333333', // Updated to match new logo design
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: 'sans-serif',
    fontFamily: 'system', // Rounded system font
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800', // Bold rounded font
    color: THRIVE_COLORS.black, // Brand dark text
    marginBottom: 10,
    marginTop: 18,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12, // More rounded like cards
    cursor: 'pointer',
    backgroundColor: THRIVE_COLORS.white, // Brand white background
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // Subtle card-like elevation
  },
  menuItemIcon: {
    fontSize: 18, // Slightly larger
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  menuItemText: {
    fontSize: 15,
    color: THRIVE_COLORS.black, // Brand dark text
    fontWeight: '700', // Bold rounded font like cards
    flex: 1,
  },
  
  menuItemTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  menuNotificationBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  
  menuNotificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: THRIVE_COLORS.neutral,
    cursor: 'pointer',
    borderRadius: 12, // Rounded like other items
    backgroundColor: 'rgba(255, 118, 117, 0.08)', // Subtle coral background
  },
  logoutText: {
    fontSize: 15,
    color: THRIVE_COLORS.highlight, // Brand coral color
    fontWeight: '700', // Bold rounded font
    flex: 1,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 15,
  },


  profilePhotoSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profilePhotoLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THRIVE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  profileInitialLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THRIVE_COLORS.white,
  },

  photoLabel: {
    fontSize: 12,
    color: '#666666',
  },
  profileOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  optionValue: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    flex: 1,
  },
  editContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  textInput: {
    borderWidth: 1,
    borderColor: THRIVE_COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    minWidth: 100,
    textAlign: 'right',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  saveButtonText: {
    color: THRIVE_COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  cancelButtonText: {
    color: THRIVE_COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  closeButtonText: {
    color: THRIVE_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    position: 'relative',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 120,
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  dropdownValue: {
    fontSize: 12,
    color: '#333333',
    flex: 1,
    textAlign: 'left',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666666',
    marginLeft: 6,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 42, // Directly below the dropdown container
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    minWidth: 120,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    cursor: 'pointer',
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#333333',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000, // Above everything
  },
  modalDropdown: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10001, // Above overlay
  },
  modalDropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 200,
    maxWidth: 280,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  modalDropdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THRIVE_COLORS.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  modalDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    cursor: 'pointer',
    backgroundColor: '#F8F9FA',
  },
  modalDropdownItemText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Dashboard styles
  dashboardContainer: {
    flex: 1,
    paddingHorizontal: 40, // Significantly increased to prevent card cropping at edges
    paddingTop: 16, // Increased for better top spacing
    paddingBottom: 16, // Increased for better bottom spacing
    alignItems: 'center',
    justifyContent: 'space-between', // Even distribution of elements
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 400, // Reduced to ensure cards fit within increased padding
    marginBottom: 20, // Increased for better separation from goal cards
    gap: 10, // Slightly reduced gap to accommodate smaller max width
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THRIVE_COLORS.primary,
    marginBottom: 10,
  },
  dashboardSubtitle: {
    fontSize: 12, // Smaller subtitle text
    color: '#666666',
    textAlign: 'center',
    marginTop: 8, // Much smaller top margin
    fontWeight: '600',
  },
  
  // Dashboard Card Base styles
  dashboardCard: {
    width: 'calc(50% - 5px)', // Account for reduced grid gap
    minWidth: 100, // Reduced to fit better in smaller container
    height: 85,
    borderRadius: 12, // Restored for better visual appeal
    padding: 12, // Restored for better content spacing
    marginBottom: 0, // Remove since we're using grid gap
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    cursor: 'pointer',
    justifyContent: 'space-between',
  },
  
  // Weight Card specific styling (Green theme)
  weightCard: {
    backgroundColor: '#E8F5E8', // Light green background
    borderLeftWidth: 4,
    borderLeftColor: '#34C759', // Green accent
  },
  
  // Goal Progress Card specific styling (Blue theme)
  goalCard: {
    backgroundColor: '#E3F2FD', // Light blue background
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3', // Blue accent
  },
  
  // Tasks Card specific styling (Orange theme)
  tasksCard: {
    backgroundColor: '#FFF3E0', // Light orange background
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800', // Orange accent
  },
  
  // Streak Card specific styling (Purple theme)
  streakCard: {
    backgroundColor: '#F3E5F5', // Light purple background
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0', // Purple accent
  },
  
  // Mental Health Card specific styling (Completely different from fitness)
  mindfulnessCard: {
    backgroundColor: '#FFEBEE', // Light red background
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F', // Red accent
  },
  
  moodCard: {
    backgroundColor: '#F3E5F5', // Light deep purple background  
    borderLeftWidth: 4,
    borderLeftColor: '#7B1FA2', // Deep Purple accent
  },
  
  learningCard: {
    backgroundColor: '#FFF3E0', // Light deep orange background
    borderLeftWidth: 4,
    borderLeftColor: '#F57C00', // Deep Orange accent
  },
  
  gratitudeCard: {
    backgroundColor: '#E8F5E8', // Light dark green background
    borderLeftWidth: 4,
    borderLeftColor: '#388E3C', // Dark Green accent
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // Added bottom margin for better separation
  },
  
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6, // Increased for better spacing
    paddingHorizontal: 4, // Added horizontal padding
  },
  
  cardIcon: {
    fontSize: 16, // Increased for better visibility
    opacity: 0.85, // Slightly more transparent for elegance
    marginBottom: 2, // Added bottom margin
  },
  
  // Weight Card - Green Theme Styles
  weightTrend: {
    fontSize: 14,
    fontWeight: '900',
    color: '#34C759',
  },
  
  weightMainValue: {
    fontSize: 28, // Smaller main value
    fontWeight: '900',
    color: '#1B5E20', // Dark green
    textAlign: 'center',
    marginBottom: 2, // Reduced margin
  },
  
  weightLabel: {
    fontSize: 10, // Smaller label
    fontWeight: '800',
    color: '#2E7D32', // Medium green
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2, // Reduced margin
  },
  
  weightSubtext: {
    fontSize: 9, // Smaller subtext
    fontWeight: '700',
    color: '#388E3C', // Green
    textAlign: 'center',
  },
  
  weightProgressBar: {
    backgroundColor: '#34C759', // Green progress
    borderRadius: 3,
  },
  
  // Goal Progress Card - Blue Theme Styles
  goalTrend: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2196F3',
  },
  
  goalMainValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0D47A1', // Dark blue
    textAlign: 'center',
    marginBottom: 2,
  },
  
  goalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1565C0', // Medium blue
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2,
  },
  
  goalSubtext: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1976D2', // Blue
    textAlign: 'center',
  },
  
  goalProgressBar: {
    backgroundColor: '#2196F3', // Blue progress
    borderRadius: 3,
  },
  
  // Tasks Card - Orange Theme Styles
  tasksTrend: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FF9800',
  },
  
  tasksMainValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#E65100', // Dark orange
    textAlign: 'center',
    marginBottom: 2,
  },
  
  tasksLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F57C00', // Medium orange
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2,
  },
  
  tasksSubtext: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FB8C00', // Orange
    textAlign: 'center',
  },
  
  tasksProgressBar: {
    backgroundColor: '#FF9800', // Orange progress
    borderRadius: 3,
  },
  
  // Streak Card - Purple Theme Styles
  streakTrend: {
    fontSize: 14,
    fontWeight: '900',
    color: '#9C27B0',
  },
  
  streakMainValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#4A148C', // Dark purple
    textAlign: 'center',
    marginBottom: 2,
  },
  
  streakLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7B1FA2', // Medium purple
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2,
  },
  
  streakSubtext: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E24AA', // Purple
    textAlign: 'center',
  },
  
  streakProgressBar: {
    backgroundColor: '#9C27B0', // Purple progress
    borderRadius: 3,
  },
  
  // Mental Health Card Styles (Completely Different Colors)
  // Mindfulness Card - Red Theme Styles
  mindfulnessMainValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#B71C1C', // Dark red
    textAlign: 'center',
    marginBottom: 2,
  },
  
  mindfulnessLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C62828', // Medium red
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2,
  },
  
  mindfulnessSubtext: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D32F2F', // Red
    textAlign: 'center',
  },
  
  mindfulnessProgressBar: {
    backgroundColor: '#D32F2F', // Red progress
    borderRadius: 3,
  },
  
  // Mood Card - Deep Purple Theme Styles
  moodMainValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#4A148C', // Dark purple
    textAlign: 'center',
    marginBottom: 2,
  },
  
  moodLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6A1B9A', // Medium purple
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2,
  },
  
  moodSubtext: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7B1FA2', // Deep purple
    textAlign: 'center',
  },
  
  moodProgressBar: {
    backgroundColor: '#7B1FA2', // Deep purple progress
    borderRadius: 3,
  },
  
  // Learning Card - Deep Orange Theme Styles
  learningMainValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#E65100', // Dark orange
    textAlign: 'center',
    marginBottom: 2,
  },
  
  learningLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF6C00', // Medium orange
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2,
  },
  
  learningSubtext: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F57C00', // Deep orange
    textAlign: 'center',
  },
  
  learningProgressBar: {
    backgroundColor: '#F57C00', // Deep orange progress
    borderRadius: 3,
  },
  
  // Gratitude Card - Dark Green Theme Styles
  gratitudeMainValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1B5E20', // Dark green
    textAlign: 'center',
    marginBottom: 2,
  },
  
  gratitudeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D32', // Medium green
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2,
  },
  
  gratitudeSubtext: {
    fontSize: 9,
    fontWeight: '700',
    color: '#388E3C', // Dark green
    textAlign: 'center',
  },
  
  gratitudeProgressBar: {
    backgroundColor: '#388E3C', // Dark green progress
    borderRadius: 3,
  },
  
  progressBarContainer: {
    height: 3, // Even thinner progress bar for smaller cards
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Universal light background
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  
  // Base styles for all cards
  cardTrend: {
    fontSize: 14,
    fontWeight: '900',
  },
  cardMainValue: {
    fontSize: 26, // Increased for better readability
    fontWeight: '800', // Slightly reduced for elegance
    textAlign: 'center',
    marginBottom: 4, // Increased for better spacing
    lineHeight: 30, // Added for better text appearance
    letterSpacing: -0.5, // Tighter spacing for numbers
  },
  cardLabel: {
    fontSize: 10, // Increased for better readability
    fontWeight: '700', // Slightly reduced for balance
    textAlign: 'center',
    letterSpacing: 1.2, // Increased for elegant appearance
    marginBottom: 3, // Increased spacing
    lineHeight: 12, // Added line height
    textTransform: 'uppercase',
  },
  cardSubtext: {
    fontSize: 10, // Increased for readability
    fontWeight: '600', // Slightly reduced for subtlety
    textAlign: 'center',
    marginTop: 2, // Added top margin
    lineHeight: 14, // Added line height
    letterSpacing: 0.3, // Added letter spacing
  },
  progressBar: {
    height: 3, // Reduced to match progressBarContainer
    borderRadius: 1.5,
  },
  
  // Expanded Card Styles
  expandedCardContainer: {
    width: '100%',
    height: 400, // Fixed height to fill the grid area
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  expandedCard: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    justifyContent: 'space-between',
  },
  
  // Expanded card color themes
  expandedWeightCard: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 6,
    borderLeftColor: '#34C759',
  },
  
  expandedGoalCard: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 6,
    borderLeftColor: '#2196F3',
  },
  
  expandedTasksCard: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 6,
    borderLeftColor: '#FF9800',
  },
  
  expandedStreakCard: {
    backgroundColor: '#F3E5F5',
    borderLeftWidth: 6,
    borderLeftColor: '#9C27B0',
  },
  
  // Mental Health Expanded card color themes (Completely different)
  expandedMindfulnessCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 6,
    borderLeftColor: '#D32F2F', // Red
  },
  
  expandedMoodCard: {
    backgroundColor: '#F3E5F5',
    borderLeftWidth: 6,
    borderLeftColor: '#7B1FA2', // Deep Purple
  },
  
  expandedLearningCard: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 6,
    borderLeftColor: '#F57C00', // Deep Orange
  },
  
  expandedGratitudeCard: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 6,
    borderLeftColor: '#388E3C', // Dark Green
  },
  
  expandedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  expandedCardTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  expandedCardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  
  expandedCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  
  expandedCardValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  
  // Color-specific title and value styles
  weightTitle: { color: '#2E7D32' },
  weightValue: { color: '#1B5E20' },
  goalTitle: { color: '#1565C0' },
  goalValue: { color: '#0D47A1' },
  tasksTitle: { color: '#F57C00' },
  tasksValue: { color: '#E65100' },
  streakTitle: { color: '#7B1FA2' },
  streakValue: { color: '#4A148C' },
  
  // Mental Health Color-specific title and value styles (Completely different)
  mindfulnessTitle: { color: '#C62828' }, // Red
  mindfulnessValue: { color: '#B71C1C' },
  moodTitle: { color: '#6A1B9A' }, // Deep Purple  
  moodValue: { color: '#4A148C' },
  learningTitle: { color: '#EF6C00' }, // Deep Orange
  learningValue: { color: '#E65100' },
  gratitudeTitle: { color: '#2E7D32' }, // Dark Green
  gratitudeValue: { color: '#1B5E20' },
  
  expandedCardCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  
  expandedCardCloseText: {
    color: THRIVE_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  expandedCardGraph: {
    flex: 1,
    marginTop: 20,
  },
  
  expandedGraphTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  expandedGraphArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between', // Distribute columns evenly
    paddingHorizontal: 8, // Reduced padding to fit more columns
    paddingBottom: 20,
    marginBottom: 16,
  },
  
  expandedGraphColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2, // Smaller margin for more columns
    minWidth: 18, // Much smaller minimum width for month view
    maxWidth: 32, // Maximum width for week view
  },
  
  expandedGraphBar: {
    width: 16, // Even narrower for month view
    borderRadius: 3,
    marginBottom: 4,
    minHeight: 6,
  },
  
  expandedGraphLabel: {
    fontSize: 8, // Smaller font for month view
    color: '#666',
    fontWeight: '700',
    marginBottom: 1,
  },
  
  expandedGraphValue: {
    fontSize: 8, // Smaller font for month view  
    color: '#333',
    fontWeight: '600',
  },
  
  // Line Graph Styles for Month View
  lineGraphContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  
  lineGraphArea: {
    height: 120,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 8,
  },
  
  lineGraphPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    transform: [{ translateX: -3 }, { translateY: -3 }],
  },
  
  lineGraphLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
  },
  
  lineGraphLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  lineGraphStartLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  
  lineGraphEndLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  
  lineGraphSummary: {
    fontSize: 11,
    color: '#333',
    fontWeight: '700',
    textAlign: 'center',
  },
  
  // Calendar/Schedule Page Styles
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    width: '100%',
    maxWidth: 600,
  },
  
  calendarToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  
  calendarToggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    cursor: 'pointer',
  },
  
  activeCalendarButton: {
    backgroundColor: THRIVE_COLORS.primary,
    borderColor: THRIVE_COLORS.primary,
  },
  
  inactiveCalendarButton: {
    backgroundColor: 'transparent',
    borderColor: THRIVE_COLORS.primary,
  },
  
  calendarToggleText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  
  activeCalendarText: {
    color: THRIVE_COLORS.white,
  },
  
  inactiveCalendarText: {
    color: THRIVE_COLORS.primary,
  },
  
  calendarContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  weekScrollView: {
    flex: 1,
  },
  
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  
  dayColumn: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 40,
  },
  
  todayColumn: {
    backgroundColor: '#34C759',
  },
  
  dayNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 2,
  },
  
  todayNumber: {
    color: THRIVE_COLORS.white,
  },
  
  dayName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 0.5,
  },
  
  todayName: {
    color: THRIVE_COLORS.white,
  },
  
  eventsContainer: {
    flex: 1,
  },
  
  eventsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  
  eventsList: {
    flex: 1,
  },
  
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E5E7',
  },
  
  completedEventCard: {
    borderLeftColor: '#34C759',
    backgroundColor: '#F8F9FA',
  },
  
  eventTime: {
    minWidth: 70,
    alignItems: 'center',
  },
  
  eventTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: THRIVE_COLORS.primary,
  },
  
  eventDateText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 2,
  },
  
  eventContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  eventIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
  
  eventDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 6,
  },
  
  eventProgressContainer: {
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  
  eventProgressBar: {
    height: 3,
    borderRadius: 1.5,
  },
  
  eventStatus: {
    minWidth: 24,
    alignItems: 'center',
  },
  
  eventStatusIcon: {
    fontSize: 16,
  },
  
  monthViewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  weekTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  
  monthTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  emptyStateSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
    textAlign: 'center',
  },
  
  calendarAddButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THRIVE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    cursor: 'pointer',
  },
  
  calendarAddButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: THRIVE_COLORS.white,
  },
  
  expandedGraphGoal: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Mode Toggle Button Styles
  modeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10, // Reduced top margin
    marginBottom: 5, // Small bottom margin
    paddingHorizontal: 40, // Increased to match dashboard padding and prevent button cropping
    gap: 10,
  },
  
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    cursor: 'pointer',
  },
  
  activeButton: {
    backgroundColor: THRIVE_COLORS.primary,
    borderColor: THRIVE_COLORS.primary,
  },
  
  inactiveButton: {
    backgroundColor: 'transparent',
    borderColor: THRIVE_COLORS.primary,
  },
  
  modeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  
  activeButtonText: {
    color: THRIVE_COLORS.white,
  },
  
  inactiveButtonText: {
    color: THRIVE_COLORS.primary,
  },
  
  // Date Range Toggle Button Styles
  dateRangeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24, // Increased for better separation from cards
    marginTop: 8, // Added top margin for separation from page title
    paddingHorizontal: 0, // Removed to use container padding
    gap: 16, // Increased gap between buttons
  },
  
  dateRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    cursor: 'pointer',
  },
  
  activeDateButton: {
    backgroundColor: THRIVE_COLORS.primary,
    borderColor: THRIVE_COLORS.primary,
  },
  
  inactiveDateButton: {
    backgroundColor: 'transparent',
    borderColor: THRIVE_COLORS.primary,
  },
  
  dateRangeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  
  activeDateButtonText: {
    color: THRIVE_COLORS.white,
  },
  
  inactiveDateButtonText: {
    color: THRIVE_COLORS.primary,
  },
  
  // Custom Goal Cards Styles
  customGoalsContainer: {
    marginTop: 0, // Removed since dashboard container handles spacing
    marginBottom: 0, // Removed since dashboard container handles spacing
    paddingHorizontal: 40, // Match dashboard container for consistent margins and prevent cropping
    alignItems: 'center', // Center align all content including title and grid
  },
  
  customGoalsTitle: {
    fontSize: 17, // Slightly increased for prominence
    fontWeight: '600', // Reduced for elegance
    color: '#2c2c2c', // Darker for better contrast
    textAlign: 'center',
    marginBottom: 24, // Increased for better separation
    letterSpacing: 1.2, // Increased for elegant spacing
    lineHeight: 22, // Added line height
    textTransform: 'uppercase', // Added for consistency
  },
  
  customGoalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10, // Further reduced to ensure proper fit within container
    width: '100%',
    maxWidth: 400, // Match dashboard grid max width for consistency
    alignSelf: 'center', // Center the grid within the container
  },
  
  customGoalCard: {
    flex: 1,
    minWidth: 80, // Ensure minimum width for content visibility
    maxWidth: 130, // Prevent cards from being too wide on larger screens
    backgroundColor: '#FFFFFF',
    borderRadius: 14, // Slightly reduced
    padding: 16, // Further reduced to ensure better fit
    minHeight: 115, // Reduced from 140 to prevent dashboard overflow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    cursor: 'pointer',
  },
  
  customGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14, // Increased for better separation
    paddingBottom: 4, // Added padding
  },
  
  customGoalIcon: {
    fontSize: 20, // Slightly reduced for balance
    marginRight: 8, // Increased margin
    opacity: 0.9, // Added transparency for elegance
  },
  
  customGoalTitle: {
    fontSize: 13, // Slightly reduced for elegance
    fontWeight: '700', // Reduced for balance
    letterSpacing: 1.5, // Increased for elegant spacing
    textTransform: 'uppercase', // Added for consistency
    lineHeight: 16, // Added line height
  },
  
  customGoalContent: {
    alignItems: 'center',
    marginBottom: 10, // Increased spacing
    paddingVertical: 4, // Added vertical padding
  },
  
  customGoalValue: {
    fontSize: 22, // Reduced from 28 to fit better in smaller cards
    fontWeight: '800', // Slightly reduced for elegance
    textAlign: 'center',
    marginBottom: 4, // Reduced spacing to accommodate smaller text
    lineHeight: 26, // Reduced line height proportionally
    letterSpacing: -0.3, // Adjusted spacing for smaller text
  },
  
  customGoalTarget: {
    fontSize: 11, // Slightly reduced for hierarchy
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4, // Added bottom margin
    lineHeight: 14, // Added line height
    letterSpacing: 0.2, // Added letter spacing
  },
  
  customGoalTimeframe: {
    fontSize: 9, // Slightly reduced for subtlety
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 6, // Increased margin
    lineHeight: 12, // Added line height
    letterSpacing: 0.3, // Added letter spacing
  },
  
  customGoalProgressContainer: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  
  customGoalProgressBar: {
    height: 8,
    borderRadius: 4,
  },
  
  // Calendar Sync Styles
  thriveEventBadge: {
    backgroundColor: THRIVE_COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  
  thriveEventBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'sans-serif',
  },
  
  syncStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: THRIVE_COLORS.accent,
  },
  
  syncStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  syncStatusIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  
  syncStatusInfo: {
    flex: 1,
  },
  
  syncStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  
  syncStatusSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  syncButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THRIVE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  syncButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  
  noEventsCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 24,
    marginTop: 12,
  },
  
  noEventsIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  
  noEventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  noEventsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  calendarAddButtonContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
  },
  
  bottomSettingsContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  
  bottomCalendarSettingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 102, 102, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  
  bottomCalendarSettingsButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  
  // Month Calendar Styles
  monthScrollView: {
    flex: 1,
    padding: 16,
  },
  
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  
  monthNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THRIVE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  monthNavButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
  },
  
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  
  weekdayCell: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  
  weekdayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  dateCell: {
    width: '14.28571%', // 1/7 of the width
    aspectRatio: 1,
    padding: 2,
  },
  
  emptyCellContainer: {
    width: '14.28571%',
    aspectRatio: 1,
  },
  
  dateCellContent: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  todayCell: {
    backgroundColor: '#34C759',
  },
  
  selectedCell: {
    backgroundColor: THRIVE_COLORS.accent,
  },
  
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  
  todayText: {
    color: '#fff',
  },
  
  selectedText: {
    color: '#fff',
  },
  
  eventIndicators: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  
  moreEventsText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#666',
    marginLeft: 2,
  },
  
  selectedDateEvents: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  selectedDateEventsList: {
    gap: 12,
  },
  
  selectedEventCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fafbfc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: THRIVE_COLORS.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  
  selectedEventIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  
  selectedEventInfo: {
    flex: 1,
  },
  
  selectedEventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 20,
  },
  
  selectedEventTime: {
    fontSize: 14,
    color: THRIVE_COLORS.accent,
    marginTop: 4,
    fontWeight: '500',
  },
  
  selectedEventDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
    lineHeight: 18,
  },
  
  selectedEventCategory: {
    width: 4,
    height: 30,
    borderRadius: 2,
  },
  
  noSelectedEventsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  
  noSelectedEvents: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  addEventForDateButton: {
    backgroundColor: THRIVE_COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  
  addEventForDateButtonText: {
    color: THRIVE_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  
  addEventForDateButton: {
    backgroundColor: THRIVE_COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  
  addEventForDateButtonText: {
    color: THRIVE_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  /* 👤 PROFILE PAGE STYLES */
  profileScrollView: {
    flex: 1,
  },
  
  profileHeader: {
    backgroundColor: THRIVE_COLORS.white,
    position: 'relative',
  },
  
  profileEditModeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THRIVE_COLORS.neutral,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    cursor: 'pointer',
    zIndex: 10,
  },
  
  profileEditModeButtonActive: {
    backgroundColor: THRIVE_COLORS.primary,
  },
  
  profileEditModeIcon: {
    fontSize: 18,
    color: '#666',
  },
  
  editModeIndicator: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  
  editModeIndicatorText: {
    fontSize: 12,
    color: THRIVE_COLORS.primary,
    fontWeight: '600',
  },
  
  profileAvatarContainerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingLeft: 20,
    paddingBottom: 4,
  },
  
  profileAvatarContainer: {
    position: 'absolute',
    bottom: -30,
    left: 20,
  },
  
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: THRIVE_COLORS.white,
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  profileAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
  },
  
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THRIVE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THRIVE_COLORS.white,
  },
  
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THRIVE_COLORS.white,
  },
  
  profileInfo: {
    paddingHorizontal: 20,
    paddingTop: 2,
  },
  
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  
  profileUsername: {
    fontSize: 13,
    color: '#666',
    marginBottom: 1,
  },
  
  profileLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  
  profileStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  
  statItem: {
    marginRight: 20,
    alignItems: 'center',
  },
  
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 1,
  },
  
  profileBio: {
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 18,
    marginBottom: 6,
  },
  
  profileLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  
  profileLink: {
    fontSize: 13,
    color: THRIVE_COLORS.accent,
    marginRight: 12,
    marginBottom: 2,
  },
  
  profileTag: {
    backgroundColor: THRIVE_COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 4,
  },
  
  profileTagText: {
    fontSize: 12,
    color: THRIVE_COLORS.primary,
    fontWeight: '600',
  },
  
  profileActions: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 8,
  },
  
  followButton: {
    backgroundColor: THRIVE_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    flex: 1,
    alignItems: 'center',
  },
  
  followButtonText: {
    color: THRIVE_COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  
  messageButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THRIVE_COLORS.primary,
    flex: 1,
    alignItems: 'center',
    cursor: 'pointer',
  },
  
  messageButtonText: {
    color: THRIVE_COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  
  // 🎨 Editable Card System Styles
  editableCard: {
    borderRadius: 6,
    marginVertical: 2,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  
  editableCardActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderStyle: 'dashed',
  },
  
  editableCardEditing: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: THRIVE_COLORS.primary,
    borderStyle: 'solid',
  },
  
  editableInlineCard: {
    borderRadius: 4,
    marginVertical: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  editCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  editCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THRIVE_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  editCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  saveCardButton: {
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  saveCardButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  editableText: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  
  editableTextInput: {
    borderWidth: 1,
    borderColor: THRIVE_COLORS.primary,
    borderRadius: 6,
    padding: 12,
    fontSize: 16, // Minimum 16px to prevent zoom on iOS
    backgroundColor: 'white',
    minHeight: 80,
    textAlignVertical: 'top',
    touchAction: 'manipulation',
    webkitAppearance: 'none',
  },
  
  editableTextInputInline: {
    borderWidth: 1,
    borderColor: THRIVE_COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'white',
    fontSize: 16, // Minimum 16px to prevent zoom on iOS
    touchAction: 'manipulation',
    webkitAppearance: 'none',
  },
  
  editableLinkContainer: {
    marginRight: 12,
    marginBottom: 4,
  },
  
  editableLinkInput: {
    borderWidth: 1,
    borderColor: THRIVE_COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 16, // Minimum 16px to prevent zoom on iOS
    backgroundColor: 'white',
    minWidth: 100,
    touchAction: 'manipulation',
    webkitAppearance: 'none',
  },
  
  editableTagInput: {
    borderWidth: 1,
    borderColor: THRIVE_COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 16, // Minimum 16px to prevent zoom on iOS
    backgroundColor: 'white',
    color: THRIVE_COLORS.primary,
    fontWeight: '600',
  },
  
  // Anti-zoom styles for all interactive elements
  antiZoomButton: {
    touchAction: 'manipulation',
    userSelect: 'none',
    webkitUserSelect: 'none',
    webkitTouchCallout: 'none',
    webkitTapHighlightColor: 'transparent',
  },
  
  antiZoomInput: {
    fontSize: 16, // Minimum 16px to prevent zoom on iOS
    touchAction: 'manipulation',
    webkitAppearance: 'none',
  },
  
  challengeButton: {
    backgroundColor: THRIVE_COLORS.highlight,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 2,
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    cursor: 'pointer',
  },
  
  challengeButtonText: {
    color: THRIVE_COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  

  
  profileTabs: {
    flexDirection: 'row',
    backgroundColor: THRIVE_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  profileTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  
  activeProfileTab: {
    borderBottomWidth: 2,
    borderBottomColor: THRIVE_COLORS.primary,
  },
  
  profileTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  
  activeProfileTabText: {
    color: THRIVE_COLORS.primary,
  },
  
  profileContent: {
    flex: 1,
    backgroundColor: THRIVE_COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  
  // Simple Clean Post Creation Styles
  simplePostSection: {
    marginBottom: 20,
  },
  
  cleanPostCard: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  

  
  userAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THRIVE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  userAvatarText: {
    color: THRIVE_COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  
  postTextInput: {
    flex: 1,
    fontSize: 16,
    color: THRIVE_COLORS.black,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  
  postBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    cursor: 'pointer',
  },
  
  attachIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  
  attachText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#65676B',
  },
  
  shareButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    cursor: 'pointer',
  },
  
  shareButtonActive: {
    backgroundColor: THRIVE_COLORS.primary,
  },
  
  shareButtonInactive: {
    backgroundColor: '#E5E5E5',
  },
  
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  shareButtonTextActive: {
    color: THRIVE_COLORS.white,
  },
  
  shareButtonTextInactive: {
    color: '#999',
  },
  

  

  

  
  postCreationCard: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  

  
  userAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THRIVE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  userAvatar: {
    color: THRIVE_COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  

  

  

  
  pinnedLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: THRIVE_COLORS.highlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  pinnedLabelText: {
    fontSize: 10,
    color: THRIVE_COLORS.white,
    fontWeight: '600',
  },
  
  profileSection: {
    marginBottom: 10,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  
  playlistsContainer: {
    gap: 8,
  },
  
  playlistItem: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  playlistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  
  qaDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  badgeItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  shareProfileContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  
  qrCodePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  qrCodeIcon: {
    fontSize: 32,
  },
  
  shareDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  /* 🌐 COMPREHENSIVE SOCIAL NETWORK STYLES */
  
  clickableStatItem: {
    cursor: 'pointer',
  },
  
  playlistContent: {
    flex: 1,
  },
  
  playlistCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  
  playlistArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  
  // 🎯 EXPANDABLE PLAYLIST STYLES
  playlistItemExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  
  playlistArrowExpanded: {
    color: THRIVE_COLORS.primary,
    transform: [{ rotate: '0deg' }],
  },
  
  playlistExpandedContent: {
    backgroundColor: '#F9F9F9',
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#E0E0E0',
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  
  playlistDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  
  playlistTasksContainer: {
    gap: 8,
  },
  
  playlistTasksTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  playlistTask: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THRIVE_COLORS.white,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  
  playlistTaskInfo: {
    flex: 1,
  },
  
  playlistTaskName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  playlistTaskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  playlistTaskDuration: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  
  playlistTaskDivider: {
    fontSize: 10,
    color: '#ccc',
  },
  
  playlistTaskType: {
    fontSize: 11,
    color: '#666',
  },
  
  playlistTaskDifficulty: {
    fontSize: 11,
    fontWeight: '600',
  },
  
  difficultyEasy: {
    color: '#4CAF50',
  },
  
  difficultyMedium: {
    color: '#FF9800',
  },
  
  difficultyHard: {
    color: '#F44336',
  },
  
  playlistTaskAction: {
    backgroundColor: THRIVE_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  
  playlistTaskActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: THRIVE_COLORS.white,
  },

  // 🎯 CUSTOMIZABLE ROUTINES STYLES
  routineCustomizeSection: {
    marginBottom: 16,
    alignItems: 'center',
  },

  customizeRoutinesButton: {
    backgroundColor: THRIVE_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  customizeRoutinesText: {
    color: THRIVE_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },

  customizeRoutinesButtonSmall: {
    backgroundColor: THRIVE_COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  customizeRoutinesTextSmall: {
    color: THRIVE_COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },

  routineNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  routineIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  playlistTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  playlistIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },

  playlistInfo: {
    flex: 1,
  },

  // Routine Customizer Modal Styles
  routineCustomizerModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '95%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
  },

  routineCustomizerContent: {
    flex: 1,
    padding: 20,
  },

  routineCustomizerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },

  routineCategoriesList: {
    flex: 1,
    marginBottom: 20,
  },

  routineCategoryItem: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 4,
    marginBottom: 12,
    padding: 16,
    cursor: 'pointer',
  },

  selectedRoutineCategory: {
    backgroundColor: '#F8F9FA',
    borderColor: THRIVE_COLORS.primary,
  },

  disabledRoutineCategory: {
    opacity: 0.5,
  },

  routineCategoryHeader: {
    marginBottom: 12,
  },

  routineCategoryInfo: {
    flex: 1,
  },

  routineCategoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  routineCategoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  routineCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },

  selectedRoutineCategoryTitle: {
    color: THRIVE_COLORS.primary,
  },

  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  selectedIndicatorText: {
    color: THRIVE_COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  routineCategoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },

  routineCategoryDetails: {
    marginLeft: 36,
  },

  routineCategoryDetailsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  routineCategoryDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  routineCategoryDetailBullet: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
    marginTop: 2,
  },

  routineCategoryDetailText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    lineHeight: 18,
  },

  routineCategoryMoreDetails: {
    fontSize: 12,
    color: THRIVE_COLORS.primary,
    fontWeight: '500',
    marginTop: 4,
    fontStyle: 'italic',
  },

  routineCustomizerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  selectedCountText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  saveRoutinesButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },

  saveRoutinesButtonActive: {
    backgroundColor: THRIVE_COLORS.primary,
  },

  saveRoutinesButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },

  saveRoutinesButtonTextActive: {
    color: THRIVE_COLORS.white,
  },

  // Routine Detail Styles
  routineDetailSection: {
    marginBottom: 16,
  },

  routineDetailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },

  routineDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },

  routineDetailBullet: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
    marginTop: 2,
  },

  routineDetailText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    lineHeight: 18,
  },

  taskStepsContainer: {
    marginTop: 8,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
  },

  taskStep: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  
  // 🏃‍♂️ ROUTINES TAB STYLES
  tabContentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  
  tabContentSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  
  routinesContainer: {
    gap: 8,
  },
  
  routineItem: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  routineItemExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  routineInfo: {
    flex: 1,
  },
  
  routineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  routineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  routineCategory: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  routineMetaDivider: {
    fontSize: 10,
    color: '#ccc',
  },
  
  routineDuration: {
    fontSize: 12,
    color: '#666',
  },
  
  routineDifficulty: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  routineArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  
  routineArrowExpanded: {
    color: THRIVE_COLORS.primary,
  },
  
  routineExpandedContent: {
    backgroundColor: '#F9F9F9',
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#E0E0E0',
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  
  routineDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  
  routineTasksContainer: {
    marginBottom: 16,
  },
  
  routineTasksTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  routineTask: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THRIVE_COLORS.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  
  routineTaskNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THRIVE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  routineTaskNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: THRIVE_COLORS.white,
  },
  
  routineTaskInfo: {
    flex: 1,
  },
  
  routineTaskName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  routineTaskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  routineTaskDuration: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  
  routineTaskDivider: {
    fontSize: 10,
    color: '#ccc',
  },
  
  routineTaskType: {
    fontSize: 11,
    color: '#666',
  },
  
  routineTaskStatus: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  routineTaskStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
  },
  
  routineActions: {
    alignItems: 'center',
  },
  
  routineStartButton: {
    backgroundColor: THRIVE_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 140,
    alignItems: 'center',
  },
  
  routineStartButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: THRIVE_COLORS.white,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  askQuestionButton: {
    backgroundColor: THRIVE_COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  // Complete Goal Button Styles
  completeGoalButton: {
    backgroundColor: THRIVE_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    cursor: 'pointer',
  },

  completeGoalButtonText: {
    color: THRIVE_COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  askQuestionText: {
    color: THRIVE_COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  
  /* Modal Styles */
  socialModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  
  messagingModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  
  challengeModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  
  notificationsModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  
  searchModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalCloseText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '300',
  },
  
  /* User List Styles */
  userList: {
    flex: 1,
    padding: 20,
  },
  
  userListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  
  userInfo: {
    flex: 1,
  },
  
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 4,
  },
  
  verifiedIcon: {
    fontSize: 14,
    color: THRIVE_COLORS.primary,
  },
  
  userUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  
  followUserButton: {
    backgroundColor: THRIVE_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THRIVE_COLORS.primary,
  },
  
  followUserText: {
    color: THRIVE_COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  
  followingText: {
    color: THRIVE_COLORS.primary,
  },
  
  unfollowButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  
  unfollowText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  
  /* Messages Styles */
  messagesList: {
    flex: 1,
    padding: 20,
  },
  
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  
  messageAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  messageAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  
  messageContent: {
    flex: 1,
  },
  
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  messageSender: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THRIVE_COLORS.primary,
    marginLeft: 8,
  },
  
  messageComposer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THRIVE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  sendButtonText: {
    color: THRIVE_COLORS.white,
    fontSize: 16,
  },
  
  /* Challenge Styles */
  challengesList: {
    flex: 1,
    padding: 20,
  },
  
  challengeItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  
  challengeInfo: {
    flex: 1,
  },
  
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  
  challengeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  challengeStat: {
    fontSize: 12,
    color: '#999',
  },
  
  joinChallengeButton: {
    backgroundColor: THRIVE_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 12,
    cursor: 'pointer',
  },
  
  joinChallengeText: {
    color: THRIVE_COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  
  /* Notifications Styles */
  notificationsList: {
    flex: 1,
    padding: 20,
  },
  
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  
  unreadNotification: {
    backgroundColor: '#f0f7ff',
  },
  
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  notificationIconText: {
    fontSize: 16,
  },
  
  notificationContent: {
    flex: 1,
  },
  
  notificationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  
  notificationUser: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  
  // Enhanced Notification System Styles
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  
  markAllReadButton: {
    backgroundColor: THRIVE_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  markAllReadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  
  deleteNotificationButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  
  deleteNotificationText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  
  noNotifications: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  
  noNotificationsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  
  noNotificationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  
  noNotificationsMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  /* Search Styles */
  searchContainer: {
    padding: 20,
    paddingTop: 0,
  },
  
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  
  searchResults: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  
  searchSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  
  searchResultText: {
    fontSize: 14,
    color: '#333',
  },
  
  // 🌟 NEW THRIVE LOGO COMPONENT STYLES
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  logoCircle: {
    position: 'relative',
    backgroundColor: THRIVE_COLORS.white,
    elevation: 3,
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  logoStem: {
    position: 'absolute',
    bottom: '15%',
    left: '50%',
    marginLeft: -3, // Half of width for centering
    borderRadius: 2,
  },
  
  logoLeafLeft: {
    position: 'absolute',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    transform: [{ rotate: '-25deg' }],
  },
  
  logoLeafRight: {
    position: 'absolute',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    transform: [{ rotate: '25deg' }],
  },
  
  logoCircleTop: {
    position: 'absolute',
    left: '50%',
    marginLeft: -6, // Half of circle size for centering
  },
  
  thriveLogoText: {
    fontWeight: 'bold',
    color: '#333333',
    letterSpacing: 2,
    fontFamily: 'sans-serif',
  },
  
  // 📸 PHOTO EDIT STYLES

  
  photoEditModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  
  photoEditOptions: {
    marginTop: 16,
  },
  
  photoEditOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THRIVE_COLORS.neutral,
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    cursor: 'pointer',
  },
  
  photoEditOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THRIVE_COLORS.neutral,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  photoEditOptionIconText: {
    fontSize: 24,
  },
  
  photoEditOptionContent: {
    flex: 1,
  },
  
  photoEditOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
    marginBottom: 4,
  },
  
  photoEditOptionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  
  // 💬 PERSONAL CHAT STYLES
  personalChatModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    margin: 20,
    height: '80%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    flexDirection: 'column',
  },
  
  personalChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THRIVE_COLORS.neutral,
  },
  
  chatUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  chatUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THRIVE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  chatUserAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THRIVE_COLORS.white,
  },
  
  chatUserDetails: {
    flex: 1,
  },
  
  chatUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
    marginBottom: 2,
  },
  
  chatUserStatus: {
    fontSize: 12,
    color: THRIVE_COLORS.primary,
    fontWeight: '500',
  },
  
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  
  chatMessageItem: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  
  chatMessageItemOwn: {
    justifyContent: 'flex-end',
  },
  
  chatMessageItemOther: {
    justifyContent: 'flex-start',
  },
  
  chatMessageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  
  chatMessageBubbleOwn: {
    backgroundColor: THRIVE_COLORS.primary,
    borderBottomRightRadius: 4,
  },
  
  chatMessageBubbleOther: {
    backgroundColor: THRIVE_COLORS.neutral,
    borderBottomLeftRadius: 4,
  },
  
  chatMessageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  
  chatMessageTextOwn: {
    color: THRIVE_COLORS.white,
  },
  
  chatMessageTextOther: {
    color: THRIVE_COLORS.black,
  },
  
  chatMessageTime: {
    fontSize: 10,
    fontWeight: '500',
  },
  
  chatMessageTimeOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  chatMessageTimeOther: {
    color: '#666',
  },
  
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: THRIVE_COLORS.neutral,
  },
  
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: THRIVE_COLORS.neutral,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 12,
    maxHeight: 100,
  },
  
  chatSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  chatSendButtonActive: {
    backgroundColor: THRIVE_COLORS.primary,
  },
  
  chatSendButtonInactive: {
    backgroundColor: THRIVE_COLORS.neutral,
  },
  
  chatSendButtonText: {
    fontSize: 18,
    color: THRIVE_COLORS.white,
  },
  
  // 🎯 CHALLENGE WALKTHROUGH STYLES
  challengeWalkthroughModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    margin: 20,
    maxHeight: '90%',
    maxWidth: 450,
    alignSelf: 'center',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  
  challengeWalkthroughHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THRIVE_COLORS.neutral,
  },
  
  challengeWalkthroughTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
    flex: 1,
    marginRight: 16,
  },
  
  taskProgressContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  
  taskProgressBar: {
    height: 8,
    backgroundColor: THRIVE_COLORS.neutral,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  
  taskProgressFill: {
    height: '100%',
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 4,
  },
  
  taskProgressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  currentTaskContainer: {
    padding: 20,
    flex: 1,
  },
  
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  taskStepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THRIVE_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  taskTypeChip: {
    backgroundColor: THRIVE_COLORS.neutral,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  taskTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
    marginBottom: 12,
    lineHeight: 28,
  },
  
  taskDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  
  taskDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: THRIVE_COLORS.neutral,
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  
  taskDurationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  
  taskDurationText: {
    fontSize: 14,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
  },
  
  taskActionButtons: {
    flexDirection: 'column',
    gap: 12,
  },
  
  taskCompleteButton: {
    backgroundColor: THRIVE_COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    cursor: 'pointer',
  },
  
  taskCompleteButtonText: {
    color: THRIVE_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  
  taskPreviousButton: {
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THRIVE_COLORS.neutral,
    cursor: 'pointer',
  },
  
  taskPreviousButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  
  challengeCompleteContainer: {
    padding: 40,
    alignItems: 'center',
  },
  
  challengeCompleteIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  challengeCompleteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  
  challengeCompleteDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  
  challengeCompleteActions: {
    flexDirection: 'row',
    gap: 16,
  },
  
  challengeRestartButton: {
    backgroundColor: THRIVE_COLORS.neutral,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    cursor: 'pointer',
  },
  
  challengeRestartButtonText: {
    color: THRIVE_COLORS.black,
    fontSize: 14,
    fontWeight: '600',
  },
  
  challengeDoneButton: {
    backgroundColor: THRIVE_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    cursor: 'pointer',
  },
  
  challengeDoneButtonText: {
    color: THRIVE_COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // 🏆 COMPLETED CHALLENGE STYLES
  challengeItemCompleted: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
  },
  
  challengeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  challengeTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  
  challengeDescriptionCompleted: {
    color: '#888',
  },
  
  challengeStatCompleted: {
    color: '#999',
  },
  
  completedBadge: {
    backgroundColor: THRIVE_COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  
  completedBadgeText: {
    color: THRIVE_COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  
  joinChallengeButtonCompleted: {
    backgroundColor: '#ddd',
  },
  
  joinChallengeTextCompleted: {
    color: '#666',
  },
  
  // 🎯 ADAPTIVE TASK EXECUTION MODAL STYLES
  taskExecutionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  taskExecutionModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    borderTopWidth: 6,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  taskExecutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  
  taskExecutionTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  taskExecutionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  
  taskExecutionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  
  taskExecutionTaskName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  taskExecutionCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  taskExecutionCloseText: {
    color: THRIVE_COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  taskTimerSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  taskTimerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  taskTimerTime: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  
  taskTimerLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  
  taskProgressRing: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  
  taskProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  taskDurationRemaining: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  taskContentSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  taskInstruction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  
  // Exercise-specific content
  exerciseContent: {
    alignItems: 'center',
  },
  
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  
  exerciseStat: {
    alignItems: 'center',
  },
  
  exerciseStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  
  exerciseStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  // Mindfulness-specific content
  mindfulnessContent: {
    alignItems: 'center',
  },
  
  breathingGuide: {
    backgroundColor: '#F8F9FF',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  
  breathingText: {
    fontSize: 14,
    color: '#6B73FF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Nutrition-specific content
  nutritionContent: {
    alignItems: 'center',
  },
  
  nutritionTips: {
    width: '100%',
  },
  
  nutritionTip: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 8,
  },
  
  // General content
  generalContent: {
    alignItems: 'center',
  },
  
  taskDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  
  taskActionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  
  taskPauseButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  
  taskPauseButtonActive: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  
  taskPauseButtonInactive: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  
  taskPauseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  taskCompleteButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  taskCompleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: THRIVE_COLORS.white,
  },

  // Progress Tab Styles
  progressSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  
  progressSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  
  // Top Accomplished Goals
  accomplishedGoalsContainer: {
    gap: 12,
  },
  
  accomplishedGoalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  accomplishedGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  accomplishedGoalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  
  accomplishedGoalInfo: {
    flex: 1,
  },
  
  accomplishedGoalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  
  accomplishedGoalDescription: {
    fontSize: 14,
    color: '#666',
  },
  
  accomplishedGoalBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THRIVE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  accomplishedGoalBadgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  accomplishedGoalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  
  accomplishedGoalCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: THRIVE_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  accomplishedGoalDate: {
    fontSize: 12,
    color: '#999',
  },

  // Weight Loss Progress
  weightProgressContainer: {
    gap: 20,
  },
  
  weightProgressSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  
  weightStat: {
    alignItems: 'center',
  },
  
  weightStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THRIVE_COLORS.primary,
    marginBottom: 4,
  },
  
  weightStatLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  weightProgressChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  weightProgressChartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  weightChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 10,
  },
  
  weightChartBar: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  
  weightChartBarFill: {
    width: '70%',
    borderRadius: 4,
    marginBottom: 8,
  },
  
  weightChartLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  
  weightMilestones: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  weightMilestonesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  
  milestonesContainer: {
    gap: 12,
  },
  
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  milestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  milestoneIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  milestoneInfo: {
    flex: 1,
  },
  
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  
  milestoneDate: {
    fontSize: 12,
    color: '#666',
  },

  // Mental Achievements
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  achievementCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  achievementIcon: {
    fontSize: 24,
  },
  
  achievementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  achievementLevel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    lineHeight: 16,
  },
  
  achievementProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  achievementProgressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
  },
  
  achievementProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  achievementProgressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  achievedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  
  achievedBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFB800',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },

  // Physical Achievements
  physicalAchievementsContainer: {
    gap: 20,
  },
  
  fitnessMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  
  fitnessMetricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  fitnessMetricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  fitnessMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THRIVE_COLORS.primary,
    marginBottom: 4,
  },
  
  fitnessMetricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  fitnessMetricChange: {
    fontSize: 11,
    color: THRIVE_COLORS.accent,
    fontWeight: '600',
  },
  
  strengthProgress: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  strengthProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  
  strengthMetrics: {
    gap: 12,
  },
  
  strengthMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  strengthExercise: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    width: 80,
  },
  
  strengthProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
  },
  
  strengthProgressFill: {
    height: '100%',
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 4,
  },
  
  strengthNumbers: {
    fontSize: 12,
    color: '#666',
    width: 70,
    textAlign: 'right',
  },

  // Key Progress Metrics
  keyMetricsContainer: {
    gap: 20,
  },
  
  metricsSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  metricsSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  
  healthScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: THRIVE_COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  
  healthScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THRIVE_COLORS.primary,
  },
  
  healthScoreMax: {
    fontSize: 16,
    color: '#666',
  },
  
  healthScoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  
  scoreBreakdownItem: {
    alignItems: 'center',
  },
  
  scoreBreakdownLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  
  scoreBreakdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THRIVE_COLORS.primary,
  },
  
  streaksContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  streaksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  
  streaksList: {
    gap: 12,
  },
  
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  streakIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  
  streakInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  streakName: {
    fontSize: 14,
    color: '#333',
  },
  
  streakCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  
  streakCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  
  streakDays: {
    fontSize: 12,
    color: '#666',
  },

  // Monthly Highlights
  monthlyHighlights: {
    flexDirection: 'row',
    gap: 12,
  },
  
  highlightCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  highlightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THRIVE_COLORS.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  
  highlightSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Photo Upload System Styles
  photoGridItem: {
    position: 'relative',
  },
  
  photoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  
  photoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  
  photoPlaceholder: {
    fontSize: 24,
    color: '#CCC',
  },
  
  photoOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  
  pinPhotoButton: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  pinPhotoButtonText: {
    color: 'white',
    fontSize: 10,
  },
  
  deletePhotoButton: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255,0,0,0.7)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  deletePhotoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  
  photoTagsIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  
  photoTagsText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Pinned Photo Styles
  pinnedPhotoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  
  pinnedBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  pinnedBadgeText: {
    color: 'white',
    fontSize: 12,
  },
  
  unpinButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,0,0,0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  unpinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  
  emptyPinnedContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: THRIVE_COLORS.primary + '40',
    borderStyle: 'dashed',
  },
  
  emptyPinnedText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Empty Photo Slots
  emptyPhotoSlot: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  
  emptyPhotoText: {
    fontSize: 12,
    color: '#999',
  },
  
  // Photo Upload Button
  photoUploadButton: {
    backgroundColor: THRIVE_COLORS.primary + '20',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THRIVE_COLORS.primary,
    cursor: 'pointer',
  },
  
  uploadButtonContainer: {
    alignItems: 'center',
  },
  
  uploadButtonIcon: {
    fontSize: 32,
    color: THRIVE_COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  uploadButtonText: {
    fontSize: 12,
    color: THRIVE_COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  
  uploadButtonSubtext: {
    fontSize: 10,
    color: THRIVE_COLORS.primary + 'AA',
    textAlign: 'center',
  },
  
  // Attachment Picker Modal Styles
  attachmentModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  
  attachmentModalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  
  attachmentPickerModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 2001,
  },
  
  attachmentOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  
  attachmentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  attachmentIconText: {
    fontSize: 20,
  },
  
  attachmentTextContainer: {
    flex: 1,
  },
  
  attachmentOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  
  attachmentOptionDesc: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  
  attachmentDivider: {
    height: 1,
    backgroundColor: '#E5E5E7',
    marginHorizontal: 20,
  },

  // Photo Modal Styles
  photoModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  
  photoUploadModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 450,
    maxHeight: '90%',
    overflow: 'hidden',
    margin: 10,
  },
  
  photoUploadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  
  photoUploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  photoCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  photoCloseButtonText: {
    fontSize: 20,
    color: '#666',
    lineHeight: 20,
  },
  
  photoUploadContent: {
    padding: 20,
    gap: 16,
  },
  
  photoFileSection: {
    gap: 8,
  },
  
  photoUploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  
  photoFileSelector: {
    gap: 8,
  },
  
  photoFileButton: {
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  
  photoFileButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  photoPreview: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  
  photoPreviewText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  
  photoInputSection: {
    gap: 8,
  },
  
  photoTextInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  
  photoInputField: {
    fontSize: 14,
    color: '#333',
    border: 'none',
    width: '100%',
    fontFamily: 'inherit',
  },
  
  photoInputHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  
  photoUploadActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  
  photoCancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  
  photoCancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  
  photoSubmitButton: {
    flex: 1,
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  
  photoSubmitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Photo Detail Modal Styles
  photoDetailModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  
  photoDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  
  photoDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  photoDetailContent: {
    padding: 20,
    gap: 16,
  },
  
  photoDetailImage: {
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  
  photoDetailPlaceholder: {
    fontSize: 48,
    color: '#CCC',
  },
  
  photoDetailImageText: {
    fontSize: 14,
    color: '#666',
  },
  
  photoDetailSection: {
    gap: 4,
  },
  
  photoDetailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THRIVE_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  photoDetailText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  
  photoDetailTags: {
    fontSize: 14,
    color: THRIVE_COLORS.accent,
    fontWeight: '500',
  },
  
  photoDetailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  
  photoActionButton: {
    flex: 1,
    backgroundColor: THRIVE_COLORS.primary + '20',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THRIVE_COLORS.primary,
  },
  
  photoActionButtonText: {
    color: THRIVE_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  photoDeleteAction: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  
  photoDeleteActionText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },

  // Photo Source Selector Styles
  photoSourceModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 380,
    overflow: 'hidden',
  },
  
  photoSourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  
  photoSourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  photoSourceContent: {
    padding: 20,
  },
  
  photoSourceDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  photoSourceOptions: {
    gap: 16,
  },
  
  photoSourceOption: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    cursor: 'pointer',
  },
  
  photoSourceOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THRIVE_COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  
  photoSourceOptionIconText: {
    fontSize: 28,
  },
  
  photoSourceOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  photoSourceOptionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Updated Photo Upload Modal Styles
  photoSourceDisplay: {
    backgroundColor: THRIVE_COLORS.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  
  photoSourceInfo: {
    marginTop: 4,
  },
  
  photoSourceInfoText: {
    fontSize: 12,
    color: THRIVE_COLORS.primary,
    fontWeight: '500',
  },
  
  webBrowserNote: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 14,
  },
  
  captionOnlyButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    alignItems: 'center',
  },
  
  captionOnlyButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  
  captionOnlyPhoto: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FF',
  },
  
  captionOnlyIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  
  captionOnlyLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  
  photoPreviewTapArea: {
    position: 'relative',
    marginTop: 8,
  },
  
  photoTapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  
  photoTapHint: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  
  hashtagInfo: {
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  
  hashtagInfoText: {
    fontSize: 12,
    color: THRIVE_COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  photoPreviewSection: {
    gap: 16,
  },
  
  photoPreviewContainer: {
    alignItems: 'center',
  },
  
  photoPreviewImage: {
    width: 200,
    height: 150,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  
  photoPreviewPlaceholder: {
    fontSize: 40,
    color: '#CCC',
  },
  
  photoPreviewImageText: {
    fontSize: 12,
    color: '#666',
  },
  
  photoPreviewActions: {
    alignItems: 'center',
  },
  
  retakePhotoButton: {
    backgroundColor: THRIVE_COLORS.accent + '20',
    borderColor: THRIVE_COLORS.accent,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  
  retakePhotoButtonText: {
    color: THRIVE_COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  
  photoWaitingSection: {
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  
  photoWaitingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  photoWaitingIconText: {
    fontSize: 36,
  },
  
  photoWaitingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  retryPhotoButton: {
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  
  retryPhotoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Follow System Styles
  followingButton: {
    backgroundColor: '#E8F5E8',
    borderColor: THRIVE_COLORS.primary,
    borderWidth: 1,
  },
  
  followingButtonText: {
    color: THRIVE_COLORS.primary,
  },
  
  // Header Notification Badge
  headerNotificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  
  headerNotificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Q&A System Styles
  qaPreview: {
    marginTop: 12,
    gap: 12,
  },
  
  qaPreviewItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: THRIVE_COLORS.accent,
  },
  
  qaPreviewQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  
  qaPreviewAnswer: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  
  seeMoreQA: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  seeMoreQAText: {
    fontSize: 14,
    color: THRIVE_COLORS.primary,
    fontWeight: '600',
  },
  
  // Q&A Tab Styles
  qaTabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  notificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  
  notificationBadgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  notificationBadgeLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  qaActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  
  qaActionButton: {
    flex: 1,
    backgroundColor: THRIVE_COLORS.primary + '20',
    borderColor: THRIVE_COLORS.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  
  qaActionButtonText: {
    color: THRIVE_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  answeredQuestionsSection: {
    marginTop: 8,
  },
  
  answeredQuestionsList: {
    gap: 16,
    marginTop: 16,
  },
  
  answeredQuestionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  questionAsker: {
    fontSize: 12,
    fontWeight: '600',
    color: THRIVE_COLORS.primary,
  },
  
  questionTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  
  questionContent: {
    gap: 8,
  },
  
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
  },
  
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  noQuestionsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  
  noQuestionsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  
  noQuestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  
  noQuestionsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Q&A Modal Styles
  qaModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 60, // Leave space for tab navigation (60px height)
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  
  qaModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  
  qaManagerModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '95%',
    maxWidth: 600,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  
  qaModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  
  qaModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  qaCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  qaCloseButtonText: {
    fontSize: 20,
    color: '#666',
    lineHeight: 20,
  },
  
  qaModalContent: {
    padding: 20,
  },
  
  qaModalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  qaInputSection: {
    marginBottom: 20,
  },
  
  qaInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  
  qaTextInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  
  qaTextArea: {
    fontSize: 14,
    color: '#333',
    border: 'none',
    width: '100%',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: 80,
  },
  
  qaInputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  
  qaModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  qaCancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  
  qaCancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  
  qaSubmitButton: {
    flex: 1,
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  
  qaSubmitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  qaSubmitButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  
  qaSubmitButtonTextDisabled: {
    color: '#999',
  },
  
  // Question Manager Styles
  questionsList: {
    maxHeight: 400,
  },
  
  questionManagerCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  questionManagerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  questionManagerInfo: {
    flex: 1,
  },
  
  questionManagerAsker: {
    fontSize: 12,
    fontWeight: '600',
    color: THRIVE_COLORS.primary,
  },
  
  questionManagerTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  
  questionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  answeredBadge: {
    backgroundColor: '#E8F5E8',
  },
  
  unansweredBadge: {
    backgroundColor: '#FFEBEE',
  },
  
  questionStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  answeredText: {
    color: '#2E7D32',
  },
  
  unansweredText: {
    color: '#D32F2F',
  },
  
  questionManagerText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  
  questionManagerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  answerQuestionButton: {
    flex: 1,
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  
  answerQuestionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  deleteQuestionButton: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  
  deleteQuestionButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  
  existingAnswer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: THRIVE_COLORS.primary,
  },
  
  existingAnswerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THRIVE_COLORS.primary,
    marginBottom: 4,
  },
  
  existingAnswerText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  
  // Answer Question Modal Styles
  questionToAnswer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: THRIVE_COLORS.accent,
  },
  
  questionToAnswerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THRIVE_COLORS.accent,
    marginBottom: 6,
  },
  
  questionToAnswerText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  // Expanded Steps Styles
  expandedStepsContainer: {
    marginTop: 12,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  
  expandedStepsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  expandedStep: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  
  stepNumberText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  
  stepText: {
    flex: 1,
    fontSize: 12,
    color: '#444',
    lineHeight: 16,
  },
  
  // Routine Detail Content Styles
  routineDetailContent: {
    flex: 1,
  },
  
  learnButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  
  learnButtonText: {
    fontSize: 11,
    color: THRIVE_COLORS.primary,
    fontWeight: '600',
  },
  
  // Routine Expanded Steps
  routineExpandedSteps: {
    marginTop: 12,
    backgroundColor: '#F8FFFE',
    borderRadius: 8,
    padding: 16,
    marginLeft: 20,
    borderLeftWidth: 3,
  },
  
  routineStepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  
  routineStep: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  
  routineStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  
  routineStepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  
  routineStepText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  
  // Routine Actions
  routineActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  
  routineEditButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  
  routineEditButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  routineStartButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  
  routineStartButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Routine Editor Modal Styles
  routineEditorModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  
  routineEditorContent: {
    maxHeight: 400,
    paddingBottom: 20,
  },
  
  routineEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  
  routineEditorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  
  routineEditorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  
  routineEditorDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  customDetailsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  
  customTasksSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  customSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  
  customSectionSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  
  customDetailItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  
  customDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  customDetailSteps: {
    fontSize: 12,
    color: '#666',
  },
  
  customTaskItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  
  customTaskName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  
  customTaskMeta: {
    fontSize: 12,
    color: '#666',
  },
  
  addCustomButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
  },
  
  addCustomButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  routineEditorFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  
  saveCustomizationButton: {
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  
  saveCustomizationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Task Starter Modal Styles
  taskStarterModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  
  taskStarterContent: {
    padding: 20,
  },
  
  taskStarterHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  taskStarterIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  
  taskStarterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  
  taskStarterDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  taskStarterGuide: {
    marginBottom: 20,
  },
  
  taskStarterGuideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  
  taskStarterInstructions: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 16,
  },
  
  startOptionsContainer: {
    gap: 12,
  },
  
  startOption: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
  },
  
  startOptionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  
  startOptionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  
  taskStepsPreview: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  
  taskStepsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  
  taskStepPreview: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  
  stepPreviewNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  
  stepPreviewNumberText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  
  stepPreviewText: {
    flex: 1,
    fontSize: 12,
    color: '#444',
    lineHeight: 16,
  },
  
  startTaskActions: {
    alignItems: 'center',
  },
  
  startTaskButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    minWidth: 200,
  },
  
  startTaskButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Modern Facebook-Inspired Modal Styles
  modernModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  
  modernPostModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  
  modernModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  
  modernModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
  },
  
  modernCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  
  modernCloseButtonText: {
    fontSize: 18,
    color: '#65676B',
  },
  
  modernModalContent: {
    flex: 1,
    padding: 20,
  },
  
  modalUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  modalUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THRIVE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  modalUserAvatarText: {
    color: THRIVE_COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  
  modalUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
  },
  
  modalUserSubtext: {
    fontSize: 14,
    color: '#65676B',
  },
  
  modernCaptionSection: {
    marginBottom: 20,
  },
  
  modernCaptionInput: {
    fontSize: 16,
    color: THRIVE_COLORS.black,
    borderWidth: 0,
    padding: 12,
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  mediaPreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  
  mediaPreviewLabel: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  
  removeMediaButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F44336',
    borderRadius: 6,
    cursor: 'pointer',
  },
  
  removeMediaText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  modernMediaOptions: {
    marginBottom: 24,
  },
  
  mediaOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
    marginBottom: 12,
  },
  
  mediaButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  modernMediaButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F0F2F5',
    minWidth: 70,
    cursor: 'pointer',
  },
  
  modernMediaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  
  modernMediaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#65676B',
  },
  
  modernPostButtonContainer: {
    alignItems: 'center',
  },
  
  modernPostButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    cursor: 'pointer',
  },
  
  modernPostButtonActive: {
    backgroundColor: THRIVE_COLORS.primary,
  },
  
  modernPostButtonInactive: {
    backgroundColor: '#E5E5E5',
  },
  
  modernPostButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  modernPostButtonTextActive: {
    color: THRIVE_COLORS.white,
  },
  
  modernPostButtonTextInactive: {
    color: '#999',
  },
  
  // Settings Modal Styles
  settingsModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 50,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  settingsContent: {
    maxHeight: 600,
  },
  
  settingsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THRIVE_COLORS.black,
    marginBottom: 8,
  },
  
  settingsSectionDescription: {
    fontSize: 14,
    color: '#65676B',
    lineHeight: 20,
    marginBottom: 16,
  },
  
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    cursor: 'pointer',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  
  settingsButtonDanger: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFE5E5',
  },
  
  settingsButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  settingsButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  
  settingsButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
    marginBottom: 2,
  },
  
  settingsButtonSubtitle: {
    fontSize: 13,
    color: '#65676B',
    lineHeight: 18,
  },
  
  settingsButtonArrow: {
    fontSize: 20,
    color: '#BCC0C4',
    fontWeight: '300',
  },
  
  settingsDangerText: {
    color: '#E74C3C',
  },
  
  settingsInfoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  
  settingsInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THRIVE_COLORS.primary,
    marginBottom: 4,
  },
  
  settingsInfoSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#65676B',
    marginBottom: 8,
  },
  
  settingsInfoDescription: {
    fontSize: 13,
    color: '#65676B',
    lineHeight: 18,
  },
  
  // Modal Styles for New Modals
  analyticsModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 50,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  achievementsModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 50,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  tutorialsModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 50,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  helpModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 50,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  appInfoModal: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 50,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  modalScrollContent: {
    maxHeight: 500,
  },
  
  // Analytics Modal Styles
  analyticsContent: {
    padding: 20,
  },
  
  analyticsSection: {
    fontSize: 18,
    fontWeight: '700',
    color: THRIVE_COLORS.black,
    marginTop: 20,
    marginBottom: 12,
  },
  
  progressCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  
  progressTitle: {
    fontSize: 14,
    color: '#65676B',
    marginBottom: 8,
  },
  
  progressValue: {
    fontSize: 32,
    fontWeight: '700',
    color: THRIVE_COLORS.primary,
    marginBottom: 4,
  },
  
  progressSubtext: {
    fontSize: 12,
    color: THRIVE_COLORS.accent,
    fontWeight: '600',
  },
  
  trendGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  trendCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    flex: 0.48,
    alignItems: 'center',
  },
  
  trendIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  trendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
    marginBottom: 4,
  },
  
  trendValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THRIVE_COLORS.primary,
  },
  
  achievementText: {
    fontSize: 14,
    color: '#65676B',
    marginBottom: 8,
    paddingLeft: 8,
  },
  
  // Achievements Modal Styles
  achievementsContent: {
    padding: 20,
  },
  
  achievementBadge: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  
  lockedBadge: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },
  
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  
  badgeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THRIVE_COLORS.black,
    marginBottom: 8,
  },
  
  badgeDescription: {
    fontSize: 14,
    color: '#65676B',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  badgeStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: THRIVE_COLORS.primary,
  },
  
  // Tutorials Modal Styles
  tutorialsContent: {
    padding: 20,
  },
  
  tutorialCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  
  tutorialIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  
  tutorialTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THRIVE_COLORS.black,
    marginBottom: 8,
  },
  
  tutorialDescription: {
    fontSize: 14,
    color: '#65676B',
    marginBottom: 12,
    lineHeight: 20,
  },
  
  tutorialButton: {
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  
  tutorialButtonText: {
    color: THRIVE_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Help Modal Styles
  helpContent: {
    padding: 20,
  },
  
  helpSection: {
    fontSize: 18,
    fontWeight: '700',
    color: THRIVE_COLORS.black,
    marginTop: 20,
    marginBottom: 16,
  },
  
  faqItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
    marginBottom: 8,
  },
  
  faqAnswer: {
    fontSize: 14,
    color: '#65676B',
    lineHeight: 20,
  },
  
  contactInfo: {
    fontSize: 14,
    color: '#65676B',
    marginBottom: 8,
    paddingLeft: 8,
  },
  
  // App Info Modal Styles
  appInfoContent: {
    padding: 20,
  },
  
  appLogoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  
  appVersion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#65676B',
    marginTop: 12,
  },
  
  appDescription: {
    fontSize: 14,
    color: '#65676B',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  
  appFeatures: {
    marginBottom: 24,
  },
  
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THRIVE_COLORS.black,
    marginBottom: 12,
  },
  
  featureItem: {
    fontSize: 14,
    color: '#65676B',
    marginBottom: 6,
    paddingLeft: 8,
  },
  
  appCopyright: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },


});

export default ThriveSwipeAppWeb;