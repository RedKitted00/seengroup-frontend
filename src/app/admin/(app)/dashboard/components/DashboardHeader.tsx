"use client";

import React from 'react';
import { Group, Title, Text, Button } from "@mantine/core";
import { IconActivity, IconRefresh, IconSettings, IconChartBar } from "@tabler/icons-react";

interface DashboardHeaderProps {
  setShowActivityModal: (show: boolean) => void;
  refreshing: boolean;
  refreshStats: () => void;
  clearCache: () => void;
  exportPerformanceData: () => void;
}

export default function DashboardHeader({
  setShowActivityModal,
  refreshing,
  refreshStats,
  clearCache,
  exportPerformanceData
}: DashboardHeaderProps) {
  return (
    <Group justify="space-between" mb="md" wrap="wrap" gap="xs">
      <div>
        <Title order={2}>Dashboard</Title>
        <Text c="dimmed" mt={4}>Real-time overview of your site performance and activity.</Text>
      </div>
      <Group gap="xs">
        <Button 
          leftSection={<IconActivity size={16} />} 
          variant="light" 
          onClick={() => setShowActivityModal(true)}
          size="sm"
        >
          Activity Feed
        </Button>
        <Button 
          leftSection={<IconRefresh size={16} />} 
          variant="light" 
          onClick={refreshStats}
          loading={refreshing}
          size="sm"
        >
          Refresh
        </Button>
        <Button 
          leftSection={<IconSettings size={16} />} 
          variant="light" 
          onClick={clearCache}
          size="sm"
        >
          Clear Cache
        </Button>
        <Button 
          leftSection={<IconChartBar size={16} />} 
          variant="light" 
          onClick={exportPerformanceData}
          size="sm"
        >
          Export Performance
        </Button>
      </Group>
    </Group>
  );
}

