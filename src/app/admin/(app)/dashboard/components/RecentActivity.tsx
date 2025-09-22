"use client";

import React from 'react';
import { Grid, Card, Title, Stack, Group, Text, Paper, Badge, Button } from "@mantine/core";

interface RecentApplication {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  status: string;
  createdAt: string;
}

interface RecentActivityProps {
  recentApplications: RecentApplication[];
}

export default function RecentActivity({ recentApplications }: RecentActivityProps) {
  return (
    <Grid mt="lg">
      <Grid.Col span={{ base: 12, lg: 12 }}>
        <Card radius="lg" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>Recent Applications</Title>
            <Button variant="subtle" size="xs" component="a" href="/admin/career">
              View All
            </Button>
          </Group>
          <Stack>
            {recentApplications.length > 0 ? (
              recentApplications.slice(0, 6).map((app, i) => (
                <Paper key={i} p="xs" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={500}>{app.name}</Text>
                      <Text size="xs" c="dimmed">{app.jobTitle || 'General Application'}</Text>
                    </div>
                    <Badge size="xs" color="blue">{app.status}</Badge>
                  </Group>
                </Paper>
              ))
            ) : (
              <Text size="sm" c="dimmed" ta="center">No recent applications</Text>
            )}
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  );
}

