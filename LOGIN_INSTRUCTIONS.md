# CryptoStrategy Pro - Login Instructions

## Platform Access Details

**Frontend URL**: http://localhost:3000  
**Backend API**: http://localhost:5000  
**Database**: PostgreSQL (Neon) - fully configured

## Test User Accounts

The platform includes 5 pre-configured test users with different subscription levels:

### 1. Superuser Account
- **Email**: `superuser@test.com`
- **Password**: `password123`
- **Subscription**: Free tier
- **Access**: Full platform access

### 2. Basic User
- **Email**: `basic.user@test.com`
- **Password**: `password123`
- **Subscription**: Basic tier (active)
- **Access**: Standard trading signals and charts

### 3. Premium User
- **Email**: `premium.user@test.com`
- **Password**: `password123`
- **Subscription**: Premium tier (active)
- **Access**: Advanced analytics and features

### 4. Pro User
- **Email**: `pro.user@test.com`
- **Password**: `password123`
- **Subscription**: Pro tier (active)
- **Access**: Full professional features

### 5. Canceled User
- **Email**: `canceled.user@test.com`
- **Password**: `password123`
- **Subscription**: Basic tier (canceled)
- **Access**: Limited access

## Login Process

1. Navigate to the frontend at `http://localhost:3000`
2. Click the login button or go to `/login`
3. Enter one of the test user email addresses above
4. Enter password: `password123`
5. Click "Sign In"

## Platform Features Available

### ✅ Working Features
- User authentication with JWT tokens
- 28 cryptocurrency tickers (BTC, ETH, SOL, ADA, etc.)
- Real-time price feeds with fallback data
- TradingView webhook endpoints
- PostgreSQL database with complete schema
- WebSocket support for live updates
- Subscription-based access control
- Professional trading interface
- Notification system (email/SMS/Telegram)
- Admin dashboard for user management

### ⚙️ Backend Services Running
- Express server on port 5000
- WebSocket server for real-time updates
- Notification processor (30-second intervals)
- JWT authentication middleware
- Rate limiting and security
- CORS configured for frontend access

### 📊 Available Data
- Complete user profiles and settings
- Historical OHLC price data
- Trading signals and alerts
- Subscription management
- Achievement system
- Dashboard layouts

## Technical Notes

- Backend validates email format strictly
- Password must contain: uppercase, lowercase, number, special character (8-128 chars)
- All test users use the same password for simplicity
- Database includes sample trading signals and market data
- Platform supports role-based access control

## Troubleshooting

If login fails:
1. Ensure both frontend (port 3000) and backend (port 5000) are running
2. Check that you're using the exact email format from above
3. Verify password is exactly `password123`
4. Check browser console for any network errors

## Next Steps

Once logged in, you can:
- Explore the trading dashboard
- View cryptocurrency charts and signals
- Configure notification preferences
- Access subscription-based features
- Use the admin panel (for superuser account)