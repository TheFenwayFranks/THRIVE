module.exports = {
  apps: [{
    name: 'thrive-nuclear-reset',
    script: 'npx',
    args: 'expo start --web --port 19006',
    cwd: '/home/user/webapp',
    env: {
      NODE_ENV: 'development'
    },
    watch: false,
    autorestart: true,
    max_restarts: 3
  }]
}
