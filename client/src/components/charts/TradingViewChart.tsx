import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { useRealtimeChartMarkers, type RealtimeAlert } from '@/hooks/useSupabaseRealtime';

interface TradingViewChartProps {
  symbol: string;
  height?: number;
  className?: string;
}

interface PriceData {
  time: string;
  price: number;
}

export default function TradingViewChart({ symbol, height = 400, className = '' }: TradingViewChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [signalMarkers, setSignalMarkers] = useState<RealtimeAlert[]>([]);

  // Handle realtime chart marker updates
  const handleNewSignal = (alert: RealtimeAlert) => {
    console.log(`Supabase Realtime: New ${alert.signalType} signal for ${alert.ticker} at $${alert.price}`);
    
    // Add signal marker to chart
    setSignalMarkers(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 signals
    
    // Create visual indicator for new signal
    const signalIndicator = document.createElement('div');
    signalIndicator.className = `fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg animate-pulse ${
      alert.signalType === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`;
    signalIndicator.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="font-bold">${alert.signalType.toUpperCase()}</span>
        <span>${alert.ticker}</span>
        <span>$${alert.price}</span>
      </div>
    `;
    
    document.body.appendChild(signalIndicator);
    
    // Remove indicator after 5 seconds
    setTimeout(() => {
      if (document.body.contains(signalIndicator)) {
        document.body.removeChild(signalIndicator);
      }
    }, 5000);
  };

  // Subscribe to realtime chart markers for this ticker
  const { tickerAlerts, latestAlert } = useRealtimeChartMarkers(symbol, handleNewSignal);

  // Fetch current price
  const { data: priceData } = useQuery({
    queryKey: [`/api/market/price/${symbol}`],
    refetchInterval: 5000,
  });

  // Generate sample price data for demonstration
  useEffect(() => {
    if (priceData?.price) {
      const now = new Date().toISOString();
      setPriceHistory(prev => {
        const newData = [...prev, { time: now, price: priceData.price }];
        return newData.slice(-50); // Keep last 50 data points
      });
    }
  }, [priceData]);

  // Initialize price history with sample data
  useEffect(() => {
    if (priceHistory.length === 0 && priceData?.price) {
      const basePrice = priceData.price;
      const sampleData: PriceData[] = [];
      
      for (let i = 49; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60000).toISOString(); // 1 minute intervals
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const price = basePrice * (1 + variation);
        sampleData.push({ time, price });
      }
      
      setPriceHistory(sampleData);
    }
  }, [priceData]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || priceHistory.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.fillStyle = 'hsl(240, 3.7%, 12%)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (priceHistory.length < 2) return;

    // Calculate price range
    const prices = priceHistory.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Chart dimensions
    const padding = 60;
    const chartWidth = rect.width - 2 * padding;
    const chartHeight = rect.height - 2 * padding;

    // Draw grid lines
    ctx.strokeStyle = 'hsl(240, 3.7%, 25%)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice - (priceRange * i) / 5;
      ctx.fillStyle = 'hsl(240, 5%, 70%)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, padding - 10, y + 4);
    }

    // Draw price line
    ctx.strokeStyle = 'hsl(207, 90%, 54%)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    priceHistory.forEach((point, index) => {
      const x = padding + (chartWidth * index) / (priceHistory.length - 1);
      const y = padding + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Draw area under the line
    ctx.fillStyle = 'hsla(207, 90%, 54%, 0.1)';
    ctx.beginPath();
    
    priceHistory.forEach((point, index) => {
      const x = padding + (chartWidth * index) / (priceHistory.length - 1);
      const y = padding + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.lineTo(rect.width - padding, rect.height - padding);
    ctx.lineTo(padding, rect.height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw current price dot
    if (priceHistory.length > 0) {
      const lastPoint = priceHistory[priceHistory.length - 1];
      const x = rect.width - padding;
      const y = padding + chartHeight - ((lastPoint.price - minPrice) / priceRange) * chartHeight;
      
      ctx.fillStyle = 'hsl(207, 90%, 54%)';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw signal markers
    signalMarkers.forEach((signal) => {
      // Find the closest price point to the signal timestamp
      const signalTime = new Date(signal.timestamp).getTime();
      const chartTimes = priceHistory.map(p => new Date(p.time).getTime());
      
      let closestIndex = 0;
      let closestTimeDiff = Math.abs(chartTimes[0] - signalTime);
      
      for (let i = 1; i < chartTimes.length; i++) {
        const timeDiff = Math.abs(chartTimes[i] - signalTime);
        if (timeDiff < closestTimeDiff) {
          closestTimeDiff = timeDiff;
          closestIndex = i;
        }
      }
      
      if (closestIndex >= 0 && closestIndex < priceHistory.length) {
        const x = padding + (chartWidth * closestIndex) / (priceHistory.length - 1);
        const y = padding + chartHeight - ((signal.price - minPrice) / priceRange) * chartHeight;
        
        // Draw signal marker
        ctx.fillStyle = signal.signalType === 'buy' ? '#10b981' : '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw signal border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw signal label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          signal.signalType.toUpperCase().charAt(0), 
          x, 
          y + 3
        );
      }
    });

  }, [priceHistory, signalMarkers]);

  const currentPrice = priceData?.price || 0;
  const previousPrice = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{symbol} Chart</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold">
              ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {isPositive ? '+' : ''}${priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative" style={{ height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Signal overlay indicators */}
        {latestAlert && (
          <div className="absolute top-2 left-2 z-10">
            <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${
              latestAlert.signalType === 'buy' 
                ? 'bg-green-600/20 text-green-400 border-green-600/30' 
                : 'bg-red-600/20 text-red-400 border-red-600/30'
            }`}>
              Latest: {latestAlert.signalType.toUpperCase()} ${latestAlert.price}
            </div>
          </div>
        )}
        
        {/* Supabase Realtime connection status */}
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center space-x-2 px-2 py-1 rounded bg-card/80 border text-xs">
            <div className={`w-2 h-2 rounded-full ${tickerAlerts.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span>Supabase Realtime</span>
          </div>
        </div>
        
        {priceHistory.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Activity className="h-5 w-5 animate-pulse" />
              <span>Loading chart data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Real-time</span>
          <span>•</span>
          <span>{priceHistory.length} data points</span>
          {signalMarkers.length > 0 && (
            <>
              <span>•</span>
              <span>{signalMarkers.length} signals</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span>Live + Supabase Realtime</span>
        </div>
      </div>
    </div>
  );
}