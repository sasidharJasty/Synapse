import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Page error caught:', error, errorInfo);
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
        <div className="container-mobile py-8">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-red-100)' }}>
              <AlertTriangle className="w-6 h-6" style={{ color: 'var(--color-red-600)' }} />
            </div>
            
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-sage-800)' }}>
              Page Error
            </h2>
            
            <p className="text-sm mb-4" style={{ color: 'var(--color-sage-600)' }}>
              Something went wrong on this page. Your data is safe.
            </p>

            <button
              onClick={this.handleRetry}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors mx-auto"
              style={{ 
                backgroundColor: 'var(--color-synapse-500)',
                color: 'white'
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary; 