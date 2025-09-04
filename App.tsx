import React from 'react';
import { StatusBar } from 'expo-status-bar';
import ThriveSwipeAppWeb from './ThriveSwipeAppWeb';

// 🌱 FRESH START: Clean 3-page swipe app with smooth navigation (Web-Compatible)
// ✅ Dashboard, Social, Profile pages (left to right)
// ✅ THRIVE branding with individual page names
// ✅ Web-compatible swipe navigation using PanResponder
// ✅ Clean foundation ready for content

export default function App() {
  console.log('🌱 FRESH THRIVE: Web-compatible 3-page swipe app with smooth navigation!');
  
  return (
    <>
      <StatusBar style="auto" />
      <ThriveSwipeAppWeb />
    </>
  );
}