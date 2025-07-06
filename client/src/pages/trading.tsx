import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import TradingViewWidget from "@/components/charts/TradingViewWidget";
import ProfessionalTradingInterface from "@/components/trading/ProfessionalTradingInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <div className="flex-1 flex flex-col">
          {/* Chart Area */}
          <div className="flex-1 p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 relative overflow-hidden">
                <CardContent className="p-4 h-full relative">
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
                    <TradingViewWidget 
                      symbol={`BINANCE:${selectedTicker}`}
                      theme="dark"
                      height={600}
                      enableTrading={true}
                      showSignals={true}
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Professional Trading Interface */}
          <div className="p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <ProfessionalTradingInterface 
                symbol={selectedTicker}
                currentPrice={currentPrice}
              />
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}
