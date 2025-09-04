/**
 * HealthPermissionsModal.tsx
 * 
 * User-friendly modal for health data permissions and setup
 * Guides users through connecting their health apps and wearable devices
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Alert, Platform } from 'react-native';
import { useHealthData } from './useHealthData';

// Import your existing colors
const THRIVE_COLORS = {
  primary: '#27AE60',
  accent: '#74B9FF',
  highlight: '#FF7675',
  neutral: '#ECECEC',
  white: '#FFFFFF',
  black: '#2C3E50',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  shadow: 'rgba(44, 62, 80, 0.1)',
};

interface HealthPermissionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
}

interface HealthSourceInfo {
  name: string;
  icon: string;
  description: string;
  platform: 'ios' | 'android' | 'both';
  status: 'available' | 'connected' | 'unavailable';
}

const HealthPermissionsModal: React.FC<HealthPermissionsModalProps> = ({
  visible,
  onClose,
  onSkip,
  showSkipOption = true
}) => {
  const { 
    syncStatus, 
    requestPermissions, 
    isInitializing,
    error 
  } = useHealthData();

  const [currentStep, setCurrentStep] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  const healthSources: HealthSourceInfo[] = [
    {
      name: 'Apple Health',
      icon: '🍎',
      description: 'Sync steps, workouts, heart rate, and more from your iPhone and Apple Watch',
      platform: 'ios',
      status: syncStatus.sources.appleHealth ? 'connected' : 'available'
    },
    {
      name: 'Google Health Connect',
      icon: '📊',
      description: 'Integrate with Google Fit and other Android health apps',
      platform: 'android',
      status: syncStatus.sources.googleHealth ? 'connected' : 'available'
    },
    {
      name: 'Samsung Health',
      icon: '⌚',
      description: 'Connect your Galaxy Watch and Samsung Health data',
      platform: 'android',
      status: syncStatus.sources.samsungHealth ? 'connected' : 'available'
    },
    {
      name: 'Apple Watch',
      icon: '⌚',
      description: 'Real-time heart rate, workouts, and activity tracking',
      platform: 'ios',
      status: syncStatus.sources.appleWatch ? 'connected' : 'available'
    },
    {
      name: 'Galaxy Watch',
      icon: '⌚',
      description: 'Fitness tracking and health monitoring from your Galaxy Watch',
      platform: 'android',
      status: syncStatus.sources.galaxyWatch ? 'connected' : 'available'
    }
  ];

  const availableSources = healthSources.filter(source => 
    source.platform === Platform.OS || source.platform === 'both'
  );

  const steps = [
    {
      title: 'Welcome to Health Sync!',
      description: 'Connect your health apps and wearable devices for automatic data tracking.',
      content: 'intro'
    },
    {
      title: 'Available Connections',
      description: 'Here are the health sources we can connect to on your device.',
      content: 'sources'
    },
    {
      title: 'Privacy & Permissions',
      description: 'Your health data is private and secure. We only read the data you authorize.',
      content: 'privacy'
    },
    {
      title: 'Connect Now',
      description: 'Ready to connect? This will open your device\'s health app for authorization.',
      content: 'connect'
    }
  ];

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      await requestPermissions();
      
      // The requestPermissions now handles the success alert and closes the modal
      // So we just need to close the modal after the process completes
      setTimeout(() => {
        setIsConnecting(false);
        onClose(); // Close the modal after successful connection
      }, 100);
      
    } catch (error) {
      console.error('Connection failed:', error);
      Alert.alert(
        'Connection Failed',
        'Unable to connect to health data. You can still enter data manually.',
        [{ text: 'OK', onPress: onClose }]
      );
      setIsConnecting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleConnect();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Health Connection?',
      'No problem! You can always connect your health apps later from your profile settings. For now, you can manually track your progress.',
      [
        { text: 'Go Back', style: 'cancel' },
        { 
          text: 'Skip for Now', 
          onPress: () => {
            console.log('🏥 User skipped health connection - will use manual entry');
            
            // Mark health permissions as "skipped" but completed
            // This ensures the modal doesn't show again
            if (onSkip) {
              onSkip();
            }
            
            // Show confirmation that manual entry is available
            setTimeout(() => {
              Alert.alert(
                'Manual Entry Ready! 📝',
                'You can now track your health data manually. Visit your profile anytime to connect health apps later.',
                [{ text: 'Got it!', onPress: onClose }]
              );
            }, 300);
          }
        }
      ]
    );
  };

  const renderIntroContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.benefitsList}>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>📱</Text>
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Automatic Tracking</Text>
            <Text style={styles.benefitDescription}>No more manual data entry</Text>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>🔄</Text>
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Real-time Sync</Text>
            <Text style={styles.benefitDescription}>Always up-to-date information</Text>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>🎯</Text>
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Accurate Insights</Text>
            <Text style={styles.benefitDescription}>Better progress tracking</Text>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>🔒</Text>
          <View style={styles.benefitTextContainer}>
            <Text style={styles.benefitTitle}>Private & Secure</Text>
            <Text style={styles.benefitDescription}>Your data stays on your device</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSourcesContent = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {availableSources.map((source, index) => (
        <View key={index} style={styles.sourceItem}>
          <View style={styles.sourceIcon}>
            <Text style={styles.sourceIconText}>{source.icon}</Text>
          </View>
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceName}>{source.name}</Text>
            <Text style={styles.sourceDescription}>{source.description}</Text>
          </View>
          <View style={[styles.statusBadge, 
            source.status === 'connected' ? styles.connectedBadge : styles.availableBadge
          ]}>
            <Text style={[styles.statusText,
              source.status === 'connected' ? styles.connectedText : styles.availableText
            ]}>
              {source.status === 'connected' ? 'Connected' : 'Available'}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderPrivacyContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.privacyList}>
        <View style={styles.privacyItem}>
          <Text style={styles.privacyIcon}>✅</Text>
          <Text style={styles.privacyText}>We only read the health data you authorize</Text>
        </View>
        
        <View style={styles.privacyItem}>
          <Text style={styles.privacyIcon}>✅</Text>
          <Text style={styles.privacyText}>Your data never leaves your device without permission</Text>
        </View>
        
        <View style={styles.privacyItem}>
          <Text style={styles.privacyIcon}>✅</Text>
          <Text style={styles.privacyText}>You can disconnect or modify permissions anytime</Text>
        </View>
        
        <View style={styles.privacyItem}>
          <Text style={styles.privacyIcon}>✅</Text>
          <Text style={styles.privacyText}>Data is encrypted and stored securely</Text>
        </View>
      </View>
      
      <Text style={styles.privacyNote}>
        Thrive respects your privacy. We follow all health data protection standards and regulations.
      </Text>
    </View>
  );

  const renderConnectContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.connectInfo}>
        <Text style={styles.connectTitle}>Ready to Connect</Text>
        <Text style={styles.connectDescription}>
          When you tap "Connect", your device's health app will open to request permissions. 
          You can choose which data types to share.
        </Text>
        
        <View style={styles.dataTypesList}>
          <Text style={styles.dataTypesTitle}>Data we'd like to access:</Text>
          <Text style={styles.dataType}>• Steps and distance</Text>
          <Text style={styles.dataType}>• Calories and active energy</Text>
          <Text style={styles.dataType}>• Heart rate</Text>
          <Text style={styles.dataType}>• Workouts and exercise</Text>
          <Text style={styles.dataType}>• Sleep data</Text>
          <Text style={styles.dataType}>• Weight and body measurements</Text>
          <Text style={styles.dataType}>• Mindfulness sessions</Text>
        </View>
        
        <View style={styles.alternativeOption}>
          <Text style={styles.alternativeTitle}>Prefer Manual Entry?</Text>
          <Text style={styles.alternativeDescription}>
            No problem! You can track your progress manually and connect health apps anytime later.
          </Text>
          <View 
            style={styles.manualEntryButton}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleSkip}
          >
            <Text style={styles.manualEntryButtonText}>Use Manual Entry Instead</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.content) {
      case 'intro':
        return renderIntroContent();
      case 'sources':
        return renderSourcesContent();
      case 'privacy':
        return renderPrivacyContent();
      case 'connect':
        return renderConnectContent();
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>
            Step {currentStep + 1} of {steps.length}
          </Text>
          
          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.description}>{steps[currentStep].description}</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View 
              style={[styles.progressBar, { 
                width: `${((currentStep + 1) / steps.length) * 100}%` 
              }]}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {renderStepContent()}
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {/* Skip Button */}
            {showSkipOption && (
              <View 
                style={styles.skipButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={handleSkip}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </View>
            )}
            
            {/* Back Button */}
            {currentStep > 0 && (
              <View 
                style={styles.backButton}
                onStartShouldSetResponder={() => true}
                onResponderGrant={handleBack}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </View>
            )}
            
            {/* Next/Connect Button */}
            <View 
              style={[styles.primaryButton, 
                (isConnecting || isInitializing) && styles.disabledButton
              ]}
              onStartShouldSetResponder={() => !(isConnecting || isInitializing)}
              onResponderGrant={handleNext}
            >
              <Text style={styles.primaryButtonText}>
                {isConnecting || isInitializing ? 'Connecting...' : 
                 currentStep === steps.length - 1 ? 'Connect Health Data' : 'Next'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: THRIVE_COLORS.white,
  },
  
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: THRIVE_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: THRIVE_COLORS.neutral,
  },
  
  stepIndicator: {
    fontSize: 14,
    color: THRIVE_COLORS.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
    marginBottom: 8,
  },
  
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  
  progressContainer: {
    height: 4,
    backgroundColor: THRIVE_COLORS.neutral,
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  progressBar: {
    height: '100%',
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 2,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  
  contentContainer: {
    flex: 1,
  },
  
  // Intro Content Styles
  benefitsList: {
    marginTop: 20,
  },
  
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  
  benefitIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  
  benefitTextContainer: {
    flex: 1,
  },
  
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
    marginBottom: 4,
  },
  
  benefitDescription: {
    fontSize: 14,
    color: '#666',
  },
  
  // Sources Content Styles
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THRIVE_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  sourceIconText: {
    fontSize: 20,
  },
  
  sourceInfo: {
    flex: 1,
    marginRight: 12,
  },
  
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
    marginBottom: 4,
  },
  
  sourceDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  connectedBadge: {
    backgroundColor: THRIVE_COLORS.success,
  },
  
  availableBadge: {
    backgroundColor: THRIVE_COLORS.neutral,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  connectedText: {
    color: THRIVE_COLORS.white,
  },
  
  availableText: {
    color: '#666',
  },
  
  // Privacy Content Styles
  privacyList: {
    marginTop: 20,
    marginBottom: 30,
  },
  
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  
  privacyIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  
  privacyText: {
    flex: 1,
    fontSize: 16,
    color: THRIVE_COLORS.black,
    lineHeight: 24,
  },
  
  privacyNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  
  // Connect Content Styles
  connectInfo: {
    marginTop: 20,
  },
  
  connectTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THRIVE_COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  connectDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 30,
    textAlign: 'center',
  },
  
  dataTypesList: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
  },
  
  dataTypesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
    marginBottom: 16,
  },
  
  dataType: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 4,
  },
  
  // Alternative Manual Entry Styles
  alternativeOption: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THRIVE_COLORS.accent,
  },
  
  alternativeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  alternativeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  
  manualEntryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: THRIVE_COLORS.accent,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  manualEntryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THRIVE_COLORS.white,
  },
  
  // Error Styles
  errorContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffebee',
    borderTopWidth: 1,
    borderTopColor: THRIVE_COLORS.error,
  },
  
  errorText: {
    fontSize: 14,
    color: THRIVE_COLORS.error,
    textAlign: 'center',
  },
  
  // Footer Styles
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: THRIVE_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: THRIVE_COLORS.neutral,
  },
  
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: THRIVE_COLORS.neutral,
    borderRadius: 8,
  },
  
  backButtonText: {
    fontSize: 16,
    color: THRIVE_COLORS.black,
    fontWeight: '600',
  },
  
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: THRIVE_COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  disabledButton: {
    backgroundColor: '#ccc',
  },
  
  primaryButtonText: {
    fontSize: 16,
    color: THRIVE_COLORS.white,
    fontWeight: '600',
  },
});

export default HealthPermissionsModal;