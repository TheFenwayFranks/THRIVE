import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { theme, themeMode, setThemeMode } = useTheme();
  const styles = createStyles(theme);

  const themeOptions: { mode: ThemeMode; label: string; icon: string; description: string }[] = [
    { 
      mode: 'system', 
      label: 'System Default', 
      icon: '⚙️', 
      description: 'Follows your device settings' 
    },
    { 
      mode: 'light', 
      label: 'Light Mode', 
      icon: '☀️', 
      description: 'Light and bright interface' 
    },
    { 
      mode: 'dark', 
      label: 'Dark Mode', 
      icon: '🌙', 
      description: 'Easy on the eyes' 
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>⚙️ Settings</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎨 Theme Preferences</Text>
              <Text style={styles.sectionDescription}>
                Choose how THRIVE looks on your device
              </Text>
              
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.mode}
                  style={[
                    styles.themeOption,
                    themeMode === option.mode && styles.themeOptionSelected
                  ]}
                  onPress={() => setThemeMode(option.mode)}
                >
                  <View style={styles.themeOptionLeft}>
                    <Text style={styles.themeIcon}>{option.icon}</Text>
                    <View style={styles.themeTextContainer}>
                      <Text style={styles.themeLabel}>{option.label}</Text>
                      <Text style={styles.themeDescription}>{option.description}</Text>
                    </View>
                  </View>
                  {themeMode === option.mode && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.currentThemeInfo}>
              <Text style={styles.currentThemeText}>
                Current theme: <Text style={styles.currentThemeValue}>
                  {theme.isDark ? 'Dark' : 'Light'}
                </Text>
              </Text>
              <Text style={styles.currentModeText}>
                Mode: <Text style={styles.currentModeValue}>{themeMode}</Text>
              </Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  themeOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.isDark ? theme.colors.surface : '#F0FDF4',
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  themeDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  checkmark: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  currentThemeInfo: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  currentThemeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  currentThemeValue: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  currentModeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  currentModeValue: {
    color: theme.colors.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  doneButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});