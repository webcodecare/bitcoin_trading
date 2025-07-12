# TradingView Webhook Setup Guide

## Overview
This guide shows you how to set up TradingView alerts to send buy/sell signals directly to your CryptoStrategy Pro platform.

## Webhook Configuration

### Webhook URL
```
https://[your-replit-domain]/api/webhook/tradingview
```

### Authentication
**Header:** `x-webhook-secret`  
**Value:** `default_secret` (or your custom secret from environment variables)

### Supported Tickers
Currently supported:
- **BTCUSD** (Binance:BTCUSD)

### Supported Timeframes
- **1M** - 1 Month (Strategic positioning)
- **1W** - 1 Week (Long-term signals)  
- **1D** - 1 Day (Position trading)
- **12h** - 12 Hours (Medium-term signals)
- **4h** - 4 Hours (Swing trading)
- **1h** - 1 Hour (Intraday trading)
- **30m** - 30 Minutes (Short-term momentum)

## Alert Setup in TradingView

### 1. Create Alert
1. Open BTCUSD chart on TradingView
2. Click the Alert button (bell icon)
3. Set your alert condition (RSI, MACD, etc.)
4. Choose "Webhook URL" as notification method

### 2. Webhook Message Format
Use this JSON format in the webhook message:

**For BUY signals:**
```json
{
  "ticker": "BTCUSD",
  "action": "buy",
  "price": "{{close}}",
  "time": "{{time}}",
  "timeframe": "1h",
  "strategy": "RSI Oversold",
  "secret": "default_secret"
}
```

**For SELL signals:**
```json
{
  "ticker": "BTCUSD", 
  "action": "sell",
  "price": "{{close}}",
  "time": "{{time}}",
  "timeframe": "1h",
  "strategy": "RSI Overbought",
  "secret": "default_secret"
}
```

### 3. TradingView Variables
TradingView provides these dynamic variables:
- `{{close}}` - Current close price
- `{{time}}` - Alert timestamp
- `{{ticker}}` - Symbol name
- `{{exchange}}` - Exchange name

## Recommended Alert Strategies

### 30-Minute (30m)
- RSI(14) crosses above 30 (buy) or below 70 (sell)
- MACD signal line crossover

### 1-Hour (1h)
- Moving average crossovers (50/200)
- Bollinger Band breakouts

### 4-Hour (4h)
- Support/resistance breaks
- Chart pattern confirmations

### 12-Hour (12h)
- Trend direction changes
- Volume-confirmed breakouts

### Daily (1D)
- Major trend reversals
- Golden/death crosses

### Weekly (1W)
- Macro trend changes
- Major support/resistance levels

### Monthly (1M)
- Long-term cycle analysis
- Major market structure breaks

## Testing Your Setup

### 1. Check Configuration
Visit: `https://[your-domain]/api/webhook/config`

This returns:
```json
{
  "supported_tickers": ["BTCUSD"],
  "supported_timeframes": ["1M", "1W", "1D", "12h", "4h", "1h", "30m"],
  "webhook_url": "https://your-domain/api/webhook/tradingview",
  "secret_header": "x-webhook-secret",
  "required_fields": ["ticker", "action", "price", "timeframe"]
}
```

### 2. Manual Testing (Admin Only)
Use the admin panel to manually inject test signals:
```
POST /api/admin/signals/inject
{
  "ticker": "BTCUSD",
  "action": "buy",
  "price": "67500",
  "timeframe": "1h",
  "strategy": "Test Signal"
}
```

## Data Storage
All TradingView alerts are stored in the database with:
- Ticker symbol and timeframe
- Signal type (buy/sell) 
- Price at signal generation
- Timestamp and strategy name
- Source tracking (tradingview_webhook)

## Real-time Notifications
When signals are received:
✅ Broadcast to all connected users via WebSocket  
✅ Send email/SMS notifications to subscribed users  
✅ Update trading dashboard in real-time  
✅ Log in admin dashboard for monitoring  

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check webhook secret
2. **400 Bad Request**: Verify JSON format and required fields
3. **Ticker not supported**: Currently only BTCUSD is supported
4. **Timeframe not supported**: Use one of the 7 supported timeframes

### Webhook Logs
Check server logs for webhook processing:
```
TradingView signal received: BUY BTCUSD at 67500 (1h)
```

## Next Steps
Once BTCUSD alerts are working well, we can expand to:
- Additional cryptocurrencies (ETH, ADA, SOL, etc.)
- More timeframes if needed
- Advanced alert conditions
- Strategy-specific routing

## Security Notes
- Always use HTTPS for webhook URLs
- Keep your webhook secret secure
- Monitor webhook logs for suspicious activity
- Limit alerts to prevent spam

---

Ready to start sending signals from TradingView to your crypto trading platform! 🚀