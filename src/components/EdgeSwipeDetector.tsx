import React from 'react';
import {
  View,
  PanResponder,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const EDGE_DETECTION_WIDTH = 120; // Very large detection zone - almost 1/3 of screen width

interface EdgeSwipeDetectorProps {
  onSwipeFromEdge: () => void;
  children: React.ReactNode;
}

export default function EdgeSwipeDetector({ onSwipeFromEdge, children }: EdgeSwipeDetectorProps) {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { pageX, locationX } = evt.nativeEvent;
      const startX = pageX || locationX || 0;
      // Extremely generous detection - almost 1/3 of screen width
      return startX <= EDGE_DETECTION_WIDTH;
    },
    
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { pageX, locationX } = evt.nativeEvent;
      const { dx, dy } = gestureState;
      const startX = pageX || locationX || 0;
      
      // Ultra-smooth detection - very minimal requirements
      const isFromEdge = startX <= EDGE_DETECTION_WIDTH;
      const isHorizontalSwipe = dx > 3; // Super minimal horizontal movement required
      
      return isFromEdge && isHorizontalSwipe;
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
      
      // Trigger with minimal movement from anywhere in the large detection zone
      if (startX <= EDGE_DETECTION_WIDTH && dx > 8) {
        onSwipeFromEdge();
      }
    },
    
    onPanResponderRelease: (evt, gestureState) => {
      // Final trigger on release for maximum responsiveness
      const { pageX, locationX } = evt.nativeEvent;
      const { dx } = gestureState;
      const startX = (pageX || locationX || 0) - dx;
      
      if (startX <= EDGE_DETECTION_WIDTH && dx > 10) {
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