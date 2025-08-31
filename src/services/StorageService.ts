import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserStats {
  xp: number;
  currentStreak: number;
  dailyTasksCompleted: number;
  totalWorkouts: number;
  lastWorkoutDate: string | null;
}

interface ProgressData {
  dailyWorkoutStreak: number;
  lastWorkoutDate: string | null;
  streakBroken: boolean;
  weeklyWorkouts: number;
  currentWeekStart: string | null;
  weeklyGoal: number;
  totalWorkouts: number;
  totalSessions: number;
  dailyTasksCompleted: number;
  dailyGoal: number;
  todayDate: string | null;
}

interface MoodEntry {
  id: string;
  mood: number; // 1-5 scale
  workoutSessionId?: string;
  timestamp: string;
  notes?: string;
}

interface AppSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  notificationsEnabled: boolean;
  difficulty: string;
  lastMorningFlow: string | null;
  selectedWeatherMood: string | null;
  themeMode?: 'light' | 'dark' | 'system';
}

export class StorageService {
  private static readonly KEYS = {
    USER_STATS: '@thrive_user_stats',
    PROGRESS_DATA: '@thrive_progress_data', 
    MOOD_ENTRIES: '@thrive_mood_entries',
    MORNING_FLOW_DATE: '@thrive_morning_flow_date',
    SETTINGS: '@thrive_settings',
    WORKOUT_HISTORY: '@thrive_workout_history',
    COMPLETED_WORKOUTS: '@thrive_completed_workouts'
  };

  static async initialize(): Promise<void> {
    try {
      // Initialize default data if not exists
      const userStats = await this.getUserStats();
      if (!userStats) {
        await this.saveUserStats({
          xp: 0,
          currentStreak: 0,
          dailyTasksCompleted: 0,
          totalWorkouts: 0,
          lastWorkoutDate: null
        });
      }

      const progressData = await this.getProgressData();
      if (!progressData) {
        await this.saveProgressData({
          dailyWorkoutStreak: 0,
          lastWorkoutDate: null,
          streakBroken: false,
          weeklyWorkouts: 0,
          currentWeekStart: null,
          weeklyGoal: 3,
          totalWorkouts: 0,
          totalSessions: 0,
          dailyTasksCompleted: 0,
          dailyGoal: 3,
          todayDate: null
        });
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  // User Stats Management
  static async getUserStats(): Promise<UserStats | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USER_STATS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return null;
    }
  }

  static async saveUserStats(stats: UserStats): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.USER_STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save user stats:', error);
    }
  }

  // Progress Data Management
  static async getProgressData(): Promise<ProgressData | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.PROGRESS_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get progress data:', error);
      return null;
    }
  }

  static async saveProgressData(progress: ProgressData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.PROGRESS_DATA, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress data:', error);
    }
  }

  // Mood Tracking Management
  static async getMoodEntries(): Promise<MoodEntry[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.MOOD_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get mood entries:', error);
      return [];
    }
  }

  static async saveMoodEntry(entry: MoodEntry): Promise<void> {
    try {
      const entries = await this.getMoodEntries();
      entries.push(entry);
      await AsyncStorage.setItem(this.KEYS.MOOD_ENTRIES, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save mood entry:', error);
    }
  }

  static async addMoodEntry(entry: MoodEntry): Promise<void> {
    return this.saveMoodEntry(entry);
  }

  // Morning Flow Management
  static async getMorningFlowDate(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.KEYS.MORNING_FLOW_DATE);
    } catch (error) {
      console.error('Failed to get morning flow date:', error);
      return null;
    }
  }

  static async setMorningFlowDate(date: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.MORNING_FLOW_DATE, date);
    } catch (error) {
      console.error('Failed to set morning flow date:', error);
    }
  }

  // Settings Management
  static async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        soundEnabled: true,
        hapticEnabled: true,
        notificationsEnabled: true,
        difficulty: 'gentle',
        lastMorningFlow: null,
        selectedWeatherMood: null,
        themeMode: 'system'
      };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {
        soundEnabled: true,
        hapticEnabled: true,
        notificationsEnabled: true,
        difficulty: 'gentle',
        lastMorningFlow: null,
        selectedWeatherMood: null,
        themeMode: 'system'
      };
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // Workout History Management
  static async getWorkoutHistory(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.WORKOUT_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get workout history:', error);
      return [];
    }
  }

  static async saveWorkoutSession(session: any): Promise<void> {
    try {
      const history = await this.getWorkoutHistory();
      history.push({
        ...session,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      });
      await AsyncStorage.setItem(this.KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save workout session:', error);
    }
  }

  // Utility Methods
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(this.KEYS));
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  // Completed Workouts Management
  static async getCompletedWorkouts(): Promise<number[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.COMPLETED_WORKOUTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get completed workouts:', error);
      return [];
    }
  }

  static async saveCompletedWorkouts(completedWorkouts: number[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.COMPLETED_WORKOUTS, JSON.stringify(completedWorkouts));
    } catch (error) {
      console.error('Failed to save completed workouts:', error);
    }
  }

  static async addCompletedWorkout(workoutId: number): Promise<void> {
    try {
      const completedWorkouts = await this.getCompletedWorkouts();
      if (!completedWorkouts.includes(workoutId)) {
        completedWorkouts.push(workoutId);
        await this.saveCompletedWorkouts(completedWorkouts);
      }
    } catch (error) {
      console.error('Failed to add completed workout:', error);
    }
  }

  static async exportData(): Promise<string> {
    try {
      const allData: any = {};
      for (const [key, storageKey] of Object.entries(this.KEYS)) {
        const data = await AsyncStorage.getItem(storageKey);
        if (data) {
          allData[key] = JSON.parse(data);
        }
      }
      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '{}';
    }
  }
}

export type { UserStats, ProgressData, MoodEntry, AppSettings };