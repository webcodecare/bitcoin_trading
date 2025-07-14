#!/usr/bin/env node

// Simple startup script to run backend_new
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Bitcoin Trading Backend API (backend_new)...');
console.log('📊 Features: 28 cryptocurrency tickers, live prices, TradingView webhooks');
console.log('🔗 Database: PostgreSQL (Neon) - 24/7 active');
console.log('⚡ Mode: Development API Server on Port 5000');

// Change to backend_new directory and start the app
const backendPath = path.join(__dirname, 'backend_new');

const child = spawn('npm', ['run', 'dev'], {
  cwd: backendPath,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5000'
  }
});

child.on('exit', (code) => {
  console.log(`Backend API exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down backend API...');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down backend API...');
  child.kill('SIGINT');
});