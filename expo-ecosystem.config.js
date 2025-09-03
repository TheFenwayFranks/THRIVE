module.exports = {
  apps: [
    {
      name: 'expo-dev-server',
      script: 'npx',
      args: 'expo start --port 8082 --tunnel',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    }
  ]
};
