import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Container, Text } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container size="md" py="xl">
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Something went wrong"
            color="red"
            variant="filled"
            mb="md"
          >
            <Text size="sm" mb="md">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </Text>
            <Button
              leftSection={<IconRefresh size={14} />}
              onClick={this.handleRetry}
              variant="light"
              size="sm"
            >
              Try Again
            </Button>
          </Alert>
          
          {process.env.NODE_ENV === 'production' && this.state.error && (
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details (Development)
              </summary>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '1rem', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </Container>
      );
    }

    return this.props.children;
  }
}

