import React from 'react';
import { OpenAI } from 'openai';

// Enhanced OpenAI Integration for AI Coach with Streaming and Web Search
// Features: Streaming responses, web search, advanced health coaching
// Note: In production, use environment variables for API keys

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: Date;
  isTyping?: boolean;
  isStreaming?: boolean;
  hasWebSearch?: boolean;
  searchResults?: string[];
}

export interface StreamingConfig {
  enabled: boolean;
  chunkDelay: number;
}

export interface WebSearchConfig {
  enabled: boolean;
  maxResults: number;
}

export interface CoachProfile {
  name: string;
  avatar: string;
  specialty: string;
  description: string;
}

class AICoachService {
  private static instance: AICoachService;
  private chatHistory: ChatMessage[] = [];
  
  // Enhanced AI capabilities
  private userAssessment: UserAssessment;
  private currentAssessmentStep: number = 0;
  private assessmentQuestions: AssessmentQuestion[] = [];
  private openaiClient: OpenAI | null = null;
  private streamingConfig: StreamingConfig = { enabled: true, chunkDelay: 50 };
  private webSearchConfig: WebSearchConfig = { enabled: true, maxResults: 3 };
  
  // AI Coach Profile - Bene!
  public readonly coachProfile: CoachProfile = {
    name: "Bene",
    avatar: "🧠",
    specialty: "Advanced Health Science & Wellness",
    description: "Your beneficial AI health coach with deep expertise in physical and mental wellness science!"
  };

  public static getInstance(): AICoachService {
    if (!AICoachService.instance) {
      AICoachService.instance = new AICoachService();
    }
    return AICoachService.instance;
  }

  private constructor() {
    // Initialize OpenAI client (will be enabled when API key is provided)
    this.initializeOpenAI();
    
    // Initialize user assessment
    this.userAssessment = {
      hasCompletedAssessment: false,
      personalInfo: {},
      fitnessProfile: {},
      mentalHealthProfile: {},
      healthMetrics: {},
      lifestyle: {}
    };
    
    // Initialize assessment questions
    this.initializeAssessmentQuestions();
    
    // Initialize with enhanced welcome message
    this.chatHistory.push({
      id: Date.now().toString(),
      text: "Hello! I'm Bene, your beneficial AI health coach with deep expertise in health science, fitness, and mental wellness. 🧠💪\n\nI'm equipped with:\n• Real-time web search for latest health research\n• Streaming responses for natural conversation\n• Comprehensive health assessment system\n\nBefore we begin your personalized health journey, I'd love to get to know you better through a comprehensive assessment. This will help me provide you with evidence-based, personalized recommendations.\n\nWould you like to start your health assessment now?",
      sender: 'coach',
      timestamp: new Date()
    });
  }
  
  // Initialize OpenAI client with enhanced capabilities
  private initializeOpenAI(): void {
    try {
      // Check if API key is available in environment
      const apiKey = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
      
      if (apiKey) {
        this.openaiClient = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true // Only for development
        });
        console.log('🎆 Bene: Enhanced OpenAI capabilities initialized!');
      } else {
        console.log('📝 Bene: Using mock responses (set OPENAI_API_KEY for live AI)');
      }
    } catch (error) {
      console.warn('⚠️ Bene: OpenAI initialization failed, using mock responses:', error);
      this.openaiClient = null;
    }
  }

  // Get chat history
  public getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  // Add user message
  public addUserMessage(text: string): ChatMessage {
    const message: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    this.chatHistory.push(message);
    return message;
  }

  // Add coach message
  public addCoachMessage(text: string): ChatMessage {
    const message: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'coach',
      timestamp: new Date()
    };
    
    this.chatHistory.push(message);
    return message;
  }

  // Enhanced AI response generation with streaming and web search
  public async generateCoachResponse(userMessage: string, onStream?: (chunk: string) => void): Promise<string> {
    console.log('🤖 Bene generating enhanced response for:', userMessage);
    
    try {
      // Check if we should use web search for current health information
      const needsWebSearch = this.shouldUseWebSearch(userMessage);
      
      if (this.openaiClient && this.isValidForLiveAI(userMessage)) {
        return await this.generateLiveAIResponse(userMessage, needsWebSearch, onStream);
      } else {
        // Enhanced mock responses with simulated streaming
        return await this.generateEnhancedMockResponse(userMessage, onStream);
      }
    } catch (error) {
      console.error('Error generating coach response:', error);
      return "I'm experiencing a temporary issue. Let me try a different approach to help you with your health question!";
    }
  }
  
  // Determine if web search should be used
  private shouldUseWebSearch(userMessage: string): boolean {
    if (!this.webSearchConfig.enabled) return false;
    
    const searchTriggers = [
      'latest', 'recent', 'new study', 'current research', 'today', '2024', '2025',
      'breaking', 'news', 'update', 'recent findings', 'latest research'
    ];
    
    return searchTriggers.some(trigger => 
      userMessage.toLowerCase().includes(trigger)
    );
  }
  
  // Check if message is suitable for live AI (avoid simple greetings for API efficiency)
  private isValidForLiveAI(userMessage: string): boolean {
    const message = userMessage.toLowerCase().trim();
    const simpleGreetings = ['hi', 'hello', 'hey', 'yes', 'no', 'ok', 'thanks'];
    
    return message.length > 10 && !simpleGreetings.includes(message);
  }
  
  // Generate response using live OpenAI API with enhanced features
  private async generateLiveAIResponse(userMessage: string, useWebSearch: boolean, onStream?: (chunk: string) => void): Promise<string> {
    if (!this.openaiClient) throw new Error('OpenAI client not initialized');
    
    const tools = [];
    if (useWebSearch) {
      tools.push({ type: "web_search" });
    }
    
    const systemPrompt = this.buildEnhancedSystemPrompt();
    
    if (this.streamingConfig.enabled && onStream) {
      // Use streaming API
      const stream = await this.openaiClient.responses.create({
        model: "gpt-5",
        input: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        tools: tools.length > 0 ? tools : undefined,
        stream: true
      });
      
      let fullResponse = '';
      for await (const event of stream) {
        if (event.output_text) {
          const chunk = event.output_text.slice(fullResponse.length);
          fullResponse = event.output_text;
          onStream(chunk);
          
          // Add small delay for natural feel
          await new Promise(resolve => setTimeout(resolve, this.streamingConfig.chunkDelay));
        }
      }
      
      return fullResponse;
    } else {
      // Use standard API
      const response = await this.openaiClient.responses.create({
        model: "gpt-5",
        input: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        tools: tools.length > 0 ? tools : undefined
      });
      
      return response.output_text || "I'm here to help with your health journey!";
    }
  }
  
  // Build enhanced system prompt with user assessment data
  private buildEnhancedSystemPrompt(): string {
    let prompt = `You are Bene, an advanced AI health science coach with comprehensive expertise in:

PHYSICAL HEALTH SCIENCE:
- Exercise physiology and biomechanics
- Strength training and hypertrophy science  
- Cardiovascular health and conditioning
- Nutrition science and metabolic processes
- Recovery, sleep science, and circadian rhythms
- Injury prevention and rehabilitation principles
- Hormonal health and endocrine system
- Body composition and metabolic health

MENTAL HEALTH & NEUROSCIENCE:
- Stress physiology and management techniques
- Anxiety and mood regulation strategies
- Cognitive behavioral approaches
- Mindfulness and meditation science
- Sleep psychology and optimization
- Neurotransmitter function and natural regulation
- Mind-body connection and psychosomatic health
- Habit formation and behavioral psychology

HOLISTIC WELLNESS:
- Lifestyle medicine and prevention
- Social determinants of health
- Environmental health factors
- Functional medicine approaches
- Evidence-based supplement science
- Chronic disease prevention and management

You provide personalized, evidence-based recommendations. Always cite scientific principles when relevant. Be encouraging but scientifically accurate. For serious medical concerns, recommend professional consultation while providing supportive wellness guidance.`;
    
    // Add user assessment context if available
    if (this.userAssessment.hasCompletedAssessment) {
      prompt += `\n\nUSER PROFILE CONTEXT:\n`;
      if (this.userAssessment.fitnessProfile.primaryGoals) {
        prompt += `Goals: ${this.userAssessment.fitnessProfile.primaryGoals.join(', ')}\n`;
      }
      if (this.userAssessment.mentalHealthProfile.stressLevel) {
        prompt += `Stress Level: ${this.userAssessment.mentalHealthProfile.stressLevel}/10\n`;
      }
      if (this.userAssessment.mentalHealthProfile.sleepQuality) {
        prompt += `Sleep Quality: ${this.userAssessment.mentalHealthProfile.sleepQuality}/10\n`;
      }
    }
    
    return prompt;
  }
  
  // Enhanced mock response with simulated streaming
  private async generateEnhancedMockResponse(userMessage: string, onStream?: (chunk: string) => void): Promise<string> {
    const mockResponse = this.generateMockCoachResponse(userMessage);
    console.log('💬 Bene enhanced mock response:', mockResponse);
    
    // Simulate streaming for better UX
    if (this.streamingConfig.enabled && onStream) {
      const words = mockResponse.split(' ');
      let currentResponse = '';
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '');
        currentResponse += word;
        onStream(word);
        
        // Add natural typing delay
        await new Promise(resolve => 
          setTimeout(resolve, Math.random() * 100 + 50)
        );
      }
    }
    
    return mockResponse;
  }

  // Enhanced mock response generator for development/demo
  private generateMockCoachResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    const words = message.split(' ');
    
    // Handle assessment flow more naturally
    if ((message.includes('yes') || message.includes('start') || message.includes('assessment')) && !this.userAssessment.hasCompletedAssessment) {
      return "Excellent! I'm excited to learn about you. The assessment takes about 5-7 minutes and helps me understand your unique health profile. Ready to begin? 📋";
    }
    
    if ((message.includes('no') || message.includes('skip') || message.includes('later')) && !this.userAssessment.hasCompletedAssessment) {
      return "No problem at all! I'm here to help either way. What's on your mind regarding your health and wellness? 🧬";
    }
    
    // Direct question analysis - look for question words and respond accordingly
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'can', 'should', 'will', 'is', 'are', 'do', 'does'];
    const isQuestion = questionWords.some(qw => message.includes(qw));
    
    if (isQuestion) {
      return this.generateDirectAnswerResponse(userMessage);
    }
    
    // Statement or general conversation - respond more naturally
    return this.generateConversationalResponse(userMessage);
  }
  
  // Generate direct answers to specific questions
  private generateDirectAnswerResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Workout and exercise questions
    if (message.includes('workout') || message.includes('exercise') || message.includes('gym') || message.includes('train')) {
      if (message.includes('how many') || message.includes('how often')) {
        return "For most people, 3-4 workouts per week is optimal. This allows for proper recovery while maintaining consistent stimulus. Your body adapts during rest, not just during exercise. What's your current activity level?";
      }
      if (message.includes('what') && (message.includes('best') || message.includes('should'))) {
        return "The best workout is one you'll actually do consistently! That said, compound movements like squats, deadlifts, and push-ups give you the most bang for your buck. They work multiple muscle groups and trigger beneficial hormonal responses. What type of activities do you enjoy?";
      }
      if (message.includes('beginner') || message.includes('start')) {
        return "Great question for beginners! Start with bodyweight exercises to learn proper movement patterns. Focus on form over intensity. Even 20-30 minutes of movement 3x per week can create significant health improvements. Have you done any regular exercise before?";
      }
      return "I'd love to help with your workout questions! Could you be more specific about what you're wondering? Are you looking for a routine, wondering about frequency, or have questions about specific exercises?";
    }
    
    // Nutrition questions
    if (message.includes('diet') || message.includes('nutrition') || message.includes('eat') || message.includes('food')) {
      if (message.includes('lose weight') || message.includes('weight loss')) {
        return "For sustainable weight loss, focus on creating a moderate caloric deficit while maintaining protein intake to preserve muscle. Aim for whole foods and avoid extreme restrictions. What's your current eating pattern like?";
      }
      if (message.includes('what should') || message.includes('what to eat')) {
        return "Focus on nutrient-dense whole foods: lean proteins, vegetables, fruits, whole grains, and healthy fats. The Mediterranean diet pattern has strong research support. Are there any foods you particularly enjoy or want to avoid?";
      }
      if (message.includes('supplement') || message.includes('protein powder')) {
        return "Supplements should supplement a good diet, not replace it. Protein powder can be convenient, but whole food sources are usually better. The only supplements with strong evidence for most people are vitamin D and omega-3s. What specifically are you considering?";
      }
      return "Nutrition is so important for health! What specific aspect of eating are you curious about? Whether it's meal planning, specific foods, or addressing a particular goal, I'm here to help.";
    }
    
    // Motivation and goals
    if (message.includes('motivation') || message.includes('goal') || message.includes('inspire') || message.includes('stick to')) {
      if (message.includes('lose') || message.includes('losing')) {
        return "Losing motivation is completely normal! The key is building systems, not relying on motivation alone. Start with tiny habits you can't fail at - even 5 minutes counts. What's been your biggest challenge in staying consistent?";
      }
      if (message.includes('goal') || message.includes('goals')) {
        return "Good goals are specific and process-focused rather than just outcome-focused. Instead of 'lose 20 pounds,' try 'walk 30 minutes daily' or 'eat vegetables with every meal.' What outcome are you working toward?";
      }
      return "I understand the motivation struggle! The most successful people build habits and systems they can maintain even when motivation is low. What's one small health habit you'd like to develop?";
    }
    
    // Energy and sleep
    if (message.includes('tired') || message.includes('energy') || message.includes('sleep') || message.includes('fatigue')) {
      if (message.includes('sleep') && (message.includes('better') || message.includes('improve'))) {
        return "Better sleep starts with consistent timing and a cool, dark environment. Avoid screens an hour before bed and get morning sunlight to regulate your circadian rhythm. What's your current sleep schedule like?";
      }
      if (message.includes('tired') || message.includes('energy')) {
        return "Low energy can stem from several factors: poor sleep, dehydration, blood sugar swings, or lack of movement. The basics matter most: 7-9 hours of sleep, staying hydrated, and eating regular meals. When do you typically feel most tired?";
      }
      return "Energy and sleep are foundational to everything else! What specifically about your energy or sleep would you like to improve?";
    }
    
    // Stress and mental health
    if (message.includes('stress') || message.includes('mental') || message.includes('anxiety') || message.includes('overwhelm')) {
      if (message.includes('manage') || message.includes('cope') || message.includes('deal with')) {
        return "There are several evidence-based ways to manage stress: deep breathing activates your parasympathetic nervous system, regular exercise reduces stress hormones, and adequate sleep helps with emotional regulation. What kind of stress are you dealing with most?";
      }
      if (message.includes('anxiety')) {
        return "Anxiety is very common and there are effective ways to manage it. Regular exercise, mindfulness practices, and maintaining stable blood sugar can all help. For persistent anxiety, talking to a mental health professional is really valuable. What tends to trigger your anxiety?";
      }
      return "Mental wellness is just as important as physical health. What aspect of stress or mental health would you like to work on?";
    }
    
    // Weight management
    if (message.includes('weight') || message.includes('lose') || message.includes('gain') || message.includes('pounds')) {
      if (message.includes('lose') || message.includes('loss')) {
        return "Sustainable weight loss is about creating a moderate caloric deficit through a combination of diet and exercise. Focus on habits you can maintain long-term rather than extreme measures. What approaches have you tried before?";
      }
      if (message.includes('gain') && message.includes('muscle')) {
        return "For healthy muscle gain, you need adequate protein (0.8-1g per pound of body weight), progressive resistance training, and sufficient calories. It's a slower process than weight loss but very rewarding. Are you currently doing any strength training?";
      }
      return "Weight management is about finding sustainable habits that work for your lifestyle. What's your main goal - losing, gaining, or maintaining weight?";
    }
    
    // Science and research
    if (message.includes('science') || message.includes('research') || message.includes('study') || message.includes('evidence')) {
      return "I love discussing the science behind health recommendations! What specific topic would you like me to explain? I can break down complex research into practical insights.";
    }
    
    if (message.includes('pain') || message.includes('hurt') || message.includes('injury')) {
      return "I understand you're experiencing pain or discomfort. While I can discuss pain science and general recovery principles, any persistent pain requires professional medical evaluation. Please consult a healthcare provider for proper assessment! 🏥";
    }
    
    if (message.includes('depression') || message.includes('suicidal') || message.includes('self-harm')) {
      return "I'm concerned about what you're sharing. While I can discuss mental wellness, serious mental health concerns require professional support. Please reach out to a mental health professional, your doctor, or call 988 (Suicide & Crisis Lifeline). Your wellbeing matters! 🆘";
    }
    
    // If no specific question detected, ask for clarification
    return "I'd love to help! Could you tell me more about what you're wondering about? Whether it's fitness, nutrition, sleep, stress, or any other health topic, I'm here to provide evidence-based guidance.";
  }
  
  // Generate conversational responses to statements
  private generateConversationalResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Responding to statements about feelings or experiences
    if (message.includes('feel') || message.includes('feeling')) {
      if (message.includes('tired') || message.includes('exhausted')) {
        return "I hear that you're feeling tired. That can be really frustrating. There are usually several factors at play - sleep quality, stress levels, nutrition, and activity levels all matter. What do you think might be contributing to your fatigue?";
      }
      if (message.includes('stressed') || message.includes('overwhelmed')) {
        return "It sounds like you're dealing with a lot of stress right now. That's really common, and there are definitely evidence-based ways to help manage it. What's been your biggest source of stress lately?";
      }
      return "Thanks for sharing how you're feeling. Understanding where you're at helps me provide better guidance. What would be most helpful for you right now?";
    }
    
    // Responding to statements about goals or desires
    if (message.includes('want') || message.includes('need') || message.includes('trying')) {
      return "I appreciate you sharing what you're working toward. Let's figure out the best approach for your specific situation. What have you tried so far, and what's been challenging?";
    }
    
    // General conversational response
    if (!this.userAssessment.hasCompletedAssessment) {
      return "Thanks for reaching out! I'm here to help with any health and wellness questions you have. If you'd like personalized recommendations, we could start with a quick assessment to understand your unique situation better. What's on your mind today?";
    }
    
    return "I'm here to help with whatever health topic is on your mind. What would you like to explore or work on today?";
  }

  // Enhanced send message with streaming support
  public async sendMessage(userMessage: string, onUpdate?: () => void): Promise<void> {
    // Add user message
    this.addUserMessage(userMessage);
    onUpdate?.();
    
    // Add streaming message placeholder
    const streamingMessageId = `streaming-${Date.now()}`;
    const streamingMessage: ChatMessage = {
      id: streamingMessageId,
      text: "Bene is thinking...",
      sender: 'coach',
      timestamp: new Date(),
      isStreaming: true
    };
    this.chatHistory.push(streamingMessage);
    onUpdate?.();
    
    // Set up streaming handler
    let streamedText = '';
    const handleStream = (chunk: string) => {
      streamedText += chunk;
      
      // Update the streaming message
      const messageIndex = this.chatHistory.findIndex(msg => msg.id === streamingMessageId);
      if (messageIndex !== -1) {
        this.chatHistory[messageIndex].text = streamedText;
        onUpdate?.();
      }
    };
    
    try {
      // Generate response with streaming
      const finalResponse = await this.generateCoachResponse(userMessage, handleStream);
      
      // Update final message
      const messageIndex = this.chatHistory.findIndex(msg => msg.id === streamingMessageId);
      if (messageIndex !== -1) {
        this.chatHistory[messageIndex] = {
          ...this.chatHistory[messageIndex],
          text: finalResponse,
          isStreaming: false
        };
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error in enhanced sendMessage:', error);
      // Fallback to error message
      const messageIndex = this.chatHistory.findIndex(msg => msg.id === streamingMessageId);
      if (messageIndex !== -1) {
        this.chatHistory[messageIndex] = {
          ...this.chatHistory[messageIndex],
          text: "I encountered an issue processing your message. Could you try rephrasing your question?",
          isStreaming: false
        };
        onUpdate?.();
      }
    }
  }
  
  // Enable/disable streaming
  public setStreamingEnabled(enabled: boolean): void {
    this.streamingConfig.enabled = enabled;
  }
  
  // Enable/disable web search
  public setWebSearchEnabled(enabled: boolean): void {
    this.webSearchConfig.enabled = enabled;
  }
  
  // Get current capabilities status
  public getCapabilities(): { hasOpenAI: boolean; streaming: boolean; webSearch: boolean } {
    return {
      hasOpenAI: this.openaiClient !== null,
      streaming: this.streamingConfig.enabled,
      webSearch: this.webSearchConfig.enabled
    };
  }

  // Clear chat history
  public clearChat(): void {
    this.chatHistory = [];
    // Re-add welcome message
    this.chatHistory.push({
      id: Date.now().toString(),
      text: "Hello! I'm Bene, your beneficial AI health coach with deep expertise in health science, fitness, and mental wellness. 🧠💪\n\nBefore we begin your personalized health journey, I'd love to get to know you better through a comprehensive assessment. This will help me provide you with evidence-based, personalized recommendations.\n\nWould you like to start your health assessment now? It takes about 5-7 minutes and covers your fitness background, mental wellness, and lifestyle factors.",
      sender: 'coach',
      timestamp: new Date()
    });
  }

  // Get quick suggestion prompts
  public getQuickSuggestions(): string[] {
    return [
      "Help me create a workout plan",
      "I need motivation to exercise",
      "What should I eat for better energy?",
      "How do I build healthy habits?",
      "I'm feeling stressed, any advice?"
    ];
  }
}

export default AICoachService;