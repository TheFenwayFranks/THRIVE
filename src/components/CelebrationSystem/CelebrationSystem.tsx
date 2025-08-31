import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface CelebrationSystemProps {
  isVisible: boolean;
  xpGained: number;
  streakCount: number;
  achievementUnlocked?: string;
  difficulty: 'gentle' | 'steady' | 'beast';
  onComplete: () => void;
}

interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
}

export const CelebrationSystem: React.FC<CelebrationSystemProps> = ({
  isVisible,
  xpGained,
  streakCount,
  achievementUnlocked,
  difficulty,
  onComplete
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const confettiPieces = useRef<ConfettiPiece[]>([]);

  // Difficulty-specific colors and messages
  const difficultyConfig = {
    gentle: {
      colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
      primaryColor: '#10B981',
      message: 'Gentle movement, powerful impact! 🌱',
      celebration: 'You showed up for yourself today!'
    },
    steady: {
      colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
      primaryColor: '#3B82F6',
      message: 'Steady progress, amazing results! 🌊',
      celebration: 'You built momentum and strength!'
    },
    beast: {
      colors: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
      primaryColor: '#EF4444',
      message: 'Beast mode activated! 🔥',
      celebration: 'You unleashed your inner power!'
    }
  };

  const config = difficultyConfig[difficulty];

  useEffect(() => {
    if (isVisible) {
      initializeConfetti();
      startCelebration();
    }
  }, [isVisible]);

  const initializeConfetti = () => {
    confettiPieces.current = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(-50),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(Math.random() * 0.5 + 0.5),
      color: config.colors[i % config.colors.length],
    }));
  };

  const startCelebration = async () => {
    // Intense haptic feedback sequence
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 400);
    
    // Main celebration animation sequence
    Animated.sequence([
      // 1. Fade in and scale up (entrance)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      
      // 2. Bounce animation for excitement
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
      
      // 3. Hold the celebration
      Animated.delay(2000),
      
      // 4. Fade out gracefully
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete();
      resetAnimations();
    });

    // Confetti animation
    animateConfetti();
  };

  const animateConfetti = () => {
    confettiPieces.current.forEach((piece, index) => {
      const delay = index * 100; // Stagger the confetti
      
      setTimeout(() => {
        Animated.parallel([
          // Fall animation
          Animated.timing(piece.y, {
            toValue: height + 100,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          // Horizontal drift
          Animated.timing(piece.x, {
            toValue: piece.x._value + (Math.random() - 0.5) * 200,
            duration: 3000,
            useNativeDriver: true,
          }),
          // Rotation
          Animated.loop(
            Animated.timing(piece.rotation, {
              toValue: 360,
              duration: 1000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            { iterations: -1 }
          ),
        ]).start();
      }, delay);
    });
  };

  const resetAnimations = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.5);
    bounceAnim.setValue(0);
    confettiPieces.current.forEach(piece => {
      piece.x.setValue(Math.random() * width);
      piece.y.setValue(-50);
      piece.rotation.setValue(0);
    });
  };

  if (!isVisible) return null;

  const bounceTransform = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  return (
    <View style={styles.overlay}>
      {/* Confetti */}
      {confettiPieces.current.map((piece) => (
        <Animated.View
          key={piece.id}
          style={[
            styles.confetti,
            {
              backgroundColor: piece.color,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                { 
                  rotate: piece.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }) 
                },
                { scale: piece.scale },
              ],
            },
          ]}
        />
      ))}

      {/* Main celebration content */}
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { scale: bounceTransform }
            ]
          }
        ]}
      >
        {/* Main celebration icon and message */}
        <View style={styles.celebration}>
          <Animated.View style={[
            styles.iconContainer,
            { 
              backgroundColor: config.primaryColor,
              transform: [{ scale: bounceTransform }]
            }
          ]}>
            <Ionicons name="trophy" size={50} color="white" />
          </Animated.View>
          
          <Text style={[styles.title, { color: config.primaryColor }]}>
            Workout Complete!
          </Text>
          <Text style={styles.subtitle}>
            {config.celebration}
          </Text>
          <Text style={[styles.message, { color: config.primaryColor }]}>
            {config.message}
          </Text>
        </View>

        {/* Rewards section */}
        <View style={styles.rewardsSection}>
          {/* XP Gain */}
          <Animated.View style={[
            styles.reward,
            { 
              backgroundColor: config.primaryColor + '20',
              borderColor: config.primaryColor,
              transform: [{ scale: bounceTransform }]
            }
          ]}>
            <Ionicons name="flash" size={24} color={config.primaryColor} />
            <Text style={[styles.rewardText, { color: config.primaryColor }]}>
              +{xpGained} XP Gained!
            </Text>
          </Animated.View>

          {/* Streak Counter */}
          {streakCount > 0 && (
            <Animated.View style={[
              styles.reward,
              { 
                backgroundColor: '#F59E0B20',
                borderColor: '#F59E0B',
                transform: [{ scale: bounceTransform }]
              }
            ]}>
              <Ionicons name="flame" size={24} color="#F59E0B" />
              <Text style={[styles.rewardText, { color: '#F59E0B' }]}>
                {streakCount} Day Streak! 🔥
              </Text>
            </Animated.View>
          )}

          {/* Achievement Unlocked */}
          {achievementUnlocked && (
            <Animated.View style={[
              styles.achievement,
              { transform: [{ scale: bounceTransform }] }
            ]}>
              <Ionicons name="medal" size={28} color="#F59E0B" />
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>Achievement Unlocked!</Text>
                <Text style={styles.achievementName}>{achievementUnlocked}</Text>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Motivational closing */}
        <View style={styles.closingMessage}>
          <Ionicons name="heart" size={20} color="#EF4444" />
          <Text style={styles.closingText}>
            You're not just surviving - you're THRIVING! 💙
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    maxWidth: width * 0.9,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  celebration: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  rewardsSection: {
    width: '100%',
    marginBottom: 20,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginVertical: 6,
    borderWidth: 2,
    justifyContent: 'center',
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  achievementText: {
    marginLeft: 12,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B45309',
    marginTop: 2,
  },
  closingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
  },
  closingText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
    textAlign: 'center',
  },
});

export default CelebrationSystem;