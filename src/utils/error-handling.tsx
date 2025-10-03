import React from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';

export interface ErrorInfo {
  message: string;
  statusCode?: number;
  details?: any;
  timestamp?: string;
}

export class AppError extends Error {
  public statusCode: number;
  public details?: any;
  public timestamp: string;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Network Error Component
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <CardTitle className="text-red-700">Network Error</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-muted-foreground">
          Unable to connect to the server. Please check your internet connection.
        </p>
        <div className="flex justify-center gap-2">
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
          {onRetry && (
            <Button onClick={onRetry}>
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Not Found Component
export function NotFound({ 
  title = "Page Not Found", 
  message = "The page you're looking for doesn't exist or has been moved.",
  onGoHome
}: { 
  title?: string;
  message?: string;
  onGoHome?: () => void;
}) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="text-6xl font-bold text-muted-foreground">404</div>
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-muted-foreground">{message}</p>
        <Button onClick={onGoHome || (() => window.location.href = '/')}>
          <Home className="h-4 w-4 mr-2" />
          Go Home
        </Button>
      </CardContent>
    </Card>
  );
}

// Generic Error Component
export function GenericError({ 
  error,
  onRetry,
  showDetails = false
}: { 
  error: ErrorInfo | Error;
  onRetry?: () => void;
  showDetails?: boolean;
}) {
  const errorInfo = error instanceof Error ? {
    message: error.message,
    details: error.stack,
    timestamp: new Date().toISOString()
  } : error;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Bug className="h-8 w-8 text-red-500" />
        </div>
        <CardTitle className="text-red-700">Something went wrong</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-center">
          {errorInfo.message || 'An unexpected error occurred'}
        </p>
        
        {showDetails && errorInfo.details && (
          <details className="text-sm bg-muted p-3 rounded">
            <summary className="cursor-pointer font-medium">Error Details</summary>
            <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
              {typeof errorInfo.details === 'string' ? errorInfo.details : JSON.stringify(errorInfo.details, null, 2)}
            </pre>
          </details>
        )}
        
        <div className="flex justify-center gap-2">
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </Button>
          {onRetry && (
            <Button onClick={onRetry}>
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Alert Error Component (for inline errors)
export function ErrorAlert({ 
  error, 
  onDismiss,
  className
}: { 
  error: string | ErrorInfo | Error;
  onDismiss?: () => void;
  className?: string;
}) {
  const message = typeof error === 'string' 
    ? error 
    : error instanceof Error 
      ? error.message 
      : error.message;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex justify-between items-center">
        <span>{message}</span>
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            ×
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Error Handler Utility Functions
export const errorHandler = {
  // Handle API errors
  handleApiError: (error: any) => {
    console.error('API Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      toast.error('Network error. Please check your connection.');
      return new AppError('Network connection failed', 0);
    }
    
    if (error.statusCode) {
      switch (error.statusCode) {
        case 401:
          toast.error('Authentication required. Please log in again.');
          return new AppError('Authentication required', 401);
        case 403:
          toast.error('Access denied. You don\'t have permission.');
          return new AppError('Access denied', 403);
        case 404:
          toast.error('Resource not found.');
          return new AppError('Resource not found', 404);
        case 500:
          toast.error('Server error. Please try again later.');
          return new AppError('Server error', 500);
        default:
          toast.error(error.message || 'An unexpected error occurred');
          return new AppError(error.message || 'Unknown error', error.statusCode);
      }
    }
    
    toast.error(error.message || 'An unexpected error occurred');
    return new AppError(error.message || 'Unknown error');
  },

  // Handle validation errors
  handleValidationError: (error: any) => {
    console.error('Validation Error:', error);
    toast.error(error.message || 'Please check your input and try again.');
    return new AppError(error.message || 'Validation failed', 400);
  },

  // Handle permission errors
  handlePermissionError: () => {
    toast.error('You don\'t have permission to perform this action.');
    return new AppError('Permission denied', 403);
  },

  // Log errors (in production, this would send to a logging service)
  logError: (error: any, context?: string) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('Error logged:', errorData);
    
    // In production, send to logging service like Sentry
    // Sentry.captureException(error, { extra: errorData });
  }
};

// HOC for error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  return function ErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundaryProvider fallback={fallback}>
        <Component {...props} />
      </ErrorBoundaryProvider>
    );
  };
}

// Error Boundary Provider Component
export function ErrorBoundaryProvider({
  children,
  fallback: _Fallback
}: {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}