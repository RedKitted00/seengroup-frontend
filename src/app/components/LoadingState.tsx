import React from 'react';
import { Group, Text, Loader } from '@mantine/core';

interface LoadingStateProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...", 
  size = 'md' 
}) => {
  return (
    <Group justify="center" py="xl">
      <Loader size={size} />
      <Text size="sm" c="dimmed">{message}</Text>
    </Group>
  );
};

