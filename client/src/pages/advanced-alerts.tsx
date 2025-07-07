import React from 'react';
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import AlertSystem from '@/components/advanced/AlertSystem';
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

export default function AdvancedAlertsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <div className="ml-64 flex-1">
          {/* Top Bar */}
          <header className="bg-card border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Advanced Alert System</h1>
              </div>
              <Badge variant="outline" className="text-emerald-400">
                Multi-Channel Alerts
              </Badge>
            </div>
          </header>

          {/* Alert System Content */}
          <div className="p-6">
            <AlertSystem />
          </div>
        </div>
      </div>
    </div>
  );
}