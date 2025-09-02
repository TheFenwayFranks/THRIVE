import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyTask, UserProgress } from './TaskGenerationService';

const STORAGE_KEYS = {
  USER_PROGRESS: '@thrive_user_progress',
  DAILY_TASKS: '@thrive_daily_tasks',
  LAST_TASK_GENERATION: '@thrive_last_task_generation',
  COMPLETED_TASKS: '@thrive_completed_tasks',
};

export class ProgressStorageService {
  
  /**
   * Get user's current progress data
   */
  static async getUserProgress(): Promise<UserProgress> {
    try {
      const progressData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      
      if (progressData) {
        return JSON.parse(progressData);
      }
      
      // Return default progress for new users
      return {
        fitnessLevel: 1,
        mentalHealthProgress: 1,
        consistencyStreak: 0,
        totalTasksCompleted: 0,
        weeklyGoalProgress: 0,
        adaptedDifficulty: 'beginner',
      };
    } catch (error) {
      console.error('Error loading user progress:', error);
      return {
        fitnessLevel: 1,
        mentalHealthProgress: 1,
        consistencyStreak: 0,
        totalTasksCompleted: 0,
        weeklyGoalProgress: 0,
        adaptedDifficulty: 'beginner',
      };
    }
  }
  
  /**
   * Save user's progress data
   */
  static async saveUserProgress(progress: UserProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
      console.log('✅ USER PROGRESS SAVED:', progress);
    } catch (error) {
      console.error('❌ Error saving user progress:', error);
    }
  }
  
  /**
   * Get today's daily tasks
   */
  static async getDailyTasks(): Promise<DailyTask[]> {
    try {
      const tasksData = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_TASKS);
      
      if (tasksData) {
        return JSON.parse(tasksData);
      }
      
      return [];
    } catch (error) {
      console.error('Error loading daily tasks:', error);
      return [];
    }
  }
  
  /**
   * Save daily tasks
   */
  static async saveDailyTasks(tasks: DailyTask[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TASKS, JSON.stringify(tasks));
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_TASK_GENERATION, new Date().toISOString());
      console.log('✅ DAILY TASKS SAVED:', tasks.length, 'tasks');
    } catch (error) {
      console.error('❌ Error saving daily tasks:', error);
    }
  }
  
  /**
   * Check if new tasks need to be generated (daily)
   */
  static async shouldGenerateNewTasks(): Promise<boolean> {
    try {
      const lastGeneration = await AsyncStorage.getItem(STORAGE_KEYS.LAST_TASK_GENERATION);
      
      if (!lastGeneration) return true;
      
      const lastDate = new Date(lastGeneration);
      const today = new Date();
      
      // Check if it's a new day
      return lastDate.toDateString() !== today.toDateString();
    } catch (error) {
      console.error('Error checking task generation date:', error);
      return true;
    }
  }
  
  /**
   * Mark a task as completed
   */
  static async markTaskCompleted(
    taskId: string, 
    performance: 'poor' | 'good' | 'excellent'
  ): Promise<void> {
    try {
      // Get current completed tasks
      const completedData = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS);
      const completed = completedData ? JSON.parse(completedData) : {};
      
      const today = new Date().toISOString().split('T')[0];
      
      if (!completed[today]) {
        completed[today] = [];
      }
      
      // Add completion record
      completed[today].push({
        taskId,
        performance,
        completedAt: new Date().toISOString(),
      });
      
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(completed));
      console.log(`✅ TASK COMPLETED: ${taskId} with ${performance} performance`);
    } catch (error) {
      console.error('❌ Error marking task completed:', error);
    }
  }
  
  /**
   * Get completion statistics
   */
  static async getCompletionStats(): Promise<{
    todayCompleted: number;
    weekCompleted: number;
    totalCompleted: number;
    currentStreak: number;
  }> {
    try {
      const completedData = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS);
      if (!completedData) {
        return { todayCompleted: 0, weekCompleted: 0, totalCompleted: 0, currentStreak: 0 };
      }
      
      const completed = JSON.parse(completedData);
      const today = new Date().toISOString().split('T')[0];
      
      // Today's completed tasks
      const todayCompleted = completed[today]?.length || 0;
      
      // Week's completed tasks
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      let weekCompleted = 0;
      
      // Total completed tasks
      let totalCompleted = 0;
      
      for (const [date, tasks] of Object.entries(completed)) {
        const taskDate = new Date(date);
        totalCompleted += (tasks as any[]).length;
        
        if (taskDate >= weekAgo) {
          weekCompleted += (tasks as any[]).length;
        }
      }
      
      // Calculate current streak
      let currentStreak = 0;
      const dates = Object.keys(completed).sort().reverse();
      
      for (const date of dates) {
        if (completed[date].length > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      return {
        todayCompleted,
        weekCompleted,
        totalCompleted,
        currentStreak,
      };
    } catch (error) {
      console.error('Error getting completion stats:', error);
      return { todayCompleted: 0, weekCompleted: 0, totalCompleted: 0, currentStreak: 0 };
    }
  }
  
  /**
   * Clear all progress data (for testing/reset)
   */
  static async clearAllProgress(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_PROGRESS),
        AsyncStorage.removeItem(STORAGE_KEYS.DAILY_TASKS),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_TASK_GENERATION),
        AsyncStorage.removeItem(STORAGE_KEYS.COMPLETED_TASKS),
      ]);
      console.log('🧹 ALL PROGRESS DATA CLEARED');
    } catch (error) {
      console.error('❌ Error clearing progress data:', error);
    }
  }
}