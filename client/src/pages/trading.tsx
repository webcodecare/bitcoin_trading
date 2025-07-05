import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import TradingViewWidget from "@/components/charts/TradingViewWidget";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  DollarSign,
  Target,
  Clock,
  AlertTriangle
} from "lucide-react";

export default function Trading() {
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");
  const { user, isAuthenticated } = useAuth();

  const { data: tickers } = useQuery({
    queryKey: ['/api/tickers/enabled'],
  });

  const { data: portfolio } = useQuery({
    queryKey: ['/api/user/portfolio'],
    enabled: isAuthenticated,
  });

  const { data: recentTrades } = useQuery({
    queryKey: ['/api/user/trades'],
    enabled: isAuthenticated,
  });

  const { data: signals } = useQuery({
    queryKey: ['/api/signals'],
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  const symbols = [
    { value: "BINANCE:BTCUSDT", label: "BTC/USDT", name: "Bitcoin" },
    { value: "BINANCE:ETHUSDT", label: "ETH/USDT", name: "Ethereum" },
    { value: "BINANCE:SOLUSDT", label: "SOL/USDT", name: "Solana" },
    { value: "BINANCE:ADAUSDT", label: "ADA/USDT", name: "Cardano" },
    { value: "BINANCE:DOTUSDT", label: "DOT/USDT", name: "Polkadot" },
    { value: "BINANCE:LINKUSDT", label: "LINK/USDT", name: "Chainlink" },
    { value: "BINANCE:AVAXUSDT", label: "AVAX/USDT", name: "Avalanche" },
    { value: "BINANCE:MATICUSDT", label: "MATIC/USDT", name: "Polygon" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-1 bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Please log in to access the trading interface and execute trades.
                </p>
                <div className="space-x-4">
                  <Button asChild size="lg">
                    <a href="/login">Log In</a>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="/">Back to Home</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Professional Trading</h1>
                <p className="text-muted-foreground">
                  Advanced charting with real-time buy/sell execution
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {symbols.map((symbol) => (
                      <SelectItem key={symbol.value} value={symbol.value}>
                        {symbol.label} - {symbol.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {user && (
                  <Badge variant="outline" className="px-3 py-1">
                    <Activity className="h-4 w-4 mr-2" />
                    {user.role === 'admin' ? 'Admin' : 'Trader'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Trading Chart */}
            <div className="lg:col-span-3">
              <TradingViewWidget
                symbol={selectedSymbol}
                height={700}
                enableTrading={true}
                showSignals={true}
                theme="dark"
              />
            </div>

            {/* Trading Panel */}
            <div className="space-y-6">
              {/* Portfolio Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {portfolio && portfolio.length > 0 ? (
                    portfolio.slice(0, 5).map((position: any) => (
                      <div key={position.ticker} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{position.ticker}</span>
                        <div className="text-right">
                          <div>{position.quantity}</div>
                          <div className={`text-xs ${parseFloat(position.totalPnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {parseFloat(position.totalPnl) >= 0 ? '+' : ''}${parseFloat(position.totalPnl).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No positions</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Signals */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" />
                    Live Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {signals && signals.length > 0 ? (
                    signals.slice(0, 5).map((signal: any) => (
                      <div key={signal.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div className="flex items-center gap-2">
                          {signal.type === 'buy' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <div>
                            <div className="font-medium text-sm">{signal.ticker}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(signal.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={signal.type === 'buy' ? 'default' : 'destructive'} className="text-xs">
                            {signal.type.toUpperCase()}
                          </Badge>
                          <div className="text-xs mt-1">${parseFloat(signal.price).toFixed(2)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No active signals</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Trades */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Recent Trades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentTrades && recentTrades.length > 0 ? (
                    recentTrades.slice(0, 5).map((trade: any) => (
                      <div key={trade.id} className="flex items-center justify-between text-sm">
                        <div>
                          <div className="font-medium">{trade.ticker}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(trade.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'} className="text-xs">
                            {trade.type.toUpperCase()}
                          </Badge>
                          <div className="text-xs mt-1">{trade.amount} @ ${parseFloat(trade.price).toFixed(2)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent trades</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline" asChild>
                    <a href="/dashboard">View Dashboard</a>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <a href="/multi-ticker">Multi-Ticker View</a>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <a href="/settings">Trading Settings</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Trading Tools */}
          <div className="mt-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orderbook">Order Book</TabsTrigger>
                <TabsTrigger value="trades">Trade History</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Portfolio</p>
                          <p className="text-2xl font-bold">
                            ${portfolio?.reduce((acc: number, pos: any) => acc + parseFloat(pos.totalValue || 0), 0).toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total P&L</p>
                          <p className={`text-2xl font-bold ${portfolio?.reduce((acc: number, pos: any) => acc + parseFloat(pos.totalPnl || 0), 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {portfolio?.reduce((acc: number, pos: any) => acc + parseFloat(pos.totalPnl || 0), 0) >= 0 ? '+' : ''}
                            ${portfolio?.reduce((acc: number, pos: any) => acc + parseFloat(pos.totalPnl || 0), 0).toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Positions</p>
                          <p className="text-2xl font-bold">{portfolio?.length || 0}</p>
                        </div>
                        <Activity className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Today's Trades</p>
                          <p className="text-2xl font-bold">
                            {recentTrades?.filter((trade: any) => 
                              new Date(trade.timestamp).toDateString() === new Date().toDateString()
                            ).length || 0}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="orderbook" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      Order book functionality coming soon. Use the trading chart above for market orders and limit orders.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="trades" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    {recentTrades && recentTrades.length > 0 ? (
                      <div className="space-y-2">
                        {recentTrades.map((trade: any) => (
                          <div key={trade.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              {trade.type === 'buy' ? (
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-red-600" />
                              )}
                              <div>
                                <div className="font-medium">{trade.ticker}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(trade.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{trade.amount} @ ${parseFloat(trade.price).toFixed(2)}</div>
                              <div className="text-sm text-muted-foreground">
                                Total: ${(parseFloat(trade.amount) * parseFloat(trade.price)).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">No trade history available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analysis" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      Advanced analysis tools coming soon. Currently available through the TradingView chart above.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}