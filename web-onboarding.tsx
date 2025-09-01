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
  
  // Mobile viewport debugging
  React.useEffect(() => {
    if (visible) {
      console.log('📱 MOBILE VIEWPORT DEBUG:', {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        userAgent: navigator.userAgent,
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      });
      
      // Check for viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        console.warn('⚠️ MOBILE WARNING: No viewport meta tag found!');
      } else {
        console.log('✅ MOBILE DEBUG: Viewport meta tag:', viewportMeta.getAttribute('content'));
      }
    }
  }, [visible]);
  
  console.log('🌐 WEB ONBOARDING:', { visible, step, userProfile });
  
  if (!visible) return null;
  
  // Goal selection handler with mobile debugging
  const toggleGoal = (goalId: string) => {
    console.log('📱 MOBILE DEBUG: toggleGoal called', {
      goalId,
      currentGoals: userProfile.goals,
      touchEvent: 'goal-selection',
      timestamp: new Date().toISOString()
    });
    
    let newGoals;
    if (userProfile.goals.includes(goalId)) {
      // Remove goal
      newGoals = userProfile.goals.filter(g => g !== goalId);
      console.log('➖ MOBILE DEBUG: Removed goal', goalId);
    } else {
      // Add goal if under 3
      if (userProfile.goals.length < 3) {
        newGoals = [...userProfile.goals, goalId];
        console.log('➕ MOBILE DEBUG: Added goal', goalId);
      } else {
        console.log('❌ MOBILE DEBUG: Goal limit reached, cannot add', goalId);
        return; // Don't add more than 3
      }
    }
    setUserProfile({ ...userProfile, goals: newGoals });
    setErrors([]); // Clear errors when user makes changes
    console.log('🎯 MOBILE DEBUG: Goals updated:', newGoals);
  };
  
  // Pathway selection handler with mobile debugging
  const selectPathway = (pathway: 'wellness' | 'fitness' | 'performance') => {
    console.log('📱 MOBILE DEBUG: selectPathway called', {
      pathway,
      previousPathway: userProfile.pathway,
      touchEvent: 'pathway-selection',
      timestamp: new Date().toISOString()
    });
    
    setUserProfile({ ...userProfile, pathway });
    setErrors([]); // Clear errors when user makes changes
    console.log('🚀 MOBILE DEBUG: Pathway selected:', pathway);
  };
  
  // Validation functions
  const validateGoals = () => {
    return userProfile.goals.length >= 1 && userProfile.goals.length <= 3;
  };
  
  const validatePathway = () => {
    return userProfile.pathway !== '';
  };
  
  // Navigation handler with mobile debugging
  const handleNext = () => {
    console.log('📱 MOBILE DEBUG: handleNext called', {
      currentStep: step,
      userProfile,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      userAgent: navigator.userAgent
    });
    
    const newErrors: string[] = [];
    
    // Step 1 validation (goals)
    if (step === 1 && !validateGoals()) {
      console.log('❌ MOBILE DEBUG: Goals validation failed', { goalCount: userProfile.goals.length });
      newErrors.push('Please select 1-3 goals to continue');
    }
    
    // Step 2 validation (pathway)
    if (step === 2 && !validatePathway()) {
      console.log('❌ MOBILE DEBUG: Pathway validation failed', { pathway: userProfile.pathway });
      newErrors.push('Please select a pathway to continue');
    }
    
    if (newErrors.length > 0) {
      console.log('❌ MOBILE DEBUG: Validation errors', newErrors);
      setErrors(newErrors);
      return;
    }
    
    setErrors([]);
    if (step < 3) {
      const newStep = step + 1;
      console.log('✅ MOBILE DEBUG: Advancing to step', newStep);
      setStep(newStep);
    } else {
      console.log('✅ MOBILE DEBUG: Completing onboarding');
      // Complete onboarding
      onComplete({
        ...userProfile,
        name: 'THRIVE User', // Default name
        completedAt: new Date().toISOString()
      });
    }
  };
  
  const handleBack = () => {
    console.log('🔙 MOBILE DEBUG: handleBack called', { currentStep: step });
    if (step > 0) {
      const newStep = step - 1;
      console.log('✅ MOBILE DEBUG: Going back to step', newStep);
      setStep(newStep);
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
      padding: '16px', // Mobile-safe padding
      boxSizing: 'border-box',
      overflowY: 'auto', // Allow scrolling on mobile
    }}>
      <div style={{
        backgroundColor: '#f0f9f0',
        padding: 'clamp(12px, 3vw, 20px)', // Compressed padding for mobile
        borderRadius: '16px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '95vh', // Maximize available space
        textAlign: 'center',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        margin: 'auto',
        overflowY: 'hidden', // Disable scrolling - everything must fit
        boxSizing: 'border-box',
      }}>
        <h1 style={{
          color: '#16A34A',
          fontSize: 'clamp(20px, 5vw, 24px)', // Even more compact title
          margin: '0 0 4px 0', // Minimal margin
          lineHeight: 1.0
        }}>🌟 Welcome to THRIVE!</h1>
        
        <p style={{
          color: '#666',
          fontSize: 'clamp(12px, 2.5vw, 14px)', // Smaller step indicator
          margin: '0 0 clamp(8px, 1.5vh, 12px) 0', // Compressed margin
        }}>Step {step + 1} of 4</p>
        
        {step === 0 && (
          <div>
            <p style={{ 
              fontSize: 'clamp(15px, 3.5vw, 16px)', 
              marginBottom: 'clamp(16px, 3vh, 20px)', 
              color: '#333',
              lineHeight: 1.3
            }}>
              Mental Health Fitness App - Your personalized wellness journey starts here!
            </p>
            <button 
              onClick={() => setStep(1)}
              style={{
                backgroundColor: '#16A34A',
                color: 'white',
                border: 'none',
                padding: '16px 24px', // Mobile-optimized padding
                minHeight: '48px', // Mobile touch target minimum
                borderRadius: '12px',
                fontSize: 'clamp(16px, 4vw, 18px)', // Responsive font size
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%',
                maxWidth: '300px',
                margin: '0 auto',
                touchAction: 'manipulation', // Prevent zoom on tap
                WebkitTapHighlightColor: 'transparent', // Remove iOS tap highlight
              }}
            >
              Get Started 🚀
            </button>
          </div>
        )}
        
        {step === 1 && (
          <div>
            <p style={{ 
              fontSize: 'clamp(14px, 3vw, 16px)', 
              marginBottom: 'clamp(8px, 1.5vh, 10px)', 
              color: '#333',
              lineHeight: 1.2
            }}>
              ✨ Select 1-3 core wellness goals
            </p>
            
            {/* Goal Counter */}
            <div style={{
              backgroundColor: '#F0FDF4',
              borderRadius: '6px',
              padding: 'clamp(6px, 1vh, 8px)', // More compressed
              marginBottom: 'clamp(8px, 1.5vh, 10px)', // Tighter margins
              textAlign: 'center',
              border: '1px solid #16A34A'
            }}>
              <strong style={{ color: '#16A34A' }}>
                {userProfile.goals.length} of 3 selected
              </strong>
            </div>
            
            <div style={{ marginBottom: 'clamp(6px, 1vh, 10px)' }}> {/* Tighter goal container margin */}
              {[
                { id: 'mental-strength', label: 'Build mental strength through movement', emoji: '💪' },
                { id: 'healthy-habits', label: 'Create consistent healthy habits', emoji: '📅' },
                { id: 'mood-anxiety', label: 'Improve mood and reduce anxiety', emoji: '💚' },
                { id: 'energy-motivation', label: 'Increase energy and motivation', emoji: '⚡' }
              ].map((goal) => (
                <div 
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  onTouchStart={(e) => {
                    console.log('📱 MOBILE DEBUG: Touch start on goal', goal.id);
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onTouchEnd={(e) => {
                    console.log('📱 MOBILE DEBUG: Touch end on goal', goal.id);
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  style={{
                    padding: 'clamp(10px, 2.5vw, 14px)', // More compact padding
                    minHeight: '52px', // Slightly smaller touch target but still accessible
                    backgroundColor: userProfile.goals.includes(goal.id) ? '#F0FDF4' : 'white',
                    margin: 'clamp(4px, 1vh, 6px) 0', // Much tighter margins between goals
                    borderRadius: '12px',
                    border: userProfile.goals.includes(goal.id) ? '2px solid #16A34A' : '2px solid #ddd',
                    cursor: userProfile.goals.length >= 3 && !userProfile.goals.includes(goal.id) ? 'not-allowed' : 'pointer',
                    opacity: userProfile.goals.length >= 3 && !userProfile.goals.includes(goal.id) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'rgba(22, 163, 74, 0.2)', // Custom tap highlight
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ fontSize: 'clamp(20px, 4vw, 22px)', marginRight: '10px' }}>{goal.emoji}</span>
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
                      fontSize: 'clamp(14px, 3vw, 15px)',
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
            
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(8px, 2vw, 12px)', // Responsive gap
              flexDirection: window.innerWidth < 480 ? 'column' : 'row', // Stack on very small screens
              marginTop: '20px'
            }}>
              <button 
                onClick={handleBack}
                style={{
                  backgroundColor: 'white',
                  color: '#16A34A',
                  border: '2px solid #16A34A',
                  padding: '14px 20px', // Mobile-optimized padding
                  minHeight: '48px', // Mobile touch target
                  borderRadius: '12px',
                  fontSize: 'clamp(14px, 3.5vw, 16px)', // Responsive font
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: window.innerWidth < 480 ? 'none' : 1,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
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
                  padding: '14px 20px', // Mobile-optimized padding
                  minHeight: '48px', // Mobile touch target
                  borderRadius: '12px',
                  fontSize: 'clamp(14px, 3.5vw, 16px)', // Responsive font
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: window.innerWidth < 480 ? 'none' : 2,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
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
            
            <div style={{ marginBottom: 'clamp(8px, 1.5vh, 12px)' }}>
              {[
                {
                  id: 'wellness',
                  emoji: '🌱',
                  title: 'Wellness',
                  description: "Mental health through gentle movement",
                  tag: 'Low impact',
                  backgroundColor: '#F0FDF4'
                },
                {
                  id: 'fitness', 
                  emoji: '💪',
                  title: 'Fitness',
                  description: 'Healthy habits and consistent activity',
                  tag: 'Balanced',
                  backgroundColor: '#DCFCE7'
                },
                {
                  id: 'performance',
                  emoji: '🏃‍♂️',
                  title: 'Performance',
                  description: "Optimize physical and mental performance",
                  tag: 'High intensity',
                  backgroundColor: '#BBF7D0'
                }
              ].map((pathway) => (
                <div 
                  key={pathway.id}
                  onClick={() => selectPathway(pathway.id as any)}
                  onTouchStart={(e) => {
                    console.log('📱 MOBILE DEBUG: Touch start on pathway', pathway.id);
                    e.currentTarget.style.transform = userProfile.pathway === pathway.id ? 'translateY(-2px) scale(0.98)' : 'scale(0.98)';
                  }}
                  onTouchEnd={(e) => {
                    console.log('📱 MOBILE DEBUG: Touch end on pathway', pathway.id);
                    e.currentTarget.style.transform = userProfile.pathway === pathway.id ? 'translateY(-2px)' : 'none';
                  }}
                  style={{
                    padding: '0',
                    backgroundColor: 'white',
                    margin: 'clamp(4px, 1vh, 8px) 0', // Much tighter margins
                    minHeight: 'clamp(70px, 12vh, 85px)', // Responsive compact height
                    borderRadius: '12px',
                    border: userProfile.pathway === pathway.id ? '2px solid #16A34A' : '2px solid #ddd',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: userProfile.pathway === pathway.id ? '0 4px 12px rgba(22, 163, 74, 0.15)' : '0 1px 4px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'rgba(22, 163, 74, 0.1)',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Compact single-row layout */}
                  <div style={{
                    padding: 'clamp(10px, 2vh, 14px)',
                    backgroundColor: pathway.background,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(8px, 2vw, 12px)',
                    height: '100%',
                    minHeight: 'inherit'
                  }}>
                    <span style={{ 
                      fontSize: 'clamp(20px, 4vw, 24px)',
                      flexShrink: 0
                    }}>
                      {pathway.emoji}
                    </span>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '2px'
                      }}>
                        <strong style={{ 
                          fontSize: 'clamp(16px, 3.5vw, 18px)', 
                          color: '#16A34A',
                          lineHeight: 1
                        }}>
                          {pathway.title}
                        </strong>
                        <span style={{
                          backgroundColor: '#E5F3E5',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: 'clamp(10px, 2vw, 11px)',
                          color: '#16A34A',
                          fontWeight: '600',
                          whiteSpace: 'nowrap'
                        }}>
                          {pathway.tag}
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: 'clamp(13px, 2.8vw, 14px)', 
                        margin: 0,
                        color: '#555',
                        lineHeight: '1.2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {pathway.description}
                      </p>
                    </div>
                    
                    {userProfile.pathway === pathway.id && (
                      <div style={{
                        width: 'clamp(20px, 4vw, 24px)',
                        height: 'clamp(20px, 4vw, 24px)',
                        backgroundColor: '#16A34A',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 'clamp(12px, 2.5vw, 14px)',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        ✓
                      </div>
                    )}
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
            
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(8px, 2vw, 12px)', // Responsive gap
              flexDirection: window.innerWidth < 480 ? 'column' : 'row', // Stack on very small screens
              marginTop: '20px'
            }}>
              <button 
                onClick={handleBack}
                style={{
                  backgroundColor: 'white',
                  color: '#16A34A',
                  border: '2px solid #16A34A',
                  padding: '14px 20px', // Mobile-optimized padding
                  minHeight: '48px', // Mobile touch target
                  borderRadius: '12px',
                  fontSize: 'clamp(14px, 3.5vw, 16px)', // Responsive font
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: window.innerWidth < 480 ? 'none' : 1,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
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
                  padding: '14px 20px', // Mobile-optimized padding
                  minHeight: '48px', // Mobile touch target
                  borderRadius: '12px',
                  fontSize: 'clamp(14px, 3.5vw, 16px)', // Responsive font
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: window.innerWidth < 480 ? 'none' : 2,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Continue with {userProfile.pathway ? userProfile.pathway.charAt(0).toUpperCase() + userProfile.pathway.slice(1) : 'Selected'} Journey
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div>
            <h2 style={{ 
              color: '#16A34A', 
              marginBottom: 'clamp(2px, 0.3vh, 3px)', // Ultra-compressed
              fontSize: 'clamp(14px, 3vw, 16px)', // Smaller title
              lineHeight: 1.0
            }}>🎉 You're all set!</h2>
            <p style={{ 
              fontSize: 'clamp(10px, 2.2vw, 11px)', // Much smaller subtitle
              marginBottom: 'clamp(4px, 0.6vh, 5px)', // Ultra-compressed
              color: '#666',
              lineHeight: 1.1
            }}>
              Welcome to your personalized THRIVE experience
            </p>
            
            {/* Selected Goals Summary - ULTRA COMPACT */}
            <div style={{
              backgroundColor: '#F0FDF4',
              borderRadius: '4px', // Very small radius
              padding: 'clamp(4px, 0.6vh, 5px)', // Ultra-compressed padding
              marginBottom: 'clamp(2px, 0.3vh, 3px)', // Ultra-tight margin
              border: '1px solid #16A34A' // Thinner border
            }}>
              <h3 style={{ 
                fontSize: 'clamp(10px, 2.2vw, 11px)', // Much smaller header
                fontWeight: 'bold', 
                color: '#16A34A', 
                margin: '0 0 clamp(1px, 0.2vh, 2px) 0', // Ultra-compressed margin
                display: 'flex',
                alignItems: 'center',
                lineHeight: 1.0
              }}>
                🎯 Your Wellness Goals
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1px, 0.1vh, 1px)' }}> {/* Ultra-tight gap */}
                {userProfile.goals.map((goalId, index) => {
                  const goalLabels: {[key: string]: {label: string, emoji: string}} = {
                    'mental-strength': { label: 'Build mental strength through movement', emoji: '💪' },
                    'healthy-habits': { label: 'Create consistent healthy habits', emoji: '📅' },
                    'mood-anxiety': { label: 'Improve mood and reduce anxiety', emoji: '💚' },
                    'energy-motivation': { label: 'Increase energy and motivation', emoji: '⚡' }
                  };
                  const goal = goalLabels[goalId];
                  return (
                    <div key={goalId} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 'clamp(1px, 0.1vh, 1px) 0', // Ultra-compressed padding
                      color: '#16A34A'
                    }}>
                      <span style={{ fontSize: 'clamp(9px, 2vw, 10px)', marginRight: '3px' }}>{goal.emoji}</span>
                      <span style={{ fontSize: 'clamp(8px, 1.8vw, 9px)', fontWeight: '500', lineHeight: 1.1 }}>{goal.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Selected Pathway Summary - ULTRA COMPACT */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '4px', // Very small radius
              padding: 'clamp(4px, 0.6vh, 5px)', // Ultra-compressed padding
              marginBottom: 'clamp(2px, 0.3vh, 3px)', // Ultra-tight margin
              border: '1px solid #16A34A' // Thinner border
            }}>
              <h3 style={{ 
                fontSize: 'clamp(10px, 2.2vw, 11px)', // Much smaller header
                fontWeight: 'bold', 
                color: '#16A34A', 
                margin: '0 0 clamp(1px, 0.2vh, 2px) 0', // Ultra-compressed margin
                display: 'flex',
                alignItems: 'center',
                lineHeight: 1.0
              }}>
                🚀 Your THRIVE Journey
              </h3>
              {(() => {
                const pathwayInfo: {[key: string]: {title: string, emoji: string, tagline: string, description: string}} = {
                  'wellness': {
                    title: 'Wellness Journey',
                    emoji: '🌱',
                    tagline: 'Every step is progress',
                    description: 'Focusing on mental health through gentle movement'
                  },
                  'fitness': {
                    title: 'Fitness Journey', 
                    emoji: '💪',
                    tagline: 'Building strength inside and out',
                    description: 'Building healthy habits and staying consistently active'
                  },
                  'performance': {
                    title: 'Performance Journey',
                    emoji: '🏃‍♂️',
                    tagline: 'Excellence in body and mind', 
                    description: 'Optimizing both physical and mental performance'
                  }
                };
                const pathway = pathwayInfo[userProfile.pathway];
                return (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 'clamp(1px, 0.2vh, 2px)' // Ultra-compressed margin
                    }}>
                      <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', marginRight: '4px' }}>{pathway.emoji}</span> {/* Smaller emoji */}
                      <div>
                        <h4 style={{ 
                          fontSize: 'clamp(9px, 2vw, 10px)', // Much smaller title
                          fontWeight: 'bold', 
                          color: '#16A34A',
                          margin: 0,
                          lineHeight: 1.0
                        }}>
                          {pathway.title}
                        </h4>
                        <p style={{ 
                          fontSize: 'clamp(7px, 1.5vw, 8px)', // Very small tagline
                          color: '#16A34A', 
                          fontStyle: 'italic',
                          margin: '0',
                          lineHeight: 1.0
                        }}>
                          "{pathway.tagline}"
                        </p>
                      </div>
                    </div>
                    <p style={{ 
                      fontSize: 'clamp(8px, 1.8vw, 9px)', // Smaller description
                      color: '#666',
                      margin: 0,
                      lineHeight: '1.1'
                    }}>
                      {pathway.description}
                    </p>
                  </div>
                );
              })()}
            </div>
            
            <p style={{ 
              fontSize: 'clamp(9px, 2vw, 10px)', // Smaller final message
              marginBottom: 'clamp(3px, 0.5vh, 4px)', // Ultra-compressed margin
              color: '#333', 
              textAlign: 'center', 
              lineHeight: '1.1'
            }}>
              Ready to start your wellness journey? Let's THRIVE together! 💚
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(4px, 1vw, 6px)', // Smaller gap
              flexDirection: window.innerWidth < 480 ? 'column' : 'row',
              marginTop: 'clamp(2px, 0.4vh, 3px)' // Ultra-compressed top margin
            }}>
              <button 
                onClick={handleBack}
                style={{
                  backgroundColor: 'white',
                  color: '#16A34A',
                  border: '2px solid #16A34A',
                  padding: '12px 16px', // Slightly smaller padding but still tappable
                  minHeight: '48px', // Mobile touch target maintained
                  borderRadius: '8px', // Smaller radius
                  fontSize: 'clamp(12px, 2.8vw, 14px)', // Smaller font
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: window.innerWidth < 480 ? 'none' : 1,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
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
                  padding: '12px 16px', // Slightly smaller padding but still tappable
                  minHeight: '48px', // Mobile touch target maintained
                  borderRadius: '8px', // Smaller radius
                  fontSize: 'clamp(14px, 3.2vw, 16px)', // Smaller but still prominent
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  flex: window.innerWidth < 480 ? 'none' : 2,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
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