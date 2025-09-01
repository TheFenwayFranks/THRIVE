// Force onboarding to show by clearing stored user data
// This script should be run in the browser console

console.log('🚀 THRIVE ONBOARDING: Clearing user data to trigger onboarding...');

// Clear all localStorage data
localStorage.clear();

// Clear all sessionStorage data  
sessionStorage.clear();

// Clear any AsyncStorage data (if available)
if (typeof window !== 'undefined' && window.localStorage) {
  // Clear specific THRIVE keys
  const keys = [
    'userProfile',
    'thrive_user_profile', 
    'completed_workouts',
    'thrive_completed_workouts',
    'user_settings',
    'thrive_settings',
    'morning_flow_status',
    'theme_preference'
  ];
  
  keys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Cleared: ${key}`);
  });
}

console.log('✨ User data cleared! Reload the page to see onboarding.');
console.log('📱 The onboarding should now appear automatically.');

// Force page reload to trigger onboarding check
setTimeout(() => {
  window.location.reload();
}, 1000);