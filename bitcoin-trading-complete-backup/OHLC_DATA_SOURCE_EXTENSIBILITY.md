# OHLC Data Source Extensibility & Documentation

## Overview

This document provides comprehensive guidance for developers on extending and modifying the OHLC (Open, High, Low, Close) data sources in the CryptoStrategy Pro platform. The system is designed to be extensible, allowing for multiple data providers beyond the default Binance integration.

## Current Implementation

### GET /api/ohlc Endpoint

The OHLC service is implemented as a Supabase-style edge function that supports:

- **Primary Data Source**: Binance REST API (`/api/v3/klines`)
- **Cache Layer**: PostgreSQL `ohlc_cache` table
- **Fallback Strategy**: Cache-first with external API fallback
- **Validation**: Ticker validation against `available_tickers` table

### Supported Intervals

The system supports the following Binance-compatible intervals:

| Interval | Description | Binance API Support |
|----------|-------------|---------------------|
| `1m` | 1 minute | ✅ |
| `3m` | 3 minutes | ✅ |
| `5m` | 5 minutes | ✅ |
| `15m` | 15 minutes | ✅ |
| `30m` | 30 minutes | ✅ |
| `1h` | 1 hour | ✅ |
| `2h` | 2 hours | ✅ |
| `4h` | 4 hours | ✅ |
| `6h` | 6 hours | ✅ |
| `8h` | 8 hours | ✅ |
| `12h` | 12 hours | ✅ |
| `1d` | 1 day | ✅ |
| `3d` | 3 days | ✅ |
| `1w` | 1 week | ✅ |
| `1M` | 1 month | ✅ |

### Validation Logic

The endpoint validates:

1. **Symbol Parameter**: Required, must exist in `available_tickers` table
2. **Ticker Status**: Must be enabled (`is_enabled = true`)
3. **Interval**: Must be a supported timeframe (defaults to `1h`)
4. **Limit**: Maximum 5000 candles per request (defaults to 1000)
5. **Time Range**: Optional `startTime` and `endTime` parameters

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   API Gateway   │    │  OHLC Service   │
│   Application   │────│   /api/ohlc     │────│                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                       ┌─────────────────────────┐
                                       │  Cache Lookup Logic     │
                                       │  (ohlc_cache table)     │
                                       └─────────────────────────┘
                                                       │
                                           ┌───────────┴───────────┐
                                           ▼                       ▼
                                   ┌─────────────┐    ┌─────────────────┐
                                   │ Return      │    │ External API    │
                                   │ Cached Data │    │ Fallback        │
                                   └─────────────┘    └─────────────────┘
                                                              │
                                                              ▼
                                                   ┌─────────────────────┐
                                                   │ Data Normalization  │
                                                   │ & Cache Upsert      │
                                                   └─────────────────────┘
```

## Core Functions

### 1. `getOHLCWithCacheFallback()`

**Location**: `server/routes.ts`

This is the main orchestration function that handles:
- Cache lookup logic
- External API fallback
- Data freshness validation
- Error handling and resilience

```typescript
async function getOHLCWithCacheFallback(
  symbol: string, 
  interval: string, 
  limit: number,
  startTime?: string,
  endTime?: string
): Promise<OHLCData[]>
```

### 2. `normalizeAndUpsertOHLC()`

**Location**: `server/routes.ts`

Handles data transformation and persistence:
- Normalizes external API responses
- Upserts data to cache table
- Prevents duplicate entries
- Logs processing statistics

```typescript
async function normalizeAndUpsertOHLC(
  binanceData: any[], 
  symbol: string, 
  interval: string
): Promise<OHLCData[]>
```

### 3. Storage Layer Methods

**Location**: `server/storage.ts`

```typescript
// Retrieve cached OHLC data
async getOhlcData(ticker: string, interval: string, limit?: number): Promise<OhlcData[]>

// Store new OHLC data
async createOhlcData(data: InsertOhlc): Promise<OhlcData>
```

## Adding New Data Sources

### Step 1: Create Data Source Interface

Create a new interface for your data source:

```typescript
// server/dataSources/IDataSource.ts
interface IDataSource {
  name: string;
  priority: number;
  isAvailable(): Promise<boolean>;
  fetchOHLC(symbol: string, interval: string, limit: number, startTime?: string, endTime?: string): Promise<OHLCData[]>;
  normalizeData(rawData: any[]): OHLCData[];
  validateInterval(interval: string): boolean;
  getSupportedIntervals(): string[];
}
```

### Step 2: Implement Data Source

Example implementation for a new data source:

```typescript
// server/dataSources/CoinbaseDataSource.ts
import { IDataSource } from './IDataSource';

export class CoinbaseDataSource implements IDataSource {
  name = 'Coinbase Pro';
  priority = 2; // Lower priority than Binance

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('https://api.exchange.coinbase.com/time');
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchOHLC(symbol: string, interval: string, limit: number, startTime?: string, endTime?: string): Promise<OHLCData[]> {
    // Convert symbol format (BTCUSDT -> BTC-USD)
    const coinbaseSymbol = this.convertSymbol(symbol);
    const coinbaseInterval = this.convertInterval(interval);
    
    let url = `https://api.exchange.coinbase.com/products/${coinbaseSymbol}/candles?granularity=${coinbaseInterval}`;
    
    if (startTime) url += `&start=${startTime}`;
    if (endTime) url += `&end=${endTime}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.status}`);
    }
    
    const rawData = await response.json();
    return this.normalizeData(rawData);
  }

  normalizeData(rawData: any[]): OHLCData[] {
    return rawData.map(candle => ({
      time: new Date(candle[0] * 1000),
      low: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      open: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }));
  }

  validateInterval(interval: string): boolean {
    const supportedIntervals = ['1m', '5m', '15m', '1h', '6h', '1d'];
    return supportedIntervals.includes(interval);
  }

  getSupportedIntervals(): string[] {
    return ['1m', '5m', '15m', '1h', '6h', '1d'];
  }

  private convertSymbol(binanceSymbol: string): string {
    // Convert BTCUSDT to BTC-USD format
    return binanceSymbol.replace('USDT', '').replace(/(.+)/, '$1-USD');
  }

  private convertInterval(interval: string): number {
    const intervalMap: { [key: string]: number } = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '6h': 21600,
      '1d': 86400
    };
    return intervalMap[interval] || 3600;
  }
}
```

### Step 3: Update Data Source Manager

```typescript
// server/dataSources/DataSourceManager.ts
import { IDataSource } from './IDataSource';
import { BinanceDataSource } from './BinanceDataSource';
import { CoinbaseDataSource } from './CoinbaseDataSource';

export class DataSourceManager {
  private dataSources: IDataSource[];

  constructor() {
    this.dataSources = [
      new BinanceDataSource(),
      new CoinbaseDataSource(),
      // Add more data sources here
    ].sort((a, b) => a.priority - b.priority);
  }

  async getAvailableDataSource(): Promise<IDataSource | null> {
    for (const source of this.dataSources) {
      if (await source.isAvailable()) {
        return source;
      }
    }
    return null;
  }

  async fetchOHLC(symbol: string, interval: string, limit: number, startTime?: string, endTime?: string): Promise<{ data: OHLCData[], source: string }> {
    const source = await this.getAvailableDataSource();
    
    if (!source) {
      throw new Error('No data sources available');
    }

    const data = await source.fetchOHLC(symbol, interval, limit, startTime, endTime);
    return { data, source: source.name };
  }

  validateInterval(interval: string): boolean {
    return this.dataSources.some(source => source.validateInterval(interval));
  }

  getSupportedIntervals(): string[] {
    const allIntervals = this.dataSources.flatMap(source => source.getSupportedIntervals());
    return [...new Set(allIntervals)];
  }
}
```

### Step 4: Update Main OHLC Handler

```typescript
// server/routes.ts
import { DataSourceManager } from './dataSources/DataSourceManager';

const dataSourceManager = new DataSourceManager();

// Update the getOHLCWithCacheFallback function
async function getOHLCWithCacheFallback(
  symbol: string, 
  interval: string, 
  limit: number,
  startTime?: string,
  endTime?: string
) {
  try {
    // Step 1: Check cache first
    let cachedData = await storage.getOhlcData(symbol, interval, limit);
    
    // Step 2: Determine if we need fresh data
    const needsFreshData = /* existing logic */;

    if (needsFreshData) {
      try {
        // Use DataSourceManager instead of direct Binance call
        const { data, source } = await dataSourceManager.fetchOHLC(symbol, interval, limit, startTime, endTime);
        
        // Normalize and cache the data
        const normalizedData = await normalizeAndUpsertOHLC(data, symbol, interval);
        
        return normalizedData.map(d => ({ ...d, source }));
      } catch (fetchError) {
        console.log(`External API fetch failed: ${fetchError.message}, using cached data`);
      }
    }

    return cachedData.map(d => ({ ...d, source: 'cache' }));
  } catch (error) {
    console.error('OHLC Cache Fallback Error:', error);
    throw error;
  }
}
```

## Configuration and Environment Variables

### Environment Variables

Add support for multiple data source configurations:

```bash
# .env
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_secret

COINBASE_API_KEY=your_coinbase_api_key
COINBASE_API_SECRET=your_coinbase_secret
COINBASE_PASSPHRASE=your_coinbase_passphrase

KRAKEN_API_KEY=your_kraken_api_key
KRAKEN_API_SECRET=your_kraken_secret

# Data source priorities (comma-separated)
OHLC_DATA_SOURCES=binance,coinbase,kraken
```

### Configuration Management

```typescript
// server/config/ohlcConfig.ts
interface OHLCConfig {
  dataSources: {
    binance: {
      apiKey?: string;
      apiSecret?: string;
      enabled: boolean;
      priority: number;
    };
    coinbase: {
      apiKey?: string;
      apiSecret?: string;
      passphrase?: string;
      enabled: boolean;
      priority: number;
    };
  };
  cache: {
    ttl: number; // Time to live in seconds
    maxSize: number; // Maximum cache entries
  };
}

export const ohlcConfig: OHLCConfig = {
  dataSources: {
    binance: {
      apiKey: process.env.BINANCE_API_KEY,
      apiSecret: process.env.BINANCE_API_SECRET,
      enabled: true,
      priority: 1
    },
    coinbase: {
      apiKey: process.env.COINBASE_API_KEY,
      apiSecret: process.env.COINBASE_API_SECRET,
      passphrase: process.env.COINBASE_PASSPHRASE,
      enabled: Boolean(process.env.COINBASE_API_KEY),
      priority: 2
    }
  },
  cache: {
    ttl: 3600, // 1 hour
    maxSize: 10000
  }
};
```

## Testing New Data Sources

### Unit Tests

```typescript
// server/tests/dataSources/CoinbaseDataSource.test.ts
import { CoinbaseDataSource } from '../dataSources/CoinbaseDataSource';

describe('CoinbaseDataSource', () => {
  let dataSource: CoinbaseDataSource;

  beforeEach(() => {
    dataSource = new CoinbaseDataSource();
  });

  it('should validate supported intervals', () => {
    expect(dataSource.validateInterval('1h')).toBe(true);
    expect(dataSource.validateInterval('2h')).toBe(false);
  });

  it('should convert symbol format correctly', () => {
    // Test private method through public interface
    expect(dataSource.convertSymbol('BTCUSDT')).toBe('BTC-USD');
  });

  it('should fetch OHLC data successfully', async () => {
    const mockResponse = [
      [1640995200, 67000, 67500, 66800, 67200, 100.5]
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await dataSource.fetchOHLC('BTCUSDT', '1h', 100);
    
    expect(result).toHaveLength(1);
    expect(result[0].open).toBe(67000);
    expect(result[0].high).toBe(67500);
  });
});
```

### Integration Tests

```typescript
// server/tests/integration/ohlc.integration.test.ts
import { DataSourceManager } from '../dataSources/DataSourceManager';

describe('OHLC Integration Tests', () => {
  let dataSourceManager: DataSourceManager;

  beforeEach(() => {
    dataSourceManager = new DataSourceManager();
  });

  it('should fallback to secondary data source when primary fails', async () => {
    // Mock primary source failure
    jest.spyOn(dataSourceManager, 'getAvailableDataSource')
      .mockResolvedValueOnce(null) // First call fails
      .mockResolvedValueOnce(new CoinbaseDataSource()); // Second call succeeds

    const result = await dataSourceManager.fetchOHLC('BTCUSDT', '1h', 100);
    
    expect(result.source).toBe('Coinbase Pro');
    expect(result.data).toBeDefined();
  });
});
```

## Performance Optimization

### Caching Strategy

```typescript
// server/cache/OHLCCache.ts
interface CacheEntry {
  data: OHLCData[];
  timestamp: number;
  ttl: number;
}

export class OHLCCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 10000, defaultTTL = 3600) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  generateKey(symbol: string, interval: string, limit: number): string {
    return `${symbol}:${interval}:${limit}`;
  }

  get(symbol: string, interval: string, limit: number): OHLCData[] | null {
    const key = this.generateKey(symbol, interval, limit);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(symbol: string, interval: string, limit: number, data: OHLCData[], ttl?: number): void {
    const key = this.generateKey(symbol, interval, limit);
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  clear(): void {
    this.cache.clear();
  }
}
```

## Error Handling

### Data Source Failures

```typescript
// server/errors/OHLCErrors.ts
export class DataSourceError extends Error {
  constructor(
    message: string,
    public source: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'DataSourceError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Usage in data source implementations
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new DataSourceError(
      `API request failed: ${response.status}`,
      'Binance',
      response.status
    );
  }
} catch (error) {
  if (error instanceof DataSourceError) {
    console.error(`Data source error: ${error.source} - ${error.message}`);
    // Try next data source
  } else {
    console.error('Unexpected error:', error);
    throw error;
  }
}
```

## Monitoring and Logging

### Data Source Health Monitoring

```typescript
// server/monitoring/DataSourceMonitor.ts
export class DataSourceMonitor {
  private healthChecks = new Map<string, { isHealthy: boolean, lastCheck: number }>();
  private metrics = new Map<string, { requestCount: number, errorCount: number, avgResponseTime: number }>();

  async checkHealth(dataSource: IDataSource): Promise<boolean> {
    const start = Date.now();
    
    try {
      const isHealthy = await dataSource.isAvailable();
      const responseTime = Date.now() - start;
      
      this.healthChecks.set(dataSource.name, {
        isHealthy,
        lastCheck: Date.now()
      });
      
      this.updateMetrics(dataSource.name, responseTime, !isHealthy);
      
      return isHealthy;
    } catch (error) {
      this.updateMetrics(dataSource.name, Date.now() - start, true);
      return false;
    }
  }

  private updateMetrics(sourceName: string, responseTime: number, isError: boolean): void {
    const current = this.metrics.get(sourceName) || { requestCount: 0, errorCount: 0, avgResponseTime: 0 };
    
    current.requestCount++;
    if (isError) current.errorCount++;
    current.avgResponseTime = (current.avgResponseTime * (current.requestCount - 1) + responseTime) / current.requestCount;
    
    this.metrics.set(sourceName, current);
  }

  getHealthStatus(): Record<string, any> {
    return {
      healthChecks: Object.fromEntries(this.healthChecks),
      metrics: Object.fromEntries(this.metrics)
    };
  }
}
```

## Deployment Considerations

### Production Checklist

- [ ] Configure all required API keys and secrets
- [ ] Set up proper error monitoring and alerting
- [ ] Implement rate limiting for external API calls
- [ ] Configure cache TTL based on data requirements
- [ ] Set up database indexes for optimal query performance
- [ ] Implement graceful degradation for data source failures
- [ ] Configure logging levels for production
- [ ] Set up health check endpoints for monitoring

### Security Considerations

- [ ] Store API keys securely using environment variables
- [ ] Implement rate limiting to prevent abuse
- [ ] Validate all input parameters
- [ ] Use HTTPS for all external API calls
- [ ] Implement proper authentication for admin endpoints
- [ ] Log security events and suspicious activity

## Best Practices

1. **Data Source Priority**: Always implement fallback mechanisms
2. **Error Handling**: Gracefully handle API failures and network issues
3. **Caching**: Implement intelligent caching to reduce API calls
4. **Monitoring**: Monitor data source health and performance
5. **Testing**: Comprehensive unit and integration tests
6. **Documentation**: Keep this guide updated with new implementations
7. **Validation**: Always validate data before caching
8. **Performance**: Optimize for high-frequency requests

## Troubleshooting

### Common Issues

1. **API Rate Limiting**: Implement exponential backoff
2. **Data Format Changes**: Use robust parsing with error handling
3. **Network Timeouts**: Set appropriate timeout values
4. **Cache Invalidation**: Implement proper cache expiration
5. **Symbol Mapping**: Handle different symbol formats between exchanges

### Debug Endpoints

```typescript
// Add debug endpoints for development
app.get('/debug/ohlc/health', async (req, res) => {
  const monitor = new DataSourceMonitor();
  const health = await monitor.getHealthStatus();
  res.json(health);
});

app.get('/debug/ohlc/cache', async (req, res) => {
  const cacheStats = {
    size: cache.size,
    entries: Array.from(cache.keys())
  };
  res.json(cacheStats);
});
```

This comprehensive guide provides the foundation for extending the OHLC data source system while maintaining reliability, performance, and maintainability.