import { UserProfile } from '../components/SlideBasedProfile';

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  type: 'fitness' | 'mental_health' | 'mind_body';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  category: string;
  instructions: string[];
  benefits: string[];
  progression: {
    completionCount: number;
    lastCompleted: string | null;
    currentLevel: number;
    nextLevelRequirement: number;
  };
}

export interface UserProgress {
  fitnessLevel: number; // 1-10 scale
  mentalHealthProgress: number; // 1-10 scale
  consistencyStreak: number;
  totalTasksCompleted: number;
  weeklyGoalProgress: number;
  adaptedDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export class TaskGenerationService {
  
  /**
   * Generate personalized daily tasks based on user profile
   */
  static generateDailyTasks(profile: UserProfile, progress: UserProgress): DailyTask[] {
    const tasks: DailyTask[] = [];
    
    // Generate fitness task based on preferences and level
    const fitnessTask = this.generateFitnessTask(profile, progress);
    if (fitnessTask) tasks.push(fitnessTask);
    
    // Generate mental health task based on focus area
    const mentalHealthTask = this.generateMentalHealthTask(profile, progress);
    if (mentalHealthTask) tasks.push(mentalHealthTask);
    
    // Generate mind-body integration task
    const mindBodyTask = this.generateMindBodyTask(profile, progress);
    if (mindBodyTask) tasks.push(mindBodyTask);
    
    return tasks;
  }
  
  /**
   * Generate fitness task based on user preferences and progression
   */
  private static generateFitnessTask(profile: UserProfile, progress: UserProgress): DailyTask | null {
    const fitnessTemplates = this.getFitnessTemplates(profile, progress);
    if (!fitnessTemplates.length) return null;
    
    const template = fitnessTemplates[Math.floor(Math.random() * fitnessTemplates.length)];
    const adaptedDifficulty = this.adaptDifficultyToProgress(template.baseDifficulty, progress.fitnessLevel);
    
    return {
      id: `fitness_${Date.now()}`,
      title: template.title,
      description: template.description,
      type: 'fitness',
      difficulty: adaptedDifficulty,
      duration: this.adaptDurationToProfile(template.baseDuration, profile.availableTime),
      category: template.category,
      instructions: this.adaptInstructions(template.instructions, adaptedDifficulty, progress),
      benefits: template.benefits,
      progression: {
        completionCount: 0,
        lastCompleted: null,
        currentLevel: progress.fitnessLevel,
        nextLevelRequirement: this.calculateNextLevelRequirement(progress.fitnessLevel),
      },
    };
  }
  
  /**
   * Generate mental health task based on user focus area
   */
  private static generateMentalHealthTask(profile: UserProfile, progress: UserProgress): DailyTask | null {
    const mentalHealthTemplates = this.getMentalHealthTemplates(profile, progress);
    if (!mentalHealthTemplates.length) return null;
    
    const template = mentalHealthTemplates[Math.floor(Math.random() * mentalHealthTemplates.length)];
    const adaptedDifficulty = this.adaptDifficultyToProgress(template.baseDifficulty, progress.mentalHealthProgress);
    
    return {
      id: `mental_health_${Date.now()}`,
      title: template.title,
      description: template.description,
      type: 'mental_health',
      difficulty: adaptedDifficulty,
      duration: this.adaptDurationToProfile(template.baseDuration, profile.availableTime),
      category: template.category,
      instructions: this.adaptInstructions(template.instructions, adaptedDifficulty, progress),
      benefits: template.benefits,
      progression: {
        completionCount: 0,
        lastCompleted: null,
        currentLevel: progress.mentalHealthProgress,
        nextLevelRequirement: this.calculateNextLevelRequirement(progress.mentalHealthProgress),
      },
    };
  }
  
  /**
   * Generate mind-body integration task
   */
  private static generateMindBodyTask(profile: UserProfile, progress: UserProgress): DailyTask | null {
    const mindBodyTemplates = this.getMindBodyTemplates(profile, progress);
    if (!mindBodyTemplates.length) return null;
    
    const template = mindBodyTemplates[Math.floor(Math.random() * mindBodyTemplates.length)];
    const avgProgress = Math.floor((progress.fitnessLevel + progress.mentalHealthProgress) / 2);
    const adaptedDifficulty = this.adaptDifficultyToProgress(template.baseDifficulty, avgProgress);
    
    return {
      id: `mind_body_${Date.now()}`,
      title: template.title,
      description: template.description,
      type: 'mind_body',
      difficulty: adaptedDifficulty,
      duration: this.adaptDurationToProfile(template.baseDuration, profile.availableTime),
      category: template.category,
      instructions: this.adaptInstructions(template.instructions, adaptedDifficulty, progress),
      benefits: template.benefits,
      progression: {
        completionCount: 0,
        lastCompleted: null,
        currentLevel: avgProgress,
        nextLevelRequirement: this.calculateNextLevelRequirement(avgProgress),
      },
    };
  }
  
  /**
   * Get fitness task templates based on user preferences
   */
  private static getFitnessTemplates(profile: UserProfile, progress: UserProgress) {
    const allTemplates = [
      // Strength Training Templates
      {
        title: "Progressive Push-Up Challenge",
        description: "Build upper body strength with adaptive push-up variations",
        category: "strength",
        baseDifficulty: 'beginner' as const,
        baseDuration: 15,
        instructions: ["Warm up for 2 minutes", "Perform push-ups", "Rest 30 seconds between sets", "Cool down with stretches"],
        benefits: ["Builds chest and arm strength", "Improves core stability", "Increases endurance"],
        workoutType: 'strength'
      },
      {
        title: "Bodyweight Strength Circuit",
        description: "Full-body strength training using only your body weight",
        category: "strength",
        baseDifficulty: 'intermediate' as const,
        baseDuration: 30,
        instructions: ["5-minute warm-up", "Circuit: squats, lunges, planks", "3 rounds with 1-minute rest", "Cool down"],
        benefits: ["Total body strengthening", "Improves functional movement", "Burns calories"],
        workoutType: 'strength'
      },
      
      // Cardio Templates
      {
        title: "HIIT Burst Training",
        description: "High-intensity intervals for cardiovascular fitness",
        category: "cardio",
        baseDifficulty: 'intermediate' as const,
        baseDuration: 20,
        instructions: ["Warm up 3 minutes", "30s high intensity, 30s rest", "Repeat 8-12 times", "Cool down"],
        benefits: ["Improves heart health", "Burns calories efficiently", "Boosts metabolism"],
        workoutType: 'cardio'
      },
      {
        title: "Dance Cardio Flow",
        description: "Fun, energetic movement to get your heart pumping",
        category: "cardio",
        baseDifficulty: 'beginner' as const,
        baseDuration: 25,
        instructions: ["Start with gentle movement", "Follow rhythm patterns", "Increase intensity gradually", "End with cool moves"],
        benefits: ["Cardiovascular health", "Mood enhancement", "Coordination improvement"],
        workoutType: 'cardio'
      },
      
      // Flexibility Templates
      {
        title: "Morning Mobility Flow",
        description: "Gentle stretches to start your day with flexibility",
        category: "flexibility",
        baseDifficulty: 'beginner' as const,
        baseDuration: 15,
        instructions: ["Begin in comfortable position", "Hold each stretch 30 seconds", "Breathe deeply", "Move mindfully"],
        benefits: ["Increases flexibility", "Reduces stiffness", "Prepares body for the day"],
        workoutType: 'flexibility'
      },
      {
        title: "Deep Stretch Recovery",
        description: "Restorative stretching for muscle recovery and relaxation",
        category: "flexibility",
        baseDifficulty: 'intermediate' as const,
        baseDuration: 20,
        instructions: ["Find quiet space", "Use props if available", "Hold stretches 1-2 minutes", "Focus on breathing"],
        benefits: ["Improves recovery", "Reduces muscle tension", "Promotes relaxation"],
        workoutType: 'flexibility'
      }
    ];
    
    // Filter based on user's workout preferences
    return allTemplates.filter(template => {
      if (profile.workoutPreferences === 'mixed') return true;
      return template.workoutType === profile.workoutPreferences;
    });
  }
  
  /**
   * Get mental health task templates based on user's focus area
   */
  private static getMentalHealthTemplates(profile: UserProfile, progress: UserProgress) {
    const allTemplates = [
      // ADHD Support Templates
      {
        title: "Focus Flow Breathing",
        description: "Structured breathing exercise to improve concentration",
        category: "adhd_support",
        baseDifficulty: 'beginner' as const,
        baseDuration: 10,
        instructions: ["Sit comfortably", "Breathe in for 4 counts", "Hold for 4 counts", "Breathe out for 6 counts", "Repeat 10 times"],
        benefits: ["Improves focus", "Reduces hyperactivity", "Calms the mind"],
        focusArea: 'adhd'
      },
      {
        title: "Mindful Task Completion",
        description: "Single-tasking practice with mindful awareness",
        category: "adhd_support",
        baseDifficulty: 'intermediate' as const,
        baseDuration: 15,
        instructions: ["Choose one simple task", "Set timer", "Focus only on this task", "Notice when mind wanders", "Gently return attention"],
        benefits: ["Builds concentration", "Reduces overwhelm", "Improves task completion"],
        focusArea: 'adhd'
      },
      
      // Anxiety Relief Templates
      {
        title: "Grounding Technique Practice",
        description: "5-4-3-2-1 sensory grounding exercise for anxiety relief",
        category: "anxiety_relief",
        baseDifficulty: 'beginner' as const,
        baseDuration: 8,
        instructions: ["Name 5 things you see", "4 things you can touch", "3 things you hear", "2 things you smell", "1 thing you taste"],
        benefits: ["Reduces anxiety", "Brings awareness to present", "Calms nervous system"],
        focusArea: 'anxiety'
      },
      {
        title: "Progressive Muscle Relaxation",
        description: "Systematic muscle tension and release for deep relaxation",
        category: "anxiety_relief",
        baseDifficulty: 'intermediate' as const,
        baseDuration: 20,
        instructions: ["Lie down comfortably", "Tense each muscle group 5 seconds", "Release and relax 10 seconds", "Work from toes to head"],
        benefits: ["Reduces physical tension", "Promotes relaxation", "Improves sleep quality"],
        focusArea: 'anxiety'
      },
      
      // Depression Support Templates
      {
        title: "Gratitude Moment Practice",
        description: "Structured gratitude reflection to lift mood",
        category: "depression_support",
        baseDifficulty: 'beginner' as const,
        baseDuration: 5,
        instructions: ["Think of 3 specific things you're grateful for", "Write them down or say aloud", "Feel the positive emotion", "Carry this feeling forward"],
        benefits: ["Improves mood", "Shifts perspective", "Builds resilience"],
        focusArea: 'depression'
      },
      {
        title: "Energy Building Meditation",
        description: "Visualization practice to boost energy and motivation",
        category: "depression_support",
        baseDifficulty: 'intermediate' as const,
        baseDuration: 15,
        instructions: ["Sit or lie comfortably", "Visualize warm, golden light", "Feel it filling your body with energy", "Set positive intention for the day"],
        benefits: ["Increases energy", "Improves motivation", "Enhances mood"],
        focusArea: 'depression'
      },
      
      // General Wellness Templates
      {
        title: "Mindfulness Check-In",
        description: "Brief mindfulness practice for overall well-being",
        category: "general_wellness",
        baseDifficulty: 'beginner' as const,
        baseDuration: 10,
        instructions: ["Pause current activity", "Take 3 deep breaths", "Notice your thoughts and feelings", "Accept without judgment"],
        benefits: ["Increases self-awareness", "Reduces stress", "Improves emotional regulation"],
        focusArea: 'general'
      }
    ];
    
    // Filter based on user's mental health focus
    return allTemplates.filter(template => {
      return template.focusArea === profile.mentalHealthFocus || template.focusArea === 'general';
    });
  }
  
  /**
   * Get mind-body integration templates
   */
  private static getMindBodyTemplates(profile: UserProfile, progress: UserProgress) {
    return [
      {
        title: "Yoga Flow for Focus",
        description: "Gentle yoga sequence combining movement with mindfulness",
        category: "mind_body_integration",
        baseDifficulty: 'beginner' as const,
        baseDuration: 20,
        instructions: ["Start with breathing", "Move through gentle poses", "Hold each pose mindfully", "End in relaxation"],
        benefits: ["Connects mind and body", "Improves flexibility", "Reduces stress"],
      },
      {
        title: "Walking Meditation",
        description: "Mindful walking practice for mental clarity and physical movement",
        category: "mind_body_integration",
        baseDifficulty: 'beginner' as const,
        baseDuration: 15,
        instructions: ["Find safe walking area", "Walk slowly and deliberately", "Focus on each step", "Notice surroundings mindfully"],
        benefits: ["Combines exercise with mindfulness", "Improves mood", "Increases awareness"],
      },
      {
        title: "Breathwork with Movement",
        description: "Coordinated breathing and gentle movement exercises",
        category: "mind_body_integration",
        baseDifficulty: 'intermediate' as const,
        baseDuration: 18,
        instructions: ["Stand with feet hip-width apart", "Coordinate breath with arm movements", "Move slowly and mindfully", "Feel the connection"],
        benefits: ["Synchronizes mind and body", "Improves coordination", "Enhances focus"],
      }
    ];
  }
  
  /**
   * Adapt task difficulty based on user progress
   */
  private static adaptDifficultyToProgress(baseDifficulty: string, progressLevel: number): 'beginner' | 'intermediate' | 'advanced' {
    if (progressLevel <= 3) return 'beginner';
    if (progressLevel <= 7) return 'intermediate';
    return 'advanced';
  }
  
  /**
   * Adapt task duration to user's available time preference
   */
  private static adaptDurationToProfile(baseDuration: number, availableTime: string): number {
    const timeMultipliers = {
      '15min': 0.8,
      '30min': 1.0,
      '45min': 1.3,
      '60min_plus': 1.5
    };
    
    const multiplier = timeMultipliers[availableTime as keyof typeof timeMultipliers] || 1.0;
    return Math.round(baseDuration * multiplier);
  }
  
  /**
   * Adapt instructions based on difficulty and progress
   */
  private static adaptInstructions(baseInstructions: string[], difficulty: string, progress: UserProgress): string[] {
    const adaptedInstructions = [...baseInstructions];
    
    if (difficulty === 'advanced' && progress.consistencyStreak > 7) {
      adaptedInstructions.push("Challenge: Add extra intensity or duration");
    }
    
    if (progress.consistencyStreak < 3) {
      adaptedInstructions.unshift("Take it easy - focus on completion over intensity");
    }
    
    return adaptedInstructions;
  }
  
  /**
   * Calculate requirement for next progression level
   */
  private static calculateNextLevelRequirement(currentLevel: number): number {
    return Math.max(1, Math.floor(currentLevel * 1.5));
  }
  
  /**
   * Update user progress after task completion
   */
  static updateProgressAfterCompletion(
    currentProgress: UserProgress, 
    completedTask: DailyTask, 
    performance: 'poor' | 'good' | 'excellent'
  ): UserProgress {
    const progressIncrease = performance === 'excellent' ? 0.3 : performance === 'good' ? 0.2 : 0.1;
    
    const updatedProgress = { ...currentProgress };
    updatedProgress.totalTasksCompleted += 1;
    updatedProgress.consistencyStreak += 1;
    
    // Update specific progress based on task type
    switch (completedTask.type) {
      case 'fitness':
        updatedProgress.fitnessLevel = Math.min(10, updatedProgress.fitnessLevel + progressIncrease);
        break;
      case 'mental_health':
        updatedProgress.mentalHealthProgress = Math.min(10, updatedProgress.mentalHealthProgress + progressIncrease);
        break;
      case 'mind_body':
        updatedProgress.fitnessLevel = Math.min(10, updatedProgress.fitnessLevel + progressIncrease / 2);
        updatedProgress.mentalHealthProgress = Math.min(10, updatedProgress.mentalHealthProgress + progressIncrease / 2);
        break;
    }
    
    // Update adapted difficulty
    const avgProgress = (updatedProgress.fitnessLevel + updatedProgress.mentalHealthProgress) / 2;
    if (avgProgress >= 8) {
      updatedProgress.adaptedDifficulty = 'expert';
    } else if (avgProgress >= 6) {
      updatedProgress.adaptedDifficulty = 'advanced';
    } else if (avgProgress >= 4) {
      updatedProgress.adaptedDifficulty = 'intermediate';
    } else {
      updatedProgress.adaptedDifficulty = 'beginner';
    }
    
    return updatedProgress;
  }
  
  /**
   * Reset streak if user misses a day
   */
  static resetStreakIfMissed(lastCompletionDate: string, currentProgress: UserProgress): UserProgress {
    const lastDate = new Date(lastCompletionDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
      return {
        ...currentProgress,
        consistencyStreak: 0
      };
    }
    
    return currentProgress;
  }
}