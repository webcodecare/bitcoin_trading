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