module.exports = {
  apps: [
    {
      name: 'simuview-backend',
      script: '/home/fuhao/jdk-21.0.11/bin/java',
      args: [
        '-jar',
        '-Xms256m',
        '-Xmx512m',
        'SimuView-0.0.1-SNAPSHOT.jar',
        '--spring.profiles.active=prod'
      ],
      cwd: './',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'simuview-tts-asr',
      script: 'node',
      args: ['server.js'],
      cwd: './TTSASRServer',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
