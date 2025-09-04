import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { useTheme } from './src/context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

export default function CleanThriveApp() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Navigation state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  // Sample data
  const [userStats] = useState({
    streak: 7,
    totalSessions: 42,
    xp: 1250,
  });

  // Slide content components
  const HomeSlide = () => (
    <ScrollView style={styles.slideContent} contentContainerStyle={styles.slideContainer}>
      <Text style={styles.slideTitle}>🌱 Welcome to THRIVE</Text>
      
      <View style={styles.welcomeCard}>
        <Text style={styles.cardTitle}>Your Wellness Journey</Text>
        <Text style={styles.cardSubtitle}>Every step counts toward better mental health</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Today's Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>🏃‍♀️ Start Today's Activity</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>💚 Track Your Mood</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const CommunitySlide = () => (
    <ScrollView style={styles.slideContent} contentContainerStyle={styles.slideContainer}>
      <Text style={styles.slideTitle}>👥 Community</Text>
      
      <View style={styles.communityCard}>
        <Text style={styles.cardTitle}>Connect & Support</Text>
        <Text style={styles.cardText}>
          Join a supportive community of people on their wellness journey just like you.
        </Text>
      </View>

      <View style={styles.communityCard}>
        <Text style={styles.cardTitle}>🌟 Today's Inspiration</Text>
        <Text style={styles.inspirationText}>
          "Progress, not perfection. Every small step forward is a victory worth celebrating."
        </Text>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>💬 Join Discussion</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>📱 Share Progress</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const StatsSlide = () => (
    <ScrollView style={styles.slideContent} contentContainerStyle={styles.slideContainer}>
      <Text style={styles.slideTitle}>📊 Your Progress</Text>
      
      <View style={styles.statsDetailCard}>
        <Text style={styles.cardTitle}>Weekly Overview</Text>
        <View style={styles.weeklyGrid}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <View key={day} style={[styles.dayCircle, index < 5 && styles.completedDay]}>
              <Text style={styles.dayText}>{day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.achievementCard}>
        <Text style={styles.cardTitle}>🏆 Achievements</Text>
        <Text style={styles.achievementText}>✨ 7-Day Streak Champion</Text>
        <Text style={styles.achievementText}>💪 Consistent Performer</Text>
        <Text style={styles.achievementText}>🎯 Goal Achiever</Text>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>📈 View Detailed Stats</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Slide-out menu
  const SlideOutMenu = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showMenu}
      onRequestClose={() => setShowMenu(false)}
    >
      <View style={styles.menuOverlay}>
        <TouchableOpacity 
          style={styles.menuBackground}
          onPress={() => setShowMenu(false)}
        />
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>THRIVE Menu</Text>
            <TouchableOpacity onPress={() => setShowMenu(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>🏠 Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>👤 Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>⚙️ Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>💚 Mood Tracker</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>🌅 Morning Flow</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>📚 Resources</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>❓ Help & Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const slides = [<HomeSlide />, <CommunitySlide />, <StatsSlide />];
  const slideNames = ['Home', 'Community', 'Stats'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with menu button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Text style={styles.menuButton}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>THRIVE</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Current slide content */}
      {slides[currentSlide]}

      {/* Bottom navigation dots */}
      <View style={styles.bottomNav}>
        {slideNames.map((name, index) => (
          <TouchableOpacity
            key={name}
            style={[styles.navDot, currentSlide === index && styles.activeDot]}
            onPress={() => setCurrentSlide(index)}
          >
            <Text style={[styles.navText, currentSlide === index && styles.activeNavText]}>
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Slide-out menu */}
      <SlideOutMenu />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.colors.primary || '#4CAF50',
  },
  menuButton: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 24,
  },
  slideContent: {
    flex: 1,
  },
  slideContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: theme.colors.text || '#2e2e2e',
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border || '#e0e0e0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.text || '#2e2e2e',
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary || '#666',
    textAlign: 'center',
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textSecondary || '#666',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border || '#e0e0e0',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary || '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary || '#666',
  },
  actionButton: {
    backgroundColor: theme.colors.primary || '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  communityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border || '#e0e0e0',
  },
  inspirationText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: theme.colors.primary || '#4CAF50',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsDetailCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border || '#e0e0e0',
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedDay: {
    backgroundColor: theme.colors.primary || '#4CAF50',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border || '#e0e0e0',
  },
  achievementText: {
    fontSize: 14,
    color: theme.colors.textSecondary || '#666',
    marginBottom: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border || '#e0e0e0',
    paddingVertical: 8,
  },
  navDot: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeDot: {
    backgroundColor: theme.colors.primary + '20' || '#4CAF5020',
  },
  navText: {
    fontSize: 12,
    color: theme.colors.textSecondary || '#666',
    fontWeight: '500',
  },
  activeNavText: {
    color: theme.colors.primary || '#4CAF50',
    fontWeight: '600',
  },
  menuOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  menuBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: 280,
    backgroundColor: 'white',
    paddingTop: 50,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text || '#2e2e2e',
  },
  closeButton: {
    fontSize: 20,
    color: theme.colors.textSecondary || '#666',
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.text || '#2e2e2e',
  },
});