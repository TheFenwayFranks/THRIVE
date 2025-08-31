import * as Location from 'expo-location';

export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  location: string;
  badge: string;
  motivationKey: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
}

export class WeatherService {
  private static readonly WEATHER_API_KEY = 'demo_key'; // For demo purposes
  
  // Weather condition mapping to our motivation system
  private static readonly CONDITION_MAPPING = {
    // Clear/Sunny conditions
    'clear': { badge: 'CLEAR', key: 'sunny' },
    'sunny': { badge: 'SUNNY', key: 'sunny' },
    'clear-day': { badge: 'CLEAR', key: 'sunny' },
    
    // Cloudy conditions  
    'cloudy': { badge: 'CLOUDY', key: 'cloudy' },
    'partly-cloudy': { badge: 'PARTLY CLOUDY', key: 'cloudy' },
    'overcast': { badge: 'OVERCAST', key: 'cloudy' },
    
    // Rainy conditions
    'rain': { badge: 'RAIN', key: 'rainy' },
    'drizzle': { badge: 'DRIZZLE', key: 'rainy' },
    'showers': { badge: 'SHOWERS', key: 'rainy' },
    'thunderstorm': { badge: 'STORM', key: 'rainy' },
    
    // Snow conditions
    'snow': { badge: 'SNOW', key: 'snowy' },
    'sleet': { badge: 'SLEET', key: 'snowy' },
    'freezing': { badge: 'FREEZING', key: 'snowy' },
    
    // Wind conditions
    'windy': { badge: 'WINDY', key: 'windy' },
    
    // Fog conditions
    'fog': { badge: 'FOG', key: 'foggy' },
    'mist': { badge: 'MIST', key: 'foggy' },
    'haze': { badge: 'HAZE', key: 'foggy' }
  };

  // Professional weather-responsive motivation messages with temperature context
  private static readonly WEATHER_MOTIVATIONS = {
    sunny: {
      hot: "Optimal conditions for gentle movement - stay hydrated and energized",
      warm: "Perfect conditions for outdoor activity and natural energy",
      cool: "Excellent weather for movement with comfortable temperature"
    },
    rainy: {
      hot: "Indoor exercise provides controlled environment for focused training",
      warm: "Rainy weather creates ideal conditions for indoor movement",
      cool: "Indoor activity generates warmth while rain provides peaceful ambiance"
    },
    cloudy: {
      hot: "Comfortable overcast conditions support sustained physical activity",
      warm: "Cloud cover provides ideal temperature for extended movement",
      cool: "Mild cloudy conditions are perfect for building internal heat"
    },
    snowy: {
      hot: "Cool winter air supports longer duration exercise sessions",
      warm: "Winter conditions build resilience and mental fortitude",
      cool: "Cold weather movement increases circulation and body heat"
    },
    windy: {
      hot: "Dynamic weather conditions match your body's natural energy",
      warm: "Breezy conditions support active movement and fresh air flow",
      cool: "Wind provides refreshing environment for heat-building exercise"
    },
    foggy: {
      hot: "Misty conditions create peaceful environment for mindful movement",
      warm: "Fog provides calm, focused atmosphere for purposeful activity",
      cool: "Gentle fog creates serene conditions for warming exercise"
    }
  };

  static async requestLocationPermission(): Promise<boolean> {
    try {
      console.log('🌍 Requesting location permission for weather data');
      
      // Check if we're in web environment
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        console.log('🌐 Web environment detected, using browser geolocation');
        return true; // We'll handle web geolocation separately
      }
      
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus === 'granted') {
        console.log('✅ Location permission granted');
        return true;
      } else {
        console.log('❌ Location permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      console.log('📍 Getting current location');
      
      // Try web geolocation first if available
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        console.log('🌐 Using web geolocation API');
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const locationData: LocationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                city: 'Your Location', // In web, we'll use a generic name
                region: ''
              };
              console.log('📍 Web location found:', locationData);
              resolve(locationData);
            },
            (error) => {
              console.error('Web geolocation error:', error);
              // Return demo location for web
              resolve({
                latitude: 37.7749,  // San Francisco coordinates for demo
                longitude: -122.4194,
                city: 'Demo City',
                region: 'Demo Region'
              });
            },
            { timeout: 10000, enableHighAccuracy: false }
          );
        });
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 1000,
      });

      // Get readable location name
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const locationInfo = reverseGeocode[0];
      const city = locationInfo?.city || locationInfo?.district || 'Your Location';
      const region = locationInfo?.region || locationInfo?.country || '';

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city,
        region
      };

      console.log('📍 Location found:', locationData);
      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      // Return demo location as fallback
      return {
        latitude: 37.7749,  // San Francisco coordinates for demo
        longitude: -122.4194,
        city: 'Demo City',
        region: 'Demo Region'
      };
    }
  }

  // For demo purposes, simulate weather API call
  // In production, this would call OpenWeatherMap, WeatherAPI, or device weather
  static async getWeatherData(location: LocationData): Promise<WeatherData | null> {
    try {
      console.log('🌤️ Fetching weather data for location:', location);
      
      // Simulate weather API response based on location and time
      const weatherConditions = ['clear', 'cloudy', 'partly-cloudy', 'rain', 'snow'];
      const temperatures = [65, 72, 45, 80, 38, 75, 68]; // Various realistic temperatures
      
      // Use location coordinates to create consistent but varied weather
      const coordHash = Math.abs(location.latitude + location.longitude) % 100;
      const timeHash = new Date().getHours(); // Changes throughout day
      
      const conditionIndex = (coordHash + timeHash) % weatherConditions.length;
      const tempIndex = (coordHash * 2 + timeHash) % temperatures.length;
      
      const condition = weatherConditions[conditionIndex];
      const temperature = temperatures[tempIndex];
      
      // Map condition to our system
      const conditionMapping = this.CONDITION_MAPPING[condition as keyof typeof this.CONDITION_MAPPING] || 
                              this.CONDITION_MAPPING['clear'];
      
      // Get temperature category
      let tempCategory: 'cool' | 'warm' | 'hot';
      if (temperature < 55) tempCategory = 'cool';
      else if (temperature < 80) tempCategory = 'warm';  
      else tempCategory = 'hot';
      
      const weatherData: WeatherData = {
        temperature,
        condition,
        description: `${Math.round(temperature)}°F and ${condition}`,
        location: `${location.city}${location.region ? ', ' + location.region : ''}`,
        badge: conditionMapping.badge,
        motivationKey: conditionMapping.key
      };

      console.log('🌤️ Weather data generated:', weatherData);
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  static getWeatherMotivation(motivationKey: string, temperature: number): string {
    let tempCategory: 'cool' | 'warm' | 'hot';
    if (temperature < 55) tempCategory = 'cool';
    else if (temperature < 80) tempCategory = 'warm';
    else tempCategory = 'hot';

    const motivations = this.WEATHER_MOTIVATIONS[motivationKey as keyof typeof this.WEATHER_MOTIVATIONS];
    
    if (motivations) {
      return motivations[tempCategory];
    }
    
    // Fallback motivation
    return "Every day is a great day to THRIVE! Your movement matters!";
  }

  static async getCompleteWeatherData(): Promise<WeatherData | null> {
    try {
      // Request permission
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        console.log('⚠️ No location permission - cannot fetch weather');
        return null;
      }

      // Get location
      const location = await this.getCurrentLocation();
      if (!location) {
        console.log('⚠️ Could not get location - cannot fetch weather');
        return null;
      }

      // Get weather
      const weather = await this.getWeatherData(location);
      return weather;
    } catch (error) {
      console.error('Error getting complete weather data:', error);
      return null;
    }
  }
}