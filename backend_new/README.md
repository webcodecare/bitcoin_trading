# Bitcoin Trading Platform - Backend

A comprehensive cryptocurrency trading platform backend API built with Express.js and TypeScript.

## 🚀 Features

- **28 Cryptocurrency Tickers** - Support for major cryptocurrencies
- **Real-time Trading Signals** - WebSocket-based live updates
- **TradingView Webhook Integration** - Receive alerts from TradingView
- **Role-based Authentication** - JWT-based auth with admin/user roles
- **PostgreSQL Database** - Robust data persistence with Drizzle ORM
- **Comprehensive API** - 147 endpoints for all platform features
- **Rate Limiting & Security** - Production-ready security middleware

## 🏗️ Architecture

```
backend/
├── src/
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # All API routes (147 endpoints)
│   ├── schema.ts         # Database schema definitions
│   ├── config.ts         # Environment configuration
│   ├── db.ts            # Database connection
│   ├── middleware/      # Authentication & security middleware
│   └── services/        # Business logic services
├── railway.json         # Railway deployment config
├── render.yaml          # Render deployment config
├── Dockerfile           # Docker containerization
└── package.json         # Dependencies and scripts
```

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Setup
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

The backend will start on `http://localhost:3001`

## 🌐 Deployment

### Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Set root directory to `backend_new` 
3. Railway auto-configures using `railway.json`
4. Add environment variables in Railway dashboard

### Render
1. Connect your GitHub repository to Render
2. Set root directory to `backend_new`
3. Render auto-configures using `render.yaml` 
4. Add environment variables in Render dashboard

### Docker
```bash
# Build container
docker build -t bitcoin-trading-backend .

# Run container
docker run -p 3001:3001 \
  -e DATABASE_URL=your-db-url \
  -e JWT_SECRET=your-jwt-secret \
  bitcoin-trading-backend
```

## 📋 Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `SESSION_SECRET` - Secret for session management

### Optional (Enhanced Features)
- `BINANCE_API_KEY` - For live market data
- `OPENAI_API_KEY` - For AI-powered features
- `STRIPE_SECRET_KEY` - For payment processing
- `TWILIO_ACCOUNT_SID` - For SMS notifications
- `TELEGRAM_BOT_TOKEN` - For Telegram alerts

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Market Data
- `GET /api/market/price/{symbol}` - Get current price
- `GET /api/tickers` - Get available tickers
- `GET /api/ohlc` - Get OHLC data for charts

### Trading Signals
- `GET /api/signals/{symbol}` - Get trading signals
- `POST /api/webhook/alerts` - TradingView webhook endpoint

### Admin
- `GET /api/admin/users` - User management
- `POST /api/admin/signals` - Manual signal injection
- `GET /api/admin/analytics` - Platform analytics

### WebSocket Events
- `price_update` - Real-time price updates
- `new_signal` - Trading signal alerts
- `system_notification` - System messages

## 🏥 Health Checks

- `GET /api/health` - Application health status
- Returns database connectivity and service status

## 🔒 Security Features

- JWT-based authentication
- Rate limiting (100 requests/15 minutes)
- CORS configuration
- Helmet security headers
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries

## 📊 Database Schema

The backend uses a comprehensive PostgreSQL schema with:
- User management and authentication
- Cryptocurrency ticker data
- Trading signals and alerts
- OHLC market data caching
- Admin activity logging
- Subscription management

## 🚀 Production Deployment URLs

After deployment:
- **Railway**: `https://your-app.railway.app`
- **Render**: `https://your-app.onrender.com`
- **Health Check**: `https://your-backend-url/api/health`
- **API Documentation**: Available at root endpoint

## 📞 Support

For deployment assistance or technical questions, refer to the main project documentation or contact the development team.