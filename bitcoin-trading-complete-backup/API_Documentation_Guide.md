# Bitcoin Trading Platform API Documentation

## Overview
This document provides comprehensive API documentation for the Bitcoin Trading Platform, including all endpoints, authentication methods, request/response formats, and usage examples.

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication

### JWT Token Authentication
All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting Authentication Token
1. Register a new account or login with existing credentials
2. The API will return a JWT token in the response
3. Include this token in subsequent requests

### Test Credentials
```
Email: admin@example.com
Password: password123
```

## API Endpoints

### 1. Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "subscriptionTier": "free",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionInfo": {
    "loginTime": "2025-01-01T00:00:00.000Z",
    "expiresAt": "2025-01-08T00:00:00.000Z",
    "tokenType": "Bearer"
  }
}
```

#### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "subscriptionTier": "free",
    "isActive": true,
    "lastLoginAt": "2025-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionInfo": {
    "loginTime": "2025-01-01T00:00:00.000Z",
    "expiresAt": "2025-01-08T00:00:00.000Z",
    "tokenType": "Bearer"
  }
}
```

#### POST /api/auth/logout
Logout current user (requires authentication).

**Response (200):**
```json
{
  "message": "Logged out successfully",
  "code": "LOGOUT_SUCCESS",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### 2. User Management Endpoints

#### GET /api/user/profile
Get current user profile (requires authentication).

**Response (200):**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "subscriptionTier": "free",
    "isActive": true
  },
  "settings": {
    "userId": "user-id",
    "notificationEmail": true,
    "notificationSms": false,
    "notificationPush": true,
    "theme": "dark",
    "language": "en",
    "timezone": "UTC",
    "currency": "USD",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "24h"
  }
}
```

#### GET /api/user/settings
Get comprehensive user settings (requires authentication).

**Response (200):**
```json
{
  "userId": "user-id",
  "notificationEmail": true,
  "notificationSms": false,
  "notificationPush": true,
  "emailSignalAlerts": true,
  "smsSignalAlerts": false,
  "pushSignalAlerts": true,
  "theme": "dark",
  "language": "en",
  "timezone": "UTC",
  "currency": "USD",
  "defaultChartType": "candlestick",
  "defaultTimeframe": "1h",
  "twoFactorEnabled": false,
  "sessionTimeout": 1440
}
```

#### PUT /api/user/settings
Update user settings (requires authentication).

**Request Body:**
```json
{
  "notificationEmail": true,
  "notificationSms": false,
  "theme": "dark",
  "language": "en",
  "defaultChartType": "candlestick",
  "defaultTimeframe": "1h"
}
```

#### PATCH /api/user/settings
Partially update user settings (requires authentication).

**Request Body:**
```json
{
  "theme": "light"
}
```

### 3. Market Data Endpoints

#### GET /api/market/price/:symbol
Get current market price for a specific symbol.

**Parameters:**
- `symbol`: Trading symbol (e.g., BTCUSDT, ETHUSDT)

**Response (200):**
```json
{
  "symbol": "BTCUSDT",
  "price": 65000.50,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "change24h": 2.5,
  "volume24h": 1000000
}
```

#### GET /api/market/prices
Get multiple market prices.

**Query Parameters:**
- `symbols`: Comma-separated list of symbols (e.g., BTCUSDT,ETHUSDT,SOLUSDT)

**Response (200):**
```json
[
  {
    "symbol": "BTCUSDT",
    "price": 65000.50,
    "timestamp": "2025-01-01T00:00:00.000Z"
  },
  {
    "symbol": "ETHUSDT",
    "price": 3500.25,
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/tickers
Get available trading tickers.

**Query Parameters:**
- `search`: Search term for filtering (optional)
- `limit`: Maximum number of results (optional, default: 50)
- `offset`: Offset for pagination (optional, default: 0)
- `category`: Filter by category (optional)
- `is_enabled`: Filter by enabled status (optional)

**Response (200):**
```json
[
  {
    "id": "ticker-id",
    "symbol": "BTCUSDT",
    "description": "Bitcoin to USDT",
    "category": "Major",
    "isEnabled": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/tickers/enabled
Get only enabled tickers.

**Response (200):**
```json
[
  {
    "id": "ticker-id",
    "symbol": "BTCUSDT",
    "description": "Bitcoin to USDT",
    "category": "Major",
    "isEnabled": true
  }
]
```

### 4. OHLC Data Endpoints

#### GET /api/ohlc
Get OHLC (Open, High, Low, Close) data for charts.

**Query Parameters:**
- `ticker`: Trading symbol (required)
- `interval`: Time interval (1m, 5m, 15m, 1h, 4h, 1d, 1w)
- `limit`: Maximum number of candles (optional, default: 100)
- `start`: Start date (YYYY-MM-DD format)
- `end`: End date (YYYY-MM-DD format)

**Response (200):**
```json
[
  {
    "timestamp": "2025-01-01T00:00:00.000Z",
    "open": 64000.00,
    "high": 65000.00,
    "low": 63500.00,
    "close": 64800.00,
    "volume": 1000.50
  }
]
```

### 5. Trading Signals Endpoints

#### GET /api/signals/:symbol
Get trading signals for a specific symbol.

**Parameters:**
- `symbol`: Trading symbol (e.g., BTCUSDT)

**Response (200):**
```json
[
  {
    "id": "signal-id",
    "ticker": "BTCUSDT",
    "signalType": "buy",
    "price": "65000.00",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "source": "algorithm",
    "note": "RSI oversold condition"
  }
]
```

#### GET /api/user/signals
Get user's trading signals (requires authentication).

**Query Parameters:**
- `limit`: Maximum number of signals (optional, default: 10)
- `offset`: Offset for pagination (optional, default: 0)

**Response (200):**
```json
[
  {
    "id": "signal-id",
    "ticker": "BTCUSDT",
    "signalType": "buy",
    "price": "65000.00",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "source": "webhook",
    "note": "TradingView signal"
  }
]
```

### 6. Webhook Endpoints

#### POST /api/webhook/alerts
Receive TradingView webhook alerts.

**Headers:**
- `X-Webhook-Secret`: Your webhook secret
- `Content-Type`: application/json

**Request Body:**
```json
{
  "ticker": "BTCUSDT",
  "action": "buy",
  "price": 65000,
  "timeframe": "1h",
  "strategy": "RSI Divergence",
  "comment": "RSI bullish divergence detected"
}
```

**Response (201):**
```json
{
  "message": "Signal received and processed",
  "signalId": "signal-id",
  "code": "SIGNAL_PROCESSED",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### 7. Chart Data Endpoints

#### GET /api/chart/heatmap/:symbol
Get heatmap data for 200-week SMA analysis.

**Parameters:**
- `symbol`: Base symbol (e.g., BTC)

**Response (200):**
```json
[
  {
    "id": "heatmap-id",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "price": 65000.00,
    "sma200Week": 45000.00,
    "deviation": 44.4,
    "color": "#ff4444"
  }
]
```

#### GET /api/chart/cycle/:symbol
Get cycle analysis data.

**Parameters:**
- `symbol`: Base symbol (e.g., BTC)

**Response (200):**
```json
[
  {
    "id": "cycle-id",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "price": 65000.00,
    "ma2Year": 50000.00,
    "cyclePhase": "accumulation",
    "strength": 0.75
  }
]
```

#### GET /api/chart/forecast/:symbol
Get forecast data for predictive analysis.

**Parameters:**
- `symbol`: Base symbol (e.g., BTC)

**Response (200):**
```json
[
  {
    "id": "forecast-id",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "predictedPrice": 70000.00,
    "confidence": 0.85,
    "horizon": 30,
    "model": "ensemble"
  }
]
```

### 8. User Progress Endpoints

#### GET /api/user/progress
Get user progress statistics (requires authentication).

**Response (200):**
```json
{
  "userId": "user-id",
  "totalTrades": 47,
  "successfulTrades": 32,
  "totalProfit": 2485.67,
  "winRate": 68.1,
  "currentStreak": 5,
  "longestStreak": 12,
  "platformUsageDays": 23,
  "signalsReceived": 156,
  "achievementsUnlocked": 8,
  "totalAchievements": 25,
  "level": 7,
  "experiencePoints": 3420,
  "nextLevelXP": 4000,
  "skillPoints": {
    "trading": 85,
    "analysis": 72,
    "riskManagement": 65,
    "research": 78
  }
}
```

#### GET /api/user/achievements
Get user achievements (requires authentication).

**Response (200):**
```json
[
  {
    "id": "first-trade",
    "name": "First Steps",
    "description": "Complete your first trade",
    "category": "trading",
    "rarity": "common",
    "points": 100,
    "icon": "🎯",
    "isUnlocked": true,
    "unlockedAt": "2025-01-02T10:30:00Z",
    "progress": 1,
    "target": 1
  }
]
```

### 9. Admin Endpoints

#### GET /api/admin/users
Get all users (requires admin authentication).

**Response (200):**
```json
[
  {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "subscriptionTier": "free",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "lastLoginAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/admin/users
Create a new user (requires admin authentication).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "New",
  "lastName": "User",
  "role": "user",
  "subscriptionTier": "free"
}
```

#### PUT /api/admin/users/:userId
Update user information (requires admin authentication).

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "role": "admin",
  "subscriptionTier": "premium",
  "isActive": true
}
```

#### DELETE /api/admin/users/:userId
Delete a user (requires admin authentication).

**Response (200):**
```json
{
  "message": "User deleted successfully",
  "code": "USER_DELETED"
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "details": {}
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_FAILED`: Invalid or expired token
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `USER_NOT_FOUND`: User does not exist
- `INVALID_CREDENTIALS`: Wrong email/password
- `RATE_LIMIT_EXCEEDED`: Too many requests

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting
- Default: 100 requests per minute per IP
- Authenticated users: 500 requests per minute
- Admin users: 1000 requests per minute

## WebSocket Connection

### Connection URL
```
ws://localhost:3000/ws
```

### Real-time Events
- `new_signal`: New trading signal received
- `price_update`: Live price updates
- `user_notification`: User-specific notifications

### Message Format
```json
{
  "type": "new_signal",
  "data": {
    "signal": {
      "id": "signal-id",
      "ticker": "BTCUSDT",
      "signalType": "buy",
      "price": "65000.00",
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/trading_db

# JWT
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=7d

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# TradingView Webhook
TRADINGVIEW_WEBHOOK_SECRET=your-webhook-secret

# Notifications
SENDGRID_API_KEY=SG.xxx
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890
TELEGRAM_BOT_TOKEN=xxx
```

## SDK Examples

### JavaScript/Node.js
```javascript
const API_BASE = 'http://localhost:3000';
let authToken = '';

// Login
async function login(email, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  authToken = data.token;
  return data;
}

// Get market price
async function getPrice(symbol) {
  const response = await fetch(`${API_BASE}/api/market/price/${symbol}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  return await response.json();
}

// Get trading signals
async function getSignals(symbol) {
  const response = await fetch(`${API_BASE}/api/signals/${symbol}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  return await response.json();
}
```

### Python
```python
import requests

class TradingAPI:
    def __init__(self, base_url='http://localhost:3000'):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f'{self.base_url}/api/auth/login', 
                               json={'email': email, 'password': password})
        data = response.json()
        self.token = data['token']
        return data
    
    def get_price(self, symbol):
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(f'{self.base_url}/api/market/price/{symbol}', 
                              headers=headers)
        return response.json()
    
    def get_signals(self, symbol):
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(f'{self.base_url}/api/signals/{symbol}', 
                              headers=headers)
        return response.json()

# Usage
api = TradingAPI()
api.login('admin@example.com', 'password123')
price = api.get_price('BTCUSDT')
signals = api.get_signals('BTCUSDT')
```

## Testing with Postman

1. **Import Collection**: Import the `Bitcoin_Trading_Platform_API.postman_collection.json` file
2. **Set Variables**: 
   - `baseUrl`: http://localhost:3000
   - `token`: (will be set automatically after login)
3. **Run Authentication**: Execute the "Login User" request first
4. **Test Endpoints**: All other endpoints will use the token automatically

## Webhook Testing

### TradingView Webhook Setup
1. In TradingView, go to your alert settings
2. Set webhook URL: `http://your-domain.com/api/webhook/alerts`
3. Add your webhook secret in the message body:
```json
{
  "ticker": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": {{close}},
  "timeframe": "{{interval}}",
  "strategy": "My Strategy",
  "comment": "{{strategy.order.comment}}"
}
```

### Manual Webhook Testing
Use curl to test webhook endpoints:
```bash
curl -X POST http://localhost:3000/api/webhook/alerts \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-webhook-secret" \
  -d '{
    "ticker": "BTCUSDT",
    "action": "buy",
    "price": 65000,
    "timeframe": "1h",
    "strategy": "Test Strategy",
    "comment": "Manual test signal"
  }'
```

## Support

For API support and questions:
- Documentation: [API Docs](https://your-domain.com/api-docs)
- Support Email: support@your-domain.com
- GitHub Issues: [Repository Issues](https://github.com/webcodecare/bitcoin_trading/issues)

## Changelog

### Version 1.0.0
- Initial API release
- Complete authentication system
- Market data endpoints
- Trading signals
- User management
- Admin functionality
- WebSocket support
- Comprehensive documentation