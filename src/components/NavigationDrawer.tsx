import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const DRAWER_WIDTH = 280; // Thinner/compact width as specified
const SCREEN_WIDTH = Dimensions.get('window').width;

interface NavigationDrawerProps {
  visible: boolean;
  onClose: () => void;
  onProfile: () => void;
  onMorningFlow: () => void;
  onMood: () => void;
  onSettings: () => void;
  onDemo: () => void;
  onHelp: () => void;
}

export default function NavigationDrawer({
  visible,
  onClose,
  onProfile,
  onMorningFlow,
  onMood,
  onSettings,
  onDemo,
  onHelp,
}: NavigationDrawerProps) {
  const { theme } = useTheme();
  const translateX = React.useRef(new Animated.Value(visible ? 0 : -DRAWER_WIDTH)).current;
  const opacity = React.useRef(new Animated.Value(visible ? 1 : 0)).current;
  const isAnimating = React.useRef(false);

  React.useEffect(() => {
    // Only animate on initial open - closing is handled by gesture or manual close
    if (visible && !isAnimating.current) {
      console.log('📱 DRAWER: Opening with smooth animation');
      isAnimating.current = true;
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 450, // Smooth opening animation
          useNativeDriver: false,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Natural iOS bezier curve
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400, // Smooth fade in
          useNativeDriver: false,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      ]).start(() => {
        isAnimating.current = false;
      });
    }
  }, [visible]);

  // Enhanced pan responder with buttery smooth tracking
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => visible,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to leftward swipes when drawer is visible
      return visible && gestureState.dx < -5; // Only leftward swipes
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dx < 0) {
        // Smooth finger tracking with slight resistance for natural feel
        const resistance = 0.85; // Slight resistance makes it feel more natural
        const newValue = Math.max(gestureState.dx * resistance, -DRAWER_WIDTH);
        translateX.setValue(newValue);
        
        // Visual feedback: opacity changes based on whether it will close or spring back
        const progress = (DRAWER_WIDTH + newValue) / DRAWER_WIDTH;
        const willClose = Math.abs(gestureState.dx) > DRAWER_WIDTH * 0.4;
        
        // More dramatic opacity change when past close threshold
        let opacityValue;
        if (willClose) {
          opacityValue = Math.max(0.3, progress * 0.7); // Fade more when will close
        } else {
          opacityValue = Math.max(0.6, progress); // Stay more opaque when will spring back
        }
        
        opacity.setValue(opacityValue);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Smart threshold based on distance + velocity - can close from middle of screen
      const dragDistance = Math.abs(gestureState.dx);
      const dragVelocity = Math.abs(gestureState.vx);
      const dragPercentage = dragDistance / DRAWER_WIDTH; // How much of drawer width dragged
      
      // Close if dragged more than 40% of drawer width OR fast swipe
      const shouldClose = (gestureState.dx < -DRAWER_WIDTH * 0.4) || dragVelocity > 1.5;
      
      console.log('🎯 DRAWER RELEASE:', { 
        dx: Math.round(gestureState.dx), 
        vx: Math.round(dragVelocity * 100)/100, 
        threshold: Math.round(-DRAWER_WIDTH * 0.4),
        shouldClose 
      });
      
      if (shouldClose) {
        // Even closing should be smooth and slow
        console.log('🚪 DRAWER: Closing with smooth animation');
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -DRAWER_WIDTH,
            duration: 500, // Slower close animation
            useNativeDriver: false,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 450,
            useNativeDriver: false,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        ]).start(() => {
          // Call onClose after animation completes
          onClose();
        });
      } else {
        // Beautiful smooth spring-back animation for most cases
        console.log('🔄 DRAWER: Spring-back animation', { dx: gestureState.dx, vx: gestureState.vx });
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
            tension: 40, // Even lower tension for slower, more graceful spring
            friction: 9,  // Higher friction for smoother deceleration
            velocity: gestureState.vx, // Use gesture velocity for continuity
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 600, // Longer fade back to full opacity
            useNativeDriver: false,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Natural curve
          })
        ]).start();
      }
    },
  });

  const menuItems = [
    { title: 'Profile', onPress: onProfile },
    { title: 'Morning Flow', onPress: onMorningFlow },
    { title: 'Mood', onPress: onMood },
    { title: 'Settings', onPress: onSettings },
    { title: 'Profile Set Up', onPress: onDemo },
    { title: 'Help and Support', onPress: onHelp },
  ];

  // Always render when visible or during animations to prevent popping
  const currentTranslateX = translateX._value || (visible ? 0 : -DRAWER_WIDTH);
  if (!visible && currentTranslateX <= -DRAWER_WIDTH * 0.9) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      {/* Scrim/Background */}
      <TouchableOpacity
        style={styles.scrim}
        onPress={onClose}
        activeOpacity={1}
      />
      
      {/* Drawer Content */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
            backgroundColor: theme.colors.card,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Menu
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => {
                item.onPress();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = {
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  drawer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    paddingTop: 60, // Account for status bar
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    paddingVertical: 18, // 44pt minimum touch target
    paddingHorizontal: 24,
    borderBottomWidth: 0.5,
    minHeight: 44, // Apple accessibility standard
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
};