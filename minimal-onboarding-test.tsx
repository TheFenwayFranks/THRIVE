import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface MinimalOnboardingProps {
  visible: boolean;
  onComplete: () => void;
}

export default function MinimalOnboarding({ visible, onComplete }: MinimalOnboardingProps) {
  const [step, setStep] = useState(0);
  
  console.log('🚀 MINIMAL ONBOARDING:', { visible, step });
  
  if (!visible) return null;
  
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>🌟 Welcome to THRIVE!</Text>
        <Text style={styles.subtitle}>Step {step + 1} of 3</Text>
        
        {step === 0 && (
          <View>
            <Text style={styles.content}>Mental Health Fitness App</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => setStep(1)}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {step === 1 && (
          <View>
            <Text style={styles.content}>Choose your goals (NEW: Multiple selection!)</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => setStep(2)}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {step === 2 && (
          <View>
            <Text style={styles.content}>Choose your pathway (NEW!)</Text>
            <Text style={styles.pathwayOption}>🌱 Wellness Journey</Text>
            <Text style={styles.pathwayOption}>💪 Fitness Journey</Text>
            <Text style={styles.pathwayOption}>🏃‍♂️ Performance Journey</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={onComplete}
            >
              <Text style={styles.buttonText}>Complete Setup</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#f0f9f0',
    padding: 40,
    borderRadius: 20,
    maxWidth: 400,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16A34A',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  content: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  pathwayOption: {
    fontSize: 16,
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#16A34A',
    padding: 15,
    borderRadius: 10,
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});