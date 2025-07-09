import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import Sidebar from "@/components/layout/Sidebar";

import HeatmapChart from "@/components/charts/HeatmapChart";
import CycleChart from "@/components/charts/CycleChart";
import TickerSelector from "@/components/ui/ticker-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Bell,
  ExternalLink,
  Activity,
  BarChart3,
  LineChart,
  PieChart
} from "lucide-react";
import { useState, useEffect } from "react";

interface AlertSignal {
  id: string;
  ticker: string;
  signalType: "buy" | "sell";
  price: string;
  timestamp: string;
  source: string;
  note?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recentSignals, setRecentSignals] = useState<AlertSignal[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<string[]>(["BTCUSDT", "ETHUSDT"]);
  const [activeTab, setActiveTab] = useState("overview");

  // Handle ticker selection
  const handleTickerToggle = (symbol: string) => {
    setSelectedTickers(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  // Fetch user's recent signals
  const { data: userSignals, isLoading: isLoadingSignals } = useQuery({
    queryKey: ["/api/user/signals"],
    queryFn: async () => {
      const response = await fetch("/api/user/signals?limit=10", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch signals");
      }
      return await response.json();
    },
  });

  // Mock current price for demo
  const currentBTCPrice = 67234.56;
  const dailyChange = 2.34;
  const isPositive = dailyChange > 0;

  // WebSocket for real-time signal updates
  useWebSocket((message) => {
    if (message.type === "new_signal" && message.signal) {
      setRecentSignals(prev => [message.signal, ...prev.slice(0, 9)]);
    }
  });

  useEffect(() => {
    if (userSignals) {
      setRecentSignals(userSignals);
    }
  }, [userSignals]);

  const quickStats = [
    {
      title: "Signal Accuracy",
      value: "87.5%",
      icon: Target,
      color: "text-emerald-400",
    },
    {
      title: "Last Signal",
      value: "2h ago",
      icon: Clock,
      color: "text-foreground",
    },
    {
      title: "Portfolio",
      value: "+24.5%",
      icon: TrendingUp,
      color: "text-emerald-400",
    },
    {
      title: "Active Alerts",
      value: "12",
      icon: Bell,
      color: "text-foreground",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <div className="ml-64 flex-1 bg-background">
          {/* Top Bar */}
          <header className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h1 className="text-2xl font-bold">Trading Dashboard</h1>
                <div className="flex items-center space-x-4">
                  <div className="bg-muted px-4 py-2 rounded-lg">
                    <span className="text-sm text-muted-foreground">BTC/USD</span>
                    <span className={`font-semibold ml-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${currentBTCPrice.toLocaleString()}
                    </span>
                    <span className={`text-sm ml-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{dailyChange}%
                    </span>
                  </div>
                  <div className="bg-muted px-4 py-2 rounded-lg">
                    <span className="text-sm text-muted-foreground">24h Vol</span>
                    <span className="text-foreground font-semibold ml-2">$28.5B</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  {user?.firstName?.[0] || user?.email[0].toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                        <IconComponent className={`h-8 w-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Professional Trading Interface */}
            <div className="grid grid-cols-1 gap-6">
              {/* Main TradingView Chart */}
              <div className="w-full">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Professional TradingView Chart</h3>
                        <p className="text-muted-foreground">
                          Advanced charting with technical indicators and real-time data
                        </p>
                        <Button className="mt-4" onClick={() => window.location.href = '/trading'}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Trading Terminal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 200-Week Heatmap Widget */}
              <HeatmapChart 
                symbol="BTC"
                height={300}
              />

              {/* 2-Year Cycle Indicator */}
              <CycleChart 
                symbol="BTC"
                height={300}
              />
            </div>

            {/* Recent Alerts Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSignals ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-3 h-3 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                        <Skeleton className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                ) : recentSignals.length > 0 ? (
                  <div className="space-y-3">
                    {recentSignals.map((signal) => (
                      <div key={signal.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            signal.signalType === 'buy' ? 'bg-emerald-400' : 'bg-red-400'
                          }`} />
                          <div>
                            <div className="font-semibold flex items-center space-x-2">
                              <span>{signal.signalType.toUpperCase()} Signal - {signal.ticker}</span>
                              <Badge variant={signal.signalType === 'buy' ? 'default' : 'destructive'} className="text-xs">
                                {signal.signalType === 'buy' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Price: ${parseFloat(signal.price).toLocaleString()} | 
                              Time: {new Date(signal.timestamp).toLocaleString()}
                              {signal.note && ` | ${signal.note}`}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent signals found</p>
                    <p className="text-sm text-muted-foreground">Signals will appear here when they're generated</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
