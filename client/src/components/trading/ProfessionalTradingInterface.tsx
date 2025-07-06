import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  Settings
} from 'lucide-react';

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface TradeHistory {
  id: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

interface ProfessionalTradingInterfaceProps {
  symbol: string;
  currentPrice: number;
}

export default function ProfessionalTradingInterface({ 
  symbol, 
  currentPrice 
}: ProfessionalTradingInterfaceProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop' | 'stop_limit'>('limit');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [leverage, setLeverage] = useState('1');
  const [reduceOnly, setReduceOnly] = useState(false);
  const [timeInForce, setTimeInForce] = useState('GTC');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate realistic order book data
  const generateOrderBook = () => {
    const spread = currentPrice * 0.001; // 0.1% spread
    const bidPrice = currentPrice - spread / 2;
    const askPrice = currentPrice + spread / 2;
    
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];
    
    let totalBids = 0;
    let totalAsks = 0;
    
    // Generate 15 levels each side
    for (let i = 0; i < 15; i++) {
      const bidAmount = Math.random() * 5 + 0.1;
      const askAmount = Math.random() * 5 + 0.1;
      
      const bidPriceLevel = bidPrice - (i * currentPrice * 0.0001);
      const askPriceLevel = askPrice + (i * currentPrice * 0.0001);
      
      totalBids += bidAmount;
      totalAsks += askAmount;
      
      bids.push({
        price: bidPriceLevel,
        amount: bidAmount,
        total: totalBids
      });
      
      asks.push({
        price: askPriceLevel,
        amount: askAmount,
        total: totalAsks
      });
    }
    
    return { bids, asks: asks.reverse() };
  };

  // Generate recent trades
  const generateRecentTrades = (): TradeHistory[] => {
    const trades: TradeHistory[] = [];
    for (let i = 0; i < 50; i++) {
      trades.push({
        id: `trade-${i}`,
        price: currentPrice + (Math.random() - 0.5) * currentPrice * 0.002,
        amount: Math.random() * 2 + 0.01,
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        timestamp: new Date(Date.now() - i * 30000).toISOString()
      });
    }
    return trades;
  };

  const [orderBook] = useState(generateOrderBook());
  const [recentTrades] = useState(generateRecentTrades());

  // Update prices when current price changes
  useEffect(() => {
    if (!price && currentPrice > 0) {
      setPrice(currentPrice.toFixed(2));
    }
  }, [currentPrice, price]);

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest('POST', '/api/trading/order', orderData);
    },
    onSuccess: () => {
      toast({
        title: "Order Placed",
        description: `${orderSide.toUpperCase()} order for ${amount} ${symbol} placed successfully`,
      });
      // Reset form
      setAmount('');
      if (orderType === 'market') {
        setPrice('');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (orderType !== 'market' && (!price || parseFloat(price) <= 0)) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      symbol,
      side: orderSide,
      type: orderType,
      amount: parseFloat(amount),
      price: orderType !== 'market' ? parseFloat(price) : undefined,
      stopPrice: orderType.includes('stop') ? parseFloat(stopPrice) : undefined,
      leverage: parseFloat(leverage),
      reduceOnly,
      timeInForce
    };

    placeOrderMutation.mutate(orderData);
  };

  const getOrderEstimate = () => {
    if (!amount || !price) return null;
    
    const qty = parseFloat(amount);
    const orderPrice = parseFloat(price);
    const total = qty * orderPrice;
    const fee = total * 0.001; // 0.1% fee
    
    return {
      total,
      fee,
      netTotal: orderSide === 'buy' ? total + fee : total - fee
    };
  };

  const estimate = getOrderEstimate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Order Book */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Order Book - {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {/* Asks (Sell Orders) */}
            <div className="px-4">
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground font-medium mb-2">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Total</span>
              </div>
              {orderBook.asks.slice(0, 8).map((ask, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2 text-xs py-1 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                  onClick={() => setPrice(ask.price.toFixed(2))}
                >
                  <span className="text-red-500 font-mono">{ask.price.toFixed(2)}</span>
                  <span className="text-right font-mono">{ask.amount.toFixed(4)}</span>
                  <span className="text-right font-mono text-muted-foreground">{ask.total.toFixed(4)}</span>
                </div>
              ))}
            </div>
            
            {/* Spread */}
            <div className="px-4 py-2 bg-muted/50">
              <div className="text-center text-xs">
                <span className="text-muted-foreground">Spread: </span>
                <span className="font-mono">
                  {((orderBook.asks[0]?.price || 0) - (orderBook.bids[0]?.price || 0)).toFixed(2)}
                </span>
                <span className="text-muted-foreground ml-1">
                  ({(((orderBook.asks[0]?.price || 0) - (orderBook.bids[0]?.price || 0)) / currentPrice * 100).toFixed(3)}%)
                </span>
              </div>
            </div>
            
            {/* Bids (Buy Orders) */}
            <div className="px-4">
              {orderBook.bids.slice(0, 8).map((bid, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2 text-xs py-1 hover:bg-green-50 dark:hover:bg-green-950/20 cursor-pointer"
                  onClick={() => setPrice(bid.price.toFixed(2))}
                >
                  <span className="text-green-500 font-mono">{bid.price.toFixed(2)}</span>
                  <span className="text-right font-mono">{bid.amount.toFixed(4)}</span>
                  <span className="text-right font-mono text-muted-foreground">{bid.total.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Panel */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Trading Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Side Selector */}
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant={orderSide === 'buy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrderSide('buy')}
              className={orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              BUY
            </Button>
            <Button
              variant={orderSide === 'sell' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrderSide('sell')}
              className={orderSide === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <TrendingDown className="h-4 w-4 mr-1" />
              SELL
            </Button>
          </div>

          {/* Order Type */}
          <div className="space-y-2">
            <Label className="text-xs">Order Type</Label>
            <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Market
                  </div>
                </SelectItem>
                <SelectItem value="limit">
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    Limit
                  </div>
                </SelectItem>
                <SelectItem value="stop">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    Stop
                  </div>
                </SelectItem>
                <SelectItem value="stop_limit">
                  <div className="flex items-center gap-2">
                    <Settings className="h-3 w-3" />
                    Stop Limit
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-xs">Amount</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-8 font-mono"
            />
            <div className="grid grid-cols-4 gap-1">
              {['25%', '50%', '75%', '100%'].map((pct) => (
                <Button
                  key={pct}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    // Demo calculation - would use actual balance
                    const maxAmount = orderSide === 'buy' 
                      ? (10000 / currentPrice) * (parseFloat(pct) / 100) // $10k USD demo balance
                      : 5 * (parseFloat(pct) / 100); // 5 BTC demo balance
                    setAmount(maxAmount.toFixed(6));
                  }}
                >
                  {pct}
                </Button>
              ))}
            </div>
          </div>

          {/* Price (for limit orders) */}
          {orderType !== 'market' && (
            <div className="space-y-2">
              <Label className="text-xs">Price</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-8 font-mono pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  USD
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setPrice((currentPrice * 0.99).toFixed(2))}
                >
                  -1%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setPrice(currentPrice.toFixed(2))}
                >
                  Market
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setPrice((currentPrice * 1.01).toFixed(2))}
                >
                  +1%
                </Button>
              </div>
            </div>
          )}

          {/* Stop Price (for stop orders) */}
          {orderType.includes('stop') && (
            <div className="space-y-2">
              <Label className="text-xs">Stop Price</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                className="h-8 font-mono"
              />
            </div>
          )}

          {/* Advanced Options */}
          <div className="space-y-2">
            <Label className="text-xs">Time in Force</Label>
            <Select value={timeInForce} onValueChange={setTimeInForce}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GTC">Good Till Canceled</SelectItem>
                <SelectItem value="IOC">Immediate or Cancel</SelectItem>
                <SelectItem value="FOK">Fill or Kill</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order Estimate */}
          {estimate && (
            <div className="space-y-1 p-3 bg-muted rounded-md">
              <div className="text-xs font-medium">Order Estimate</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-mono">${estimate.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee (0.1%):</span>
                  <span className="font-mono">${estimate.fee.toFixed(2)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-medium">
                  <span>Net Total:</span>
                  <span className="font-mono">${estimate.netTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Place Order Button */}
          <Button
            onClick={handlePlaceOrder}
            disabled={placeOrderMutation.isPending || !amount}
            className={`w-full ${
              orderSide === 'buy' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {placeOrderMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Placing Order...
              </div>
            ) : (
              `${orderSide.toUpperCase()} ${symbol}`
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Trades */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Trades
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-96 overflow-y-auto">
            <div className="px-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground font-medium mb-2">
              <span>Price</span>
              <span className="text-right">Size</span>
              <span className="text-right">Time</span>
            </div>
            {recentTrades.slice(0, 30).map((trade, index) => (
              <div
                key={trade.id}
                className="px-4 grid grid-cols-3 gap-2 text-xs py-1 hover:bg-muted/50"
              >
                <span className={`font-mono ${
                  trade.side === 'buy' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {trade.price.toFixed(2)}
                </span>
                <span className="text-right font-mono">{trade.amount.toFixed(4)}</span>
                <span className="text-right text-muted-foreground">
                  {new Date(trade.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}