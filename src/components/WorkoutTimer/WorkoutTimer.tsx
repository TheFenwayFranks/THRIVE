import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

interface WorkoutTimerProps {
  duration: number; // Duration in seconds
  onComplete: () => void;
  onPause?: () => void;
  onResume?: () => void;
  difficulty: 'gentle' | 'steady' | 'beast';
  exerciseName?: string;
  instructions?: string;
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  duration,
  onComplete,
  onPause,
  onResume,
  difficulty,
  exerciseName = 'Workout',
  instructions = 'Focus on your movement and breathing'
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animated values for progress and pulse effects
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Difficulty-based colors
  const colors = {
    gentle: { primary: '#10B981', secondary: '#D1FAE5', accent: '#059669' },
    steady: { primary: '#3B82F6', secondary: '#DBEAFE', accent: '#2563EB' },
    beast: { primary: '#EF4444', secondary: '#FEE2E2', accent: '#DC2626' }
  };

  const currentColors = colors[difficulty];

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          // Update progress animation
          const progressPercent = ((duration - newTime) / duration);
          Animated.timing(progressAnim, {
            toValue: progressPercent,
            duration: 100,
            useNativeDriver: false,
          }).start();
          
          // Pulse animation every 10 seconds or when close to finish
          if (newTime % 10 === 0 || newTime <= 10) {
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1.1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              })
            ]).start();
          }
          
          if (newTime <= 0) {
            handleComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, duration]);

  const handleStart = async () => {
    setIsRunning(true);
    setIsPaused(false);
    
    // Scale animation on start
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onResume?.();
  };

  const handlePause = async () => {
    setIsRunning(false);
    setIsPaused(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPause?.();
  };

  const handleComplete = async () => {
    setIsRunning(false);
    
    // Success haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Play completion sound (if available)
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: true, volume: 0.5 }
      );
      // Sound will auto-play
    } catch (error) {
      console.log('Could not play completion sound:', error);
    }
    
    onComplete();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((duration - timeLeft) / duration) * 100;
  };

  const getMotivationalMessage = (): string => {
    const percentage = getProgressPercentage();
    
    if (percentage < 25) return "You've got this! 💪";
    if (percentage < 50) return "Keep going, you're doing great! ✨";
    if (percentage < 75) return "More than halfway there! 🌟";
    if (percentage < 90) return "Almost done, push through! 🔥";
    return "Final stretch, you're amazing! 🎉";
  };

  return (
    <View style={styles.container}>
      {/* Exercise Name */}
      <Text style={[styles.exerciseName, { color: currentColors.primary }]}>
        {exerciseName}
      </Text>
      
      {/* Circular Progress Timer */}
      <Animated.View style={[
        styles.timerContainer,
        { 
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim }
          ] 
        }
      ]}>
        <View style={[styles.progressCircle, { borderColor: currentColors.secondary }]}>
          {/* Progress Fill */}
          <Animated.View 
            style={[
              styles.progressFill,
              { 
                backgroundColor: currentColors.primary,
                height: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]} 
          />
          
          {/* Timer Display */}
          <View style={styles.timeDisplay}>
            <Text style={[styles.timeText, { color: currentColors.accent }]}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={styles.totalTimeText}>
              of {formatTime(duration)}
            </Text>
            <Text style={[styles.progressText, { color: currentColors.primary }]}>
              {Math.round(getProgressPercentage())}% complete
            </Text>
          </View>
        </View>
      </Animated.View>
        
      {/* Control Button */}
      <TouchableOpacity
        style={[
          styles.controlButton, 
          { 
            backgroundColor: currentColors.primary,
            shadowColor: currentColors.accent,
          }
        ]}
        onPress={isRunning ? handlePause : handleStart}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={isRunning ? 'pause' : 'play'} 
          size={36} 
          color="white" 
        />
      </TouchableOpacity>
      
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
      
      {/* Motivational Message */}
      <Text style={[styles.motivationalMessage, { color: currentColors.primary }]}>
        {isPaused ? 'Paused - Take your time 🌸' : 
         isRunning ? getMotivationalMessage() : 
         'Ready to start your journey? 💙'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 8,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 110,
  },
  timeDisplay: {
    alignItems: 'center',
    zIndex: 1,
  },
  timeText: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  totalTimeText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    maxWidth: 300,
  },
  instructions: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
  motivationalMessage: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default WorkoutTimer;