import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEffect, lazy, Suspense } from "react";
import SessionWarning from "@/components/auth/SessionWarning";
import LazyLoader from "@/components/common/LazyLoader";
import PerformanceOptimizer from "@/components/common/PerformanceOptimizer";

// Critical pages loaded immediately
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Login from "@/pages/login";

// Heavy pages lazy loaded for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const MultiTickerDashboard = lazy(() => import("@/pages/multi-ticker-dashboard"));
const Admin = lazy(() => import("@/pages/admin"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminSignals = lazy(() => import("@/pages/admin/signals"));
const AdminTickers = lazy(() => import("@/pages/admin/tickers"));
const AdminAlerts = lazy(() => import("@/pages/admin/alerts"));
const AdminNotifications = lazy(() => import("@/pages/admin/notifications"));
const AdminLogs = lazy(() => import("@/pages/admin/logs"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));
const AdminReports = lazy(() => import("@/pages/admin/reports"));
const AdminSubscriptions = lazy(() => import("@/pages/admin/subscriptions"));
const AdminPayments = lazy(() => import("@/pages/admin/payments"));
const AdminIntegrations = lazy(() => import("@/pages/admin/integrations"));
const AdminContent = lazy(() => import("@/pages/admin/content"));
const AdminPermissions = lazy(() => import("@/pages/admin/permissions"));
const AdminUserRoles = lazy(() => import("@/pages/admin/user-roles"));
const AdminTestUsers = lazy(() => import("@/pages/admin/test-users"));
const Alerts = lazy(() => import("@/pages/alerts"));
const AdvancedAlertsPage = lazy(() => import("@/pages/advanced-alerts"));
const AdvancedPortfolioPage = lazy(() => import("@/pages/advanced-portfolio"));
const MoodBoard = lazy(() => import("@/pages/mood-board"));
const AlertsTest = lazy(() => import("@/components/test/AlertsTest"));
const DashboardWidgetsPage = lazy(() => import("@/pages/dashboard-widgets"));
const Settings = lazy(() => import("@/pages/settings"));
const Preferences = lazy(() => import("@/pages/preferences"));
const NotificationSetup = lazy(() => import("@/pages/notification-setup"));
const TradingPlayground = lazy(() => import("@/pages/trading-playground"));
const NotificationDashboard = lazy(() => import("@/pages/notification-dashboard"));
const Pricing = lazy(() => import("@/pages/pricing"));
const Members = lazy(() => import("@/pages/members"));
const MarketData = lazy(() => import("@/pages/market-data"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Subscription = lazy(() => import("@/pages/subscription"));
const Trading = lazy(() => import("@/pages/trading"));
const BitcoinAnalytics = lazy(() => import("@/pages/bitcoin-analytics"));
const LiveStreaming = lazy(() => import("@/pages/live-streaming"));
const HistoricalOHLC = lazy(() => import("@/pages/historical-ohlc"));
const Achievements = lazy(() => import("@/pages/achievements"));
const UserProgress = lazy(() => import("@/pages/user-progress"));
const NotificationCenter = lazy(() => import("@/pages/notification-center"));
import AuthGuard from "@/components/auth/AuthGuard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/signup" component={Auth} />
      <Route path="/login" component={Login} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/dashboard">
        <AuthGuard>
          <LazyLoader>
            <Dashboard />
          </LazyLoader>
        </AuthGuard>
      </Route>
      <Route path="/multi-ticker">
        <AuthGuard>
          <LazyLoader>
            <MultiTickerDashboard />
          </LazyLoader>
        </AuthGuard>
      </Route>
      <Route path="/admin">
        <AuthGuard requiredRole="admin">
          <LazyLoader>
            <Admin />
          </LazyLoader>
        </AuthGuard>
      </Route>
      <Route path="/admin/users">
        <AuthGuard requiredRole="admin">
          <LazyLoader>
            <AdminUsers />
          </LazyLoader>
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
      <Route path="/admin/permissions">
        <AuthGuard requiredRole="admin">
          <LazyLoader>
            <AdminPermissions />
          </LazyLoader>
        </AuthGuard>
      </Route>
      <Route path="/admin/user-roles">
        <AuthGuard requiredRole="admin">
          <LazyLoader>
            <AdminUserRoles />
          </LazyLoader>
        </AuthGuard>
      </Route>
      <Route path="/admin/test-users">
        <AuthGuard requiredRole="admin">
          <LazyLoader>
            <AdminTestUsers />
          </LazyLoader>
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
      <Route path="/notification-center">
        <AuthGuard>
          <LazyLoader>
            <NotificationCenter />
          </LazyLoader>
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
      <Route path="/test-alerts">
        <AuthGuard>
          <AlertsTest />
        </AuthGuard>
      </Route>
      <Route path="/dashboard-widgets">
        <AuthGuard>
          <DashboardWidgetsPage />
        </AuthGuard>
      </Route>
      <Route path="/subscription">
        <AuthGuard>
          <Subscription />
        </AuthGuard>
      </Route>
      <Route path="/subscriptions">
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
      <Route path="/trading-playground">
        <AuthGuard>
          <TradingPlayground />
        </AuthGuard>
      </Route>
      <Route path="/bitcoin-analytics">
        <AuthGuard>
          <BitcoinAnalytics />
        </AuthGuard>
      </Route>
      <Route path="/live-streaming">
        <AuthGuard>
          <LiveStreaming />
        </AuthGuard>
      </Route>
      <Route path="/historical-ohlc">
        <AuthGuard>
          <HistoricalOHLC />
        </AuthGuard>
      </Route>
      <Route path="/achievements">
        <AuthGuard>
          <Achievements />
        </AuthGuard>
      </Route>
      <Route path="/user-progress">
        <AuthGuard>
          <UserProgress />
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

function AppContent() {
  const { logout, extendSession } = useAuth();

  return (
    <>
      <Router />
      <SessionWarning onLogout={logout} onExtend={extendSession} />
      <Toaster />
    </>
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
        <PerformanceOptimizer>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </PerformanceOptimizer>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
