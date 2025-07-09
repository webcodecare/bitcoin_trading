import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  Target,
  Download,
  Filter,
  Calendar,
  PieChart,
  LineChart,
  BarChart2
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell } from "recharts";

export default function AdminAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics', selectedPeriod, selectedMetric],
    refetchInterval: 30000,
  });

  const { data: revenueData } = useQuery({
    queryKey: ['/api/admin/analytics/revenue', selectedPeriod],
  });

  const { data: userMetrics } = useQuery({
    queryKey: ['/api/admin/analytics/users', selectedPeriod],
  });

  const { data: tradingMetrics } = useQuery({
    queryKey: ['/api/admin/analytics/trading', selectedPeriod],
  });

  const { data: signalPerformance } = useQuery({
    queryKey: ['/api/admin/analytics/signals', selectedPeriod],
  });

  // Mock data for demonstration
  const mockOverviewData = {
    totalUsers: 12847,
    activeUsers: 8934,
    totalRevenue: 284567.89,
    monthlyRevenue: 45892.34,
    totalTrades: 156789,
    signalAccuracy: 78.4,
    userGrowth: 12.5,
    revenueGrowth: 8.3,
    tradesGrowth: 23.7,
    accuracyChange: 2.1
  };

  const mockChartData = [
    { name: 'Jan', users: 4000, revenue: 24000, trades: 2400 },
    { name: 'Feb', users: 3000, revenue: 13980, trades: 2210 },
    { name: 'Mar', users: 2000, revenue: 29800, trades: 2290 },
    { name: 'Apr', users: 2780, revenue: 39080, trades: 2000 },
    { name: 'May', users: 1890, revenue: 48000, trades: 2181 },
    { name: 'Jun', users: 2390, revenue: 38000, trades: 2500 },
    { name: 'Jul', users: 3490, revenue: 43000, trades: 2100 },
  ];

  const periods = [
    { value: '1d', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const exportReport = () => {
    // Generate and download comprehensive report
    const reportData = {
      period: selectedPeriod,
      generated: new Date().toISOString(),
      metrics: mockOverviewData,
      chartData: mockChartData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <div className="ml-0 lg:ml-64 flex-1">
          {/* Header */}
          <header className="bg-card border-b border-border p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Analytics & Reporting</h1>
                <p className="text-muted-foreground">
                  Comprehensive platform analytics and performance metrics
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={exportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6 space-y-6">

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : (analyticsData?.overview?.totalUsers || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +{analyticsData?.overview?.userGrowth || 0}% from last period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : `$${(analyticsData?.overview?.monthlyRevenue || 0).toLocaleString()}`}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +{analyticsData?.overview?.revenueGrowth || 0}% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : (analyticsData?.overview?.totalTrades || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +{analyticsData?.overview?.tradesGrowth || 0}% from last period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Signal Accuracy</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : `${analyticsData?.overview?.signalAccuracy || 0}%`}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +{analyticsData?.overview?.accuracyChange || 0}% improvement
                  </div>
                </CardContent>
              </Card>
            </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  User Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  type="line"
                  height={320}
                  data={{
                    labels: mockChartData.map(d => d.name),
                    datasets: [{
                      label: 'Users',
                      data: mockChartData.map(d => d.users),
                      borderColor: '#3B82F6',
                      backgroundColor: '#3B82F6',
                    }]
                  }}
                />
              </CardContent>
            </Card>

            {/* Revenue Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  type="pie"
                  height={320}
                  data={{
                    labels: ['Subscriptions', 'Trading Fees', 'Premium'],
                    datasets: [{
                      label: 'Revenue',
                      data: [75.3, 19.4, 5.3],
                      backgroundColor: '#3B82F6',
                    }]
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Platform Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{mockOverviewData.activeUsers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Active Users (30d)</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">89.4%</div>
                  <div className="text-sm text-muted-foreground">User Retention Rate</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">4.2</div>
                  <div className="text-sm text-muted-foreground">Avg. Session Duration (hrs)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  type="bar"
                  height={320}
                  data={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                      label: 'New Users',
                      data: [45, 52, 38, 61, 47, 33, 29],
                      backgroundColor: '#10B981',
                    }]
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Daily Active Users</span>
                    <Badge variant="outline">3,247</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Weekly Active Users</span>
                    <Badge variant="outline">8,934</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Monthly Active Users</span>
                    <Badge variant="outline">12,847</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg. Session Time</span>
                    <Badge variant="outline">4h 12m</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData?.monthlyRevenue || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                      <Bar dataKey="revenue" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Subscriptions</span>
                    <span className="font-medium">$34,567</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Trading Fees</span>
                    <span className="font-medium">$8,923</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Premium Features</span>
                    <span className="font-medium">$2,402</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>${mockOverviewData.monthlyRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={tradingMetrics?.volumeData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, "Volume"]} />
                      <Line type="monotone" dataKey="volume" stroke="#10B981" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Trades</span>
                    <Badge variant="outline">{tradingMetrics?.totalTrades?.toLocaleString() || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Volume</span>
                    <Badge variant="outline">${tradingMetrics?.volume?.toLocaleString() || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Trade Size</span>
                    <Badge variant="outline">${tradingMetrics?.avgTradeSize?.toLocaleString() || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Success Rate</span>
                    <Badge variant="outline" className="text-green-600">{tradingMetrics?.successRate || 0}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="signals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Signal Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={signalPerformance?.accuracyData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, "Accuracy"]} />
                      <Line type="monotone" dataKey="accuracy" stroke="#8B5CF6" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Signal Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Signals</span>
                    <Badge variant="outline">{signalPerformance?.totalSignals || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Successful Signals</span>
                    <Badge variant="outline" className="text-green-600">{signalPerformance?.successfulSignals || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Failed Signals</span>
                    <Badge variant="outline" className="text-red-600">{signalPerformance?.failedSignals || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Accuracy Rate</span>
                    <Badge variant="outline">{signalPerformance?.accuracy || 0}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}