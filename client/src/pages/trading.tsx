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
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  Loader2
} from "lucide-react";

export default function TradingPage() {
  const { user } = useAuth();
  const [selectedTicker, setSelectedTicker] = useState("BTCUSDT");
  const [orderType, setOrderType] = useState("limit");
  const [orderAmount, setOrderAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [priceAnimationKey, setPriceAnimationKey] = useState(0);

  // Fetch market data
  const { data: marketData } = useQuery({
    queryKey: [`/api/market/price/${selectedTicker}`],
    refetchInterval: 2000,
  });

  const currentPrice = (marketData as any)?.price || 65755.0;
  const priceChange = (marketData as any)?.change24h || 2.34;

  // Trigger price animation when price changes
  useEffect(() => {
    setPriceAnimationKey(prev => prev + 1);
  }, [currentPrice]);

  // Chart loading simulation
  useEffect(() => {
    const timer = setTimeout(() => setChartLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-fill current price when switching to limit orders
  useEffect(() => {
    if (orderType === 'limit' && !limitPrice) {
      setLimitPrice(currentPrice.toString());
    }
  }, [orderType, currentPrice, limitPrice]);

  // Quick amount buttons
  const setQuickAmount = (percentage: number) => {
    const maxAmount = 10000 / (parseFloat(limitPrice) || currentPrice);
    const amount = (maxAmount * percentage / 100).toFixed(6);
    setOrderAmount(amount);
  };

  // Mock order book data matching reference design
  const orderBook = {
    bids: [
      { price: 65750.0, amount: 0.303, total: 19925.25 },
      { price: 65740.0, amount: 0.153, total: 10056.42 },
      { price: 65730.0, amount: 0.731, total: 48038.63 },
      { price: 65720.0, amount: 0.702, total: 45935.44 },
      { price: 65710.0, amount: 0.801, total: 52623.71 },
    ],
    asks: [
      { price: 65760.0, amount: 0.142, total: 9337.92 },
      { price: 65770.0, amount: 0.303, total: 19928.31 },
      { price: 65780.0, amount: 0.157, total: 10327.46 },
      { price: 65790.0, amount: 0.702, total: 46184.58 },
      { price: 65800.0, amount: 0.801, total: 52665.80 },
    ]
  };

  // Mock market trades
  const marketTrades = [
    { id: 1, side: "buy", price: 65755.0, amount: 0.125, time: "14:32:01" },
    { id: 2, side: "sell", price: 65750.0, amount: 0.203, time: "14:31:58" },
    { id: 3, side: "buy", price: 65760.0, amount: 0.085, time: "14:31:55" },
    { id: 4, side: "sell", price: 65745.0, amount: 0.156, time: "14:31:52" },
    { id: 5, side: "buy", price: 65755.0, amount: 0.298, time: "14:31:49" },
  ];

  const handleOrder = async (side: 'buy' | 'sell') => {
    if (!orderAmount || (!limitPrice && orderType === 'limit')) {
      alert('Please fill in all required fields');
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Order placed:", {
        side,
        ticker: selectedTicker,
        type: orderType,
        amount: orderAmount,
        price: orderType === 'limit' ? limitPrice : currentPrice
      });
      
      setOrderSuccess(true);
      setOrderAmount("");
      setLimitPrice("");
      
      // Reset success state after 3 seconds
      setTimeout(() => setOrderSuccess(false), 3000);
      
    } catch (error) {
      console.error('Order failed:', error);
    } finally {
      setIsPlacingOrder(false);
    }
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
                  <motion.div
                    key={priceAnimationKey}
                    initial={{ scale: 0.95, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-2xl font-bold"
                  >
                    ${currentPrice.toLocaleString()}
                  </motion.div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <motion.div 
                    key={`change-${priceAnimationKey}`}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  >
                    <motion.div
                      animate={{ rotate: priceChange >= 0 ? 0 : 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      {priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </motion.div>
                    <span className="font-medium">{priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%</span>
                  </motion.div>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 relative overflow-hidden">
                  <CardContent className="p-0 h-full relative">
                    <AnimatePresence>
                      {!chartLoaded && (
                        <motion.div
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm"
                        >
                          <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <div className="text-sm text-muted-foreground">Loading TradingView Chart...</div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: chartLoaded ? 1 : 0.5 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full"
                    >
                      <TradingViewRealWidget ticker={selectedTicker} />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Right Sidebar - Order Book & Trading */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="w-96 flex flex-col border-l bg-card/30 backdrop-blur-sm"
          >
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
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="grid grid-cols-3 gap-2 text-xs hover:bg-red-500/5 p-1 rounded transition-colors duration-200"
                      >
                        <motion.div 
                          className="text-red-400 font-mono"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.1 }}
                        >
                          {ask.price.toLocaleString()}
                        </motion.div>
                        <div className="text-right font-mono">{ask.amount.toFixed(3)}</div>
                        <div className="text-right font-mono">{ask.total.toFixed(0)}</div>
                      </motion.div>
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
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (index + 5) * 0.05 }}
                        className="grid grid-cols-3 gap-2 text-xs hover:bg-green-500/5 p-1 rounded transition-colors duration-200"
                      >
                        <motion.div 
                          className="text-green-400 font-mono"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.1 }}
                        >
                          {bid.price.toLocaleString()}
                        </motion.div>
                        <div className="text-right font-mono">{bid.amount.toFixed(3)}</div>
                        <div className="text-right font-mono">{bid.total.toFixed(0)}</div>
                      </motion.div>
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
                            disabled={orderType === 'market'}
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
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => setQuickAmount(25)} className="flex-1 text-xs">25%</Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickAmount(50)} className="flex-1 text-xs">50%</Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickAmount(75)} className="flex-1 text-xs">75%</Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickAmount(100)} className="flex-1 text-xs">Max</Button>
                          </div>
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
                        
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.1 }}
                        >
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200"
                            onClick={() => handleOrder('buy')}
                            disabled={isPlacingOrder}
                          >
                            <AnimatePresence mode="wait">
                              {isPlacingOrder ? (
                                <motion.div
                                  key="placing"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center gap-2"
                                >
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Placing Order...
                                </motion.div>
                              ) : orderSuccess ? (
                                <motion.div
                                  key="success"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="flex items-center gap-2"
                                >
                                  ✓ Order Placed!
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="default"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  Buy BTC
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </motion.div>
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
                            disabled={orderType === 'market'}
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
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => setQuickAmount(25)} className="flex-1 text-xs">25%</Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickAmount(50)} className="flex-1 text-xs">50%</Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickAmount(75)} className="flex-1 text-xs">75%</Button>
                            <Button variant="outline" size="sm" onClick={() => setQuickAmount(100)} className="flex-1 text-xs">Max</Button>
                          </div>
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
                        
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.1 }}
                        >
                          <Button 
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200"
                            onClick={() => handleOrder('sell')}
                            disabled={isPlacingOrder}
                          >
                            <AnimatePresence mode="wait">
                              {isPlacingOrder ? (
                                <motion.div
                                  key="placing"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center gap-2"
                                >
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Placing Order...
                                </motion.div>
                              ) : orderSuccess ? (
                                <motion.div
                                  key="success"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="flex items-center gap-2"
                                >
                                  ✓ Order Placed!
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="default"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  Sell BTC
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </motion.div>
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}