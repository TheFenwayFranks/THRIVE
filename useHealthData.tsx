/**
 * useHealthData.tsx
 * 
 * React hook for seamless health data integration
 * Provides automatic syncing, real-time updates, and easy state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import HealthDataManager, { HealthMetrics, SyncStatus } from './HealthDataManager';

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
    const initializeHealthManager = async () => {
      setIsInitializing(true);
      
      try {
        healthManagerRef.current = HealthDataManager.getInstance();
        
        // Subscribe to health data updates
        unsubscribeRef.current = healthManagerRef.current.subscribe((metrics: HealthMetrics) => {
          console.log('📊 Health data updated:', metrics);
          setHealthData(metrics);
          setIsLoading(false);
        });
        
        // Initialize the health manager
        await healthManagerRef.current.initialize();
        
        // Update sync status
        setSyncStatus(healthManagerRef.current.getSyncStatus());
        
      } catch (error) {
        console.error('❌ Failed to initialize health data:', error);
        setSyncStatus(prev => ({
          ...prev,
          error: `Initialization failed: ${error.message}`,
          isConnected: false
        }));
        
        // Show user-friendly error
        Alert.alert(
          'Health Data Setup',
          'Would you like to connect your health data for automatic tracking?',
          [
            { text: 'Skip', style: 'cancel' },
            { text: 'Connect', onPress: requestPermissions }
          ]
        );
      } finally {
        setIsInitializing(false);
        setIsLoading(false);
      }
    };

    initializeHealthManager();

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (healthManagerRef.current) {
        healthManagerRef.current.cleanup();
      }
    };
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
   * Force a manual sync of health data
   */
  const forceSync = useCallback(async (): Promise<void> => {
    if (!healthManagerRef.current) {
      throw new Error('Health manager not initialized');
    }

    try {
      setSyncStatus(prev => ({ ...prev, syncInProgress: true, error: null }));
      await healthManagerRef.current.forceSync();
      setSyncStatus(healthManagerRef.current.getSyncStatus());
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: `Sync failed: ${error.message}`
      }));
      throw error;
    }
  }, []);

  /**
   * Request health data permissions
   */
  const requestPermissions = useCallback(async (): Promise<void> => {
    if (!healthManagerRef.current) {
      throw new Error('Health manager not initialized');
    }

    try {
      setIsInitializing(true);
      const granted = await healthManagerRef.current.requestPermissions();
      setSyncStatus(healthManagerRef.current.getSyncStatus());
      
      if (granted) {
        Alert.alert(
          'Success!',
          'Health data connected successfully. Your data will now sync automatically.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Permissions Required',
          'Health data permissions are needed for automatic tracking. You can still enter data manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      Alert.alert(
        'Connection Error',
        'Failed to connect to health data. You can still use manual entry.',
        [{ text: 'OK' }]
      );
      throw error;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  /**
   * Update manual data entry
   */
  const updateManualData = useCallback((type: keyof HealthMetrics, data: any): void => {
    if (!healthManagerRef.current) {
      console.error('❌ Health manager not initialized');
      return;
    }

    try {
      healthManagerRef.current.updateManualData(type, data);
      console.log(`📝 Manual data updated for ${type}:`, data);
    } catch (error) {
      console.error(`❌ Failed to update manual data for ${type}:`, error);
    }
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