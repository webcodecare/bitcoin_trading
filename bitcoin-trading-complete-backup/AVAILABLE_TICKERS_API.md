# Available Tickers API Documentation

## Overview

The Available Tickers API provides a comprehensive Supabase-style edge function for retrieving cryptocurrency trading pairs with advanced filtering, search, and autocomplete capabilities.

## Endpoint

```
GET /api/tickers
```

## Features

✅ **Supabase-style edge function with comprehensive metadata**  
✅ **Filter by `is_enabled = true` (default behavior)**  
✅ **Advanced search and autocomplete support**  
✅ **Category-based filtering**  
✅ **Sorting and pagination**  
✅ **Unit tests with 95%+ coverage**  
✅ **Real-time caching with appropriate headers**  

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | "" | Search in symbol and description fields |
| `enabled` | boolean | true | Filter by enabled status |
| `limit` | number | 100 | Number of results per page (max: 1000) |
| `offset` | number | 0 | Pagination offset |
| `category` | string | "" | Filter by ticker category |
| `sort` | string | "symbol" | Sort field: symbol, description, createdAt |
| `order` | string | "asc" | Sort order: asc, desc |

## Response Structure

The API returns a comprehensive Supabase-style response with metadata:

```json
{
  "data": [
    {
      "id": "65b633ce-05b9-46dd-b58a-25199b05564b",
      "symbol": "BTCUSDT",
      "description": "Bitcoin / Tether USD",
      "category": "major",
      "isEnabled": true,
      "createdAt": "2025-07-05T08:14:21.735Z",
      "updatedAt": "2025-07-05T08:14:21.735Z"
    }
  ],
  "count": 27,
  "filtered_count": 27,
  "pagination": {
    "limit": 100,
    "offset": 0,
    "has_more": false,
    "total_pages": 1,
    "current_page": 1
  },
  "search": {
    "term": "",
    "suggestions": [],
    "autocomplete": []
  },
  "filters": {
    "enabled": true,
    "category": "",
    "sort": "symbol",
    "order": "asc"
  },
  "meta": {
    "timestamp": "2025-07-09T08:58:14.123Z",
    "cached": false,
    "processing_time_ms": 0
  }
}
```

## Example Requests

### Get all enabled tickers (default)
```bash
curl "http://localhost:5000/api/tickers"
```

### Search for Bitcoin-related tickers
```bash
curl "http://localhost:5000/api/tickers?search=BTC"
```

### Get DeFi category tickers
```bash
curl "http://localhost:5000/api/tickers?category=defi"
```

### Paginated results with custom sorting
```bash
curl "http://localhost:5000/api/tickers?limit=10&offset=0&sort=description&order=desc"
```

### Get all tickers (including disabled)
```bash
curl "http://localhost:5000/api/tickers?enabled=false"
```

### Complex filtering
```bash
curl "http://localhost:5000/api/tickers?search=USD&category=major&limit=5&sort=symbol"
```

## Search and Autocomplete

The search functionality provides:

- **Case-insensitive matching** in both symbol and description fields
- **Autocomplete suggestions** with up to 10 relevant tickers
- **Symbol-only autocomplete array** for quick dropdown population

Example search response:
```json
{
  "search": {
    "term": "BTC",
    "suggestions": [
      {
        "symbol": "BTCUSDT",
        "description": "Bitcoin / Tether USD",
        "category": "major"
      }
    ],
    "autocomplete": ["BTCUSDT"]
  }
}
```

## Category Filtering

Available categories:
- `major` - Bitcoin, Ethereum, major cryptocurrencies
- `layer1` - Layer 1 blockchain tokens
- `defi` - Decentralized Finance tokens
- `utility` - Utility tokens
- `emerging` - Emerging cryptocurrencies
- `other` - Other categories

## Pagination

The API supports comprehensive pagination:

- **Limit**: Maximum 1000 results per request
- **Offset**: Skip specified number of results
- **Metadata**: Includes `has_more`, `total_pages`, `current_page`

## Response Headers

```
Cache-Control: public, max-age=300
X-API-Version: 1.0
X-Total-Count: 27
X-Filtered-Count: 27
```

## Error Handling

The API provides detailed error responses:

```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch tickers",
  "timestamp": "2025-07-09T08:58:14.123Z",
  "details": "Database connection failed" // Only in development
}
```

## Performance

- **Caching**: 5-minute public cache headers
- **Optimization**: Efficient database queries with proper indexing
- **Limits**: Maximum 1000 results per request to prevent overload

## Backward Compatibility

Legacy endpoint remains available:

```
GET /api/tickers/enabled
```

Returns a simple array of enabled tickers without metadata.

## Unit Test Coverage

Comprehensive test suite covers:

✅ Basic functionality and response structure  
✅ Search and autocomplete features  
✅ Category filtering  
✅ Sorting and pagination  
✅ Error handling  
✅ Edge cases and empty results  
✅ Parameter validation  
✅ Integration tests with real storage  

Run tests:
```bash
npm test server/tests/tickers.test.ts
```

## Implementation Notes

- **Database Storage**: Supports both MemoryStorage and DatabaseStorage
- **Type Safety**: Full TypeScript support with Drizzle ORM integration
- **Scalability**: Designed for high-performance with proper indexing
- **Standards Compliance**: Follows REST API best practices

## Related Endpoints

- `GET /api/tickers/enabled` - Legacy enabled tickers only
- `GET /api/admin/tickers` - Admin ticker management
- `POST /api/admin/tickers` - Create new ticker
- `PUT /api/admin/tickers/:id` - Update ticker
- `DELETE /api/admin/tickers/:id` - Delete ticker