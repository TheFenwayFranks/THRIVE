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

// Light Theme - Premium clean whites with enhanced THRIVE green system
const lightTheme: Theme = {
  isDark: false,
  colors: {
    // Background colors - Premium white system
    background: '#FFFFFF', // Pure clean white
    surface: '#F8F9FA', // Soft light gray for secondary surfaces
    card: '#FFFFFF', // Pure white cards with shadows
    
    // Text colors - Enhanced hierarchy for perfect readability
    text: '#1A1A1A', // Rich dark gray for primary text
    textSecondary: '#666666', // Medium gray for secondary text
    textMuted: '#999999', // Light gray for subtle text
    
    // THRIVE brand colors - Consistent with dark theme intensity
    primary: '#4CAF50', // Matching the premium green from dark theme
    primaryLight: '#66BB6A', // Light variant for gradients
    primaryDark: '#388E3C', // Darker shade for depth
    
    // Status colors - Enhanced for light theme visibility
    success: '#4CAF50', // Matching primary green for consistency
    warning: '#FF9800', // Vibrant orange for warnings
    error: '#F44336', // Clear red for errors
    info: '#2196F3', // Clear blue for information
    
    // UI element colors - Enhanced for premium feel
    border: '#E0E0E0', // Subtle but visible borders
    shadow: '#00000015', // Slightly deeper shadows for depth
    overlay: 'rgba(0, 0, 0, 0.6)', // Slightly more opaque overlays
    
    // Difficulty colors - Consistent with enhanced dark theme
    gentle: '#4CAF50', // Matching primary green
    steady: '#00BCD4', // Cyan for steady (same as dark theme)
    beast: '#FF5722', // Vibrant orange-red (same as dark theme)
    
    // Special colors
    celebration: '#F59E0B',
    mood: '#8B5CF6'
  }
};

// Dark Theme - Premium deep blacks with enhanced THRIVE green accents
const darkTheme: Theme = {
  isDark: true,
  colors: {
    // Background colors - Enhanced for premium feel
    background: '#0A0A0A', // Deeper black for premium feel
    surface: '#141414', // Darker surface with subtle contrast
    card: '#1F1F1F', // Refined card color with better contrast
    
    // Text colors - Optimized for dark background readability
    text: '#FFFFFF', // Pure white for maximum contrast
    textSecondary: '#E5E7EB', // Slightly brighter secondary text
    textMuted: '#9CA3AF', // Maintains good contrast
    
    // THRIVE brand colors - Enhanced for dark theme visibility and glow effects
    primary: '#00E676', // Brighter, more vibrant green for dark backgrounds
    primaryLight: '#4ADE80', // Maintained for gradients
    primaryDark: '#00C853', // Darker shade for depth
    
    // Status colors (enhanced for dark theme visibility)
    success: '#00E676', // Matching primary green for consistency
    warning: '#FFC107', // Brighter warning yellow
    error: '#FF5252', // Brighter error red
    info: '#03DAC6', // Teal info color for better contrast
    
    // UI element colors - Enhanced for depth and glow effects
    border: '#2A2A2A', // Subtle border for cards
    shadow: '#00000060', // Deeper shadows for premium depth
    overlay: 'rgba(0, 0, 0, 0.85)', // Slightly more opaque overlays
    
    // Difficulty colors (enhanced for dark theme with glow effects)
    gentle: '#00E676', // Matching primary green
    steady: '#26C6DA', // Cyan for steady (better contrast)
    beast: '#FF5722', // More vibrant orange-red for beast mode
    
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