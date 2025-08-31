import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  Modal
} from 'react-native';

interface MorningFlowMinimalProps {
  isVisible: boolean;
  onComplete: (selectedDifficulty?: 'gentle' | 'steady' | 'beast') => void;
}

// Ultra-Minimal Morning Flow - Maximum Stability
export default function MorningFlowMinimal({ isVisible, onComplete }: MorningFlowMinimalProps) {
  
  const handleStart = () => {
    console.log('🌱 MINIMAL: Start button clicked');
    // Immediate completion without any async operations
    onComplete();
  };

  const handleSkip = () => {
    console.log('🚀 MINIMAL: Skip button clicked');
    // Immediate completion
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="none"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          
          {/* Simple Header */}
          <Text style={styles.title}>🌱 THRIVE</Text>
          <Text style={styles.subtitle}>Ready to start your day?</Text>
          
          {/* Simple Affirmation */}
          <View style={styles.card}>
            <Text style={styles.affirmation}>
              Your brain is powerful and unique 🧠
            </Text>
            <Text style={styles.encouragement}>
              ADHD minds think differently, and that's your superpower
            </Text>
          </View>

          {/* Simple Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStart}
            >
              <Text style={styles.startButtonText}>
                Let's THRIVE! 🌱
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>
                Skip
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#374151',
    marginBottom: 40,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
    maxWidth: 400,
  },
  affirmation: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  encouragement: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  startButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
});