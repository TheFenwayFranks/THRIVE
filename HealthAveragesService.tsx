/**
 * HealthAveragesService.tsx
 * 
 * Service for calculating 7-day averages of health metrics
 * Integrates with health data to provide meaningful historical insights
 */

import { HealthMetrics } from './HealthDataManager';

export interface WeeklyAverages {
  steps: number;
  calories: number;
  heartRate: number;
  sleep: number;
  workouts: number;
  mood: number;
  mindfulness: number;
  weight: number;
  distance: number;
  // Custom metrics
  water: number;
  streak: number;
}

export interface HistoricalDataPoint {
  date: Date;
  value: number;
}

class HealthAveragesService {
  private static instance: HealthAveragesService;
  private historicalData: Map<string, HistoricalDataPoint[]> = new Map();

  private constructor() {
    this.generateMockHistoricalData();
  }

  public static getInstance(): HealthAveragesService {
    if (!HealthAveragesService.instance) {
      HealthAveragesService.instance = new HealthAveragesService();
    }
    return HealthAveragesService.instance;
  }

  /**
   * Generate mock historical data for the past 7 days
   * In a real app, this would come from stored health data
   */
  private generateMockHistoricalData(): void {
    const now = new Date();
    const metrics = [
      'steps', 'calories', 'heartRate', 'sleep', 'workouts', 
      'mood', 'mindfulness', 'weight', 'distance', 'water'
    ];

    metrics.forEach(metric => {
      const dataPoints: HistoricalDataPoint[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        let value = this.generateRealisticValue(metric, i);
        
        dataPoints.push({ date, value });
      }
      
      this.historicalData.set(metric, dataPoints);
    });

    console.log('📊 Generated 7-day historical health data:', this.historicalData);
  }

  /**
   * Generate realistic values for different health metrics
   */
  private generateRealisticValue(metric: string, daysAgo: number): number {
    const baseValues = {
      steps: 8500,
      calories: 420,
      heartRate: 72,
      sleep: 7.5,
      workouts: 35,
      mood: 7.8,
      mindfulness: 18,
      weight: 165,
      distance: 3.2,
      water: 64
    };

    const base = baseValues[metric] || 50;
    const variance = base * 0.15; // 15% variance
    const dayVariation = (Math.random() - 0.5) * variance;
    const weekendBoost = (daysAgo === 0 || daysAgo === 1) ? base * 0.1 : 0; // Weekend boost for some metrics
    
    // Add some trending (slight improvement over the week)
    const trendImprovement = metric === 'weight' ? -daysAgo * 0.2 : daysAgo * 0.5;
    
    let value = base + dayVariation + weekendBoost + trendImprovement;
    
    // Apply metric-specific constraints
    switch (metric) {
      case 'mood':
        value = Math.max(1, Math.min(10, value));
        break;
      case 'sleep':
        value = Math.max(4, Math.min(12, value));
        break;
      case 'heartRate':
        value = Math.max(50, Math.min(100, value));
        break;
      case 'steps':
        value = Math.max(1000, Math.min(20000, value));
        break;
      case 'water':
        value = Math.max(20, Math.min(120, value));
        break;
      default:
        value = Math.max(0, value);
    }
    
    return value;
  }

  /**
   * Calculate 7-day average for a specific metric
   */
  public getWeeklyAverage(metric: string): number {
    const data = this.historicalData.get(metric);
    if (!data || data.length === 0) {
      return 0;
    }

    const sum = data.reduce((total, point) => total + point.value, 0);
    return sum / data.length;
  }

  /**
   * Get all weekly averages
   */
  public getAllWeeklyAverages(): WeeklyAverages {
    return {
      steps: Math.round(this.getWeeklyAverage('steps')),
      calories: Math.round(this.getWeeklyAverage('calories')),
      heartRate: Math.round(this.getWeeklyAverage('heartRate')),
      sleep: Math.round(this.getWeeklyAverage('sleep') * 10) / 10, // 1 decimal place
      workouts: Math.round(this.getWeeklyAverage('workouts')),
      mood: Math.round(this.getWeeklyAverage('mood') * 10) / 10, // 1 decimal place
      mindfulness: Math.round(this.getWeeklyAverage('mindfulness')),
      weight: Math.round(this.getWeeklyAverage('weight')),
      distance: Math.round(this.getWeeklyAverage('distance') * 10) / 10, // 1 decimal place
      water: Math.round(this.getWeeklyAverage('water')),
      streak: this.calculateStreak()
    };
  }

  /**
   * Calculate current streak based on consistent daily activity
   */
  private calculateStreak(): number {
    // Mock streak calculation - in real app would be based on actual activity
    const streakDays = Math.floor(Math.random() * 10) + 1; // 1-10 days
    return streakDays;
  }

  /**
   * Update historical data with new health data point
   */
  public updateMetric(metric: string, value: number): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let data = this.historicalData.get(metric) || [];
    
    // Check if we already have data for today
    const todayIndex = data.findIndex(point => 
      point.date.toDateString() === today.toDateString()
    );

    if (todayIndex >= 0) {
      // Update today's value
      data[todayIndex] = { date: today, value };
    } else {
      // Add new data point
      data.push({ date: today, value });
      
      // Keep only last 7 days
      data = data.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 7);
    }

    this.historicalData.set(metric, data);
  }

  /**
   * Get historical data points for a metric (for charts/graphs)
   */
  public getHistoricalData(metric: string): HistoricalDataPoint[] {
    return this.historicalData.get(metric) || [];
  }

  /**
   * Get trend indicator for a metric (up, down, stable)
   */
  public getTrend(metric: string): 'up' | 'down' | 'stable' {
    const data = this.historicalData.get(metric);
    if (!data || data.length < 2) {
      return 'stable';
    }

    const sortedData = data.sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));

    const firstAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;

    const percentChange = Math.abs((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (percentChange < 5) {
      return 'stable';
    }
    
    // For weight, down is good; for others, up is good
    if (metric === 'weight') {
      return secondAvg < firstAvg ? 'up' : 'down';
    } else {
      return secondAvg > firstAvg ? 'up' : 'down';
    }
  }

  /**
   * Integrate real health data when available
   */
  public integrateHealthData(healthData: HealthMetrics): void {
    if (!healthData) return;

    // Update with real current values
    this.updateMetric('steps', healthData.steps?.current || 0);
    this.updateMetric('calories', healthData.calories?.burned || 0);
    this.updateMetric('heartRate', healthData.heartRate?.average || 0);
    this.updateMetric('sleep', healthData.sleep?.duration || 0);
    this.updateMetric('workouts', healthData.workouts?.totalDuration || 0);
    this.updateMetric('mood', healthData.mood?.current || 0);
    this.updateMetric('mindfulness', healthData.mindfulness?.current || 0);
    this.updateMetric('weight', healthData.weight?.current || 0);
    this.updateMetric('distance', healthData.distance?.current || 0);

    console.log('🔄 Updated historical data with real health metrics');
  }

  /**
   * Reset to fresh mock data (for demo purposes)
   */
  public resetToMockData(): void {
    this.historicalData.clear();
    this.generateMockHistoricalData();
    console.log('🔄 Reset to fresh mock historical data');
  }
}

export default HealthAveragesService;