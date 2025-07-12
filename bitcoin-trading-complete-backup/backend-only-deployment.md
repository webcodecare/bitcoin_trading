# Backend-Only 24/7 Deployment Guide

## Current Backend Setup
Your backend is already configured and ready for independent deployment:
- Location: `/backend/` directory
- Framework: Node.js + Express + TypeScript
- Database: PostgreSQL (Neon) - already 24/7 active
- Port: 3001 (configurable via PORT env var)

## Backend API Endpoints (28 tickers ready)
- `GET /api/tickers` - All cryptocurrency tickers
- `GET /api/market/price/:symbol` - Live prices
- `GET /api/chart/cycle/:symbol` - Market cycle data
- `POST /api/webhook/alerts` - TradingView webhooks
- `POST /api/auth/login` - Authentication
- `GET /api/user/profile` - User data

## Deployment Options for Backend Only

### Option 1: Railway (Recommended)
```bash
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
```
**Result**: `https://your-backend.railway.app`

### Option 2: Render
1. Connect GitHub repo to Render
2. Select `/backend` as root directory
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
**Result**: `https://your-backend.onrender.com`

### Option 3: Fly.io
```bash
cd backend
flyctl launch --dockerfile
flyctl deploy
```
**Result**: `https://your-backend.fly.dev`

### Option 4: Heroku
```bash
cd backend
heroku create your-crypto-backend
git subtree push --prefix=backend heroku main
```
**Result**: `https://your-crypto-backend.herokuapp.com`

## Environment Variables Needed
```bash
DATABASE_URL=postgresql://neondb_owner:npg_HAOhZ8u6ifWF@ep-shiny-fog-af27tg3h.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secure-jwt-secret
NODE_ENV=production
PORT=3001
```

## Monitoring Your Backend API
Once deployed, monitor these endpoints:
- Health check: `GET /api/tickers`
- Live data: `GET /api/market/price/BTCUSDT`
- Database: All 28 cryptocurrency tickers available