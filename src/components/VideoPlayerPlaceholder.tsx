import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal
} from 'react-native';

interface VideoPlayerPlaceholderProps {
  visible: boolean;
  onClose: () => void;
  workoutName: string;
}

export default function VideoPlayerPlaceholder({ visible, onClose, workoutName }: VideoPlayerPlaceholderProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.playerContainer}>
          {/* Video Placeholder */}
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoIcon}>🎥</Text>
            <Text style={styles.videoTitle}>{workoutName}</Text>
            <Text style={styles.comingSoonText}>Video demos coming soon!</Text>
            <Text style={styles.descriptionText}>
              We're working on high-quality exercise demonstration videos to help you perform each movement safely and effectively.
            </Text>
          </View>

          {/* Controls Placeholder */}
          <View style={styles.controlsPlaceholder}>
            <TouchableOpacity style={[styles.controlButton, styles.disabled]} disabled>
              <Text style={styles.controlIcon}>⏯️</Text>
            </TouchableOpacity>
            
            <View style={styles.progressPlaceholder}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.timeText}>0:00 / 0:00</Text>
            </View>

            <TouchableOpacity style={[styles.controlButton, styles.disabled]} disabled>
              <Text style={styles.controlIcon}>🔊</Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close Preview</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerContainer: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  videoPlaceholder: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
    marginBottom: 20,
  },
  videoIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  controlsPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#374151',
    borderRadius: 8,
    marginBottom: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  controlIcon: {
    fontSize: 18,
  },
  progressPlaceholder: {
    flex: 1,
    marginHorizontal: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#4B5563',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    width: '0%',
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});