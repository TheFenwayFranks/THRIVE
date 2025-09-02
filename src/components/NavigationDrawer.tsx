import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
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

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : -DRAWER_WIDTH,
      duration: 300, // Match existing page transitions
      useNativeDriver: false, // Set to false for web compatibility
    }).start();
  }, [visible]);

  // Pan responder for swipe to close
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return visible && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dx < 0) {
        translateX.setValue(Math.max(gestureState.dx, -DRAWER_WIDTH));
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx < -50 || gestureState.vx < -0.5) {
        onClose();
      } else {
        Animated.timing(translateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false, // Set to false for web compatibility
        }).start();
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
    <View style={styles.overlay}>
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
    </View>
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