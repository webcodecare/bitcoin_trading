import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface OHLCData {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Signal {
  id: string;
  ticker: string;
  signalType: 'BUY' | 'SELL';
  price: number;
  createdAt: string;
  notes?: string;
}

interface TradingViewChartProps {
  symbol: string;
  height?: number;
  className?: string;
}

export default function TradingViewChart({ symbol, height = 400, className = '' }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [signals, setSignals] = useState<Signal[]>([]);

  // Fetch OHLC data
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: [`/api/market/klines/${symbol}`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch signals data
  const { data: signalData } = useQuery({
    queryKey: [`/api/signals`],
  });

  // WebSocket for real-time updates
  useWebSocket((message) => {
    if (message.type === "new_signal" && message.signal) {
      const signal = message.signal as Signal;
      if (signal.ticker === symbol) {
        setSignals(prev => [signal, ...prev.slice(0, 49)]); // Keep last 50 signals
      }
    }
  });

  useEffect(() => {
    if (signalData) {
      setSignals(signalData);
    }
  }, [signalData]);

  useEffect(() => {
    if (!marketData || !chartContainerRef.current || marketData.length === 0) return;

    const initChart = () => {
      if (!chartContainerRef.current) return;

      // Clear any existing chart
      if (chartRef.current) {
        chartRef.current.remove();
      }

      // Create a canvas-based chart
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = chartContainerRef.current.clientWidth || 600;
      canvas.height = height;
      canvas.style.width = '100%';
      canvas.style.height = `${height}px`;
      canvas.style.background = 'transparent';

      chartContainerRef.current.innerHTML = '';
      chartContainerRef.current.appendChild(canvas);

      // Calculate price range
      const prices = marketData.flatMap((d: OHLCData) => [d.open, d.high, d.low, d.close]);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;

      // Drawing parameters
      const padding = 40;
      const chartWidth = canvas.width - (padding * 2);
      const chartHeight = canvas.height - (padding * 2);
      const candleWidth = Math.max(2, chartWidth / marketData.length - 2);
      
      // Draw grid
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
      }

      // Draw candlesticks
      marketData.forEach((candle: OHLCData, index: number) => {
        const x = padding + (index * (candleWidth + 2));
        const openY = padding + ((maxPrice - candle.open) / priceRange) * chartHeight;
        const closeY = padding + ((maxPrice - candle.close) / priceRange) * chartHeight;
        const highY = padding + ((maxPrice - candle.high) / priceRange) * chartHeight;
        const lowY = padding + ((maxPrice - candle.low) / priceRange) * chartHeight;

        const isGreen = candle.close > candle.open;
        
        // Draw wick
        ctx.strokeStyle = 'hsl(var(--muted-foreground))';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + candleWidth/2, highY);
        ctx.lineTo(x + candleWidth/2, lowY);
        ctx.stroke();

        // Draw body
        ctx.fillStyle = isGreen ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';
        ctx.strokeStyle = isGreen ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';
        
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(1, Math.abs(closeY - openY));
        
        ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
        ctx.strokeRect(x, bodyTop, candleWidth, bodyHeight);
      });

      // Add signal markers
      if (signals && signals.length > 0) {
        signals
          .filter(signal => signal.ticker === symbol)
          .forEach(signal => {
            const signalTime = new Date(signal.createdAt).getTime();
            const candleIndex = marketData.findIndex((candle: OHLCData) => 
              Math.abs(new Date(candle.time).getTime() - signalTime) < 60 * 60 * 1000
            );

            if (candleIndex >= 0) {
              const x = padding + (candleIndex * (candleWidth + 2)) + candleWidth/2;
              const candle = marketData[candleIndex];
              const y = signal.signalType === 'BUY' 
                ? padding + ((maxPrice - candle.low) / priceRange) * chartHeight + 30
                : padding + ((maxPrice - candle.high) / priceRange) * chartHeight - 30;

              ctx.fillStyle = signal.signalType === 'BUY' ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';
              ctx.beginPath();
              
              if (signal.signalType === 'BUY') {
                ctx.moveTo(x, y - 8);
                ctx.lineTo(x - 6, y + 4);
                ctx.lineTo(x + 6, y + 4);
              } else {
                ctx.moveTo(x, y + 8);
                ctx.lineTo(x - 6, y - 4);
                ctx.lineTo(x + 6, y - 4);
              }
              
              ctx.closePath();
              ctx.fill();

              // Add signal label
              ctx.fillStyle = 'hsl(var(--foreground))';
              ctx.font = '10px system-ui';
              ctx.textAlign = 'center';
              ctx.fillText(
                signal.signalType,
                x,
                signal.signalType === 'BUY' ? y + 20 : y - 15
              );
            }
          });
      }

      // Add price labels
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'right';
      
      for (let i = 0; i <= 5; i++) {
        const price = maxPrice - (priceRange * i / 5);
        const y = padding + (i / 5) * chartHeight;
        ctx.fillText(price.toFixed(2), canvas.width - 5, y + 4);
      }

      // Store reference for cleanup
      chartRef.current = { 
        remove: () => {
          if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
        }
      };
    };

    initChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [marketData, signals, symbol, height]);

  if (marketLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            {symbol} Price Chart
          </CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!marketData || marketData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            {symbol} Price Chart
          </CardTitle>
          <CardDescription>No chart data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            Chart data temporarily unavailable
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestPrice = marketData[marketData.length - 1];
  const previousPrice = marketData[marketData.length - 2];
  const priceChange = latestPrice && previousPrice ? latestPrice.close - previousPrice.close : 0;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice.close) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              {symbol} Price Chart
            </CardTitle>
            <CardDescription>Real-time candlestick chart with trading signals</CardDescription>
          </div>
          {latestPrice && (
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${latestPrice.close.toFixed(2)}
              </div>
              <Badge variant={priceChange >= 0 ? "default" : "destructive"} className="ml-2">
                {priceChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {priceChangePercent.toFixed(2)}%
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
        {signals.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Recent signals: {signals.filter(s => s.ticker === symbol).length} total
          </div>
        )}
      </CardContent>
    </Card>
  );
}