import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/context/ThemeContext';
import EmergencyEnhanced from './EmergencyEnhanced';

// EMERGENCY SINGLE-SCREEN THRIVE - AVOIDING NAVIGATION CRASHES
// ✅ Post-workout mood tracking with personalized responses  
// ✅ Single-screen workout system (avoiding tab navigation crashes)
// ✅ Full workout system with timers, XP, streaks, celebrations
// 🚨 PRIORITY: Get users from difficulty selection to working workout timers

export default function App() {
  console.log('🚨 EMERGENCY SINGLE-SCREEN: Using simplified approach to avoid navigation crashes!');
  
  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <EmergencyEnhanced />
    </ThemeProvider>
  );
}