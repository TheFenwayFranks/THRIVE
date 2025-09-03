import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { DailyTask } from '../services/TaskGenerationService';
import { DailyTaskManager } from '../services/DailyTaskManager';

interface TaskDetailScreenProps {
  task: DailyTask;
  visible: boolean;
  onClose: () => void;
  onComplete: (performance: 'poor' | 'good' | 'excellent') => void;
  onStartTimer?: (duration: number) => void;
}

export default function TaskDetailScreen({
  task,
  visible,
  onClose,
  onComplete,
  onStartTimer,
}: TaskDetailScreenProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  
  // Timer for tracking time spent
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setIsStarted(false);
      setTimeSpent(0);
      setShowCompletion(false);
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(300);
    }
  }, [visible]);
  
  useEffect(() => {
    if (isStarted && !showCompletion) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, showCompletion]);
  
  const handleStartTask = () => {
    setIsStarted(true);
    if (onStartTimer) {
      onStartTimer(task.duration * 60); // Convert minutes to seconds
    }
    console.log(`🎯 TASK STARTED: ${task.title}`);
  };
  
  const handleNextStep = () => {
    if (currentStep < task.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowCompletion(true);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleCompleteTask = (performance: 'poor' | 'good' | 'excellent') => {
    setIsStarted(false);
    console.log('🎯 TaskDetailScreen: Calling onComplete with performance:', performance);
    onComplete(performance);
    // Don't show alert here - let the parent handle the completion flow
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getTaskTypeIcon = (type: string): string => {
    switch (type) {
      case 'fitness': return '💪';
      case 'mental_health': return '🧠';
      case 'mind_body': return '🧘';
      default: return '🎯';
    }
  };
  
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#4CAF50';
    }
  };
  
  if (!visible) return null;
  
  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <View style={styles.taskInfo}>
              <View style={styles.taskMeta}>
                <Text style={styles.taskTypeIcon}>{getTaskTypeIcon(task.type)}</Text>
                <Text style={styles.taskTypeName}>
                  {task.type.replace('_', ' ').toUpperCase()}
                </Text>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(task.difficulty) }]}>
                  <Text style={styles.difficultyText}>{task.difficulty}</Text>
                </View>
              </View>
              
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
              
              <View style={styles.taskStats}>
                <Text style={styles.taskDuration}>⏱️ {task.duration} minutes</Text>
                {isStarted && (
                  <Text style={styles.timeSpent}>Time: {formatTime(timeSpent)}</Text>
                )}
              </View>
            </View>
          </View>
          
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {!isStarted ? (
              // Pre-task overview
              <View style={styles.overviewSection}>
                <Text style={styles.sectionTitle}>What You'll Do</Text>
                
                <View style={styles.instructionsList}>
                  {task.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionPreview}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.instructionPreviewText}>{instruction}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.benefitsSection}>
                  <Text style={styles.sectionTitle}>Benefits</Text>
                  {task.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Text style={styles.benefitIcon}>✓</Text>
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.preparationSection}>
                  <Text style={styles.sectionTitle}>Preparation</Text>
                  <View style={styles.preparationList}>
                    <Text style={styles.preparationItem}>• Find a comfortable, quiet space</Text>
                    <Text style={styles.preparationItem}>• Ensure you won't be interrupted</Text>
                    <Text style={styles.preparationItem}>• Have water nearby if needed</Text>
                    {task.type === 'fitness' && (
                      <Text style={styles.preparationItem}>• Wear comfortable clothing</Text>
                    )}
                    {task.type === 'mental_health' && (
                      <Text style={styles.preparationItem}>• Sit or lie in a comfortable position</Text>
                    )}
                  </View>
                </View>
              </View>
            ) : !showCompletion ? (
              // Step-by-step instructions during task
              <View style={styles.activeTaskSection}>
                <View style={styles.progressIndicator}>
                  <Text style={styles.progressText}>
                    Step {currentStep + 1} of {task.instructions.length}
                  </Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${((currentStep + 1) / task.instructions.length) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.currentStepCard}>
                  <View style={styles.currentStepHeader}>
                    <View style={styles.stepNumberLarge}>
                      <Text style={styles.stepNumberLargeText}>{currentStep + 1}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.currentStepText}>
                    {task.instructions[currentStep]}
                  </Text>
                  
                  {/* Additional guidance based on step content */}
                  {task.instructions[currentStep].toLowerCase().includes('breathe') && (
                    <View style={styles.guidanceBox}>
                      <Text style={styles.guidanceTitle}>💨 Breathing Tip:</Text>
                      <Text style={styles.guidanceText}>
                        Focus on slow, deep breaths. Inhale through your nose, exhale through your mouth.
                      </Text>
                    </View>
                  )}
                  
                  {task.instructions[currentStep].toLowerCase().includes('stretch') && (
                    <View style={styles.guidanceBox}>
                      <Text style={styles.guidanceTitle}>🤸 Stretching Tip:</Text>
                      <Text style={styles.guidanceText}>
                        Never force a stretch. Go to a comfortable point and hold steadily.
                      </Text>
                    </View>
                  )}
                  
                  {task.instructions[currentStep].toLowerCase().includes('hold') && (
                    <View style={styles.guidanceBox}>
                      <Text style={styles.guidanceTitle}>⏰ Timing Tip:</Text>
                      <Text style={styles.guidanceText}>
                        Count slowly or use your breath as a timer. Quality over speed.
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.stepNavigation}>
                  <TouchableOpacity 
                    style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
                    onPress={handlePrevStep}
                    disabled={currentStep === 0}
                  >
                    <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
                      ← Previous
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.navButton}
                    onPress={handleNextStep}
                  >
                    <Text style={styles.navButtonText}>
                      {currentStep === task.instructions.length - 1 ? 'Finish' : 'Next →'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Completion screen
              <View style={styles.completionSection}>
                <Text style={styles.completionTitle}>🎉 Task Complete!</Text>
                <Text style={styles.completionSubtitle}>
                  You've finished "{task.title}"
                </Text>
                
                <View style={styles.completionStats}>
                  <Text style={styles.completionStat}>Time Spent: {formatTime(timeSpent)}</Text>
                  <Text style={styles.completionStat}>Steps Completed: {task.instructions.length}</Text>
                </View>
                
                <Text style={styles.performanceQuestion}>
                  How did you feel about this task?
                </Text>
                
                <View style={styles.performanceButtons}>
                  <TouchableOpacity 
                    style={[styles.performanceButton, styles.performancePoor]}
                    onPress={() => handleCompleteTask('poor')}
                  >
                    <Text style={styles.performanceEmoji}>😔</Text>
                    <Text style={styles.performanceLabel}>Challenging</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.performanceButton, styles.performanceGood]}
                    onPress={() => handleCompleteTask('good')}
                  >
                    <Text style={styles.performanceEmoji}>😊</Text>
                    <Text style={styles.performanceLabel}>Just Right</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.performanceButton, styles.performanceExcellent]}
                    onPress={() => handleCompleteTask('excellent')}
                  >
                    <Text style={styles.performanceEmoji}>🤩</Text>
                    <Text style={styles.performanceLabel}>Too Easy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
          
          {/* Bottom Action Bar */}
          <View style={styles.bottomBar}>
            {!isStarted ? (
              <TouchableOpacity style={styles.startButton} onPress={handleStartTask}>
                <Text style={styles.startButtonText}>Start Task</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.activeTaskBar}>
                <TouchableOpacity style={styles.pauseButton} onPress={() => setIsStarted(false)}>
                  <Text style={styles.pauseButtonText}>Pause</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.completeEarlyButton} 
                  onPress={() => setShowCompletion(true)}
                >
                  <Text style={styles.completeEarlyButtonText}>Complete Early</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: theme.colors.background || '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  taskInfo: {
    paddingRight: 50,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  taskTypeIcon: {
    fontSize: 20,
  },
  taskTypeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text || '#1F2937',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 12,
  },
  taskStats: {
    flexDirection: 'row',
    gap: 16,
  },
  taskDuration: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  timeSpent: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  
  // Overview Section
  overviewSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text || '#1F2937',
    marginBottom: 16,
  },
  instructionsList: {
    marginBottom: 24,
  },
  instructionPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructionPreviewText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  
  // Benefits Section
  benefitsSection: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  benefitIcon: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  benefitText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  
  // Preparation Section
  preparationSection: {
    marginBottom: 24,
  },
  preparationList: {
    gap: 8,
  },
  preparationItem: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  
  // Active Task Section
  activeTaskSection: {
    padding: 20,
  },
  progressIndicator: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  currentStepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  currentStepHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumberLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberLargeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currentStepText: {
    fontSize: 18,
    color: theme.colors.text || '#1F2937',
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  guidanceBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  guidanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  guidanceText: {
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 18,
  },
  stepNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#F9F9F9',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  navButtonTextDisabled: {
    color: '#CCCCCC',
  },
  
  // Completion Section
  completionSection: {
    padding: 20,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  completionStats: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  completionStat: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  performanceQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text || '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  performanceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  performancePoor: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  performanceGood: {
    backgroundColor: '#F0FDF4',
    borderColor: '#4CAF50',
  },
  performanceExcellent: {
    backgroundColor: '#E8F5E8',
    borderColor: '#2E7D32',
  },
  performanceEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Bottom Bar
  bottomBar: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeTaskBar: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pauseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeEarlyButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeEarlyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});