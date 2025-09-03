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
            content: `You are Coach Alex, an expert AI fitness and wellness coach. You are enthusiastic, supportive, and knowledgeable about:
- Workout routines and exercise form
- Nutrition and healthy eating  
- Goal setting and motivation
- Wellness and mental health
- Recovery and injury prevention
- Habit formation and lifestyle changes

Always respond in a friendly, encouraging tone. Keep responses concise but helpful (2-3 sentences maximum). Provide actionable advice when possible. If asked about medical concerns, remind users to consult healthcare professionals.`
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
    
    // Fitness and workout related
    if (message.includes('workout') || message.includes('exercise') || message.includes('gym')) {
      const workoutResponses = [
        "Great question about workouts! I'd recommend starting with compound movements like squats, deadlifts, and push-ups. What's your current fitness level? 💪",
        "Love the enthusiasm for exercise! For beginners, try 3-4 workouts per week with rest days between. Focus on form over weight! What type of workout interests you most? 🏋️‍♀️",
        "Perfect timing to talk workouts! A mix of strength training and cardio works best. Start with 20-30 minutes and gradually increase. What's your fitness goal? 🎯"
      ];
      return workoutResponses[Math.floor(Math.random() * workoutResponses.length)];
    }
    
    if (message.includes('diet') || message.includes('nutrition') || message.includes('eat') || message.includes('food')) {
      const nutritionResponses = [
        "Nutrition is key to reaching your goals! Focus on whole foods, lean proteins, and plenty of vegetables. What are your main nutrition challenges? 🥗",
        "Smart to think about nutrition! Try the 80/20 rule - eat healthy 80% of the time, enjoy treats 20%. Stay hydrated and eat mindfully! 💧",
        "Excellent question about food! Meal prep on Sundays can be a game-changer. Include protein, healthy carbs, and good fats in each meal. Need specific meal ideas? 🍽️"
      ];
      return nutritionResponses[Math.floor(Math.random() * nutritionResponses.length)];
    }
    
    if (message.includes('motivation') || message.includes('goal') || message.includes('inspire')) {
      const motivationResponses = [
        "I love your dedication! Setting small, achievable goals is the key to long-term success. Remember, progress over perfection! What specific goal can we work on? 🎯",
        "Your motivation is inspiring! Write down your 'why' and read it daily. Every small step counts toward your bigger goal. You've got this! 🌟",
        "That's the spirit! Consistency beats perfection every time. Celebrate small wins along the way - they add up to big transformations! 🏆"
      ];
      return motivationResponses[Math.floor(Math.random() * motivationResponses.length)];
    }
    
    if (message.includes('tired') || message.includes('energy') || message.includes('sleep')) {
      const energyResponses = [
        "Feeling tired is normal! Make sure you're getting 7-9 hours of sleep and staying hydrated. A short walk can also boost energy naturally. How's your sleep schedule? 😴",
        "Low energy can be frustrating! Check your sleep quality, hydration, and nutrition. Even 10 minutes of morning sunlight can help regulate your energy cycle! ☀️",
        "Energy dips happen to everyone! Try a power nap (10-20 mins), some light stretching, or a healthy snack with protein. What time of day do you feel most tired? ⚡"
      ];
      return energyResponses[Math.floor(Math.random() * energyResponses.length)];
    }
    
    if (message.includes('stress') || message.includes('mental') || message.includes('anxiety')) {
      const wellnessResponses = [
        "Mental wellness is just as important as physical health! Try deep breathing exercises or a 10-minute meditation. Regular exercise also helps reduce stress. Want some specific techniques? 🧘‍♀️",
        "Stress is tough, but you're taking the right step by addressing it! Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, out for 8. Exercise is also a great stress reliever! 💨",
        "Managing stress is crucial for overall health! Consider journaling, gentle yoga, or a nature walk. Remember, it's okay to ask for professional help too. How are you feeling right now? 📝"
      ];
      return wellnessResponses[Math.floor(Math.random() * wellnessResponses.length)];
    }
    
    if (message.includes('weight') || message.includes('lose') || message.includes('gain')) {
      const weightResponses = [
        "Weight goals require patience and consistency! Focus on creating sustainable habits rather than quick fixes. Both nutrition and exercise play important roles. What's your current approach? ⚖️",
        "Great question about weight management! Remember, the scale doesn't tell the whole story - focus on how you feel and your energy levels too. Small, consistent changes work best! 📈",
        "Weight changes take time, so be patient with yourself! Track your habits, not just the number on the scale. Celebrate non-scale victories like better sleep or increased strength! 💪"
      ];
      return weightResponses[Math.floor(Math.random() * weightResponses.length)];
    }
    
    if (message.includes('pain') || message.includes('hurt') || message.includes('injury')) {
      return "I hear you're dealing with pain or discomfort. While I can offer general wellness advice, it's important to consult with a healthcare professional for any pain or injury concerns. Your health and safety come first! 🏥";
    }
    
    // Default encouraging responses
    const defaultResponses = [
      "That's a great question! I'm here to help you succeed on your wellness journey. Can you tell me more about what you're looking to achieve? Let's work together! 🌟",
      "I'm excited to help you on your health journey! Whether it's fitness, nutrition, or wellness goals, we can work together to create a plan that fits your lifestyle. What's your biggest priority right now? 🚀",
      "Thanks for reaching out! Every fitness journey is unique, and I'm here to support you every step of the way. What aspect of health and wellness would you like to focus on today? 💫"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  // Send message and get AI response
  public async sendMessage(userMessage: string): Promise<void> {
    // Add user message
    this.addUserMessage(userMessage);
    
    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: `typing-${Date.now()}`,
      text: "Coach Alex is typing...",
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