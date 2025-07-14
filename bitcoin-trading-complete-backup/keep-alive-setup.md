# Keep Your API Running 24/7

## Current API URL
```
https://14dcc8b1-7e04-460a-98f6-3bb5bbb9cc0f-00-1pudjbz6ofd2u.spock.replit.dev
```

## Free Monitoring Services

### 1. UptimeRobot (Recommended)
- Visit: https://uptimerobot.com
- Create free account
- Add HTTP(s) monitor
- URL: `https://14dcc8b1-7e04-460a-98f6-3bb5bbb9cc0f-00-1pudjbz6ofd2u.spock.replit.dev/api/tickers`
- Check interval: 5 minutes
- Free plan: 50 monitors, 5-minute intervals

### 2. StatusCake
- Visit: https://www.statuscake.com
- Free plan: 10 monitors, 5-minute intervals
- Add your API endpoint for monitoring

### 3. Pingdom
- Visit: https://www.pingdom.com
- Free plan available
- Monitor your API endpoint

## How It Works
1. Service pings your API every 5 minutes
2. Keeps Replit from sleeping
3. Your API stays active 24/7
4. Get alerts if API goes down

## API Endpoints to Monitor
- Main: `/api/tickers`
- Health: `/api/market/price/BTCUSDT`
- Backup: `/api/chart/cycle/BTC`

## Expected Response
Your API should return HTTP 200 with JSON data containing 28 cryptocurrency tickers.