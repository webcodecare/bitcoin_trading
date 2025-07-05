import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  height?: number;
  enableTrading?: boolean;
  showSignals?: boolean;
}

interface Signal {
  id: string;
  ticker: string;
  type: 'buy' | 'sell';
  price: string;
  timestamp: string;
  notes?: string;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h?: number;
  volume24h?: number;
  high24h?: number;
  low24h?: number;
}

export default function TradingViewWidget({ 
  symbol = 'BINANCE:BTCUSDT', 
  theme = 'dark',
  height = 600,
  enableTrading = true,
  showSignals = true
}: TradingViewWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeMode, setTradeMode] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Extract ticker from symbol (BINANCE:BTCUSDT -> BTCUSDT)
  const ticker = symbol.includes(':') ? symbol.split(':')[1] : symbol;

  // Fetch current market data
  const { data: marketData } = useQuery({
    queryKey: [`/api/market/price/${ticker}`],
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Fetch signals for this ticker
  const { data: signals = [] } = useQuery({
    queryKey: [`/api/signals/${ticker}`],
  });

  // Trading mutations
  const buyMutation = useMutation({
    mutationFn: async (data: { amount: number; price?: number }) => {
      return apiRequest('POST', '/api/trading/buy', {
        ticker,
        amount: data.amount,
        type: tradeMode,
        price: data.price
      });
    },
    onSuccess: () => {
      toast({
        title: "Buy Order Placed",
        description: `Successfully placed ${tradeMode} buy order for ${ticker}`,
      });
      setTradeAmount('');
      setLimitPrice('');
    },
    onError: (error) => {
      toast({
        title: "Trade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sellMutation = useMutation({
    mutationFn: async (data: { amount: number; price?: number }) => {
      return apiRequest('POST', '/api/trading/sell', {
        ticker,
        amount: data.amount,
        type: tradeMode,
        price: data.price
      });
    },
    onSuccess: () => {
      toast({
        title: "Sell Order Placed", 
        description: `Successfully placed ${tradeMode} sell order for ${ticker}`,
      });
      setTradeAmount('');
      setLimitPrice('');
    },
    onError: (error) => {
      toast({
        title: "Trade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update price history and current price
  useEffect(() => {
    if (marketData?.price) {
      setCurrentPrice(marketData.price);
      setPriceHistory(prev => {
        const newHistory = [...prev, marketData.price];
        return newHistory.slice(-100); // Keep last 100 price points
      });
    }
  }, [marketData]);

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || priceHistory.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.fillStyle = theme === 'dark' ? '#0a0a0a' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Calculate price range
    const minPrice = Math.min(...priceHistory);
    const maxPrice = Math.max(...priceHistory);
    const priceRange = maxPrice - minPrice || 1;

    // Draw grid lines
    ctx.strokeStyle = theme === 'dark' ? '#333333' : '#e5e5e5';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = theme === 'dark' ? '#888888' : '#666666';
      ctx.font = '12px Arial';
      ctx.fillText(`$${price.toFixed(0)}`, 5, y - 5);
    }

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw price line
    ctx.strokeStyle = '#00d4aa';
    ctx.lineWidth = 2;
    ctx.beginPath();

    priceHistory.forEach((price, index) => {
      const x = (width / (priceHistory.length - 1)) * index;
      const y = height - ((price - minPrice) / priceRange) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw current price indicator
    if (currentPrice > 0) {
      const currentY = height - ((currentPrice - minPrice) / priceRange) * height;
      
      // Price line
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      ctx.lineTo(width, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price label
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`$${currentPrice.toFixed(2)}`, width - 100, currentY - 5);
    }

    // Draw buy/sell signals
    if (showSignals && signals.length > 0) {
      signals.forEach((signal: Signal) => {
        const signalPrice = parseFloat(signal.price);
        const signalY = height - ((signalPrice - minPrice) / priceRange) * height;
        
        // Signal marker
        ctx.fillStyle = signal.type === 'buy' ? '#22c55e' : '#ef4444';
        ctx.beginPath();
        ctx.arc(width - 20, signalY, 6, 0, 2 * Math.PI);
        ctx.fill();

        // Signal label
        ctx.fillStyle = signal.type === 'buy' ? '#22c55e' : '#ef4444';
        ctx.font = '12px Arial';
        ctx.fillText(signal.type.toUpperCase(), width - 50, signalY + 4);
      });
    }

  }, [priceHistory, currentPrice, theme, showSignals, signals]);

  const handleTrade = (action: 'buy' | 'sell') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to trade",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(tradeAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid trade amount",
        variant: "destructive",
      });
      return;
    }

    const tradeData: { amount: number; price?: number } = { amount };
    
    if (tradeMode === 'limit') {
      const price = parseFloat(limitPrice);
      if (!price || price <= 0) {
        toast({
          title: "Invalid Price",
          description: "Please enter a valid limit price",
          variant: "destructive",
        });
        return;
      }
      tradeData.price = price;
    }

    if (action === 'buy') {
      buyMutation.mutate(tradeData);
    } else {
      sellMutation.mutate(tradeData);
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{ticker} Trading Chart</h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Price: ${currentPrice.toFixed(2)}</span>
            {marketData?.change24h && (
              <span className={marketData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Live</Badge>
          <Badge variant={showSignals ? "default" : "secondary"}>
            Signals {showSignals ? 'On' : 'Off'}
          </Badge>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative bg-card border border-border rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full block"
          style={{ height: `${height}px` }}
        />
        
        {/* Loading overlay */}
        {priceHistory.length < 2 && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Trading Panel */}
      {enableTrading && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Trade</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tradeMode} onValueChange={(value) => setTradeMode(value as 'market' | 'limit')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="market">Market Order</TabsTrigger>
                <TabsTrigger value="limit">Limit Order</TabsTrigger>
              </TabsList>

              <TabsContent value="market" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-foreground">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleTrade('buy')} 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={buyMutation.isPending}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {buyMutation.isPending ? 'Processing...' : 'Buy'}
                  </Button>
                  <Button 
                    onClick={() => handleTrade('sell')} 
                    variant="destructive" 
                    className="flex-1"
                    disabled={sellMutation.isPending}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    {sellMutation.isPending ? 'Processing...' : 'Sell'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="limit" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="limit-amount" className="text-foreground">Amount (USD)</Label>
                    <Input
                      id="limit-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit-price" className="text-foreground">Limit Price</Label>
                    <Input
                      id="limit-price"
                      type="number"
                      placeholder="Enter price"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleTrade('buy')} 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={buyMutation.isPending}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {buyMutation.isPending ? 'Processing...' : 'Buy Limit'}
                  </Button>
                  <Button 
                    onClick={() => handleTrade('sell')} 
                    variant="destructive" 
                    className="flex-1"
                    disabled={sellMutation.isPending}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    {sellMutation.isPending ? 'Processing...' : 'Sell Limit'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Amount Buttons */}
            <div className="mt-4">
              <Label className="text-foreground">Quick amounts:</Label>
              <div className="flex space-x-2 mt-2">
                {['100', '500', '1000', '5000'].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setTradeAmount(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Signals */}
      {showSignals && signals.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {signals.slice(0, 3).map((signal: Signal) => (
                <div key={signal.id} className="flex items-center justify-between p-2 border border-border rounded">
                  <div className="flex items-center space-x-2">
                    <Badge variant={signal.type === 'buy' ? 'default' : 'destructive'}>
                      {signal.type.toUpperCase()}
                    </Badge>
                    <span className="text-foreground">${signal.price}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(signal.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}