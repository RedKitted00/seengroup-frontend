import React from 'react';
import { Skeleton, Card, Group, Stack, Table } from '@mantine/core';

// Table row skeleton
export const TableRowSkeleton = ({ columns = 6 }: { columns?: number }) => (
  <Table.Tr>
    {Array.from({ length: columns }).map((_, i) => (
      <Table.Td key={i}>
        <Skeleton height={16} width={`${Math.random() * 40 + 60}%`} />
      </Table.Td>
    ))}
  </Table.Tr>
);

// Product table row skeleton
export const ProductRowSkeleton = () => (
  <Table.Tr>
    <Table.Td><Skeleton height={36} width={48} /></Table.Td>
    <Table.Td><Skeleton height={16} width="80%" /></Table.Td>
    <Table.Td><Skeleton height={16} width="60%" /></Table.Td>
    <Table.Td><Skeleton height={16} width="70%" /></Table.Td>
    <Table.Td><Skeleton height={16} width="50%" /></Table.Td>
    <Table.Td><Skeleton height={16} width="60%" /></Table.Td>
    <Table.Td>
      <Group gap={4}>
        <Skeleton height={32} width={32} />
        <Skeleton height={32} width={32} />
      </Group>
    </Table.Td>
  </Table.Tr>
);

// Message table row skeleton
export const MessageRowSkeleton = () => (
  <Table.Tr>
    <Table.Td><Skeleton height={20} width={20} /></Table.Td>
    <Table.Td>
      <Group gap="sm">
        <Skeleton height={32} width={32} radius="xl" />
        <div>
          <Skeleton height={16} width={120} mb={4} />
          <Skeleton height={12} width={80} />
        </div>
      </Group>
    </Table.Td>
    <Table.Td><Skeleton height={16} width={200} /></Table.Td>
    <Table.Td><Skeleton height={16} width={100} /></Table.Td>
    <Table.Td><Skeleton height={16} width={80} /></Table.Td>
    <Table.Td>
      <Group gap={4}>
        <Skeleton height={32} width={32} />
        <Skeleton height={32} width={32} />
      </Group>
    </Table.Td>
  </Table.Tr>
);

// Category card skeleton
export const CategoryCardSkeleton = () => (
  <Card withBorder p="sm" bg="dark.6">
    <Skeleton height={20} width="60%" mb="sm" />
    <Skeleton height={16} width="40%" />
  </Card>
);

// Stat card skeleton
export const StatCardSkeleton = () => (
  <Card radius="lg" withBorder>
    <Group>
      <Skeleton height={48} width={48} radius="md" />
      <div style={{ flex: 1 }}>
        <Skeleton height={12} width="60%" mb={8} />
        <Skeleton height={24} width="40%" />
      </div>
    </Group>
  </Card>
);

// Section card skeleton
export const SectionCardSkeleton = () => (
  <Card radius="lg" withBorder>
    <Skeleton height={24} width="70%" mb="md" />
    <Stack>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} height={36} width="100%" />
      ))}
    </Stack>
  </Card>
);

// Product card skeleton
export const ProductCardSkeleton = () => (
  <Card withBorder radius="md" p="md">
    <Skeleton height={140} mb="sm" />
    <Group justify="space-between" mb="xs">
      <Skeleton height={20} width="60%" />
      <Skeleton height={20} width="30%" />
    </Group>
    <Stack gap={4}>
      <Group gap={8}>
        <Skeleton height={16} width={100} />
        <Skeleton height={16} width="60%" />
      </Group>
      <Group gap={8}>
        <Skeleton height={16} width={100} />
        <Skeleton height={16} width="50%" />
      </Group>
      <Group gap={8}>
        <Skeleton height={16} width={100} />
        <Skeleton height={16} width="70%" />
      </Group>
    </Stack>
  </Card>
);

// Job card skeleton
export const JobCardSkeleton = () => (
  <Card withBorder p="md">
    <Group justify="space-between" mb="sm">
      <Skeleton height={24} width="60%" />
      <Skeleton height={20} width="20%" />
    </Group>
    <Stack gap={8}>
      <Skeleton height={16} width="40%" />
      <Skeleton height={16} width="30%" />
      <Skeleton height={16} width="50%" />
    </Stack>
    <Group mt="md" gap={8}>
      <Skeleton height={24} width={60} />
      <Skeleton height={24} width={80} />
      <Skeleton height={24} width={70} />
    </Group>
  </Card>
);

// Application card skeleton
export const ApplicationCardSkeleton = () => (
  <Card withBorder p="md">
    <Group gap="sm" mb="sm">
      <Skeleton height={40} width={40} radius="xl" />
      <div style={{ flex: 1 }}>
        <Skeleton height={18} width="40%" mb={4} />
        <Skeleton height={14} width="60%" />
      </div>
      <Skeleton height={20} width={60} />
    </Group>
    <Stack gap={8}>
      <Skeleton height={16} width="50%" />
      <Skeleton height={16} width="30%" />
      <Skeleton height={16} width="40%" />
    </Stack>
  </Card>
);

// Grid skeleton wrapper
export const GridSkeleton = ({ 
  items, 
  columns = 3, 
  SkeletonComponent = StatCardSkeleton 
}: { 
  items: number; 
  columns?: number; 
  SkeletonComponent?: React.ComponentType;
}) => (
  <>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} style={{ 
        gridColumn: `span ${Math.ceil(12 / columns)}`,
        gridRow: Math.floor(i / columns) + 1 
      }}>
        <SkeletonComponent />
      </div>
    ))}
  </>
);

// Table skeleton wrapper
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 6, 
  SkeletonComponent = TableRowSkeleton 
}: { 
  rows?: number; 
  columns?: number; 
  SkeletonComponent?: React.ComponentType<{ columns?: number }>;
}) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonComponent key={i} columns={columns} />
    ))}
  </>
);

