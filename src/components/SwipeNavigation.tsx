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

export default function SwipeNavigation({ 
  children, 
  pageNames, 
  currentPage: propCurrentPage = 0,
  onPageChange,
  onScrollChange 
}: SwipeNavigationProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [currentPage, setCurrentPage] = useState(propCurrentPage);
  const { width } = Dimensions.get('window');

  // RELIABLE ANIMATION: Single source of truth for page position
  const translateX = useRef(new Animated.Value(-propCurrentPage * width)).current;
  const isAnimating = useRef(false);

  // AUTO-HIDING BOTTOM BAR: Scroll-responsive navigation
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  const navBarTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const SCROLL_THRESHOLD = 50;
  const NAV_BAR_HEIGHT = 80;

  // SMART ARROW VISIBILITY: Dynamic arrow state management
  const [showPrevArrow, setShowPrevArrow] = useState(false);
  const [showNextArrow, setShowNextArrow] = useState(true);
  const prevArrowOpacity = useRef(new Animated.Value(0)).current;
  const nextArrowOpacity = useRef(new Animated.Value(1)).current;

  // CONTROLLED STATE: Sync with parent (but prevent state conflicts during swipes)
  useEffect(() => {
    if (propCurrentPage !== currentPage && !isAnimating.current) {
      console.log('🔄 SYNC: Parent changed page to:', propCurrentPage, 'from internal page:', currentPage);
      // IMPORTANT: Only sync if this isn't a user-initiated swipe
      setCurrentPage(propCurrentPage);
      const targetPosition = -propCurrentPage * width;
      translateX.setValue(targetPosition);
      updateArrowVisibility(propCurrentPage);
    }
  }, [propCurrentPage]);

  // SMART ARROW VISIBILITY: Update arrow states based on current page
  const updateArrowVisibility = useCallback((pageIndex: number) => {
    const canGoPrev = pageIndex > 0;
    const canGoNext = pageIndex < children.length - 1;
    
    console.log('🎯 SMART ARROWS: Page', pageIndex, '- Prev:', canGoPrev, 'Next:', canGoNext);
    
    // Update state
    setShowPrevArrow(canGoPrev);
    setShowNextArrow(canGoNext);
    
    // Animate arrow opacity with smooth transitions
    Animated.timing(prevArrowOpacity, {
      toValue: canGoPrev ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(nextArrowOpacity, {
      toValue: canGoNext ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [children.length, prevArrowOpacity, nextArrowOpacity]);

  // UPDATE ARROWS: When page changes
  useEffect(() => {
    updateArrowVisibility(currentPage);
  }, [currentPage, updateArrowVisibility]);

  // INITIALIZE ARROWS: Set initial state
  useEffect(() => {
    updateArrowVisibility(propCurrentPage);
  }, [propCurrentPage, updateArrowVisibility]);

  // AUTO-HIDING NAVIGATION: Scroll detection
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
        duration: 300,
        useNativeDriver: true,
      }).start();
      onScrollChange?.('down');
    } else if (scrollDirection === 'up' && scrollDelta > 10 && !isNavBarVisible) {
      console.log('📱 AUTO-SHOW: Showing navigation bar');
      setIsNavBarVisible(true);
      Animated.timing(navBarTranslateY, {
        toValue: 0,
        duration: 200,
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
          duration: 300,
          useNativeDriver: true,
        }).start();
        onScrollChange?.('idle');
      }
    }, 2000);
    
    lastScrollY.current = currentScrollY;
  }, [isNavBarVisible, navBarTranslateY, onScrollChange]);

  // RELIABLE PAGE NAVIGATION: Guaranteed to complete
  const goToPageAnimated = (pageIndex: number) => {
    console.log('🚀 NAVIGATE ATTEMPT: Target page:', pageIndex, 'Current page:', currentPage, 'Is animating:', isAnimating.current);
    console.log('🚀 NAVIGATE BOUNDS: Min: 0, Max:', children.length - 1, 'Target:', pageIndex);
    
    if (pageIndex < 0 || pageIndex >= children.length || pageIndex === currentPage || isAnimating.current) {
      console.log('❌ NAVIGATE BLOCKED: Out of bounds or same page or animating');
      return;
    }

    console.log('🚀 NAVIGATE: Going to page', pageIndex, pageNames[pageIndex], 'FROM page', currentPage, pageNames[currentPage]);
    isAnimating.current = true;
    setCurrentPage(pageIndex);

    const targetPosition = -pageIndex * width;
    
    Animated.spring(translateX, {
      toValue: targetPosition,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
      restDisplacementThreshold: 0.1,
      restSpeedThreshold: 0.1,
    }).start((finished) => {
      isAnimating.current = false;
      if (finished) {
        console.log('✅ ANIMATION: Completed to page', pageIndex);
      } else {
        // Force completion if interrupted
        console.log('⚠️ ANIMATION: Forced completion');
        translateX.setValue(targetPosition);
      }
      
      // SMART ARROWS: Update visibility after animation completes
      updateArrowVisibility(pageIndex);
    });

    if (onPageChange) {
      onPageChange(pageNames[pageIndex], pageIndex);
    }
  };

  // SIMPLE SWIPE GESTURE: Reliable pan responder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animation
        translateX.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        if (isAnimating.current) return;
        
        // Real-time position update
        const basePosition = -currentPage * width;
        const newPosition = basePosition + gestureState.dx;
        
        // Boundary constraints
        const minPosition = -(children.length - 1) * width;
        const maxPosition = 0;
        
        if (newPosition > maxPosition) {
          // Rubber band effect at start
          const overshoot = newPosition - maxPosition;
          translateX.setValue(maxPosition + overshoot * 0.3);
        } else if (newPosition < minPosition) {
          // Rubber band effect at end
          const overshoot = minPosition - newPosition;
          translateX.setValue(minPosition - overshoot * 0.3);
        } else {
          translateX.setValue(newPosition);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const threshold = width * 0.25; // 25% of screen width
        const velocity = Math.abs(gestureState.vx);
        
        let targetPage = currentPage;
        
        console.log('🔍 SWIPE DEBUG: Current page:', currentPage, 'Gesture dx:', gestureState.dx, 'Threshold:', threshold);
        console.log('🔍 SWIPE DEBUG: Children length:', children.length, 'Page names:', pageNames);
        
        if (Math.abs(gestureState.dx) > threshold || velocity > 0.5) {
          if (gestureState.dx > 0 && currentPage > 0) {
            // Swipe right - ALWAYS go to previous page sequentially
            targetPage = currentPage - 1;
            console.log('👈 SWIPE RIGHT: Going from page', currentPage, 'to page', targetPage, `(${pageNames[currentPage]} → ${pageNames[targetPage]})`);
          } else if (gestureState.dx < 0 && currentPage < children.length - 1) {
            // Swipe left - ALWAYS go to next page sequentially  
            targetPage = currentPage + 1;
            console.log('👉 SWIPE LEFT: Going from page', currentPage, 'to page', targetPage, `(${pageNames[currentPage]} → ${pageNames[targetPage]})`);
          }
          
          // SAFETY CHECK: Ensure we don't skip pages
          if (targetPage !== currentPage) {
            const expectedSequence = ['home', 'community', 'stats'];
            console.log('🔒 SEQUENCE CHECK: Current =', expectedSequence[currentPage], 'Target =', expectedSequence[targetPage]);
            
            // Validate this is a sequential move
            if (Math.abs(targetPage - currentPage) === 1) {
              console.log('✅ VALID SEQUENCE: Moving sequentially');
            } else {
              console.error('❌ INVALID SEQUENCE: Trying to skip pages! Resetting to current page');
              targetPage = currentPage; // Reset to prevent page skipping
            }
          }
        }
        
        console.log('🎯 SWIPE RESULT: Target page:', targetPage, 'Current page:', currentPage);
        goToPageAnimated(targetPage);
      },
    })
  ).current;

  // Page background colors
  const pageColors = {
    home: theme.colors.primary + '15',
    community: '#4F46E5' + '15',
    stats: '#F59E0B' + '15'
  };

  return (
    <View style={styles.container}>
      {/* RELIABLE SWIPE CONTAINER: Custom pan responder */}
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



      {/* UNIFIED NAVIGATION BAR: Integrated arrows + page indicators */}
      <Animated.View 
        style={[
          styles.unifiedNavigationBar,
          {
            transform: [{ translateY: navBarTranslateY }]
          }
        ]}
      >
        {/* LEFT ARROW: Integrated navigation */}
        <Animated.View
          style={[
            styles.integratedArrowContainer,
            styles.leftArrowContainer,
            {
              opacity: prevArrowOpacity,
              transform: [
                {
                  scale: prevArrowOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  })
                }
              ]
            }
          ]}
        >
          {showPrevArrow && (
            <TouchableOpacity
              style={styles.integratedArrowButton}
              onPress={() => {
                console.log('⬅️ UNIFIED NAV: Previous page clicked');
                goToPageAnimated(currentPage - 1);
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.integratedArrowText}>‹</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* PAGE INDICATORS: Home, Community, Stats */}
        <View style={styles.pageIndicatorsGroup}>
          {children.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.unifiedIndicatorButton,
                currentPage === index && styles.unifiedIndicatorActive
              ]}
              onPress={() => {
                console.log('📱 UNIFIED NAV: Page indicator clicked:', pageNames[index]);
                goToPageAnimated(index);
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.unifiedIndicator,
                { backgroundColor: currentPage === index ? theme.colors.primary : theme.colors.border }
              ]} />
              <Text style={[
                styles.unifiedIndicatorLabel,
                { color: currentPage === index ? theme.colors.primary : theme.colors.textSecondary }
              ]}>
                {pageNames[index]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RIGHT ARROW: Integrated navigation */}
        <Animated.View
          style={[
            styles.integratedArrowContainer,
            styles.rightArrowContainer,
            {
              opacity: nextArrowOpacity,
              transform: [
                {
                  scale: nextArrowOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  })
                }
              ]
            }
          ]}
        >
          {showNextArrow && (
            <TouchableOpacity
              style={styles.integratedArrowButton}
              onPress={() => {
                console.log('➡️ UNIFIED NAV: Next page clicked');
                goToPageAnimated(currentPage + 1);
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.integratedArrowText}>›</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
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
    paddingBottom: 100,
  },
  

  
  // UNIFIED NAVIGATION BAR: Integrated arrows + page indicators
  unifiedNavigationBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.background + '90',
    borderRadius: 25,
    marginHorizontal: 20,
    zIndex: 10,
    shadowColor: theme.colors.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: theme.colors.border + '40',
  },

  // INTEGRATED ARROW STYLES
  integratedArrowContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftArrowContainer: {
    // Left arrow positioning
  },
  rightArrowContainer: {
    // Right arrow positioning
  },
  integratedArrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  integratedArrowText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // UNIFIED PAGE INDICATORS
  pageIndicatorsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  unifiedIndicatorButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 50,
    minHeight: 44, // Accessibility touch target
  },
  unifiedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 3,
  },
  unifiedIndicatorActive: {
    backgroundColor: theme.colors.primary + '15',
  },
  unifiedIndicatorLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
});