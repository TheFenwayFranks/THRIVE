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
  onMorningFlow: () => void;
  onMood: () => void;
  onSettings: () => void;
  onDemo: () => void;
  onHelp: () => void;
}

export default function NavigationDrawer({
  visible,
  onClose,
  onMorningFlow,
  onMood,
  onSettings,
  onDemo,
  onHelp,
}: NavigationDrawerProps) {
  const { theme } = useTheme();
  const translateX = React.useRef(new Animated.Value(visible ? 0 : -DRAWER_WIDTH)).current;
  const opacity = React.useRef(new Animated.Value(visible ? 1 : 0)).current;

  React.useEffect(() => {
    // Use spring animation for ultra-smooth, native-feeling motion like page transitions
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: visible ? 0 : -DRAWER_WIDTH,
        useNativeDriver: false, // Required for web compatibility
        tension: 100, // Higher tension = snappier
        friction: 8, // Lower friction = less bounce, smoother
        speed: 20, // Faster animation speed
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic), // Smooth fade
      })
    ]).start();
  }, [visible]);

  // Enhanced pan responder with better native-like feel
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => visible,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return visible && Math.abs(gestureState.dx) > 5; // More sensitive
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dx < 0) {
        // Follow finger precisely for natural feel
        const newValue = Math.max(gestureState.dx, -DRAWER_WIDTH);
        translateX.setValue(newValue);
        // Also update opacity based on position for better visual feedback
        const opacityValue = Math.max(0, (DRAWER_WIDTH + newValue) / DRAWER_WIDTH);
        opacity.setValue(opacityValue);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      const shouldClose = gestureState.dx < -80 || gestureState.vx < -1;
      
      if (shouldClose) {
        onClose();
      } else {
        // Spring back to open position with natural bounce
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          })
        ]).start();
      }
    },
  });

  const menuItems = [
    { title: 'Morning Flow', onPress: onMorningFlow },
    { title: 'Mood', onPress: onMood },
    { title: 'Settings', onPress: onSettings },
    { title: 'Demo Tutorial', onPress: onDemo },
    { title: 'Help and Support', onPress: onHelp },
  ];

  if (!visible) return null;

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