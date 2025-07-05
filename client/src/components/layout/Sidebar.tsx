import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  Bitcoin,
  TrendingUp,
  Bell,
  Settings,
  Shield,
  BarChart3,
  BarChart,
  Users,
  Coins,
  Activity,
  CreditCard,
  DollarSign,
  MessageSquare,
  FileText,
  Edit,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/admin" && location === "/admin") return true;
    if (path !== "/admin" && location.startsWith(path)) return true;
    return location === path;
  };

  const userNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: TrendingUp,
    },
    {
      title: "Multi-Ticker",
      href: "/multi-ticker",
      icon: BarChart3,
    },
    {
      title: "Alerts",
      href: "/alerts",
      icon: Bell,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const adminNavItems = [
    {
      title: "Overview",
      href: "/admin",
      icon: BarChart3,
    },
    {
      title: "User Management",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Subscriptions",
      href: "/admin/subscriptions",
      icon: CreditCard,
    },
    {
      title: "Payment Logs",
      href: "/admin/payments",
      icon: DollarSign,
    },
    {
      title: "Signal Logs",
      href: "/admin/signals",
      icon: Activity,
    },
    {
      title: "Ticker Management",
      href: "/admin/tickers",
      icon: Coins,
    },
    {
      title: "Alerts Monitor",
      href: "/admin/alerts",
      icon: Bell,
    },
    {
      title: "Notifications",
      href: "/admin/notifications",
      icon: MessageSquare,
    },
    {
      title: "Access Logs",
      href: "/admin/logs",
      icon: FileText,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: TrendingUp,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: BarChart,
    },
    {
      title: "API Integrations",
      href: "/admin/integrations",
      icon: Settings,
    },
    {
      title: "Content Management",
      href: "/admin/content",
      icon: Edit,
    },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <div className={cn("w-64 bg-card h-screen border-r border-border fixed left-0 top-0", className)}>
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-primary mb-8">
          {user?.role === 'admin' ? (
            <>
              <Shield className="h-6 w-6" />
              <span>Admin Panel</span>
            </>
          ) : (
            <>
              <Bitcoin className="h-6 w-6" />
              <span>CryptoStrategy Pro</span>
            </>
          )}
        </Link>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
