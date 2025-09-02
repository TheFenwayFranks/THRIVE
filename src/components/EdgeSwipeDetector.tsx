import React from 'react';
import {
  View,
  PanResponder,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const EDGE_DETECTION_WIDTH = 80; // Much wider detection zone for smooth mobile gestures

interface EdgeSwipeDetectorProps {
  onSwipeFromEdge: () => void;
  children: React.ReactNode;
}

export default function EdgeSwipeDetector({ onSwipeFromEdge, children }: EdgeSwipeDetectorProps) {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { pageX, locationX } = evt.nativeEvent;
      const startX = pageX || locationX || 0;
      // Very generous detection zone - much easier to trigger
      return startX <= EDGE_DETECTION_WIDTH;
    },
    
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { pageX, locationX } = evt.nativeEvent;
      const { dx, dy } = gestureState;
      const startX = pageX || locationX || 0;
      
      // Super smooth detection - minimal threshold
      const isFromEdge = startX <= EDGE_DETECTION_WIDTH;
      const isHorizontalSwipe = dx > 5 && Math.abs(dx) > Math.abs(dy) * 0.5; // Much more lenient
      
      return isFromEdge && isHorizontalSwipe;
    },
    
    onPanResponderGrant: (evt, gestureState) => {
      // Trigger immediately on gesture start from edge
      onSwipeFromEdge();
    },
    
    onPanResponderMove: (evt, gestureState) => {
      // Additional trigger during movement for smoother experience
      const { pageX, locationX } = evt.nativeEvent;
      const { dx } = gestureState;
      const startX = pageX || locationX || 0;
      
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