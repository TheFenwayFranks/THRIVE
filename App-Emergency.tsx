import React from 'react';
import { StatusBar } from 'expo-status-bar';
import EmergencyBypass from './EmergencyBypass';

// EMERGENCY VERSION - COMPLETELY BYPASS ALL NAVIGATION
// This replaces the main App.tsx to show SOMETHING that works
// NO React Navigation, NO complex components, NO morning flow
// JUST basic THRIVE functionality in a single screen

export default function App() {
  console.log('🚨 EMERGENCY MODE: Loading bypass screen with basic THRIVE functionality');
  
  return (
    <>
      <StatusBar style="auto" />
      <EmergencyBypass />
    </>
  );
}