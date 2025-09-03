import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import AICoachService, { ChatMessage, CoachProfile } from './AICoachService';

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
  
  const scrollViewRef = useRef<ScrollView>(null);
  const modalAnimation = useRef(new Animated.Value(0)).current;
  
  // Load initial chat history
  useEffect(() => {
    setMessages(coachService.getChatHistory());
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
      await coachService.sendMessage(messageText);
      setMessages([...coachService.getChatHistory()]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputText(suggestion);
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
                  message.isTyping && styles.typingMessage
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' ? styles.userMessageText : styles.coachMessageText
                  ]}
                >
                  {message.text}
                </Text>
                {!message.isTyping && (
                  <Text style={styles.messageTime}>
                    {formatTime(message.timestamp)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Coach Alex anything..."
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
  },
  closeButtonText: {
    fontSize: 20,
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
});

export default AICoachModal;