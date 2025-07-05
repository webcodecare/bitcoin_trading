import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle, Target, PieChart } from "lucide-react";
import ProfessionalTradingChart from "@/components/charts/ProfessionalTradingChart";

interface Trade {
  id: string;
  userId: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: string;
  status: 'EXECUTED' | 'PENDING' | 'CANCELLED';
  signalId?: string;
  pnl?: number;
}

interface Portfolio {
  id: string;
  userId: string;
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
}

interface TradingSettings {
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  maxTradeAmount: number;
  autoTrading: boolean;
  stopLoss: number;
  takeProfit: number;
}

export default function Trading() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicker, setSelectedTicker] = useState('BTCUSDT');
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradingMode, setTradingMode] = useState<'paper' | 'live'>('paper');

  // Fetch available tickers
  const { data: tickers } = useQuery({
    queryKey: ['/api/tickers'],
  });

  // Fetch user's portfolio
  const { data: portfolio } = useQuery({
    queryKey: [`/api/trading/portfolio`],
    enabled: isAuthenticated,
  });

  // Fetch trade history
  const { data: tradeHistory } = useQuery({
    queryKey: [`/api/trading/history`],
    enabled: isAuthenticated,
  });

  // Fetch trading settings
  const { data: settings } = useQuery({
    queryKey: [`/api/trading/settings`],
    enabled: isAuthenticated,
  });

  // Fetch current signals
  const { data: signals } = useQuery({
    queryKey: [`/api/signals`],
    enabled: isAuthenticated,
  });

  // Fetch current market price
  const { data: currentPrice } = useQuery({
    queryKey: [`/api/market/price/${selectedTicker}`],
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Execute trade mutation
  const executeTradeMutation = useMutation({
    mutationFn: async (tradeData: {
      ticker: string;
      type: 'BUY' | 'SELL';
      amount: number;
      price: number;
      mode: 'paper' | 'live';
    }) => {
      return await apiRequest('POST', '/api/trading/execute', tradeData);
    },
    onSuccess: () => {
      toast({
        title: "Trade Executed",
        description: "Your trade has been successfully executed",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trading/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trading/history'] });
      setTradeAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Trade Failed",
        description: error.message || "Failed to execute trade",
        variant: "destructive",
      });
    },
  });

  // Update trading settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<TradingSettings>) => {
      return await apiRequest('PUT', '/api/trading/settings', settings);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your trading settings have been saved",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trading/settings'] });
    },
  });

  const handleTrade = (type: 'BUY' | 'SELL') => {
    if (!tradeAmount || !currentPrice) {
      toast({
        title: "Invalid Trade",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    executeTradeMutation.mutate({
      ticker: selectedTicker,
      type,
      amount: parseFloat(tradeAmount),
      price: currentPrice.price,
      mode: tradingMode,
    });
  };

  const calculatePortfolioValue = () => {
    if (!portfolio) return 0;
    return portfolio.reduce((total: number, position: Portfolio) => total + position.currentValue, 0);
  };

  const calculateTotalPnL = () => {
    if (!portfolio) return { pnl: 0, percentage: 0 };
    const totalPnL = portfolio.reduce((total: number, position: Portfolio) => total + position.pnl, 0);
    const totalValue = calculatePortfolioValue();
    const percentage = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;
    return { pnl: totalPnL, percentage };
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the trading platform.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalPnL = calculateTotalPnL();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trading Platform</h1>
          <p className="text-muted-foreground">
            Execute trades based on professional signals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={tradingMode} onValueChange={(value: 'paper' | 'live') => setTradingMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paper">Paper Trading</SelectItem>
              <SelectItem value="live">Live Trading</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant={tradingMode === 'paper' ? 'secondary' : 'default'}>
            {tradingMode === 'paper' ? 'SIMULATION' : 'LIVE TRADING'}
          </Badge>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculatePortfolioValue().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {tradingMode === 'paper' ? 'Simulated' : 'Live'} portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalPnL.pnl >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(totalPnL.pnl).toLocaleString()}
            </div>
            <p className={`text-xs ${totalPnL.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnL.pnl >= 0 ? '+' : '-'}{Math.abs(totalPnL.percentage).toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Open positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{signals?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available signals
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trade" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trade">Execute Trade</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="trade" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trading Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Execute Trade</CardTitle>
                <CardDescription>
                  Place trades based on professional signals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticker">Cryptocurrency</Label>
                  <Select value={selectedTicker} onValueChange={setSelectedTicker}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tickers?.map((ticker: any) => (
                        <SelectItem key={ticker.id} value={ticker.symbol}>
                          {ticker.symbol.replace('USDT', '/USD')} - {ticker.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                  />
                </div>

                {currentPrice && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Current Price</div>
                    <div className="text-lg font-bold">${currentPrice.price.toLocaleString()}</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleTrade('BUY')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={executeTradeMutation.isPending}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    BUY
                  </Button>
                  <Button 
                    onClick={() => handleTrade('SELL')}
                    variant="destructive"
                    className="flex-1"
                    disabled={executeTradeMutation.isPending}
                  >
                    <TrendingDown className="mr-2 h-4 w-4" />
                    SELL
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chart with Signals */}
            <Card>
              <CardHeader>
                <CardTitle>Price Chart & Signals</CardTitle>
                <CardDescription>
                  Live chart with buy/sell signal markers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfessionalTradingChart 
                  symbol={selectedTicker} 
                  height={400}
                  showSignals={true}
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Signals */}
          {signals && signals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Signals</CardTitle>
                <CardDescription>
                  Latest trading signals from our analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {signals.slice(0, 6).map((signal: any) => (
                    <Card key={signal.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={signal.signalType === 'BUY' ? 'default' : 'destructive'}
                          className="mb-2"
                        >
                          {signal.signalType}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {signal.ticker}
                        </span>
                      </div>
                      <div className="text-lg font-bold">${signal.price.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(signal.timestamp).toLocaleString()}
                      </div>
                      {signal.note && (
                        <div className="text-xs mt-2 text-muted-foreground">
                          {signal.note}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Portfolio</CardTitle>
              <CardDescription>
                Current positions and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {portfolio && portfolio.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Avg. Price</TableHead>
                      <TableHead>Current Value</TableHead>
                      <TableHead>P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolio.map((position: Portfolio) => (
                      <TableRow key={position.id}>
                        <TableCell>{position.ticker.replace('USDT', '/USD')}</TableCell>
                        <TableCell>{position.quantity.toFixed(6)}</TableCell>
                        <TableCell>${position.averagePrice.toLocaleString()}</TableCell>
                        <TableCell>${position.currentValue.toLocaleString()}</TableCell>
                        <TableCell className={position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${Math.abs(position.pnl).toLocaleString()} ({position.pnlPercentage.toFixed(2)}%)
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No positions yet. Start trading to build your portfolio.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
              <CardDescription>
                Your recent trading activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tradeHistory && tradeHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tradeHistory.map((trade: Trade) => (
                      <TableRow key={trade.id}>
                        <TableCell>{new Date(trade.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{trade.ticker.replace('USDT', '/USD')}</TableCell>
                        <TableCell>
                          <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                            {trade.type}
                          </Badge>
                        </TableCell>
                        <TableCell>${trade.amount.toLocaleString()}</TableCell>
                        <TableCell>${trade.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              trade.status === 'EXECUTED' ? 'default' : 
                              trade.status === 'PENDING' ? 'secondary' : 'destructive'
                            }
                          >
                            {trade.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No trade history yet. Execute your first trade to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Settings</CardTitle>
              <CardDescription>
                Configure your trading preferences and risk management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="risk">Risk Level</Label>
                  <Select value={settings?.riskLevel || 'moderate'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTrade">Max Trade Amount (USD)</Label>
                  <Input
                    id="maxTrade"
                    type="number"
                    value={settings?.maxTradeAmount || 1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stopLoss">Stop Loss (%)</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    value={settings?.stopLoss || 5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="takeProfit">Take Profit (%)</Label>
                  <Input
                    id="takeProfit"
                    type="number"
                    value={settings?.takeProfit || 10}
                  />
                </div>
              </div>

              <Button onClick={() => updateSettingsMutation.mutate({})}>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}