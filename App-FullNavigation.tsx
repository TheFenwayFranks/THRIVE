import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';

// Import screens
import MoveTab from './src/screens/MoveTab/MoveTabComplete';
import CommunityTab from './src/screens/CommunityTab/CommunityTabComplete';
import ProgressTab from './src/screens/ProgressTab/ProgressTabComplete';
import MorningFlow from './src/screens/MorningFlow/MorningFlowComplete';
import { StorageService } from './src/services/StorageService';

const Tab = createBottomTabNavigator();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [showMorningFlow, setShowMorningFlow] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'gentle' | 'steady' | 'beast' | undefined>(undefined);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 FULL THRIVE: Initializing complete Phase 1 experience...');
      
      // Initialize storage service
      await StorageService.initialize();
      
      // Check if morning flow should be shown
      const shouldShowMorningFlow = await checkMorningFlowNeeded();
      setShowMorningFlow(shouldShowMorningFlow);
      
      console.log('✅ THRIVE Mobile: Complete Phase 1 app initialized successfully!');
      
      // Mark app as ready
      setIsAppReady(true);
      
      // Hide splash screen
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to start THRIVE. Please restart the app.',
        [{ text: 'OK' }]
      );
      await SplashScreen.hideAsync();
    }
  };

  const checkMorningFlowNeeded = async (): Promise<boolean> => {
    try {
      const lastMorningFlow = await StorageService.getMorningFlowDate();
      const today = new Date().toDateString();
      
      // Show morning flow if it hasn't been shown today
      return lastMorningFlow !== today;
    } catch (error) {
      console.error('Morning flow check error:', error);
      return false; // Default to not showing if there's an error
    }
  };

  const handleMorningFlowComplete = async (difficulty?: 'gentle' | 'steady' | 'beast') => {
    setShowMorningFlow(false);
    if (difficulty) {
      setSelectedDifficulty(difficulty);
    }
    
    // Mark morning flow as completed for today
    try {
      const today = new Date().toDateString();
      await StorageService.setMorningFlowDate(today);
    } catch (error) {
      console.error('Failed to save morning flow date:', error);
    }
  };

  // Show loading screen while app initializes
  if (!isAppReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#16A34A', marginBottom: 8 }}>
          THRIVE
        </Text>
        <Text style={{ fontSize: 16, color: '#6B7280' }}>
          Loading your wellness journey... 🌱
        </Text>
      </View>
    );
  }

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
            tabBarActiveTintColor: '#16A34A', // THRIVE Green
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
            initialParams={{ preselectedDifficulty: selectedDifficulty }}
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
      
      {/* Morning Flow Overlay */}
      <MorningFlow 
        isVisible={showMorningFlow}
        onComplete={handleMorningFlowComplete}
      />
    </View>
  );
}