/**
 * useHealthData.tsx
 * 
 * React hook for seamless health data integration
 * Provides automatic syncing, real-time updates, and easy state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
// Temporarily commented out for web compatibility - will work on mobile
// import HealthDataManager, { HealthMetrics, SyncStatus } from './HealthDataManager';

// Mock types for web compatibility
export interface HealthMetrics {
  steps: { current: number; goal: number; trend: string; lastUpdated: Date; source: string };
  calories: { burned: number; consumed: number; goal: number; net: number; trend: string; lastUpdated: Date; source: string };
  heartRate: { current: number; resting: number; max: number; average: number; zones: any; lastUpdated: Date; source: string };
  distance: { current: number; goal: number; trend: string; lastUpdated: Date; source: string };
  activeMinutes: { current: number; goal: number; intensity: string; trend: string; lastUpdated: Date; source: string };
  workouts: { todayCount: number; weekCount: number; totalDuration: number; lastWorkout: any; trend: string; lastUpdated: Date; source: string };
  weight: { current: number; goal: number; trend: string; progress: number; bmi: number; lastUpdated: Date; source: string };
  sleep: { duration: number; quality: number; deep: number; rem: number; bedtime: Date; wakeTime: Date; trend: string; lastUpdated: Date; source: string };
  bloodPressure: { systolic: number; diastolic: number; category: string; lastUpdated: Date; source: string };
  mindfulness: { current: number; goal: number; sessions: number; trend: string; progress: number; lastUpdated: Date; source: string };
  mood: { current: number; average: number; trend: string; progress: number; lastUpdated: Date; source: string };
}

export interface SyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  syncInProgress: boolean;
  error: string | null;
  sources: any;
  permissions: any;
}

export interface UseHealthDataReturn {
  // Health Data
  healthData: HealthMetrics | null;
  syncStatus: SyncStatus;
  
  // Loading States
  isLoading: boolean;
  isInitializing: boolean;
  isSyncing: boolean;
  
  // Actions
  forceSync: () => Promise<void>;
  requestPermissions: () => Promise<void>;
  updateManualData: (type: keyof HealthMetrics, data: any) => void;
  
  // Status
  isConnected: boolean;
  lastSync: Date | null;
  error: string | null;
}

/**
 * Custom hook for health data management
 */
export const useHealthData = (): UseHealthDataReturn => {
  const [healthData, setHealthData] = useState<HealthMetrics | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    lastSync: null,
    syncInProgress: false,
    error: null,
    sources: {
      appleHealth: false,
      googleHealth: false,
      samsungHealth: false,
      appleWatch: false,
      galaxyWatch: false,
      fitbit: false,
      garmin: false,
    },
    permissions: {
      granted: false,
      requested: [],
      denied: []
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const healthManagerRef = useRef<HealthDataManager | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize health manager
  useEffect(() => {
    // Mock health data for web demo - will use real data on mobile
    const mockHealthData: HealthMetrics = {
      steps: { current: 8752, goal: 10000, trend: 'up', lastUpdated: new Date(), source: 'Mock Data' },
      calories: { burned: 420, consumed: 1800, goal: 2000, net: 1380, trend: 'up', lastUpdated: new Date(), source: 'Mock Data' },
      heartRate: { current: 72, resting: 65, max: 185, average: 75, zones: {}, lastUpdated: new Date(), source: 'Mock Data' },
      distance: { current: 3.2, goal: 5, trend: 'up', lastUpdated: new Date(), source: 'Mock Data' },
      activeMinutes: { current: 45, goal: 150, intensity: 'moderate', trend: 'up', lastUpdated: new Date(), source: 'Mock Data' },
      workouts: { todayCount: 1, weekCount: 4, totalDuration: 35, lastWorkout: null, trend: 'up', lastUpdated: new Date(), source: 'Mock Data' },
      weight: { current: 165, goal: 160, trend: 'down', progress: 75, bmi: 23.5, lastUpdated: new Date(), source: 'Mock Data' },
      sleep: { duration: 7.3, quality: 85, deep: 2.1, rem: 1.8, bedtime: new Date(), wakeTime: new Date(), trend: 'up', lastUpdated: new Date(), source: 'Mock Data' },
      bloodPressure: { systolic: 120, diastolic: 80, category: 'normal', lastUpdated: new Date(), source: 'Mock Data' },
      mindfulness: { current: 18, goal: 20, sessions: 1, trend: 'up', progress: 90, lastUpdated: new Date(), source: 'Mock Data' },
      mood: { current: 7.8, average: 7.5, trend: 'up', progress: 78, lastUpdated: new Date(), source: 'Mock Data' }
    };

    setTimeout(() => {
      setHealthData(mockHealthData);
      setSyncStatus({
        isConnected: false, // Mock as not connected for demo
        lastSync: new Date(),
        syncInProgress: false,
        error: null,
        sources: {
          appleHealth: false,
          googleHealth: false,
          samsungHealth: false,
          appleWatch: false,
          galaxyWatch: false,
          fitbit: false,
          garmin: false,
        },
        permissions: {
          granted: false,
          requested: [],
          denied: []
        }
      });
      setIsLoading(false);
      setIsInitializing(false);
    }, 1000); // Simulate loading
  }, []);

  // Update sync status periodically
  useEffect(() => {
    const updateSyncStatus = () => {
      if (healthManagerRef.current) {
        setSyncStatus(healthManagerRef.current.getSyncStatus());
      }
    };

    // Update every 10 seconds
    const interval = setInterval(updateSyncStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Force a manual sync of health data (mocked for web)
   */
  const forceSync = useCallback(async (): Promise<void> => {
    console.log('🔄 Mock sync triggered');
    setSyncStatus(prev => ({ ...prev, syncInProgress: true, error: null }));
    
    // Simulate sync delay
    setTimeout(() => {
      setSyncStatus(prev => ({ 
        ...prev, 
        syncInProgress: false, 
        lastSync: new Date(),
        error: null 
      }));
    }, 1000);
  }, []);

  /**
   * Request health data permissions (mocked for web)
   */
  const requestPermissions = useCallback(async (): Promise<void> => {
    console.log('🔒 Mock permission request');
    setIsInitializing(true);
    
    // Simulate permission flow
    setTimeout(() => {
      Alert.alert(
        'Health Data Demo',
        'This is a demo with mock health data. On mobile devices, this would connect to Apple Health, Google Health, etc.',
        [{ text: 'OK' }]
      );
      setIsInitializing(false);
    }, 1000);
  }, []);

  /**
   * Update manual data entry (mocked for web)
   */
  const updateManualData = useCallback((type: keyof HealthMetrics, data: any): void => {
    console.log(`📝 Mock manual data updated for ${type}:`, data);
    
    // Update the mock health data
    setHealthData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [type]: {
          ...prev[type],
          ...data,
          lastUpdated: new Date(),
          source: 'Manual Entry'
        }
      };
    });
  }, []);

  return {
    // Health Data
    healthData,
    syncStatus,
    
    // Loading States
    isLoading,
    isInitializing,
    isSyncing: syncStatus.syncInProgress,
    
    // Actions
    forceSync,
    requestPermissions,
    updateManualData,
    
    // Status
    isConnected: syncStatus.isConnected,
    lastSync: syncStatus.lastSync,
    error: syncStatus.error,
  };
};

/**
 * Helper hook for specific metric types
 */
export const useHealthMetric = (metricType: keyof HealthMetrics) => {
  const { healthData, updateManualData, ...rest } = useHealthData();
  
  const metric = healthData?.[metricType] || null;
  
  const updateMetric = useCallback((data: any) => {
    updateManualData(metricType, data);
  }, [metricType, updateManualData]);
  
  return {
    ...rest,
    metric,
    updateMetric,
    hasData: metric !== null,
    isManualEntry: metric?.source === 'Manual Entry'
  };
};

/**
 * Hook for fitness-specific metrics
 */
export const useFitnessData = () => {
  const { healthData, ...rest } = useHealthData();
  
  const fitnessData = healthData ? {
    steps: healthData.steps,
    calories: healthData.calories,
    heartRate: healthData.heartRate,
    distance: healthData.distance,
    activeMinutes: healthData.activeMinutes,
    workouts: healthData.workouts,
    weight: healthData.weight,
  } : null;
  
  return {
    ...rest,
    fitnessData,
    hasFitnessData: fitnessData !== null
  };
};

/**
 * Hook for health-specific metrics
 */
export const useHealthMetrics = () => {
  const { healthData, ...rest } = useHealthData();
  
  const healthMetrics = healthData ? {
    weight: healthData.weight,
    sleep: healthData.sleep,
    bloodPressure: healthData.bloodPressure,
    heartRate: healthData.heartRate,
  } : null;
  
  return {
    ...rest,
    healthMetrics,
    hasHealthData: healthMetrics !== null
  };
};

/**
 * Hook for mental health metrics
 */
export const useMentalHealthData = () => {
  const { healthData, ...rest } = useHealthData();
  
  const mentalHealthData = healthData ? {
    mindfulness: healthData.mindfulness,
    mood: healthData.mood,
  } : null;
  
  return {
    ...rest,
    mentalHealthData,
    hasMentalHealthData: mentalHealthData !== null
  };
};

export default useHealthData;