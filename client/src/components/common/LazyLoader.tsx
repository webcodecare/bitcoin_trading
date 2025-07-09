import React, { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const DefaultFallback = () => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function LazyLoader({ children, fallback, className }: LazyLoaderProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback || <DefaultFallback />}>
        {children}
      </Suspense>
    </div>
  );
}