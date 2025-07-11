# Local Development Setup Guide

This guide explains how to run the CryptoStrategy Pro platform locally using the separated frontend and backend architecture.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** 18+ (recommended: 20+)
- **npm** or **yarn** package manager
- **PostgreSQL** database (or access to a cloud PostgreSQL instance)
- **Git** for version control

## Quick Start (Separated Architecture)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd crypto-strategy-pro

# Install dependencies for both applications
cd backend && npm install
cd ../frontend && npm install
```

### 2. Database Setup

```bash
# Navigate to backend directory
cd backend

# Copy environment file
cp .env.example .env

# Edit .env and add your database URL
# DATABASE_URL=postgresql://username:password@localhost:5432/cryptostrategy
```

**Create Database Schema:**
```bash
# Push the database schema
npm run db:push
```

### 3. Start Backend Server

```bash
# In backend directory
npm run dev
```

The backend will start on **http://localhost:3001**

### 4. Start Frontend Application

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Copy environment file
cp .env.example .env

# Edit .env if needed (should work with defaults)
# VITE_API_BASE_URL=http://localhost:3001
# VITE_WS_URL=ws://localhost:3001

# Start frontend development server
npm run dev
```

The frontend will start on **http://localhost:3000**

### 5. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **WebSocket**: ws://localhost:3001

## Detailed Setup Instructions

### Backend Setup (`/backend/`)

#### Environment Variables

Create `.env` file in the backend directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/cryptostrategy

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=3001
NODE_ENV=development

# Optional: Notification Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

TELEGRAM_BOT_TOKEN=your-telegram-bot-token

SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Optional: External APIs
BINANCE_API_KEY=your-binance-api-key
BINANCE_SECRET_KEY=your-binance-secret-key
```

#### Database Configuration

**Option 1: Local PostgreSQL**
```bash
# Install PostgreSQL locally
sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian
brew install postgresql                         # macOS

# Create database
createdb cryptostrategy

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@localhost:5432/cryptostrategy
```

**Option 2: Cloud Database (Neon)**
```bash
# Sign up at https://neon.tech
# Create a new project
# Copy the connection string to DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@hostname:5432/database?sslmode=require
```

#### Backend Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push      # Push schema changes
npm run db:generate  # Generate migrations

# Type checking
npm run check
```

### Frontend Setup (`/frontend/`)

#### Environment Variables

Create `.env` file in the frontend directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Optional: Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_TRADING=false
VITE_ENABLE_NOTIFICATIONS=true

# Optional: External Services
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Frontend Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check
```

## Development Workflow

### Running Both Applications

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Making Changes

#### Backend Changes
1. Modify files in `backend/src/`
2. Server automatically restarts with hot reload
3. API endpoints available at `http://localhost:3001/api`

#### Frontend Changes
1. Modify files in `frontend/src/`
2. Browser automatically refreshes with hot reload
3. API calls are proxied to backend automatically

#### Database Changes
1. Update schema in `backend/src/schema.ts`
2. Run `npm run db:push` to apply changes
3. Update types in frontend if needed

### Testing the Integration

1. **API Communication**: 
   - Open browser console at http://localhost:3000
   - Check Network tab for API calls to `http://localhost:3001`
   - Verify CORS is working properly

2. **WebSocket Connection**:
   - Monitor real-time price updates
   - Check for signal notifications
   - Verify connection status indicators

3. **Authentication Flow**:
   - Register a new user
   - Login and verify JWT token storage
   - Test protected routes

## Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if port 3001 is already in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Check database connection
npm run db:push
```

#### Frontend Can't Connect to Backend
```bash
# Verify backend is running
curl http://localhost:3001/api/health

# Check proxy configuration in vite.config.ts
# Verify CORS settings in backend
```

#### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL

# Check if database exists
npm run db:push

# Verify environment variables
echo $DATABASE_URL
```

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run check
```

### Environment-Specific Issues

#### Windows Users
```bash
# Use cross-env for environment variables
npm install -g cross-env

# Or use PowerShell
$env:NODE_ENV="development"
npm run dev
```

#### Docker Users
```bash
# Run PostgreSQL in Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Update DATABASE_URL
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
```

## Performance Optimization

### Development Performance
```bash
# Backend: Use tsx for faster TypeScript execution
npm run dev  # Already uses tsx

# Frontend: Enable fast refresh
# Already configured in vite.config.ts

# Database: Use connection pooling
# Already configured in backend/src/db.ts
```

### Memory Usage
```bash
# Monitor backend memory
node --max-old-space-size=4096 dist/index.js

# Monitor frontend build size
npm run build
npm run preview
```

## Alternative Setup (Original Monolith)

If you prefer the original combined setup:

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Push database schema
npm run db:push

# Start development server
npm run dev
```

This runs both frontend and backend together on port 5000.

## Next Steps

After successful setup:

1. **Create Admin User**: Use the admin interface to create additional users
2. **Configure Notifications**: Set up Twilio, Telegram, or email services
3. **Add API Keys**: Configure external data sources
4. **Customize Features**: Enable/disable features via environment variables
5. **Deploy**: Follow deployment guides for your chosen platform

## Support

For help with setup issues:
- Check the logs in both terminal windows
- Verify all environment variables are set correctly
- Ensure PostgreSQL is running and accessible
- Check firewall and port availability
- Review the troubleshooting section above