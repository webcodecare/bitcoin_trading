import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import MultiTickerDashboard from "@/pages/multi-ticker-dashboard";
import Admin from "@/pages/admin";
import AdminUsers from "@/pages/admin/users";
import AdminSignals from "@/pages/admin/signals";
import AdminTickers from "@/pages/admin/tickers";
import AdminAlerts from "@/pages/admin/alerts";
import AdminNotifications from "@/pages/admin/notifications";
import AdminLogs from "@/pages/admin/logs";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminReports from "@/pages/admin/reports";
import AdminSubscriptions from "@/pages/admin/subscriptions";
import AdminPayments from "@/pages/admin/payments";
import AdminIntegrations from "@/pages/admin/integrations";
import AdminContent from "@/pages/admin/content";
import Alerts from "@/pages/alerts";
import AdvancedAlertsPage from "@/pages/advanced-alerts";
import AdvancedPortfolioPage from "@/pages/advanced-portfolio";
import MoodBoard from "@/pages/mood-board";
import AlertsTest from "@/components/test/AlertsTest";
import DashboardWidgetsPage from "@/pages/dashboard-widgets";
import Settings from "@/pages/settings";
import Preferences from "@/pages/preferences";
import NotificationSetup from "@/pages/notification-setup";
import NotificationDashboard from "@/pages/notification-dashboard";
import Pricing from "@/pages/pricing";
import Members from "@/pages/members";
import MarketData from "@/pages/market-data";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Subscription from "@/pages/subscription";
import Trading from "@/pages/trading";
import BitcoinAnalytics from "@/pages/bitcoin-analytics";
import AuthGuard from "@/components/auth/AuthGuard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/login" component={Login} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/dashboard">
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      </Route>
      <Route path="/multi-ticker">
        <AuthGuard>
          <MultiTickerDashboard />
        </AuthGuard>
      </Route>
      <Route path="/admin">
        <AuthGuard requiredRole="admin">
          <Admin />
        </AuthGuard>
      </Route>
      <Route path="/admin/users">
        <AuthGuard requiredRole="admin">
          <AdminUsers />
        </AuthGuard>
      </Route>
      <Route path="/admin/signals">
        <AuthGuard requiredRole="admin">
          <AdminSignals />
        </AuthGuard>
      </Route>
      <Route path="/admin/tickers">
        <AuthGuard requiredRole="admin">
          <AdminTickers />
        </AuthGuard>
      </Route>
      <Route path="/admin/alerts">
        <AuthGuard requiredRole="admin">
          <AdminAlerts />
        </AuthGuard>
      </Route>
      <Route path="/admin/notifications">
        <AuthGuard requiredRole="admin">
          <AdminNotifications />
        </AuthGuard>
      </Route>
      <Route path="/admin/logs">
        <AuthGuard requiredRole="admin">
          <AdminLogs />
        </AuthGuard>
      </Route>
      <Route path="/admin/analytics">
        <AuthGuard requiredRole="admin">
          <AdminAnalytics />
        </AuthGuard>
      </Route>
      <Route path="/admin/reports">
        <AuthGuard requiredRole="admin">
          <AdminReports />
        </AuthGuard>
      </Route>
      <Route path="/admin/subscriptions">
        <AuthGuard requiredRole="admin">
          <AdminSubscriptions />
        </AuthGuard>
      </Route>
      <Route path="/admin/payments">
        <AuthGuard requiredRole="admin">
          <AdminPayments />
        </AuthGuard>
      </Route>
      <Route path="/admin/integrations">
        <AuthGuard requiredRole="admin">
          <AdminIntegrations />
        </AuthGuard>
      </Route>
      <Route path="/admin/content">
        <AuthGuard requiredRole="admin">
          <AdminContent />
        </AuthGuard>
      </Route>
      <Route path="/alerts">
        <AuthGuard>
          <Alerts />
        </AuthGuard>
      </Route>
      <Route path="/settings">
        <AuthGuard>
          <Settings />
        </AuthGuard>
      </Route>
      <Route path="/preferences">
        <AuthGuard>
          <Preferences />
        </AuthGuard>
      </Route>
      <Route path="/notification-setup">
        <AuthGuard>
          <NotificationSetup />
        </AuthGuard>
      </Route>
      <Route path="/notification-dashboard">
        <AuthGuard>
          <NotificationDashboard />
        </AuthGuard>
      </Route>
      <Route path="/advanced-alerts">
        <AuthGuard>
          <AdvancedAlertsPage />
        </AuthGuard>
      </Route>
      <Route path="/advanced-portfolio">
        <AuthGuard>
          <AdvancedPortfolioPage />
        </AuthGuard>
      </Route>
      <Route path="/test-alerts" component={AlertsTest} />
      <Route path="/dashboard-widgets" component={DashboardWidgetsPage} />
      <Route path="/subscription">
        <AuthGuard>
          <Subscription />
        </AuthGuard>
      </Route>
      <Route path="/mood-board">
        <AuthGuard>
          <MoodBoard />
        </AuthGuard>
      </Route>
      <Route path="/trading">
        <AuthGuard>
          <Trading />
        </AuthGuard>
      </Route>
      <Route path="/bitcoin-analytics">
        <AuthGuard>
          <BitcoinAnalytics />
        </AuthGuard>
      </Route>
      <Route path="/mood-board">
        <AuthGuard>
          <MoodBoard />
        </AuthGuard>
      </Route>
      <Route path="/members">
        <AuthGuard>
          <Members />
        </AuthGuard>
      </Route>
      <Route path="/market-data" component={MarketData} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Global error handling for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Prevent default behavior for specific known issues
      if (event.reason && event.reason.message) {
        const message = event.reason.message.toLowerCase();
        if (message.includes('tradingview') || 
            message.includes('chart') || 
            message.includes('widget')) {
          event.preventDefault();
          console.warn('Chart-related error handled gracefully');
          return;
        }
      }
      
      // For other errors, let them be handled by default error boundaries
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
