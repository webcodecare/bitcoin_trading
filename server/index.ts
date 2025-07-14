// Start both backend and frontend
import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting Bitcoin Trading Platform...');
console.log('📊 Backend: API server with 28 cryptocurrency tickers');
console.log('🎨 Frontend: React application with trading interface');
console.log('🔗 Database: PostgreSQL (Neon) - 24/7 active');

const backendPath = path.join(process.cwd(), 'backend_new');
const frontendPath = path.join(process.cwd(), 'frontend_new');

// Start backend on port 5000
console.log('⚡ Starting Backend API on port 5000...');
const backend = spawn('tsx', ['src/index.ts'], {
  cwd: backendPath,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5000'
  }
});

// Start frontend on port 3000
console.log('🎨 Starting Frontend React App on port 3000...');
const frontend = spawn('npm', ['run', 'dev', '--', '--port', '3000'], {
  cwd: frontendPath,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

// Forward backend logs
backend.stdout.on('data', (data) => {
  process.stdout.write(`[BACKEND] ${data}`);
});
backend.stderr.on('data', (data) => {
  process.stderr.write(`[BACKEND] ${data}`);
});

// Forward frontend logs
frontend.stdout.on('data', (data) => {
  process.stdout.write(`[FRONTEND] ${data}`);
});
frontend.stderr.on('data', (data) => {
  process.stderr.write(`[FRONTEND] ${data}`);
});

// Handle process exits
backend.on('exit', (code) => {
  console.log(`Backend exited with code ${code}`);
  frontend.kill();
  process.exit(code || 0);
});

frontend.on('exit', (code) => {
  console.log(`Frontend exited with code ${code}`);
  backend.kill();
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down both services...');
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down both services...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
});