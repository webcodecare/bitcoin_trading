import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, Play, Pause, Maximize2, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  height?: number;
  enableTrading?: boolean;
  showSignals?: boolean;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h?: number;
  volume24h?: number;
  high24h?: number;
  low24h?: number;
}

interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function TradingViewWidget({ 
  symbol = 'BTCUSDT', 
  theme = 'dark',
  height = 600,
  enableTrading = true,
  showSignals = true
}: TradingViewWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [priceHistory, setPriceHistory] = useState<OHLCData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isLive, setIsLive] = useState(true);
  const [timeframe, setTimeframe] = useState('5m');
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch market data
  const { data: marketData } = useQuery<MarketData>({
    queryKey: [`/api/market/price/${symbol}`],
    refetchInterval: isLive ? 2000 : false,
    staleTime: 0,
  });

  // Generate realistic OHLC data
  useEffect(() => {
    const generateOHLCData = () => {
      const data: OHLCData[] = [];
      let price = marketData?.price || 67000;
      const now = Date.now();
      
      for (let i = 49; i >= 0; i--) {
        const timestamp = now - (i * 60000); // 1 minute intervals
        const open = price;
        const change = (Math.random() - 0.5) * 500;
        const close = Math.max(60000, Math.min(75000, price + change));
        const high = Math.max(open, close) + Math.random() * 200;
        const low = Math.min(open, close) - Math.random() * 200;
        const volume = 50000 + Math.random() * 100000;
        
        data.push({
          timestamp,
          open,
          high: Math.min(75000, high),
          low: Math.max(60000, low),
          close,
          volume
        });
        
        price = close;
      }
      
      setPriceHistory(data);
      if (data.length > 0) {
        setCurrentPrice(data[data.length - 1].close);
      }
    };

    generateOHLCData();
  }, [marketData]);

  // Update current price in real-time
  useEffect(() => {
    if (marketData && isLive) {
      setCurrentPrice(marketData.price);
      
      // Add new candle every 30 seconds
      const interval = setInterval(() => {
        setPriceHistory(prev => {
          const lastCandle = prev[prev.length - 1];
          if (!lastCandle) return prev;
          
          const now = Date.now();
          const open = lastCandle.close;
          const change = (Math.random() - 0.5) * 300;
          const close = Math.max(60000, Math.min(75000, open + change));
          const high = Math.max(open, close) + Math.random() * 150;
          const low = Math.min(open, close) - Math.random() * 150;
          const volume = 30000 + Math.random() * 80000;
          
          const newCandle: OHLCData = {
            timestamp: now,
            open,
            high: Math.min(75000, high),
            low: Math.max(60000, low),
            close,
            volume
          };
          
          return [...prev.slice(-49), newCandle];
        });
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [marketData, isLive]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || priceHistory.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const chartHeight = height - 60;
    const chartTop = 30;

    // Clear with dark background
    ctx.fillStyle = theme === 'dark' ? '#1e222d' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (priceHistory.length < 2) return;

    const prices = priceHistory.map(d => [d.low, d.high]).flat();
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Draw grid
    ctx.strokeStyle = theme === 'dark' ? '#2a2e39' : '#e1e5e9';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = chartTop + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 8; i++) {
      const x = 40 + ((width - 50) / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, chartTop);
      ctx.lineTo(x, chartTop + chartHeight);
      ctx.stroke();
    }

    // Draw candlesticks or line
    const candleWidth = Math.max(2, (width - 50) / priceHistory.length - 1);
    
    priceHistory.forEach((candle, index) => {
      const x = 40 + ((width - 50) / priceHistory.length) * index;
      
      if (chartType === 'candle') {
        // Draw candlestick
        const openY = chartTop + chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight;
        const closeY = chartTop + chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;
        const highY = chartTop + chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
        const lowY = chartTop + chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;
        
        const isGreen = candle.close > candle.open;
        ctx.fillStyle = isGreen ? '#26a69a' : '#ef5350';
        ctx.strokeStyle = isGreen ? '#26a69a' : '#ef5350';
        
        // Draw wick
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + candleWidth/2, highY);
        ctx.lineTo(x + candleWidth/2, lowY);
        ctx.stroke();
        
        // Draw body
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY) || 1;
        ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
        
      } else {
        // Draw line chart
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 2;
        
        const y = chartTop + chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;
        
        if (index === 0) {
          ctx.beginPath();
          ctx.moveTo(x + candleWidth/2, y);
        } else {
          ctx.lineTo(x + candleWidth/2, y);
        }
        
        if (index === priceHistory.length - 1) {
          ctx.stroke();
        }
      }
    });

    // Draw current price line
    if (currentPrice > 0) {
      const currentY = chartTop + chartHeight - ((currentPrice - minPrice) / priceRange) * chartHeight;
      
      ctx.strokeStyle = '#ffb74d';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(40, currentY);
      ctx.lineTo(width - 10, currentY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Price label
      ctx.fillStyle = '#ffb74d';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`$${currentPrice.toFixed(2)}`, width - 80, currentY - 5);
    }

    // Draw price scale
    ctx.fillStyle = theme === 'dark' ? '#787b86' : '#6a6d78';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange / 5) * (5 - i);
      const y = chartTop + (chartHeight / 5) * i;
      ctx.fillText(`$${price.toFixed(0)}`, 35, y + 3);
    }

    // Draw volume bars at bottom
    const volumeHeight = 40;
    const volumeTop = height - volumeHeight;
    const maxVolume = Math.max(...priceHistory.map(d => d.volume));
    
    priceHistory.forEach((candle, index) => {
      const x = 40 + ((width - 50) / priceHistory.length) * index;
      const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight * 0.8;
      
      ctx.fillStyle = candle.close > candle.open ? '#26a69a40' : '#ef535040';
      ctx.fillRect(x, volumeTop + volumeHeight - volumeBarHeight, candleWidth, volumeBarHeight);
    });

  }, [priceHistory, currentPrice, chartType, theme]);

  const change24h = marketData?.change24h || 0;
  const changePercent = marketData ? (change24h / marketData.price) * 100 : 0;

  return (
    <Card className={`w-full ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {symbol}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold">
                ${currentPrice.toLocaleString()}
              </span>
              <Badge variant={changePercent >= 0 ? "default" : "destructive"} className="text-xs">
                {changePercent >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(changePercent).toFixed(2)}%
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1M</SelectItem>
                <SelectItem value="5m">5M</SelectItem>
                <SelectItem value="15m">15M</SelectItem>
                <SelectItem value="1h">1H</SelectItem>
                <SelectItem value="4h">4H</SelectItem>
                <SelectItem value="1d">1D</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChartType(chartType === 'candle' ? 'line' : 'candle')}
              className="h-8 px-2"
            >
              {chartType === 'candle' ? 'Line' : 'Candle'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="h-8 w-8 p-0"
            >
              {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative w-full border-t" style={{ height: `${isFullscreen ? window.innerHeight - 120 : height}px` }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            style={{ width: '100%', height: '100%' }}
          />
          
          {/* Status indicators */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant={isLive ? "default" : "secondary"} className="text-xs">
              <div className={`w-2 h-2 rounded-full mr-1 ${
                isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`} />
              {isLive ? 'LIVE' : 'PAUSED'}
            </Badge>
            
            {marketData && (
              <Badge variant="outline" className="text-xs">
                Vol: {marketData.volume24h ? (marketData.volume24h / 1e6).toFixed(1) + 'M' : 'N/A'}
              </Badge>
            )}
          </div>
          
          {/* Chart info */}
          <div className="absolute top-4 right-4 text-right">
            <div className="text-xs text-muted-foreground space-y-1">
              {marketData && (
                <>
                  <div>H: ${marketData.high24h?.toFixed(2) || 'N/A'}</div>
                  <div>L: ${marketData.low24h?.toFixed(2) || 'N/A'}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}