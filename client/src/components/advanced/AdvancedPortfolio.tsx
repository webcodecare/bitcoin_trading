import React, { useState } from 'react';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Target, DollarSign, Percent, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PortfolioAsset {
  id: string;
  ticker: string;
  name: string;
  amount: number;
  currentPrice: number;
  averagePrice: number;
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
  allocation: number;
  targetAllocation?: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalPnl: number;
  totalPnlPercentage: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
}

interface RebalanceRecommendation {
  ticker: string;
  currentAllocation: number;
  targetAllocation: number;
  recommendedAction: 'buy' | 'sell';
  amount: number;
  value: number;
}

export default function AdvancedPortfolio() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [rebalanceThreshold, setRebalanceThreshold] = useState(5);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: portfolio = [], isLoading: portfolioLoading } = useQuery({
    queryKey: ['/api/portfolio/advanced'],
    queryFn: () => apiRequest('GET', '/api/portfolio/advanced'),
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/portfolio/metrics', selectedTimeframe],
    queryFn: () => apiRequest('GET', `/api/portfolio/metrics?timeframe=${selectedTimeframe}`),
  });

  const { data: rebalanceRecommendations = [] } = useQuery({
    queryKey: ['/api/portfolio/rebalance', rebalanceThreshold],
    queryFn: () => apiRequest('GET', `/api/portfolio/rebalance?threshold=${rebalanceThreshold}`),
  });

  const { data: riskAnalysis } = useQuery({
    queryKey: ['/api/portfolio/risk-analysis'],
    queryFn: () => apiRequest('GET', '/api/portfolio/risk-analysis'),
  });

  const executeRebalanceMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/portfolio/execute-rebalance'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      toast({
        title: "Rebalancing Complete",
        description: "Your portfolio has been successfully rebalanced",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rebalancing Failed",
        description: error.message || "Failed to rebalance portfolio",
        variant: "destructive",
      });
    },
  });

  const updateTargetAllocationMutation = useMutation({
    mutationFn: ({ ticker, allocation }: { ticker: string; allocation: number }) =>
      apiRequest('PATCH', `/api/portfolio/allocation/${ticker}`, { targetAllocation: allocation }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      toast({
        title: "Target Updated",
        description: "Target allocation has been updated",
      });
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getAssetAllocationColor = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-orange-500', 'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  if (portfolioLoading || metricsLoading) {
    return <div className="text-center py-8">Loading portfolio data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Advanced Portfolio Management</h2>
          <p className="text-muted-foreground">
            Professional portfolio analytics, rebalancing, and risk management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.totalValue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(metrics?.totalPnlPercentage || 0)} from {selectedTimeframe}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.sharpeRatio?.toFixed(2) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Risk-adjusted returns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics?.maxDrawdown || 0)}</div>
            <p className="text-xs text-muted-foreground">Maximum loss from peak</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Beta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.beta?.toFixed(2) || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">vs Bitcoin correlation</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="holdings" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="rebalance">Rebalance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Holdings</CardTitle>
              <CardDescription>Current positions and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio.map((asset: PortfolioAsset) => (
                  <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {asset.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{asset.ticker}</h3>
                        <p className="text-sm text-muted-foreground">{asset.name}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold">{formatCurrency(asset.totalValue)}</div>
                      <div className="text-sm text-muted-foreground">{asset.amount.toFixed(6)} {asset.ticker}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className={`font-semibold ${asset.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(asset.pnlPercentage)}
                      </div>
                      <div className="text-sm text-muted-foreground">{formatCurrency(asset.pnl)}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{asset.allocation.toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Current vs target allocation breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {portfolio.map((asset: PortfolioAsset, index: number) => (
                  <div key={asset.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${getAssetAllocationColor(index)}`}></div>
                        <span className="font-medium">{asset.ticker}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                          Current: {asset.allocation.toFixed(1)}%
                        </span>
                        <div className="flex items-center space-x-2">
                          <Label>Target:</Label>
                          <Input
                            type="number"
                            value={asset.targetAllocation || asset.allocation}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              updateTargetAllocationMutation.mutate({ ticker: asset.ticker, allocation: value });
                            }}
                            className="w-20"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span>%</span>
                        </div>
                      </div>
                    </div>
                    <Progress value={asset.allocation} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rebalance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Rebalancing</CardTitle>
              <CardDescription>Automated rebalancing recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label>Rebalance Threshold:</Label>
                <Input
                  type="number"
                  value={rebalanceThreshold}
                  onChange={(e) => setRebalanceThreshold(parseFloat(e.target.value))}
                  className="w-20"
                  min="1"
                  max="20"
                  step="0.5"
                />
                <span>%</span>
              </div>

              {rebalanceRecommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Portfolio Balanced</h3>
                  <p className="text-muted-foreground">No rebalancing needed at current threshold</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Rebalancing Recommendations</h3>
                    <Button 
                      onClick={() => executeRebalanceMutation.mutate()}
                      disabled={executeRebalanceMutation.isPending}
                    >
                      {executeRebalanceMutation.isPending ? 'Executing...' : 'Execute Rebalance'}
                    </Button>
                  </div>
                  
                  {rebalanceRecommendations.map((rec: RebalanceRecommendation) => (
                    <div key={rec.ticker} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant={rec.recommendedAction === 'buy' ? 'default' : 'destructive'}>
                          {rec.recommendedAction.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{rec.ticker}</span>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          {rec.currentAllocation.toFixed(1)}% → {rec.targetAllocation.toFixed(1)}%
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(rec.value)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Portfolio risk metrics and diversification analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <h3 className="font-semibold">Risk Level</h3>
                  <p className={`text-lg font-bold ${getRiskColor(riskAnalysis?.riskLevel || 'medium')}`}>
                    {riskAnalysis?.riskLevel?.toUpperCase() || 'MEDIUM'}
                  </p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <PieChart className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold">Diversification Score</h3>
                  <p className="text-lg font-bold">{riskAnalysis?.diversificationScore || 75}/100</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Percent className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">Volatility</h3>
                  <p className="text-lg font-bold">{formatPercentage(metrics?.volatility || 0)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Risk Recommendations</h3>
                <div className="space-y-2">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm">
                      <strong>High Concentration Risk:</strong> Consider reducing Bitcoin allocation below 40% for better diversification.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm">
                      <strong>Correlation Analysis:</strong> Your portfolio shows high correlation with overall crypto market. Consider adding uncorrelated assets.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Detailed performance metrics and benchmarking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Return Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Return:</span>
                      <span className="font-semibold">{formatPercentage(metrics?.totalPnlPercentage || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annualized Return:</span>
                      <span className="font-semibold">+24.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best Month:</span>
                      <span className="font-semibold text-green-600">+45.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worst Month:</span>
                      <span className="font-semibold text-red-600">-18.7%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Benchmark Comparison</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>vs Bitcoin:</span>
                      <span className="font-semibold text-green-600">+5.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>vs Ethereum:</span>
                      <span className="font-semibold text-green-600">+12.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>vs Crypto Market:</span>
                      <span className="font-semibold text-green-600">+8.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>vs S&P 500:</span>
                      <span className="font-semibold text-green-600">+18.9%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}