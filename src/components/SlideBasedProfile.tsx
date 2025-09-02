import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SlideBasedProfileProps {
  visible: boolean;
  onComplete: (profile: UserProfile) => void;
  onClose?: () => void;
}

interface UserProfile {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'athlete' | '';
  exerciseFrequency: 'never' | '1-2x_week' | '3-4x_week' | 'daily' | '';
  workoutPreferences: 'strength' | 'cardio' | 'flexibility' | 'mixed' | '';
  availableTime: '15min' | '30min' | '45min' | '60min_plus' | '';
  mentalHealthFocus: 'adhd' | 'anxiety' | 'depression' | 'general' | '';
  energyLevels: 'low' | 'variable' | 'high' | '';
  motivationTiming: 'morning' | 'afternoon' | 'evening' | '';
  ageRange: '18-25' | '26-35' | '36-45' | '46-55' | '55_plus' | '';
  equipmentAccess: 'none' | 'basic' | 'full_gym' | '';
}

const TOTAL_SLIDES = 10;

export default function SlideBasedProfile({ visible, onComplete, onClose }: SlideBasedProfileProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  console.log('🎯 SLIDE-BASED PROFILE:', { visible, currentSlide: 1 });
  
  const [currentSlide, setCurrentSlide] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    fitnessLevel: '',
    exerciseFrequency: '',
    workoutPreferences: '',
    availableTime: '',
    mentalHealthFocus: '',
    energyLevels: '',
    motivationTiming: '',
    ageRange: '',
    equipmentAccess: '',
  });

  if (!visible) {
    console.log('🎯 SLIDE-BASED PROFILE: Not visible, returning null');
    return null;
  }
  
  console.log('🎯 SLIDE-BASED PROFILE: Rendering slide', currentSlide);

  const handleNext = () => {
    if (currentSlide < TOTAL_SLIDES) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Validate and complete
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    // Basic validation
    const requiredFields = [
      'fitnessLevel', 'exerciseFrequency', 'workoutPreferences', 
      'availableTime', 'mentalHealthFocus'
    ];
    
    const missingFields = requiredFields.filter(field => !profile[field as keyof UserProfile]);
    
    if (missingFields.length > 0) {
      Alert.alert(
        'Complete Your Profile',
        'Please complete all required questions to personalize your THRIVE experience.'
      );
      return;
    }

    console.log('🎉 PROFILE COMPLETED:', profile);
    onComplete(profile);
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isSelected = (field: keyof UserProfile, value: string) => {
    return profile[field] === value;
  };

  const canProceed = () => {
    switch (currentSlide) {
      case 1: return profile.fitnessLevel !== '';
      case 2: return profile.exerciseFrequency !== '';
      case 3: return profile.workoutPreferences !== '';
      case 4: return profile.availableTime !== '';
      case 5: return profile.mentalHealthFocus !== '';
      case 6: return profile.energyLevels !== '';
      case 7: return profile.motivationTiming !== '';
      case 8: return profile.ageRange !== '';
      case 9: return profile.equipmentAccess !== '';
      case 10: return true; // Summary slide
      default: return false;
    }
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case 1:
        return (
          <View style={styles.slideContent}>
            <Text style={styles.questionTitle}>What's your fitness level?</Text>
            <Text style={styles.questionSubtitle}>Be honest - we'll personalize your workouts</Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, isSelected('fitnessLevel', 'beginner') && styles.selectedOption]}
                onPress={() => updateProfile('fitnessLevel', 'beginner')}
              >
                <Text style={styles.optionEmoji}>🌱</Text>
                <Text style={[styles.optionText, isSelected('fitnessLevel', 'beginner') && styles.selectedText]}>
                  Beginner
                </Text>
                <Text style={styles.optionDesc}>New to fitness or returning</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('fitnessLevel', 'intermediate') && styles.selectedOption]}
                onPress={() => updateProfile('fitnessLevel', 'intermediate')}
              >
                <Text style={styles.optionEmoji}>💪</Text>
                <Text style={[styles.optionText, isSelected('fitnessLevel', 'intermediate') && styles.selectedText]}>
                  Intermediate
                </Text>
                <Text style={styles.optionDesc}>Regular exercise routine</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('fitnessLevel', 'advanced') && styles.selectedOption]}
                onPress={() => updateProfile('fitnessLevel', 'advanced')}
              >
                <Text style={styles.optionEmoji}>🔥</Text>
                <Text style={[styles.optionText, isSelected('fitnessLevel', 'advanced') && styles.selectedText]}>
                  Advanced
                </Text>
                <Text style={styles.optionDesc}>Experienced and committed</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('fitnessLevel', 'athlete') && styles.selectedOption]}
                onPress={() => updateProfile('fitnessLevel', 'athlete')}
              >
                <Text style={styles.optionEmoji}>🏆</Text>
                <Text style={[styles.optionText, isSelected('fitnessLevel', 'athlete') && styles.selectedText]}>
                  Athlete
                </Text>
                <Text style={styles.optionDesc}>Competitive or elite level</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.slideContent}>
            <Text style={styles.questionTitle}>How often do you exercise?</Text>
            <Text style={styles.questionSubtitle}>Your current activity level</Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, isSelected('exerciseFrequency', 'never') && styles.selectedOption]}
                onPress={() => updateProfile('exerciseFrequency', 'never')}
              >
                <Text style={styles.optionEmoji}>😴</Text>
                <Text style={[styles.optionText, isSelected('exerciseFrequency', 'never') && styles.selectedText]}>
                  Never
                </Text>
                <Text style={styles.optionDesc}>Starting from scratch</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('exerciseFrequency', '1-2x_week') && styles.selectedOption]}
                onPress={() => updateProfile('exerciseFrequency', '1-2x_week')}
              >
                <Text style={styles.optionEmoji}>🚶</Text>
                <Text style={[styles.optionText, isSelected('exerciseFrequency', '1-2x_week') && styles.selectedText]}>
                  1-2x per week
                </Text>
                <Text style={styles.optionDesc}>Light activity</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('exerciseFrequency', '3-4x_week') && styles.selectedOption]}
                onPress={() => updateProfile('exerciseFrequency', '3-4x_week')}
              >
                <Text style={styles.optionEmoji}>🏃</Text>
                <Text style={[styles.optionText, isSelected('exerciseFrequency', '3-4x_week') && styles.selectedText]}>
                  3-4x per week
                </Text>
                <Text style={styles.optionDesc}>Regular routine</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('exerciseFrequency', 'daily') && styles.selectedOption]}
                onPress={() => updateProfile('exerciseFrequency', 'daily')}
              >
                <Text style={styles.optionEmoji}>⚡</Text>
                <Text style={[styles.optionText, isSelected('exerciseFrequency', 'daily') && styles.selectedText]}>
                  Daily
                </Text>
                <Text style={styles.optionDesc}>Very active lifestyle</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.slideContent}>
            <Text style={styles.questionTitle}>What type of workouts do you prefer?</Text>
            <Text style={styles.questionSubtitle}>We'll focus on what you enjoy</Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, isSelected('workoutPreferences', 'strength') && styles.selectedOption]}
                onPress={() => updateProfile('workoutPreferences', 'strength')}
              >
                <Text style={styles.optionEmoji}>💪</Text>
                <Text style={[styles.optionText, isSelected('workoutPreferences', 'strength') && styles.selectedText]}>
                  Strength Training
                </Text>
                <Text style={styles.optionDesc}>Weights, resistance, muscle building</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('workoutPreferences', 'cardio') && styles.selectedOption]}
                onPress={() => updateProfile('workoutPreferences', 'cardio')}
              >
                <Text style={styles.optionEmoji}>❤️</Text>
                <Text style={[styles.optionText, isSelected('workoutPreferences', 'cardio') && styles.selectedText]}>
                  Cardio
                </Text>
                <Text style={styles.optionDesc}>Running, cycling, heart health</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('workoutPreferences', 'flexibility') && styles.selectedOption]}
                onPress={() => updateProfile('workoutPreferences', 'flexibility')}
              >
                <Text style={styles.optionEmoji}>🧘</Text>
                <Text style={[styles.optionText, isSelected('workoutPreferences', 'flexibility') && styles.selectedText]}>
                  Flexibility
                </Text>
                <Text style={styles.optionDesc}>Yoga, stretching, mobility</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('workoutPreferences', 'mixed') && styles.selectedOption]}
                onPress={() => updateProfile('workoutPreferences', 'mixed')}
              >
                <Text style={styles.optionEmoji}>🎯</Text>
                <Text style={[styles.optionText, isSelected('workoutPreferences', 'mixed') && styles.selectedText]}>
                  Mixed Training
                </Text>
                <Text style={styles.optionDesc}>Variety keeps it interesting</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.slideContent}>
            <Text style={styles.questionTitle}>How much time can you commit?</Text>
            <Text style={styles.questionSubtitle}>Be realistic for better results</Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, isSelected('availableTime', '15min') && styles.selectedOption]}
                onPress={() => updateProfile('availableTime', '15min')}
              >
                <Text style={styles.optionEmoji}>⏰</Text>
                <Text style={[styles.optionText, isSelected('availableTime', '15min') && styles.selectedText]}>
                  15 minutes
                </Text>
                <Text style={styles.optionDesc}>Quick daily sessions</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('availableTime', '30min') && styles.selectedOption]}
                onPress={() => updateProfile('availableTime', '30min')}
              >
                <Text style={styles.optionEmoji}>🕐</Text>
                <Text style={[styles.optionText, isSelected('availableTime', '30min') && styles.selectedText]}>
                  30 minutes
                </Text>
                <Text style={styles.optionDesc}>Balanced workout time</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('availableTime', '45min') && styles.selectedOption]}
                onPress={() => updateProfile('availableTime', '45min')}
              >
                <Text style={styles.optionEmoji}>🕓</Text>
                <Text style={[styles.optionText, isSelected('availableTime', '45min') && styles.selectedText]}>
                  45 minutes
                </Text>
                <Text style={styles.optionDesc}>Comprehensive sessions</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('availableTime', '60min_plus') && styles.selectedOption]}
                onPress={() => updateProfile('availableTime', '60min_plus')}
              >
                <Text style={styles.optionEmoji}>⏳</Text>
                <Text style={[styles.optionText, isSelected('availableTime', '60min_plus') && styles.selectedText]}>
                  60+ minutes
                </Text>
                <Text style={styles.optionDesc}>Extended training time</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.slideContent}>
            <Text style={styles.questionTitle}>What's your mental health focus?</Text>
            <Text style={styles.questionSubtitle}>We'll tailor exercises to support you</Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, isSelected('mentalHealthFocus', 'adhd') && styles.selectedOption]}
                onPress={() => updateProfile('mentalHealthFocus', 'adhd')}
              >
                <Text style={styles.optionEmoji}>🧠</Text>
                <Text style={[styles.optionText, isSelected('mentalHealthFocus', 'adhd') && styles.selectedText]}>
                  ADHD Support
                </Text>
                <Text style={styles.optionDesc}>Focus, structure, dopamine boost</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('mentalHealthFocus', 'anxiety') && styles.selectedOption]}
                onPress={() => updateProfile('mentalHealthFocus', 'anxiety')}
              >
                <Text style={styles.optionEmoji}>🌊</Text>
                <Text style={[styles.optionText, isSelected('mentalHealthFocus', 'anxiety') && styles.selectedText]}>
                  Anxiety Relief
                </Text>
                <Text style={styles.optionDesc}>Calming, grounding exercises</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('mentalHealthFocus', 'depression') && styles.selectedOption]}
                onPress={() => updateProfile('mentalHealthFocus', 'depression')}
              >
                <Text style={styles.optionEmoji}>☀️</Text>
                <Text style={[styles.optionText, isSelected('mentalHealthFocus', 'depression') && styles.selectedText]}>
                  Depression Support
                </Text>
                <Text style={styles.optionDesc}>Mood-lifting, energizing</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('mentalHealthFocus', 'general') && styles.selectedOption]}
                onPress={() => updateProfile('mentalHealthFocus', 'general')}
              >
                <Text style={styles.optionEmoji}>💚</Text>
                <Text style={[styles.optionText, isSelected('mentalHealthFocus', 'general') && styles.selectedText]}>
                  General Wellness
                </Text>
                <Text style={styles.optionDesc}>Overall mental health</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.slideContent}>
            <Text style={styles.questionTitle}>How are your energy levels?</Text>
            <Text style={styles.questionSubtitle}>We'll match workouts to your energy</Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, isSelected('energyLevels', 'low') && styles.selectedOption]}
                onPress={() => updateProfile('energyLevels', 'low')}
              >
                <Text style={styles.optionEmoji}>🌙</Text>
                <Text style={[styles.optionText, isSelected('energyLevels', 'low') && styles.selectedText]}>
                  Generally Low
                </Text>
                <Text style={styles.optionDesc}>Gentle, restorative exercises</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('energyLevels', 'variable') && styles.selectedOption]}
                onPress={() => updateProfile('energyLevels', 'variable')}
              >
                <Text style={styles.optionEmoji}>🌤️</Text>
                <Text style={[styles.optionText, isSelected('energyLevels', 'variable') && styles.selectedText]}>
                  Variable
                </Text>
                <Text style={styles.optionDesc}>Adaptable workout options</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('energyLevels', 'high') && styles.selectedOption]}
                onPress={() => updateProfile('energyLevels', 'high')}
              >
                <Text style={styles.optionEmoji}>⚡</Text>
                <Text style={[styles.optionText, isSelected('energyLevels', 'high') && styles.selectedText]}>
                  Generally High
                </Text>
                <Text style={styles.optionDesc}>Intense, challenging workouts</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 7:
        return (
          <View style={styles.slideContent}>
            <Text style={styles.questionTitle}>When do you feel most motivated?</Text>
            <Text style={styles.questionSubtitle}>We'll send reminders at the right time</Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, isSelected('motivationTiming', 'morning') && styles.selectedOption]}
                onPress={() => updateProfile('motivationTiming', 'morning')}
              >
                <Text style={styles.optionEmoji}>🌅</Text>
                <Text style={[styles.optionText, isSelected('motivationTiming', 'morning') && styles.selectedText]}>
                  Morning Person
                </Text>
                <Text style={styles.optionDesc}>Start the day strong</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('motivationTiming', 'afternoon') && styles.selectedOption]}
                onPress={() => updateProfile('motivationTiming', 'afternoon')}
              >
                <Text style={styles.optionEmoji}>☀️</Text>
                <Text style={[styles.optionText, isSelected('motivationTiming', 'afternoon') && styles.selectedText]}>
                  Afternoon Energy
                </Text>
                <Text style={styles.optionDesc}>Midday power boost</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('motivationTiming', 'evening') && styles.selectedOption]}
                onPress={() => updateProfile('motivationTiming', 'evening')}
              >
                <Text style={styles.optionEmoji}>🌆</Text>
                <Text style={[styles.optionText, isSelected('motivationTiming', 'evening') && styles.selectedText]}>
                  Evening Warrior
                </Text>
                <Text style={styles.optionDesc}>End the day with movement</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 8:
        return (
          <View style={styles.slideContent}>
            <Text style={styles.questionTitle}>What's your age range?</Text>
            <Text style={styles.questionSubtitle}>Age-appropriate exercise recommendations</Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, isSelected('ageRange', '18-25') && styles.selectedOption]}
                onPress={() => updateProfile('ageRange', '18-25')}
              >
                <Text style={styles.optionEmoji}>🌟</Text>
                <Text style={[styles.optionText, isSelected('ageRange', '18-25') && styles.selectedText]}>
                  18-25 years
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('ageRange', '26-35') && styles.selectedOption]}
                onPress={() => updateProfile('ageRange', '26-35')}
              >
                <Text style={styles.optionEmoji}>💼</Text>
                <Text style={[styles.optionText, isSelected('ageRange', '26-35') && styles.selectedText]}>
                  26-35 years
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('ageRange', '36-45') && styles.selectedOption]}
                onPress={() => updateProfile('ageRange', '36-45')}
              >
                <Text style={styles.optionEmoji}>🏠</Text>
                <Text style={[styles.optionText, isSelected('ageRange', '36-45') && styles.selectedText]}>
                  36-45 years
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('ageRange', '46-55') && styles.selectedOption]}
                onPress={() => updateProfile('ageRange', '46-55')}
              >
                <Text style={styles.optionEmoji}>🌿</Text>
                <Text style={[styles.optionText, isSelected('ageRange', '46-55') && styles.selectedText]}>
                  46-55 years
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('ageRange', '55_plus') && styles.selectedOption]}
                onPress={() => updateProfile('ageRange', '55_plus')}
              >
                <Text style={styles.optionEmoji}>🌺</Text>
                <Text style={[styles.optionText, isSelected('ageRange', '55_plus') && styles.selectedText]}>
                  55+ years
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 9:
        return (
          <View style={styles.slideContent}>
            <Text style={styles.questionTitle}>What equipment do you have access to?</Text>
            <Text style={styles.questionSubtitle}>We'll suggest workouts you can actually do</Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[styles.optionButton, isSelected('equipmentAccess', 'none') && styles.selectedOption]}
                onPress={() => updateProfile('equipmentAccess', 'none')}
              >
                <Text style={styles.optionEmoji}>🏠</Text>
                <Text style={[styles.optionText, isSelected('equipmentAccess', 'none') && styles.selectedText]}>
                  No Equipment
                </Text>
                <Text style={styles.optionDesc}>Bodyweight exercises only</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('equipmentAccess', 'basic') && styles.selectedOption]}
                onPress={() => updateProfile('equipmentAccess', 'basic')}
              >
                <Text style={styles.optionEmoji}>🏋️</Text>
                <Text style={[styles.optionText, isSelected('equipmentAccess', 'basic') && styles.selectedText]}>
                  Basic Equipment
                </Text>
                <Text style={styles.optionDesc}>Dumbbells, resistance bands</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionButton, isSelected('equipmentAccess', 'full_gym') && styles.selectedOption]}
                onPress={() => updateProfile('equipmentAccess', 'full_gym')}
              >
                <Text style={styles.optionEmoji}>🏢</Text>
                <Text style={[styles.optionText, isSelected('equipmentAccess', 'full_gym') && styles.selectedText]}>
                  Full Gym Access
                </Text>
                <Text style={styles.optionDesc}>Complete workout facility</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 10:
        return (
          <View style={styles.slideContent}>
            <Text style={styles.questionTitle}>You're all set! 🎉</Text>
            <Text style={styles.questionSubtitle}>Your personalized THRIVE experience awaits</Text>
            
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Your Profile Summary:</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fitness Level:</Text>
                <Text style={styles.summaryValue}>{profile.fitnessLevel}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Exercise Frequency:</Text>
                <Text style={styles.summaryValue}>{profile.exerciseFrequency}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Preferred Workouts:</Text>
                <Text style={styles.summaryValue}>{profile.workoutPreferences}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Available Time:</Text>
                <Text style={styles.summaryValue}>{profile.availableTime}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mental Health Focus:</Text>
                <Text style={styles.summaryValue}>{profile.mentalHealthFocus}</Text>
              </View>
            </View>

            <Text style={styles.completeMessage}>
              Ready to start your personalized wellness journey? Let's THRIVE together! 💚
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator - Visual only, no text counter */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${(currentSlide / TOTAL_SLIDES) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Slide Content */}
      <View style={styles.slideContainer}>
        {renderSlide()}
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        {currentSlide > 1 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextButton, 
            !canProceed() && styles.disabledButton,
            currentSlide === 1 && styles.nextButtonFull
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={[styles.nextButtonText, !canProceed() && styles.disabledText]}>
            {currentSlide === TOTAL_SLIDES ? 'Start THRIVING!' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: theme.colors.background || '#F8F9FA',
  },
  
  // Progress
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border || '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.textSecondary || '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Slide Container - Better mobile layout
  slideContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 140, // More space for navigation buttons
  },
  
  slideContent: {
    paddingTop: 20, // Move content up
    paddingBottom: 20,
    alignItems: 'center',
  },
  
  // Question - Smaller spacing for mobile
  questionTitle: {
    fontSize: 24, // Slightly smaller
    fontWeight: 'bold',
    color: theme.colors.text || '#1F2937',
    textAlign: 'center',
    marginBottom: 8, // Reduced spacing
  },
  questionSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary || '#6B7280',
    textAlign: 'center',
    marginBottom: 20, // Reduced from 40
    lineHeight: 22,
  },
  
  // Options - Compact mobile layout
  optionsContainer: {
    width: '100%',
    gap: 8, // Reduced gap between options
    marginTop: 10, // Reduced top margin
    paddingBottom: 10,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12, // Slightly smaller radius
    padding: 16, // More compact padding
    alignItems: 'center',
    minHeight: 60, // Smaller height for mobile
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05, // Lighter shadow
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0FDF4',
    borderWidth: 3,
  },
  optionEmoji: {
    fontSize: 20, // Slightly smaller
    marginBottom: 4, // Reduced spacing
  },
  optionText: {
    fontSize: 16, // Smaller text
    fontWeight: '600',
    color: theme.colors.text || '#1F2937',
    marginBottom: 2, // Reduced spacing
  },
  selectedText: {
    color: '#4CAF50',
  },
  optionDesc: {
    fontSize: 12, // Smaller description text
    color: theme.colors.textSecondary || '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Summary
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text || '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary || '#6B7280',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text || '#1F2937',
    flex: 1,
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  completeMessage: {
    fontSize: 16,
    color: theme.colors.text || '#1F2937',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  
  // Navigation - Fixed positioning
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    gap: 12,
    backgroundColor: theme.colors.background || '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
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
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  disabledText: {
    color: '#9CA3AF',
  },
});