"use client";

import React from 'react';
import { Grid, Card, Title, Stack, Button } from "@mantine/core";
import { IconPackage, IconSettings, IconUsers, IconChartBar, IconDatabase, IconActivity, IconArrowRight } from "@tabler/icons-react";

export default function QuickActions() {
  const sections = [
    { 
      title: "Content Management", 
      actions: [
        { label: "Manage Products", href: "/admin/products", icon: IconPackage },
        { label: "Edit Homepage", href: "/admin/settings", icon: IconSettings },
        { label: "Update About Page", href: "/admin/settings", icon: IconSettings }
      ] 
    },
    { 
      title: "User Management", 
      actions: [
        { label: "Career Applications", href: "/admin/career", icon: IconUsers },
        { label: "User Analytics", href: "#", icon: IconChartBar }
      ] 
    },
    { 
      title: "System", 
      actions: [
        { label: "Settings", href: "/admin/settings", icon: IconSettings },
        { label: "Backup & Restore", href: "#", icon: IconDatabase },
        { label: "System Logs", href: "#", icon: IconActivity }
      ] 
    },
  ];

  return (
    <Grid.Col span={{ base: 12, lg: 4 }}>
      <Card radius="lg" withBorder>
        <Title order={4} mb="md">Quick Actions</Title>
        <Stack>
          {sections.flatMap(section => section.actions).slice(0, 6).map((action, i) => (
            <Button 
              key={i} 
              variant="subtle" 
              color="gray" 
              justify="space-between" 
              rightSection={<IconArrowRight size={16} />}
              leftSection={<action.icon size={16} />}
              component="a"
              href={action.href}
              size="sm"
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </Card>
    </Grid.Col>
  );
}

