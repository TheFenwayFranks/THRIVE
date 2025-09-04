import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';

// Event Categories with Colors (matching our existing color scheme)
export const EVENT_CATEGORIES = {
  fitness: {
    name: 'Fitness & Exercise',
    icon: '💪',
    color: '#FF3B30',
    lightColor: '#FFE8E7',
  },
  mental: {
    name: 'Mental Health',
    icon: '🧘‍♀️',
    color: '#007AFF',
    lightColor: '#E8F4FD',
  },
  nutrition: {
    name: 'Nutrition & Meals',
    icon: '🍎',
    color: '#FF9500',
    lightColor: '#FFF3E0',
  },
  medical: {
    name: 'Medical & Health',
    icon: '🏥',
    color: '#AF52DE',
    lightColor: '#F3E8FF',
  },
  work: {
    name: 'Work & Professional',
    icon: '💼',
    color: '#5856D6',
    lightColor: '#EEEEFF',
  },
  social: {
    name: 'Social & Personal',
    icon: '👥',
    color: '#34C759',
    lightColor: '#E8F8EA',
  },
  learning: {
    name: 'Learning & Education',
    icon: '📚',
    color: '#795548',
    lightColor: '#F0EFEF',
  },
  reminder: {
    name: 'Reminders & Tasks',
    icon: '⏰',
    color: '#8E8E93',
    lightColor: '#F2F2F7',
  },
};

interface EventCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (eventData: EventFormData) => Promise<void>;
  initialDate?: Date;
}

export interface EventFormData {
  title: string;
  description: string;
  category: keyof typeof EVENT_CATEGORIES;
  startDate: Date;
  endDate: Date;
  location: string;
  isAllDay: boolean;
  reminders: number[]; // minutes before event
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
}

const EventCreationModal: React.FC<EventCreationModalProps> = ({
  visible,
  onClose,
  onSave,
  initialDate,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: 'fitness',
    startDate: initialDate || new Date(),
    endDate: initialDate || new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    location: '',
    isAllDay: false,
    reminders: [15], // 15 minutes before
    isRecurring: false,
    recurrencePattern: undefined,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [saving, setSaving] = useState(false);
  
  // Date/Time picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // Calendar picker state
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Reset form when modal opens
  useEffect(() => {
    if (visible && initialDate) {
      const startDate = new Date(initialDate);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      
      setFormData(prev => ({
        ...prev,
        startDate,
        endDate,
      }));
    }
  }, [visible, initialDate]);

  // Quick event templates
  const quickTemplates = [
    {
      title: 'Morning Workout',
      category: 'fitness' as const,
      duration: 60, // minutes
      description: '30-60 minute workout session',
    },
    {
      title: 'Meditation Break',
      category: 'mental' as const,
      duration: 15,
      description: 'Mindfulness and meditation practice',
    },
    {
      title: 'Healthy Meal',
      category: 'nutrition' as const,
      duration: 30,
      description: 'Plan and prepare nutritious meal',
    },
    {
      title: 'Doctor Appointment',
      category: 'medical' as const,
      duration: 60,
      description: 'Medical appointment or check-up',
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (formData.endDate <= formData.startDate) {
      newErrors.endDate = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('🔄 Save button clicked');
    console.log('📝 Form data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setSaving(true);
    console.log('💾 Starting save process...');
    
    try {
      await onSave(formData);
      console.log('✅ Save successful, closing modal');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'fitness',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 60 * 1000),
        location: '',
        isAllDay: false,
        reminders: [15],
        isRecurring: false,
        recurrencePattern: undefined,
      });
      
      onClose();
    } catch (error) {
      console.error('❌ Save failed:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (template: typeof quickTemplates[0]) => {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate.getTime() + template.duration * 60 * 1000);

    setFormData(prev => ({
      ...prev,
      title: template.title,
      category: template.category,
      description: template.description,
      endDate,
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(calendarDate);
    const firstDay = getFirstDayOfMonth(calendarDate);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day));
    }
    
    return days;
  };
  
  const navigateCalendar = (direction: 'prev' | 'next') => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };
  
  const selectDate = (date: Date, isStart: boolean) => {
    if (isStart) {
      const newStartDate = new Date(date);
      newStartDate.setHours(formData.startDate.getHours(), formData.startDate.getMinutes());
      
      // Maintain duration
      const duration = formData.endDate.getTime() - formData.startDate.getTime();
      const newEndDate = new Date(newStartDate.getTime() + duration);
      
      setFormData(prev => ({
        ...prev,
        startDate: newStartDate,
        endDate: newEndDate,
      }));
      setShowStartDatePicker(false);
    } else {
      const newEndDate = new Date(date);
      newEndDate.setHours(formData.endDate.getHours(), formData.endDate.getMinutes());
      
      setFormData(prev => ({
        ...prev,
        endDate: newEndDate,
      }));
      setShowEndDatePicker(false);
    }
  };
  
  const selectTime = (hours: number, minutes: number, isStart: boolean) => {
    if (isStart) {
      const newStartDate = new Date(formData.startDate);
      newStartDate.setHours(hours, minutes);
      
      // Ensure end is after start
      let newEndDate = new Date(formData.endDate);
      if (newEndDate <= newStartDate) {
        newEndDate = new Date(newStartDate.getTime() + 60 * 60 * 1000); // Add 1 hour
      }
      
      setFormData(prev => ({
        ...prev,
        startDate: newStartDate,
        endDate: newEndDate,
      }));
      setShowStartTimePicker(false);
    } else {
      const newEndDate = new Date(formData.endDate);
      newEndDate.setHours(hours, minutes);
      
      setFormData(prev => ({
        ...prev,
        endDate: newEndDate,
      }));
      setShowEndTimePicker(false);
    }
  };

  if (!visible) return null;

  const selectedCategory = EVENT_CATEGORIES[formData.category];

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>New Event</Text>
          
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Templates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Templates</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesContainer}>
              {quickTemplates.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.templateCard,
                    { backgroundColor: EVENT_CATEGORIES[template.category].lightColor }
                  ]}
                  onPress={() => applyTemplate(template)}
                >
                  <Text style={styles.templateIcon}>
                    {EVENT_CATEGORIES[template.category].icon}
                  </Text>
                  <Text style={styles.templateTitle}>{template.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Event Title */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Event Title *</Text>
            <TextInput
              style={[styles.textInput, errors.title && styles.textInputError]}
              value={formData.title}
              onChangeText={(title) => setFormData(prev => ({ ...prev, title }))}
              placeholder="Enter event title..."
              placeholderTextColor="#999"
              maxLength={100}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
              {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryCard,
                    { backgroundColor: category.lightColor },
                    formData.category === key && { 
                      borderColor: category.color, 
                      borderWidth: 2 
                    }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, category: key as keyof typeof EVENT_CATEGORIES }))}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryName,
                    formData.category === key && { 
                      color: category.color, 
                      fontWeight: '600' 
                    }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date and Time */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>When</Text>
            
            {/* All Day Toggle */}
            <TouchableOpacity
              style={styles.allDayToggle}
              onPress={() => setFormData(prev => ({ ...prev, isAllDay: !prev.isAllDay }))}
            >
              <View style={[styles.toggle, formData.isAllDay && styles.toggleActive]} />
              <Text style={styles.allDayText}>All Day</Text>
            </TouchableOpacity>

            {/* Date and Time Inputs */}
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeRow}>
                <Text style={styles.dateTimeLabel}>Starts</Text>
                <View style={styles.dateTimeInputs}>
                  <TouchableOpacity 
                    style={styles.dateInput}
                    onPress={() => {
                      setCalendarDate(formData.startDate);
                      setShowStartDatePicker(!showStartDatePicker);
                    }}
                  >
                    <Text style={styles.dateText}>{formatDate(formData.startDate)}</Text>
                  </TouchableOpacity>
                  {!formData.isAllDay && (
                    <TouchableOpacity 
                      style={styles.timeInput}
                      onPress={() => setShowStartTimePicker(!showStartTimePicker)}
                    >
                      <Text style={styles.timeText}>{formatTime(formData.startDate)}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.dateTimeRow}>
                <Text style={styles.dateTimeLabel}>Ends</Text>
                <View style={styles.dateTimeInputs}>
                  <TouchableOpacity 
                    style={styles.dateInput}
                    onPress={() => {
                      setCalendarDate(formData.endDate);
                      setShowEndDatePicker(!showEndDatePicker);
                    }}
                  >
                    <Text style={styles.dateText}>{formatDate(formData.endDate)}</Text>
                  </TouchableOpacity>
                  {!formData.isAllDay && (
                    <TouchableOpacity 
                      style={styles.timeInput}
                      onPress={() => setShowEndTimePicker(!showEndTimePicker)}
                    >
                      <Text style={styles.timeText}>{formatTime(formData.endDate)}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Mini Calendar Popups */}
            {showStartDatePicker && (
              <View style={styles.calendarPopup}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity
                    style={styles.calendarNavButton}
                    onPress={() => navigateCalendar('prev')}
                  >
                    <Text style={styles.calendarNavText}>‹</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.calendarMonth}>
                    {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.calendarNavButton}
                    onPress={() => navigateCalendar('next')}
                  >
                    <Text style={styles.calendarNavText}>›</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.calendarWeekdays}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <View key={index} style={styles.calendarWeekday}>
                      <Text style={styles.calendarWeekdayText}>{day}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {getCalendarDays().map((date, index) => {
                    if (!date) {
                      return <View key={index} style={styles.calendarEmptyDay} />;
                    }
                    
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = date.toDateString() === formData.startDate.toDateString();
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.calendarDay,
                          isToday && styles.calendarToday,
                          isSelected && styles.calendarSelected
                        ]}
                        onPress={() => selectDate(date, true)}
                      >
                        <Text style={[
                          styles.calendarDayText,
                          isToday && styles.calendarTodayText,
                          isSelected && styles.calendarSelectedText
                        ]}>
                          {date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.calendarDone}
                  onPress={() => setShowStartDatePicker(false)}
                >
                  <Text style={styles.calendarDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            {showEndDatePicker && (
              <View style={styles.calendarPopup}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity
                    style={styles.calendarNavButton}
                    onPress={() => navigateCalendar('prev')}
                  >
                    <Text style={styles.calendarNavText}>‹</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.calendarMonth}>
                    {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.calendarNavButton}
                    onPress={() => navigateCalendar('next')}
                  >
                    <Text style={styles.calendarNavText}>›</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.calendarWeekdays}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <View key={index} style={styles.calendarWeekday}>
                      <Text style={styles.calendarWeekdayText}>{day}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {getCalendarDays().map((date, index) => {
                    if (!date) {
                      return <View key={index} style={styles.calendarEmptyDay} />;
                    }
                    
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = date.toDateString() === formData.endDate.toDateString();
                    const isBeforeStart = date < formData.startDate;
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.calendarDay,
                          isToday && styles.calendarToday,
                          isSelected && styles.calendarSelected,
                          isBeforeStart && styles.calendarDisabled
                        ]}
                        onPress={() => !isBeforeStart && selectDate(date, false)}
                        disabled={isBeforeStart}
                      >
                        <Text style={[
                          styles.calendarDayText,
                          isToday && styles.calendarTodayText,
                          isSelected && styles.calendarSelectedText,
                          isBeforeStart && styles.calendarDisabledText
                        ]}>
                          {date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.calendarDone}
                  onPress={() => setShowEndDatePicker(false)}
                >
                  <Text style={styles.calendarDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Time Pickers */}
            {showStartTimePicker && (
              <View style={styles.timePickerPopup}>
                <Text style={styles.timePickerTitle}>Select Start Time</Text>
                <View style={styles.timeOptions}>
                  {[
                    { label: 'Now', time: new Date() },
                    { label: '6:00 AM', hours: 6, minutes: 0 },
                    { label: '7:00 AM', hours: 7, minutes: 0 },
                    { label: '8:00 AM', hours: 8, minutes: 0 },
                    { label: '9:00 AM', hours: 9, minutes: 0 },
                    { label: '12:00 PM', hours: 12, minutes: 0 },
                    { label: '1:00 PM', hours: 13, minutes: 0 },
                    { label: '5:00 PM', hours: 17, minutes: 0 },
                    { label: '6:00 PM', hours: 18, minutes: 0 },
                    { label: '7:00 PM', hours: 19, minutes: 0 },
                  ].map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.timeOption}
                      onPress={() => {
                        if (option.time) {
                          selectTime(option.time.getHours(), option.time.getMinutes(), true);
                        } else {
                          selectTime(option.hours!, option.minutes!, true);
                        }
                      }}
                    >
                      <Text style={styles.timeOptionText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.timePickerDone}
                  onPress={() => setShowStartTimePicker(false)}
                >
                  <Text style={styles.timePickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            {showEndTimePicker && (
              <View style={styles.timePickerPopup}>
                <Text style={styles.timePickerTitle}>Select End Time</Text>
                <View style={styles.timeOptions}>
                  {[
                    { label: '+30 min', minutes: 30 },
                    { label: '+1 hour', minutes: 60 },
                    { label: '+1.5 hours', minutes: 90 },
                    { label: '+2 hours', minutes: 120 },
                    { label: '+3 hours', minutes: 180 },
                    { label: 'End of day', hours: 23, minutes: 59 },
                  ].map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.timeOption}
                      onPress={() => {
                        if (option.minutes) {
                          const endTime = new Date(formData.startDate.getTime() + option.minutes * 60 * 1000);
                          selectTime(endTime.getHours(), endTime.getMinutes(), false);
                        } else {
                          selectTime(option.hours!, option.minutes!, false);
                        }
                      }}
                    >
                      <Text style={styles.timeOptionText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.timePickerDone}
                  onPress={() => setShowEndTimePicker(false)}
                >
                  <Text style={styles.timePickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
            {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              value={formData.location}
              onChangeText={(location) => setFormData(prev => ({ ...prev, location }))}
              placeholder="Add location..."
              placeholderTextColor="#999"
              maxLength={200}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={formData.description}
              onChangeText={(description) => setFormData(prev => ({ ...prev, description }))}
              placeholder="Add description..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          {/* Advanced Options Toggle */}
          <TouchableOpacity
            style={styles.advancedToggle}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Text style={styles.advancedToggleText}>
              Advanced Options {showAdvanced ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {/* Advanced Options */}
          {showAdvanced && (
            <View style={styles.advancedSection}>
              {/* Reminders */}
              <View style={styles.section}>
                <Text style={styles.inputLabel}>Reminders</Text>
                <View style={styles.reminderOptions}>
                  {[5, 15, 30, 60].map((minutes) => (
                    <TouchableOpacity
                      key={minutes}
                      style={[
                        styles.reminderOption,
                        formData.reminders.includes(minutes) && styles.reminderOptionSelected
                      ]}
                      onPress={() => {
                        const newReminders = formData.reminders.includes(minutes)
                          ? formData.reminders.filter(r => r !== minutes)
                          : [...formData.reminders, minutes];
                        setFormData(prev => ({ ...prev, reminders: newReminders }));
                      }}
                    >
                      <Text style={[
                        styles.reminderOptionText,
                        formData.reminders.includes(minutes) && styles.reminderOptionTextSelected
                      ]}>
                        {minutes}m before
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Recurring */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.allDayToggle}
                  onPress={() => setFormData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                >
                  <View style={[styles.toggle, formData.isRecurring && styles.toggleActive]} />
                  <Text style={styles.allDayText}>Recurring Event</Text>
                </TouchableOpacity>

                {formData.isRecurring && (
                  <View style={styles.recurrenceOptions}>
                    {(['daily', 'weekly', 'monthly'] as const).map((pattern) => (
                      <TouchableOpacity
                        key={pattern}
                        style={[
                          styles.reminderOption,
                          formData.recurrencePattern === pattern && styles.reminderOptionSelected
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, recurrencePattern: pattern }))}
                      >
                        <Text style={[
                          styles.reminderOptionText,
                          formData.recurrencePattern === pattern && styles.reminderOptionTextSelected
                        ]}>
                          {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={[styles.previewCard, { backgroundColor: selectedCategory.lightColor }]}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewIcon}>{selectedCategory.icon}</Text>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewTitle}>
                    {formData.title || 'Untitled Event'}
                  </Text>
                  <Text style={styles.previewCategory}>{selectedCategory.name}</Text>
                </View>
                <View style={[styles.previewColorBar, { backgroundColor: selectedCategory.color }]} />
              </View>
              
              <View style={styles.previewDetails}>
                <Text style={styles.previewDateTime}>
                  {formData.isAllDay 
                    ? `${formatDate(formData.startDate)} - All Day`
                    : `${formatDate(formData.startDate)} at ${formatTime(formData.startDate)}`
                  }
                </Text>
                {formData.location && (
                  <Text style={styles.previewLocation}>📍 {formData.location}</Text>
                )}
                {formData.description && (
                  <Text style={styles.previewDescription} numberOfLines={2}>
                    {formData.description}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  section: {
    marginTop: 20,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  
  textInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
  },
  
  textInputError: {
    borderColor: '#FF3B30',
  },
  
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  
  // Templates
  templatesContainer: {
    marginTop: 8,
  },
  
  templateCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 80,
  },
  
  templateIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  
  templateTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
  
  // Categories
  categoriesContainer: {
    marginTop: 8,
  },
  
  categoryCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  
  categoryName: {
    fontSize: 11,
    textAlign: 'center',
    color: '#333',
  },
  
  // Date Time
  allDayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  toggle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 8,
  },
  
  toggleActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  
  allDayText: {
    fontSize: 14,
    color: '#333',
  },
  
  dateTimeContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  dateTimeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    width: 50,
  },
  
  dateTimeInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  
  dateInput: {
    flex: 2,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  
  timeInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  
  dateText: {
    fontSize: 14,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  
  timeText: {
    fontSize: 14,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  
  // Advanced Options
  advancedToggle: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  
  advancedToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  
  advancedSection: {
    marginTop: 8,
  },
  
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  
  reminderOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  reminderOptionSelected: {
    backgroundColor: '#007AFF',
  },
  
  reminderOptionText: {
    fontSize: 12,
    color: '#666',
  },
  
  reminderOptionTextSelected: {
    color: '#fff',
  },
  
  recurrenceOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  
  // Preview
  previewCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  previewIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  
  previewInfo: {
    flex: 1,
  },
  
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  
  previewCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  previewColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  
  previewDetails: {
    paddingLeft: 36,
  },
  
  previewDateTime: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  
  previewLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  previewDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  
  // Mini Calendar Styles
  calendarPopup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  calendarNavButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  calendarNavText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  
  calendarMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  
  calendarWeekday: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  
  calendarWeekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  calendarDay: {
    width: '14.28571%', // 1/7 of width
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 2,
  },
  
  calendarEmptyDay: {
    width: '14.28571%',
    aspectRatio: 1,
  },
  
  calendarToday: {
    backgroundColor: '#34C759',
  },
  
  calendarSelected: {
    backgroundColor: '#007AFF',
  },
  
  calendarDisabled: {
    opacity: 0.3,
  },
  
  calendarDayText: {
    fontSize: 14,
    color: '#333',
  },
  
  calendarTodayText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  calendarSelectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  calendarDisabledText: {
    color: '#ccc',
  },
  
  calendarDone: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  
  calendarDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Time Picker Styles
  timePickerPopup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  timePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  
  timeOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  
  timeOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  
  timePickerDone: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  
  timePickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EventCreationModal;