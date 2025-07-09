import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface SignalMarker {
  id: string;
  type: 'buy' | 'sell';
  price: number;
  timestamp: string;
  x: number;
  y: number;
}

interface PublicDemoChartProps {
  title?: string;
  symbol?: string;
  className?: string;
}

export default function PublicDemoChart({ 
  title = "Bitcoin Live Chart", 
  symbol = "BTCUSDT",
  className = ""
}: PublicDemoChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPrice, setCurrentPrice] = useState(67234.56);
  const [priceChange, setPriceChange] = useState(2.34);
  const [signals, setSignals] = useState<SignalMarker[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);

  // Sample OHLC data for demonstration
  const sampleData = [
    { timestamp: '09:00', open: 66800, high: 67200, low: 66500, close: 67000 },
    { timestamp: '09:30', open: 67000, high: 67500, low: 66900, close: 67300 },
    { timestamp: '10:00', open: 67300, high: 67800, low: 67100, close: 67600 },
    { timestamp: '10:30', open: 67600, high: 68200, low: 67400, close: 67900 },
    { timestamp: '11:00', open: 67900, high: 68500, low: 67700, close: 68200 },
    { timestamp: '11:30', open: 68200, high: 68800, low: 67950, close: 68400 },
    { timestamp: '12:00', open: 68400, high: 68900, low: 68100, close: 67800 },
    { timestamp: '12:30', open: 67800, high: 68300, low: 67300, close: 67600 },
    { timestamp: '13:00', open: 67600, high: 68100, low: 67200, close: 67900 },
    { timestamp: '13:30', open: 67900, high: 68400, low: 67600, close: 68100 },
    { timestamp: '14:00', open: 68100, high: 68600, low: 67800, close: 68300 },
    { timestamp: '14:30', open: 68300, high: 68800, low: 68000, close: 68200 },
  ];

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 200; // ±100 price variation
      const newPrice = Math.max(65000, Math.min(70000, currentPrice + variation));
      const change = ((newPrice - 67000) / 67000) * 100;
      
      setCurrentPrice(newPrice);
      setPriceChange(change);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  // Generate simulated trading signals
  useEffect(() => {
    const generateSignal = () => {
      const newSignal: SignalMarker = {
        id: `signal-${Date.now()}`,
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        price: currentPrice,
        timestamp: new Date().toISOString(),
        x: Math.random() * 350 + 50, // Random x position
        y: Math.random() * 200 + 50,  // Random y position
      };

      setSignals(prev => [...prev.slice(-4), newSignal]); // Keep last 5 signals
    };

    // Generate initial signals
    const initialSignals: SignalMarker[] = [
      { id: '1', type: 'buy', price: 66500, timestamp: '2025-01-09T10:30:00Z', x: 100, y: 80 },
      { id: '2', type: 'sell', price: 68200, timestamp: '2025-01-09T11:45:00Z', x: 200, y: 120 },
      { id: '3', type: 'buy', price: 67800, timestamp: '2025-01-09T13:15:00Z', x: 300, y: 100 },
    ];
    setSignals(initialSignals);

    // Generate new signal every 15 seconds
    const signalInterval = setInterval(generateSignal, 15000);
    
    return () => clearInterval(signalInterval);
  }, [currentPrice]);

  // Draw the chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = (rect.width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 6; i++) {
      const y = (rect.height / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Draw candlestick chart
    const candleWidth = rect.width / sampleData.length * 0.6;
    const maxPrice = Math.max(...sampleData.map(d => d.high));
    const minPrice = Math.min(...sampleData.map(d => d.low));
    const priceRange = maxPrice - minPrice;

    sampleData.forEach((candle, index) => {
      const x = (rect.width / sampleData.length) * index + candleWidth / 2;
      const openY = rect.height - ((candle.open - minPrice) / priceRange) * rect.height;
      const closeY = rect.height - ((candle.close - minPrice) / priceRange) * rect.height;
      const highY = rect.height - ((candle.high - minPrice) / priceRange) * rect.height;
      const lowY = rect.height - ((candle.low - minPrice) / priceRange) * rect.height;

      const isGreen = candle.close > candle.open;
      
      // Draw wick
      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
    });

    // Draw signal markers
    signals.forEach((signal) => {
      const x = signal.x;
      const y = signal.y;
      
      // Draw signal triangle
      ctx.fillStyle = signal.type === 'buy' ? '#10b981' : '#ef4444';
      ctx.beginPath();
      if (signal.type === 'buy') {
        // Up triangle for buy
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x - 6, y + 4);
        ctx.lineTo(x + 6, y + 4);
      } else {
        // Down triangle for sell
        ctx.moveTo(x, y + 8);
        ctx.lineTo(x - 6, y - 4);
        ctx.lineTo(x + 6, y - 4);
      }
      ctx.closePath();
      ctx.fill();

      // Draw signal border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

  }, [signals, sampleData]);

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="secondary" className="text-xs">DEMO</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold">${currentPrice.toLocaleString()}</div>
              <div className={`text-sm flex items-center ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-64">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />
          
          {/* Live Signal Indicator */}
          {isAnimating && (
            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/80 text-white px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">LIVE SIGNALS</span>
            </div>
          )}

          {/* Recent Signal Alert */}
          {signals.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg">
              <div className="text-xs font-medium">Latest Signal</div>
              <div className={`text-sm ${signals[signals.length - 1].type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                {signals[signals.length - 1].type.toUpperCase()} @ ${signals[signals.length - 1].price.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}