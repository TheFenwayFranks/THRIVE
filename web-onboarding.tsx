import React, { useState } from 'react';

interface WebOnboardingProps {
  visible: boolean;
  onComplete: (profile: any) => void;
}

interface UserProfile {
  goals: string[];
  pathway: 'wellness' | 'fitness' | 'performance' | '';
  name: string;
}

export default function WebOnboarding({ visible, onComplete }: WebOnboardingProps) {
  const [step, setStep] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    goals: [],
    pathway: '',
    name: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  
  console.log('🌐 WEB ONBOARDING:', { visible, step, userProfile });
  
  if (!visible) return null;
  
  // Goal selection handler
  const toggleGoal = (goalId: string) => {
    let newGoals;
    if (userProfile.goals.includes(goalId)) {
      // Remove goal
      newGoals = userProfile.goals.filter(g => g !== goalId);
    } else {
      // Add goal if under 3
      if (userProfile.goals.length < 3) {
        newGoals = [...userProfile.goals, goalId];
      } else {
        return; // Don't add more than 3
      }
    }
    setUserProfile({ ...userProfile, goals: newGoals });
    setErrors([]); // Clear errors when user makes changes
    console.log('🎯 Goals updated:', newGoals);
  };
  
  // Pathway selection handler
  const selectPathway = (pathway: 'wellness' | 'fitness' | 'performance') => {
    setUserProfile({ ...userProfile, pathway });
    setErrors([]); // Clear errors when user makes changes
    console.log('🚀 Pathway selected:', pathway);
  };
  
  // Validation functions
  const validateGoals = () => {
    return userProfile.goals.length >= 1 && userProfile.goals.length <= 3;
  };
  
  const validatePathway = () => {
    return userProfile.pathway !== '';
  };
  
  // Navigation handler
  const handleNext = () => {
    const newErrors: string[] = [];
    
    // Step 1 validation (goals)
    if (step === 1 && !validateGoals()) {
      newErrors.push('Please select 1-3 goals to continue');
    }
    
    // Step 2 validation (pathway)
    if (step === 2 && !validatePathway()) {
      newErrors.push('Please select a pathway to continue');
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors([]);
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      onComplete({
        ...userProfile,
        name: 'THRIVE User', // Default name
        completedAt: new Date().toISOString()
      });
    }
  };
  
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setErrors([]);
    }
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: '#f0f9f0',
        padding: '40px',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 10px 50px rgba(0,0,0,0.5)',
      }}>
        <h1 style={{
          color: '#16A34A',
          fontSize: '32px',
          margin: '0 0 10px 0',
        }}>🌟 Welcome to THRIVE!</h1>
        
        <p style={{
          color: '#666',
          fontSize: '16px',
          margin: '0 0 30px 0',
        }}>Step {step + 1} of 4</p>
        
        {step === 0 && (
          <div>
            <p style={{ fontSize: '18px', marginBottom: '30px', color: '#333' }}>
              Mental Health Fitness App - Your personalized wellness journey starts here!
            </p>
            <button 
              onClick={() => setStep(1)}
              style={{
                backgroundColor: '#16A34A',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Get Started 🚀
            </button>
          </div>
        )}
        
        {step === 1 && (
          <div>
            <p style={{ fontSize: '18px', marginBottom: '20px', color: '#333' }}>
              ✨ NEW: Select 1-3 wellness goals that matter most to you
            </p>
            
            {/* Goal Counter */}
            <div style={{
              backgroundColor: '#F0FDF4',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              border: '1px solid #16A34A'
            }}>
              <strong style={{ color: '#16A34A' }}>
                {userProfile.goals.length} of 3 selected
              </strong>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              {[
                { id: 'daily-movement', label: 'Move my body daily', emoji: '🚶‍♀️' },
                { id: 'stress-relief', label: 'Reduce daily stress', emoji: '🧘‍♀️' },
                { id: 'energy-boost', label: 'Increase energy levels', emoji: '⚡' },
                { id: 'better-sleep', label: 'Improve sleep quality', emoji: '😴' },
                { id: 'mood-stability', label: 'Stabilize my mood', emoji: '💚' },
                { id: 'build-routine', label: 'Build consistent routines', emoji: '📅' }
              ].map((goal) => (
                <div 
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  style={{
                    padding: '15px',
                    backgroundColor: userProfile.goals.includes(goal.id) ? '#F0FDF4' : 'white',
                    margin: '10px 0',
                    borderRadius: '12px',
                    border: userProfile.goals.includes(goal.id) ? '2px solid #16A34A' : '2px solid #ddd',
                    cursor: userProfile.goals.length >= 3 && !userProfile.goals.includes(goal.id) ? 'not-allowed' : 'pointer',
                    opacity: userProfile.goals.length >= 3 && !userProfile.goals.includes(goal.id) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '24px', marginRight: '12px' }}>{goal.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      border: '2px solid #16A34A',
                      backgroundColor: userProfile.goals.includes(goal.id) ? '#16A34A' : 'transparent',
                      marginRight: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: 'white'
                    }}>
                      {userProfile.goals.includes(goal.id) ? '✓' : ''}
                    </div>
                    <span style={{
                      fontSize: '16px',
                      color: userProfile.goals.includes(goal.id) ? '#16A34A' : '#333',
                      fontWeight: userProfile.goals.includes(goal.id) ? 'bold' : 'normal'
                    }}>
                      {goal.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Error Messages */}
            {errors.length > 0 && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px'
              }}>
                {errors.map((error, index) => (
                  <p key={index} style={{ color: '#DC2626', margin: 0, fontSize: '14px' }}>
                    ❌ {error}
                  </p>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleBack}
                style={{
                  backgroundColor: 'white',
                  color: '#16A34A',
                  border: '2px solid #16A34A',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: 1
                }}
              >
                Back
              </button>
              <button 
                onClick={handleNext}
                style={{
                  backgroundColor: '#16A34A',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: 2
                }}
              >
                Continue with Selected Goals
              </button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div>
            <p style={{ fontSize: '18px', marginBottom: '10px', color: '#333' }}>
              🎯 NEW: Choose Your THRIVE Journey
            </p>
            <p style={{ fontSize: '14px', marginBottom: '20px', color: '#666', fontStyle: 'italic' }}>
              Don't worry - you can always change this later in settings
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              {[
                {
                  id: 'wellness',
                  emoji: '🌱',
                  title: 'Wellness Journey',
                  tagline: 'Every step is progress',
                  description: "I'm focusing on mental health through gentle movement",
                  intensity: 'Low impact, high support',
                  examples: 'Walking, stretching, breathing exercises',
                  background: '#F0FDF4'
                },
                {
                  id: 'fitness', 
                  emoji: '💪',
                  title: 'Fitness Journey',
                  tagline: 'Building strength inside and out',
                  description: 'I want to build healthy habits and stay consistently active',
                  intensity: 'Moderate challenge, balanced approach',
                  examples: 'Regular workouts, jogging, gym sessions',
                  background: '#DCFCE7'
                },
                {
                  id: 'performance',
                  emoji: '🏃‍♂️',
                  title: 'Performance Journey',
                  tagline: 'Excellence in body and mind',
                  description: "I'm athletic and want to optimize both physical and mental performance",
                  intensity: 'High challenge, elite mindset', 
                  examples: 'Intense training, competitive sports, advanced fitness',
                  background: '#BBF7D0'
                }
              ].map((pathway) => (
                <div 
                  key={pathway.id}
                  onClick={() => selectPathway(pathway.id as any)}
                  style={{
                    padding: '0',
                    backgroundColor: 'white',
                    margin: '15px 0',
                    borderRadius: '16px',
                    border: userProfile.pathway === pathway.id ? '3px solid #16A34A' : '2px solid #ddd',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: userProfile.pathway === pathway.id ? '0 8px 25px rgba(22, 163, 74, 0.2)' : '0 2px 10px rgba(0,0,0,0.1)',
                    transform: userProfile.pathway === pathway.id ? 'translateY(-2px)' : 'none',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header with gradient */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: pathway.background,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}>
                    <span style={{ fontSize: '32px' }}>{pathway.emoji}</span>
                    <strong style={{ 
                      fontSize: '20px', 
                      color: '#16A34A',
                      flex: 1,
                      textAlign: 'center',
                      marginLeft: '-32px'
                    }}>
                      {pathway.title}
                    </strong>
                    {userProfile.pathway === pathway.id && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#16A34A',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div style={{ padding: '20px' }}>
                    <p style={{ 
                      fontSize: '16px', 
                      margin: '0 0 12px 0',
                      color: '#333',
                      lineHeight: '1.4'
                    }}>
                      {pathway.description}
                    </p>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#16A34A', 
                      fontStyle: 'italic',
                      margin: '0 0 12px 0',
                      textAlign: 'center'
                    }}>
                      "{pathway.tagline}"
                    </p>
                    <div style={{
                      backgroundColor: '#E5F3E5',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      margin: '0 auto 12px auto',
                      display: 'inline-block',
                      fontSize: '12px',
                      color: '#16A34A',
                      fontWeight: 'bold'
                    }}>
                      {pathway.intensity}
                    </div>
                    <p style={{
                      fontSize: '12px',
                      color: '#999',
                      textAlign: 'center',
                      fontStyle: 'italic',
                      margin: 0
                    }}>
                      {pathway.examples}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Error Messages */}
            {errors.length > 0 && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px'
              }}>
                {errors.map((error, index) => (
                  <p key={index} style={{ color: '#DC2626', margin: 0, fontSize: '14px' }}>
                    ❌ {error}
                  </p>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleBack}
                style={{
                  backgroundColor: 'white',
                  color: '#16A34A',
                  border: '2px solid #16A34A',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: 1
                }}
              >
                Back
              </button>
              <button 
                onClick={handleNext}
                style={{
                  backgroundColor: '#16A34A',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: 2
                }}
              >
                Continue with {userProfile.pathway ? userProfile.pathway.charAt(0).toUpperCase() + userProfile.pathway.slice(1) : 'Selected'} Journey
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div>
            <h2 style={{ color: '#16A34A', marginBottom: '20px' }}>🎉 You're all set!</h2>
            <p style={{ fontSize: '16px', marginBottom: '20px', color: '#666' }}>
              Welcome to your personalized THRIVE experience
            </p>
            
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px',
              textAlign: 'left',
              border: '1px solid #E5E7EB'
            }}>
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '12px' }}>
                Your Profile:
              </p>
              <p style={{ margin: '6px 0', color: '#666' }}>
                👤 Name: THRIVE User
              </p>
              <p style={{ margin: '6px 0', color: '#666' }}>
                🎯 Goals: {userProfile.goals.length} selected
                <br/>
                <small style={{ color: '#999', marginLeft: '20px' }}>
                  {userProfile.goals.map(g => g.replace('-', ' ')).join(', ')}
                </small>
              </p>
              <p style={{ margin: '6px 0', color: '#666' }}>
                🚀 Journey: {userProfile.pathway.charAt(0).toUpperCase() + userProfile.pathway.slice(1)} Path
              </p>
              <p style={{ margin: '6px 0', color: '#666' }}>
                💫 Style: Gentle motivation
              </p>
              <p style={{ margin: '6px 0', color: '#666' }}>
                🌅 Morning Flow: Optional
              </p>
            </div>
            
            <p style={{ fontSize: '16px', marginBottom: '30px', color: '#333', textAlign: 'center', lineHeight: '1.5' }}>
              Ready to start your wellness journey? Let's THRIVE together! 💚
            </p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleBack}
                style={{
                  backgroundColor: 'white',
                  color: '#16A34A',
                  border: '2px solid #16A34A',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: 1
                }}
              >
                Back
              </button>
              <button 
                onClick={handleNext}
                style={{
                  backgroundColor: '#16A34A',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '10px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: 2
                }}
              >
                Start THRIVING! 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}