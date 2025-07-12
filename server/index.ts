// Combined server that runs both frontend and backend
import { spawn } from 'child_process';
import path from 'path';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

console.log('🚀 Starting combined server with frontend and backend...');

const app = express();
const PORT = 5000;

// Start backend process
const backendPath = path.resolve(process.cwd(), 'backend');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: backendPath,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

// Start frontend process
const frontendPath = path.resolve(process.cwd(), 'frontend');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: frontendPath,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

// Wait for services to start
setTimeout(() => {
  // Proxy API requests to backend
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api'
    }
  }));

  // Proxy WebSocket requests to backend
  app.use('/socket.io', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true
  }));

  // Proxy everything else to frontend
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    ws: true
  }));

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Combined server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:3000 (proxied through port ${PORT})`);
    console.log(`🔧 Backend API: http://localhost:3001 (proxied through port ${PORT}/api)`);
  });
}, 3000);

// Handle process cleanup
process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});