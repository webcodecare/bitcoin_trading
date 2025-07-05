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

declare global {
  interface Window {
    TradingView: any;
  }
}

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

export default function TradingViewWidget({ 
  symbol = 'BINANCE:BTCUSDT', 
  theme = 'dark',
  height = 600,
  enableTrading = true,
  showSignals = true
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeMode, setTradeMode] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Get current price and signals
  const { data: priceData } = useQuery({
    queryKey: [`/api/market/price/${symbol.split(':')[1] || 'BTCUSDT'}`],
    refetchInterval: 5000,
  });

  const { data: signals } = useQuery({
    queryKey: ['/api/signals'],
    enabled: isAuthenticated && showSignals,
    refetchInterval: 10000,
  });

  const { data: portfolio } = useQuery({
    queryKey: ['/api/user/portfolio'],
    enabled: isAuthenticated,
  });

  const { data: tradingSettings } = useQuery({
    queryKey: ['/api/user/trading-settings'],
    enabled: isAuthenticated,
  });

  // Trading mutations
  const executeTradeMutation = useMutation({
    mutationFn: async (tradeData: {
      ticker: string;
      type: 'buy' | 'sell';
      amount: string;
      price?: string;
      mode: 'market' | 'limit';
    }) => {
      const response = await apiRequest('POST', '/api/trading/execute', tradeData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Trade Executed",
        description: `${data.type.toUpperCase()} order for ${data.amount} ${data.ticker} completed`,
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

  // Load TradingView script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize TradingView widget
  useEffect(() => {
    if (isLoaded && containerRef.current && window.TradingView) {
      // Clear existing widget
      if (widgetRef.current) {
        widgetRef.current.remove();
      }

      widgetRef.current = new window.TradingView.widget({
        width: '100%',
        height: height - 150, // Leave space for trading controls
        symbol: symbol,
        interval: '15',
        timezone: 'Etc/UTC',
        theme: theme,
        style: '1',
        locale: 'en',
        toolbar_bg: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: containerRef.current.id,
        studies: [
          'Volume@tv-basicstudies',
          'RSI@tv-basicstudies',
        ],
        overrides: {
          'paneProperties.background': theme === 'dark' ? '#0a0a0a' : '#ffffff',
          'paneProperties.vertGridProperties.color': theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
          'paneProperties.horzGridProperties.color': theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
          'symbolWatermarkProperties.transparency': 90,
          'scalesProperties.textColor': theme === 'dark' ? '#d1d5db' : '#374151',
        },
        loading_screen: {
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
          foregroundColor: theme === 'dark' ? '#ffffff' : '#000000'
        },
        disabled_features: [
          'use_localstorage_for_settings',
          'save_chart_properties_to_local_storage'
        ],
        enabled_features: [
          'study_templates',
          'side_toolbar_in_fullscreen_mode'
        ]
      });
    }
  }, [isLoaded, symbol, theme, height]);

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to execute trades",
        variant: "destructive",
      });
      return;
    }

    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid trade amount",
        variant: "destructive",
      });
      return;
    }

    if (tradeMode === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid limit price",
        variant: "destructive",
      });
      return;
    }

    const ticker = symbol.split(':')[1] || 'BTCUSDT';
    
    await executeTradeMutation.mutateAsync({
      ticker,
      type,
      amount: tradeAmount,
      price: tradeMode === 'limit' ? limitPrice : undefined,
      mode: tradeMode,
    });
  };

  const currentPrice = priceData?.price || 0;
  const currentTicker = symbol.split(':')[1] || 'BTCUSDT';
  const tickerPortfolio = portfolio?.find((p: any) => p.ticker === currentTicker);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {currentTicker} Trading Chart
          </CardTitle>
          <div className="flex items-center gap-4">
            {priceData && (
              <Badge variant="outline" className="text-lg px-3 py-1">
                <DollarSign className="h-4 w-4 mr-1" />
                ${parseFloat(priceData.price).toLocaleString()}
              </Badge>
            )}
            {showSignals && signals && signals.length > 0 && (
              <Badge variant="secondary">
                {signals.length} Active Signals
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* TradingView Chart Container */}
        <div 
          ref={containerRef}
          id={`tradingview-widget-${symbol.replace(':', '-')}`}
          className="w-full bg-background border rounded-lg"
          style={{ height: height - 150 }}
        >
          {!isLoaded && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {/* Trading Controls */}
        {enableTrading && (
          <Tabs defaultValue="trade" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trade" className="text-xs sm:text-sm">Trade</TabsTrigger>
              <TabsTrigger value="portfolio" className="text-xs sm:text-sm">Portfolio</TabsTrigger>
              <TabsTrigger value="signals" className="text-xs sm:text-sm">Signals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trade" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="trade-mode" className="text-sm font-medium">Order Type</Label>
                    <Select value={tradeMode} onValueChange={(value: 'market' | 'limit') => setTradeMode(value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market Order</SelectItem>
                        <SelectItem value="limit">Limit Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="trade-amount" className="text-sm font-medium">Amount</Label>
                    <Input
                      id="trade-amount"
                      type="number"
                      placeholder="0.00"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      className="h-10 text-base"
                    />
                  </div>
                  
                  {tradeMode === 'limit' && (
                    <div>
                      <Label htmlFor="limit-price" className="text-sm font-medium">Limit Price</Label>
                      <Input
                        id="limit-price"
                        type="number"
                        placeholder={currentPrice.toString()}
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        min="0"
                        step="0.01"
                        className="h-10 text-base"
                      />
                    </div>
                  )}
                  
                  {/* Quick Amount Buttons */}
                  <div className="quick-amount-buttons grid grid-cols-4 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setTradeAmount('0.01')}
                      className="text-xs h-8 min-h-[44px] sm:min-h-[32px]"
                    >
                      0.01
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setTradeAmount('0.1')}
                      className="text-xs h-8 min-h-[44px] sm:min-h-[32px]"
                    >
                      0.1
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setTradeAmount('1')}
                      className="text-xs h-8 min-h-[44px] sm:min-h-[32px]"
                    >
                      1.0
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setTradeAmount('10')}
                      className="text-xs h-8 min-h-[44px] sm:min-h-[32px]"
                    >
                      10
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="buy-sell-buttons grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleTrade('buy')}
                      disabled={!isAuthenticated || executeTradeMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 h-12 text-base font-semibold min-h-[48px]"
                      size="lg"
                    >
                      <TrendingUp className="h-5 w-5 mr-2" />
                      {executeTradeMutation.isPending ? 'Processing...' : 'BUY'}
                    </Button>
                    <Button
                      onClick={() => handleTrade('sell')}
                      disabled={!isAuthenticated || executeTradeMutation.isPending}
                      variant="destructive"
                      className="h-12 text-base font-semibold min-h-[48px]"
                      size="lg"
                    >
                      <TrendingDown className="h-5 w-5 mr-2" />
                      {executeTradeMutation.isPending ? 'Processing...' : 'SELL'}
                    </Button>
                  </div>
                  
                  {!isAuthenticated && (
                    <div className="bg-muted border border-border p-4 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Authentication required to trade
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/login">Log In</a>
                      </Button>
                    </div>
                  )}
                  
                  {tradeAmount && currentPrice && (
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Estimated Total:</span>
                        <span className="font-semibold text-lg">
                          ${(parseFloat(tradeAmount) * currentPrice).toFixed(2)}
                        </span>
                      </div>
                      {tradeMode === 'market' && (
                        <p className="text-xs text-muted-foreground">Market price execution</p>
                      )}
                      {tradeMode === 'limit' && limitPrice && (
                        <p className="text-xs text-muted-foreground">
                          Limit order at ${parseFloat(limitPrice).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="portfolio" className="space-y-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  {tickerPortfolio ? (
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-semibold">{currentTicker} Position</h3>
                      <p>Holdings: {tickerPortfolio.quantity}</p>
                      <p>Avg Price: ${parseFloat(tickerPortfolio.averagePrice).toFixed(2)}</p>
                      <p className={`font-semibold ${parseFloat(tickerPortfolio.totalPnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        P&L: ${parseFloat(tickerPortfolio.totalPnl).toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No position in {currentTicker}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Log in to view portfolio</p>
              )}
            </TabsContent>
            
            <TabsContent value="signals" className="space-y-4">
              {showSignals && signals && signals.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {signals.slice(0, 5).map((signal: Signal) => (
                    <div key={signal.id} className="flex items-center justify-between bg-muted p-2 rounded">
                      <div className="flex items-center gap-2">
                        {signal.type === 'buy' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{signal.ticker}</span>
                        <Badge variant={signal.type === 'buy' ? 'default' : 'destructive'}>
                          {signal.type.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-sm">${parseFloat(signal.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No active signals</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}