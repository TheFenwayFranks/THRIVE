import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';

import MoveTab from './src/screens/MoveTab/MoveTabMinimal';
import CommunityTab from './src/screens/CommunityTab/CommunityTab';
import ProgressTab from './src/screens/ProgressTab/ProgressTab';
import MorningFlow from './src/screens/MorningFlow/MorningFlowOverlay';
import { StorageService } from './src/services/StorageService';

const Tab = createBottomTabNavigator();

// Configure notifications for future use
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [showMorningFlow, setShowMorningFlow] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'gentle' | 'steady' | 'beast' | undefined>(undefined);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize storage service
      await StorageService.initialize();
      
      // Check if morning flow should be shown
      const shouldShowMorningFlow = await checkMorningFlowNeeded();
      setShowMorningFlow(shouldShowMorningFlow);
      
      console.log('🚀 THRIVE Mobile: App initialized successfully!');
      
      // Hide splash screen after initialization
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      await SplashScreen.hideAsync();
    }
  };

  const checkMorningFlowNeeded = async (): Promise<boolean> => {
    try {
      // FORCE MORNING FLOW FOR DEBUGGING
      console.log('🌱 FORCING MINIMAL MORNING FLOW FOR DEBUGGING');
      return true; // Always show morning flow for debugging
      
      // Original logic (commented out for debugging):
      // const settings = await StorageService.getSettings();
      // const today = new Date().toDateString();
      // return settings.lastMorningFlow !== today;
    } catch (error) {
      console.error('Morning flow check error:', error);
      return false; // Default to not showing morning flow if there's an error
    }
  };

  const handleMorningFlowComplete = (difficulty?: 'gentle' | 'steady' | 'beast') => {
    setShowMorningFlow(false);
    if (difficulty) {
      setSelectedDifficulty(difficulty);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Move') {
              iconName = focused ? 'fitness' : 'fitness-outline';
            } else if (route.name === 'Community') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Progress') {
              iconName = focused ? 'analytics' : 'analytics-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#16A34A',
          tabBarInactiveTintColor: '#6B7280',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen 
          name="Move" 
          component={MoveTab}
          options={{
            tabBarLabel: 'Move',
          }}
        />
        <Tab.Screen 
          name="Community" 
          component={CommunityTab}
          options={{
            tabBarLabel: 'Community',
          }}
        />
        <Tab.Screen 
          name="Progress" 
          component={ProgressTab}
          options={{
            tabBarLabel: 'Progress',
          }}
        />
      </Tab.Navigator>
      </NavigationContainer>
      
      <MorningFlow 
        isVisible={showMorningFlow}
        onComplete={handleMorningFlowComplete}
      />
    </View>
  );
}