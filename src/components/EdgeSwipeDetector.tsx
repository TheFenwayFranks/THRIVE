import React from 'react';
import {
  View,
  PanResponder,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const EDGE_DETECTION_WIDTH = SCREEN_WIDTH * 0.5; // Entire left half of screen for natural gesture

interface EdgeSwipeDetectorProps {
  onSwipeFromEdge: () => void;
  children: React.ReactNode;
}

export default function EdgeSwipeDetector({ onSwipeFromEdge, children }: EdgeSwipeDetectorProps) {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { pageX, locationX } = evt.nativeEvent;
      const startX = pageX || locationX || 0;
      // Natural gesture zone - entire left half of screen
      return startX <= EDGE_DETECTION_WIDTH;
    },
    
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { pageX, locationX } = evt.nativeEvent;
      const { dx, dy } = gestureState;
      const startX = pageX || locationX || 0;
      
      // Natural gesture detection - from anywhere in left half
      const isFromLeftHalf = startX <= EDGE_DETECTION_WIDTH;
      const isRightwardSwipe = dx > 8; // Rightward movement required
      const isMoreHorizontalThanVertical = Math.abs(dx) > Math.abs(dy); // Prevent vertical scroll conflicts
      
      return isFromLeftHalf && isRightwardSwipe && isMoreHorizontalThanVertical;
    },
    
    onPanResponderGrant: (evt, gestureState) => {
      // Immediate trigger - no delay
      const { pageX, locationX } = evt.nativeEvent;
      const startX = pageX || locationX || 0;
      
      if (startX <= EDGE_DETECTION_WIDTH) {
        onSwipeFromEdge();
      }
    },
    
    onPanResponderMove: (evt, gestureState) => {
      // Multiple trigger points for ultra-smooth experience
      const { pageX, locationX } = evt.nativeEvent;
      const { dx } = gestureState;
      const startX = pageX || locationX || 0;
      
      // Trigger with minimal movement from anywhere in left half
      if (startX <= EDGE_DETECTION_WIDTH && dx > 12) {
        onSwipeFromEdge();
      }
    },
    
    onPanResponderRelease: (evt, gestureState) => {
      // Final trigger on release for maximum responsiveness
      const { pageX, locationX } = evt.nativeEvent;
      const { dx } = gestureState;
      const startX = (pageX || locationX || 0) - dx;
      
      if (startX <= EDGE_DETECTION_WIDTH && dx > 15) {
        onSwipeFromEdge();
      }
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        {children}
      </View>
      
      {/* Optional: Visual debug overlay to show gesture zone (remove in production) */}
      {__DEV__ && (
        <View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: EDGE_DETECTION_WIDTH,
            height: '100%',
            backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green overlay
            pointerEvents: 'none',
            borderRightWidth: 1,
            borderRightColor: 'rgba(76, 175, 80, 0.3)',
          }}
        />
      )}
    </View>
  );
}