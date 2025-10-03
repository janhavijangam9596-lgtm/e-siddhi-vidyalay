import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

// Generic Loading Component
export function LoadingSpinner({ size = 'default', text }: { size?: 'sm' | 'default' | 'lg', text?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

// Table Loading Skeleton
export function TableLoadingSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Card Loading Skeleton
export function CardLoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Form Loading Skeleton
export function FormLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

// Page Loading Component
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-6">
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-spin">
            <div className="absolute inset-1 bg-white dark:bg-gray-900 rounded-full"></div>
          </div>
          
          {/* Inner pulsing circle */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 animate-pulse flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
            {text}
          </p>
          <div className="flex items-center justify-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Full Screen Loading
export function FullScreenLoading({ text = 'Loading application...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg font-medium">{text}</p>
        <div className="animate-pulse">
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress Loading with Steps
export function ProgressLoading({ 
  progress, 
  text = "Loading...", 
  subText 
}: { 
  progress: number; 
  text?: string; 
  subText?: string; 
}) {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center space-y-4 w-full max-w-md">
        <div className="space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <h3 className="font-medium">{text}</h3>
          {subText && (
            <p className="text-sm text-muted-foreground">{subText}</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{progress}% complete</p>
        </div>
      </div>
    </div>
  );
}

// Dashboard Loading Skeleton
export function DashboardLoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards */}
      <CardLoadingSkeleton count={4} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Chart Loading Skeleton
export function ChartLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}

// System Initialization Loading
export function InitializationLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-600 rounded-full">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">eSiddhiविद्यालय</h1>
          <p className="text-gray-600">Smart Campus Management System</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium">Initializing system...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Authentication</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Database</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                <span>Modules</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-gray-300" />
                <span>Configuration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}