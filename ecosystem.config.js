module.exports = {
  apps: [
    {
      name: 'thrive-expo-web',
      script: 'npx',
      args: 'expo start --web --port 19006',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 19006
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 1000,
      max_restarts: 3,
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log'
    }
  ]
};