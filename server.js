const { spawn } = require('child_process');

console.log('Starting Expo server...');

const expo = spawn('npx', ['expo', 'start', '--web', '--port', '8081'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  cwd: '/home/user/THRIVEMobile'
});

expo.stdout.on('data', (data) => {
  console.log(`[EXPO]: ${data}`);
});

expo.stderr.on('data', (data) => {
  console.error(`[EXPO Error]: ${data}`);
});

expo.on('close', (code) => {
  console.log(`Expo process exited with code ${code}`);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Shutting down...');
  expo.kill();
  process.exit();
});
