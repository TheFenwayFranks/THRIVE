import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, PanGestureHandler, Animated } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

const ThriveSwipeApp = () => {
  const [currentPage, setCurrentPage] = useState(1); // 0: Dashboard, 1: Social, 2: Profile
  const translateX = useRef(new Animated.Value(-screenWidth)).current; // Start at Social (middle page)

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === 4) { // ACTIVE state ended
      const { translationX, velocityX } = event.nativeEvent;
      
      let newPage = currentPage;
      
      // Determine which page to snap to based on gesture
      if (translationX > 50 || velocityX > 500) {
        // Swipe right - go to previous page
        newPage = Math.max(0, currentPage - 1);
      } else if (translationX < -50 || velocityX < -500) {
        // Swipe left - go to next page
        newPage = Math.min(2, currentPage + 1);
      }
      
      // Animate to the target page
      const targetTranslateX = -newPage * screenWidth;
      
      Animated.spring(translateX, {
        toValue: targetTranslateX,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      
      setCurrentPage(newPage);
    }
  };

  const pages = ['Dashboard', 'Social', 'Profile'];

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.thriveTitle}>THRIVE</Text>
        <Text style={styles.pageTitle}>{pages[currentPage]}</Text>
      </View>
      
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.pagesContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {/* Dashboard Page */}
          <View style={[styles.page, { backgroundColor: '#E8F4FD' }]}>
            <Text style={styles.pageLabel}>Dashboard</Text>
          </View>
          
          {/* Social Page */}
          <View style={[styles.page, { backgroundColor: '#F0F8FF' }]}>
            <Text style={styles.pageLabel}>Social</Text>
          </View>
          
          {/* Profile Page */}
          <View style={[styles.page, { backgroundColor: '#F5F5F5' }]}>
            <Text style={styles.pageLabel}>Profile</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
      
      {/* Page Indicators */}
      <View style={styles.indicators}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: index === currentPage ? '#4A90E2' : '#C0C0C0',
              },
            ]}
          />
        ))}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  thriveTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    letterSpacing: 2,
    marginBottom: 5,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  pagesContainer: {
    flex: 1,
    flexDirection: 'row',
    width: screenWidth * 3, // 3 pages side by side
  },
  page: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pageLabel: {
    fontSize: 24,
    fontWeight: '300',
    color: '#666666',
    opacity: 0.3,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default ThriveSwipeApp;