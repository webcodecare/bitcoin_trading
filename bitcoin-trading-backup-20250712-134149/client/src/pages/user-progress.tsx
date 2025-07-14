import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserProgressDashboard from '@/components/progress/UserProgressDashboard';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

export default function UserProgressPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <Sidebar />
          
          {/* Main Content */}
          <div className="ml-0 md:ml-64 flex-1">
            {/* Top Bar */}
            <header className="bg-card border-b border-border p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
                  <h1 className="text-xl md:text-2xl font-bold">User Progress</h1>
                </div>
                <Badge variant="outline" className="text-emerald-400 w-fit">
                  Achievement Tracking
                </Badge>
              </div>
            </header>

            {/* Progress Content */}
            <div className="p-4 md:p-6">
              <UserProgressDashboard />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}