import React from 'react';
import debug from 'debug';
const debugRender = debug('react:render');

// Simple error boundary for catching render errors
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    debugRender('ErrorBoundary created');
  }

  static getDerivedStateFromError(error) {
    debugRender('ErrorBoundary: getDerivedStateFromError triggered');
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    debugRender('ErrorBoundary: componentDidCatch', error, errorInfo);
    // You can log error to a service here
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      debugRender('ErrorBoundary: rendering fallback UI');
      return (
        <div style={{ padding: 32, color: 'red' }}>
          <h2>Something went wrong.</h2>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // Always render children and an Outlet for nested routes
    return this.props.children;
  }
}
