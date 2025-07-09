# OHLC Developer Guide: How to Modify or Extend GET /api/ohlc

## Quick Start

This guide provides step-by-step instructions for developers to modify and extend the OHLC (Open, High, Low, Close) endpoint in the CryptoStrategy Pro platform.

## Current Endpoint Overview

```
GET /api/ohlc
```

**Current Features:**
- Binance REST API integration
- PostgreSQL cache layer
- Ticker validation
- Comprehensive error handling
- Supabase-style response format

## Step-by-Step Modification Guide

### 1. Understanding the Current Implementation

The OHLC endpoint is implemented in `server/routes.ts` with the following key components:

```typescript
// Main endpoint handler
app.get('/api/ohlc', async (req, res) => {
  // Parameter validation
  // Ticker validation
  // Cache lookup with fallback
  // Response formatting
});

// Core functions
async function getOHLCWithCacheFallback(symbol, interval, limit, startTime?, endTime?)
async function normalizeAndUpsertOHLC(binanceData, symbol, interval)
```

### 2. Adding New Query Parameters

**Example: Adding a `source` parameter to specify data provider**

```typescript
// server/routes.ts - Update the main endpoint
app.get('/api/ohlc', async (req, res) => {
  try {
    const { symbol, interval = '1h', limit = 1000, startTime, endTime, source = 'auto' } = req.query;
    
    // Validate new parameter
    const validSources = ['auto', 'binance', 'coinbase', 'kraken'];
    if (!validSources.includes(source as string)) {
      return res.status(400).json({
        error: 'Invalid source parameter',
        message: `Source must be one of: ${validSources.join(', ')}`,
        example: '/api/ohlc?symbol=BTCUSDT&source=binance'
      });
    }

    // Pass to cache fallback function
    const ohlcData = await getOHLCWithCacheFallback(
      symbol as string,
      interval as string,
      Math.min(parseInt(limit as string) || 1000, 5000),
      startTime as string,
      endTime as string,
      source as string // New parameter
    );

    // Rest of implementation...
  } catch (error) {
    // Error handling
  }
});
```

### 3. Modifying the Cache Logic

**Example: Implementing smart cache invalidation**

```typescript
// server/routes.ts - Update cache fallback logic
async function getOHLCWithCacheFallback(
  symbol: string, 
  interval: string, 
  limit: number,
  startTime?: string,
  endTime?: string,
  source?: string
) {
  try {
    // Step 1: Check cache first
    let cachedData = await storage.getOhlcData(symbol, interval, limit);
    
    // Step 2: Enhanced freshness logic
    const now = new Date();
    const cacheTimeout = getCacheTimeout(interval); // Smart timeout based on interval
    
    const needsFreshData = cachedData.length === 0 || 
      (cachedData.length > 0 && 
       new Date(cachedData[0].updatedAt).getTime() < now.getTime() - cacheTimeout);

    if (needsFreshData) {
      const freshData = await fetchFromDataSource(symbol, interval, limit, startTime, endTime, source);
      return freshData;
    }

    return cachedData.map(d => ({ ...d, source: 'cache' }));
  } catch (error) {
    console.error('OHLC Cache Fallback Error:', error);
    throw error;
  }
}

// Helper function for dynamic cache timeout
function getCacheTimeout(interval: string): number {
  const timeouts = {
    '1m': 60 * 1000,      // 1 minute
    '5m': 5 * 60 * 1000,  // 5 minutes
    '15m': 15 * 60 * 1000, // 15 minutes
    '1h': 60 * 60 * 1000,  // 1 hour
    '1d': 24 * 60 * 60 * 1000 // 1 day
  };
  return timeouts[interval] || 60 * 60 * 1000; // Default 1 hour
}
```

### 4. Adding New Data Sources

**Example: Adding Coinbase Pro support**

```typescript
// server/dataSources/coinbase.ts
export async function fetchFromCoinbase(
  symbol: string,
  interval: string,
  limit: number,
  startTime?: string,
  endTime?: string
): Promise<OHLCData[]> {
  // Convert symbol format: BTCUSDT -> BTC-USD
  const coinbaseSymbol = symbol.replace('USDT', '').replace(/(.+)/, '$1-USD');
  
  // Convert interval format
  const granularity = convertIntervalToGranularity(interval);
  
  let url = `https://api.exchange.coinbase.com/products/${coinbaseSymbol}/candles`;
  url += `?granularity=${granularity}`;
  
  if (startTime) url += `&start=${startTime}`;
  if (endTime) url += `&end=${endTime}`;
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CryptoStrategy-OHLC-Service/1.0'
      }
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Normalize Coinbase data format
    return data.map((candle: any) => ({
      time: new Date(candle[0] * 1000),
      low: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      open: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }));
    
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

function convertIntervalToGranularity(interval: string): number {
  const mapping = {
    '1m': 60,
    '5m': 300,
    '15m': 900,
    '1h': 3600,
    '6h': 21600,
    '1d': 86400
  };
  return mapping[interval] || 3600;
}
```

**Update main function to support multiple sources:**

```typescript
// server/routes.ts - Update data fetching logic
async function fetchFromDataSource(
  symbol: string,
  interval: string,
  limit: number,
  startTime?: string,
  endTime?: string,
  source?: string
): Promise<OHLCData[]> {
  
  const dataSources = {
    'binance': () => fetchFromBinance(symbol, interval, limit, startTime, endTime),
    'coinbase': () => fetchFromCoinbase(symbol, interval, limit, startTime, endTime),
    'auto': async () => {
      // Try sources in order of preference
      const sources = ['binance', 'coinbase'];
      for (const src of sources) {
        try {
          return await dataSources[src]();
        } catch (error) {
          console.log(`${src} failed, trying next source...`);
        }
      }
      throw new Error('All data sources failed');
    }
  };

  const fetchFunction = dataSources[source] || dataSources['auto'];
  const data = await fetchFunction();
  
  // Normalize and cache the data
  const normalizedData = await normalizeAndUpsertOHLC(data, symbol, interval);
  
  return normalizedData.map(d => ({ ...d, source }));
}
```

### 5. Enhancing Response Format

**Example: Adding market statistics to response**

```typescript
// server/routes.ts - Enhanced response format
app.get('/api/ohlc', async (req, res) => {
  try {
    const ohlcData = await getOHLCWithCacheFallback(/*...*/);
    
    // Calculate market statistics
    const marketStats = calculateMarketStats(ohlcData);
    
    // Enhanced response format
    const response = {
      symbol: symbol as string,
      interval: interval as string,
      count: ohlcData.length,
      cached: ohlcData.length > 0 ? ohlcData[0].source === 'cache' : false,
      external: ohlcData.length > 0 ? ohlcData[0].source !== 'cache' : false,
      
      // New market statistics
      statistics: marketStats,
      
      // Pagination metadata
      pagination: {
        limit: Math.min(parseInt(limit as string) || 1000, 5000),
        has_more: ohlcData.length >= Math.min(parseInt(limit as string) || 1000, 5000)
      },
      
      data: ohlcData.map(d => ({
        time: d.time,
        open: parseFloat(d.open),
        high: parseFloat(d.high),
        low: parseFloat(d.low),
        close: parseFloat(d.close),
        volume: parseFloat(d.volume),
        source: d.source
      })),
      
      // Enhanced metadata
      meta: {
        timestamp: new Date().toISOString(),
        processing_time_ms: Date.now() - startTime,
        api_version: '1.1'
      }
    };

    res.json(response);
  } catch (error) {
    // Error handling
  }
});

// Helper function for market statistics
function calculateMarketStats(data: OHLCData[]) {
  if (data.length === 0) return null;
  
  const prices = data.map(d => parseFloat(d.close));
  const volumes = data.map(d => parseFloat(d.volume));
  
  return {
    price_change: prices[0] - prices[prices.length - 1],
    price_change_percent: ((prices[0] - prices[prices.length - 1]) / prices[prices.length - 1]) * 100,
    high_24h: Math.max(...data.map(d => parseFloat(d.high))),
    low_24h: Math.min(...data.map(d => parseFloat(d.low))),
    volume_24h: volumes.reduce((sum, vol) => sum + vol, 0),
    average_price: prices.reduce((sum, price) => sum + price, 0) / prices.length
  };
}
```

### 6. Adding Real-time WebSocket Support

**Example: WebSocket integration for live updates**

```typescript
// server/routes.ts - WebSocket integration
import { WebSocketServer } from 'ws';

let wss: WebSocketServer;

// Initialize WebSocket server
export function initializeOHLCWebSocket(server: any) {
  wss = new WebSocketServer({ server, path: '/ws/ohlc' });
  
  wss.on('connection', (ws) => {
    console.log('OHLC WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const { action, symbol, interval } = JSON.parse(message.toString());
        
        if (action === 'subscribe') {
          // Subscribe to live OHLC updates
          subscribeToLiveOHLC(ws, symbol, interval);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('OHLC WebSocket client disconnected');
    });
  });
}

// Subscribe to live OHLC updates
function subscribeToLiveOHLC(ws: any, symbol: string, interval: string) {
  // Set up live data feed (example with Binance WebSocket)
  const binanceWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
  
  binanceWs.on('message', (data) => {
    const klineData = JSON.parse(data.toString());
    
    if (klineData.k.x) { // Kline is closed
      const ohlcUpdate = {
        symbol: symbol,
        interval: interval,
        data: {
          time: new Date(klineData.k.t),
          open: parseFloat(klineData.k.o),
          high: parseFloat(klineData.k.h),
          low: parseFloat(klineData.k.l),
          close: parseFloat(klineData.k.c),
          volume: parseFloat(klineData.k.v)
        }
      };
      
      // Send to subscribed client
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify(ohlcUpdate));
      }
    }
  });
  
  // Store subscription for cleanup
  (ws as any).binanceSubscription = binanceWs;
}
```

### 7. Adding Database Optimizations

**Example: Implementing database indexes and partitioning**

```typescript
// shared/schema.ts - Enhanced OHLC schema
export const ohlcCache = pgTable('ohlc_cache', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  tickerSymbol: text('ticker_symbol').notNull(),
  interval: text('interval').notNull(),
  time: timestamp('time').notNull(),
  open: text('open').notNull(),
  high: text('high').notNull(),
  low: text('low').notNull(),
  close: text('close').notNull(),
  volume: text('volume').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  // Composite index for efficient queries
  tickerIntervalTimeIdx: index('ohlc_ticker_interval_time_idx')
    .on(table.tickerSymbol, table.interval, table.time),
  
  // Index for time-based queries
  timeIdx: index('ohlc_time_idx').on(table.time),
  
  // Unique constraint to prevent duplicates
  uniqueOHLC: unique('unique_ohlc').on(table.tickerSymbol, table.interval, table.time)
}));

// Storage optimization with batch operations
export class DatabaseStorage implements IStorage {
  async batchCreateOhlcData(data: InsertOhlc[]): Promise<OhlcData[]> {
    // Batch insert for better performance
    const result = await db.insert(schema.ohlcCache)
      .values(data)
      .onConflictDoUpdate({
        target: [schema.ohlcCache.tickerSymbol, schema.ohlcCache.interval, schema.ohlcCache.time],
        set: {
          open: excluded(schema.ohlcCache.open),
          high: excluded(schema.ohlcCache.high),
          low: excluded(schema.ohlcCache.low),
          close: excluded(schema.ohlcCache.close),
          volume: excluded(schema.ohlcCache.volume),
          updatedAt: new Date()
        }
      })
      .returning();
    
    return result;
  }
}
```

### 8. Adding Comprehensive Error Handling

**Example: Advanced error handling with retry logic**

```typescript
// server/utils/retryUtils.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Usage in OHLC fetching
async function fetchFromBinance(/*...*/): Promise<OHLCData[]> {
  return await withRetry(async () => {
    const response = await fetch(binanceUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CryptoStrategy-OHLC-Service/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }
    
    return await response.json();
  }, 3, 1000);
}
```

### 9. Adding Unit Tests

**Example: Comprehensive test suite for new features**

```typescript
// server/tests/ohlc.enhanced.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app';

describe('Enhanced OHLC API', () => {
  describe('Source Parameter', () => {
    it('should accept valid source parameter', async () => {
      const response = await request(app)
        .get('/api/ohlc?symbol=BTCUSDT&source=binance')
        .expect(200);
      
      expect(response.body.data.some(d => d.source === 'binance')).toBe(true);
    });
    
    it('should reject invalid source parameter', async () => {
      const response = await request(app)
        .get('/api/ohlc?symbol=BTCUSDT&source=invalid')
        .expect(400);
      
      expect(response.body.message).toContain('Source must be one of');
    });
  });
  
  describe('Market Statistics', () => {
    it('should include market statistics in response', async () => {
      const response = await request(app)
        .get('/api/ohlc?symbol=BTCUSDT')
        .expect(200);
      
      expect(response.body.statistics).toBeDefined();
      expect(response.body.statistics.price_change).toBeTypeOf('number');
      expect(response.body.statistics.high_24h).toBeTypeOf('number');
    });
  });
  
  describe('WebSocket Integration', () => {
    it('should establish WebSocket connection', (done) => {
      const ws = new WebSocket('ws://localhost:5000/ws/ohlc');
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          action: 'subscribe',
          symbol: 'BTCUSDT',
          interval: '1m'
        }));
      });
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.symbol).toBe('BTCUSDT');
        expect(message.data).toBeDefined();
        ws.close();
        done();
      });
    });
  });
});
```

### 10. Performance Monitoring

**Example: Adding performance metrics**

```typescript
// server/middleware/performanceMonitor.ts
export function ohlcPerformanceMonitor() {
  const metrics = {
    requests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    errors: 0
  };
  
  return {
    middleware: (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      metrics.requests++;
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        metrics.averageResponseTime = (metrics.averageResponseTime * (metrics.requests - 1) + responseTime) / metrics.requests;
        
        if (res.statusCode >= 400) {
          metrics.errors++;
        }
      });
      
      next();
    },
    
    getMetrics: () => ({ ...metrics }),
    
    recordCacheHit: () => { metrics.cacheHits++; },
    recordCacheMiss: () => { metrics.cacheMisses++; }
  };
}

// Usage
const performanceMonitor = ohlcPerformanceMonitor();
app.use('/api/ohlc', performanceMonitor.middleware);

// Metrics endpoint
app.get('/debug/ohlc/metrics', (req, res) => {
  res.json(performanceMonitor.getMetrics());
});
```

## Testing Your Changes

### 1. Unit Tests
```bash
npm test server/tests/ohlc.test.ts
```

### 2. Integration Tests
```bash
curl "http://localhost:5000/api/ohlc?symbol=BTCUSDT&source=binance"
```

### 3. Performance Tests
```bash
# Test response times
curl -w "@curl-format.txt" "http://localhost:5000/api/ohlc?symbol=BTCUSDT"

# Test concurrent requests
for i in {1..10}; do curl "http://localhost:5000/api/ohlc?symbol=BTCUSDT" & done
```

## Deployment

### 1. Database Migration
```bash
npm run db:push
```

### 2. Environment Variables
```bash
# Add new environment variables
COINBASE_API_KEY=your_key
COINBASE_API_SECRET=your_secret
```

### 3. Production Deployment
```bash
npm run build
npm run start
```

## Common Pitfalls and Solutions

1. **Memory Leaks**: Always clean up WebSocket subscriptions and timers
2. **Rate Limiting**: Implement proper rate limiting for external APIs
3. **Database Deadlocks**: Use proper indexing and transaction isolation
4. **Cache Invalidation**: Implement proper cache expiration strategies
5. **Error Handling**: Always handle edge cases and network failures

## Next Steps

- Review the [OHLC Data Source Extensibility](OHLC_DATA_SOURCE_EXTENSIBILITY.md) document
- Implement monitoring and alerting
- Add comprehensive logging
- Consider implementing data validation middleware
- Plan for horizontal scaling

This guide provides a comprehensive foundation for modifying and extending the OHLC endpoint. Always test thoroughly before deploying to production.