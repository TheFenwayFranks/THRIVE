import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  PanResponder,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type PageName = 'home' | 'community' | 'stats';

interface PureSwipeNavigationProps {
  children: React.ReactNode[];
  pageNames: PageName[];
  currentPage?: number;
  onPageChange?: (page: PageName, index: number) => void;
  onScrollChange?: (scrollDirection: 'up' | 'down' | 'idle') => void;
}

export default function PureSwipeNavigation({ 
  children, 
  pageNames, 
  currentPage: propCurrentPage = 0,
  onPageChange,
  onScrollChange 
}: PureSwipeNavigationProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { width, height } = Dimensions.get('window');

  // 🚨 FORCE DOT STATE: Single source of truth with debugging  
  const [currentPageIndex, setCurrentPageIndex] = useState(propCurrentPage);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render mechanism
  const scrollViewRef = useRef<ScrollView>(null);
  const isScrolling = useRef(false);
  
  // 🚨 EMERGENCY DOT DEBUGGING: Log every state change
  useEffect(() => {
    console.log('🔴 DOT STATE CHANGED:', {
      currentPageIndex,
      propCurrentPage,
      activePage: pageNames[currentPageIndex],
      forceUpdate,
      timestamp: Date.now()
    });
  }, [currentPageIndex, propCurrentPage, pageNames, forceUpdate]);

  console.log('🎯 PureSwipe State:', {
    currentPageIndex,
    propCurrentPage,
    width,
    totalPages: children.length
  });

  // SYNC WITH PARENT: Handle external page changes
  useEffect(() => {
    if (propCurrentPage !== currentPageIndex && !isScrolling.current) {
      console.log('🔄 SYNC: External page change to', propCurrentPage);
      setCurrentPageIndex(propCurrentPage);
      scrollViewRef.current?.scrollTo({
        x: propCurrentPage * width,
        animated: true
      });
    }
  }, [propCurrentPage, currentPageIndex, width]);

  // EMERGENCY SNAP-TO-PAGE HANDLER: Enhanced page detection
  const handlePageSnap = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    const pageIndex = Math.round(contentOffset.x / width);
    const clampedIndex = Math.max(0, Math.min(children.length - 1, pageIndex));
    
    console.log('🚨 PAGE SNAP DEBUG:', {
      scrollX: contentOffset.x,
      width,
      pageIndex,
      clampedIndex,
      currentPageIndex,
      pageName: pageNames[clampedIndex]
    });
    
    // EMERGENCY FIX: Always update state, even if index seems same
    console.log('📍 EMERGENCY PAGE SNAP:', currentPageIndex, '→', clampedIndex, pageNames[clampedIndex]);
    setCurrentPageIndex(clampedIndex);
    onPageChange?.(pageNames[clampedIndex], clampedIndex);
  }, [currentPageIndex, width, children.length, pageNames, onPageChange]);

  // SCROLL STATE MANAGEMENT
  const handleScrollBegin = useCallback(() => {
    console.log('👆 SCROLL BEGIN');
    isScrolling.current = true;
  }, []);

  const handleScrollEnd = useCallback((event: any) => {
    console.log('👆 SCROLL END');
    isScrolling.current = false;
    handlePageSnap(event);
  }, [handlePageSnap]);

  // 🚨 FORCE DOT UPDATES: Always update dots during scroll
  const handleScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    const pageIndex = Math.round(contentOffset.x / width);
    const clampedIndex = Math.max(0, Math.min(children.length - 1, pageIndex));
    
    console.log('🔄 FORCE DOT UPDATE:', {
      scrollX: contentOffset.x,
      width,
      calculated: pageIndex,
      clamped: clampedIndex,
      current: currentPageIndex,
      scrolling: isScrolling.current
    });
    
    // FORCE UPDATE: Always update state regardless of current value
    setCurrentPageIndex(clampedIndex);
    setForceUpdate(prev => prev + 1); // Force component re-render
    onPageChange?.(pageNames[clampedIndex], clampedIndex);
  }, [width, children.length, pageNames, onPageChange, currentPageIndex]);

  // MOMENTUM SCROLL END
  const handleMomentumScrollEnd = useCallback((event: any) => {
    console.log('🎯 MOMENTUM END');
    handlePageSnap(event);
  }, [handlePageSnap]);



  // VERTICAL SCROLL HANDLING for individual pages
  const handleVerticalScroll = useCallback((scrollY: number) => {
    const scrollDirection = scrollY > 50 ? 'down' : scrollY < -50 ? 'up' : 'idle';
    onScrollChange?.(scrollDirection);
  }, [onScrollChange]);

  // Page background colors for visual distinction
  const pageColors = {
    home: theme.colors.primary + '15',
    community: '#4F46E5' + '15',
    stats: '#F59E0B' + '15'
  };

  return (
    <View style={styles.container}>
      {/* PURE SWIPE CONTAINER: Native ScrollView with snap mechanics */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleMomentumScrollEnd}

        decelerationRate="fast"
        bounces={true}
        bouncesZoom={false}
        alwaysBounceHorizontal={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
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
                  handleVerticalScroll(scrollY);
                }}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
              >
                {child}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* 🔴 FORCE DOT INDICATORS: Always show current page */}
      <View style={styles.pageDotsContainer}>
        {pageNames.map((pageName, index) => {
          const isActive = currentPageIndex === index;
          console.log(`🔴 DOT ${index} (${pageName}):`, isActive ? 'ACTIVE ●' : 'inactive ○');
          
          return (
            <View
              key={`${pageName}-${index}`}
              style={[
                styles.pageDot,
                {
                  backgroundColor: isActive 
                    ? '#16A34A'  // THRIVE green for active
                    : theme.colors.border,
                  transform: [{ 
                    scale: isActive ? 1.3 : 1 
                  }],
                  opacity: isActive ? 1 : 0.4,
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? '#16A34A' : theme.colors.border
                }
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
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
    paddingBottom: 60, // Space for page dots
  },
  
  // SIMPLE PAGE DOTS
  pageDotsContainer: {
    position: 'absolute',
    bottom: 40, // Move higher to ensure visibility
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12, // More spacing
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', // Subtle background for debugging
    paddingVertical: 8, // Padding for touch area
    zIndex: 1000, // Ensure it's on top
  },
  pageDot: {
    width: 12,  // Larger dots for better visibility
    height: 12,
    borderRadius: 6,
    marginHorizontal: 2, // Extra spacing
  },
});