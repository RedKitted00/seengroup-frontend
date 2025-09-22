"use client";

import React from 'react';
import { Container, Title, Text, Button, Stack, Alert, Code, Paper } from '@mantine/core';
import { IconAlertCircle, IconRefresh, IconHome } from '@tabler/icons-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class AdminErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin panel error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to analytics or error tracking service
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        component: 'AdminPanel'
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container size="md" py="xl">
          <Paper p="xl" radius="md" withBorder>
            <Stack align="center" gap="lg">
              <IconAlertCircle size={64} color="red" />
              
              <div style={{ textAlign: 'center' }}>
                              <Title order={2} c="red" mb="md">
                Admin Panel Error
              </Title>
                <Text c="dimmed" size="lg" mb="lg">
                  Something went wrong while loading the admin panel. Please try refreshing the page or contact support if the problem persists.
                </Text>
              </div>

              <Stack gap="sm" w="100%" maw={400}>
                <Button 
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => window.location.reload()}
                  size="lg"
                  fullWidth
                >
                  Refresh Page
                </Button>
                
                <Button 
                  leftSection={<IconHome size={16} />}
                  variant="light"
                  onClick={() => window.location.href = '/admin'}
                  size="md"
                  fullWidth
                >
                  Back to Login
                </Button>
              </Stack>

              {process.env.NODE_ENV === 'production' && this.state.error && (
                <Alert 
                  icon={<IconAlertCircle size={16} />} 
                  title="Development Error Details" 
                  color="red"
                  variant="light"
                  w="100%"
                >
                  <Text size="sm" mb="sm">
                    <strong>Error:</strong> {this.state.error.message}
                  </Text>
                  {this.state.errorInfo && (
                    <details>
                      <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                        <Text size="sm" fw={500}>Stack Trace</Text>
                      </summary>
                      <Code block style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                        {this.state.errorInfo.componentStack}
                      </Code>
                    </details>
                  )}
                </Alert>
              )}
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;

