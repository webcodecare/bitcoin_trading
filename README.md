# Cryptocurrency Trading Platform

A comprehensive cryptocurrency trading platform with real-time market data, advanced analytics, and TradingView webhook integration.

## 🚀 Quick Start

### Option 1: Full Development (Both Frontend & Backend)
```bash
npm run dev
```

### Option 2: Frontend Only (Connect to Live Backend)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000` and connects to live backend at `https://swiftlead.site/api`

### Option 3: Backend Only
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:3001`

## 📁 Project Structure

```
├── frontend/     # React.js Application (Port 3000)
├── backend/      # Node.js API Server (Port 3001)  
└── *.md         # Documentation
```

## ✨ Key Features

- **Real-time Market Data** - Live cryptocurrency prices (28+ pairs)
- **Advanced Charts** - TradingView integration with technical analysis
- **Trading Signals** - Buy/sell alerts with webhook support
- **User Management** - Authentication, subscriptions, role-based access
- **Admin Dashboard** - Complete platform management
- **Mobile Responsive** - Optimized for all devices
- **Notification System** - Email, SMS, Telegram alerts

## 🌐 Live Backend

Your backend is deployed and running 24/7:
- **API**: https://swiftlead.site/api
- **Database**: PostgreSQL (Neon) with live data
- **Status**: ✅ Active with 28 cryptocurrencies

## 📖 Documentation

- [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) - Deploy frontend and backend separately
- [`DEVELOPMENT_SETUP.md`](DEVELOPMENT_SETUP.md) - Local development configuration
- [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) - Clean folder organization
- [`replit.md`](replit.md) - Complete project overview

## 🔧 Environment Setup

### Frontend (`frontend/.env`)
```bash
VITE_API_BASE_URL=https://swiftlead.site/api
VITE_WS_URL=wss://swiftlead.site
```

### Backend (`backend/.env`)  
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://neondb_owner:...
JWT_SECRET=your-secure-jwt-secret
```

## 🚀 Deployment

Deploy frontend and backend on different platforms:

**Popular Combinations:**
- Frontend: Vercel/Netlify
- Backend: Railway/Render/Heroku

See [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🧪 API Testing

Test your live backend:
```bash
curl https://swiftlead.site/api/tickers
curl https://swiftlead.site/api/market/price/BTCUSDT
```

## 📊 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite + Tailwind CSS
- TanStack Query + Wouter
- Radix UI + Shadcn/ui

**Backend:**
- Node.js + Express
- PostgreSQL + Drizzle ORM  
- WebSocket + JWT Auth
- TradingView Webhooks

Your platform is ready for professional development and deployment!