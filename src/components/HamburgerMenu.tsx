import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface HamburgerMenuProps {
  onMorningFlow: () => void;
  onMoodCheckin: () => void;
  onSettings: () => void;
  userStats?: {
    xp: number;
    streak: number;
    totalWorkouts: number;
  };
}

export default function HamburgerMenu({ 
  onMorningFlow, 
  onMoodCheckin, 
  onSettings,
  userStats 
}: HamburgerMenuProps) {
  const { theme, themeMode } = useTheme();
  const styles = createStyles(theme);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));

  const toggleMenu = () => {
    if (isMenuOpen) {
      // Close menu with smooth slide animation (professional ease-in-out)
      Animated.timing(slideAnim, {
        toValue: -320, // Slide completely off-screen
        duration: 300, // Smooth 300ms animation
        easing: Easing.inOut(Easing.ease), // Professional ease-in-out curve
        useNativeDriver: true,
      }).start(() => {
        setIsMenuOpen(false);
      });
    } else {
      // Open menu with smooth slide animation (professional ease-in-out)
      setIsMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0, // Slide to final position
        duration: 300, // Smooth 300ms animation
        easing: Easing.inOut(Easing.ease), // Professional ease-in-out curve
        useNativeDriver: true,
      }).start();
    }
  };

  const handleMenuOption = (action: () => void) => {
    action();
    toggleMenu();
  };

  const getUserLevel = () => {
    if (!userStats) return 1;
    return Math.floor(userStats.xp / 100) + 1;
  };

  const menuOptions = [
    {
      icon: '🌅',
      title: 'Morning Flow',
      description: 'Daily motivation & intention setting',
      action: () => handleMenuOption(onMorningFlow)
    },
    {
      icon: '😊',
      title: 'Mood Check-in',
      description: 'Track how you\'re feeling today',
      action: () => handleMenuOption(onMoodCheckin)
    },
    {
      icon: '⚙️',
      title: 'Settings',
      description: 'App preferences & theme options',
      action: () => handleMenuOption(onSettings)
    },
    {
      icon: '❓',
      title: 'Help & Support',
      description: 'Get help and learn about THRIVE',
      action: () => handleMenuOption(() => {
        // TODO: Implement help screen
        console.log('Help & Support clicked');
      })
    },
    {
      icon: '📱',
      title: 'About THRIVE',
      description: 'Movement for mental health',
      action: () => handleMenuOption(() => {
        // TODO: Implement about screen
        console.log('About THRIVE clicked');
      })
    }
  ];

  return (
    <>
      {/* Hamburger Menu Button */}
      <TouchableOpacity 
        style={styles.hamburgerButton} 
        onPress={toggleMenu}
        activeOpacity={0.7}
      >
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="none"
        onRequestClose={toggleMenu}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop */}
          <TouchableOpacity 
            style={styles.backdrop} 
            onPress={toggleMenu}
            activeOpacity={1}
          />
          
          {/* Menu Panel */}
          <Animated.View 
            style={[
              styles.menuPanel,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            {/* Menu Header */}
            <View style={styles.menuHeader}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>THRIVE</Text>
                <Text style={styles.logoSubtext}>Movement for Mental Health</Text>
              </View>
              
              {userStats && (
                <View style={styles.userInfo}>
                  <Text style={styles.userLevel}>Level {getUserLevel()}</Text>
                  <Text style={styles.userXP}>{userStats.xp} XP</Text>
                  <Text style={styles.userStreak}>{userStats.streak} day streak</Text>
                </View>
              )}
            </View>

            {/* Menu Options */}
            <View style={styles.menuOptions}>
              {menuOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuOption}
                  onPress={option.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIcon}>
                    <Text style={styles.optionIconText}>{option.icon}</Text>
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  <Text style={styles.optionArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Menu Footer */}
            <View style={styles.menuFooter}>
              <Text style={styles.footerText}>
                Theme: {themeMode === 'system' ? 'Auto' : themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
              </Text>
              <Text style={styles.versionText}>THRIVE v1.0</Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={toggleMenu}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const { width } = Dimensions.get('window');

const createStyles = (theme: any) => StyleSheet.create({
  // Hamburger Button
  hamburgerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: theme.colors.text,
    marginVertical: 2,
    borderRadius: 1,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  
  // Menu Panel
  menuPanel: {
    width: Math.min(320, width * 0.85),
    backgroundImage: 'linear-gradient(180deg, #fafafa 0%, #f0f9f0 100%)',
    backgroundColor: '#f0f9f0', // Fallback for React Native
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    boxShadow: `4px 0 16px rgba(76, 175, 80, 0.2)`,
    elevation: 12,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  
  // Menu Header
  menuHeader: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#16A34A', // THRIVE green for consistency
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  userInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  userLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userXP: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userStreak: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Menu Options
  menuOptions: {
    flex: 1,
    paddingTop: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 18,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  optionArrow: {
    fontSize: 20,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
  
  // Menu Footer
  menuFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  
  // Close Button
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // 🌱 THRIVE BRANDING STYLES FOR HAMBURGER MENU
  thriveMenuBackground: {
    backgroundImage: 'linear-gradient(180deg, #fafafa 0%, #f0f9f0 100%)',
    backgroundColor: '#f0f9f0',
  },
  
  thriveMenuItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    margin: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  thriveMenuItemActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderLeftColor: '#4CAF50',
  },
  
  thriveMenuText: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 16,
    fontWeight: '500',
    color: '#2E2E2E',
  },
  
  thriveMenuIcon: {
    fontSize: 20,
    color: '#4CAF50',
    marginRight: 12,
  },
});