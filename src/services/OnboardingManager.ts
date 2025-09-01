/**
 * EMERGENCY ONBOARDING MANAGER
 * Single source of truth for all onboarding state
 * Clears all conflicting storage and provides clean state management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './StorageService';

export interface OnboardingState {
  isFirstTime: boolean;
  showOnboarding: boolean;
  onboardingType: 'web' | 'none';
  hasCompletedOnboarding: boolean;
  debugInfo: {
    clearedKeys: string[];
    timestamp: string;
    conflicts: string[];
  };
}

export class OnboardingManager {
  private static readonly ONBOARDING_KEY = '@thrive_onboarding_manager_v2';
  
  // ALL possible conflicting storage keys
  private static readonly CONFLICTING_KEYS = [
    '@thrive_user_profile',
    '@thrive_onboarding_complete',
    '@thrive_first_time_user', 
    '@thrive_morning_flow_date',
    '@thrive_morning_flow_complete',
    '@thrive_has_seen_onboarding',
    '@thrive_onboarding_data',
    '@thrive_user_goals',
    '@thrive_user_pathway',
    '@thrive_walkthrough_complete',
  ];

  /**
   * NUCLEAR OPTION: Clear ALL onboarding-related storage
   */
  static async clearAllOnboardingData(): Promise<string[]> {
    console.log('🚨 EMERGENCY CLEAR: Removing all onboarding storage keys');
    
    const clearedKeys: string[] = [];
    
    try {
      // Clear all known conflicting keys
      for (const key of this.CONFLICTING_KEYS) {
        try {
          await AsyncStorage.removeItem(key);
          clearedKeys.push(key);
          console.log(`✅ CLEARED: ${key}`);
        } catch (error) {
          console.log(`⚠️ Could not clear ${key}:`, error);
        }
      }
      
      // Clear any additional keys that might exist
      const allKeys = await AsyncStorage.getAllKeys();
      const onboardingRelatedKeys = allKeys.filter(key => 
        key.includes('onboarding') || 
        key.includes('morning') || 
        key.includes('flow') || 
        key.includes('walkthrough') ||
        key.includes('first_time')
      );
      
      for (const key of onboardingRelatedKeys) {
        if (!this.CONFLICTING_KEYS.includes(key)) {
          try {
            await AsyncStorage.removeItem(key);
            clearedKeys.push(key);
            console.log(`✅ ADDITIONAL CLEAR: ${key}`);
          } catch (error) {
            console.log(`⚠️ Could not clear additional key ${key}:`, error);
          }
        }
      }
      
      console.log(`🧹 EMERGENCY CLEAR COMPLETE: Removed ${clearedKeys.length} keys`);
      return clearedKeys;
      
    } catch (error) {
      console.error('❌ EMERGENCY CLEAR ERROR:', error);
      return clearedKeys;
    }
  }

  /**
   * Initialize clean onboarding state
   */
  static async initializeCleanState(): Promise<OnboardingState> {
    console.log('🔄 ONBOARDING MANAGER: Initializing clean state');
    
    // First, clear all conflicting data
    const clearedKeys = await this.clearAllOnboardingData();
    
    // Create fresh state
    const cleanState: OnboardingState = {
      isFirstTime: true,
      showOnboarding: true,
      onboardingType: 'web', // Force use of new web onboarding
      hasCompletedOnboarding: false,
      debugInfo: {
        clearedKeys,
        timestamp: new Date().toISOString(),
        conflicts: this.CONFLICTING_KEYS
      }
    };
    
    // Save the clean state
    try {
      await AsyncStorage.setItem(this.ONBOARDING_KEY, JSON.stringify(cleanState));
      console.log('✅ CLEAN STATE SAVED:', cleanState);
    } catch (error) {
      console.error('❌ Failed to save clean state:', error);
    }
    
    return cleanState;
  }

  /**
   * Get current onboarding state (or initialize if doesn't exist)
   */
  static async getOnboardingState(): Promise<OnboardingState> {
    try {
      const saved = await AsyncStorage.getItem(this.ONBOARDING_KEY);
      
      if (saved) {
        const state = JSON.parse(saved) as OnboardingState;
        console.log('📋 LOADED ONBOARDING STATE:', state);
        return state;
      }
    } catch (error) {
      console.log('⚠️ Could not load onboarding state:', error);
    }
    
    // No saved state or error - initialize clean
    return await this.initializeCleanState();
  }

  /**
   * Update onboarding state
   */
  static async updateOnboardingState(updates: Partial<OnboardingState>): Promise<OnboardingState> {
    const currentState = await this.getOnboardingState();
    const newState: OnboardingState = {
      ...currentState,
      ...updates,
      debugInfo: {
        ...currentState.debugInfo,
        timestamp: new Date().toISOString()
      }
    };
    
    try {
      await AsyncStorage.setItem(this.ONBOARDING_KEY, JSON.stringify(newState));
      console.log('📝 ONBOARDING STATE UPDATED:', newState);
    } catch (error) {
      console.error('❌ Failed to update onboarding state:', error);
    }
    
    return newState;
  }

  /**
   * Mark onboarding as completed
   */
  static async completeOnboarding(userProfile: any): Promise<OnboardingState> {
    console.log('🎉 COMPLETING ONBOARDING:', userProfile);
    
    // Save user profile using the existing service
    try {
      await StorageService.saveUserProfile(userProfile);
      console.log('✅ User profile saved via StorageService');
    } catch (error) {
      console.error('❌ Failed to save user profile:', error);
    }
    
    // Update onboarding state
    return await this.updateOnboardingState({
      isFirstTime: false,
      showOnboarding: false,
      hasCompletedOnboarding: true
    });
  }

  /**
   * Force reset to onboarding (for debugging)
   */
  static async resetToOnboarding(): Promise<OnboardingState> {
    console.log('🔄 FORCE RESET: Returning to onboarding');
    
    // Clear all data and start fresh
    return await this.initializeCleanState();
  }

  /**
   * Debug function to check for conflicts
   */
  static async debugConflicts(): Promise<{
    foundKeys: string[];
    conflictingKeys: string[];
    recommendations: string[];
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const conflictingKeys = allKeys.filter(key => 
        this.CONFLICTING_KEYS.includes(key) ||
        key.includes('onboarding') ||
        key.includes('morning') ||
        key.includes('flow')
      );
      
      const recommendations: string[] = [];
      
      if (conflictingKeys.length > 1) {
        recommendations.push('Multiple onboarding keys found - call clearAllOnboardingData()');
      }
      
      if (conflictingKeys.includes('@thrive_morning_flow_date')) {
        recommendations.push('Morning flow is active - disable in app logic');
      }
      
      return {
        foundKeys: allKeys,
        conflictingKeys,
        recommendations
      };
    } catch (error) {
      console.error('❌ Debug conflicts error:', error);
      return {
        foundKeys: [],
        conflictingKeys: [],
        recommendations: ['Error checking conflicts']
      };
    }
  }
}