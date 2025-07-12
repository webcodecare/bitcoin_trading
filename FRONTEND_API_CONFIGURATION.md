# Frontend API Configuration Guide

## ✅ Fixed API Configuration

Your frontend is now properly configured to use environment variables for API endpoints instead of hardcoded URLs.

## 📁 Configuration Files

### 1. **Environment Variables** (`client/.env`)
```bash
# Development (current)
VITE_API_BASE_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000

# Production (update when backend is deployed)
# VITE_API_BASE_URL=https://your-backend.railway.app
# VITE_WS_URL=wss://your-backend.railway.app
```

### 2. **Centralized Config** (`client/src/lib/config.ts`)
- Manages all environment variables
- Provides URL builders for API and WebSocket
- Validates configuration on startup
- Logs current API settings

### 3. **API Client** (`client/src/lib/queryClient.ts`)
- Uses environment variables via config
- Builds full URLs automatically
- Handles authentication tokens
- Works with both relative and absolute URLs

## 🔧 How It Works Now

### Before (Hardcoded):
```typescript
// ❌ Old way - hardcoded relative URLs
fetch('/api/tickers')
```

### After (Environment Variable):
```typescript
// ✅ New way - uses VITE_API_BASE_URL
fetch('http://localhost:5000/api/tickers')  // Development
fetch('https://your-backend.railway.app/api/tickers')  // Production
```

## 🚀 For Production Deployment

### Step 1: Deploy Backend API (24/7)
```bash
cd backend
railway up  # (or your chosen platform)
```
Get your permanent URL: `https://your-backend.railway.app`

### Step 2: Update Frontend Environment
```bash
# Update client/.env
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_WS_URL=wss://your-backend.railway.app
```

### Step 3: Deploy Frontend
```bash
npm run build  # Frontend builds with production API URLs
```

## 📊 Configuration Validation

The system now logs API configuration on startup:
```bash
API Configuration: {
  apiBaseUrl: "http://localhost:5000",
  wsUrl: "ws://localhost:5000", 
  environment: "development"
}
```

## 🎯 Benefits

✅ **Environment-aware**: Automatically uses correct URLs per environment  
✅ **Centralized**: Single place to manage all API configuration  
✅ **Flexible**: Easy to switch between development/production  
✅ **Validated**: Checks for missing environment variables  
✅ **Production-ready**: Works with any backend deployment URL  

Your frontend API is now globally configured via environment variables!