import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import TradingViewRealWidget from "@/components/charts/TradingViewRealWidget";
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
  const [orderType, setOrderType] = useState("limit");
  const [orderAmount, setOrderAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");

  // Fetch market data
  const { data: marketData } = useQuery({
    queryKey: [`/api/market/price/${selectedTicker}`],
    refetchInterval: 2000,
  });

  // Mock order book data matching reference design
  const orderBook = {
    bids: [
      { price: 65750.0, amount: 0.303, total: 19925.25 },
      { price: 65740.0, amount: 0.153, total: 10056.42 },
      { price: 65730.0, amount: 0.731, total: 48038.63 },
      { price: 65720.0, amount: 0.702, total: 45935.44 },
      { price: 65710.0, amount: 0.801, total: 52623.71 },
      { price: 65700.0, amount: 0.527, total: 34623.90 },
      { price: 65690.0, amount: 0.034, total: 2233.46 },
      { price: 65680.0, amount: 0.153, total: 10049.04 },
      { price: 65670.0, amount: 0.731, total: 48014.77 },
      { price: 65660.0, amount: 0.366, total: 24031.56 },
    ],
    asks: [
      { price: 65760.0, amount: 0.142, total: 9337.92 },
      { price: 65770.0, amount: 0.303, total: 19928.31 },
      { price: 65780.0, amount: 0.157, total: 10327.46 },
      { price: 65790.0, amount: 0.702, total: 46184.58 },
      { price: 65800.0, amount: 0.801, total: 52665.80 },
      { price: 65810.0, amount: 0.527, total: 34681.87 },
      { price: 65820.0, amount: 0.034, total: 2237.88 },
      { price: 65830.0, amount: 0.153, total: 10072.00 },
      { price: 65840.0, amount: 0.731, total: 48119.04 },
      { price: 65850.0, amount: 0.366, total: 24101.10 },
    ]
  };

  // Mock market trades
  const marketTrades = [
    { id: 1, side: "buy", price: 65755.0, amount: 0.125, time: "14:32:01", total: 8219.38 },
    { id: 2, side: "sell", price: 65750.0, amount: 0.203, time: "14:31:58", total: 13347.25 },
    { id: 3, side: "buy", price: 65760.0, amount: 0.085, time: "14:31:55", total: 5589.60 },
    { id: 4, side: "sell", price: 65745.0, amount: 0.156, time: "14:31:52", total: 10256.22 },
    { id: 5, side: "buy", price: 65755.0, amount: 0.298, time: "14:31:49", total: 19594.99 },
  ];

  const currentPrice = marketData?.price || 65755.0;
  const priceChange = marketData?.change24h || 2.34;

  const handleOrder = () => {
    console.log("Order placed:", {
      ticker: selectedTicker,
      type: orderType,
      amount: orderAmount,
      price: limitPrice
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  B
                </div>
                <div>
                  <h1 className="text-xl font-bold">BTC-USDT</h1>
                  <p className="text-sm text-muted-foreground">Bitcoin</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Last Price</p>
                  <p className="text-2xl font-bold">${currentPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-medium">{priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h High</p>
                  <p className="font-medium">${(currentPrice * 1.02).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Low</p>
                  <p className="font-medium">${(currentPrice * 0.98).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="font-medium">{Math.floor(Math.random() * 100000)}.{Math.floor(Math.random() * 1000)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Chart Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4">
              <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-0 h-full">
                  <TradingViewRealWidget 
                    symbol={selectedTicker}
                    theme="dark"
                    height="100%"
                    width="100%"
                    interval="1D"
                    timezone="Etc/UTC"
                    style="1"
                    locale="en"
                    toolbar_bg="rgba(15, 23, 42, 1)"
                    enable_publishing={false}
                    backgroundColor="rgba(15, 23, 42, 1)"
                    gridColor="rgba(42, 46, 57, 0.5)"
                    hide_top_toolbar={false}
                    hide_legend={false}
                    save_image={false}
                    container_id="tradingview_chart"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Sidebar - Order Book & Trading */}
          <div className="w-96 flex flex-col border-l bg-card/30 backdrop-blur-sm">
            {/* Order Book */}
            <div className="flex-1 p-4">
              <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Order Book</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Book Headers */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground font-medium">
                    <div>Price</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Total</div>
                  </div>
                  
                  {/* Asks (Sell Orders) */}
                  <div className="space-y-0.5">
                    {orderBook.asks.slice(0, 5).reverse().map((ask, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 text-xs hover:bg-red-500/5 p-1 rounded">
                        <div className="text-red-400 font-mono">{ask.price.toLocaleString()}</div>
                        <div className="text-right font-mono">{ask.amount.toFixed(3)}</div>
                        <div className="text-right font-mono">{ask.total.toFixed(0)}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Spread */}
                  <div className="flex items-center justify-between py-2 border-y border-border/50">
                    <div className="text-xs text-muted-foreground">Spread</div>
                    <div className="text-xs font-mono">{(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(1)}</div>
                  </div>
                  
                  {/* Bids (Buy Orders) */}
                  <div className="space-y-0.5">
                    {orderBook.bids.slice(0, 5).map((bid, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 text-xs hover:bg-green-500/5 p-1 rounded">
                        <div className="text-green-400 font-mono">{bid.price.toLocaleString()}</div>
                        <div className="text-right font-mono">{bid.amount.toFixed(3)}</div>
                        <div className="text-right font-mono">{bid.total.toFixed(0)}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Volume Distribution */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-green-400">43.33%</div>
                    <div className="text-red-400">56.67%</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trading Panel */}
            <div className="p-4 border-t">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <Tabs defaultValue="buy" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-background/50 mb-4">
                      <TabsTrigger 
                        value="buy" 
                        className="text-green-400 data-[state=active]:bg-green-400/10 data-[state=active]:text-green-400"
                      >
                        Buy
                      </TabsTrigger>
                      <TabsTrigger 
                        value="sell" 
                        className="text-red-400 data-[state=active]:bg-red-400/10 data-[state=active]:text-red-400"
                      >
                        Sell
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex gap-2 mb-4">
                      <Button 
                        variant={orderType === 'limit' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => setOrderType('limit')}
                        className="flex-1"
                      >
                        Limit
                      </Button>
                      <Button 
                        variant={orderType === 'market' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => setOrderType('market')}
                        className="flex-1"
                      >
                        Market
                      </Button>
                    </div>
                    
                    <TabsContent value="buy" className="space-y-4 mt-0">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs text-muted-foreground">Price</Label>
                            <span className="text-xs text-muted-foreground">USDT</span>
                          </div>
                          <Input 
                            type="number" 
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(e.target.value)}
                            placeholder={currentPrice.toString()}
                            className="bg-background/50 border-border/50 text-sm"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs text-muted-foreground">Amount</Label>
                            <span className="text-xs text-muted-foreground">BTC</span>
                          </div>
                          <Input 
                            type="number" 
                            value={orderAmount}
                            onChange={(e) => setOrderAmount(e.target.value)}
                            placeholder="0.00"
                            className="bg-background/50 border-border/50 text-sm"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs text-muted-foreground">Total</Label>
                            <span className="text-xs text-muted-foreground">USDT</span>
                          </div>
                          <Input 
                            type="number" 
                            value={parseFloat(orderAmount || "0") * parseFloat(limitPrice || currentPrice.toString())}
                            disabled
                            className="bg-muted/50 border-border/50 text-sm"
                          />
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-between">
                            <span>Est. fee:</span>
                            <span>
                              {(parseFloat(orderAmount || "0") * parseFloat(limitPrice || currentPrice.toString()) * 0.001).toFixed(4)} USDT
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max buy:</span>
                            <span>0.000 BTC</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                          onClick={handleOrder}
                        >
                          Buy BTC
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sell" className="space-y-4 mt-0">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs text-muted-foreground">Price</Label>
                            <span className="text-xs text-muted-foreground">USDT</span>
                          </div>
                          <Input 
                            type="number" 
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(e.target.value)}
                            placeholder={currentPrice.toString()}
                            className="bg-background/50 border-border/50 text-sm"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs text-muted-foreground">Amount</Label>
                            <span className="text-xs text-muted-foreground">BTC</span>
                          </div>
                          <Input 
                            type="number" 
                            value={orderAmount}
                            onChange={(e) => setOrderAmount(e.target.value)}
                            placeholder="0.00"
                            className="bg-background/50 border-border/50 text-sm"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs text-muted-foreground">Total</Label>
                            <span className="text-xs text-muted-foreground">USDT</span>
                          </div>
                          <Input 
                            type="number" 
                            value={parseFloat(orderAmount || "0") * parseFloat(limitPrice || currentPrice.toString())}
                            disabled
                            className="bg-muted/50 border-border/50 text-sm"
                          />
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-between">
                            <span>Est. fee:</span>
                            <span>
                              {(parseFloat(orderAmount || "0") * parseFloat(limitPrice || currentPrice.toString()) * 0.001).toFixed(4)} USDT
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max sell:</span>
                            <span>0.000 BTC</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
                          onClick={handleOrder}
                        >
                          Sell BTC
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Market Trades */}
            <div className="p-4 border-t">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Market Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {marketTrades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between text-xs">
                        <div className={`font-mono ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.price.toLocaleString()}
                        </div>
                        <div className="font-mono text-muted-foreground">
                          {trade.amount.toFixed(3)}
                        </div>
                        <div className="font-mono text-muted-foreground text-right">
                          {trade.time}
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
    </div>
  );
}