"use client";

import React from 'react';
import { Grid, Card, Group, ThemeIcon, Text, Title, Badge } from "@mantine/core";
import { IconPackage, IconUsers, IconEye, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

interface DashboardStats {
  totalProducts: number;
  careerApplications: number;
  pageViews: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
  loading: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const statsData = [
    { 
      icon: IconPackage, 
      color: "blue", 
      label: "Total Products", 
      value: stats.totalProducts.toString(),
      href: "/admin/products",
      trend: "+12%",
      trendDirection: "up" as const
    },
    { 
      icon: IconUsers, 
      color: "violet", 
      label: "Career Applications", 
      value: stats.careerApplications.toString(),
      href: "/admin/career",
      trend: "+8%",
      trendDirection: "up" as const
    },
    { 
      icon: IconEye, 
      color: "orange", 
      label: "Page Views", 
      value: stats.pageViews.toLocaleString(),
      href: "#",
      trend: "+15%",
      trendDirection: "up" as const
    },
  ];

  if (loading) {
    return (
      <Grid>
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 6, lg: 4 }}>
            <Card radius="lg" withBorder>
              <Group>
                <div style={{ width: 48, height: 48, background: 'var(--mantine-color-gray-3)', borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, width: '60%', background: 'var(--mantine-color-gray-3)', marginBottom: 8 }} />
                  <div style={{ height: 24, width: '40%', background: 'var(--mantine-color-gray-3)' }} />
                </div>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  return (
    <Grid>
      {statsData.map((s, i) => (
        <Grid.Col key={i} span={{ base: 12, sm: 6, lg: 3 }}>
          <Card radius="lg" withBorder>
            <Group justify="space-between">
              <Group>
                <ThemeIcon variant="light" color={s.color} size={48} radius="md">
                  <s.icon size={24} />
                </ThemeIcon>
                <div>
                  <Text size="sm" c="dimmed">{s.label}</Text>
                  <Title order={3}>{s.value}</Title>
                </div>
              </Group>
              <Badge 
                color={s.trendDirection === 'up' ? 'green' : 'red'} 
                variant="light"
                leftSection={s.trendDirection === 'up' ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
              >
                {s.trend}
              </Badge>
            </Group>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
}

