"use client";

import React from 'react';
import { Grid, Card, Title, Stack, Group, Text, Badge } from "@mantine/core";
import { IconCircleCheck } from '@tabler/icons-react';

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
}

interface PerformanceMetrics {
  avgResponseTime: number;
  uptime: number;
  errorRate: number;
  activeUsers: number;
}

interface SystemHealthProps {
  systemHealth: SystemHealth;
  performanceMetrics: PerformanceMetrics;
}

export default function SystemHealth({ performanceMetrics }: SystemHealthProps) {

  return (
    <Grid>
      <Grid.Col span={{ base: 12, lg: 8 }}>
        <Card radius="lg" withBorder>
          <Title order={4} mb="md">System Health & Performance</Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack>
                <Group>
                  <Text size="sm" fw={500}>System Components</Text>
                </Group>
                <Group>
                  <Badge 
                    color="green"
                    leftSection={<IconCircleCheck size={14} />}
                  >
                    Database
                  </Badge>
                  <Badge 
                    color="green"
                    leftSection={<IconCircleCheck size={14} />}
                  >
                    API
                  </Badge>
                  <Badge 
                    color="green"
                    leftSection={<IconCircleCheck size={14} />}
                  >
                    Storage
                  </Badge>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack>
                <Text size="sm" fw={500}>Performance Metrics</Text>
                <Group>
                  <div>
                    <Text size="xs" c="dimmed">Uptime</Text>
                    <Text fw={500}>{performanceMetrics.uptime}%</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Response Time</Text>
                    <Text fw={500}>{performanceMetrics.avgResponseTime}ms</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Error Rate</Text>
                    <Text fw={500}>{performanceMetrics.errorRate}%</Text>
                  </div>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>
      </Grid.Col>
    </Grid>
  );
}

