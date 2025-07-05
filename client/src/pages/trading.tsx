import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import TradingViewRealWidget from "@/components/charts/TradingViewRealWidget";
import OrderBook from "@/components/trading/OrderBook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  Clock,
  Target,
  BarChart3
} from "lucide-react";

export default function TradingPage() {
  const { user } = useAuth();
  const [selectedTicker, setSelectedTicker] = useState("BTCUSDT");
  const [orderType, setOrderType] = useState("market");
  const [orderAmount, setOrderAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");

  // Fetch market data
  const { data: marketData } = useQuery({
    queryKey: [`/api/market/price/${selectedTicker}`],
    refetchInterval: 2000,
  });

  // Mock portfolio data
  const portfolio = [
    { symbol: "BTC", amount: "0.5432", valueUSD: "36,890", change24h: "+2.34%" },
    { symbol: "ETH", amount: "12.34", valueUSD: "43,200", change24h: "-1.23%" },
    { symbol: "SOL", amount: "245.67", valueUSD: "24,567", change24h: "+5.67%" },
  ];

  // Mock recent trades
  const recentTrades = [
    { id: 1, side: "buy", symbol: "BTC", amount: "0.1", price: "67,500", time: "14:32:01" },
    { id: 2, side: "sell", symbol: "ETH", amount: "2.5", price: "3,450", time: "14:28:45" },
    { id: 3, side: "buy", symbol: "SOL", amount: "50", price: "98.50", time: "14:25:12" },
  ];

  const handleTrade = (side: 'buy' | 'sell') => {
    console.log(`${side} order: ${orderAmount} ${selectedTicker} at ${orderType} ${limitPrice || 'market'}`);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Professional Trading Terminal</h1>
              <p className="text-muted-foreground">Advanced trading with TradingView charts</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedTicker} onValueChange={setSelectedTicker}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                  <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                  <SelectItem value="SOLUSDT">SOL/USDT</SelectItem>
                  <SelectItem value="ADAUSDT">ADA/USDT</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline">Live Trading</Badge>
            </div>
          </div>
        </header>

        {/* Main Trading Interface */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 h-full">
            {/* Chart Area */}
            <div className="xl:col-span-3">
              <TradingViewRealWidget 
                ticker={selectedTicker}
                onTrade={(action, price) => {
                  console.log(`Quick ${action} at ${price}`);
                }}
              />
            </div>

            {/* Trading Sidebar */}
            <div className="xl:col-span-2 space-y-6">
              {/* Order Book */}
              <OrderBook symbol={selectedTicker} />

              {/* Advanced Order Panel */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Trading</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Type Selection */}
                  <div>
                    <Label className="text-sm font-medium">Order Type</Label>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        variant={orderType === 'market' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOrderType('market')}
                        className="flex-1"
                      >
                        Market
                      </Button>
                      <Button
                        variant={orderType === 'limit' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOrderType('limit')}
                        className="flex-1"
                      >
                        Limit
                      </Button>
                      <Button
                        variant={orderType === 'stop' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOrderType('stop')}
                        className="flex-1"
                      >
                        Stop
                      </Button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <Label htmlFor="amount">Amount (USDT)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex space-x-1 mt-2">
                      {["25%", "50%", "75%", "Max"].map((pct) => (
                        <Button
                          key={pct}
                          variant="ghost"
                          size="sm"
                          className="text-xs flex-1"
                          onClick={() => setOrderAmount((1000 * parseInt(pct) / 100).toString())}
                        >
                          {pct}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Limit Price (if limit order) */}
                  {orderType === 'limit' && (
                    <div>
                      <Label htmlFor="price">Limit Price</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}

                  {/* Buy/Sell Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleTrade('buy')}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      BUY
                    </Button>
                    <Button
                      onClick={() => handleTrade('sell')}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-3"
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      SELL
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {portfolio.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-sm text-muted-foreground">{asset.amount}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${asset.valueUSD}</div>
                        <div className={`text-sm ${asset.change24h.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {asset.change24h}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTrades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <Badge variant={trade.side === 'buy' ? 'default' : 'destructive'}>
                          {trade.side.toUpperCase()}
                        </Badge>
                        <div>
                          <div className="font-medium">{trade.symbol}</div>
                          <div className="text-sm text-muted-foreground">{trade.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{trade.amount}</div>
                        <div className="text-sm text-muted-foreground">${trade.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}