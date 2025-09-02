import React from 'react';
import {
  View,
  PanResponder,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const EDGE_DETECTION_WIDTH = SCREEN_WIDTH * 0.3; // Left third of screen for natural gesture

interface EdgeSwipeDetectorProps {
  onSwipeFromEdge: () => void;
  children: React.ReactNode;
}

export default function EdgeSwipeDetector({ onSwipeFromEdge, children }: EdgeSwipeDetectorProps) {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { pageX, locationX } = evt.nativeEvent;
      const startX = pageX || locationX || 0;
      // Natural gesture zone - left third of screen
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
      

    </View>
  );
}