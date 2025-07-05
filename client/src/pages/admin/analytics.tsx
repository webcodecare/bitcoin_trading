import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Signal, 
  Activity, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Date picker component would be imported here when available

interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalSignals: number;
  dailySignals: number;
  conversionRate: number;
  churnRate: number;
}

interface UserAnalytics {
  newUsers: Array<{ date: string; count: number }>;
  activeUsers: Array<{ date: string; count: number }>;
  usersByTier: Array<{ tier: string; count: number; percentage: number }>;
  retentionRate: Array<{ period: string; rate: number }>;
}

interface RevenueAnalytics {
  monthlyRevenue: Array<{ month: string; revenue: number; subscriptions: number }>;
  revenueByTier: Array<{ tier: string; revenue: number; percentage: number }>;
  mrr: number;
  arr: number;
  ltv: number;
}

interface SignalAnalytics {
  signalsPerDay: Array<{ date: string; count: number; accuracy: number }>;
  signalsByTicker: Array<{ ticker: string; count: number; accuracy: number }>;
  signalAccuracy: Array<{ date: string; accuracy: number }>;
  popularTickers: Array<{ ticker: string; subscriptions: number }>;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  responseTime: number;
  errorRate: number;
  uptime: string;
}

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("overview");

  const { data: metrics, isLoading: metricsLoading } = useQuery<AnalyticsMetrics>({
    queryKey: ["/api/admin/analytics/metrics", timeRange],
  });

  const { data: userAnalytics, isLoading: usersLoading } = useQuery<UserAnalytics>({
    queryKey: ["/api/admin/analytics/users", timeRange],
  });

  const { data: revenueAnalytics, isLoading: revenueLoading } = useQuery<RevenueAnalytics>({
    queryKey: ["/api/admin/analytics/revenue", timeRange],
  });

  const { data: signalAnalytics, isLoading: signalsLoading } = useQuery<SignalAnalytics>({
    queryKey: ["/api/admin/analytics/signals", timeRange],
  });

  const { data: systemMetrics, isLoading: systemLoading } = useQuery<SystemMetrics>({
    queryKey: ["/api/admin/analytics/system"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (metricsLoading || usersLoading || revenueLoading || signalsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into platform performance and user engagement
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics?.activeUsers}</span> active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.monthlyRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Signals</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.dailySignals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">92.3%</span> accuracy rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics?.conversionRate || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      {systemMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemMetrics.cpuUsage}%</div>
                <div className="text-sm text-muted-foreground">CPU Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemMetrics.memoryUsage}%</div>
                <div className="text-sm text-muted-foreground">Memory</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemMetrics.activeConnections}</div>
                <div className="text-sm text-muted-foreground">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{systemMetrics.responseTime}ms</div>
                <div className="text-sm text-muted-foreground">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{formatPercentage(systemMetrics.errorRate)}</div>
                <div className="text-sm text-muted-foreground">Error Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemMetrics.uptime}</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="signals">Signal Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* User Analytics Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16" />
                  <div className="ml-4">
                    <div className="font-medium">User Growth Chart</div>
                    <div className="text-sm">Chart visualization would be rendered here</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>Users by subscription tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userAnalytics?.usersByTier?.map((tier) => (
                    <div key={tier.tier} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={tier.tier === 'free' ? 'secondary' : 'default'}>
                          {tier.tier}
                        </Badge>
                        <span className="text-sm">{tier.count} users</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatPercentage(tier.percentage / 100)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>Retention rates by period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userAnalytics?.retentionRate?.map((period) => (
                    <div key={period.period} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{period.period}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${period.rate}%` }}
                          />
                        </div>
                        <span className="text-sm">{formatPercentage(period.rate / 100)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Daily active users trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <LineChart className="h-16 w-16" />
                  <div className="ml-4">
                    <div className="font-medium">Active Users Chart</div>
                    <div className="text-sm">Line chart visualization would be rendered here</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>MRR Growth</CardTitle>
                <CardDescription>Monthly Recurring Revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(revenueAnalytics?.mrr || 0)}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  ARR: {formatCurrency(revenueAnalytics?.arr || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer LTV</CardTitle>
                <CardDescription>Lifetime Value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(revenueAnalytics?.ltv || 0)}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Average customer value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Rate</CardTitle>
                <CardDescription>Monthly churn percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatPercentage(metrics?.churnRate || 0)}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Lower is better
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Tier</CardTitle>
                <CardDescription>Revenue distribution across subscription tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueAnalytics?.revenueByTier?.map((tier) => (
                    <div key={tier.tier} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={tier.tier === 'pro' ? 'default' : 'secondary'}>
                          {tier.tier}
                        </Badge>
                        <span className="text-sm">{formatCurrency(tier.revenue)}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatPercentage(tier.percentage / 100)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
                <CardDescription>Revenue and subscription growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16" />
                  <div className="ml-4">
                    <div className="font-medium">Revenue Trend Chart</div>
                    <div className="text-sm">Combined revenue and subscription chart</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Signal Analytics Tab */}
        <TabsContent value="signals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Signal Performance</CardTitle>
                <CardDescription>Daily signal count and accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <LineChart className="h-16 w-16" />
                  <div className="ml-4">
                    <div className="font-medium">Signal Performance Chart</div>
                    <div className="text-sm">Signal count and accuracy over time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Trading Pairs</CardTitle>
                <CardDescription>Most subscribed tickers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {signalAnalytics?.popularTickers?.map((ticker, index) => (
                    <div key={ticker.ticker} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{ticker.ticker}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {ticker.subscriptions} subscriptions
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Signal Accuracy by Ticker</CardTitle>
                <CardDescription>Performance breakdown by trading pair</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {signalAnalytics?.signalsByTicker?.map((ticker) => (
                    <div key={ticker.ticker} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{ticker.ticker}</span>
                        <span className="text-sm text-muted-foreground">
                          {ticker.count} signals
                        </span>
                      </div>
                      <Badge variant={ticker.accuracy > 0.9 ? 'default' : 'secondary'}>
                        {formatPercentage(ticker.accuracy)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Signal Accuracy Trend</CardTitle>
                <CardDescription>Accuracy rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <LineChart className="h-16 w-16" />
                  <div className="ml-4">
                    <div className="font-medium">Accuracy Trend Chart</div>
                    <div className="text-sm">Signal accuracy percentage over time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
                <CardDescription>API response time trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <LineChart className="h-16 w-16" />
                  <div className="ml-4">
                    <div className="font-medium">Response Time Chart</div>
                    <div className="text-sm">Average response time over time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
                <CardDescription>System error tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16" />
                  <div className="ml-4">
                    <div className="font-medium">Error Rate Chart</div>
                    <div className="text-sm">Error percentage by endpoint</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>CPU and memory utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Activity className="h-16 w-16" />
                  <div className="ml-4">
                    <div className="font-medium">Resource Usage Chart</div>
                    <div className="text-sm">CPU and memory over time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Performance</CardTitle>
                <CardDescription>Query response times and connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16" />
                  <div className="ml-4">
                    <div className="font-medium">Database Performance Chart</div>
                    <div className="text-sm">Query performance metrics</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}