import React from 'react';
import {
  View,
  PanResponder,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const EDGE_DETECTION_WIDTH = 50; // Wider detection zone for mobile (increased from 30px)

interface EdgeSwipeDetectorProps {
  onSwipeFromEdge: () => void;
  children: React.ReactNode;
}

export default function EdgeSwipeDetector({ onSwipeFromEdge, children }: EdgeSwipeDetectorProps) {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { pageX, locationX } = evt.nativeEvent;
      // Use both pageX and locationX for better mobile compatibility
      const startX = pageX || locationX || 0;
      console.log('🔍 EDGE SWIPE: Touch start at x:', startX, 'detection zone:', EDGE_DETECTION_WIDTH);
      return startX <= EDGE_DETECTION_WIDTH;
    },
    
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { pageX, locationX } = evt.nativeEvent;
      const { dx, dy } = gestureState;
      const startX = pageX || locationX || 0;
      
      // More lenient detection for mobile
      const isFromEdge = startX <= EDGE_DETECTION_WIDTH;
      const isHorizontalSwipe = dx > 10 && Math.abs(dx) > Math.abs(dy);
      
      console.log('🔍 EDGE SWIPE: Move check', { startX, dx, dy, isFromEdge, isHorizontalSwipe });
      
      return isFromEdge && isHorizontalSwipe;
    },
    
    onPanResponderGrant: (evt, gestureState) => {
      const { pageX, locationX } = evt.nativeEvent;
      const startX = pageX || locationX || 0;
      console.log('🎯 EDGE SWIPE: Granted at x:', startX);
      
      if (startX <= EDGE_DETECTION_WIDTH) {
        console.log('✅ EDGE SWIPE: Triggering drawer open');
        onSwipeFromEdge();
      }
    },
    
    onPanResponderRelease: (evt, gestureState) => {
      // Also trigger on release if it was a valid swipe
      const { pageX, locationX } = evt.nativeEvent;
      const { dx } = gestureState;
      const startX = (pageX || locationX || 0) - dx;
      
      if (startX <= EDGE_DETECTION_WIDTH && dx > 30) {
        console.log('✅ EDGE SWIPE: Release trigger - drawer open');
        onSwipeFromEdge();
      }
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        {children}
      </View>
      
      {/* DEBUG: Visual indicator for edge swipe area (remove in production) */}
      {__DEV__ && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: EDGE_DETECTION_WIDTH,
            backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green overlay
            borderRightWidth: 2,
            borderRightColor: 'rgba(76, 175, 80, 0.3)',
            pointerEvents: 'none', // Don't block touches
          }}
        />
      )}
    </View>
  );
}