import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasAccess } from '@/lib/subscriptionUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Upgrade } from 'lucide-react';
import { Link } from 'wouter';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredFeature: string;
  fallbackMessage?: string;
}

export function SubscriptionGuard({ 
  children, 
  requiredFeature, 
  fallbackMessage 
}: SubscriptionGuardProps) {
  const { user, isAuthenticated } = useAuth();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button className="w-full">
                Log In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userTier = user?.subscriptionTier || "free";
  const hasPermission = hasAccess(userTier, requiredFeature);
  
  // If user has permission, render children
  if (hasPermission) {
    return <>{children}</>;
  }

  // Show upgrade prompt
  const upgradeMessages: Record<string, { title: string; description: string; requiredTier: string }> = {
    tradingPlayground: {
      title: "Trading Playground",
      description: "Practice trading with virtual funds",
      requiredTier: "Basic"
    },
    advancedCharts: {
      title: "Advanced Charts",
      description: "Professional chart analysis tools",
      requiredTier: "Basic"
    },
    heatmapAnalysis: {
      title: "200-Week Heatmap",
      description: "Advanced market cycle analysis",
      requiredTier: "Basic"
    },
    cycleForecasting: {
      title: "Cycle Forecasting",
      description: "AI-powered market predictions",
      requiredTier: "Premium"
    },
    advancedAlerts: {
      title: "Advanced Alerts",
      description: "Custom alert conditions and triggers",
      requiredTier: "Premium"
    },
    portfolioManagement: {
      title: "Portfolio Management",
      description: "Professional portfolio tracking",
      requiredTier: "Basic"
    },
    smsAlerts: {
      title: "SMS Alerts",
      description: "Real-time SMS notifications",
      requiredTier: "Basic"
    },
    telegramAlerts: {
      title: "Telegram Alerts",
      description: "Telegram bot notifications",
      requiredTier: "Premium"
    },
    pushNotifications: {
      title: "Push Notifications",
      description: "Browser push notifications",
      requiredTier: "Basic"
    }
  };

  const featureInfo = upgradeMessages[requiredFeature] || {
    title: "Premium Feature",
    description: fallbackMessage || "This feature requires a subscription upgrade",
    requiredTier: "Basic"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="text-center">
          <Crown className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <CardTitle className="text-2xl">Upgrade Required</CardTitle>
          <CardDescription className="text-lg">
            {featureInfo.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {featureInfo.description}
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Current Plan:</strong> {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
              <br />
              <strong>Required:</strong> {featureInfo.requiredTier} or higher
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/subscriptions">
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                <Upgrade className="h-4 w-4 mr-2" />
                Upgrade to {featureInfo.requiredTier}
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SubscriptionGuard;