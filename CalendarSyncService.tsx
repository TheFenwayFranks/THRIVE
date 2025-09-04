import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

// Calendar Event Interface
export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  allDay?: boolean;
  category?: 'fitness' | 'mental' | 'nutrition' | 'medical' | 'personal' | 'work';
  isThrive?: boolean; // Flag to identify THRIVE-created events
  originalCalendarId?: string;
  syncId?: string; // For tracking sync status
  lastModified?: Date;
}

// Calendar Sync Status
export interface SyncStatus {
  lastSync: Date | null;
  isEnabled: boolean;
  connectedCalendars: string[];
  syncInProgress: boolean;
  errors: string[];
}

// Google Calendar Configuration
const GOOGLE_CALENDAR_CONFIG = {
  clientId: 'YOUR_GOOGLE_CLIENT_ID', // To be configured
  scopes: ['https://www.googleapis.com/auth/calendar'],
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'thrive-app'
  }),
};

class CalendarSyncService {
  private static instance: CalendarSyncService;
  private syncStatus: SyncStatus;
  private accessToken: string | null = null;
  private deviceCalendars: Calendar.Calendar[] = [];

  private constructor() {
    this.syncStatus = {
      lastSync: null,
      isEnabled: false,
      connectedCalendars: [],
      syncInProgress: false,
      errors: []
    };
  }

  public static getInstance(): CalendarSyncService {
    if (!CalendarSyncService.instance) {
      CalendarSyncService.instance = new CalendarSyncService();
    }
    return CalendarSyncService.instance;
  }

  // Check and request calendar permissions
  public async requestCalendarPermissions(): Promise<boolean> {
    try {
      console.log('🔐 Checking calendar permissions...');
      
      // Check if calendar is available
      const isAvailable = await Calendar.isAvailableAsync();
      if (!isAvailable) {
        const errorMsg = 'Calendar not available on this device';
        console.log(`❌ ${errorMsg}`);
        this.syncStatus.errors.push(errorMsg);
        return false;
      }
      
      console.log('✅ Calendar API is available');

      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      console.log(`🔐 Permission status: ${status}`);
      
      if (status !== 'granted') {
        const errorMsg = Platform.OS === 'ios' 
          ? 'iPhone calendar access denied. Please enable in Settings → Privacy & Security → Calendars → THRIVE'
          : 'Calendar permission not granted. Please allow calendar access in your device settings.';
        console.log(`❌ ${errorMsg}`);
        this.syncStatus.errors.push(errorMsg);
        return false;
      }

      console.log('✅ Calendar permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting calendar permissions:', error);
      this.syncStatus.errors.push(`Permission error: ${error}`);
      return false;
    }
  }

  // Get device calendars
  public async getDeviceCalendars(): Promise<Calendar.Calendar[]> {
    try {
      const hasPermission = await this.requestCalendarPermissions();
      if (!hasPermission) {
        return [];
      }

      console.log('📅 Fetching device calendars...');
      // Get all calendars
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      this.deviceCalendars = calendars;
      
      console.log(`📅 Found ${calendars.length} total calendars`);
      calendars.forEach(cal => {
        console.log(`  - ${cal.title} (${cal.source.name}) - Writable: ${cal.allowsModifications}`);
      });
      
      // Filter writable calendars (exclude system calendars like Birthdays)
      const writableCalendars = calendars.filter(cal => 
        cal.allowsModifications && 
        cal.source.name !== 'Birthdays' &&
        !cal.title.toLowerCase().includes('birthday')
      );
      
      console.log(`✅ ${writableCalendars.length} writable calendars available:`);
      writableCalendars.forEach(cal => {
        console.log(`  ✓ ${cal.title} (${cal.source.name})`);
      });

      this.syncStatus.connectedCalendars = writableCalendars.map(cal => cal.id);
      return writableCalendars;
    } catch (error) {
      console.error('❌ Error getting device calendars:', error);
      this.syncStatus.errors.push(`Error getting calendars: ${error}`);
      return [];
    }
  }

  // Get events from device calendars in date range
  public async getDeviceEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const calendars = await this.getDeviceCalendars();
      if (calendars.length === 0) {
        return [];
      }

      const calendarIds = calendars.map(cal => cal.id);
      const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);

      return events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.notes || '',
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        location: event.location,
        allDay: event.allDay,
        category: this.categorizeEvent(event.title, event.notes),
        isThrive: event.notes?.includes('[THRIVE]') || false,
        originalCalendarId: event.calendarId,
        lastModified: new Date(event.lastModifiedDate || event.creationDate)
      }));
    } catch (error) {
      console.error('Error getting device events:', error);
      this.syncStatus.errors.push(`Error getting events: ${error}`);
      return [];
    }
  }

  // Create event in device calendar
  public async createDeviceEvent(event: CalendarEvent, calendarId?: string): Promise<string | null> {
    try {
      const calendars = await this.getDeviceCalendars();
      if (calendars.length === 0) {
        throw new Error('No writable calendars available');
      }

      // Use specified calendar or default calendar
      const targetCalendarId = calendarId || calendars[0].id;
      
      const eventData = {
        title: event.title,
        notes: `${event.description || ''}\n[THRIVE] - Created by THRIVE Health App`,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        allDay: event.allDay || false,
      };

      const createdEventId = await Calendar.createEventAsync(targetCalendarId, eventData);
      return createdEventId;
    } catch (error) {
      console.error('Error creating device event:', error);
      this.syncStatus.errors.push(`Error creating event: ${error}`);
      return null;
    }
  }

  // Update existing device event
  public async updateDeviceEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.notes = `${updates.description}\n[THRIVE] - Updated by THRIVE Health App`;
      if (updates.startDate) updateData.startDate = updates.startDate;
      if (updates.endDate) updateData.endDate = updates.endDate;
      if (updates.location) updateData.location = updates.location;
      if (updates.allDay !== undefined) updateData.allDay = updates.allDay;

      await Calendar.updateEventAsync(eventId, updateData);
      return true;
    } catch (error) {
      console.error('Error updating device event:', error);
      this.syncStatus.errors.push(`Error updating event: ${error}`);
      return false;
    }
  }

  // Delete device event
  public async deleteDeviceEvent(eventId: string): Promise<boolean> {
    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      console.error('Error deleting device event:', error);
      this.syncStatus.errors.push(`Error deleting event: ${error}`);
      return false;
    }
  }

  // Google Calendar Authentication
  public async authenticateGoogleCalendar(): Promise<boolean> {
    try {
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CALENDAR_CONFIG.clientId,
        scopes: GOOGLE_CALENDAR_CONFIG.scopes,
        redirectUri: GOOGLE_CALENDAR_CONFIG.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        state: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          Math.random().toString(),
          { encoding: Crypto.CryptoEncoding.HEX }
        ),
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success' && result.params.code) {
        // Exchange code for access token
        const tokenResponse = await this.exchangeCodeForToken(result.params.code);
        if (tokenResponse) {
          this.accessToken = tokenResponse.access_token;
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Google Calendar authentication error:', error);
      this.syncStatus.errors.push(`Google auth error: ${error}`);
      return false;
    }
  }

  // Exchange authorization code for access token
  private async exchangeCodeForToken(code: string): Promise<any> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CALENDAR_CONFIG.clientId,
          code,
          grant_type: 'authorization_code',
          redirect_uri: GOOGLE_CALENDAR_CONFIG.redirectUri,
        }).toString(),
      });

      return await response.json();
    } catch (error) {
      console.error('Token exchange error:', error);
      return null;
    }
  }

  // Get Google Calendar events
  public async getGoogleCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google Calendar');
    }

    try {
      const timeMin = startDate.toISOString();
      const timeMax = endDate.toISOString();
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.items) {
        return data.items.map((item: any) => ({
          id: item.id,
          title: item.summary || 'Untitled Event',
          description: item.description || '',
          startDate: new Date(item.start.dateTime || item.start.date),
          endDate: new Date(item.end.dateTime || item.end.date),
          location: item.location,
          allDay: !item.start.dateTime,
          category: this.categorizeEvent(item.summary, item.description),
          isThrive: item.description?.includes('[THRIVE]') || false,
          syncId: item.id,
          lastModified: new Date(item.updated)
        }));
      }

      return [];
    } catch (error) {
      console.error('Error getting Google Calendar events:', error);
      this.syncStatus.errors.push(`Google Calendar error: ${error}`);
      return [];
    }
  }

  // Sync all calendars (bi-directional)
  public async syncCalendars(): Promise<void> {
    this.syncStatus.syncInProgress = true;
    this.syncStatus.errors = [];

    try {
      const platformEmoji = Platform.OS === 'ios' ? '📱' : Platform.OS === 'android' ? '🤖' : '💻';
      console.log(`🔄 Starting ${Platform.OS === 'ios' ? 'iPhone' : Platform.OS === 'android' ? 'Android' : 'device'} calendar synchronization...`);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // 30 days ago
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 90); // 90 days future

      console.log(`📅 Syncing events from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);

      // Get device calendars first
      const calendars = await this.getDeviceCalendars();
      console.log(`${platformEmoji} Found ${calendars.length} device calendars`);

      if (calendars.length === 0) {
        throw new Error('No accessible calendars found. Please check your calendar app and permissions.');
      }

      // Get events from device calendars
      const deviceEvents = await this.getDeviceEvents(startDate, endDate);
      console.log(`📋 Found ${deviceEvents.length} device events`);
      
      // Log sample events for debugging
      if (deviceEvents.length > 0) {
        console.log('📝 Sample events:');
        deviceEvents.slice(0, 3).forEach(event => {
          console.log(`  - "${event.title}" on ${event.startDate.toLocaleDateString()}`);
        });
      }
      
      // If Google Calendar is connected, sync with it too
      let googleEvents: CalendarEvent[] = [];
      if (this.accessToken) {
        console.log('🔗 Syncing with Google Calendar...');
        googleEvents = await this.getGoogleCalendarEvents(startDate, endDate);
        console.log(`☁️ Found ${googleEvents.length} Google Calendar events`);
      }

      // Combine all events
      const allEvents = [...deviceEvents, ...googleEvents];
      
      // Remove duplicates based on title and start time
      const uniqueEvents = allEvents.reduce((unique: CalendarEvent[], event) => {
        const exists = unique.find(e => 
          e.title === event.title && 
          e.startDate.getTime() === event.startDate.getTime()
        );
        if (!exists) {
          unique.push(event);
        }
        return unique;
      }, []);

      this.syncStatus.lastSync = new Date();
      this.syncStatus.isEnabled = true;
      this.syncStatus.connectedCalendars = calendars.map(cal => cal.id);

      console.log(`✅ ${Platform.OS === 'ios' ? 'iPhone' : 'Device'} calendar sync completed successfully!`);
      console.log(`📊 Total events: ${allEvents.length} (${uniqueEvents.length} unique)`);
      console.log(`🔗 Connected calendars: ${this.syncStatus.connectedCalendars.length}`);
      
    } catch (error) {
      console.error(`❌ ${Platform.OS === 'ios' ? 'iPhone' : 'Device'} calendar sync error:`, error);
      this.syncStatus.errors.push(`Sync error: ${error}`);
      throw error; // Re-throw so the UI can handle it
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }

  // Categorize events based on title and description
  private categorizeEvent(title?: string, description?: string): 'fitness' | 'mental' | 'nutrition' | 'medical' | 'personal' | 'work' {
    const text = `${title || ''} ${description || ''}`.toLowerCase();

    if (text.includes('workout') || text.includes('gym') || text.includes('run') || text.includes('fitness') || text.includes('exercise')) {
      return 'fitness';
    }
    if (text.includes('meditation') || text.includes('therapy') || text.includes('mindfulness') || text.includes('mental')) {
      return 'mental';
    }
    if (text.includes('meal') || text.includes('lunch') || text.includes('dinner') || text.includes('breakfast') || text.includes('nutrition')) {
      return 'nutrition';
    }
    if (text.includes('doctor') || text.includes('appointment') || text.includes('medical') || text.includes('checkup')) {
      return 'medical';
    }
    if (text.includes('work') || text.includes('meeting') || text.includes('conference') || text.includes('project')) {
      return 'work';
    }

    return 'personal';
  }

  // Get sync status
  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }
  
  // Get platform-specific sync instructions
  public getSyncInstructions(): string {
    if (Platform.OS === 'ios') {
      return 'This will sync your iPhone Calendar events with THRIVE. Make sure you have events in your iPhone Calendar app.';
    } else if (Platform.OS === 'android') {
      return 'This will sync your Android Calendar events with THRIVE. Make sure you have events in your Google Calendar or Samsung Calendar app.';
    } else {
      return 'This will sync your device calendar events with THRIVE.';
    }
  }
  
  // Get platform-specific error instructions
  public getPermissionInstructions(): string {
    if (Platform.OS === 'ios') {
      return 'To enable calendar access on iPhone:\n1. Go to Settings\n2. Scroll to THRIVE\n3. Tap Calendars\n4. Enable access';
    } else if (Platform.OS === 'android') {
      return 'To enable calendar access on Android:\n1. Go to Settings → Apps\n2. Find THRIVE\n3. Tap Permissions\n4. Enable Calendar access';
    } else {
      return 'Please enable calendar access in your device settings.';
    }
  }

  // Enable/disable sync
  public setSync(enabled: boolean): void {
    this.syncStatus.isEnabled = enabled;
    if (enabled) {
      // Trigger initial sync
      this.syncCalendars();
    }
  }

  // Open device calendar app to create event
  public async openCalendarToCreateEvent(event: Partial<CalendarEvent>): Promise<void> {
    try {
      console.log(`📱 Opening ${Platform.OS === 'ios' ? 'iPhone' : 'device'} calendar to create event...`);
      await Calendar.createEventInCalendarAsync({
        title: event.title || 'New Event',
        notes: event.description,
        startDate: event.startDate || new Date(),
        endDate: event.endDate || new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
        location: event.location,
        allDay: event.allDay || false,
      });
      console.log('✅ Calendar app opened successfully');
    } catch (error) {
      console.error('❌ Error opening calendar:', error);
      this.syncStatus.errors.push(`Error opening calendar: ${error}`);
    }
  }
  
  // Get calendar summary for display
  public getCalendarSummary(): { totalCalendars: number; totalEvents: number; platformName: string } {
    const platformName = Platform.OS === 'ios' ? 'iPhone' : Platform.OS === 'android' ? 'Android' : 'Device';
    return {
      totalCalendars: this.syncStatus.connectedCalendars.length,
      totalEvents: 0, // This would need to be tracked separately
      platformName
    };
  }
}

export default CalendarSyncService;