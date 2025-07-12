// Simple compatibility server that runs the backend
import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting monolithic server with frontend and backend...');

const backendPath = path.resolve(process.cwd(), 'backend');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

backend.on('error', (error) => {
  console.error('❌ Backend failed to start:', error);
  process.exit(1);
});

backend.on('exit', (code) => {
  console.log(`Backend exited with code ${code}`);
  process.exit(code || 0);
});