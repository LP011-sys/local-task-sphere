
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface QueryWrapperProps {
  isLoading: boolean;
  error: any;
  children: React.ReactNode;
  loadingSkeleton?: React.ReactNode;
  retryFn?: () => void;
  emptyState?: React.ReactNode;
  data?: any;
}

export default function QueryWrapper({ 
  isLoading, 
  error, 
  children, 
  loadingSkeleton,
  retryFn,
  emptyState,
  data 
}: QueryWrapperProps) {
  if (isLoading) {
    return loadingSkeleton || <DefaultLoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <CardContent className="space-y-4">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" aria-hidden="true" />
          <p className="text-body text-muted-foreground">
            Failed to load data. Please try again.
          </p>
          {retryFn && (
            <Button onClick={retryFn} variant="outline" aria-label="Retry loading data">
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (data && Array.isArray(data) && data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return <>{children}</>;
}

function DefaultLoadingSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </Card>
  );
}
