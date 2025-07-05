# TradingView Webhook Setup Guide

## Overview
This guide provides the webhook endpoints and configuration needed to send buy/sell alerts from TradingView to your CryptoStrategy Pro platform.

## Webhook Endpoints

### Primary Signal Webhook
**URL:** `https://[your-replit-domain].replit.app/api/webhook/signal`
**Method:** `POST`
**Content-Type:** `application/json`

### Webhook Payload Format
```json
{
  "token": "tradingview_crypto_bot_2025",
  "symbol": "BTCUSDT",
  "price": 67500.50,
  "type": "buy",
  "time": "2025-07-05T18:30:00Z",
  "timeframe": "1H",
  "note": "RSI oversold, bullish divergence"
}
```

### Required Fields
- `token`: Authentication token (use: `tradingview_crypto_bot_2025`)
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "BTCUSD")
- `price`: Current price when signal was generated
- `type`: Signal type - either "buy" or "sell"
- `time`: ISO timestamp when signal was generated
- `timeframe`: Chart timeframe (must be one of the supported timeframes)
- `note`: Optional description of the signal

### Supported Timeframes for BTCUSDT/BTCUSD
The platform currently supports the following timeframes for Bitcoin alerts:
- `1M` - 1 Month
- `1W` - 1 Week  
- `1D` - 1 Day
- `12H` - 12 Hours
- `4H` - 4 Hours
- `1H` - 1 Hour
- `30M` - 30 Minutes

## TradingView Alert Configuration

### Alert Message Template
Use this JSON template in your TradingView alert message:

```json
{
  "token": "tradingview_crypto_bot_2025",
  "symbol": "{{ticker}}",
  "price": {{close}},
  "type": "buy",
  "time": "{{time}}",
  "timeframe": "1H",
  "note": "TradingView Alert: {{exchange}}:{{ticker}} {{interval}}"
}
```

### Setting Up Alerts by Timeframe

#### 1-Hour Alerts (1H)
```json
{
  "token": "tradingview_crypto_bot_2025",
  "symbol": "BTCUSDT",
  "price": {{close}},
  "type": "buy",
  "time": "{{time}}",
  "timeframe": "1H",
  "note": "1H Buy Signal - RSI: {{rsi}}"
}
```

#### 4-Hour Alerts (4H)
```json
{
  "token": "tradingview_crypto_bot_2025",
  "symbol": "BTCUSDT",
  "price": {{close}},
  "type": "sell",
  "time": "{{time}}",
  "timeframe": "4H",
  "note": "4H Sell Signal - MACD Cross"
}
```

#### Daily Alerts (1D)
```json
{
  "token": "tradingview_crypto_bot_2025",
  "symbol": "BTCUSDT",
  "price": {{close}},
  "type": "buy",
  "time": "{{time}}",
  "timeframe": "1D",
  "note": "Daily Buy Signal - Golden Cross"
}
```

## Alert Conditions by Timeframe

### Recommended Alert Conditions

1. **30-Minute (30M)**: Short-term momentum
   - RSI(14) crosses above 30 (buy) or below 70 (sell)
   - MACD signal line crossover

2. **1-Hour (1H)**: Intraday trading
   - Moving average crossovers (50/200)
   - Bollinger Band breakouts

3. **4-Hour (4H)**: Swing trading
   - Support/resistance breaks
   - Chart pattern confirmations

4. **12-Hour (12H)**: Medium-term signals  
   - Trend direction changes
   - Volume-confirmed breakouts

5. **Daily (1D)**: Position trading
   - Major trend reversals
   - Golden/death crosses

6. **Weekly (1W)**: Long-term signals
   - Macro trend changes
   - Major support/resistance levels

7. **Monthly (1M)**: Strategic positioning
   - Long-term cycle analysis
   - Major market structure breaks

## Data Storage
All TradingView alerts are automatically stored in the database with:
- Ticker symbol categorization
- Timeframe classification  
- Signal type (buy/sell)
- Price at signal generation
- Timestamp and source tracking

## Integration Features
When signals are received, the platform automatically:
- Broadcasts to all connected users via WebSocket
- Sends email/SMS notifications to subscribed users
- Updates the trading dashboard in real-time
- Logs all signals for historical analysis

## Testing the Webhook
You can test the webhook endpoint using curl:

```bash
curl -X POST https://[your-replit-domain].replit.app/api/webhook/signal \
  -H "Content-Type: application/json" \
  -d '{
    "token": "tradingview_crypto_bot_2025",
    "symbol": "BTCUSDT",
    "price": 67500.50,
    "type": "buy",
    "time": "2025-07-05T18:30:00Z",
    "timeframe": "1H",
    "note": "Test signal from TradingView"
  }'
```

## Security
- The webhook uses token-based authentication
- All requests are validated against the expected token
- Invalid requests return 401 Unauthorized
- All webhook activity is logged for security monitoring

## Support
For any issues with webhook integration, check the admin logs in the platform's admin panel under Activity Logs.