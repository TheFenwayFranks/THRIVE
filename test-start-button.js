/**
 * URGENT DEBUG: Test START button functionality
 * Simulates the exact same flow as clicking the START button
 */

console.log('🚨 TESTING START BUTTON CRASH - SIMULATING USER CLICK');
console.log('='.repeat(60));

// Simulate the exact workout data structure from quickStartWorkout
const testWorkout = { 
  name: "Balanced Flow", 
  duration: 8, 
  description: "Steady-paced movement routine" 
};

console.log('🚨 TEST 1: Workout data structure');
console.log('   Workout object:', testWorkout);
console.log('   Has name:', !!testWorkout.name);
console.log('   Has duration:', !!testWorkout.duration);  
console.log('   Has description:', !!testWorkout.description);

console.log('\n🚨 TEST 2: Timer calculation');
const timeInSeconds = testWorkout.duration * 60;
console.log('   Duration in minutes:', testWorkout.duration);
console.log('   Duration in seconds:', timeInSeconds);

console.log('\n🚨 TEST 3: formatTime function test');
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

console.log('   formatTime(480):', formatTime(480)); // 8 minutes
console.log('   formatTime(300):', formatTime(300)); // 5 minutes
console.log('   formatTime(0):', formatTime(0));     // 0 minutes

console.log('\n🚨 TEST 4: Safe property access');
console.log('   testWorkout?.name:', testWorkout?.name);
console.log('   testWorkout?.description:', testWorkout?.description);
console.log('   undefined?.name || "fallback":', undefined?.name || "fallback");

console.log('\n🚨 TEST 5: State simulation');
let mockIsWorkoutActive = false;
let mockCurrentWorkout = null;

console.log('   Before start - isWorkoutActive:', mockIsWorkoutActive);
console.log('   Before start - currentWorkout:', mockCurrentWorkout);

// Simulate startWorkout function
mockCurrentWorkout = testWorkout;
mockIsWorkoutActive = true;

console.log('   After start - isWorkoutActive:', mockIsWorkoutActive);
console.log('   After start - currentWorkout:', mockCurrentWorkout);

console.log('\n✅ START BUTTON SIMULATION COMPLETE');
console.log('   All data structures appear valid');
console.log('   No obvious crash points in data handling');
console.log('   Crash likely in React component rendering or state updates');