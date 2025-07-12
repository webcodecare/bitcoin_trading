#!/usr/bin/env node

const { spawn } = require('child_process');
const concurrently = require('concurrently');

console.log('🚀 Starting Bitcoin Trading Platform Development Server...');
console.log('📊 Features: Frontend (React) + Backend (Express) + PostgreSQL');
console.log('🔗 Frontend: http://localhost:3000');
console.log('🔗 Backend API: http://localhost:3001');

// Start both frontend and backend concurrently
concurrently([
  {
    command: 'cd backend && npm run dev',
    name: 'backend',
    prefixColor: 'blue',
  },
  {
    command: 'vite',
    name: 'frontend', 
    prefixColor: 'green',
  }
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
}).then(
  () => {
    console.log('✅ All services started successfully');
  },
  (error) => {
    console.log('❌ Error starting services:', error);
    process.exit(1);
  }
);