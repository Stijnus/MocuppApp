import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full flex items-center justify-center bg-red-900/20 rounded-lg p-6">
          <div className="text-center text-red-400 max-w-md">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-sm text-gray-300 mb-4">
              An error occurred while rendering the image editor. This might be due to a browser compatibility issue or a temporary glitch.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-black/30 rounded p-3 mb-4 text-xs">
                <summary className="cursor-pointer text-red-300 mb-2">Error Details</summary>
                <pre className="whitespace-pre-wrap text-gray-400">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex space-x-2 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 