import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';

// Ultra-Minimal Move Tab - Maximum Stability
export default function MoveTabMinimal() {
  
  const handleDifficultySelect = (difficulty: string) => {
    console.log(`🎯 Difficulty selected: ${difficulty}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Ready to <Text style={styles.highlight}>THRIVE</Text>?
          </Text>
          <Text style={styles.subtitle}>
            Every movement counts. You've got this! 💙
          </Text>
        </View>

        {/* Difficulty Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Energy Level</Text>
          
          <TouchableOpacity 
            style={[styles.difficultyCard, styles.gentle]}
            onPress={() => handleDifficultySelect('gentle')}
          >
            <Text style={styles.difficultyEmoji}>🌱</Text>
            <Text style={styles.difficultyTitle}>Gentle</Text>
            <Text style={styles.difficultySubtitle}>Low energy? Perfect.</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.difficultyCard, styles.steady]}
            onPress={() => handleDifficultySelect('steady')}
          >
            <Text style={styles.difficultyEmoji}>🚶</Text>
            <Text style={styles.difficultyTitle}>Steady</Text>
            <Text style={styles.difficultySubtitle}>Ready to move</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.difficultyCard, styles.beast]}
            onPress={() => handleDifficultySelect('beast')}
          >
            <Text style={styles.difficultyEmoji}>🔥</Text>
            <Text style={styles.difficultyTitle}>Beast Mode</Text>
            <Text style={styles.difficultySubtitle}>Bring the energy!</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  highlight: {
    color: '#16A34A',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  difficultyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  gentle: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  steady: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  beast: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  difficultyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  difficultyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  difficultySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});