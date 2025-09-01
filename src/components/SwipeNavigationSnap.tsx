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

export default function SwipeNavigationSnap({ 
  children, 
  pageNames, 
  currentPage: propCurrentPage = 0,
  onPageChange,
  onScrollChange 
}: SwipeNavigationProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { width } = Dimensions.get('window');

  // CLEAN STATE MANAGEMENT: Single source of truth
  const [currentPageIndex, setCurrentPageIndex] = useState(propCurrentPage);
  const translateX = useRef(new Animated.Value(-propCurrentPage * width)).current;
  const isAnimating = useRef(false);
  const gestureStartX = useRef(0);

  // SWIPE THRESHOLD: 25% of screen width for decisive transitions
  const SWIPE_THRESHOLD = width * 0.25;
  const VELOCITY_THRESHOLD = 0.3;

  // AUTO-HIDING BOTTOM BAR
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  const navBarTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  console.log('📱 SnapNavigation State:', {
    currentPageIndex,
    propCurrentPage,
    isAnimating: isAnimating.current,
    width,
    threshold: SWIPE_THRESHOLD
  });

  // SYNC WITH PARENT: Clean state synchronization
  useEffect(() => {
    if (propCurrentPage !== currentPageIndex && !isAnimating.current) {
      console.log('🔄 SYNC: External page change to', propCurrentPage);
      snapToPage(propCurrentPage, false);
    }
  }, [propCurrentPage]);

  // CLEAN SNAP ANIMATION: Decisive page transitions
  const snapToPage = useCallback((targetIndex: number, animated: boolean = true) => {
    // BOUNDARY CHECK: Ensure valid page index
    const clampedIndex = Math.max(0, Math.min(children.length - 1, targetIndex));
    
    if (clampedIndex === currentPageIndex && animated) {
      console.log('📍 SNAP: Already on page', clampedIndex, '- no change needed');
      return;
    }

    console.log('🎯 SNAP: Moving to page', clampedIndex, pageNames[clampedIndex]);
    
    isAnimating.current = true;
    const targetPosition = -clampedIndex * width;
    
    setCurrentPageIndex(clampedIndex);

    const animationConfig = {
      toValue: targetPosition,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
      restDisplacementThreshold: 0.1,
      restSpeedThreshold: 0.1,
    };

    if (animated) {
      Animated.spring(translateX, animationConfig).start((finished) => {
        isAnimating.current = false;
        if (finished) {
          console.log('✅ SNAP COMPLETE: Now on page', clampedIndex, pageNames[clampedIndex]);
          // CLEAN STATE UPDATE: Only update after animation completes
          onPageChange?.(pageNames[clampedIndex], clampedIndex);
        }
      });
    } else {
      translateX.setValue(targetPosition);
      isAnimating.current = false;
      onPageChange?.(pageNames[clampedIndex], clampedIndex);
    }
  }, [currentPageIndex, children.length, width, pageNames, translateX, onPageChange]);

  // CLEAN SNAP GESTURE: No partial dragging, only decisive snaps
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal gestures (no partial dragging)
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
        return isHorizontal && !isAnimating.current;
      },

      onPanResponderGrant: (evt) => {
        console.log('👆 GESTURE START: Recording start position');
        // STOP any ongoing animations
        translateX.stopAnimation((value) => {
          gestureStartX.current = value;
        });
      },

      onPanResponderMove: (evt, gestureState) => {
        if (isAnimating.current) return;
        
        // NO PARTIAL DRAGGING: Only track gesture, don't move pages yet
        // This eliminates the partial page visibility issue
        console.log('👆 GESTURE MOVE: dx =', gestureState.dx, 'threshold =', SWIPE_THRESHOLD);
      },

      onPanResponderRelease: (evt, gestureState) => {
        console.log('👆 GESTURE RELEASE: dx =', gestureState.dx, 'velocity =', gestureState.vx);
        
        // CLEAN THRESHOLD LOGIC: Decisive page changes only
        const swipeDistance = Math.abs(gestureState.dx);
        const swipeVelocity = Math.abs(gestureState.vx);
        const hasMetThreshold = swipeDistance > SWIPE_THRESHOLD || swipeVelocity > VELOCITY_THRESHOLD;
        
        let targetPage = currentPageIndex;
        
        if (hasMetThreshold) {
          if (gestureState.dx > 0) {
            // SWIPE RIGHT: Previous page (if available)
            if (currentPageIndex > 0) {
              targetPage = currentPageIndex - 1;
              console.log('⬅️ SNAP LEFT: Going to page', targetPage);
            } else {
              console.log('⬅️ BOUNDARY: Already at first page');
            }
          } else {
            // SWIPE LEFT: Next page (if available) 
            if (currentPageIndex < children.length - 1) {
              targetPage = currentPageIndex + 1;
              console.log('➡️ SNAP RIGHT: Going to page', targetPage);
            } else {
              console.log('➡️ BOUNDARY: Already at last page');
            }
          }
        } else {
          console.log('🔙 SNAP BACK: Threshold not met, staying on page', currentPageIndex);
        }
        
        // CLEAN SNAP: Always animate to a complete page position
        snapToPage(targetPage, true);
      },
    })
  ).current;

  // SMOOTH SCROLL HANDLING: Auto-hide navigation bar
  const handleScroll = useCallback((scrollY: number) => {
    const scrollDirection = scrollY > lastScrollY.current ? 'down' : 'up';
    const scrollDelta = Math.abs(scrollY - lastScrollY.current);
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    if (scrollDirection === 'down' && scrollDelta > 30 && isNavBarVisible) {
      setIsNavBarVisible(false);
      Animated.timing(navBarTranslateY, {
        toValue: 80,
        duration: 200,
        useNativeDriver: true,
      }).start();
      onScrollChange?.('down');
    } else if (scrollDirection === 'up' && scrollDelta > 10 && !isNavBarVisible) {
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
        setIsNavBarVisible(true);
        Animated.timing(navBarTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
        onScrollChange?.('idle');
      }
    }, 1500);
    
    lastScrollY.current = scrollY;
  }, [isNavBarVisible, navBarTranslateY, onScrollChange]);

  // Page background colors for visual distinction
  const pageColors = {
    home: theme.colors.primary + '15',
    community: '#4F46E5' + '15',
    stats: '#F59E0B' + '15'
  };

  return (
    <View style={styles.container}>
      {/* CLEAN SNAP CONTAINER: No partial dragging allowed */}
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

      {/* CLEAN BOTTOM NAVIGATION: Updates only on complete page changes */}
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
            { opacity: currentPageIndex > 0 ? 1 : 0.3 }
          ]}
          onPress={() => {
            if (currentPageIndex > 0) {
              console.log('⬅️ BUTTON: Previous page');
              snapToPage(currentPageIndex - 1);
            }
          }}
          disabled={currentPageIndex <= 0 || isAnimating.current}
          activeOpacity={0.6}
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>

        {/* CLEAN PAGE INDICATORS: Only update on complete page changes */}
        <View style={styles.pageIndicatorsContainer}>
          {pageNames.map((pageName, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.pageIndicatorButton,
                currentPageIndex === index && styles.pageIndicatorActive
              ]}
              onPress={() => {
                console.log('📱 BUTTON: Direct page navigation to', pageName);
                snapToPage(index);
              }}
              disabled={isAnimating.current}
              activeOpacity={0.7}
            >
              <View style={[
                styles.pageIndicatorDot,
                { 
                  backgroundColor: currentPageIndex === index ? theme.colors.primary : theme.colors.border,
                  transform: [{ scale: currentPageIndex === index ? 1.2 : 1 }]
                }
              ]} />
              <Text style={[
                styles.pageIndicatorLabel,
                { 
                  color: currentPageIndex === index ? theme.colors.primary : theme.colors.textSecondary,
                  fontWeight: currentPageIndex === index ? '600' : '400'
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
            { opacity: currentPageIndex < children.length - 1 ? 1 : 0.3 }
          ]}
          onPress={() => {
            if (currentPageIndex < children.length - 1) {
              console.log('➡️ BUTTON: Next page');
              snapToPage(currentPageIndex + 1);
            }
          }}
          disabled={currentPageIndex >= children.length - 1 || isAnimating.current}
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
    overflow: 'hidden', // CRITICAL: Prevents partial page visibility
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
    paddingBottom: 120,
  },
  
  // CLEAN BOTTOM BAR STYLES
  bottomNavigationBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background + 'E6',
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

  // CLEAN PAGE INDICATORS
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
    minHeight: 44,
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