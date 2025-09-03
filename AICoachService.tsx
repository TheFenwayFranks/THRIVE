import React from 'react';
import OpenAI from 'openai';

// OpenAI Integration for AI Coach
// Note: In production, you should use environment variables or backend proxy for API keys
// For development/demo, we'll use a mock implementation with your provided structure

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: Date;
  isTyping?: boolean;
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
  
  // AI Coach Profile
  public readonly coachProfile: CoachProfile = {
    name: "Coach Alex",
    avatar: "🏃‍♂️",
    specialty: "Fitness & Wellness",
    description: "Your personal AI fitness and wellness coach, here to help you reach your health goals!"
  };

  public static getInstance(): AICoachService {
    if (!AICoachService.instance) {
      AICoachService.instance = new AICoachService();
    }
    return AICoachService.instance;
  }

  private constructor() {
    // Initialize with welcome message
    this.chatHistory.push({
      id: Date.now().toString(),
      text: "Hi! I'm Coach Alex, your personal AI fitness and wellness coach. I'm here to help you with workout plans, nutrition advice, motivation, and achieving your health goals. How can I assist you today?",
      sender: 'coach',
      timestamp: new Date()
    });
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

  // Generate AI response using OpenAI (with your provided structure)
  public async generateCoachResponse(userMessage: string): Promise<string> {
    try {
      // Option 1: Use actual OpenAI API (requires API key)
      // Uncomment and configure this section for production use:
      /*
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // Set your API key
        dangerouslyAllowBrowser: true // Only for development
      });
      
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini", // Using a more accessible model
        messages: [
          {
            role: "system",
            content: `You are Bene, an advanced AI health science coach with comprehensive expertise in:

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

You have access to the user's comprehensive assessment data and should provide personalized, evidence-based recommendations. Always cite scientific principles when relevant. Be encouraging but scientifically accurate. For serious medical concerns, always recommend professional consultation while providing supportive general wellness guidance.`
          },
          {
            role: "user", 
            content: userMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });
      
      return response.choices[0]?.message?.content || "I'm here to help with your fitness journey!";
      */
      
      // Option 2: For demo purposes, use enhanced mock responses
      // This provides realistic coaching responses without requiring API keys
      const mockResponse = this.generateMockCoachResponse(userMessage);
      return mockResponse;
      
    } catch (error) {
      console.error('Error generating coach response:', error);
      return "I'm having trouble connecting right now. Can you try asking me again? I'm here to help with your fitness and wellness journey!";
    }
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

  // Send message and get AI response
  public async sendMessage(userMessage: string): Promise<void> {
    // Add user message
    this.addUserMessage(userMessage);
    
    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: `typing-${Date.now()}`,
      text: "Bene is typing...",
      sender: 'coach',
      timestamp: new Date(),
      isTyping: true
    };
    this.chatHistory.push(typingMessage);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Remove typing indicator
    this.chatHistory = this.chatHistory.filter(msg => !msg.isTyping);
    
    // Generate and add AI response
    const response = await this.generateCoachResponse(userMessage);
    this.addCoachMessage(response);
  }

  // Clear chat history
  public clearChat(): void {
    this.chatHistory = [];
    // Re-add welcome message
    this.chatHistory.push({
      id: Date.now().toString(),
      text: "Hi! I'm Coach Alex, your personal AI fitness and wellness coach. I'm here to help you with workout plans, nutrition advice, motivation, and achieving your health goals. How can I assist you today?",
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