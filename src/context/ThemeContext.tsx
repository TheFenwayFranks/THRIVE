import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { StorageService } from '../services/StorageService';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // THRIVE brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // UI element colors
  border: string;
  shadow: string;
  overlay: string;
  
  // Difficulty colors
  gentle: string;
  steady: string;
  beast: string;
  
  // Special colors
  celebration: string;
  mood: string;
}

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
}

// Light Theme - Clean whites and light grays with THRIVE green
const lightTheme: Theme = {
  isDark: false,
  colors: {
    // Background colors
    background: '#FFFFFF',
    surface: '#F9FAFB',
    card: '#FFFFFF',
    
    // Text colors
    text: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    
    // THRIVE brand colors
    primary: '#16A34A',
    primaryLight: '#22C55E',
    primaryDark: '#15803D',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // UI element colors
    border: '#E5E7EB',
    shadow: '#00000010',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Difficulty colors
    gentle: '#10B981',
    steady: '#3B82F6',
    beast: '#EF4444',
    
    // Special colors
    celebration: '#F59E0B',
    mood: '#8B5CF6'
  }
};

// Dark Theme - Deep blacks and dark grays with consistent THRIVE green
const darkTheme: Theme = {
  isDark: true,
  colors: {
    // Background colors
    background: '#0F0F0F',
    surface: '#1A1A1A',
    card: '#2D2D2D',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    
    // THRIVE brand colors (slightly brighter for dark backgrounds)
    primary: '#22C55E',
    primaryLight: '#4ADE80',
    primaryDark: '#16A34A',
    
    // Status colors (adjusted for dark theme visibility)
    success: '#22C55E',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    
    // UI element colors
    border: '#374151',
    shadow: '#00000040',
    overlay: 'rgba(0, 0, 0, 0.8)',
    
    // Difficulty colors (brightened for dark theme)
    gentle: '#22C55E',
    steady: '#60A5FA',
    beast: '#F87171',
    
    // Special colors
    celebration: '#FBBF24',
    mood: '#A78BFA'
  }
};

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Determine current theme based on mode and system preference
  const getCurrentTheme = (): Theme => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const [theme, setTheme] = useState<Theme>(getCurrentTheme());

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Listen to system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('🎨 System color scheme changed to:', colorScheme);
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // Update theme when mode or system preference changes
  useEffect(() => {
    const newTheme = getCurrentTheme();
    console.log('🎨 Theme updated:', { 
      mode: themeMode, 
      systemScheme: systemColorScheme, 
      isDark: newTheme.isDark 
    });
    setTheme(newTheme);
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const settings = await StorageService.getSettings();
      const savedThemeMode = settings.themeMode || 'system';
      console.log('🎨 Loaded theme preference:', savedThemeMode);
      setThemeModeState(savedThemeMode);
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      setThemeModeState('system');
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    console.log('🎨 Setting theme mode to:', mode);
    setThemeModeState(mode);
    
    try {
      const settings = await StorageService.getSettings();
      await StorageService.saveSettings({
        ...settings,
        themeMode: mode
      });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const currentTheme = getCurrentTheme();
    const newMode: ThemeMode = currentTheme.isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { lightTheme, darkTheme };