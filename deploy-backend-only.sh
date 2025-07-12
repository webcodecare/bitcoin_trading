#!/bin/bash

echo "🚀 Deploying Backend API for 24/7 operation..."

# Option 1: Railway Deployment (Recommended)
echo "📦 Option 1: Railway (Free tier, 500 hours/month)"
echo "1. Install Railway CLI: npm install -g @railway/cli"
echo "2. cd backend"
echo "3. railway login"
echo "4. railway init"
echo "5. railway up"
echo ""

# Option 2: Render Deployment
echo "🌐 Option 2: Render (Free tier, 750 hours/month)"
echo "1. Push code to GitHub"
echo "2. Connect repo to Render.com"
echo "3. Select 'backend' folder as root"
echo "4. Auto-deploy configured with render.yaml"
echo ""

# Option 3: Fly.io Deployment
echo "✈️ Option 3: Fly.io (Free tier)"
echo "1. Install flyctl"
echo "2. cd backend"
echo "3. flyctl launch"
echo "4. flyctl deploy"
echo ""

echo "🔧 Your backend includes:"
echo "✅ 28 cryptocurrency tickers ready"
echo "✅ Live price feeds with fallback data"
echo "✅ TradingView webhook integration"
echo "✅ JWT authentication system"
echo "✅ PostgreSQL database (24/7 active)"
echo "✅ Health checks and monitoring"
echo ""

echo "📡 API Endpoints will be available 24/7 at:"
echo "- GET /api/tickers (28 crypto pairs)"
echo "- GET /api/market/price/BTCUSDT"
echo "- POST /api/webhook/alerts"
echo "- POST /api/auth/login"
echo "- GET /api/chart/cycle/BTC"
echo ""

echo "🎯 After deployment, your API will run continuously without sleeping!"