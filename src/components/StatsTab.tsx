import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { StorageService } from '../services/StorageService';

interface StatsTabProps {
  userStats: {
    xp: number;
    streak: number;
    totalWorkouts: number;
    lastWorkoutDate?: string;
  };
}

interface WeeklyData {
  workouts: number;
  xp: number;
  mood: number[];
}

export default function StatsTab({ userStats }: StatsTabProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    workouts: 0,
    xp: 0,
    mood: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  // Calculate user level based on XP
  const getUserLevel = () => {
    return Math.floor(userStats.xp / 100) + 1;
  };

  const getXPToNextLevel = () => {
    const currentLevel = getUserLevel();
    const xpForNextLevel = currentLevel * 100;
    return xpForNextLevel - userStats.xp;
  };

  const getLevelProgress = () => {
    const levelXP = userStats.xp % 100;
    return (levelXP / 100) * 100;
  };

  // Get streak status
  const getStreakStatus = () => {
    const { streak } = userStats;
    if (streak >= 30) return { label: '🔥 Fire Streak!', color: theme.colors.celebration };
    if (streak >= 14) return { label: '⚡ Power Streak!', color: theme.colors.mood };
    if (streak >= 7) return { label: '💪 Strong Streak!', color: theme.colors.success };
    if (streak >= 3) return { label: '🌱 Growing Streak!', color: theme.colors.info };
    return { label: '🎯 Building Momentum', color: theme.colors.primary };
  };

  // Calculate weekly highs and lows
  const getWeeklyInsights = () => {
    const insights = [];
    
    // Workout frequency insight
    const avgWorkoutsPerWeek = weeklyData.workouts || Math.min(userStats.totalWorkouts, 7);
    if (avgWorkoutsPerWeek >= 5) {
      insights.push({ text: '🏆 Excellent consistency this week!', type: 'positive' });
    } else if (avgWorkoutsPerWeek >= 3) {
      insights.push({ text: '👍 Good workout frequency', type: 'neutral' });
    } else {
      insights.push({ text: '💡 Room to grow - aim for 3+ workouts', type: 'suggestion' });
    }

    // XP progress insight
    if (userStats.xp > 50) {
      insights.push({ text: `⭐ Level ${getUserLevel()} achievement unlocked!`, type: 'positive' });
    }

    // Streak insight
    if (userStats.streak >= 7) {
      insights.push({ text: `🔥 ${userStats.streak}-day streak is amazing!`, type: 'positive' });
    }

    return insights;
  };

  // Mock mood data for demo (would be real data in production)
  const getMoodTrend = () => {
    const moods = weeklyData.mood.length > 0 ? weeklyData.mood : [3, 4, 3, 4, 4, 3, 4];
    const average = moods.reduce((a, b) => a + b, 0) / moods.length;
    const trend = moods[moods.length - 1] - moods[0];
    
    return {
      average: average.toFixed(1),
      trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
      trendIcon: trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️'
    };
  };

  // Load additional stats data
  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    try {
      // In a real app, this would load actual historical data
      // For now, we'll calculate based on current stats
      setWeeklyData({
        workouts: Math.min(userStats.totalWorkouts, 7),
        xp: Math.min(userStats.xp, 210), // Weekly cap estimate
        mood: [3, 4, 3, 4, 4, 3, 4] // Mock data
      });
    } catch (error) {
      console.error('Failed to load weekly data:', error);
    }
  };

  const renderStatCard = (title: string, value: string | number, subtitle: string, color: string, icon?: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardHeader}>
        <Text style={styles.statCardTitle}>{title}</Text>
        {icon && <Text style={styles.statCardIcon}>{icon}</Text>}
      </View>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      <Text style={styles.statCardSubtitle}>{subtitle}</Text>
    </View>
  );

  const streakStatus = getStreakStatus();
  const moodTrend = getMoodTrend();
  const insights = getWeeklyInsights();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your THRIVE journey</Text>
      </View>

      {/* Level Progress */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>Level {getUserLevel()}</Text>
          <Text style={styles.levelSubtitle}>
            {getXPToNextLevel()} XP to Level {getUserLevel() + 1}
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${getLevelProgress()}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {userStats.xp % 100}/100 XP ({getLevelProgress().toFixed(0)}%)
          </Text>
        </View>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity 
          style={[
            styles.periodButton,
            selectedPeriod === 'week' && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === 'week' && styles.periodButtonTextActive
          ]}>
            This Week
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.periodButton,
            selectedPeriod === 'month' && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === 'month' && styles.periodButtonTextActive
          ]}>
            This Month
          </Text>
        </TouchableOpacity>
      </View>

      {/* Key Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard(
          'Total XP',
          userStats.xp.toLocaleString(),
          `Level ${getUserLevel()} Achievement`,
          theme.colors.primary,
          '⭐'
        )}
        
        {renderStatCard(
          'Current Streak',
          `${userStats.streak} days`,
          streakStatus.label,
          streakStatus.color,
          '🔥'
        )}
        
        {renderStatCard(
          'Total Workouts',
          userStats.totalWorkouts.toString(),
          'Sessions completed',
          theme.colors.success,
          '💪'
        )}
        
        {renderStatCard(
          'Avg Mood',
          moodTrend.average,
          `${moodTrend.trendIcon} Trend ${moodTrend.trend}`,
          theme.colors.mood,
          '😊'
        )}
      </View>

      {/* Weekly Insights */}
      <View style={styles.insightsCard}>
        <Text style={styles.insightsTitle}>📊 Weekly Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Text style={[
              styles.insightText,
              { color: insight.type === 'positive' ? theme.colors.success :
                      insight.type === 'suggestion' ? theme.colors.warning :
                      theme.colors.text }
            ]}>
              {insight.text}
            </Text>
          </View>
        ))}
      </View>

      {/* Health Integration Placeholder */}
      <View style={styles.integrationCard}>
        <Text style={styles.integrationTitle}>🏥 Health Integration</Text>
        <Text style={styles.integrationSubtitle}>
          Ready for future Apple Health & wearable integration
        </Text>
        
        <View style={styles.integrationFeatures}>
          <Text style={styles.integrationFeature}>• Heart rate tracking</Text>
          <Text style={styles.integrationFeature}>• Steps and activity</Text>
          <Text style={styles.integrationFeature}>• Sleep quality</Text>
          <Text style={styles.integrationFeature}>• Mindfulness minutes</Text>
        </View>
        
        <TouchableOpacity style={styles.comingSoonButton}>
          <Text style={styles.comingSoonButtonText}>Coming Soon 🚀</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 cards per row with margins

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Space for bottom tabs
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  
  // Level Progress Card
  levelCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  levelHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  
  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    width: cardWidth,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statCardIcon: {
    fontSize: 16,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statCardSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 16,
  },
  
  // Insights Card
  insightsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  insightItem: {
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Integration Card
  integrationCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  integrationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  integrationSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  integrationFeatures: {
    marginBottom: 16,
  },
  integrationFeature: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  comingSoonButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  comingSoonButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
});