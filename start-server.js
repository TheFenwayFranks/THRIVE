const { spawn } = require('child_process');

// Start expo server
const expo = spawn('npx', ['expo', 'start', '--web', '--port', '8083'], {
  stdio: ['pipe', 'inherit', 'inherit'],
  cwd: '/home/user/webapp'
});

// Handle interactive prompts
expo.stdin.write('y\n'); // Answer yes to port question
setTimeout(() => {
  expo.stdin.write('y\n'); // Answer yes again if needed
}, 2000);

// Keep the process alive
expo.on('close', (code) => {
  console.log(`Expo server exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  expo.kill('SIGINT');
});

process.on('SIGTERM', () => {
  expo.kill('SIGTERM');
});