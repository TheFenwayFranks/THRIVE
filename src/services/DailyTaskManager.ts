import { TaskGenerationService, DailyTask, UserProgress } from './TaskGenerationService';
import { ProgressStorageService } from './ProgressStorageService';
import { StorageService } from './StorageService';
import { UserProfile } from '../components/SlideBasedProfile';

export class DailyTaskManager {
  
  /**
   * Initialize daily tasks for the user based on their profile
   */
  static async initializeDailyTasks(): Promise<DailyTask[]> {
    try {
      console.log('🎯 INITIALIZING DAILY TASKS...');
      
      // Check if we need to generate new tasks
      const shouldGenerate = await ProgressStorageService.shouldGenerateNewTasks();
      
      if (!shouldGenerate) {
        console.log('📋 Loading existing daily tasks');
        const existingTasks = await ProgressStorageService.getDailyTasks();
        if (existingTasks.length > 0) {
          return existingTasks;
        }
      }
      
      // Get user profile for task generation
      const userProfile = await StorageService.getUserProfile();
      if (!userProfile) {
        console.log('⚠️ No user profile found - cannot generate personalized tasks');
        return this.getDefaultTasks();
      }
      
      // Get user's current progress
      const userProgress = await ProgressStorageService.getUserProgress();
      console.log('📊 Current user progress:', userProgress);
      
      // Generate personalized tasks
      const newTasks = TaskGenerationService.generateDailyTasks(userProfile, userProgress);
      console.log('🎲 Generated', newTasks.length, 'personalized tasks');
      
      // Save the new tasks
      await ProgressStorageService.saveDailyTasks(newTasks);
      
      return newTasks;
    } catch (error) {
      console.error('❌ Error initializing daily tasks:', error);
      return this.getDefaultTasks();
    }
  }
  
  /**
   * Complete a task and update user progress
   */
  static async completeTask(
    taskId: string, 
    performance: 'poor' | 'good' | 'excellent' = 'good'
  ): Promise<UserProgress> {
    try {
      console.log(`✅ COMPLETING TASK: ${taskId} with ${performance} performance`);
      
      // Get current tasks and find the completed one
      const currentTasks = await ProgressStorageService.getDailyTasks();
      const completedTask = currentTasks.find(task => task.id === taskId);
      
      if (!completedTask) {
        throw new Error(`Task not found: ${taskId}`);
      }
      
      // Mark task as completed
      await ProgressStorageService.markTaskCompleted(taskId, performance);
      
      // Get current progress and update it
      const currentProgress = await ProgressStorageService.getUserProgress();
      const updatedProgress = TaskGenerationService.updateProgressAfterCompletion(
        currentProgress,
        completedTask,
        performance
      );
      
      // Save updated progress
      await ProgressStorageService.saveUserProgress(updatedProgress);
      
      console.log('📈 Progress updated:', {
        fitnessLevel: `${currentProgress.fitnessLevel} → ${updatedProgress.fitnessLevel}`,
        mentalHealth: `${currentProgress.mentalHealthProgress} → ${updatedProgress.mentalHealthProgress}`,
        streak: updatedProgress.consistencyStreak,
      });
      
      return updatedProgress;
    } catch (error) {
      console.error('❌ Error completing task:', error);
      throw error;
    }
  }
  
  /**
   * Get user's progress statistics
   */
  static async getProgressStats(): Promise<{
    progress: UserProgress;
    stats: {
      todayCompleted: number;
      weekCompleted: number;
      totalCompleted: number;
      currentStreak: number;
    };
  }> {
    try {
      const [progress, stats] = await Promise.all([
        ProgressStorageService.getUserProgress(),
        ProgressStorageService.getCompletionStats(),
      ]);
      
      return { progress, stats };
    } catch (error) {
      console.error('❌ Error getting progress stats:', error);
      return {
        progress: {
          fitnessLevel: 1,
          mentalHealthProgress: 1,
          consistencyStreak: 0,
          totalTasksCompleted: 0,
          weeklyGoalProgress: 0,
          adaptedDifficulty: 'beginner',
        },
        stats: {
          todayCompleted: 0,
          weekCompleted: 0,
          totalCompleted: 0,
          currentStreak: 0,
        },
      };
    }
  }
  
  /**
   * Reset user's progress (for testing or user request)
   */
  static async resetProgress(): Promise<void> {
    try {
      await ProgressStorageService.clearAllProgress();
      console.log('🔄 User progress reset successfully');
    } catch (error) {
      console.error('❌ Error resetting progress:', error);
      throw error;
    }
  }
  
  /**
   * Get progress level description
   */
  static getProgressLevelDescription(level: number): string {
    if (level <= 2) return 'Just getting started! Every step counts.';
    if (level <= 4) return 'Building momentum! You\\'re making progress.';
    if (level <= 6) return 'Great consistency! You\\'re developing strong habits.';
    if (level <= 8) return 'Excellent progress! You\\'re becoming stronger.';
    return 'Outstanding! You\\'re thriving at an advanced level.';
  }
  
  /**
   * Get default tasks for users without profiles
   */
  private static getDefaultTasks(): DailyTask[] {
    return [
      {
        id: 'default_fitness_1',
        title: 'Gentle Movement',
        description: 'Start with simple exercises to get your body moving',
        type: 'fitness',
        difficulty: 'beginner',
        duration: 15,
        category: 'general_fitness',
        instructions: [
          'Find a comfortable space',
          'Do 10 arm circles forward and backward',
          'Take 10 deep breaths',
          'Walk in place for 2 minutes',
          'Stretch your arms overhead'
        ],
        benefits: [
          'Gets blood flowing',
          'Improves mood',
          'Reduces stiffness'
        ],
        progression: {
          completionCount: 0,
          lastCompleted: null,
          currentLevel: 1,
          nextLevelRequirement: 3,
        },
      },
      {
        id: 'default_mental_1',
        title: 'Mindful Moments',
        description: 'Simple mindfulness practice for mental clarity',
        type: 'mental_health',
        difficulty: 'beginner',
        duration: 10,
        category: 'general_wellness',
        instructions: [
          'Sit comfortably',
          'Close your eyes gently',
          'Take 5 deep breaths',
          'Notice any thoughts without judgment',
          'Focus on the present moment'
        ],
        benefits: [
          'Reduces stress',
          'Improves focus',
          'Enhances well-being'
        ],
        progression: {
          completionCount: 0,
          lastCompleted: null,
          currentLevel: 1,
          nextLevelRequirement: 3,
        },
      },
      {
        id: 'default_mindbody_1',
        title: 'Breathing & Stretching',
        description: 'Combine gentle movement with mindful breathing',
        type: 'mind_body',
        difficulty: 'beginner',
        duration: 12,
        category: 'mind_body_integration',
        instructions: [
          'Stand with feet hip-width apart',
          'Raise arms overhead while breathing in',
          'Lower arms while breathing out',
          'Repeat 8 times slowly',
          'End with a gentle forward fold'
        ],
        benefits: [
          'Connects mind and body',
          'Improves flexibility',
          'Promotes relaxation'
        ],
        progression: {
          completionCount: 0,
          lastCompleted: null,
          currentLevel: 1,
          nextLevelRequirement: 3,
        },
      },
    ];
  }
  
  /**
   * Check if user has completed tasks today
   */
  static async hasCompletedTasksToday(): Promise<boolean> {
    try {
      const stats = await ProgressStorageService.getCompletionStats();
      return stats.todayCompleted > 0;
    } catch (error) {
      console.error('❌ Error checking today\\'s completions:', error);
      return false;
    }
  }
  
  /**
   * Get recommended next difficulty level
   */
  static getRecommendedDifficulty(progress: UserProgress): string {
    const avgLevel = (progress.fitnessLevel + progress.mentalHealthProgress) / 2;
    
    if (avgLevel >= 8) return 'Expert level - you\\'re mastering advanced techniques!';
    if (avgLevel >= 6) return 'Advanced level - ready for more challenging tasks!';
    if (avgLevel >= 4) return 'Intermediate level - building strong foundations!';
    return 'Beginner level - perfect starting point for your journey!';
  }
}