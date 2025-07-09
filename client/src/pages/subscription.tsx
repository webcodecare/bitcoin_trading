import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';
import InteractiveChart from '@/components/charts/InteractiveChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/layout/Sidebar';
import { 
  Star, 
  Activity,
  TrendingUp,
  Zap,
  BarChart3
} from 'lucide-react';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [selectedTicker, setSelectedTicker] = useState<string>('BTCUSDT');

  const handleTickerSelect = (symbol: string) => {
    setSelectedTicker(symbol);
  };

  if (!user) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">Please log in to manage your subscriptions.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Center</h1>
          <p className="text-muted-foreground">
            Manage your cryptocurrency subscriptions and monitor real-time charts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {user.subscriptionTier || 'Free'} Plan
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Active User
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Subscription Management - Takes up 2 columns on XL screens */}
        <div className="xl:col-span-2">
          <SubscriptionManager 
            onTickerSelect={handleTickerSelect}
            selectedTicker={selectedTicker}
          />
        </div>

        {/* Interactive Chart - Takes up 1 column on XL screens */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Ticker:</span>
                <Badge variant="default">{selectedTicker}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan Type:</span>
                <span className="text-sm font-medium">{user.subscriptionTier || 'Free'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Live Data
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Available Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Real-time Price Updates</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Trading Signal Alerts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Interactive Charts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Multiple Timeframes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span>SMS Notifications</span>
                  <Badge variant="outline" className="text-xs">Pro</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span>Advanced Analytics</span>
                  <Badge variant="outline" className="text-xs">Pro</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Chart Section */}
      {selectedTicker && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Live Chart</h2>
            <Badge variant="outline">{selectedTicker}</Badge>
          </div>
          
          <InteractiveChart 
            symbol={selectedTicker}
            height={600}
            onSymbolChange={handleTickerSelect}
            className="w-full"
          />
        </div>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">1. Subscribe to Tickers</h4>
              <p className="text-muted-foreground">
                Use the search box to find and subscribe to your favorite cryptocurrencies.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">2. Monitor Charts</h4>
              <p className="text-muted-foreground">
                Click on any subscribed ticker to view its interactive chart with real-time data.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">3. Receive Alerts</h4>
              <p className="text-muted-foreground">
                Get notified instantly when trading signals are generated for your subscribed tickers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
          </div>
        </div>
      </div>
    </div>
  );
}