"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "../admin.css";
import {
  AppShell,
  Group,
  Title,
  Text,
  NavLink,
  Burger,
  ActionIcon,
  ScrollArea,
  Image as MantineImage,
  Tooltip,
  Stack,
  Button,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconGauge, IconUsers, IconSettings, IconBox, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconLogout, IconMail } from "@tabler/icons-react";
import { apiClient } from '@/lib/api';
import AdminErrorBoundary from '../ErrorBoundary';

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure(); // mobile
  const [collapsed, setCollapsed] = useState(false); // desktop
  const pathname = usePathname();
  const router = useRouter();
  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: IconGauge },
    { href: "/admin/products", label: "Products", icon: IconBox },
    { href: "/admin/contact-submissions", label: "Contact Submissions", icon: IconMail },
    { href: "/admin/career", label: "Careers", icon: IconUsers },
    { href: "/admin/settings", label: "Settings", icon: IconSettings },
  ];

  const handleLogout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem("adminUser");
      router.replace("/admin");
    }
  }, [router]);

  // Close mobile menu when pathname changes (navigation)
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCollapsed(prev => !prev);
      }
      
      // Ctrl/Cmd + Shift + L: Logout
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        handleLogout();
      }
      
      // Escape: Close mobile menu
      if (e.key === 'Escape' && opened) {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [opened, close, handleLogout]);

  // Verify auth token on mount; redirect to /admin if invalid/expired
  useEffect(() => {
    let isActive = true;

    const verify = async () => {
      try {
        const res = await fetch('/api/admin/auth', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        });

        if (!isActive) return;

        if (!res.ok) {
          sessionStorage.removeItem('adminUser');
          router.replace('/admin');
          return;
        }

        // Optionally refresh stored user info
        try {
          const data = await res.json();
          const user = data?.user;
          if (user) {
            sessionStorage.setItem('adminUser', JSON.stringify(user));
          }
        } catch {
          // ignore JSON errors
        }
      } catch {
        // Network error: treat as unauthorized for safety
        sessionStorage.removeItem('adminUser');
        router.replace('/admin');
      }
    };

    verify();
    return () => { isActive = false; };
  }, [router]);

  return (
    <AppShell
      header={{ height: 50 }}
      navbar={{ 
        width: collapsed ? 56 : 200, 
        breakpoint: "xs", 
        collapsed: { mobile: !opened } 
      }}
      padding="xs"
    >
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="xs">
          <Group gap={4} wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="xs" aria-label="Toggle navigation" />
            {!collapsed && (
              <MantineImage 
                src="/imgs/site-logo.png" 
                alt="Seen Group Logo" 
                h={40}
                w="auto" 
                fit="contain" 
              />
            )}
            <Title order={6} hiddenFrom="xs">SG Admin</Title>
            <Title order={5} visibleFrom="xs">Seen Group Admin</Title>
          </Group>
          <Group gap={4} wrap="nowrap">
            <Tooltip label={collapsed ? "Expand sidebar (Ctrl+K)" : "Collapse sidebar (Ctrl+K)"} withArrow>
              <ActionIcon 
                variant="subtle" 
                onClick={() => setCollapsed((v) => !v)} 
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                size="sm"
              >
                {collapsed ? <IconLayoutSidebarLeftExpand size={16} /> : <IconLayoutSidebarLeftCollapse size={16} />}
              </ActionIcon>
            </Tooltip>
            <Text size="xs" c="dimmed" hiddenFrom="xs">Admin</Text>
            <Text size="sm" c="dimmed" visibleFrom="xs">Admin</Text>
            <Tooltip label="Logout (Ctrl+Shift+L)" withArrow>
              <Button 
                size="xs" 
                variant="light" 
                leftSection={<IconLogout size={12} />} 
                onClick={handleLogout}
                px={6}
              >
                <Box hiddenFrom="xs">Out</Box>
                <Box visibleFrom="xs">Logout</Box>
              </Button>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={4}>
        {collapsed ? (
          <Stack align="center" gap={4}>
            {links.map((l) => {
              const ActiveIcon = l.icon;
              const active = pathname?.startsWith(l.href);
              return (
                <Tooltip key={l.href} label={l.label} position="right" withArrow>
                  <ActionIcon
                    component={Link}
                    href={l.href}
                    variant={active ? "filled" : "subtle"}
                    color={active ? "brand" : "gray"}
                    size="sm"
                    aria-label={l.label}
                  >
                    <ActiveIcon size={16} />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Stack>
        ) : (
          <ScrollArea type="auto" style={{ height: "100%" }}>
            {links.map((l) => {
              const active = pathname?.startsWith(l.href);
              const Icon = l.icon;
              return (
                <NavLink
                  key={l.href}
                  component={Link}
                  href={l.href}
                  label={l.label}
                  leftSection={<Icon size={16} />}
                  active={!!active}
                  aria-label={l.label}
                />
              );
            })}
          </ScrollArea>
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <AdminErrorBoundary>
          {children}
        </AdminErrorBoundary>
      </AppShell.Main>
    </AppShell>
  );
}



