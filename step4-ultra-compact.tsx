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