module.exports = {
  apps: [
    {
      name: 'jasmine-signage',
      script: 'node_modules/.bin/tsx',
      args: 'server.ts',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
      },
    },
  ],
};
