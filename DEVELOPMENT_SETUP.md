# Development Setup Guide

## 🔧 **Local Development vs Live Backend**

You have two options for running your frontend locally:

### **Option 1: Connect to Live Backend (Current Setup)**
Your frontend connects to your deployed backend at `https://swiftlead.site/api`

**Current Configuration** (`client/.env`):
```bash
VITE_API_BASE_URL=https://swiftlead.site/api
VITE_WS_URL=wss://swiftlead.site
```

**Benefits:**
- ✅ Uses live data from your deployed backend
- ✅ Same data as production
- ✅ No need to run local backend
- ✅ Tests real deployment configuration

### **Option 2: Use Local Backend**
Run both frontend and backend locally

**Setup for Local Development:**
```bash
# 1. Update client/.env for local backend
VITE_API_BASE_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000

# 2. Start local backend (in another terminal)
npm run dev

# 3. Start frontend
npm run dev
```

## 🚀 **Testing Your Live Backend**

Your live backend at `https://swiftlead.site/api` is working perfectly:

### **Available Endpoints:**
- `https://swiftlead.site/api/tickers` - 28 cryptocurrencies ✅
- `https://swiftlead.site/api/market/price/BTCUSDT` - Live Bitcoin price ✅
- `https://swiftlead.site/api/market/price/ETHUSDT` - Live Ethereum price ✅
- `https://swiftlead.site/api/auth/login` - User authentication ✅

### **Test Commands:**
```bash
# Test API endpoints
curl https://swiftlead.site/api/tickers
curl https://swiftlead.site/api/market/price/BTCUSDT
curl https://swiftlead.site/api/market/price/ETHUSDT

# Should return JSON data for all endpoints
```

## 🔄 **Switching Between Configurations**

### **For Live Backend (Recommended):**
```bash
# client/.env
VITE_API_BASE_URL=https://swiftlead.site/api
VITE_WS_URL=wss://swiftlead.site
```

### **For Local Backend:**
```bash
# client/.env  
VITE_API_BASE_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

## 🐛 **Troubleshooting Proxy Errors**

If you see `ECONNREFUSED 127.0.0.1:3001` errors, it means:
1. Your environment variables are not being used properly
2. The frontend is trying to proxy to `localhost:3001` instead of using your live backend

**Solution:** Make sure your `client/.env` file has the correct live backend URL.

## ✅ **Current Status**

- **Live Backend**: `https://swiftlead.site/api` - ✅ Working
- **Database**: PostgreSQL (Neon) - ✅ Active 24/7
- **Cryptocurrencies**: 28 tickers loaded - ✅ Available
- **API Endpoints**: All functional - ✅ Tested

Your setup is ready for development with your live backend!