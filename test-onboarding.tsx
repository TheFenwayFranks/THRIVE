import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import OnboardingFlow from './src/components/OnboardingFlow';

// Test component to verify onboarding works
export default function TestOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleComplete = (profile: any) => {
    console.log('Onboarding completed:', profile);
    setShowOnboarding(false);
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Onboarding Test</Text>
      <Button 
        title="Show Onboarding" 
        onPress={() => setShowOnboarding(true)}
      />
      
      <OnboardingFlow
        visible={showOnboarding}
        onComplete={handleComplete}
      />
    </View>
  );
}