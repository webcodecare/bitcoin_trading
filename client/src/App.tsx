import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect, lazy, Suspense } from "react";
import SessionWarning from "@/components/auth/SessionWarning";
import PerformanceOptimizer from "@/components/common/PerformanceOptimizer";
import AuthGuard from "@/components/auth/AuthGuard";

// Critical pages loaded immediately
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Login from "@/pages/login";

// Heavy pages lazy loaded for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const MultiTickerDashboard = lazy(() => import("@/pages/multi-ticker-dashboard"));
const Trading = lazy(() => import("@/pages/trading"));
const Admin = lazy(() => import("@/pages/admin"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminUserRoles = lazy(() => import("@/pages/admin/user-roles"));
const AdminTickers = lazy(() => import("@/pages/admin/tickers"));
const AdminSignals = lazy(() => import("@/pages/admin/signals"));
const AdminAlerts = lazy(() => import("@/pages/admin/alerts"));
const AdminNotifications = lazy(() => import("@/pages/admin/notifications"));
const AdminLogs = lazy(() => import("@/pages/admin/logs"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));
const AdminIntegrations = lazy(() => import("@/pages/admin/integrations"));
const AdminReports = lazy(() => import("@/pages/admin/reports"));
const AdminPermissions = lazy(() => import("@/pages/admin/permissions"));
const AdminPayments = lazy(() => import("@/pages/admin/payments"));
const AdminSubscriptions = lazy(() => import("@/pages/admin/subscriptions"));
const AdminContent = lazy(() => import("@/pages/admin/content"));
const AdminTestUsers = lazy(() => import("@/pages/admin/test-users"));
const Alerts = lazy(() => import("@/pages/alerts"));
const Settings = lazy(() => import("@/pages/settings"));
const Subscription = lazy(() => import("@/pages/subscription"));
const BitcoinAnalytics = lazy(() => import("@/pages/bitcoin-analytics"));
const Members = lazy(() => import("@/pages/members"));
const MarketData = lazy(() => import("@/pages/market-data"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Pricing = lazy(() => import("@/pages/pricing"));

// Loading component for better UX
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/signup" component={Auth} />
      <Route path="/login" component={Login} />
      <Route path="/pricing">
        <Suspense fallback={<LoadingScreen />}>
          <Pricing />
        </Suspense>
      </Route>
      <Route path="/dashboard">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <Dashboard />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/multi-ticker-dashboard">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <MultiTickerDashboard />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/trading">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <Trading />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <Admin />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/users">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminUsers />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/user-roles">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminUserRoles />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/tickers">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminTickers />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/signals">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminSignals />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/alerts">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminAlerts />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/notifications">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminNotifications />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/logs">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminLogs />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/analytics">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminAnalytics />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/integrations">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminIntegrations />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/reports">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminReports />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/permissions">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminPermissions />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/payments">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminPayments />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/subscriptions">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminSubscriptions />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/content">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminContent />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/admin/test-users">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <AdminTestUsers />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/alerts">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <Alerts />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/settings">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <Settings />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/subscription">
        <AuthGuard>
          <Suspense fallback={<LoadingScreen />}>
            <Subscription />
          </Suspense>
        </AuthGuard>
      </Route>
      <Route path="/bitcoin-analytics">
        <Suspense fallback={<LoadingScreen />}>
          <BitcoinAnalytics />
        </Suspense>
      </Route>
      <Route path="/members">
        <Suspense fallback={<LoadingScreen />}>
          <Members />
        </Suspense>
      </Route>
      <Route path="/market-data">
        <Suspense fallback={<LoadingScreen />}>
          <MarketData />
        </Suspense>
      </Route>
      <Route path="/about">
        <Suspense fallback={<LoadingScreen />}>
          <About />
        </Suspense>
      </Route>
      <Route path="/contact">
        <Suspense fallback={<LoadingScreen />}>
          <Contact />
        </Suspense>
      </Route>
      <Route path="/privacy">
        <Suspense fallback={<LoadingScreen />}>
          <Privacy />
        </Suspense>
      </Route>
      <Route path="/terms">
        <Suspense fallback={<LoadingScreen />}>
          <Terms />
        </Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  // Global error handling for chart-related issues
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
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <PerformanceOptimizer>
            <div className="min-h-screen bg-background text-foreground">
              <Router />
              <SessionWarning />
              <Toaster />
            </div>
          </PerformanceOptimizer>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}