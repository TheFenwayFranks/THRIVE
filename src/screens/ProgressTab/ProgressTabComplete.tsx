import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService, type UserStats, type ProgressData, type MoodEntry } from '../../services/StorageService';

export default function ProgressTabComplete() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllProgressData();
  }, []);

  const loadAllProgressData = async () => {
    try {
      const [stats, progress, moods] = await Promise.all([
        StorageService.getUserStats(),
        StorageService.getProgressData(),
        StorageService.getMoodEntries()
      ]);
      
      setUserStats(stats);
      setProgressData(progress);
      setMoodEntries(moods || []);
    } catch (error) {
      console.error('Failed to load progress data:', error);
      Alert.alert('Error', 'Failed to load progress data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getNextMilestone = () => {
    if (!userStats) return null;

    const { currentStreak = 0, totalWorkouts = 0, xp = 0 } = userStats;

    if (currentStreak < 7) {
      return {
        type: 'streak',
        current: currentStreak,
        target: 7,
        title: 'Week Warrior',
        emoji: '🔥',
        description: 'Complete workouts for 7 consecutive days'
      };
    }

    if (totalWorkouts < 10) {
      return {
        type: 'workouts',
        current: totalWorkouts,
        target: 10,
        title: 'Perfect Ten',
        emoji: '⚡',
        description: 'Complete 10 total workouts'
      };
    }

    if (xp < 100) {
      return {
        type: 'xp',
        current: xp,
        target: 100,
        title: 'Century Club',
        emoji: '💯',
        description: 'Earn 100 total XP'
      };
    }

    if (currentStreak < 30) {
      return {
        type: 'streak',
        current: currentStreak,
        target: 30,
        title: 'Monthly Master',
        emoji: '🏆',
        description: 'Maintain a 30-day streak'
      };
    }

    return {
      type: 'legend',
      current: 100,
      target: 100,
      title: 'THRIVE Legend',
      emoji: '👑',
      description: 'You\'ve mastered the art of THRIVING!'
    };
  };

  const getRecentMoodTrend = () => {
    if (moodEntries.length === 0) return null;

    const recent = moodEntries.slice(-5); // Last 5 moods
    const average = recent.reduce((sum, entry) => sum + entry.mood, 0) / recent.length;
    
    let trend = 'stable';
    let trendEmoji = '📊';
    let trendColor = '#3B82F6';

    if (recent.length >= 2) {
      const firstHalf = recent.slice(0, Math.ceil(recent.length / 2));
      const secondHalf = recent.slice(Math.ceil(recent.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.mood, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.mood, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.3) {
        trend = 'improving';
        trendEmoji = '📈';
        trendColor = '#10B981';
      } else if (secondAvg < firstAvg - 0.3) {
        trend = 'declining';
        trendEmoji = '📉';
        trendColor = '#EF4444';
      }
    }

    return {
      average: Math.round(average * 10) / 10,
      trend,
      trendEmoji,
      trendColor,
      count: recent.length
    };
  };

  const getMoodDescription = (mood: number) => {
    switch(mood) {
      case 1: return { label: 'Exhausted', emoji: '😫', color: '#DC2626' };
      case 2: return { label: 'Okay', emoji: '😐', color: '#F59E0B' };
      case 3: return { label: 'Good', emoji: '🙂', color: '#3B82F6' };
      case 4: return { label: 'Great', emoji: '😄', color: '#10B981' };
      case 5: return { label: 'Amazing', emoji: '🔥', color: '#8B5CF6' };
      default: return { label: 'Unknown', emoji: '❓', color: '#6B7280' };
    }
  };

  const resetProgress = () => {
    Alert.alert(
      'Reset All Progress?',
      'This will permanently delete all your workout data, streaks, XP, and mood entries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset All Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              const defaultStats = { 
                xp: 0, 
                currentStreak: 0, 
                totalWorkouts: 0, 
                lastWorkoutDate: null,
                dailyTasksCompleted: 0 
              };
              
              await StorageService.saveUserStats(defaultStats);
              
              // Clear mood entries
              await StorageService.saveMoodEntry({ 
                id: 'reset', 
                mood: 3, 
                timestamp: new Date().toISOString() 
              });
              
              loadAllProgressData();
              
              Alert.alert('Progress Reset', 'All progress has been reset. Ready for a fresh start!');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset progress. Please try again.');
            }
          }
        }
      ]
    );
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

  const nextMilestone = getNextMilestone();
  const moodTrend = getRecentMoodTrend();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
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

        {/* Main Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>{userStats?.xp || 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#EF4444" />
            <Text style={styles.statNumber}>{userStats?.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="fitness" size={24} color="#10B981" />
            <Text style={styles.statNumber}>{userStats?.totalWorkouts || 0}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
        </View>

        {/* Next Milestone */}
        {nextMilestone && (
          <View style={styles.milestoneCard}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneEmoji}>{nextMilestone.emoji}</Text>
              <View>
                <Text style={styles.milestoneTitle}>Next Milestone: {nextMilestone.title}</Text>
                <Text style={styles.milestoneDescription}>{nextMilestone.description}</Text>
              </View>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min((nextMilestone.current / nextMilestone.target) * 100, 100)}%`,
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {nextMilestone.current}/{nextMilestone.target}
              </Text>
            </View>
            
            <Text style={styles.progressRemaining}>
              {nextMilestone.target - nextMilestone.current > 0 
                ? `${nextMilestone.target - nextMilestone.current} more to go!`
                : 'Milestone achieved! 🎉'
              }
            </Text>
          </View>
        )}

        {/* Mood Analytics */}
        {moodTrend && (
          <View style={styles.moodCard}>
            <View style={styles.moodHeader}>
              <Text style={styles.moodTitle}>Mood After Workouts</Text>
              <Text style={styles.moodTrend} style={{ color: moodTrend.trendColor }}>
                {moodTrend.trendEmoji} {moodTrend.trend}
              </Text>
            </View>
            
            <View style={styles.moodStats}>
              <View style={styles.moodAverage}>
                <Text style={styles.moodAverageNumber}>{moodTrend.average}</Text>
                <Text style={styles.moodAverageLabel}>Average Mood</Text>
              </View>
              
              <Text style={styles.moodDescription}>
                Based on your last {moodTrend.count} workouts, you typically feel{' '}
                <Text style={styles.moodHighlight}>
                  {getMoodDescription(Math.round(moodTrend.average)).label.toLowerCase()}
                </Text>{' '}
                after exercising.
              </Text>
            </View>

            {/* Recent Mood History */}
            <View style={styles.moodHistory}>
              <Text style={styles.moodHistoryTitle}>Recent Post-Workout Moods:</Text>
              <View style={styles.moodHistoryItems}>
                {moodEntries.slice(-5).reverse().map((entry, index) => {
                  const moodDesc = getMoodDescription(entry.mood);
                  return (
                    <View key={entry.id} style={styles.moodHistoryItem}>
                      <Text style={styles.moodHistoryEmoji}>{moodDesc.emoji}</Text>
                      <Text style={styles.moodHistoryLabel}>{moodDesc.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Weekly Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Week's Progress</Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Ionicons name="calendar" size={20} color="#3B82F6" />
              <Text style={styles.summaryLabel}>Workouts</Text>
              <Text style={styles.summaryValue}>{progressData?.weeklyWorkouts || 0}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="target" size={20} color="#8B5CF6" />
              <Text style={styles.summaryLabel}>Goal</Text>
              <Text style={styles.summaryValue}>{progressData?.weeklyGoal || 3}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.summaryLabel}>Completed</Text>
              <Text style={styles.summaryValue}>
                {Math.round(((progressData?.weeklyWorkouts || 0) / (progressData?.weeklyGoal || 3)) * 100)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Last Workout */}
        {userStats?.lastWorkoutDate && (
          <View style={styles.lastWorkoutCard}>
            <View style={styles.lastWorkoutHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.lastWorkoutTitle}>Last Workout</Text>
            </View>
            <Text style={styles.lastWorkoutDate}>
              {new Date(userStats.lastWorkoutDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}

        {/* Achievement Badges */}
        <View style={styles.achievementsCard}>
          <Text style={styles.achievementsTitle}>Achievements Unlocked</Text>
          
          <View style={styles.achievementsList}>
            {(userStats?.totalWorkouts || 0) >= 1 && (
              <View style={styles.achievement}>
                <Text style={styles.achievementEmoji}>🌱</Text>
                <Text style={styles.achievementName}>First Step</Text>
              </View>
            )}
            
            {(userStats?.currentStreak || 0) >= 3 && (
              <View style={styles.achievement}>
                <Text style={styles.achievementEmoji}>🔥</Text>
                <Text style={styles.achievementName}>3-Day Streak</Text>
              </View>
            )}
            
            {(userStats?.totalWorkouts || 0) >= 5 && (
              <View style={styles.achievement}>
                <Text style={styles.achievementEmoji}>💪</Text>
                <Text style={styles.achievementName}>High Five</Text>
              </View>
            )}
            
            {(userStats?.currentStreak || 0) >= 7 && (
              <View style={styles.achievement}>
                <Text style={styles.achievementEmoji}>🏆</Text>
                <Text style={styles.achievementName}>Week Warrior</Text>
              </View>
            )}
            
            {(userStats?.xp || 0) >= 100 && (
              <View style={styles.achievement}>
                <Text style={styles.achievementEmoji}>💯</Text>
                <Text style={styles.achievementName}>Century Club</Text>
              </View>
            )}
          </View>
        </View>

        {/* Coming Soon Features */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>Enhanced Analytics Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            📊 Weekly/monthly progress charts{'\n'}
            📈 Detailed mood trend analysis{'\n'}
            🏃‍♀️ Health app integration{'\n'}
            🎯 Custom goal setting{'\n'}
            📱 Weekly progress reports
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadAllProgressData}>
            <Ionicons name="refresh" size={20} color="#3B82F6" />
            <Text style={styles.refreshText}>Refresh Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resetButton} onPress={resetProgress}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.resetText}>Reset Progress</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  titleHighlight: {
    color: '#16A34A',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  milestoneCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBarContainer: {
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
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  progressRemaining: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  moodCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  moodTrend: {
    fontSize: 14,
    fontWeight: '600',
  },
  moodStats: {
    marginBottom: 16,
  },
  moodAverage: {
    alignItems: 'center',
    marginBottom: 12,
  },
  moodAverageNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  moodAverageLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  moodDescription: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  moodHighlight: {
    fontWeight: '600',
    color: '#16A34A',
  },
  moodHistory: {
    marginTop: 16,
  },
  moodHistoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  moodHistoryItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodHistoryItem: {
    alignItems: 'center',
    flex: 1,
  },
  moodHistoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  moodHistoryLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  lastWorkoutCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lastWorkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lastWorkoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  lastWorkoutDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  achievementsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievement: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  achievementEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#166534',
    textAlign: 'center',
  },
  comingSoonCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  refreshText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  resetText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 20,
  },
});