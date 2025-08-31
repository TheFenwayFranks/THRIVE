module.exports = {
  apps: [{
    name: 'thrive-emergency',
    script: 'npx',
    args: 'expo start --web --port 3000',
    cwd: '/home/user/THRIVEMobile',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    watch: false,
    instances: 1,
    exec_mode: 'fork'
  }]
};