import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type PageName = 'home' | 'community' | 'stats';

interface SwipeNavigationProps {
  children: React.ReactNode[];
  pageNames: PageName[];
  currentPage?: number;
  onPageChange?: (page: PageName, index: number) => void;
  onScrollChange?: (scrollDirection: 'up' | 'down' | 'idle') => void;
}

export default function SwipeNavigationFixed({ 
  children, 
  pageNames, 
  currentPage: propCurrentPage = 0,
  onPageChange,
  onScrollChange 
}: SwipeNavigationProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { width } = Dimensions.get('window');

  // SINGLE SOURCE OF TRUTH: Centralized page state management
  const [currentPageIndex, setCurrentPageIndex] = useState(propCurrentPage);
  const translateX = useRef(new Animated.Value(-propCurrentPage * width)).current;
  const isAnimating = useRef(false);
  const isDragging = useRef(false);

  // REAL-TIME PAGE TRACKING: Track position during swipes
  const currentPosition = useRef(-propCurrentPage * width);
  const [realTimePageIndex, setRealTimePageIndex] = useState(propCurrentPage);

  // AUTO-HIDING BOTTOM BAR: Scroll-responsive navigation
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  const navBarTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const SCROLL_THRESHOLD = 30;
  const NAV_BAR_HEIGHT = 80;

  console.log('🔄 SwipeNavigation State:', {
    currentPageIndex,
    realTimePageIndex,
    propCurrentPage,
    isAnimating: isAnimating.current,
    isDragging: isDragging.current
  });

  // SYNC WITH PARENT: Handle external page changes
  useEffect(() => {
    if (propCurrentPage !== currentPageIndex && !isDragging.current && !isAnimating.current) {
      console.log('🔄 SYNC: Parent changed page from', currentPageIndex, 'to', propCurrentPage);
      setCurrentPageIndex(propCurrentPage);
      setRealTimePageIndex(propCurrentPage);
      const targetPosition = -propCurrentPage * width;
      currentPosition.current = targetPosition;
      translateX.setValue(targetPosition);
    }
  }, [propCurrentPage, currentPageIndex, width]);

  // REAL-TIME PAGE TRACKING: Calculate current page from position
  const updateRealTimePageIndex = useCallback((position: number) => {
    const pageIndex = Math.round(-position / width);
    const clampedIndex = Math.max(0, Math.min(children.length - 1, pageIndex));
    
    if (clampedIndex !== realTimePageIndex) {
      console.log('📍 REAL-TIME: Page position changed to index', clampedIndex, pageNames[clampedIndex]);
      setRealTimePageIndex(clampedIndex);
    }
    
    return clampedIndex;
  }, [width, children.length, realTimePageIndex, pageNames]);

  // SMOOTH PAGE NAVIGATION: Animated transitions with callbacks
  const goToPage = useCallback((targetIndex: number, animated: boolean = true) => {
    if (targetIndex < 0 || targetIndex >= children.length || targetIndex === currentPageIndex) {
      console.log('❌ NAVIGATE: Invalid target index', targetIndex);
      return;
    }

    console.log('🚀 NAVIGATE: Going from page', currentPageIndex, 'to', targetIndex, `(${pageNames[currentPageIndex]} → ${pageNames[targetIndex]})`);
    
    isAnimating.current = true;
    const targetPosition = -targetIndex * width;
    currentPosition.current = targetPosition;
    
    setCurrentPageIndex(targetIndex);
    setRealTimePageIndex(targetIndex);

    if (animated) {
      Animated.spring(translateX, {
        toValue: targetPosition,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
      }).start((finished) => {
        isAnimating.current = false;
        if (finished) {
          console.log('✅ NAVIGATE: Animation completed to page', targetIndex, pageNames[targetIndex]);
          // IMMEDIATE CALLBACK: Update parent immediately
          onPageChange?.(pageNames[targetIndex], targetIndex);
        }
      });
    } else {
      translateX.setValue(targetPosition);
      isAnimating.current = false;
      onPageChange?.(pageNames[targetIndex], targetIndex);
    }
  }, [currentPageIndex, children.length, width, pageNames, translateX, onPageChange]);

  // IMPROVED SWIPE GESTURE: Smooth and responsive
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes (reduced threshold for better responsiveness)
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 5;
        if (isHorizontal) {
          isDragging.current = true;
        }
        return isHorizontal;
      },

      onPanResponderGrant: () => {
        console.log('👆 SWIPE: Started');
        isDragging.current = true;
        translateX.stopAnimation((value) => {
          currentPosition.current = value;
        });
      },

      onPanResponderMove: (evt, gestureState) => {
        if (isAnimating.current) return;
        
        // REAL-TIME POSITION: Update position with gesture
        const basePosition = -currentPageIndex * width;
        let newPosition = basePosition + gestureState.dx;
        
        // BOUNDARY CONSTRAINTS: Rubber band effect
        const maxPosition = 0; // First page
        const minPosition = -(children.length - 1) * width; // Last page
        
        if (newPosition > maxPosition) {
          // Rubber band at start
          const overshoot = newPosition - maxPosition;
          newPosition = maxPosition + overshoot * 0.3;
        } else if (newPosition < minPosition) {
          // Rubber band at end
          const overshoot = minPosition - newPosition;
          newPosition = minPosition - overshoot * 0.3;
        }
        
        currentPosition.current = newPosition;
        translateX.setValue(newPosition);
        
        // REAL-TIME TRACKING: Update page indicator during swipe
        updateRealTimePageIndex(newPosition);
      },

      onPanResponderRelease: (evt, gestureState) => {
        console.log('👆 SWIPE: Released with dx:', gestureState.dx, 'velocity:', gestureState.vx);
        isDragging.current = false;
        
        // IMPROVED SWIPE DETECTION: Reduced threshold and velocity-based
        const swipeThreshold = width * 0.2; // Reduced from 0.25 to 0.2 (20% instead of 25%)
        const velocityThreshold = 0.3; // Reduced from 0.5
        const hasSwipeDistance = Math.abs(gestureState.dx) > swipeThreshold;
        const hasSwipeVelocity = Math.abs(gestureState.vx) > velocityThreshold;
        
        let targetIndex = currentPageIndex;
        
        if (hasSwipeDistance || hasSwipeVelocity) {
          if (gestureState.dx > 0 || gestureState.vx > 0) {
            // Swipe right - previous page
            if (currentPageIndex > 0) {
              targetIndex = currentPageIndex - 1;
              console.log('👈 SWIPE RIGHT: Going to previous page', targetIndex);
            }
          } else {
            // Swipe left - next page  
            if (currentPageIndex < children.length - 1) {
              targetIndex = currentPageIndex + 1;
              console.log('👉 SWIPE LEFT: Going to next page', targetIndex);
            }
          }
        }
        
        // SEQUENTIAL VALIDATION: Ensure no page skipping
        const indexDiff = Math.abs(targetIndex - currentPageIndex);
        if (indexDiff > 1) {
          console.error('❌ INVALID: Trying to skip pages, resetting to current');
          targetIndex = currentPageIndex;
        }
        
        console.log('🎯 SWIPE RESULT: Target page', targetIndex, pageNames[targetIndex]);
        goToPage(targetIndex, true);
      },
    })
  ).current;

  // AUTO-HIDING NAVIGATION: Scroll detection with smooth animations
  const handleScroll = useCallback((scrollY: number) => {
    const currentScrollY = scrollY;
    const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
    const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    if (scrollDirection === 'down' && scrollDelta > SCROLL_THRESHOLD && isNavBarVisible) {
      console.log('📱 AUTO-HIDE: Hiding navigation bar');
      setIsNavBarVisible(false);
      Animated.timing(navBarTranslateY, {
        toValue: NAV_BAR_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
      onScrollChange?.('down');
    } else if (scrollDirection === 'up' && scrollDelta > 10 && !isNavBarVisible) {
      console.log('📱 AUTO-SHOW: Showing navigation bar');
      setIsNavBarVisible(true);
      Animated.timing(navBarTranslateY, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      onScrollChange?.('up');
    }
    
    scrollTimeout.current = setTimeout(() => {
      if (!isNavBarVisible) {
        console.log('📱 AUTO-SHOW: Showing navigation after idle');
        setIsNavBarVisible(true);
        Animated.timing(navBarTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
        onScrollChange?.('idle');
      }
    }, 1500); // Reduced from 2000ms
    
    lastScrollY.current = currentScrollY;
  }, [isNavBarVisible, navBarTranslateY, onScrollChange]);

  // Page background colors for visual distinction
  const pageColors = {
    home: theme.colors.primary + '15',
    community: '#4F46E5' + '15',
    stats: '#F59E0B' + '15'
  };

  return (
    <View style={styles.container}>
      {/* SMOOTH SWIPE CONTAINER: Optimized pan responder */}
      <View style={styles.pagesContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              transform: [{ translateX }],
              width: width * children.length,
            }
          ]}
        >
          {children.map((child, index) => {
            const pageName = pageNames[index];
            const backgroundColor = pageColors[pageName] || theme.colors.background;
            
            return (
              <View 
                key={index}
                style={[
                  styles.page,
                  { 
                    width: width,
                    backgroundColor 
                  }
                ]}
              >
                <ScrollView
                  style={styles.pageScrollView}
                  contentContainerStyle={styles.pageScrollContent}
                  onScroll={(event) => {
                    const scrollY = event.nativeEvent.contentOffset.y;
                    handleScroll(scrollY);
                  }}
                  scrollEventThrottle={16}
                  showsVerticalScrollIndicator={false}
                >
                  {child}
                </ScrollView>
              </View>
            );
          })}
        </Animated.View>
      </View>

      {/* SYNCHRONIZED BOTTOM BAR: Real-time page tracking */}
      <Animated.View 
        style={[
          styles.bottomNavigationBar,
          {
            transform: [{ translateY: navBarTranslateY }]
          }
        ]}
      >
        {/* LEFT ARROW */}
        <TouchableOpacity
          style={[
            styles.arrowButton,
            styles.leftArrow,
            { opacity: realTimePageIndex > 0 ? 1 : 0.3 }
          ]}
          onPress={() => {
            if (realTimePageIndex > 0) {
              console.log('⬅️ BUTTON: Previous page clicked');
              goToPage(realTimePageIndex - 1);
            }
          }}
          disabled={realTimePageIndex <= 0}
          activeOpacity={0.6}
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>

        {/* REAL-TIME PAGE INDICATORS */}
        <View style={styles.pageIndicatorsContainer}>
          {pageNames.map((pageName, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.pageIndicatorButton,
                realTimePageIndex === index && styles.pageIndicatorActive
              ]}
              onPress={() => {
                console.log('📱 BUTTON: Page indicator clicked:', pageName, 'index:', index);
                goToPage(index);
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.pageIndicatorDot,
                { 
                  backgroundColor: realTimePageIndex === index ? theme.colors.primary : theme.colors.border,
                  transform: [{ scale: realTimePageIndex === index ? 1.2 : 1 }]
                }
              ]} />
              <Text style={[
                styles.pageIndicatorLabel,
                { 
                  color: realTimePageIndex === index ? theme.colors.primary : theme.colors.textSecondary,
                  fontWeight: realTimePageIndex === index ? '600' : '400'
                }
              ]}>
                {pageName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RIGHT ARROW */}
        <TouchableOpacity
          style={[
            styles.arrowButton,
            styles.rightArrow,
            { opacity: realTimePageIndex < children.length - 1 ? 1 : 0.3 }
          ]}
          onPress={() => {
            if (realTimePageIndex < children.length - 1) {
              console.log('➡️ BUTTON: Next page clicked');
              goToPage(realTimePageIndex + 1);
            }
          }}
          disabled={realTimePageIndex >= children.length - 1}
          activeOpacity={0.6}
        >
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  pagesContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  animatedContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  page: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  pageScrollView: {
    flex: 1,
  },
  pageScrollContent: {
    flexGrow: 1,
    paddingBottom: 120, // Increased for bottom bar
  },
  
  // SYNCHRONIZED BOTTOM BAR STYLES
  bottomNavigationBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background + 'E6', // 90% opacity
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: theme.colors.shadow || '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.border + '60',
  },

  // ARROW BUTTONS
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  leftArrow: {
    marginRight: 8,
  },
  rightArrow: {
    marginLeft: 8,
  },
  arrowText: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // REAL-TIME PAGE INDICATORS
  pageIndicatorsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  pageIndicatorButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 60,
    minHeight: 44, // Accessibility touch target
  },
  pageIndicatorActive: {
    backgroundColor: theme.colors.primary + '15',
  },
  pageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  pageIndicatorLabel: {
    fontSize: 11,
    fontWeight: '400',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
});