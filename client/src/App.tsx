import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import AdminUsers from "@/pages/admin/users";
import AdminSignals from "@/pages/admin/signals";
import AdminTickers from "@/pages/admin/tickers";
import Alerts from "@/pages/alerts";
import Settings from "@/pages/settings";
import Pricing from "@/pages/pricing";
import Members from "@/pages/members";
import MarketData from "@/pages/market-data";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import AuthGuard from "@/components/auth/AuthGuard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/dashboard">
        <AuthGuard>
          <Dashboard />
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
