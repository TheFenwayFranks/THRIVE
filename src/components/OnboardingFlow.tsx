import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface OnboardingFlowProps {
  visible: boolean;
  onComplete: (userProfile: UserProfile) => void;
}

interface UserProfile {
  name: string;
  motivation: 'gentle' | 'energetic' | 'focused';
  goals: string[];
  reason: string;
  pathway: 'wellness' | 'fitness' | 'performance' | '';
  morningFlowEnabled: boolean;
  communityUsername: string;
}

export default function OnboardingFlow({ visible, onComplete }: OnboardingFlowProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    motivation: 'gentle',
    goals: [],
    reason: '',
    pathway: '',
    morningFlowEnabled: false,
    communityUsername: ''
  });

  const steps = [
    'welcome',
    'name',
    'reason',
    'goals', 
    'pathway',
    'motivation',
    'morningFlow',
    'username',
    'complete'
  ];

  const handleNext = () => {
    // Validation before proceeding
    if (steps[currentStep] === 'goals' && !validateGoals()) {
      Alert.alert(
        'Goals Required', 
        'Please select 1-3 goals to continue your THRIVE journey.'
      );
      return;
    }
    
    if (steps[currentStep] === 'pathway' && !validatePathway()) {
      Alert.alert(
        'Pathway Required', 
        'Please select a fitness journey that matches your current goals.'
      );
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Validate required fields
    if (!userProfile.name.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue.');
      return;
    }
    
    if (!userProfile.communityUsername.trim()) {
      Alert.alert('Username Required', 'Please create a community username.');
      return;
    }

    // Basic profanity filter
    const inappropriateWords = ['hate', 'stupid', 'dumb', 'loser', 'idiot', 'fail'];
    const username = userProfile.communityUsername.toLowerCase();
    if (inappropriateWords.some(word => username.includes(word))) {
      Alert.alert('Username Not Allowed', 'Please choose a more positive username that reflects the THRIVE community spirit.');
      return;
    }

    onComplete(userProfile);
  };

  const toggleGoal = (goal: string) => {
    let goals;
    if (userProfile.goals.includes(goal)) {
      // Remove goal if already selected
      goals = userProfile.goals.filter(g => g !== goal);
    } else {
      // Add goal if under 3 goals selected
      if (userProfile.goals.length < 3) {
        goals = [...userProfile.goals, goal];
      } else {
        // If 3 goals already selected, don't add more
        return;
      }
    }
    setUserProfile({ ...userProfile, goals });
  };

  const validateGoals = () => {
    return userProfile.goals.length >= 1 && userProfile.goals.length <= 3;
  };

  const validatePathway = () => {
    return userProfile.pathway !== '';
  };

  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'welcome':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.welcomeTitle}>Welcome to THRIVE! 🌟</Text>
            <Text style={styles.welcomeSubtitle}>Movement for Mental Health</Text>
            
            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeText}>
                THRIVE is designed to help you build sustainable wellness habits through gentle movement and mindful practices.
              </Text>
              
              <View style={styles.featureList}>
                <Text style={styles.featureItem}>✅ Personalized workouts</Text>
                <Text style={styles.featureItem}>✅ Flexible task completion</Text>
                <Text style={styles.featureItem}>✅ Supportive community</Text>
                <Text style={styles.featureItem}>✅ Progress tracking</Text>
              </View>
              
              <Text style={styles.welcomeText}>
                Let's set up your personalized THRIVE experience in just a few quick steps.
              </Text>
            </View>
          </View>
        );

      case 'name':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your name?</Text>
            <Text style={styles.stepSubtitle}>We'll use this to personalize your experience</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textMuted}
              value={userProfile.name}
              onChangeText={(name) => setUserProfile({ ...userProfile, name })}
              autoFocus
            />
          </View>
        );

      case 'reason':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What brings you to THRIVE?</Text>
            <Text style={styles.stepSubtitle}>Understanding your motivation helps us support you better</Text>
            
            <View style={styles.optionsContainer}>
              {[
                { id: 'stress', label: 'Manage stress and anxiety', emoji: '🧘‍♀️' },
                { id: 'mood', label: 'Improve mood and energy', emoji: '☀️' },
                { id: 'fitness', label: 'Build healthy habits', emoji: '💪' },
                { id: 'focus', label: 'Enhance focus and clarity', emoji: '🎯' },
                { id: 'sleep', label: 'Better sleep and relaxation', emoji: '😴' },
                { id: 'community', label: 'Connect with like-minded people', emoji: '🤝' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    userProfile.reason === option.id && styles.optionButtonSelected
                  ]}
                  onPress={() => setUserProfile({ ...userProfile, reason: option.id })}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.optionText,
                    userProfile.reason === option.id && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'goals':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What are your wellness goals?</Text>
            <Text style={styles.stepSubtitle}>Select 1-3 goals that matter most to you</Text>
            
            {/* Goal Counter */}
            <View style={styles.goalCounterContainer}>
              <Text style={styles.goalCounterText}>
                {userProfile.goals.length} of 3 selected
              </Text>
              {!validateGoals() && (
                <Text style={styles.goalValidationText}>
                  {userProfile.goals.length === 0 ? 'Please select at least 1 goal' : 'Select up to 3 goals'}
                </Text>
              )}
            </View>
            
            <View style={styles.optionsContainer}>
              {[
                { id: 'daily-movement', label: 'Move my body daily', emoji: '🚶‍♀️' },
                { id: 'stress-relief', label: 'Reduce daily stress', emoji: '🧘‍♀️' },
                { id: 'energy-boost', label: 'Increase energy levels', emoji: '⚡' },
                { id: 'better-sleep', label: 'Improve sleep quality', emoji: '😴' },
                { id: 'mood-stability', label: 'Stabilize my mood', emoji: '💚' },
                { id: 'build-routine', label: 'Build consistent routines', emoji: '📅' }
              ].map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalButton,
                    userProfile.goals.includes(goal.id) && styles.goalButtonSelected,
                    userProfile.goals.length >= 3 && !userProfile.goals.includes(goal.id) && styles.goalButtonDisabled
                  ]}
                  onPress={() => toggleGoal(goal.id)}
                  disabled={userProfile.goals.length >= 3 && !userProfile.goals.includes(goal.id)}
                  accessible={true}
                  accessibilityLabel={`${goal.label}. ${userProfile.goals.includes(goal.id) ? 'Selected' : 'Not selected'}`}
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: userProfile.goals.includes(goal.id),
                    disabled: userProfile.goals.length >= 3 && !userProfile.goals.includes(goal.id)
                  }}
                >
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <View style={styles.goalContent}>
                    <View style={styles.goalCheckbox}>
                      {userProfile.goals.includes(goal.id) && (
                        <Text style={styles.goalCheckmark}>✓</Text>
                      )}
                    </View>
                    <Text style={[
                      styles.goalText,
                      userProfile.goals.includes(goal.id) && styles.goalTextSelected,
                      userProfile.goals.length >= 3 && !userProfile.goals.includes(goal.id) && styles.goalTextDisabled
                    ]}>
                      {goal.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'pathway':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Choose Your THRIVE Journey</Text>
            <Text style={styles.stepSubtitle}>Don't worry - you can always change this later in settings</Text>
            <Text style={styles.pathwayQuestion}>Which fitness journey matches where you are right now?</Text>
            
            {!validatePathway() && (
              <View style={styles.pathwayValidationContainer}>
                <Text style={styles.pathwayValidationText}>
                  Please select a pathway to continue
                </Text>
              </View>
            )}
            
            <View style={styles.pathwayOptions}>
              {/* Wellness Journey */}
              <TouchableOpacity
                style={[
                  styles.pathwayCard,
                  userProfile.pathway === 'wellness' && styles.pathwayCardSelected
                ]}
                onPress={() => setUserProfile({ ...userProfile, pathway: 'wellness' })}
                accessible={true}
                accessibilityLabel="Wellness Journey. I'm focusing on mental health through gentle movement"
                accessibilityRole="radio"
                accessibilityState={{ selected: userProfile.pathway === 'wellness' }}
              >
                <View style={[styles.pathwayGradient, styles.pathwayWellness]}>
                  <Text style={styles.pathwayEmoji}>🌱</Text>
                  <Text style={styles.pathwayTitle}>Wellness Journey</Text>
                  {userProfile.pathway === 'wellness' && (
                    <View style={styles.pathwayCheckmark}>
                      <Text style={styles.pathwayCheckmarkText}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.pathwayContent}>
                  <Text style={styles.pathwayDescription}>
                    I'm focusing on mental health through gentle movement
                  </Text>
                  <Text style={styles.pathwayTagline}>"Every step is progress"</Text>
                  <View style={styles.pathwayBadge}>
                    <Text style={styles.pathwayBadgeText}>Low impact, high support</Text>
                  </View>
                  <Text style={styles.pathwayExamples}>
                    Walking, stretching, breathing exercises
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Fitness Journey */}
              <TouchableOpacity
                style={[
                  styles.pathwayCard,
                  userProfile.pathway === 'fitness' && styles.pathwayCardSelected
                ]}
                onPress={() => setUserProfile({ ...userProfile, pathway: 'fitness' })}
                accessible={true}
                accessibilityLabel="Fitness Journey. I want to build healthy habits and stay consistently active"
                accessibilityRole="radio"
                accessibilityState={{ selected: userProfile.pathway === 'fitness' }}
              >
                <View style={[styles.pathwayGradient, styles.pathwayFitness]}>
                  <Text style={styles.pathwayEmoji}>💪</Text>
                  <Text style={styles.pathwayTitle}>Fitness Journey</Text>
                  {userProfile.pathway === 'fitness' && (
                    <View style={styles.pathwayCheckmark}>
                      <Text style={styles.pathwayCheckmarkText}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.pathwayContent}>
                  <Text style={styles.pathwayDescription}>
                    I want to build healthy habits and stay consistently active
                  </Text>
                  <Text style={styles.pathwayTagline}>"Building strength inside and out"</Text>
                  <View style={styles.pathwayBadge}>
                    <Text style={styles.pathwayBadgeText}>Moderate challenge, balanced approach</Text>
                  </View>
                  <Text style={styles.pathwayExamples}>
                    Regular workouts, jogging, gym sessions
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Performance Journey */}
              <TouchableOpacity
                style={[
                  styles.pathwayCard,
                  userProfile.pathway === 'performance' && styles.pathwayCardSelected
                ]}
                onPress={() => setUserProfile({ ...userProfile, pathway: 'performance' })}
                accessible={true}
                accessibilityLabel="Performance Journey. I'm athletic and want to optimize both physical and mental performance"
                accessibilityRole="radio"
                accessibilityState={{ selected: userProfile.pathway === 'performance' }}
              >
                <View style={[styles.pathwayGradient, styles.pathwayPerformance]}>
                  <Text style={styles.pathwayEmoji}>🏃‍♀️</Text>
                  <Text style={styles.pathwayTitle}>Performance Journey</Text>
                  {userProfile.pathway === 'performance' && (
                    <View style={styles.pathwayCheckmark}>
                      <Text style={styles.pathwayCheckmarkText}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.pathwayContent}>
                  <Text style={styles.pathwayDescription}>
                    I'm athletic and want to optimize both physical and mental performance
                  </Text>
                  <Text style={styles.pathwayTagline}>"Excellence in body and mind"</Text>
                  <View style={styles.pathwayBadge}>
                    <Text style={styles.pathwayBadgeText}>High challenge, elite mindset</Text>
                  </View>
                  <Text style={styles.pathwayExamples}>
                    Intense training, competitive sports, advanced fitness
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'motivation':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How do you prefer to be motivated?</Text>
            <Text style={styles.stepSubtitle}>This helps us customize your experience</Text>
            
            <View style={styles.motivationOptions}>
              <TouchableOpacity
                style={[
                  styles.motivationCard,
                  userProfile.motivation === 'gentle' && styles.motivationCardSelected
                ]}
                onPress={() => setUserProfile({ ...userProfile, motivation: 'gentle' })}
              >
                <Text style={styles.motivationEmoji}>🌱</Text>
                <Text style={styles.motivationTitle}>Gentle & Encouraging</Text>
                <Text style={styles.motivationDescription}>
                  Soft guidance with compassionate support
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.motivationCard,
                  userProfile.motivation === 'energetic' && styles.motivationCardSelected
                ]}
                onPress={() => setUserProfile({ ...userProfile, motivation: 'energetic' })}
              >
                <Text style={styles.motivationEmoji}>⚡</Text>
                <Text style={styles.motivationTitle}>Energetic & Upbeat</Text>
                <Text style={styles.motivationDescription}>
                  Dynamic encouragement to keep you moving
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.motivationCard,
                  userProfile.motivation === 'focused' && styles.motivationCardSelected
                ]}
                onPress={() => setUserProfile({ ...userProfile, motivation: 'focused' })}
              >
                <Text style={styles.motivationEmoji}>🎯</Text>
                <Text style={styles.motivationTitle}>Focused & Direct</Text>
                <Text style={styles.motivationDescription}>
                  Clear, goal-oriented guidance
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'morningFlow':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Daily Motivation Flow</Text>
            <Text style={styles.stepSubtitle}>Would you like a daily dose of motivation?</Text>
            
            <View style={styles.morningFlowContainer}>
              <View style={styles.morningFlowInfo}>
                <Text style={styles.morningFlowTitle}>🌅 Morning Flow</Text>
                <Text style={styles.morningFlowDescription}>
                  Start each day with intention setting, motivation, and wellness check-ins. This optional feature provides daily encouragement for those who want extra support on their wellness journey.
                </Text>
              </View>

              <View style={styles.morningFlowOptions}>
                <TouchableOpacity
                  style={[
                    styles.morningFlowOption,
                    userProfile.morningFlowEnabled && styles.morningFlowOptionSelected
                  ]}
                  onPress={() => setUserProfile({ ...userProfile, morningFlowEnabled: true })}
                >
                  <Text style={styles.morningFlowOptionText}>
                    ✅ Yes, give me daily motivation!
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.morningFlowOption,
                    !userProfile.morningFlowEnabled && styles.morningFlowOptionSelected
                  ]}
                  onPress={() => setUserProfile({ ...userProfile, morningFlowEnabled: false })}
                >
                  <Text style={styles.morningFlowOptionText}>
                    🎯 No thanks, I prefer to start fresh
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.morningFlowNote}>
                Don't worry - you can always change this later in Settings!
              </Text>
            </View>
          </View>
        );

      case 'username':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Create your community username</Text>
            <Text style={styles.stepSubtitle}>This is how you'll appear in the THRIVE community</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Choose a positive username"
              placeholderTextColor={theme.colors.textMuted}
              value={userProfile.communityUsername}
              onChangeText={(username) => setUserProfile({ ...userProfile, communityUsername: username })}
              autoCapitalize="none"
            />
            
            <View style={styles.usernameGuidelines}>
              <Text style={styles.guidelineTitle}>Username Guidelines:</Text>
              <Text style={styles.guideline}>• Choose something positive and encouraging</Text>
              <Text style={styles.guideline}>• Reflect the supportive THRIVE community spirit</Text>
              <Text style={styles.guideline}>• Avoid negative or inappropriate language</Text>
            </View>
          </View>
        );

      case 'complete':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.completeTitle}>You're all set! 🎉</Text>
            <Text style={styles.completeSubtitle}>Welcome to your personalized THRIVE experience</Text>
            
            <View style={styles.profileSummary}>
              <Text style={styles.summaryTitle}>Your Profile:</Text>
              <Text style={styles.summaryItem}>👤 Name: {userProfile.name}</Text>
              <Text style={styles.summaryItem}>🎯 Goals: {userProfile.goals.length} selected</Text>
              <Text style={styles.summaryItem}>🚀 Journey: {userProfile.pathway.charAt(0).toUpperCase() + userProfile.pathway.slice(1)} Path</Text>
              <Text style={styles.summaryItem}>💫 Style: {userProfile.motivation} motivation</Text>
              <Text style={styles.summaryItem}>🌅 Morning Flow: {userProfile.morningFlowEnabled ? 'Enabled' : 'Disabled'}</Text>
              <Text style={styles.summaryItem}>👥 Username: {userProfile.communityUsername}</Text>
            </View>
            
            <Text style={styles.completeMessage}>
              Ready to start your wellness journey? Let's THRIVE together! 💚
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / steps.length) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep + 1} of {steps.length}
            </Text>
          </View>

          {/* Step Content */}
          {renderStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
            onPress={currentStep === steps.length - 1 ? handleComplete : handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Start THRIVING!' : 
               steps[currentStep] === 'goals' ? 'Continue with Selected Goals' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9f0', // THRIVE background
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  
  // Progress
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Step Container
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Welcome
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#16A34A',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  // Step Title
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  
  // Text Input
  textInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  
  // Options
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
  },
  optionButtonSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  optionTextSelected: {
    color: '#16A34A',
    fontWeight: '600',
  },
  
  // Goal Counter
  goalCounterContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  goalCounterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
    marginBottom: 4,
  },
  goalValidationText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },
  
  // Goals
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
  },
  goalButtonSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  goalButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
  },
  goalEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  goalContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCheckmark: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: 'bold',
  },
  goalText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  goalTextSelected: {
    color: '#16A34A',
    fontWeight: '600',
  },
  goalTextDisabled: {
    color: '#9CA3AF',
  },
  
  // Motivation Cards
  motivationOptions: {
    gap: 16,
  },
  motivationCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  motivationCardSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  motivationEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  motivationDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Morning Flow
  morningFlowContainer: {
    gap: 20,
  },
  morningFlowInfo: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  morningFlowTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 8,
  },
  morningFlowDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  morningFlowOptions: {
    gap: 12,
  },
  morningFlowOption: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
  },
  morningFlowOptionSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  morningFlowOptionText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  morningFlowNote: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Username Guidelines
  usernameGuidelines: {
    marginTop: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
  },
  guidelineTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 8,
  },
  guideline: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  
  // Complete
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16A34A',
    textAlign: 'center',
    marginBottom: 12,
  },
  completeSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  profileSummary: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  summaryItem: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  completeMessage: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Navigation
  navigationContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Pathway Selection
  pathwayQuestion: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  pathwayValidationContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  pathwayValidationText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '500',
  },
  pathwayOptions: {
    gap: 20,
  },
  pathwayCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pathwayCardSelected: {
    borderColor: '#16A34A',
    borderWidth: 3,
    shadowColor: '#16A34A',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  pathwayGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  pathwayWellness: {
    backgroundColor: '#F0FDF4', // Light green
  },
  pathwayFitness: {
    backgroundColor: '#DCFCE7', // Medium green
  },
  pathwayPerformance: {
    backgroundColor: '#BBF7D0', // Deeper green
  },
  pathwayEmoji: {
    fontSize: 32,
  },
  pathwayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16A34A',
    flex: 1,
    textAlign: 'center',
    marginLeft: -32, // Offset emoji width for centering
  },
  pathwayCheckmark: {
    width: 32,
    height: 32,
    backgroundColor: '#16A34A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathwayCheckmarkText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pathwayContent: {
    padding: 20,
    paddingTop: 0,
  },
  pathwayDescription: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  pathwayTagline: {
    fontSize: 14,
    color: '#16A34A',
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
  },
  pathwayBadge: {
    backgroundColor: '#E5F3E5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'center',
    marginBottom: 12,
  },
  pathwayBadgeText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  pathwayExamples: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});