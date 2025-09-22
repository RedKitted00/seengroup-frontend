"use client";

import React from 'react';
import Icon from '../ui/Icon';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class CareerErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Career page error:', error, errorInfo);
    
    // Log to analytics or error tracking service
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <Icon name="icon-alert" size={48} className="error-icon" />
            <h2>Something went wrong</h2>
            <p>We encountered an error while loading the career page. Please try refreshing the page.</p>
            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                <Icon name="icon-refresh" size={16} />
                Refresh Page
              </button>
              <button 
                onClick={() => this.setState({ hasError: false })}
                className="btn btn-secondary"
              >
                <Icon name="icon-arrow-left" size={16} />
                Try Again
              </button>
            </div>
            {process.env.NODE_ENV === 'production' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre>{this.state.error.stack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CareerErrorBoundary;

