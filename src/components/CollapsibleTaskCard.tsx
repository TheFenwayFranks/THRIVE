import React, { useState, useEffect } from 'react';

// Web-compatible CollapsibleTaskCard using standard HTML elements

// Add CSS animations for smooth expand/collapse
const addAnimationStyles = () => {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes expandContent {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes timerPulse {
      0% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
      }
      70% {
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }
    
    @keyframes timerTextGlow {
      0% { text-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
      50% { text-shadow: 0 0 10px rgba(16, 185, 129, 0.6); }
      100% { text-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
    }
    
    .task-header-clickable:hover {
      background-color: #F9FAFB;
    }
    
    .action-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .action-button:active {
      transform: translateY(0);
    }
    
    .timer-control-button {
      transition: all 0.3s ease-in-out;
    }
    
    .timer-control-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
    
    .timer-running {
      animation: timerPulse 2s infinite;
    }
    
    .timer-text-running {
      animation: timerTextGlow 2s ease-in-out infinite;
    }
    
    .task-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .more-dropdown-item:hover {
      background-color: #F3F4F6;
    }
    
    .more-dropdown-enter {
      animation: dropdownSlide 0.2s ease-out;
    }
    
    @keyframes dropdownSlide {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(styleSheet);
};

// Initialize styles on component mount
let stylesAdded = false;

interface CollapsibleTaskCardProps {
  activity: {
    id: string;
    name: string;
    duration: number;
  };
  workoutId: number;
  index: number;
  isCompleted: boolean;
  isActive: boolean;
  onStartActivity: (activity: any, workoutId: number) => void;
  onShowDetails: (activity: any) => void;
  onShowDemo: (activityName: string) => void;
  onPauseResumeTimer?: () => void;
  onStopTimer?: () => void;
  onCompleteActivity?: () => void;
  activeTimer?: {
    timeLeft: number;
    isRunning: boolean;
  } | null;
}

const CollapsibleTaskCard: React.FC<CollapsibleTaskCardProps> = ({
  activity,
  workoutId,
  index,
  isCompleted,
  isActive,
  onStartActivity,
  onShowDetails,
  onShowDemo,
  onPauseResumeTimer,
  onStopTimer,
  onCompleteActivity,
  activeTimer
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  
  // Add CSS animations on first render
  useEffect(() => {
    if (!stylesAdded) {
      addAnimationStyles();
      stylesAdded = true;
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreDropdown) {
        setShowMoreDropdown(false);
      }
    };

    if (showMoreDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMoreDropdown]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepCount = () => {
    // Estimate steps based on duration (rough estimate)
    if (activity.duration <= 60) return "2-3 steps";
    if (activity.duration <= 180) return "3-4 steps";
    if (activity.duration <= 300) return "4-5 steps";
    return "5+ steps";
  };

  const getTaskDescription = () => {
    // Generate brief description based on activity name
    const descriptions: { [key: string]: string } = {
      'Find comfortable seated position': 'Get ready for focused breathing',
      'Inhale for 4 counts': 'Deep breathing technique',
      'Hold breath for 7 counts': 'Breath retention exercise',
      'Exhale slowly for 8 counts': 'Calming release technique',
      'Repeat cycle 3 times': 'Complete the breathing pattern',
      'Knee-to-chest stretch': 'Gentle lower back relief',
      'Spinal twist (both sides)': 'Improve spine flexibility',
      'Cat-cow stretch': 'Gentle spine mobility',
      'Shoulder rolls': 'Release shoulder tension',
      'Gentle neck stretches': 'Reduce neck stiffness',
      'Standing body scan': 'Mindful body awareness',
      'Arm circles': 'Gentle shoulder warmup',
      'Hip circles': 'Hip mobility exercise',
      'Gentle marching in place': 'Light movement activation',
      'Deep breathing with movement': 'Coordinated breath and movement',
      'Position arms against wall': 'Proper form setup',
      '5 slow wall push-ups': 'Gentle strength building',
      'Rest and breathe': 'Recovery and centering',
      '5 more wall push-ups': 'Second strength set',
      'Gentle arm shakes': 'Muscle relaxation',
      'Find balance position': 'Stability and preparation',
      '10 slow calf raises': 'Lower leg strengthening',
      'Brief rest': 'Active recovery pause',
      '10 more calf raises': 'Complete the exercise set'
    };

    return descriptions[activity.name] || 'Wellness activity for mental and physical health';
  };

  return (
    <div className={`task-card ${
      isCompleted ? 'task-card-completed' : ''
    } ${
      isActive ? 'task-card-active' : ''
    }`} style={styles.taskCard}>
      {/* COLLAPSED STATE - Always Visible */}
      <div 
        style={styles.taskHeader}
        onClick={toggleExpanded}
        className="task-header-clickable"
      >
        {/* Task Number Badge */}
        <div style={{
          ...styles.taskBadge,
          ...(isCompleted && styles.taskBadgeCompleted),
          ...(isActive && styles.taskBadgeActive)
        }}>
          <span style={{
            ...styles.taskBadgeText,
            ...(isCompleted && styles.taskBadgeTextCompleted)
          }}>
            {isCompleted ? '✓' : index + 1}
          </span>
        </div>

        {/* Task Info */}
        <div style={styles.taskInfo}>
          <div style={{
            ...styles.taskName,
            ...(isCompleted && styles.taskNameCompleted),
            ...(isExpanded ? {} : { 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            })
          }}>
            {activity.name}
          </div>
          
          <div style={styles.taskMeta}>
            <span style={styles.taskMetaText}>
              {formatTime(activity.duration)} • {getStepCount()}
            </span>
            {!isExpanded && (
              <div style={{
                ...styles.taskDescription,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {getTaskDescription()}
              </div>
            )}
          </div>
        </div>

        {/* Timer Controls or Expand Indicator */}
        <div style={styles.expandIndicator}>
          {isActive && activeTimer ? (
            // Quick timer controls when active
            <div style={styles.quickTimerControls}>
              <button
                style={{
                  ...styles.quickTimerButton,
                  backgroundColor: activeTimer.isRunning ? '#F59E0B' : '#10B981'
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card expand/collapse
                  onPauseResumeTimer?.();
                }}
              >
                <span style={styles.quickTimerButtonText}>
                  {activeTimer.isRunning ? '⏸️' : '▶️'}
                </span>
              </button>
              <span style={styles.quickTimerText}>
                {formatTime(activeTimer.timeLeft)}
              </span>
            </div>
          ) : (
            // Expand/collapse arrow when not active
            <span style={{
              ...styles.expandIcon,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease-in-out'
            }}>
              ▼
            </span>
          )}
        </div>
      </div>

      {/* EXPANDED STATE - Collapsible Content */}
      {isExpanded && (
        <div style={{
          ...styles.taskExpandedContent,
          animation: 'expandContent 0.3s ease-in-out'
        }}>
          {/* Full Description */}
          <div style={styles.taskDescriptionFull}>
            <span style={styles.taskDescriptionText}>
              {getTaskDescription()}
            </span>
          </div>

          {/* Active Timer Display */}
          {isActive && activeTimer && (
            <div 
              style={{
                ...styles.timerContainer,
                ...(activeTimer.isRunning && styles.timerContainerRunning)
              }}
              className={activeTimer.isRunning ? 'timer-running' : ''}
            >
              <div style={styles.timerDisplay}>
                <span 
                  style={{
                    ...styles.timerText,
                    ...(activeTimer.isRunning && styles.timerTextRunning)
                  }}
                  className={activeTimer.isRunning ? 'timer-text-running' : ''}
                >
                  {formatTime(activeTimer.timeLeft)}
                </span>
                <span style={{
                  ...styles.timerLabel,
                  color: activeTimer.isRunning ? '#10B981' : '#F59E0B'
                }}>
                  {activeTimer.isRunning ? '⏳ Running' : '⏸️ Paused'}
                </span>
              </div>
              <div style={styles.timerProgress}>
                <div 
                  style={{
                    ...styles.timerProgressBar,
                    backgroundColor: activeTimer.isRunning ? '#10B981' : '#F59E0B',
                    width: `${((activity.duration - activeTimer.timeLeft) / activity.duration) * 100}%`
                  }} 
                />
              </div>
            </div>
          )}

          {/* SIMPLIFIED ACTION BUTTONS - MOBILE OPTIMIZED */}
          <div style={styles.taskActions}>
            {isActive && activeTimer ? (
              // ACTIVE TIMER: Show only 3 essential buttons
              <>
                {/* PRIMARY: Play/Pause Button */}
                <button 
                  style={{
                    ...styles.actionButton, 
                    ...(activeTimer.isRunning ? styles.pauseButton : styles.resumeButton)
                  }}
                  onClick={onPauseResumeTimer}
                  className="action-button timer-control-button"
                >
                  <span style={activeTimer.isRunning ? styles.pauseButtonText : styles.resumeButtonText}>
                    {activeTimer.isRunning ? '⏸️ Pause' : '▶️ Resume'}
                  </span>
                </button>
                
                {/* PRIMARY: Stop Button */}
                <button 
                  style={{...styles.actionButton, ...styles.stopButton}}
                  onClick={onStopTimer}
                  className="action-button stop-button"
                >
                  <span style={styles.stopButtonText}>⏹️ Stop</span>
                </button>
                
                {/* PRIMARY: Complete Button */}
                <button 
                  style={{...styles.actionButton, ...styles.completeButton}}
                  onClick={onCompleteActivity}
                  className="action-button complete-button"
                >
                  <span style={styles.completeButtonText}>✅ Complete</span>
                </button>
              </>
            ) : !isCompleted ? (
              // INACTIVE TIMER: Show Start + More buttons
              <>
                {/* PRIMARY: Start Button */}
                <button 
                  style={{...styles.actionButton, ...styles.startButton}}
                  onClick={() => onStartActivity(activity, workoutId)}
                  className="action-button start-button"
                >
                  <span style={styles.startButtonText}>▶️ Start</span>
                </button>
                
                {/* SECONDARY: More Button with Dropdown */}
                <div style={styles.moreButtonContainer}>
                  <button 
                    style={{...styles.actionButton, ...styles.moreButton}}
                    onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                    className="action-button more-button"
                  >
                    <span style={styles.moreButtonText}>⋯ More</span>
                  </button>
                  
                  {/* More Dropdown Menu */}
                  {showMoreDropdown && (
                    <div style={styles.moreDropdown} className="more-dropdown-enter">
                      <button 
                        style={styles.dropdownItem}
                        className="more-dropdown-item"
                        onClick={() => {
                          onShowDetails(activity);
                          setShowMoreDropdown(false);
                        }}
                      >
                        <span>📋 Details</span>
                      </button>
                      <button 
                        style={styles.dropdownItem}
                        className="more-dropdown-item"
                        onClick={() => {
                          onShowDemo(activity.name);
                          setShowMoreDropdown(false);
                        }}
                      >
                        <span>🎥 Demo</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // COMPLETED: Show only More button for review
              <div style={styles.moreButtonContainer}>
                <button 
                  style={{...styles.actionButton, ...styles.moreButton}}
                  onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                  className="action-button more-button"
                >
                  <span style={styles.moreButtonText}>⋯ More</span>
                </button>
                
                {/* Completed Task Dropdown */}
                {showMoreDropdown && (
                  <div style={styles.moreDropdown} className="more-dropdown-enter">
                    <button 
                      style={styles.dropdownItem}
                      className="more-dropdown-item"
                      onClick={() => {
                        onShowDetails(activity);
                        setShowMoreDropdown(false);
                      }}
                    >
                      <span>📋 Review Details</span>
                    </button>
                    <button 
                      style={styles.dropdownItem}
                      className="more-dropdown-item"
                      onClick={() => {
                        onShowDemo(activity.name);
                        setShowMoreDropdown(false);
                      }}
                    >
                      <span>🎥 Watch Demo</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Task Progress Info */}
          <div style={styles.taskProgress}>
            <span style={styles.progressText}>
              {isCompleted ? 
                '✅ Completed' : 
                isActive ? 
                  '⏳ In Progress' : 
                  '⭕ Ready to Start'
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  // Main Card Container
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    marginBottom: '8px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  },
  taskCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  taskCardActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: '2px',
  },

  // Header (Always Visible)
  taskHeader: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    padding: '16px',
    minHeight: '64px', // Ensure good touch target
    cursor: 'pointer',
  },

  // Task Badge
  taskBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    backgroundColor: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    flexShrink: 0,
  },
  taskBadgeCompleted: {
    backgroundColor: '#10B981',
  },
  taskBadgeActive: {
    backgroundColor: '#F59E0B',
  },
  taskBadgeText: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#6B7280',
  },
  taskBadgeTextCompleted: {
    color: '#FFFFFF',
  },

  // Task Info
  taskInfo: {
    flex: 1,
    marginRight: '12px',
    minWidth: 0, // Allow text truncation
  },
  taskName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    lineHeight: '20px',
    marginBottom: '4px',
  },
  taskNameCompleted: {
    color: '#059669',
  },
  taskMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  taskMetaText: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: '2px',
  },
  taskDescription: {
    fontSize: '12px',
    color: '#9CA3AF',
    lineHeight: '16px',
  },

  // Expand Indicator
  expandIndicator: {
    width: 'auto',
    minWidth: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  expandIcon: {
    fontSize: '12px',
    color: '#6B7280',
    userSelect: 'none' as const,
  },

  // Quick Timer Controls (in collapsed header)
  quickTimerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  quickTimerButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    fontSize: '14px',
  },
  quickTimerButtonText: {
    color: '#FFFFFF',
    fontSize: '12px',
  },
  quickTimerText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'monospace',
  },

  // Expanded Content
  taskExpandedContent: {
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingBottom: '16px',
    borderTop: '1px solid #F3F4F6',
  },

  // Full Description
  taskDescriptionFull: {
    marginBottom: '16px',
  },
  taskDescriptionText: {
    fontSize: '14px',
    color: '#4B5563',
    lineHeight: '20px',
  },

  // Timer Container
  timerContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    border: '2px solid transparent',
    transition: 'all 0.3s ease-in-out',
  },
  timerContainerRunning: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.1)',
  },
  timerDisplay: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  timerText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#F59E0B',
    transition: 'color 0.3s ease-in-out',
  },
  timerTextRunning: {
    color: '#10B981',
  },
  timerLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7280',
  },
  timerProgress: {
    height: '4px',
    backgroundColor: '#E5E7EB',
    borderRadius: '2px',
  },
  timerProgressBar: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: '2px',
    transition: 'width 0.3s ease-in-out',
  },

  // Action Buttons - Mobile Optimized
  taskActions: {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '12px', // Increased gap for better mobile spacing
    marginBottom: '12px',
    alignItems: 'stretch', // Ensure equal height
  },
  actionButton: {
    flex: 1,
    padding: '12px 16px', // Increased padding for better mobile touch
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '48px', // Increased to 48px for better mobile accessibility
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    fontSize: '14px', // Slightly larger text
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Added subtle shadow
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  pauseButton: {
    backgroundColor: '#F59E0B', // Orange for pause
  },
  resumeButton: {
    backgroundColor: '#10B981', // Green for resume (same as start)
  },
  stopButton: {
    backgroundColor: '#EF4444', // Red for stop
  },
  completeButton: {
    backgroundColor: '#059669', // Dark green for complete
  },
  detailsButton: {
    backgroundColor: '#3B82F6',
  },
  demoButton: {
    backgroundColor: '#8B5CF6',
  },
  moreButton: {
    backgroundColor: '#6B7280', // Gray color for secondary action
  },
  startButtonText: {
    color: '#FFFFFF',
  },
  pauseButtonText: {
    color: '#FFFFFF',
  },
  resumeButtonText: {
    color: '#FFFFFF',
  },
  stopButtonText: {
    color: '#FFFFFF',
  },
  completeButtonText: {
    color: '#FFFFFF',
  },
  detailsButtonText: {
    color: '#FFFFFF',
  },
  demoButtonText: {
    color: '#FFFFFF',
  },
  moreButtonText: {
    color: '#FFFFFF',
  },

  // More Button Dropdown Container
  moreButtonContainer: {
    position: 'relative' as const,
    flex: 1,
  },
  moreDropdown: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    left: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid #E5E7EB',
    zIndex: 1000,
    marginTop: '4px',
    overflow: 'hidden',
  },
  dropdownItem: {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    transition: 'background-color 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '44px', // Mobile touch target
  },

  // Progress Info
  taskProgress: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7280',
  },
};

export default CollapsibleTaskCard;