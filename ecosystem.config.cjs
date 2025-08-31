module.exports = {
  apps: [
    {
      name: 'thrive-emergency',
      script: 'npx',
      args: 'expo start --web --port 8081',
      env: {
        NODE_ENV: 'development',
        PORT: 8081
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
