/**
 * CustomizableProfilePage.tsx
 * 
 * Redesigned profile page inspired by modern wellness app design
 * Features customizable 6-card layout with 7-day health data averages
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { useHealthData } from './useHealthData';
import HealthAveragesService from './HealthAveragesService';

// Thrive brand colors
const THRIVE_COLORS = {
  primary: '#27AE60',
  accent: '#74B9FF', 
  highlight: '#FF7675',
  neutral: '#ECECEC',
  white: '#FFFFFF',
  black: '#2C3E50',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
};

// Available card types with their configurations
const AVAILABLE_CARD_TYPES = {
  steps: {
    title: 'Daily Steps',
    icon: '👟',
    color: '#34C759',
    format: (value) => `${Math.round(value).toLocaleString()}`,
    subtitle: 'avg steps',
    dataKey: 'steps.current'
  },
  calories: {
    title: 'Calories Burned',
    icon: '🔥',
    color: '#FF5722',
    format: (value) => `${Math.round(value)}`,
    subtitle: 'avg calories',
    dataKey: 'calories.burned'
  },
  heartRate: {
    title: 'Heart Rate',
    icon: '❤️',
    color: '#E91E63',
    format: (value) => `${Math.round(value)}`,
    subtitle: 'avg bpm',
    dataKey: 'heartRate.average'
  },
  sleep: {
    title: 'Sleep Duration',
    icon: '🌙',
    color: '#673AB7',
    format: (value) => {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return `${hours}h ${minutes}m`;
    },
    subtitle: 'avg sleep',
    dataKey: 'sleep.duration'
  },
  workouts: {
    title: 'Workout Time',
    icon: '💪',
    color: '#2196F3',
    format: (value) => `${Math.round(value)}m`,
    subtitle: 'avg duration',
    dataKey: 'workouts.totalDuration'
  },
  mood: {
    title: 'Daily Mood',
    icon: '😊',
    color: '#FFC107',
    format: (value) => {
      const moodEmojis = ['😢', '😔', '😐', '😊', '😄', '🤩'];
      const emojiIndex = Math.min(Math.floor(value / 2), 5);
      return moodEmojis[emojiIndex];
    },
    subtitle: `mood rating`,
    dataKey: 'mood.current',
    showNumber: true
  },
  mindfulness: {
    title: 'Mindfulness',
    icon: '🧘',
    color: '#9C27B0',
    format: (value) => `${Math.round(value)}m`,
    subtitle: 'avg meditation',
    dataKey: 'mindfulness.current'
  },
  water: {
    title: 'Water Intake',
    icon: '💧',
    color: '#00BCD4',
    format: (value) => `${Math.round(value)}oz`,
    subtitle: 'avg water',
    dataKey: null, // Custom metric not in health data
    isCustom: true
  },
  weight: {
    title: 'Weight Progress',
    icon: '⚖️',
    color: '#795548',
    format: (value) => `${Math.round(value)} lbs`,
    subtitle: 'current weight',
    dataKey: 'weight.current'
  },
  distance: {
    title: 'Distance',
    icon: '🏃',
    color: '#FF9800',
    format: (value) => `${value.toFixed(1)} mi`,
    subtitle: 'avg distance',
    dataKey: 'distance.current'
  }
};

interface ProfileCard {
  id: string;
  type: string;
  position: number; // 0-5 for the 6 slots
  customColor?: string;
  customTitle?: string;
  isVisible: boolean;
}

interface CustomizableProfilePageProps {
  profileData: {
    name: string;
    bio: string;
    avatar?: string;
  };
  onProfileUpdate: (data: any) => void;
}

const CustomizableProfilePage: React.FC<CustomizableProfilePageProps> = ({
  profileData,
  onProfileUpdate
}) => {
  const { healthData, healthConnected } = useHealthData();
  const healthAveragesService = HealthAveragesService.getInstance();
  
  // Default card layout inspired by the design
  const [profileCards, setProfileCards] = useState<ProfileCard[]>([
    { id: '1', type: 'mood', position: 0, isVisible: true },
    { id: '2', type: 'workouts', position: 1, isVisible: true },
    { id: '3', type: 'steps', position: 2, isVisible: true },
    { id: '4', type: 'sleep', position: 3, isVisible: true },
    { id: '5', type: 'heartRate', position: 4, isVisible: true },
    { id: '6', type: 'water', position: 5, isVisible: true, customColor: '#00BCD4' }
  ]);

  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<ProfileCard | null>(null);
  const [weeklyAverages, setWeeklyAverages] = useState(healthAveragesService.getAllWeeklyAverages());
  
  // Update averages when health data changes
  useEffect(() => {
    if (healthData && healthConnected) {
      healthAveragesService.integrateHealthData(healthData);
    }
    setWeeklyAverages(healthAveragesService.getAllWeeklyAverages());
  }, [healthData, healthConnected]);

  // Get 7-day average for specific metric
  const getWeeklyAverageByType = (type: string) => {
    const metricMap = {
      'steps': weeklyAverages.steps,
      'calories': weeklyAverages.calories,
      'heartRate': weeklyAverages.heartRate,
      'sleep': weeklyAverages.sleep,
      'workouts': weeklyAverages.workouts,
      'mood': weeklyAverages.mood,
      'mindfulness': weeklyAverages.mindfulness,
      'weight': weeklyAverages.weight,
      'distance': weeklyAverages.distance,
      'water': weeklyAverages.water
    };
    return metricMap[type] || 0;
  };

  // Get card data with 7-day averages
  const getCardData = (card: ProfileCard) => {
    const cardConfig = AVAILABLE_CARD_TYPES[card.type];
    if (!cardConfig) return null;

    const value = getWeeklyAverageByType(card.type);

    return {
      ...cardConfig,
      value,
      customColor: card.customColor,
      customTitle: card.customTitle
    };
  };

  // Handle card customization
  const handleCardEdit = (card: ProfileCard) => {
    setSelectedCardForEdit(card);
    setShowCustomizeModal(true);
  };

  // Update card configuration
  const updateCard = (cardId: string, updates: Partial<ProfileCard>) => {
    setProfileCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    ));
  };

  // Add new card to empty slot
  const addCard = (type: string, position: number) => {
    const newCard: ProfileCard = {
      id: Date.now().toString(),
      type,
      position,
      isVisible: true
    };
    
    setProfileCards(prev => {
      const updated = [...prev];
      const existingIndex = updated.findIndex(c => c.position === position);
      if (existingIndex >= 0) {
        updated[existingIndex] = newCard;
      } else {
        updated.push(newCard);
      }
      return updated;
    });
  };

  // Remove card from layout
  const removeCard = (cardId: string) => {
    setProfileCards(prev => prev.filter(card => card.id !== cardId));
  };

  // Get card for specific position
  const getCardAtPosition = (position: number) => {
    return profileCards.find(card => card.position === position && card.isVisible);
  };

  // Render individual profile card
  const renderProfileCard = (position: number, style: any) => {
    const card = getCardAtPosition(position);
    
    if (!card) {
      // Empty slot - show add button
      return (
        <View key={`empty-${position}`} style={[style, styles.emptyCard]}>
          <View 
            style={styles.addButton}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => {
              // Show card type selector for this position
              Alert.alert(
                'Add Card',
                'Choose a health metric to display',
                Object.keys(AVAILABLE_CARD_TYPES).map(type => ({
                  text: AVAILABLE_CARD_TYPES[type].title,
                  onPress: () => addCard(type, position)
                }))
              );
            }}
          >
            <Text style={styles.addButtonText}>+</Text>
            <Text style={styles.addButtonLabel}>Add Card</Text>
          </View>
        </View>
      );
    }

    const cardData = getCardData(card);
    if (!cardData) return null;

    const cardColor = card.customColor || cardData.color;
    const isLargeCard = position === 0 || position === 1; // First two positions are larger
    
    return (
      <View 
        key={card.id} 
        style={[
          style, 
          { backgroundColor: cardColor },
          isLargeCard ? styles.largeCard : styles.smallCard
        ]}
        onStartShouldSetResponder={() => true}
        onResponderGrant={() => handleCardEdit(card)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{cardData.icon}</Text>
          <Text style={styles.cardTitle}>
            {card.customTitle || cardData.title}
          </Text>
        </View>
        
        <View style={styles.cardContent}>
          {card.type === 'mood' && cardData.showNumber ? (
            <View style={styles.moodContainer}>
              <Text style={styles.moodEmoji}>{cardData.format(cardData.value)}</Text>
              <Text style={styles.moodNumber}>{cardData.value.toFixed(1)}</Text>
            </View>
          ) : (
            <Text style={styles.cardValue}>
              {cardData.format(cardData.value)}
            </Text>
          )}
          
          <Text style={styles.cardSubtitle}>{cardData.subtitle}</Text>
        </View>

        {/* Progress ring for workout card */}
        {card.type === 'workouts' && (
          <View style={styles.progressRingContainer}>
            <View style={styles.progressRing}>
              <View 
                style={[
                  styles.progressRingFill,
                  { 
                    transform: [{ 
                      rotate: `${Math.min(cardData.value / 60 * 360, 360)}deg` 
                    }]
                  }
                ]}
              />
              <View style={styles.progressRingCenter}>
                <Text style={styles.progressPercentage}>
                  {Math.round(Math.min(cardData.value / 60 * 100, 100))}%
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profileData.name?.split(' ').map(n => n[0]).join('') || 'AB'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.profileName}>
          {profileData.name || 'Anthony B.'}
        </Text>
        
        <Text style={styles.profileBio}>
          {profileData.bio || 'Striving for Balance'}
        </Text>

        {/* Key Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricIcon}>🔥</Text>
            <Text style={styles.metricValue}>{weeklyAverages.streak}</Text>
            <Text style={styles.metricLabel}>Streak</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricIcon}>💧</Text>
            <Text style={styles.metricValue}>{weeklyAverages.water} oz</Text>
            <Text style={styles.metricLabel}>Water</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricIcon}>🌙</Text>
            <Text style={styles.metricValue}>
              {weeklyAverages.sleep.toFixed(1)} hrs
            </Text>
            <Text style={styles.metricLabel}>Sleep</Text>
          </View>
        </View>
      </View>

      {/* Customizable Cards Grid */}
      <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsGrid}>
          {/* Row 1 - Two large cards */}
          <View style={styles.cardRow}>
            {renderProfileCard(0, styles.largeCardLeft)}
            {renderProfileCard(1, styles.largeCardRight)}
          </View>
          
          {/* Row 2 - Two medium cards */}
          <View style={styles.cardRow}>
            {renderProfileCard(2, styles.mediumCardLeft)}
            {renderProfileCard(3, styles.mediumCardRight)}
          </View>
          
          {/* Row 3 - Two small cards */}
          <View style={styles.cardRow}>
            {renderProfileCard(4, styles.smallCardLeft)}
            {renderProfileCard(5, styles.smallCardRight)}
          </View>
        </View>
        
        {/* Customize Button */}
        <View 
          style={styles.customizeButton}
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => setShowCustomizeModal(true)}
        >
          <Text style={styles.customizeButtonText}>Customize Cards</Text>
        </View>
      </ScrollView>

      {/* Customization Modal */}
      <Modal
        visible={showCustomizeModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowCustomizeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Customize Your Profile</Text>
            <View 
              style={styles.modalCloseButton}
              onStartShouldSetResponder={() => true}
              onResponderGrant={() => setShowCustomizeModal(false)}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </View>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Your Cards</Text>
            
            {profileCards.map((card) => {
              const cardConfig = AVAILABLE_CARD_TYPES[card.type];
              return (
                <View key={card.id} style={styles.cardListItem}>
                  <View style={styles.cardListInfo}>
                    <Text style={styles.cardListIcon}>{cardConfig?.icon}</Text>
                    <View style={styles.cardListDetails}>
                      <Text style={styles.cardListTitle}>
                        {card.customTitle || cardConfig?.title}
                      </Text>
                      <Text style={styles.cardListPosition}>
                        Position {card.position + 1}
                      </Text>
                    </View>
                  </View>
                  
                  <View 
                    style={styles.removeButton}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => {
                      Alert.alert(
                        'Remove Card',
                        `Remove ${cardConfig?.title}?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Remove', onPress: () => removeCard(card.id) }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </View>
                </View>
              );
            })}
            
            <Text style={styles.sectionTitle}>Available Metrics</Text>
            
            {Object.keys(AVAILABLE_CARD_TYPES)
              .filter(type => !profileCards.some(card => card.type === type))
              .map(type => {
                const config = AVAILABLE_CARD_TYPES[type];
                return (
                  <View 
                    key={type}
                    style={styles.availableCardItem}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => {
                      const emptyPosition = Array.from({length: 6}, (_, i) => i)
                        .find(pos => !getCardAtPosition(pos));
                      
                      if (emptyPosition !== undefined) {
                        addCard(type, emptyPosition);
                      } else {
                        Alert.alert('No Space', 'Remove a card first to add this one.');
                      }
                    }}
                  >
                    <Text style={styles.availableCardIcon}>{config.icon}</Text>
                    <Text style={styles.availableCardTitle}>{config.title}</Text>
                  </View>
                );
              })
            }
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THRIVE_COLORS.white,
  },
  
  // Profile Header Styles (Restored Comfortable Spacing)
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40, // Restored comfortable spacing
    paddingBottom: 24, // Restored comfortable spacing
  },
  
  avatarContainer: {
    marginBottom: 16, // Restored comfortable spacing
  },
  
  avatar: {
    width: 80, // Restored original size
    height: 80, // Restored original size
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  avatarText: {
    fontSize: 32, // Restored original size
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
  },
  
  profileName: {
    fontSize: 28, // Restored original size
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
    marginBottom: 8, // Restored comfortable spacing
  },
  
  profileBio: {
    fontSize: 16, // Restored original size
    color: '#666',
    marginBottom: 24, // Restored comfortable spacing
  },
  
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20, // Restored comfortable spacing
  },
  
  metricItem: {
    alignItems: 'center',
  },
  
  metricIcon: {
    fontSize: 20, // Restored original size
    marginBottom: 4, // Restored comfortable spacing
  },
  
  metricValue: {
    fontSize: 16, // Restored original size
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
  },
  
  metricLabel: {
    fontSize: 12, // Restored original size
    color: '#666',
  },
  
  // Cards Container Styles (Restored Comfortable Spacing)
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20, // Restored comfortable spacing
  },
  
  cardsGrid: {
    paddingBottom: 20, // Restored comfortable spacing
  },
  
  cardRow: {
    flexDirection: 'row',
    marginBottom: 16, // Restored comfortable spacing
    gap: 12, // Restored comfortable spacing
  },
  
  // Card Size Styles (Restored Original Comfortable Sizes)
  largeCardLeft: {
    flex: 1,
    height: 160, // Restored original size
  },
  
  largeCardRight: {
    flex: 1,
    height: 160, // Restored original size
  },
  
  mediumCardLeft: {
    flex: 1,
    height: 120, // Restored original size
  },
  
  mediumCardRight: {
    flex: 1,
    height: 120, // Restored original size
  },
  
  smallCardLeft: {
    flex: 1,
    height: 100, // Restored original size
  },
  
  smallCardRight: {
    flex: 1,
    height: 100, // Restored original size
  },
  
  // Card Content Styles (Restored Original Comfortable Padding)
  largeCard: {
    borderRadius: 16,
    padding: 16, // Restored comfortable padding
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  smallCard: {
    borderRadius: 12,
    padding: 12, // Restored comfortable padding
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  
  cardHeader: {
    marginBottom: 8, // Restored comfortable spacing
  },
  
  cardIcon: {
    fontSize: 24, // Restored original size
    marginBottom: 4, // Restored comfortable spacing
  },
  
  cardTitle: {
    fontSize: 14, // Restored original size
    fontWeight: '600',
    color: THRIVE_COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  
  cardValue: {
    fontSize: 28, // Restored original size
    fontWeight: 'bold',
    color: THRIVE_COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4, // Restored comfortable spacing
  },
  
  cardSubtitle: {
    fontSize: 12, // Restored original size
    color: THRIVE_COLORS.white,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  
  // Mood Card Specific Styles
  moodContainer: {
    alignItems: 'center',
  },
  
  moodEmoji: {
    fontSize: 48, // Restored original size
    marginBottom: 8, // Restored comfortable spacing
  },
  
  moodNumber: {
    fontSize: 24, // Restored original size
    fontWeight: 'bold',
    color: THRIVE_COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // Progress Ring Styles (for workout card) - Mobile Optimized
  progressRingContainer: {
    position: 'absolute',
    top: 12, // Reduced from 16
    right: 12, // Reduced from 16
  },
  
  progressRing: {
    width: 50, // Reduced from 60
    height: 50, // Reduced from 60
    borderRadius: 25,
    borderWidth: 3, // Reduced from 4
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  progressRingFill: {
    position: 'absolute',
    width: 50, // Reduced from 60
    height: 50, // Reduced from 60
    borderRadius: 25,
    borderWidth: 3, // Reduced from 4
    borderColor: THRIVE_COLORS.white,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  
  progressRingCenter: {
    width: 36, // Reduced from 44
    height: 36, // Reduced from 44
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  progressPercentage: {
    fontSize: 10, // Reduced from 12
    fontWeight: 'bold',
    color: THRIVE_COLORS.white,
  },
  
  // Empty Card Styles
  emptyCard: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THRIVE_COLORS.neutral,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  
  addButton: {
    alignItems: 'center',
  },
  
  addButtonText: {
    fontSize: 24, // Reduced from 32
    color: '#999',
    marginBottom: 2, // Reduced from 4
  },
  
  addButtonLabel: {
    fontSize: 10, // Reduced from 12
    color: '#999',
    fontWeight: '500',
  },
  
  // Customize Button (Mobile Optimized)
  customizeButton: {
    backgroundColor: THRIVE_COLORS.primary,
    paddingVertical: 12, // Reduced from 16
    paddingHorizontal: 24, // Reduced from 32
    borderRadius: 10, // Reduced from 12
    alignItems: 'center',
    marginTop: 16, // Reduced from 20
    marginBottom: 24, // Reduced from 40
  },
  
  customizeButtonText: {
    fontSize: 14, // Reduced from 16
    fontWeight: '600',
    color: THRIVE_COLORS.white,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: THRIVE_COLORS.white,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: THRIVE_COLORS.neutral,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
  },
  
  modalCloseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: THRIVE_COLORS.primary,
  },
  
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
    marginTop: 20,
    marginBottom: 16,
  },
  
  // Card List Item Styles
  cardListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THRIVE_COLORS.neutral,
  },
  
  cardListInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  cardListIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  
  cardListDetails: {
    flex: 1,
  },
  
  cardListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
  },
  
  cardListPosition: {
    fontSize: 14,
    color: '#666',
  },
  
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THRIVE_COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  removeButtonText: {
    fontSize: 16,
    color: THRIVE_COLORS.white,
    fontWeight: 'bold',
  },
  
  // Available Card Styles
  availableCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 8,
  },
  
  availableCardIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  
  availableCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: THRIVE_COLORS.black,
  },
});

export default CustomizableProfilePage;