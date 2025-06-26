import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-sage-50)' }}>
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-red-100)' }}>
              <AlertTriangle className="w-8 h-8" style={{ color: 'var(--color-red-600)' }} />
            </div>
            
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-sage-800)' }}>
              Oops! Something went wrong
            </h2>
            
            <p className="text-sm mb-6" style={{ color: 'var(--color-sage-600)' }}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--color-synapse-500)',
                  color: 'white'
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-3 rounded-xl font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--color-sage-100)',
                  color: 'var(--color-sage-700)'
                }}
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium" style={{ color: 'var(--color-sage-700)' }}>
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--color-sage-100)' }}>
                  <pre style={{ color: 'var(--color-sage-800)' }}>
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 