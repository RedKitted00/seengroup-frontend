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

class DashboardErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Track error in analytics if available
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'exception', { 
        description: error.message, 
        fatal: false, 
        component: 'Dashboard' 
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container size="md" py="xl">
          <Paper p="xl" withBorder>
            <Stack align="center" gap="lg">
              <IconAlertCircle size={64} color="red" />
              <Title order={2} c="red">Dashboard Error</Title>
              
              <Alert icon={<IconAlertCircle size={16} />} title="Something went wrong" color="red">
                <Text size="sm">
                  The dashboard encountered an error while loading. This has been logged and our team will investigate.
                </Text>
              </Alert>

              {this.state.error && (
                <Paper p="md" withBorder bg="gray.0" style={{ width: '100%' }}>
                  <Text size="xs" fw={500} mb="xs">Error Details:</Text>
                  <Code block>{this.state.error.message}</Code>
                </Paper>
              )}

              <Stack gap="sm">
                <Button 
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => window.location.reload()}
                  variant="filled"
                  color="blue"
                >
                  Reload Dashboard
                </Button>
                
                <Button 
                  leftSection={<IconHome size={16} />}
                  variant="light"
                  component="a"
                  href="/admin"
                >
                  Go to Admin Home
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;

