"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Container, 
  LoadingOverlay, 
  Box,
  Timeline,
  Modal,
  Grid,
  Text,
} from "@mantine/core";
import { 
  IconPackage, 
  IconUsers, 
  IconActivity,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { fetchWithRetry } from '@/lib/http';
import { useAdminPerformance } from '../../hooks/useAdminPerformance';
import DashboardErrorBoundary from './components/DashboardErrorBoundary';
import DashboardHeader from './components/DashboardHeader';
import StatsCards from './components/StatsCards';
import SystemHealth from './components/SystemHealth';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';

interface DashboardStats {
  totalProducts: number;
  careerApplications: number;
  pageViews: number;
  uniqueVisitors: number;
  conversionRate: number;
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
  };
  performanceMetrics: {
    avgResponseTime: number;
    uptime: number;
    errorRate: number;
    activeUsers: number;
  };
  activityFeed: {
    id: string;
    type: 'application' | 'product' | 'system';
    title: string;
    description: string;
    timestamp: string;
    user?: string;
  }[];
  recentApplications: Array<{
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  // Performance monitoring
  const { trackApiCall, trackUserAction, trackError, exportPerformanceData } = useAdminPerformance('Dashboard');
  
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    careerApplications: 0,
    pageViews: 0,
    uniqueVisitors: 0,
    conversionRate: 0,
    systemHealth: {
      database: 'healthy',
      api: 'healthy',
      storage: 'healthy',
    },
    performanceMetrics: {
      avgResponseTime: 0,
      uptime: 100,
      errorRate: 0,
      activeUsers: 0,
    },
    activityFeed: [],
    recentApplications: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const startTime = performance.now();
      
      const response = await fetchWithRetry(`/api/proxy/admin/dashboard/stats`, {
        credentials: 'include',
      }, { retries: 2, timeoutMs: 8000 });

      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Track API call performance
      trackApiCall(false, loadTime);

      if (response.ok) {
        const data = await response.json();
        const payload = data?.data ?? data ?? {};
        
        // Log performance metrics
        if (data.cached || payload.cached) {
        } else {
        }
        
        setStats({
          totalProducts: payload.totalProducts ?? payload.productsTotal ?? payload.products_count ?? 0,
          
          // Use jobs total if provided; fall back to applications total
          careerApplications: 
            payload.jobsTotal ?? payload.totalJobs ?? payload.jobs_count ??
            payload.totalApplications ?? payload.applicationsTotal ?? payload.careerApplications ?? 0,
          pageViews: payload.pageViews ?? payload.views ?? 0,
          uniqueVisitors: payload.uniqueVisitors ?? payload.visitors ?? 0,
          conversionRate: payload.conversionRate ?? payload.conversion_rate ?? 0,
          systemHealth: payload.systemHealth ?? payload.health ?? {
            database: 'healthy',
            api: 'healthy',
            storage: 'healthy',
          },
          performanceMetrics: payload.performanceMetrics ?? payload.performance ?? {
            avgResponseTime: 0,
            uptime: 100,
            errorRate: 0,
            activeUsers: 0,
          },
          activityFeed: payload.activityFeed ?? payload.activity ?? [],
          
          recentApplications: payload.recentApplications ?? payload.recent_apps ?? [],
        });
      } else {
        console.error('Failed to fetch dashboard stats:', response.status);
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch {
      notifications.show({
        title: "Backend is slow",
        message: "Still loading data... we'll retry automatically.",
        color: "yellow",
      });
    } finally {
      setLoading(false);
    }
  }, [trackApiCall]);

  const refreshStats = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadStats();
      trackUserAction('refresh_dashboard', true);
      notifications.show({
        title: "Success",
        message: "Dashboard refreshed successfully",
        color: "green",
      });
    } catch {
      trackError('refresh_dashboard');
    } finally {
      setRefreshing(false);
    }
  }, [loadStats, trackUserAction, trackError]);

  useEffect(() => {
    loadStats();
    // Smart refresh only when tab is visible and user is active
    let interval: NodeJS.Timeout;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        // Refresh when tab becomes visible
        loadStats();
        interval = setInterval(loadStats, 300000); // 5 minutes instead of 30 seconds
      }
    };

    const handleUserActivity = () => {
      // Reset timer on user activity
      clearInterval(interval);
      interval = setInterval(loadStats, 300000);
    };

    // Only start interval if tab is visible
    if (!document.hidden) {
      interval = setInterval(loadStats, 300000);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('click', handleUserActivity);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('click', handleUserActivity);
    };
  }, [loadStats]);





  return (
    <DashboardErrorBoundary>
      <Container size="lg" py="lg">
        <DashboardHeader
          setShowActivityModal={setShowActivityModal}
          refreshing={refreshing}
          refreshStats={refreshStats}
          clearCache={() => {
            if (confirm('Are you sure you want to clear the dashboard cache? This will refresh all data.')) {
              fetch(`/api/proxy/admin/cache/clear`, {
                method: 'POST',
                credentials: 'include',
              }).then(() => {
                trackUserAction('clear_cache', true);
                notifications.show({
                  title: "Cache Cleared",
                  message: "Dashboard cache has been cleared",
                  color: "blue",
                });
                loadStats();
              }).catch(() => {
                trackError('clear_cache');
                notifications.show({
                  title: "Error",
                  message: "Failed to clear cache",
                  color: "red",
                });
              });
            }
          }}
          exportPerformanceData={exportPerformanceData}
        />

              <Box pos="relative">
          <LoadingOverlay visible={loading} />
          
          {/* Main Stats Cards */}
          <StatsCards 
            stats={{
              totalProducts: stats.totalProducts,

              careerApplications: stats.careerApplications,
              pageViews: stats.pageViews
            }}
            loading={loading}
          />

                  {/* System Health & Performance */}
          <Grid mt="lg">
            <SystemHealth 
              systemHealth={stats.systemHealth}
              performanceMetrics={stats.performanceMetrics}
            />
            <QuickActions />
          </Grid>

        {/* Recent Activity & Quick Sections */}
        <RecentActivity 
          recentApplications={stats.recentApplications}
        />
      </Box>

      {/* Activity Feed Modal */}
      <Modal 
        opened={showActivityModal} 
        onClose={() => setShowActivityModal(false)}
        title="Activity Feed"
        size="lg"
      >
        <Timeline active={stats.activityFeed.length - 1}>
          {stats.activityFeed.map((activity) => (
            <Timeline.Item 
              key={activity.id} 
              bullet={activity.type === 'application' ? <IconUsers size={12} /> : 
                     activity.type === 'product' ? <IconPackage size={12} /> :
                     <IconActivity size={12} />}
              title={activity.title}
            >
              <Text size="sm" c="dimmed" mt={4}>
                {activity.description}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {new Date(activity.timestamp).toLocaleString()}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Modal>
    </Container>
    </DashboardErrorBoundary>
  );
}




