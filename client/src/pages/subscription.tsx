import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, Calendar, Zap, BarChart3 } from "lucide-react";

interface SubscriptionUsage {
  currentPlan: {
    name: string;
    tier: string;
    monthlyPrice: number;
    features: string[];
    maxSignals: number;
    maxTickers: number;
  };
  usage: {
    signalsUsed: number;
    signalsLimit: number;
    signalsRemaining: string | number;
    usagePercentage: number;
    resetDate: string;
    renewalDate: string;
    dailyTrend: Array<{ date: string; signals: number }>;
  };
  analytics: {
    totalSignalsReceived: number;
    averageSignalsPerDay: number;
    mostActiveDay: { date: string; signals: number };
  };
}

export default function Subscription() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: usageData, isLoading } = useQuery<SubscriptionUsage>({
    queryKey: ["/api/subscription-usage"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your subscription</h1>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage your CryptoStrategy Pro subscription</p>
        </div>
        <Badge variant={usageData?.currentPlan.tier === "free" ? "secondary" : "default"} className="text-sm">
          {usageData?.currentPlan.name} Plan
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b mb-6">
        {[
          { id: "overview", label: "Overview" },
          { id: "usage", label: "Usage Analytics" },
          { id: "billing", label: "Billing & Payment" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && usageData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Plan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageData.currentPlan.name}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(usageData.currentPlan.monthlyPrice)}/month
              </p>
            </CardContent>
          </Card>

          {/* Usage This Month */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signals Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usageData.usage.signalsUsed}
                {usageData.usage.signalsLimit !== -1 && (
                  <span className="text-sm text-muted-foreground">
                    /{usageData.usage.signalsLimit}
                  </span>
                )}
              </div>
              {usageData.usage.signalsLimit !== -1 && (
                <Progress 
                  value={usageData.usage.usagePercentage} 
                  className="mt-2" 
                />
              )}
            </CardContent>
          </Card>

          {/* Next Renewal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Renewal</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDate(usageData.usage.renewalDate)}
              </div>
              <p className="text-xs text-muted-foreground">
                Usage resets on {formatDate(usageData.usage.resetDate)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Analytics Tab */}
      {activeTab === "usage" && usageData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>Track your subscription usage and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{usageData.analytics.totalSignalsReceived}</div>
                  <div className="text-sm text-muted-foreground">Total Signals</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{usageData.analytics.averageSignalsPerDay}</div>
                  <div className="text-sm text-muted-foreground">Avg per Day</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{usageData.analytics.mostActiveDay.signals}</div>
                  <div className="text-sm text-muted-foreground">Most Active Day</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Last 7 Days Signal Activity</h4>
                <div className="flex space-x-2">
                  {usageData.usage.dailyTrend.map((day, index) => (
                    <div key={index} className="flex-1 text-center">
                      <div 
                        className="bg-primary rounded-t" 
                        style={{ 
                          height: `${Math.max(4, (day.signals / Math.max(...usageData.usage.dailyTrend.map(d => d.signals), 1)) * 60)}px` 
                        }}
                      ></div>
                      <div className="text-xs mt-1">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-xs text-muted-foreground">{day.signals}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && usageData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Payment Information</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{usageData.currentPlan.name} Plan</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(usageData.currentPlan.monthlyPrice)} billed monthly
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Change Plan
                    </Button>
                    <Button variant="outline" size="sm">
                      Cancel Subscription
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Payment Method</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-400 rounded text-white text-xs flex items-center justify-center">
                      VISA
                    </div>
                    <span className="text-sm">•••• •••• •••• 4242</span>
                    <Button variant="ghost" size="sm">Update</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Billing History</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Jan 2025 - {usageData.currentPlan.name} Plan</span>
                      <span>{formatCurrency(usageData.currentPlan.monthlyPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Dec 2024 - {usageData.currentPlan.name} Plan</span>
                      <span>{formatCurrency(usageData.currentPlan.monthlyPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plan Features */}
      {usageData && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>What's included in your {usageData.currentPlan.name} plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usageData.currentPlan.features?.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}