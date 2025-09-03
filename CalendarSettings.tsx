import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import CalendarSyncService, { SyncStatus } from './CalendarSyncService';

interface CalendarSettingsProps {
  onClose: () => void;
}

const CalendarSettings: React.FC<CalendarSettingsProps> = ({ onClose }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    isEnabled: false,
    connectedCalendars: [],
    syncInProgress: false,
    errors: []
  });
  const [deviceCalendars, setDeviceCalendars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const calendarService = CalendarSyncService.getInstance();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const status = calendarService.getSyncStatus();
      setSyncStatus(status);

      // Load device calendars
      const calendars = await calendarService.getDeviceCalendars();
      setDeviceCalendars(calendars);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToggle = async (enabled: boolean) => {
    if (enabled) {
      // Request permissions first
      const hasPermission = await calendarService.requestCalendarPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Calendar Permission Required',
          'THRIVE needs calendar access to sync your events. Please grant permission in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    calendarService.setSync(enabled);
    const newStatus = calendarService.getSyncStatus();
    setSyncStatus(newStatus);
  };

  const handleManualSync = async () => {
    setLoading(true);
    try {
      await calendarService.syncCalendars();
      const newStatus = calendarService.getSyncStatus();
      setSyncStatus(newStatus);
      
      Alert.alert(
        'Sync Complete',
        'Your calendar has been synchronized successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Sync Error',
        'There was an error syncing your calendar. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCalendarConnect = async () => {
    setLoading(true);
    try {
      const success = await calendarService.authenticateGoogleCalendar();
      if (success) {
        Alert.alert(
          'Google Calendar Connected',
          'Your Google Calendar is now connected and will sync with THRIVE.',
          [{ text: 'OK' }]
        );
        await loadInitialData();
      } else {
        Alert.alert(
          'Connection Failed',
          'Could not connect to Google Calendar. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'There was an error connecting to Google Calendar.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar Settings</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Sync Toggle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📱 Device Calendar Sync</Text>
            <Switch
              value={syncStatus.isEnabled}
              onValueChange={handleSyncToggle}
              trackColor={{ false: '#e1e5e9', true: '#34c759' }}
              thumbColor={syncStatus.isEnabled ? '#fff' : '#f4f4f4'}
            />
          </View>
          <Text style={styles.sectionDescription}>
            Sync THRIVE events with your device calendar. View and manage health activities alongside your regular schedule.
          </Text>
        </View>

        {/* Sync Status */}
        {syncStatus.isEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔄 Sync Status</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Last sync:</Text>
              <Text style={styles.statusValue}>{formatLastSync(syncStatus.lastSync)}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Connected calendars:</Text>
              <Text style={styles.statusValue}>{syncStatus.connectedCalendars.length}</Text>
            </View>
            
            {syncStatus.syncInProgress && (
              <View style={styles.syncingIndicator}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.syncingText}>Syncing...</Text>
              </View>
            )}

            {syncStatus.errors.length > 0 && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>⚠️ Sync Errors:</Text>
                {syncStatus.errors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>• {error}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Manual Sync Button */}
        {syncStatus.isEnabled && (
          <TouchableOpacity 
            style={[styles.actionButton, loading && styles.disabledButton]} 
            onPress={handleManualSync}
            disabled={loading || syncStatus.syncInProgress}
          >
            <Text style={styles.actionButtonText}>
              {loading ? '🔄 Syncing...' : '🔄 Sync Now'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Connected Calendars */}
        {deviceCalendars.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Available Calendars</Text>
            {deviceCalendars.map((calendar) => (
              <View key={calendar.id} style={styles.calendarItem}>
                <View style={[styles.calendarColor, { backgroundColor: calendar.color || '#007AFF' }]} />
                <View style={styles.calendarInfo}>
                  <Text style={styles.calendarName}>{calendar.title}</Text>
                  <Text style={styles.calendarSource}>{calendar.source.name}</Text>
                </View>
                <View style={styles.calendarStatus}>
                  <Text style={styles.calendarStatusText}>
                    {calendar.allowsModifications ? '✓ Writable' : '👁 Read-only'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Google Calendar Integration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Google Calendar</Text>
          <Text style={styles.sectionDescription}>
            Connect your Google Calendar for cloud sync across all your devices.
          </Text>
          <TouchableOpacity 
            style={[styles.actionButton, styles.googleButton, loading && styles.disabledButton]}
            onPress={handleGoogleCalendarConnect}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>
              {loading ? '🔄 Connecting...' : '🔗 Connect Google Calendar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* How it Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ How Calendar Sync Works</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• THRIVE events appear in your device calendar</Text>
            <Text style={styles.infoItem}>• Your existing events are categorized and shown in THRIVE</Text>
            <Text style={styles.infoItem}>• Changes sync in both directions automatically</Text>
            <Text style={styles.infoItem}>• THRIVE events are marked with [THRIVE] tag</Text>
            <Text style={styles.infoItem}>• Fitness, mental health, and nutrition events are highlighted</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  syncingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  syncingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d63031',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#d63031',
    lineHeight: 16,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  calendarColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  calendarInfo: {
    flex: 1,
  },
  calendarName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  calendarSource: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  calendarStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f8f0',
    borderRadius: 6,
  },
  calendarStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#27ae60',
  },
  infoList: {
    marginTop: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default CalendarSettings;