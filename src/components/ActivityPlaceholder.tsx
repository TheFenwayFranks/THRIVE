import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ActivityPlaceholderProps {
  visible: boolean;
  onClose: () => void;
  activityName: string;
}

export default function ActivityPlaceholder({
  visible,
  onClose,
  activityName,
}: ActivityPlaceholderProps) {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
              ← Back
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={[styles.placeholderCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.activityTitle, { color: theme.colors.text }]}>
              {activityName}
            </Text>
            <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
              In progress (placeholder)
            </Text>
            <View style={styles.statusIndicator}>
              <Text style={styles.statusText}>🔧</Text>
              <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                Feature in development
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderCard: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 300,
  },
  activityTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  statusIndicator: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 32,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});