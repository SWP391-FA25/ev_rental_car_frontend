import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { handleApiError, ERROR_TYPES, AppError } from '../lib/handleApiError';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    const appError = new AppError(error.message, ERROR_TYPES.UNKNOWN, 0, {
      originalError: error,
      errorInfo,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Handle the error (this will log it and potentially send to error reporting service)
    handleApiError(appError, {
      showToast: false, // Don't show toast for boundary errors
      logError: true,
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className='min-h-screen flex items-center justify-center bg-background p-4'>
          <Card className='w-full max-w-md'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
                <AlertTriangle className='h-6 w-6 text-destructive' />
              </div>
              <CardTitle className='text-xl font-semibold'>
                Oops! Something went wrong
              </CardTitle>
              <CardDescription>
                We encountered an unexpected error. This has been logged and
                we'll look into it.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {process.env.NODE_ENV === 'development' && (
                <div className='rounded-md bg-muted p-3'>
                  <p className='text-sm font-medium text-muted-foreground mb-2'>
                    Error Details (Development):
                  </p>
                  <p className='text-xs font-mono text-destructive break-all'>
                    {this.state.error?.message}
                  </p>
                  {this.state.errorId && (
                    <p className='text-xs text-muted-foreground mt-2'>
                      Error ID: {this.state.errorId}
                    </p>
                  )}
                </div>
              )}

              <div className='flex flex-col gap-2'>
                <Button onClick={this.handleRetry} className='w-full'>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Try Again
                </Button>
                <Button
                  variant='outline'
                  onClick={this.handleGoHome}
                  className='w-full'
                >
                  <Home className='mr-2 h-4 w-4' />
                  Go to Homepage
                </Button>
              </div>

              {this.props.showReportButton !== false && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full text-muted-foreground'
                  onClick={() => {
                    // Here you could integrate with error reporting service
                    // like Sentry, Bugsnag, etc.
                    console.log('Report error:', this.state.error);
                  }}
                >
                  Report this issue
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component to wrap components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = props => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

// Hook to create error boundary
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback(error => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

export default ErrorBoundary;
