module.exports = {
  apps: [{
    name: 'thrive-expo-web',
    script: 'npm',
    args: 'run web',
    env: {
      NODE_ENV: 'development',
      EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0'
    },
    watch: false,
    ignore_watch: ['node_modules', '.git'],
    log_file: './logs/thrive-app.log',
    out_file: './logs/thrive-out.log',
    error_file: './logs/thrive-error.log',
    time: true
  }]
};
