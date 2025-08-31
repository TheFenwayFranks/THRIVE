import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface DifficultySelectorProps {
  selectedDifficulty: 'gentle' | 'steady' | 'beast';
  onSelect: (difficulty: 'gentle' | 'steady' | 'beast') => void;
}

interface DifficultyOption {
  id: 'gentle' | 'steady' | 'beast';
  title: string;
  subtitle: string;
  duration: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  description: string;
}

const difficultyOptions: DifficultyOption[] = [
  {
    id: 'gentle',
    title: 'Gentle',
    subtitle: 'Low energy? Perfect.',
    duration: '2-8 min',
    icon: 'leaf-outline',
    color: '#10B981',
    bgColor: '#D1FAE5',
    description: 'Breathing exercises, gentle stretches, bed-friendly movements'
  },
  {
    id: 'steady',
    title: 'Steady',
    subtitle: 'Ready to move',
    duration: '10-15 min',
    icon: 'walk-outline',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    description: 'Standing stretches, light cardio, bodyweight basics'
  },
  {
    id: 'beast',
    title: 'Beast Mode',
    subtitle: 'Bring the energy!',
    duration: '20-25 min',
    icon: 'flame-outline',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    description: 'HIIT workouts, strength challenges, intense cardio'
  }
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onSelect
}) => {
  const handleSelect = async (difficulty: 'gentle' | 'steady' | 'beast') => {
    await Haptics.selectionAsync();
    onSelect(difficulty);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>
      <Text style={styles.subtitle}>
        Choose based on your energy level - there's no wrong choice! 💙
      </Text>
      
      <View style={styles.optionsContainer}>
        {difficultyOptions.map((option) => {
          const isSelected = selectedDifficulty === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                { 
                  backgroundColor: isSelected ? option.bgColor : '#F9FAFB',
                  borderColor: isSelected ? option.color : '#E5E7EB',
                  borderWidth: isSelected ? 2 : 1,
                }
              ]}
              onPress={() => handleSelect(option.id)}
              activeOpacity={0.8}
            >
              <View style={styles.optionHeader}>
                <Ionicons 
                  name={option.icon} 
                  size={32} 
                  color={isSelected ? option.color : '#6B7280'} 
                />
                <View style={styles.titleContainer}>
                  <Text style={[
                    styles.optionTitle,
                    { color: isSelected ? option.color : '#1F2937' }
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={styles.optionSubtitle}>
                    {option.subtitle}
                  </Text>
                </View>
                <View style={[styles.durationBadge, { backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.05)' }]}>
                  <Text style={[styles.durationText, { color: option.color }]}>
                    {option.duration}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.optionDescription}>
                {option.description}
              </Text>
              
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={20} color={option.color} />
                  <Text style={[styles.selectedText, { color: option.color }]}>
                    Selected
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  durationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default DifficultySelector;