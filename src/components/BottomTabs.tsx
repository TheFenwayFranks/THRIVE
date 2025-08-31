import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type TabName = 'home' | 'community' | 'stats';

interface BottomTabsProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

export default function BottomTabs({ activeTab, onTabPress }: BottomTabsProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const tabs = [
    { 
      key: 'home' as TabName, 
      label: 'Home', 
      icon: '🏠',
      description: 'Dashboard & Workouts'
    },
    { 
      key: 'community' as TabName, 
      label: 'Community', 
      icon: '👥',
      description: 'Posts & Support'
    },
    { 
      key: 'stats' as TabName, 
      label: 'Stats', 
      icon: '📊',
      description: 'Progress & Analytics'
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              isActive && styles.tabButtonActive
            ]}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Text style={[
                styles.tabIcon,
                isActive && styles.tabIconActive
              ]}>
                {tab.icon}
              </Text>
              <Text style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive
              ]}>
                {tab.label}
              </Text>
              {isActive && (
                <Text style={styles.tabDescription}>
                  {tab.description}
                </Text>
              )}
            </View>
            
            {/* Active Tab Indicator */}
            {isActive && (
              <View style={styles.activeIndicator} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
    paddingBottom: 20, // Extra padding for safe area
    paddingHorizontal: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    position: 'relative',
    minHeight: 70,
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.6,
  },
  tabIconActive: {
    fontSize: 24,
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  tabDescription: {
    fontSize: 9,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
  },
  activeIndicator: {
    position: 'absolute',
    top: 2,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
});