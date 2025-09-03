import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import AICoachService, { ChatMessage, CoachProfile, UserAssessment, AssessmentQuestion } from './AICoachService';

// THRIVE Brand Colors
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
  lightGray: '#F8F9FA',
  mediumGray: '#6C757D'
};

interface AICoachModalProps {
  visible: boolean;
  onClose: () => void;
}

const AICoachModal: React.FC<AICoachModalProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coachService] = useState(() => AICoachService.getInstance());
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentData, setAssessmentData] = useState<any>({});
  const [capabilities, setCapabilities] = useState({ hasOpenAI: false, streaming: true, webSearch: true, agents: 0, mcp: false });
  
  const scrollViewRef = useRef<ScrollView>(null);
  const modalAnimation = useRef(new Animated.Value(0)).current;
  
  // Load initial chat history and capabilities
  useEffect(() => {
    setMessages(coachService.getChatHistory());
    setCapabilities(coachService.getCapabilities());
  }, [coachService]);

  // Animate modal
  useEffect(() => {
    if (visible) {
      Animated.timing(modalAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start();
    } else {
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  }, [visible, modalAnimation]);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const messageText = inputText.trim();
    setInputText('');
    setIsLoading(true);
    
    try {
      // Enhanced sendMessage with streaming support
      await coachService.sendMessage(messageText, () => {
        // Update messages in real-time during streaming
        setMessages([...coachService.getChatHistory()]);
      });
      
      // Final update
      setMessages([...coachService.getChatHistory()]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    if (suggestion.includes('assessment')) {
      setShowAssessment(true);
      return;
    }
    setInputText(suggestion);
  };
  
  const startAssessment = () => {
    setShowAssessment(true);
    setCurrentQuestion(0);
  };
  
  const handleAssessmentAnswer = (questionId: string, answer: any) => {
    setAssessmentData(prev => ({ ...prev, [questionId]: answer }));
    coachService.updateAssessmentData(questionId, answer);
  };
  
  const nextAssessmentQuestion = () => {
    const questions = coachService.getAssessmentQuestions();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Assessment complete
      coachService.completeAssessment();
      setShowAssessment(false);
      setMessages([...coachService.getChatHistory()]);
    }
  };
  
  const skipAssessment = () => {
    setShowAssessment(false);
    coachService.addCoachMessage("No problem! You can take the assessment anytime by asking me to 'start assessment'. I'm still here to help with any health and wellness questions you have! What would you like to know about?");
    setMessages([...coachService.getChatHistory()]);
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear the conversation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            coachService.clearChat();
            setMessages([...coachService.getChatHistory()]);
          }
        }
      ]
    );
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!visible) return null;

  const coachProfile = coachService.coachProfile;

  return (
    <Animated.View 
      style={[
        styles.modalOverlay,
        {
          opacity: modalAnimation,
          transform: [{
            scale: modalAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1]
            })
          }]
        }
      ]}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.coachInfo}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachAvatarText}>{coachProfile.avatar}</Text>
            </View>
            <View style={styles.coachDetails}>
              <Text style={styles.coachName}>{coachProfile.name}</Text>
              <Text style={styles.coachSpecialty}>{coachProfile.specialty}</Text>
              
              {/* Enhanced capabilities indicators */}
              <View style={styles.capabilitiesContainer}>
                {capabilities.hasOpenAI && (
                  <Text style={styles.capabilityBadge}>🤖 GPT-4.1</Text>
                )}
                {capabilities.streaming && (
                  <Text style={styles.capabilityBadge}>⚡ Streaming</Text>
                )}
                {capabilities.webSearch && (
                  <Text style={styles.capabilityBadge}>🔍 Web Search</Text>
                )}
                {capabilities.agents > 0 && (
                  <Text style={styles.capabilityBadge}>👥 {capabilities.agents} Agents</Text>
                )}
                {capabilities.mcp && (
                  <Text style={styles.capabilityBadge}>🔗 MCP</Text>
                )}
                {capabilities.costProtection && (
                  <Text style={[styles.capabilityBadge, styles.costProtectionBadge]}>🔒 FREE Mode</Text>
                )}
                {!capabilities.hasOpenAI && !capabilities.costProtection && (
                  <Text style={styles.capabilityBadge}>📝 Mock Mode</Text>
                )}
                {capabilities.hasOpenAI && !capabilities.costProtection && (
                  <Text style={[styles.capabilityBadge, styles.costWarningBadge]}>💰 Paid API</Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
              <Text style={styles.clearButtonText}>🗑️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.sender === 'user' ? styles.userMessageContainer : styles.coachMessageContainer
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.sender === 'user' ? styles.userMessage : styles.coachMessage,
                  (message.isTyping || message.isStreaming) && styles.typingMessage
                ]}
              >
                {/* Enhanced indicators for streaming and web search */}
                {message.sender === 'coach' && (message.hasWebSearch || message.isStreaming) && (
                  <View style={styles.messageIndicators}>
                    {message.hasWebSearch && (
                      <Text style={styles.webSearchIndicator}>🔍 Web Search</Text>
                    )}
                    {message.isStreaming && (
                      <Text style={styles.streamingIndicator}>⚡ Live AI</Text>
                    )}
                  </View>
                )}
                
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' ? styles.userMessageText : styles.coachMessageText
                  ]}
                >
                  {message.text}
                </Text>
                
                {message.isStreaming && (
                  <View style={styles.streamingCursor}>
                    <Text style={styles.cursorText}>|</Text>
                  </View>
                )}
                
                {!message.isTyping && !message.isStreaming && (
                  <Text style={styles.messageTime}>
                    {formatTime(message.timestamp)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Assessment Interface */}
        {showAssessment && (
          <View style={styles.assessmentContainer}>
            <View style={styles.assessmentHeader}>
              <Text style={styles.assessmentTitle}>Health Assessment</Text>
              <Text style={styles.assessmentProgress}>
                Question {currentQuestion + 1} of {coachService.getAssessmentQuestions().length}
              </Text>
            </View>
            
            {(() => {
              const questions = coachService.getAssessmentQuestions();
              const question = questions[currentQuestion];
              if (!question) return null;
              
              return (
                <View style={styles.questionContainer}>
                  <Text style={styles.questionText}>{question.question}</Text>
                  
                  {question.type === 'select' && (
                    <View style={styles.optionsContainer}>
                      {question.options?.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionButton,
                            assessmentData[question.id] === option && styles.selectedOption
                          ]}
                          onPress={() => handleAssessmentAnswer(question.id, option)}
                        >
                          <Text style={[
                            styles.optionText,
                            assessmentData[question.id] === option && styles.selectedOptionText
                          ]}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {question.type === 'scale' && (
                    <View style={styles.scaleContainer}>
                      <View style={styles.scaleNumbers}>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <TouchableOpacity
                            key={num}
                            style={[
                              styles.scaleButton,
                              assessmentData[question.id] === num && styles.selectedScale
                            ]}
                            onPress={() => handleAssessmentAnswer(question.id, num)}
                          >
                            <Text style={[
                              styles.scaleText,
                              assessmentData[question.id] === num && styles.selectedScaleText
                            ]}>{num}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {(question.type === 'text' || question.type === 'number') && (
                    <TextInput
                      style={styles.assessmentInput}
                      placeholder={question.type === 'number' ? 'Enter a number' : 'Type your answer'}
                      keyboardType={question.type === 'number' ? 'numeric' : 'default'}
                      value={assessmentData[question.id] || ''}
                      onChangeText={(text) => handleAssessmentAnswer(question.id, text)}
                    />
                  )}
                  
                  <View style={styles.assessmentActions}>
                    <TouchableOpacity style={styles.skipButton} onPress={skipAssessment}>
                      <Text style={styles.skipButtonText}>Skip Assessment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.nextButton,
                        !assessmentData[question.id] && styles.nextButtonDisabled
                      ]} 
                      onPress={nextAssessmentQuestion}
                      disabled={!assessmentData[question.id]}
                    >
                      <Text style={styles.nextButtonText}>
                        {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })()} 
          </View>
        )}
        
        {/* Quick Suggestions */}
        {!showAssessment && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Quick suggestions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {coachService.getQuickSuggestions().map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => handleQuickSuggestion(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        {!showAssessment && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask Bene anything about health science..."
              multiline
              maxLength={500}
              editable={!isLoading}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>
                {isLoading ? '⏳' : '📤'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modalContainer: {
    backgroundColor: THRIVE_COLORS.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    height: '90%',
    maxHeight: 700,
    shadowColor: THRIVE_COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THRIVE_COLORS.neutral,
    backgroundColor: THRIVE_COLORS.lightGray,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THRIVE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coachAvatarText: {
    fontSize: 24,
  },
  coachDetails: {
    flex: 1,
  },
  coachName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
  },
  coachSpecialty: {
    fontSize: 14,
    color: THRIVE_COLORS.mediumGray,
    marginTop: 2,
  },
  
  capabilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
  
  capabilityBadge: {
    fontSize: 10,
    color: THRIVE_COLORS.primary,
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '600',
  },
  
  costProtectionBadge: {
    color: '#28a745',
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    fontWeight: 'bold',
  },
  
  costWarningBadge: {
    color: '#dc3545',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 18,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THRIVE_COLORS.mediumGray,
  },
  chatContainer: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  coachMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    minWidth: 60,
  },
  userMessage: {
    backgroundColor: THRIVE_COLORS.primary,
    borderBottomRightRadius: 6,
  },
  coachMessage: {
    backgroundColor: THRIVE_COLORS.lightGray,
    borderBottomLeftRadius: 6,
  },
  typingMessage: {
    backgroundColor: THRIVE_COLORS.neutral,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: THRIVE_COLORS.white,
  },
  coachMessageText: {
    color: THRIVE_COLORS.black,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 4,
  },
  suggestionsContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: THRIVE_COLORS.neutral,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THRIVE_COLORS.mediumGray,
    marginBottom: 10,
  },
  suggestionButton: {
    backgroundColor: THRIVE_COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: THRIVE_COLORS.neutral,
  },
  suggestionText: {
    fontSize: 14,
    color: THRIVE_COLORS.black,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: THRIVE_COLORS.neutral,
    backgroundColor: THRIVE_COLORS.white,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: THRIVE_COLORS.neutral,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: THRIVE_COLORS.lightGray,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THRIVE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: THRIVE_COLORS.neutral,
  },
  sendButtonText: {
    fontSize: 18,
  },
  
  // Assessment Styles
  assessmentContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: THRIVE_COLORS.neutral,
    backgroundColor: THRIVE_COLORS.lightGray,
  },
  
  assessmentHeader: {
    marginBottom: 20,
  },
  
  assessmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THRIVE_COLORS.black,
    marginBottom: 5,
  },
  
  assessmentProgress: {
    fontSize: 14,
    color: THRIVE_COLORS.mediumGray,
  },
  
  questionContainer: {
    marginBottom: 20,
  },
  
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
    marginBottom: 15,
    lineHeight: 22,
  },
  
  optionsContainer: {
    marginBottom: 20,
  },
  
  optionButton: {
    backgroundColor: THRIVE_COLORS.white,
    borderWidth: 1,
    borderColor: THRIVE_COLORS.neutral,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  
  selectedOption: {
    backgroundColor: THRIVE_COLORS.primary,
    borderColor: THRIVE_COLORS.primary,
  },
  
  optionText: {
    fontSize: 15,
    color: THRIVE_COLORS.black,
  },
  
  selectedOptionText: {
    color: THRIVE_COLORS.white,
    fontWeight: '600',
  },
  
  scaleContainer: {
    marginBottom: 20,
  },
  
  scaleNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  scaleButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: THRIVE_COLORS.white,
    borderWidth: 1,
    borderColor: THRIVE_COLORS.neutral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  selectedScale: {
    backgroundColor: THRIVE_COLORS.primary,
    borderColor: THRIVE_COLORS.primary,
  },
  
  scaleText: {
    fontSize: 14,
    fontWeight: '600',
    color: THRIVE_COLORS.black,
  },
  
  selectedScaleText: {
    color: THRIVE_COLORS.white,
  },
  
  assessmentInput: {
    borderWidth: 1,
    borderColor: THRIVE_COLORS.neutral,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: THRIVE_COLORS.white,
    marginBottom: 20,
  },
  
  assessmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: THRIVE_COLORS.neutral,
  },
  
  skipButtonText: {
    fontSize: 16,
    color: THRIVE_COLORS.mediumGray,
    fontWeight: '600',
  },
  
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: THRIVE_COLORS.primary,
  },
  
  nextButtonDisabled: {
    backgroundColor: THRIVE_COLORS.neutral,
  },
  
  nextButtonText: {
    fontSize: 16,
    color: THRIVE_COLORS.white,
    fontWeight: 'bold',
  },
  
  // Enhanced message indicators
  messageIndicators: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 8,
  },
  
  webSearchIndicator: {
    fontSize: 11,
    color: THRIVE_COLORS.accent,
    fontWeight: '600',
    backgroundColor: 'rgba(116, 185, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  streamingIndicator: {
    fontSize: 11,
    color: THRIVE_COLORS.primary,
    fontWeight: '600',
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  streamingCursor: {
    alignItems: 'flex-end',
    marginTop: 2,
  },
  
  cursorText: {
    fontSize: 16,
    color: THRIVE_COLORS.primary,
    fontWeight: 'bold',
    opacity: 0.7,
  },
});

export default AICoachModal;