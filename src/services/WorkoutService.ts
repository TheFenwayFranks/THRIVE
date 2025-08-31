// THRIVE Workout Service - Converts Phase 1 workout data to React Native

interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
  instructions?: string;
  type: 'timer' | 'guided';
}

interface Workout {
  id: string;
  name: string;
  difficulty: 'gentle' | 'steady' | 'beast';
  duration: number; // in minutes
  description: string;
  icon: string;
  exercises: Exercise[];
  category: string;
}

export class WorkoutService {
  // THRIVE Phase 1 Workout Data - Converted from original web app
  private static readonly WORKOUTS: Workout[] = [
    // GENTLE WORKOUTS (2-8 minutes)
    {
      id: 'gentle_breathing_basic',
      name: '4-7-8 Breathing',
      difficulty: 'gentle',
      duration: 3,
      description: 'Calming breathing exercise perfect for anxiety and overwhelm',
      icon: 'leaf-outline',
      category: 'breathing',
      exercises: [
        {
          id: 'breathing_478',
          name: '4-7-8 Breathing Pattern',
          duration: 180, // 3 minutes
          type: 'timer',
          instructions: 'Inhale for 4 counts, hold for 7, exhale for 8. Let your nervous system calm down naturally.'
        }
      ]
    },
    {
      id: 'gentle_stretching_bed',
      name: 'Bed Stretches',
      difficulty: 'gentle',
      duration: 5,
      description: 'Gentle stretches you can do from bed - perfect for low energy days',
      icon: 'bed-outline',
      category: 'stretching',
      exercises: [
        {
          id: 'neck_rolls',
          name: 'Gentle Neck Rolls',
          duration: 60,
          type: 'timer',
          instructions: 'Slowly roll your neck in circles. Feel the tension melt away.'
        },
        {
          id: 'shoulder_shrugs',
          name: 'Shoulder Shrugs',
          duration: 60,
          type: 'timer',
          instructions: 'Lift shoulders to ears, hold, release. Let go of stress.'
        },
        {
          id: 'gentle_twists',
          name: 'Spinal Twists',
          duration: 120,
          type: 'timer',
          instructions: 'Gentle twists while lying down. One side at a time.'
        },
        {
          id: 'ankle_circles',
          name: 'Ankle Circles',
          duration: 60,
          type: 'timer',
          instructions: 'Circle your ankles. Wake up your circulation gently.'
        }
      ]
    },
    {
      id: 'gentle_mindful_movement',
      name: 'Mindful Movement',
      difficulty: 'gentle',
      duration: 6,
      description: 'Slow, intentional movements to reconnect with your body',
      icon: 'heart-outline',
      category: 'mindfulness',
      exercises: [
        {
          id: 'body_scan',
          name: 'Body Scan',
          duration: 120,
          type: 'timer',
          instructions: 'Start at your toes. Notice each part of your body with kindness.'
        },
        {
          id: 'gentle_arm_raises',
          name: 'Arm Raises',
          duration: 90,
          type: 'timer',
          instructions: 'Slowly raise and lower your arms. Feel the space around you.'
        },
        {
          id: 'seated_cat_cow',
          name: 'Seated Cat-Cow',
          duration: 90,
          type: 'timer',
          instructions: 'Arch and round your spine gently. Follow your breath.'
        },
        {
          id: 'gratitude_moment',
          name: 'Gratitude Pause',
          duration: 60,
          type: 'timer',
          instructions: 'Name three things you\'re grateful for right now.'
        }
      ]
    },

    // STEADY WORKOUTS (10-15 minutes)
    {
      id: 'steady_morning_flow',
      name: 'Morning Energy Flow',
      difficulty: 'steady',
      duration: 12,
      description: 'Wake up your body and mind with gentle movement',
      icon: 'sunny-outline',
      category: 'flow',
      exercises: [
        {
          id: 'morning_stretch',
          name: 'Full Body Stretch',
          duration: 180,
          type: 'timer',
          instructions: 'Reach up high, side to side, forward and back. Greet your body.'
        },
        {
          id: 'gentle_cardio',
          name: 'Light Movement',
          duration: 300,
          type: 'timer',
          instructions: 'March in place, gentle arm circles, whatever feels good.'
        },
        {
          id: 'balance_practice',
          name: 'Balance & Focus',
          duration: 180,
          type: 'timer',
          instructions: 'Stand on one foot, then the other. Find your center.'
        },
        {
          id: 'intention_setting',
          name: 'Set Daily Intention',
          duration: 57,
          type: 'timer',
          instructions: 'Choose one word for today. Let it guide your actions.'
        }
      ]
    },
    {
      id: 'steady_stress_release',
      name: 'Stress Release Flow',
      difficulty: 'steady',
      duration: 15,
      description: 'Release tension and reset your nervous system',
      icon: 'refresh-outline',
      category: 'stress-relief',
      exercises: [
        {
          id: 'tension_release',
          name: 'Progressive Muscle Relaxation',
          duration: 240,
          type: 'timer',
          instructions: 'Tense each muscle group for 5 seconds, then release completely.'
        },
        {
          id: 'shaking_movement',
          name: 'Shake It Out',
          duration: 120,
          type: 'timer',
          instructions: 'Shake your hands, arms, whole body. Release stuck energy.'
        },
        {
          id: 'breathing_square',
          name: 'Box Breathing',
          duration: 180,
          type: 'timer',
          instructions: 'Inhale 4, hold 4, exhale 4, hold 4. Find your rhythm.'
        },
        {
          id: 'gentle_yoga_flow',
          name: 'Simple Yoga Flow',
          duration: 300,
          type: 'timer',
          instructions: 'Child\'s pose to table top to downward dog. Move slowly.'
        },
        {
          id: 'final_rest',
          name: 'Rest & Integration',
          duration: 60,
          type: 'timer',
          instructions: 'Lie down and feel the effects of movement in your body.'
        }
      ]
    },

    // BEAST MODE WORKOUTS (20-25 minutes)
    {
      id: 'beast_hiit_energy',
      name: 'Energy Burst HIIT',
      difficulty: 'beast',
      duration: 20,
      description: 'High-intensity intervals to boost mood and energy',
      icon: 'flash-outline',
      category: 'hiit',
      exercises: [
        {
          id: 'warmup_dynamic',
          name: 'Dynamic Warm-up',
          duration: 300,
          type: 'timer',
          instructions: 'Arm circles, leg swings, gentle movement to prep your body.'
        },
        {
          id: 'hiit_round1',
          name: 'HIIT Round 1',
          duration: 240,
          type: 'timer',
          instructions: '30 seconds work, 30 seconds rest. Jumping jacks, squats, push-ups.'
        },
        {
          id: 'active_recovery1',
          name: 'Active Recovery',
          duration: 120,
          type: 'timer',
          instructions: 'Walk in place, gentle stretches, catch your breath.'
        },
        {
          id: 'hiit_round2',
          name: 'HIIT Round 2',
          duration: 240,
          type: 'timer',
          instructions: '30 seconds work, 30 seconds rest. Burpees, mountain climbers, planks.'
        },
        {
          id: 'active_recovery2',
          name: 'Active Recovery',
          duration: 120,
          type: 'timer',
          instructions: 'Deep breaths, gentle movement, prepare for final round.'
        },
        {
          id: 'hiit_round3',
          name: 'HIIT Round 3',
          duration: 240,
          type: 'timer',
          instructions: '30 seconds work, 30 seconds rest. High knees, butt kicks, jump squats.'
        },
        {
          id: 'cooldown_stretch',
          name: 'Cool-down Stretch',
          duration: 330,
          type: 'timer',
          instructions: 'Full body stretches, deep breathing, celebrate your effort!'
        }
      ]
    },
    {
      id: 'beast_strength_power',
      name: 'Strength & Power',
      difficulty: 'beast',
      duration: 25,
      description: 'Build strength and feel powerful in your body',
      icon: 'fitness-outline',
      category: 'strength',
      exercises: [
        {
          id: 'strength_warmup',
          name: 'Activation Warm-up',
          duration: 300,
          type: 'timer',
          instructions: 'Activate your muscles with gentle movements and stretches.'
        },
        {
          id: 'upper_body_strength',
          name: 'Upper Body Power',
          duration: 360,
          type: 'timer',
          instructions: 'Push-ups (modified if needed), arm circles, tricep dips.'
        },
        {
          id: 'lower_body_strength',
          name: 'Lower Body Power',
          duration: 360,
          type: 'timer',
          instructions: 'Squats, lunges, calf raises. Feel your legs getting stronger.'
        },
        {
          id: 'core_strength',
          name: 'Core Power',
          duration: 300,
          type: 'timer',
          instructions: 'Planks, crunches, Russian twists. Engage your center.'
        },
        {
          id: 'power_cardio',
          name: 'Power Cardio',
          duration: 240,
          type: 'timer',
          instructions: 'Jumping jacks, high knees, celebrate your strength!'
        },
        {
          id: 'strength_recovery',
          name: 'Recovery & Stretch',
          duration: 240,
          type: 'timer',
          instructions: 'Cool down with stretches, deep breathing, acknowledge your power.'
        }
      ]
    }
  ];

  static async getWorkoutsByDifficulty(difficulty: 'gentle' | 'steady' | 'beast'): Promise<Workout[]> {
    return this.WORKOUTS.filter(workout => workout.difficulty === difficulty);
  }

  static async getWorkoutById(id: string): Promise<Workout | null> {
    return this.WORKOUTS.find(workout => workout.id === id) || null;
  }

  static async getAllWorkouts(): Promise<Workout[]> {
    return this.WORKOUTS;
  }

  static async getWorkoutsByCategory(category: string): Promise<Workout[]> {
    return this.WORKOUTS.filter(workout => workout.category === category);
  }

  // Get difficulty-specific motivational messages
  static getDifficultyMessage(difficulty: 'gentle' | 'steady' | 'beast'): string {
    const messages = {
      gentle: "Your ADHD brain is perfect for gentle movement. Low energy? No problem! 🌱",
      steady: "Steady wins the race! Your body and mind are ready to THRIVE 🌊", 
      beast: "Beast mode activated! Time to show your depression who's boss! 🔥"
    };
    return messages[difficulty];
  }

  // Calculate XP rewards based on difficulty and duration
  static calculateXPReward(difficulty: 'gentle' | 'steady' | 'beast', duration: number): number {
    const baseXP = {
      gentle: 10,
      steady: 20,
      beast: 30
    };
    
    // Bonus XP for longer workouts
    const durationBonus = Math.floor(duration / 5) * 2;
    
    return baseXP[difficulty] + durationBonus;
  }
}

export type { Workout, Exercise };