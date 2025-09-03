import * as React from 'react';
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

export interface HealthTool {
  name: string;
  description: string;
  parameters: any;
  handler: (params: any) => Promise<any>;
}

export interface FitnessCalculationResult {
  bmi?: number;
  bmr?: number;
  dailyCalories?: number;
  bodyFatPercentage?: number;
  idealWeight?: { min: number; max: number };
}

export interface NutritionAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  recommendations: string[];
}

export interface WorkoutPlan {
  name: string;
  duration: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    restTime: string;
    instructions: string;
  }>;
  notes: string[];
}

export interface CoachProfile {
  name: string;
  avatar: string;
  specialty: string;
  description: string;
}

export interface HealthAgent {
  name: string;
  specialty: string;
  instructions: string;
  capabilities: string[];
  triggerKeywords: string[];
}

export interface AgentHandoffResult {
  agent: HealthAgent;
  response: string;
  confidence: number;
}

export interface UserAssessment {
  hasCompletedAssessment: boolean;
  personalInfo: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
  };
  fitnessProfile: {
    primaryGoals?: string[];
    currentActivityLevel?: string;
    exerciseExperience?: string;
    preferredWorkouts?: string[];
    limitations?: string[];
  };
  mentalHealthProfile: {
    stressLevel?: number;
    sleepQuality?: number;
    sleepHours?: number;
    energyLevel?: number;
    moodRating?: number;
  };
  healthMetrics: {
    bmi?: number;
    bodyFatPercentage?: number;
    restingHeartRate?: number;
  };
  lifestyle: {
    diet?: string;
    smokingStatus?: string;
    alcoholConsumption?: string;
    workSchedule?: string;
  };
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'scale' | 'text' | 'number';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  required: boolean;
  category: 'personal' | 'fitness' | 'mental_health' | 'health_metrics' | 'lifestyle';
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
  private healthTools: HealthTool[] = [];
  private healthAgents: HealthAgent[] = [];
  
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
    
    // Initialize health-specific AI tools
    this.initializeHealthTools();
    
    // Initialize specialized health agents
    this.initializeHealthAgents();
    
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
  
  // Initialize health-specific AI function tools
  private initializeHealthTools(): void {
    this.healthTools = [
      // BMI and Body Composition Calculator
      {
        name: "calculate_fitness_metrics",
        description: "Calculate BMI, BMR, daily calorie needs, and ideal weight range based on user data.",
        parameters: {
          type: "object",
          properties: {
            weight: { type: "number", description: "Weight in pounds or kg" },
            height: { type: "number", description: "Height in inches or cm" },
            age: { type: "number", description: "Age in years" },
            gender: { type: "string", enum: ["male", "female"], description: "Biological sex for calculation" },
            activityLevel: { 
              type: "string", 
              enum: ["sedentary", "light", "moderate", "active", "very_active"],
              description: "Daily activity level"
            },
            unit: { type: "string", enum: ["imperial", "metric"], description: "Measurement unit system" }
          },
          required: ["weight", "height", "age", "gender", "activityLevel"],
          additionalProperties: false
        },
        handler: this.calculateFitnessMetrics.bind(this)
      },
      
      // Nutrition Analysis Tool
      {
        name: "analyze_nutrition",
        description: "Analyze nutritional content of meals and provide recommendations.",
        parameters: {
          type: "object",
          properties: {
            foods: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Food item name" },
                  quantity: { type: "string", description: "Amount (e.g., '1 cup', '100g', '1 medium')" }
                },
                required: ["name", "quantity"]
              },
              description: "List of foods to analyze"
            },
            goal: { 
              type: "string", 
              enum: ["weight_loss", "muscle_gain", "maintenance", "performance"],
              description: "Nutritional goal"
            }
          },
          required: ["foods"],
          additionalProperties: false
        },
        handler: this.analyzeNutrition.bind(this)
      },
      
      // Personalized Workout Generator
      {
        name: "generate_workout",
        description: "Generate a personalized workout plan based on user goals and constraints.",
        parameters: {
          type: "object",
          properties: {
            goal: {
              type: "string",
              enum: ["strength", "muscle_gain", "weight_loss", "endurance", "flexibility", "general_fitness"],
              description: "Primary fitness goal"
            },
            duration: { type: "number", description: "Workout duration in minutes" },
            equipment: {
              type: "array",
              items: {
                type: "string",
                enum: ["bodyweight", "dumbbells", "barbell", "resistance_bands", "gym", "home"]
              },
              description: "Available equipment"
            },
            fitnessLevel: {
              type: "string",
              enum: ["beginner", "intermediate", "advanced"],
              description: "Current fitness level"
            },
            limitations: {
              type: "array",
              items: { type: "string" },
              description: "Any injuries or physical limitations"
            }
          },
          required: ["goal", "duration", "fitnessLevel"],
          additionalProperties: false
        },
        handler: this.generateWorkout.bind(this)
      },
      
      // Health Risk Assessment
      {
        name: "assess_health_risks",
        description: "Assess health risks based on lifestyle factors and provide recommendations.",
        parameters: {
          type: "object",
          properties: {
            age: { type: "number", description: "Age in years" },
            bmi: { type: "number", description: "Body Mass Index" },
            smokingStatus: {
              type: "string",
              enum: ["never", "former", "current"],
              description: "Smoking history"
            },
            exerciseFrequency: {
              type: "string",
              enum: ["none", "1-2_times", "3-4_times", "5+_times"],
              description: "Weekly exercise frequency"
            },
            stressLevel: { type: "number", minimum: 1, maximum: 10, description: "Stress level 1-10" },
            sleepHours: { type: "number", description: "Average sleep hours per night" },
            familyHistory: {
              type: "array",
              items: {
                type: "string",
                enum: ["heart_disease", "diabetes", "cancer", "hypertension", "none"]
              },
              description: "Family history of chronic conditions"
            }
          },
          required: ["age", "bmi"],
          additionalProperties: false
        },
        handler: this.assessHealthRisks.bind(this)
      }
    ];
    
    console.log(`🧪 Bene: Initialized ${this.healthTools.length} health-specific AI tools`);
  }
  
  // Initialize specialized health agents for intelligent routing
  private initializeHealthAgents(): void {
    this.healthAgents = [
      // Fitness & Exercise Agent
      {
        name: 'FitnessExpert',
        specialty: 'Exercise Science & Physical Training',
        instructions: 'You are a specialized fitness and exercise science expert. You focus on workout planning, exercise physiology, strength training, cardiovascular health, and athletic performance. Provide evidence-based fitness guidance.',
        capabilities: [
          'Workout plan creation',
          'Exercise form and technique',
          'Progressive overload principles',
          'Injury prevention',
          'Athletic performance optimization',
          'Biomechanics analysis'
        ],
        triggerKeywords: [
          'workout', 'exercise', 'fitness', 'gym', 'strength', 'cardio', 'training',
          'muscle', 'bodybuilding', 'weightlifting', 'running', 'athletic', 'performance'
        ]
      },
      
      // Nutrition Agent
      {
        name: 'NutritionSpecialist',
        specialty: 'Nutrition Science & Dietary Guidance',
        instructions: 'You are a nutrition science specialist focused on evidence-based dietary guidance. You help with meal planning, macronutrient optimization, metabolic health, and nutrition for specific goals.',
        capabilities: [
          'Meal planning and prep',
          'Macronutrient calculation',
          'Weight management nutrition',
          'Sports nutrition',
          'Metabolic health optimization',
          'Supplement guidance'
        ],
        triggerKeywords: [
          'nutrition', 'diet', 'food', 'eating', 'meal', 'calories', 'protein',
          'carbs', 'fat', 'vitamins', 'supplements', 'weight loss', 'weight gain'
        ]
      },
      
      // Mental Health Agent
      {
        name: 'MentalWellnessExpert',
        specialty: 'Mental Health & Psychological Wellness',
        instructions: 'You are a mental health and wellness specialist focused on stress management, anxiety reduction, mood optimization, and psychological well-being. You provide evidence-based mental health strategies.',
        capabilities: [
          'Stress management techniques',
          'Anxiety reduction strategies',
          'Mood regulation',
          'Mindfulness and meditation',
          'Cognitive behavioral approaches',
          'Sleep psychology'
        ],
        triggerKeywords: [
          'mental', 'stress', 'anxiety', 'depression', 'mood', 'psychology',
          'mindfulness', 'meditation', 'emotional', 'wellbeing', 'therapy', 'counseling'
        ]
      },
      
      // Sleep & Recovery Agent
      {
        name: 'SleepRecoveryExpert',
        specialty: 'Sleep Science & Recovery Optimization',
        instructions: 'You are a sleep science and recovery specialist. You focus on sleep optimization, circadian rhythm regulation, recovery protocols, and energy management.',
        capabilities: [
          'Sleep hygiene protocols',
          'Circadian rhythm optimization',
          'Recovery strategies',
          'Energy management',
          'Fatigue reduction',
          'Sleep disorder guidance'
        ],
        triggerKeywords: [
          'sleep', 'tired', 'fatigue', 'energy', 'recovery', 'rest',
          'insomnia', 'circadian', 'bedtime', 'wake up', 'exhausted'
        ]
      },
      
      // General Health Agent (Triage)
      {
        name: 'HealthTriage',
        specialty: 'General Health & Wellness Coordination',
        instructions: 'You are a general health coordinator who helps route health questions to appropriate specialists while providing comprehensive wellness guidance. You handle general health questions and coordinate care.',
        capabilities: [
          'General health assessment',
          'Symptom evaluation',
          'Preventive care guidance',
          'Health risk assessment',
          'Lifestyle medicine',
          'Specialist coordination'
        ],
        triggerKeywords: [
          'health', 'wellness', 'symptoms', 'medical', 'doctor', 'prevention',
          'lifestyle', 'habits', 'general', 'overall', 'holistic'
        ]
      }
    ];
    
    console.log(`👥 Bene: Initialized ${this.healthAgents.length} specialized health agents`);
  }
  
  // Initialize comprehensive assessment questions
  private initializeAssessmentQuestions(): void {
    this.assessmentQuestions = [
      // Personal Information
      {
        id: 'age',
        question: 'What is your age?',
        type: 'number',
        required: true,
        category: 'personal'
      },
      {
        id: 'gender',
        question: 'What is your biological sex? (Used for health calculations)',
        type: 'multiple_choice',
        options: ['Male', 'Female'],
        required: true,
        category: 'personal'
      },
      {
        id: 'height',
        question: 'What is your height in inches?',
        type: 'number',
        required: true,
        category: 'personal'
      },
      {
        id: 'weight',
        question: 'What is your current weight in pounds?',
        type: 'number',
        required: true,
        category: 'personal'
      },
      
      // Fitness Profile
      {
        id: 'primary_goals',
        question: 'What are your primary health and fitness goals? (Select all that apply)',
        type: 'multiple_choice',
        options: [
          'Weight Loss',
          'Muscle Gain',
          'General Fitness',
          'Strength Building',
          'Endurance/Cardio',
          'Flexibility/Mobility',
          'Stress Management',
          'Better Sleep',
          'More Energy'
        ],
        required: true,
        category: 'fitness'
      },
      {
        id: 'activity_level',
        question: 'How would you describe your current activity level?',
        type: 'multiple_choice',
        options: [
          'Sedentary (little or no exercise)',
          'Light (1-3 days/week light exercise)',
          'Moderate (3-5 days/week moderate exercise)',
          'Active (6-7 days/week exercise)',
          'Very Active (2x/day or intense training)'
        ],
        required: true,
        category: 'fitness'
      },
      {
        id: 'exercise_experience',
        question: 'How much exercise experience do you have?',
        type: 'multiple_choice',
        options: ['Beginner (0-1 year)', 'Intermediate (1-3 years)', 'Advanced (3+ years)'],
        required: true,
        category: 'fitness'
      },
      {
        id: 'preferred_workouts',
        question: 'What types of workouts do you enjoy or want to try? (Select all that apply)',
        type: 'multiple_choice',
        options: [
          'Bodyweight exercises',
          'Weight lifting',
          'Cardio/Running',
          'Yoga',
          'Swimming',
          'Team sports',
          'Hiking/Walking',
          'Dance/Aerobics',
          'Martial arts',
          'Home workouts'
        ],
        required: false,
        category: 'fitness'
      },
      
      // Mental Health Profile
      {
        id: 'stress_level',
        question: 'On a scale of 1-10, how would you rate your current stress level?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        required: true,
        category: 'mental_health'
      },
      {
        id: 'sleep_quality',
        question: 'How would you rate your sleep quality on a scale of 1-10?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        required: true,
        category: 'mental_health'
      },
      {
        id: 'sleep_hours',
        question: 'How many hours of sleep do you typically get per night?',
        type: 'number',
        required: true,
        category: 'mental_health'
      },
      {
        id: 'energy_level',
        question: 'How would you rate your average energy level throughout the day?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        required: true,
        category: 'mental_health'
      },
      {
        id: 'mood_rating',
        question: 'How would you rate your overall mood and mental wellness?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        required: true,
        category: 'mental_health'
      },
      
      // Lifestyle Factors
      {
        id: 'diet_style',
        question: 'How would you describe your current eating pattern?',
        type: 'multiple_choice',
        options: [
          'Standard Western Diet',
          'Mediterranean',
          'Low Carb/Keto',
          'Vegetarian',
          'Vegan',
          'Paleo',
          'Intermittent Fasting',
          'Flexible/Balanced',
          'No specific pattern'
        ],
        required: true,
        category: 'lifestyle'
      },
      {
        id: 'smoking_status',
        question: 'What is your smoking status?',
        type: 'multiple_choice',
        options: ['Never smoked', 'Former smoker', 'Current smoker'],
        required: true,
        category: 'lifestyle'
      },
      {
        id: 'alcohol_consumption',
        question: 'How often do you consume alcohol?',
        type: 'multiple_choice',
        options: [
          'Never',
          'Rarely (few times per year)',
          'Occasionally (1-2 times per month)',
          'Moderately (1-2 times per week)',
          'Regularly (3-5 times per week)',
          'Daily'
        ],
        required: true,
        category: 'lifestyle'
      },
      {
        id: 'work_schedule',
        question: 'How would you describe your work/daily schedule?',
        type: 'multiple_choice',
        options: [
          'Regular 9-5 schedule',
          'Shift work',
          'Irregular hours',
          'Work from home',
          'Student schedule',
          'Retired',
          'Unemployed/Flexible'
        ],
        required: false,
        category: 'lifestyle'
      },
      
      // Additional Health Information
      {
        id: 'health_conditions',
        question: 'Do you have any chronic health conditions or take medications? (Optional - for better recommendations)',
        type: 'text',
        required: false,
        category: 'health_metrics'
      },
      {
        id: 'injuries_limitations',
        question: 'Do you have any injuries, physical limitations, or areas of concern? (Optional)',
        type: 'text',
        required: false,
        category: 'fitness'
      },
      
      // Motivation and Support
      {
        id: 'motivation_level',
        question: 'How motivated are you to make health changes on a scale of 1-10?',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        required: true,
        category: 'mental_health'
      },
      {
        id: 'biggest_challenges',
        question: 'What have been your biggest challenges with health and fitness in the past?',
        type: 'text',
        required: false,
        category: 'fitness'
      }
    ];
    
    console.log(`📋 Bene: Initialized comprehensive assessment with ${this.assessmentQuestions.length} questions`);
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
        console.log('🚀 Using live OpenAI API for:', userMessage);
        return await this.generateLiveAIResponse(userMessage, needsWebSearch, onStream);
      } else {
        console.log('🎭 Using enhanced mock response for:', userMessage);
        console.log('  - OpenAI client available:', !!this.openaiClient);
        console.log('  - Message valid for live AI:', this.isValidForLiveAI(userMessage));
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
  
  // Check if message is suitable for live AI - allow most messages for natural conversation
  private isValidForLiveAI(userMessage: string): boolean {
    const message = userMessage.toLowerCase().trim();
    
    // Only filter out extremely short or empty messages
    return message.length > 1;
  }
  
  // Generate response using live OpenAI API with enhanced features
  private async generateLiveAIResponse(userMessage: string, useWebSearch: boolean, onStream?: (chunk: string) => void): Promise<string> {
    if (!this.openaiClient) throw new Error('OpenAI client not initialized');
    
    const tools = [];
    
    // Add MCP server for health research (if web search needed)
    if (useWebSearch) {
      tools.push({
        type: "mcp",
        server_label: "health_research",
        server_description: "Health and medical research database for current studies and findings",
        server_url: "https://health-mcp-server.example.com/sse", // Placeholder URL
        require_approval: "never"
      });
    }
    
    // Add file search for health documents
    tools.push({
      type: "file_search",
      vector_store_ids: ["vs_health_guidelines"] // Placeholder vector store
    });
    
    // Add health-specific function tools
    const healthTools = this.getHealthToolsForOpenAI();
    tools.push(...healthTools);
    
    // Route to specialized agent based on message content
    const selectedAgent = this.routeToSpecializedAgent(userMessage);
    const systemPrompt = this.buildAgentSystemPrompt(selectedAgent, userMessage);
    
    try {
      if (this.streamingConfig.enabled && onStream) {
        // Use new responses.create API with streaming
        const response = await this.openaiClient.responses.create({
          model: "gpt-4.1", // Updated model
          input: `${systemPrompt}\n\nUser: ${userMessage}`,
          tools: tools.length > 0 ? tools : undefined,
          stream: true
        });
        
        let fullResponse = '';
        let functionCalls: any[] = [];
        
        // Handle streaming response
        for await (const event of response) {
          if (event.output_text) {
            const chunk = event.output_text.slice(fullResponse.length);
            fullResponse = event.output_text;
            onStream(chunk);
            
            // Add small delay for natural feel
            await new Promise(resolve => setTimeout(resolve, this.streamingConfig.chunkDelay));
          }
          
          // Handle function calls
          if (event.function_calls) {
            functionCalls.push(...event.function_calls);
          }
        }
        
        // Execute any function calls
        if (functionCalls.length > 0) {
          const functionResults = await this.executeFunctionCalls(functionCalls);
          
          if (functionResults.length > 0) {
            onStream('\n\n📊 Analyzing your data...\n');
            
            // Add function results to conversation and get final response
            const finalResponse = await this.getFinalResponseWithFunctionResults(
              systemPrompt, userMessage, functionCalls, functionResults
            );
            
            // Stream the final response
            const words = finalResponse.split(' ');
            for (const word of words) {
              onStream(word + ' ');
              await new Promise(resolve => setTimeout(resolve, this.streamingConfig.chunkDelay));
            }
            
            return fullResponse + '\n\n📊 Analyzing your data...\n' + finalResponse;
          }
        }
        
        return fullResponse;
      } else {
        // Use new responses.create API without streaming
        const response = await this.openaiClient.responses.create({
          model: "gpt-4.1",
          input: `${systemPrompt}\n\nUser: ${userMessage}`,
          tools: tools.length > 0 ? tools : undefined
        });
        
        let finalResponse = response.output_text || "I'm here to help with your health journey!";
        
        // Handle function calls if present
        if (response.function_calls && response.function_calls.length > 0) {
          const functionResults = await this.executeFunctionCalls(response.function_calls);
          
          if (functionResults.length > 0) {
            // Get final response with function results
            const enhancedResponse = await this.getFinalResponseWithFunctionResults(
              systemPrompt, userMessage, response.function_calls, functionResults
            );
            
            finalResponse += '\n\n📊 Analysis Results:\n' + enhancedResponse;
          }
        }
        
        return finalResponse;
      }
    } catch (error) {
      console.warn('New responses.create API not available, falling back to chat completions:', error);
      
      // Fallback to chat completions API
      return await this.generateLegacyAIResponse(userMessage, useWebSearch, onStream);
    }
  }
  
  // Legacy fallback using chat completions API
  private async generateLegacyAIResponse(userMessage: string, useWebSearch: boolean, onStream?: (chunk: string) => void): Promise<string> {
    if (!this.openaiClient) throw new Error('OpenAI client not initialized');
    
    const tools = [];
    const healthTools = this.getHealthToolsForOpenAI();
    tools.push(...healthTools);
    
    // Route to specialized agent for legacy API as well
    const selectedAgent = this.routeToSpecializedAgent(userMessage);
    const systemPrompt = this.buildAgentSystemPrompt(selectedAgent, userMessage);
    
    const messages = [
      {
        role: "system" as const,
        content: systemPrompt
      },
      {
        role: "user" as const,
        content: userMessage
      }
    ];
    
    if (this.streamingConfig.enabled && onStream) {
      const stream = await this.openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? "auto" : undefined,
        stream: true
      });
      
      let fullResponse = '';
      let functionCalls: any[] = [];
      
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          fullResponse += delta.content;
          onStream(delta.content);
          await new Promise(resolve => setTimeout(resolve, this.streamingConfig.chunkDelay));
        }
        
        if (delta?.tool_calls) {
          functionCalls.push(...delta.tool_calls);
        }
      }
      
      if (functionCalls.length > 0) {
        const functionResults = await this.executeFunctionCalls(functionCalls);
        
        if (functionResults.length > 0) {
          onStream('\n\n📊 Analyzing your data...\n');
          
          const finalResponse = await this.getFinalResponseWithFunctionResults(
            systemPrompt, userMessage, functionCalls, functionResults
          );
          
          const words = finalResponse.split(' ');
          for (const word of words) {
            onStream(word + ' ');
            await new Promise(resolve => setTimeout(resolve, this.streamingConfig.chunkDelay));
          }
          
          return fullResponse + '\n\n📊 Analyzing your data...\n' + finalResponse;
        }
      }
      
      return fullResponse;
    } else {
      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? "auto" : undefined
      });
      
      const message = response.choices[0]?.message;
      let finalResponse = message?.content || "I'm here to help with your health journey!";
      
      if (message?.tool_calls && message.tool_calls.length > 0) {
        const functionResults = await this.executeFunctionCalls(message.tool_calls);
        
        if (functionResults.length > 0) {
          const enhancedResponse = await this.getFinalResponseWithFunctionResults(
            systemPrompt, userMessage, message.tool_calls, functionResults
          );
          
          finalResponse += '\n\n📊 Analysis Results:\n' + enhancedResponse;
        }
      }
      
      return finalResponse;
    }
  }
  
  // Intelligent agent routing based on message content
  private routeToSpecializedAgent(userMessage: string): HealthAgent {
    const message = userMessage.toLowerCase();
    let bestAgent = this.healthAgents[this.healthAgents.length - 1]; // Default to general triage
    let maxScore = 0;
    
    for (const agent of this.healthAgents) {
      let score = 0;
      
      // Score based on keyword matches
      for (const keyword of agent.triggerKeywords) {
        if (message.includes(keyword)) {
          score += 1;
          // Give higher weight to exact matches
          if (message === keyword || message.startsWith(keyword + ' ') || message.endsWith(' ' + keyword)) {
            score += 2;
          }
        }
      }
      
      // Bonus for multiple keyword matches (indicates stronger intent)
      const matchCount = agent.triggerKeywords.filter(keyword => message.includes(keyword)).length;
      if (matchCount > 1) {
        score += matchCount;
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestAgent = agent;
      }
    }
    
    console.log(`🎯 Routing to ${bestAgent.name} (score: ${maxScore}) for: "${userMessage}"`);
    return bestAgent;
  }
  
  // Enhanced system prompt with agent specialization
  private buildAgentSystemPrompt(agent: HealthAgent, userMessage: string): string {
    const basePrompt = this.buildEnhancedSystemPrompt();
    
    const agentPrompt = `${basePrompt}

SPECIALIZED AGENT CONTEXT:
You are now acting as ${agent.name}, specializing in ${agent.specialty}.

AGENT INSTRUCTIONS: ${agent.instructions}

AGENT CAPABILITIES:
${agent.capabilities.map(cap => `• ${cap}`).join('\n')}

SPECIALIZATION FOCUS:
Provide expert-level guidance within your specialty area. If the user's question falls outside your expertise, acknowledge this and suggest they ask about topics within your specialty or indicate that Bene's general health coordinator can help with broader topics.

USER MESSAGE CONTEXT:
The user's message "${userMessage}" has been routed to you because it relates to your area of expertise.`;

    return agentPrompt;
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
    let mockResponse = this.generateMockCoachResponse(userMessage);
    
    // Demo function calling for workout requests
    const message = userMessage.toLowerCase();
    if ((message.includes('help') && message.includes('workout')) || 
        (message.includes('create') && message.includes('workout')) ||
        message.includes('workout plan')) {
      
      // Simulate function calling
      try {
        console.log('🎯 Demo: Simulating workout generation function call');
        const workoutResult = await this.generateWorkout({
          goal: 'general_fitness',
          duration: 30,
          fitnessLevel: 'beginner',
          equipment: ['bodyweight']
        });
        
        mockResponse += '\n\n📊 *Demo Function Call Result:*\n\n';
        mockResponse += `💪 **${workoutResult.name}**\n`;
        mockResponse += `Duration: ${workoutResult.duration} minutes\n\n`;
        mockResponse += '**Exercises:**\n';
        workoutResult.exercises.forEach((exercise, index) => {
          mockResponse += `${index + 1}. ${exercise.name}: ${exercise.sets} sets × ${exercise.reps}\n   Rest: ${exercise.restTime} | ${exercise.instructions}\n\n`;
        });
        mockResponse += '**Notes:**\n';
        workoutResult.notes.forEach(note => {
          mockResponse += `• ${note}\n`;
        });
        mockResponse += '\n*This was generated using Bene\'s workout function tool! 🛠️*';
        
      } catch (error) {
        console.error('Demo function call failed:', error);
      }
    }
    
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
    
    // Handle simple greetings and conversational responses
    if (message === 'hello' || message === 'hi' || message === 'hey') {
      return "Hello! Great to see you! I'm Bene, your AI health coach. How are you feeling today? 😊";
    }
    
    if (message === 'thanks' || message === 'thank you' || message.includes('thanks')) {
      return "You're very welcome! I'm here whenever you need health and wellness guidance. What else can I help you with? 🌟";
    }
    
    if (message === 'yes' || message === 'ok' || message === 'okay') {
      return "Perfect! What would you like to explore together? I can help with fitness, nutrition, mental wellness, or any other health topics. 💪";
    }
    
    if (message === 'no') {
      return "No worries at all! I'm here if you change your mind. Feel free to ask me anything about health and wellness whenever you're ready! 🌱";
    }
    
    // Handle assessment flow more naturally
    if ((message.includes('yes') || message.includes('start') || message.includes('assessment')) && !this.userAssessment.hasCompletedAssessment) {
      return "Excellent! I'm excited to learn about you. The assessment takes about 5-7 minutes and helps me understand your unique health profile. Ready to begin? 📋";
    }
    
    if ((message.includes('no') || message.includes('skip') || message.includes('later')) && !this.userAssessment.hasCompletedAssessment) {
      return "No problem at all! I'm here to help either way. What's on your mind regarding your health and wellness? 🧬";
    }
    
    // Check for workout-related requests first (regardless of question format)
    if ((message.includes('help') && message.includes('workout')) || 
        (message.includes('create') && message.includes('workout')) ||
        (message.includes('make') && message.includes('workout')) ||
        message.includes('workout plan')) {
      return "I'd love to help you create a personalized workout plan! 💪\n\nTo design the best workout for you, I need to know:\n• Your fitness goals (strength, weight loss, muscle gain, etc.)\n• Your current fitness level\n• How much time you have\n• What equipment you have access to\n• Any injuries or limitations\n\nWhat's your main fitness goal right now?";
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
    
    // Responding to workout creation requests
    if ((message.includes('help') && message.includes('workout')) || 
        (message.includes('create') && message.includes('workout')) ||
        (message.includes('make') && message.includes('workout')) ||
        message.includes('workout plan')) {
      return "I'd love to help you create a personalized workout plan! 💪\n\nTo design the best workout for you, I need to know:\n• Your fitness goals (strength, weight loss, muscle gain, etc.)\n• Your current fitness level\n• How much time you have\n• What equipment you have access to\n• Any injuries or limitations\n\nWhat's your main fitness goal right now?";
    }
    
    // Responding to mental health topics
    if (message.includes('mental') || message.includes('mind') || message.includes('brain') || 
        message.includes('psychology') || message.includes('wellbeing') || message.includes('wellness')) {
      return "Mental health and wellness are so important! I can help you with stress management, mindfulness techniques, sleep optimization, mood regulation, and building healthy mental habits. What aspect of mental wellness interests you most? 🧠✨";
    }
    
    // Responding to statements about goals or desires  
    if (message.includes('want') || message.includes('need') || message.includes('trying') || 
        message.includes('first') || message.includes('start') || message.includes('begin')) {
      return "I appreciate you sharing what you're working toward. Let's figure out the best approach for your specific situation. What have you tried so far, and what's been challenging?";
    }
    
    // Analyze for health-related keywords and provide contextual response
    if (message.includes('fitness') || message.includes('exercise') || message.includes('gym')) {
      return "Great to focus on fitness! I can help you with workout planning, exercise science, strength training, cardio, and building sustainable fitness habits. What's your main fitness goal? 💪";
    }
    
    if (message.includes('food') || message.includes('eat') || message.includes('nutrition') || message.includes('diet')) {
      return "Nutrition is foundational to health! I can guide you through meal planning, macronutrients, healthy eating habits, and nutrition science. What aspect of nutrition would you like to explore? 🥗";
    }
    
    if (message.includes('sleep') || message.includes('tired') || message.includes('energy')) {
      return "Sleep and energy are crucial for optimal health! I can help with sleep optimization, circadian rhythm regulation, and natural energy-boosting strategies. What's your main concern - sleep quality or energy levels? 😴⚡";
    }
    
    if (message.includes('stress') || message.includes('anxiety') || message.includes('mental') || message.includes('mind')) {
      return "Mental wellness is so important! I specialize in stress management, anxiety reduction, mindfulness techniques, and building mental resilience. What aspect of mental health would you like to focus on? 🧠💙";
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
  public getCapabilities(): { hasOpenAI: boolean; streaming: boolean; webSearch: boolean; agents: number; mcp: boolean } {
    return {
      hasOpenAI: this.openaiClient !== null,
      streaming: this.streamingConfig.enabled,
      webSearch: this.webSearchConfig.enabled,
      agents: this.healthAgents.length,
      mcp: true // MCP integration available
    };
  }
  
  // Get available health agents
  public getHealthAgents(): HealthAgent[] {
    return [...this.healthAgents];
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
  
  // Get available health tools for OpenAI function calling
  public getHealthToolsForOpenAI(): any[] {
    return this.healthTools.map(tool => ({
      type: "function",
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      strict: true
    }));
  }
  
  // Execute a health tool function
  public async executeHealthTool(toolName: string, parameters: any): Promise<any> {
    const tool = this.healthTools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Health tool '${toolName}' not found`);
    }
    
    try {
      return await tool.handler(parameters);
    } catch (error) {
      console.error(`Error executing health tool ${toolName}:`, error);
      throw error;
    }
  }
  
  // Health Tool Implementations
  
  // Calculate fitness metrics (BMI, BMR, daily calories, etc.)
  private async calculateFitnessMetrics(params: any): Promise<FitnessCalculationResult> {
    const { weight, height, age, gender, activityLevel, unit = 'imperial' } = params;
    
    // Convert to metric if needed
    let weightKg = weight;
    let heightCm = height;
    
    if (unit === 'imperial') {
      weightKg = weight * 0.453592; // lbs to kg
      heightCm = height * 2.54; // inches to cm
    }
    
    const heightM = heightCm / 100;
    
    // Calculate BMI
    const bmi = weightKg / (heightM * heightM);
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender.toLowerCase() === 'male') {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
    
    // Calculate daily calories based on activity level
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    const dailyCalories = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];
    
    // Calculate ideal weight range (BMI 18.5-24.9)
    const idealWeightMin = 18.5 * (heightM * heightM);
    const idealWeightMax = 24.9 * (heightM * heightM);
    
    // Convert back to user's preferred units
    let idealWeight;
    if (unit === 'imperial') {
      idealWeight = {
        min: Math.round(idealWeightMin * 2.20462), // kg to lbs
        max: Math.round(idealWeightMax * 2.20462)
      };
    } else {
      idealWeight = {
        min: Math.round(idealWeightMin),
        max: Math.round(idealWeightMax)
      };
    }
    
    return {
      bmi: Math.round(bmi * 10) / 10,
      bmr: Math.round(bmr),
      dailyCalories: Math.round(dailyCalories),
      idealWeight
    };
  }
  
  // Analyze nutrition content
  private async analyzeNutrition(params: any): Promise<NutritionAnalysis> {
    const { foods, goal = 'maintenance' } = params;
    
    // Simplified nutritional database
    const nutritionDB: { [key: string]: any } = {
      'apple': { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4 },
      'banana': { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3 },
      'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
      'rice': { calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6 },
      'broccoli': { calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 5 },
      'salmon': { calories: 208, protein: 22, carbs: 0, fat: 12, fiber: 0 },
      'oats': { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6 },
      'egg': { calories: 70, protein: 6, carbs: 0.6, fat: 5, fiber: 0 },
      'greek yogurt': { calories: 100, protein: 17, carbs: 6, fat: 0, fiber: 0 }
    };
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    
    // Analyze each food item
    for (const food of foods) {
      const foodName = food.name.toLowerCase();
      const nutrition = nutritionDB[foodName];
      
      if (nutrition) {
        // Simple quantity parsing
        let multiplier = 1;
        if (food.quantity.includes('2')) multiplier = 2;
        else if (food.quantity.includes('0.5') || food.quantity.includes('half')) multiplier = 0.5;
        
        totalCalories += nutrition.calories * multiplier;
        totalProtein += nutrition.protein * multiplier;
        totalCarbs += nutrition.carbs * multiplier;
        totalFat += nutrition.fat * multiplier;
        totalFiber += nutrition.fiber * multiplier;
      }
    }
    
    // Generate recommendations based on goal
    const recommendations = [];
    
    if (goal === 'weight_loss') {
      if (totalCalories > 500) recommendations.push('Consider reducing portion sizes for weight loss');
      if (totalProtein < 20) recommendations.push('Add more protein to help maintain muscle during weight loss');
    } else if (goal === 'muscle_gain') {
      if (totalProtein < 25) recommendations.push('Increase protein intake for muscle building (aim for 25-30g per meal)');
    }
    
    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
      recommendations
    };
  }
  
  // Generate personalized workout
  private async generateWorkout(params: any): Promise<WorkoutPlan> {
    const { goal, duration, equipment = ['bodyweight'], fitnessLevel } = params;
    
    const exercises = [
      { name: 'Push-ups', sets: 3, reps: '8-12', restTime: '60s', instructions: 'Keep body straight, full range of motion' },
      { name: 'Bodyweight Squats', sets: 3, reps: '15-20', restTime: '60s', instructions: 'Feet shoulder-width apart, go down to 90 degrees' },
      { name: 'Plank', sets: 3, reps: '30-60s hold', restTime: '60s', instructions: 'Maintain straight line from head to heels' }
    ];
    
    return {
      name: `${goal.charAt(0).toUpperCase() + goal.slice(1)} Workout (${duration} min)`,
      duration,
      exercises,
      notes: ['Warm up before starting', 'Focus on proper form', 'Stay hydrated']
    };
  }
  
  // Assess health risks
  private async assessHealthRisks(params: any): Promise<any> {
    const { age, bmi, exerciseFrequency = 'none' } = params;
    
    const risks = [];
    const recommendations = [];
    
    if (bmi >= 25) {
      risks.push('Elevated BMI increases cardiovascular risk');
      recommendations.push('Focus on gradual weight loss through diet and exercise');
    }
    
    if (exerciseFrequency === 'none') {
      risks.push('Sedentary lifestyle increases health risks');
      recommendations.push('Start with 10-15 minutes of daily walking');
    }
    
    return {
      overallRisk: risks.length > 1 ? 'moderate' : risks.length > 0 ? 'low-moderate' : 'low',
      risks,
      recommendations
    };
  }
  
  // Execute function calls from OpenAI
  private async executeFunctionCalls(functionCalls: any[]): Promise<any[]> {
    const results = [];
    
    for (const functionCall of functionCalls) {
      try {
        // Handle both streaming and non-streaming tool call formats
        const toolName = functionCall.function?.name || functionCall.name;
        let parameters;
        
        try {
          const paramString = functionCall.function?.arguments || functionCall.parameters;
          parameters = typeof paramString === 'string' ? JSON.parse(paramString) : paramString;
        } catch (e) {
          console.warn('Error parsing function parameters:', e);
          parameters = {};
        }
        
        console.log(`🔧 Executing health tool: ${toolName}`);
        const result = await this.executeHealthTool(toolName, parameters);
        results.push({
          call: functionCall,
          result: result
        });
        console.log(`✅ Health tool ${toolName} executed successfully`);
      } catch (error) {
        console.error(`❌ Error executing health tool:`, error);
        results.push({
          call: functionCall,
          error: error.message || 'Unknown error'
        });
      }
    }
    
    return results;
  }
  
  // Get final response incorporating function results
  private async getFinalResponseWithFunctionResults(
    systemPrompt: string,
    userMessage: string,
    functionCalls: any[],
    functionResults: any[]
  ): Promise<string> {
    if (!this.openaiClient) return "Function results processed successfully!";
    
    try {
      // Build context with function results
      let functionContext = "Function call results:\n";
      for (const result of functionResults) {
        const toolName = result.call.function?.name || result.call.name || 'unknown_tool';
        if (result.error) {
          functionContext += `- ${toolName}: Error - ${result.error}\n`;
        } else {
          functionContext += `- ${toolName}: ${JSON.stringify(result.result, null, 2)}\n`;
        }
      }
      
      // Make another call to get the final interpreted response
      const finalResponse = await this.openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt + "\n\nYou have access to health calculation results. Interpret and explain them in a helpful, personalized way."
          },
          {
            role: "user",
            content: userMessage
          },
          {
            role: "assistant",
            content: functionContext + "\n\nBased on these calculations, let me provide you with personalized insights:"
          }
        ]
      });
      
      return finalResponse.choices[0]?.message?.content || "Here are your personalized health insights based on the calculations!";
    } catch (error) {
      console.error('Error getting final response with function results:', error);
      
      // Fallback: format results manually
      let response = "Here are your health calculations:\n\n";
      for (const result of functionResults) {
        if (!result.error && result.result) {
          const data = result.result;
          const toolName = result.call.function?.name || result.call.name;
          
          if (toolName === 'calculate_fitness_metrics') {
            response += `📊 **Fitness Metrics:**\n`;
            if (data.bmi) response += `• BMI: ${data.bmi}\n`;
            if (data.bmr) response += `• BMR: ${data.bmr} calories/day\n`;
            if (data.dailyCalories) response += `• Daily Calories: ${data.dailyCalories}\n`;
            if (data.idealWeight) response += `• Ideal Weight Range: ${data.idealWeight.min}-${data.idealWeight.max}\n`;
          } else if (toolName === 'analyze_nutrition') {
            response += `🥗 **Nutrition Analysis:**\n`;
            if (data.calories) response += `• Total Calories: ${data.calories}\n`;
            if (data.protein) response += `• Protein: ${data.protein}g\n`;
            if (data.carbs) response += `• Carbs: ${data.carbs}g\n`;
            if (data.fat) response += `• Fat: ${data.fat}g\n`;
            if (data.recommendations) {
              response += `\n**Recommendations:**\n`;
              data.recommendations.forEach((rec: string) => {
                response += `• ${rec}\n`;
              });
            }
          } else if (toolName === 'generate_workout') {
            response += `💪 **Workout Plan: ${data.name}**\n`;
            response += `Duration: ${data.duration} minutes\n\n`;
            data.exercises?.forEach((exercise: any, index: number) => {
              response += `${index + 1}. ${exercise.name}: ${exercise.sets} sets × ${exercise.reps}\n`;
            });
          } else if (toolName === 'assess_health_risks') {
            response += `⚕️ **Health Risk Assessment:**\n`;
            if (data.overallRisk) response += `• Overall Risk: ${data.overallRisk}\n`;
            if (data.risks?.length > 0) {
              response += `\n**Risk Factors:**\n`;
              data.risks.forEach((risk: string) => {
                response += `• ${risk}\n`;
              });
            }
            if (data.recommendations?.length > 0) {
              response += `\n**Recommendations:**\n`;
              data.recommendations.forEach((rec: string) => {
                response += `• ${rec}\n`;
              });
            }
          }
          response += '\n';
        }
      }
      
      return response;
    }
  }
}

export default AICoachService;