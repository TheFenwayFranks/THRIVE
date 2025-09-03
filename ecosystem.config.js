module.exports = {
  apps: [{
    name: 'thrive-app',
    script: 'npm',
    args: 'run web',
    env: {
      NODE_ENV: 'development',
      EXPO_WEB_PORT: 19006
    },
    watch: false,
    restart_delay: 3000
  }]
}
