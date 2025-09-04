/**
 * HealthDataManager.tsx
 * 
 * Comprehensive health data synchronization system for Thrive Swipe App
 * Integrates with Apple Health, Google Health Connect, Samsung Health, and wearable devices
 * Provides unified data interface and real-time syncing capabilities
 */

import React, { useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
// Temporarily commented out for web compatibility
// import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';
// import { GoogleFit, Scopes } from 'react-native-google-fit';

// Health Data Types Interface
export interface HealthMetrics {
  // Fitness Metrics
  steps: {
    current: number;
    goal: number;
    trend: 'up' | 'down' | 'neutral';
    lastUpdated: Date;
    source: string;
  };
  calories: {
    burned: number;
    consumed: number;
    goal: number;
    net: number;
    trend: 'up' | 'down' | 'neutral';
    lastUpdated: Date;
    source: string;
  };
  heartRate: {
    current: number;
    resting: number;
    max: number;
    average: number;
    zones: {
      fat_burn: number;
      cardio: number;
      peak: number;
    };
    lastUpdated: Date;
    source: string;
  };
  distance: {
    current: number; // in kilometers
    goal: number;
    trend: 'up' | 'down' | 'neutral';
    lastUpdated: Date;
    source: string;
  };
  activeMinutes: {
    current: number;
    goal: number;
    intensity: 'light' | 'moderate' | 'vigorous';
    trend: 'up' | 'down' | 'neutral';
    lastUpdated: Date;
    source: string;
  };
  workouts: {
    todayCount: number;
    weekCount: number;
    totalDuration: number; // in minutes
    lastWorkout: {
      type: string;
      duration: number;
      calories: number;
      date: Date;
    } | null;
    trend: 'up' | 'down' | 'neutral';
    lastUpdated: Date;
    source: string;
  };
  
  // Health Metrics
  weight: {
    current: number;
    goal: number;
    trend: 'up' | 'down' | 'neutral';
    progress: number;
    bmi: number;
    lastUpdated: Date;
    source: string;
  };
  sleep: {
    duration: number; // hours
    quality: number; // 1-100 score
    deep: number; // hours of deep sleep
    rem: number; // hours of REM sleep
    bedtime: Date;
    wakeTime: Date;
    trend: 'up' | 'down' | 'neutral';
    lastUpdated: Date;
    source: string;
  };
  bloodPressure: {
    systolic: number;
    diastolic: number;
    category: 'normal' | 'elevated' | 'high' | 'crisis';
    lastUpdated: Date;
    source: string;
  };
  
  // Mental Health Metrics
  mindfulness: {
    current: number; // minutes today
    goal: number;
    sessions: number;
    trend: 'up' | 'down' | 'neutral';
    progress: number;
    lastUpdated: Date;
    source: string;
  };
  mood: {
    current: number; // 1-10 scale
    average: number; // weekly average
    trend: 'up' | 'down' | 'neutral';
    progress: number;
    lastUpdated: Date;
    source: string;
  };
}

// Sync Status Interface
export interface SyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  syncInProgress: boolean;
  error: string | null;
  sources: {
    appleHealth: boolean;
    googleHealth: boolean;
    samsungHealth: boolean;
    appleWatch: boolean;
    galaxyWatch: boolean;
    fitbit: boolean;
    garmin: boolean;
  };
  permissions: {
    granted: boolean;
    requested: string[];
    denied: string[];
  };
}

// Health Data Sources Enum
export enum HealthSource {
  APPLE_HEALTH = 'Apple Health',
  GOOGLE_HEALTH = 'Google Health Connect',
  SAMSUNG_HEALTH = 'Samsung Health',
  APPLE_WATCH = 'Apple Watch',
  GALAXY_WATCH = 'Galaxy Watch',
  FITBIT = 'Fitbit',
  GARMIN = 'Garmin',
  MANUAL_ENTRY = 'Manual Entry'
}

class HealthDataManager {
  private static instance: HealthDataManager;
  private healthMetrics: HealthMetrics | null = null;
  private syncStatus: SyncStatus;
  private listeners: ((metrics: HealthMetrics) => void)[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.syncStatus = {
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
    };
  }

  public static getInstance(): HealthDataManager {
    if (!HealthDataManager.instance) {
      HealthDataManager.instance = new HealthDataManager();
    }
    return HealthDataManager.instance;
  }

  /**
   * Initialize health data connections based on platform
   */
  public async initialize(): Promise<void> {
    console.log('🏥 Initializing Health Data Manager...');
    
    try {
      if (Platform.OS === 'ios') {
        await this.initializeAppleHealth();
      } else if (Platform.OS === 'android') {
        await this.initializeAndroidHealth();
      }
      
      // Start periodic sync
      this.startPeriodicSync();
      
      console.log('✅ Health Data Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Health Data Manager:', error);
      this.syncStatus.error = `Initialization failed: ${error.message}`;
    }
  }

  /**
   * Initialize Apple HealthKit for iOS
   */
  private async initializeAppleHealth(): Promise<void> {
    const permissions: HealthKitPermissions = {
      permissions: {
        read: [
          'Steps',
          'DistanceWalkingRunning',
          'Calories',
          'CaloriesActive',
          'HeartRate',
          'RestingHeartRate',
          'Weight',
          'Height',
          'BodyMassIndex',
          'SleepAnalysis',
          'MindfulSession',
          'BloodPressureSystolic',
          'BloodPressureDiastolic',
          'ActiveEnergyBurned',
          'Workout'
        ],
        write: []
      }
    };

    return new Promise((resolve, reject) => {
      AppleHealthKit.initHealthKit(permissions, (error) => {
        if (error) {
          console.error('❌ Apple HealthKit initialization failed:', error);
          this.syncStatus.permissions.denied.push('Apple Health');
          reject(error);
          return;
        }

        console.log('✅ Apple HealthKit initialized successfully');
        this.syncStatus.sources.appleHealth = true;
        this.syncStatus.permissions.granted = true;
        this.syncStatus.permissions.requested.push('Apple Health');
        resolve();
      });
    });
  }

  /**
   * Initialize Google Health Connect for Android
   */
  private async initializeAndroidHealth(): Promise<void> {
    const options = {
      scopes: [
        Scopes.FITNESS_ACTIVITY_READ,
        Scopes.FITNESS_BODY_READ,
        Scopes.FITNESS_LOCATION_READ,
        Scopes.FITNESS_NUTRITION_READ,
      ],
    };

    return GoogleFit.authorize(options)
      .then(authResult => {
        if (authResult.success) {
          console.log('✅ Google Health Connect initialized successfully');
          this.syncStatus.sources.googleHealth = true;
          this.syncStatus.permissions.granted = true;
          this.syncStatus.permissions.requested.push('Google Health');
          
          // Check for Samsung Health
          this.checkSamsungHealth();
        } else {
          throw new Error('Google Health Connect authorization failed');
        }
      })
      .catch(error => {
        console.error('❌ Google Health Connect initialization failed:', error);
        this.syncStatus.permissions.denied.push('Google Health');
        throw error;
      });
  }

  /**
   * Check and initialize Samsung Health (Android)
   */
  private async checkSamsungHealth(): Promise<void> {
    // Samsung Health SDK integration would go here
    // For now, we'll simulate the connection
    console.log('🔍 Checking for Samsung Health...');
    
    // This would be replaced with actual Samsung Health SDK calls
    const samsungHealthAvailable = false; // Placeholder
    
    if (samsungHealthAvailable) {
      this.syncStatus.sources.samsungHealth = true;
      console.log('✅ Samsung Health connected');
    }
  }

  /**
   * Start periodic data synchronization
   */
  private startPeriodicSync(): void {
    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncAllData();
    }, 5 * 60 * 1000);
    
    // Initial sync
    this.syncAllData();
  }

  /**
   * Sync all health data from connected sources
   */
  public async syncAllData(): Promise<void> {
    if (this.syncStatus.syncInProgress) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    this.syncStatus.syncInProgress = true;
    this.syncStatus.error = null;

    try {
      console.log('🔄 Starting health data sync...');
      
      const metrics: Partial<HealthMetrics> = {};

      if (Platform.OS === 'ios' && this.syncStatus.sources.appleHealth) {
        await this.syncAppleHealthData(metrics);
      }
      
      if (Platform.OS === 'android' && this.syncStatus.sources.googleHealth) {
        await this.syncGoogleHealthData(metrics);
      }

      // Fill in any missing data with defaults
      this.healthMetrics = this.fillDefaultMetrics(metrics as HealthMetrics);
      
      // Notify listeners
      this.notifyListeners();
      
      this.syncStatus.lastSync = new Date();
      this.syncStatus.isConnected = true;
      
      console.log('✅ Health data sync completed successfully');
      
    } catch (error) {
      console.error('❌ Health data sync failed:', error);
      this.syncStatus.error = `Sync failed: ${error.message}`;
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }

  /**
   * Sync data from Apple HealthKit
   */
  private async syncAppleHealthData(metrics: Partial<HealthMetrics>): Promise<void> {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return new Promise((resolve, reject) => {
      const promises: Promise<void>[] = [];

      // Sync Steps
      promises.push(new Promise((res) => {
        AppleHealthKit.getStepCount({ startDate }, (error, results) => {
          if (!error && results) {
            metrics.steps = {
              current: results.value,
              goal: 10000, // Default goal, can be customized
              trend: 'neutral',
              lastUpdated: new Date(),
              source: HealthSource.APPLE_HEALTH
            };
          }
          res();
        });
      }));

      // Sync Calories
      promises.push(new Promise((res) => {
        AppleHealthKit.getActiveEnergyBurned({ startDate }, (error, results) => {
          if (!error && results && results.length > 0) {
            const totalCalories = results.reduce((sum, entry) => sum + entry.value, 0);
            metrics.calories = {
              burned: totalCalories,
              consumed: 0, // Would need additional API for consumed calories
              goal: 2000,
              net: totalCalories,
              trend: 'neutral',
              lastUpdated: new Date(),
              source: HealthSource.APPLE_HEALTH
            };
          }
          res();
        });
      }));

      // Sync Heart Rate
      promises.push(new Promise((res) => {
        AppleHealthKit.getHeartRateSamples({ startDate }, (error, results) => {
          if (!error && results && results.length > 0) {
            const latestHR = results[results.length - 1];
            const avgHR = results.reduce((sum, entry) => sum + entry.value, 0) / results.length;
            
            metrics.heartRate = {
              current: latestHR.value,
              resting: 0, // Would need resting HR API
              max: Math.max(...results.map(r => r.value)),
              average: Math.round(avgHR),
              zones: {
                fat_burn: 0,
                cardio: 0,
                peak: 0
              },
              lastUpdated: new Date(),
              source: HealthSource.APPLE_HEALTH
            };
          }
          res();
        });
      }));

      // Sync Weight
      promises.push(new Promise((res) => {
        AppleHealthKit.getLatestWeight({}, (error, results) => {
          if (!error && results) {
            metrics.weight = {
              current: results.value,
              goal: 0, // User would set this
              trend: 'neutral',
              progress: 0,
              bmi: 0, // Would calculate with height
              lastUpdated: new Date(results.endDate),
              source: HealthSource.APPLE_HEALTH
            };
          }
          res();
        });
      }));

      // Sync Sleep Data
      promises.push(new Promise((res) => {
        AppleHealthKit.getSleepSamples({ startDate }, (error, results) => {
          if (!error && results && results.length > 0) {
            const sleepData = results[0]; // Most recent sleep session
            const duration = (new Date(sleepData.endDate).getTime() - new Date(sleepData.startDate).getTime()) / (1000 * 60 * 60);
            
            metrics.sleep = {
              duration: Math.round(duration * 10) / 10,
              quality: 75, // Default, would need additional calculation
              deep: 0, // Would need detailed sleep stage data
              rem: 0,
              bedtime: new Date(sleepData.startDate),
              wakeTime: new Date(sleepData.endDate),
              trend: 'neutral',
              lastUpdated: new Date(),
              source: HealthSource.APPLE_HEALTH
            };
          }
          res();
        });
      }));

      // Sync Distance
      promises.push(new Promise((res) => {
        AppleHealthKit.getDistanceWalkingRunning({ startDate }, (error, results) => {
          if (!error && results && results.length > 0) {
            const totalDistance = results.reduce((sum, entry) => sum + entry.value, 0);
            metrics.distance = {
              current: Math.round(totalDistance * 100) / 100, // Convert to km
              goal: 5, // Default 5km goal
              trend: 'neutral',
              lastUpdated: new Date(),
              source: HealthSource.APPLE_HEALTH
            };
          }
          res();
        });
      }));

      Promise.all(promises).then(() => resolve()).catch(reject);
    });
  }

  /**
   * Sync data from Google Health Connect
   */
  private async syncGoogleHealthData(metrics: Partial<HealthMetrics>): Promise<void> {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    try {
      // Sync Steps
      const stepsData = await GoogleFit.getDailyStepCountSamples({
        startDate: startDate.toISOString(),
        endDate: today.toISOString(),
      });
      
      if (stepsData && stepsData.length > 0) {
        const todaySteps = stepsData[0]?.steps || 0;
        metrics.steps = {
          current: todaySteps,
          goal: 10000,
          trend: 'neutral',
          lastUpdated: new Date(),
          source: HealthSource.GOOGLE_HEALTH
        };
      }

      // Sync Calories
      const caloriesData = await GoogleFit.getDailyCalorieSamples({
        startDate: startDate.toISOString(),
        endDate: today.toISOString(),
      });
      
      if (caloriesData && caloriesData.length > 0) {
        const todayCalories = caloriesData[0]?.calorie || 0;
        metrics.calories = {
          burned: todayCalories,
          consumed: 0,
          goal: 2000,
          net: todayCalories,
          trend: 'neutral',
          lastUpdated: new Date(),
          source: HealthSource.GOOGLE_HEALTH
        };
      }

      // Sync Distance
      const distanceData = await GoogleFit.getDailyDistanceSamples({
        startDate: startDate.toISOString(),
        endDate: today.toISOString(),
      });
      
      if (distanceData && distanceData.length > 0) {
        const todayDistance = (distanceData[0]?.distance || 0) / 1000; // Convert to km
        metrics.distance = {
          current: Math.round(todayDistance * 100) / 100,
          goal: 5,
          trend: 'neutral',
          lastUpdated: new Date(),
          source: HealthSource.GOOGLE_HEALTH
        };
      }

    } catch (error) {
      console.error('❌ Google Health data sync failed:', error);
      throw error;
    }
  }

  /**
   * Fill in default values for missing metrics
   */
  private fillDefaultMetrics(metrics: HealthMetrics): HealthMetrics {
    const now = new Date();
    
    return {
      steps: metrics.steps || {
        current: 0,
        goal: 10000,
        trend: 'neutral',
        lastUpdated: now,
        source: HealthSource.MANUAL_ENTRY
      },
      calories: metrics.calories || {
        burned: 0,
        consumed: 0,
        goal: 2000,
        net: 0,
        trend: 'neutral',
        lastUpdated: now,
        source: HealthSource.MANUAL_ENTRY
      },
      heartRate: metrics.heartRate || {
        current: 0,
        resting: 65,
        max: 180,
        average: 75,
        zones: { fat_burn: 0, cardio: 0, peak: 0 },
        lastUpdated: now,
        source: HealthSource.MANUAL_ENTRY
      },
      distance: metrics.distance || {
        current: 0,
        goal: 5,
        trend: 'neutral',
        lastUpdated: now,
        source: HealthSource.MANUAL_ENTRY
      },
      activeMinutes: metrics.activeMinutes || {
        current: 0,
        goal: 150,
        intensity: 'moderate',
        trend: 'neutral',
        lastUpdated: now,
        source: HealthSource.MANUAL_ENTRY
      },
      workouts: metrics.workouts || {
        todayCount: 0,
        weekCount: 0,
        totalDuration: 0,
        lastWorkout: null,
        trend: 'neutral',
        lastUpdated: now,
        source: HealthSource.MANUAL_ENTRY
      },
      weight: metrics.weight || {
        current: 0,
        goal: 0,
        trend: 'neutral',
        progress: 0,
        bmi: 0,
        lastUpdated: now,
        source: HealthSource.MANUAL_ENTRY
      },
      sleep: metrics.sleep || {
        duration: 0,
        quality: 0,
        deep: 0,
        rem: 0,
        bedtime: now,
        wakeTime: now,
        trend: 'neutral',
        lastUpdated: now,
        source: HealthSource.MANUAL_ENTRY
      },
      bloodPressure: metrics.bloodPressure || {
        systolic: 120,
        diastolic: 80,
        category: 'normal',
        lastUpdated: now,
        source: HealthSource.MANUAL_ENTRY
      },
      mindfulness: metrics.mindfulness || {
        current: 0,
        goal: 20,
        sessions: 0,
        trend: 'neutral',
        progress: 0,
        lastUpdated: now,
        source: HealthSource.MANUAL_ENTRY
      },
      mood: metrics.mood || {
        current: 7,
        average: 7,
        trend: 'neutral',
        progress: 70,
        lastUpdated: now,
        source: HealthSource.MANUAL_ENTRY
      }
    };
  }

  /**
   * Subscribe to health data updates
   */
  public subscribe(callback: (metrics: HealthMetrics) => void): () => void {
    this.listeners.push(callback);
    
    // If we already have data, notify immediately
    if (this.healthMetrics) {
      callback(this.healthMetrics);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of data updates
   */
  private notifyListeners(): void {
    if (this.healthMetrics) {
      this.listeners.forEach(callback => callback(this.healthMetrics!));
    }
  }

  /**
   * Get current health metrics
   */
  public getHealthMetrics(): HealthMetrics | null {
    return this.healthMetrics;
  }

  /**
   * Get current sync status
   */
  public getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  /**
   * Force a manual sync
   */
  public async forceSync(): Promise<void> {
    await this.syncAllData();
  }

  /**
   * Request health permissions
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      await this.initialize();
      return this.syncStatus.permissions.granted;
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.listeners = [];
  }

  /**
   * Update manual entry data
   */
  public updateManualData(type: keyof HealthMetrics, data: Partial<HealthMetrics[keyof HealthMetrics]>): void {
    if (!this.healthMetrics) {
      this.healthMetrics = this.fillDefaultMetrics({} as HealthMetrics);
    }

    this.healthMetrics[type] = {
      ...this.healthMetrics[type],
      ...data,
      lastUpdated: new Date(),
      source: HealthSource.MANUAL_ENTRY
    };

    this.notifyListeners();
  }
}

export default HealthDataManager;