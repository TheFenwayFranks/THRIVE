module.exports = {
  apps: [{
    name: 'thrive-emergency',
    script: 'npx',
    args: 'expo start --web --port 19007',
    cwd: '/home/user/webapp',
    env: {
      NODE_ENV: 'development',
      PORT: 19007
    },
    watch: false,
    instances: 1,
    exec_mode: 'fork'
  }]
};