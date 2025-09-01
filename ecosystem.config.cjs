module.exports = {
  apps: [
    {
      name: 'thrive-web',
      script: 'npx',
      args: 'expo start --web --port 3000 --host localhost',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        EXPO_USE_FAST_RESOLVER: '1'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      cwd: '/home/user/THRIVEMobile'
    }
  ]
}