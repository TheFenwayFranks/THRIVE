import React from 'react';
import {
  View,
  PanResponder,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const EDGE_DETECTION_WIDTH = 30; // Detection zone width from left edge

interface EdgeSwipeDetectorProps {
  onSwipeFromEdge: () => void;
  children: React.ReactNode;
}

export default function EdgeSwipeDetector({ onSwipeFromEdge, children }: EdgeSwipeDetectorProps) {
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { pageX } = evt.nativeEvent;
      const { dx, dy } = gestureState;
      
      // Only respond to gestures that start from the left edge
      return (
        pageX <= EDGE_DETECTION_WIDTH && 
        dx > 20 && // Minimum horizontal movement
        Math.abs(dy) < Math.abs(dx) * 2 // More horizontal than vertical
      );
    },
    onPanResponderGrant: (evt, gestureState) => {
      const { pageX } = evt.nativeEvent;
      if (pageX <= EDGE_DETECTION_WIDTH && gestureState.dx > 20) {
        onSwipeFromEdge();
      }
    },
  });

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}