import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService, type UserStats, type ProgressData } from '../../services/StorageService';

export default function ProgressTab() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const stats = await StorageService.getUserStats();
      const progress = await StorageService.getProgressData();
      
      setUserStats(stats);
      setProgressData(progress);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleEmoji}>🌱</Text>
            <Text style={styles.title}>
              Your <Text style={styles.titleHighlight}>THRIVE</Text> Progress
            </Text>
          </View>
          <Text style={styles.subtitle}>
            Every step counts on your wellness journey! You're crushing it! 🌟
          </Text>
        </View>

        {/* XP and Level */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="flash" size={32} color="#F59E0B" />
            <View style={styles.statText}>
              <Text style={styles.statNumber}>{userStats?.xp || 0}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="flame" size={32} color="#EF4444" />
            <View style={styles.statText}>
              <Text style={styles.statNumber}>{userStats?.currentStreak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Workout Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Workout Statistics</Text>
          
          <View style={styles.statRow}>
            <Ionicons name="fitness" size={24} color="#10B981" />
            <Text style={styles.statRowLabel}>Total Workouts</Text>
            <Text style={styles.statRowValue}>{userStats?.totalWorkouts || 0}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Ionicons name="calendar" size={24} color="#3B82F6" />
            <Text style={styles.statRowLabel}>This Week</Text>
            <Text style={styles.statRowValue}>{progressData?.weeklyWorkouts || 0}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Ionicons name="target" size={24} color="#8B5CF6" />
            <Text style={styles.statRowLabel}>Weekly Goal</Text>
            <Text style={styles.statRowValue}>{progressData?.weeklyGoal || 3}</Text>
          </View>
        </View>

        {/* Last Workout */}
        {userStats?.lastWorkoutDate && (
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            <View style={styles.lastWorkoutContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <View style={styles.lastWorkoutText}>
                <Text style={styles.lastWorkoutLabel}>Last Workout</Text>
                <Text style={styles.lastWorkoutDate}>
                  {new Date(userStats.lastWorkoutDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Achievement Milestones */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Next Milestones</Text>
          
          <View style={styles.milestone}>
            <View style={styles.milestoneProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(((userStats?.currentStreak || 0) / 7) * 100, 100)}%`,
                      backgroundColor: '#EF4444' 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.milestoneText}>
                {userStats?.currentStreak || 0}/7 days for Week Warrior! 🏆
              </Text>
            </View>
          </View>

          <View style={styles.milestone}>
            <View style={styles.milestoneProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(((userStats?.totalWorkouts || 0) / 10) * 100, 100)}%`,
                      backgroundColor: '#10B981' 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.milestoneText}>
                {userStats?.totalWorkouts || 0}/10 workouts for Perfect Ten! ⚡
              </Text>
            </View>
          </View>
        </View>

        {/* Coming Soon Features */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>Coming in Phase 2</Text>
          <Text style={styles.comingSoonText}>
            📊 Advanced mood analytics{'\n'}
            📈 Detailed progress charts{'\n'}
            🏃‍♀️ Health app integration{'\n'}
            🎯 Personalized goals{'\n'}
            📱 Weekly progress reports
          </Text>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={loadProgressData}>
          <Ionicons name="refresh" size={20} color="#3B82F6" />
          <Text style={styles.refreshText}>Refresh Progress</Text>
        </TouchableOpacity>
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
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleEmoji: {
    fontSize: 32,
    marginRight: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  titleHighlight: {
    color: '#16A34A',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    marginLeft: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statRowLabel: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  lastWorkoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastWorkoutText: {
    marginLeft: 12,
  },
  lastWorkoutLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  lastWorkoutDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  milestone: {
    marginBottom: 16,
  },
  milestoneProgress: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestoneText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  comingSoonCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#3B82F6',
    lineHeight: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  refreshText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 8,
  },
});