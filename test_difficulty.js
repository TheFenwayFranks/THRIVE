// Quick test script to verify difficulty button functionality
// Run this in browser console to test the difficulty selection flow

console.log('🧪 Testing THRIVE Difficulty Selection');

// Simulate difficulty button clicks
function testDifficultyFlow() {
  console.log('1. Looking for difficulty buttons...');
  
  // Find gentle button
  const gentleButton = document.querySelector('[data-testid="gentle-button"]') || 
                      Array.from(document.querySelectorAll('*')).find(el => 
                        el.textContent && el.textContent.includes('Gentle'));
  
  if (gentleButton) {
    console.log('✅ Found Gentle button');
    // Simulate click
    gentleButton.click();
    console.log('🎯 Clicked Gentle button');
    
    // Wait a moment then check for workout list
    setTimeout(() => {
      const workoutList = document.querySelector('[data-testid="workout-list"]') ||
                         Array.from(document.querySelectorAll('*')).find(el => 
                           el.textContent && el.textContent.includes('minutes'));
      
      if (workoutList) {
        console.log('✅ SUCCESS: Workout list appeared after difficulty selection!');
      } else {
        console.log('❌ FAIL: No workout list found after difficulty selection');
      }
    }, 1000);
  } else {
    console.log('❌ FAIL: Could not find Gentle button');
  }
}

// Run the test
testDifficultyFlow();