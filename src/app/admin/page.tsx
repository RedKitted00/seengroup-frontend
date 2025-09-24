"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Center,
  Container,
  Alert,
  Image as MantineImage,
  Modal,
} from '@mantine/core';
import { IconMail, IconLock, IconArrowRight, IconAlertCircle } from '@tabler/icons-react';
// Removed unused apiClient import

export default function AdminSignIn() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState({ email: false, password: false });
  const [rememberMe, setRememberMe] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpId, setOtpId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') setIsValid((p) => ({ ...p, email: validateEmail(value) }));
    if (name === 'password') setIsValid((p) => ({ ...p, password: validatePassword(value) }));
    if (error) setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      // Submit via form submit for consistency
      (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid.email || !isValid.password) {
      setError('Please fill in all fields correctly');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/auth`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...credentials, rememberMe })
      });

      const data = await response.json();

      // If backend requires OTP, we get 202 and an otpId
      if (response.status === 202 && (data.success || data.message)) {
        const id = data?.data?.otpId;
        if (id) {
          setOtpId(id);
          setShowOtp(true);
          return; // Wait for OTP verification
        }
      }

      if (response.ok && data.success) {
        // Store user info in sessionStorage (not sensitive data)
        const user = data.data?.user || data.user;
        if (user) {
          sessionStorage.setItem('adminUser', JSON.stringify(user));
        }
        router.push('/admin/dashboard');
      } else {
        setError(data.error || data.message || 'Invalid credentials');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpId) return;
    if (!/^\d{6}$/.test(otpCode)) {
      setError('Please enter the 6-digit code');
      return;
    }
    setVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ otpId, code: otpCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const user = data.user || data.data?.user;
        if (user) {
          sessionStorage.setItem('adminUser', JSON.stringify(user));
        }
        setShowOtp(false);
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid or expired code');
      }
    } catch {
      setError('Network error during code verification');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Container size="xs" py="xl">
      <Center mih="100dvh">
        <Paper withBorder p="xl" radius="md" bg="dark.6" style={{ width: '100%' }}>
          <Stack gap="md">
            <Group justify="center" mb="xs">
              <MantineImage src="/imgs/site-logo.png" alt="Seen Group Logo" h={100} w="auto" fit="contain" />
            </Group>
            <div>
              <Title order={3}>Sign In</Title>
              <Text c="dimmed" size="sm">Access your admin dashboard</Text>
            </div>

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" aria-live="assertive">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <Stack gap="sm">
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  label="Email address"
                  placeholder="info@seengrp.com"
                  value={credentials.email}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  leftSection={<IconMail size={16} />}
                  autoComplete="username"
                  inputMode="email"
                  autoFocus
                  error={credentials.email && !isValid.email ? 'Please enter a valid email address' : undefined}
                  required
                />

                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                  onKeyDown={handleKeyDown}
                  leftSection={<IconLock size={16} />}
                  autoComplete="current-password"
                  error={credentials.password && !isValid.password ? 'Password must be at least 6 characters' : undefined}
                  required
                />

                <Group justify="space-between" align="center">
                                  <Button 
                  type="submit" 
                  loading={isLoading} 
                  disabled={!isValid.email || !isValid.password} 
                  rightSection={!isLoading ? <IconArrowRight size={16} /> : null}
                  style={{ 
                    transition: 'all 0.2s ease',
                    transform: isLoading ? 'scale(0.98)' : 'scale(1)'
                  }}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                  <Text size="sm" c="dimmed" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ 
                        margin: 0,
                        accentColor: 'var(--mantine-color-blue-6)',
                        cursor: 'pointer'
                      }}
                    />
                    <label htmlFor="rememberMe" style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Remember me
                    </label>
                  </Text>
                </Group>
              </Stack>
            </form>

            <Text c="dimmed" ta="center" size="xs">© 2025 Seen Group. All rights reserved.</Text>
          </Stack>
        </Paper>
      </Center>

      <Modal opened={showOtp} onClose={() => {}} withCloseButton={false} centered title="Enter 6-digit code">
        <Stack gap="sm">
          <Text c="dimmed" size="sm">We sent a 6-digit code to the admin email. Enter it below.</Text>
          <TextInput
            label="6-digit code"
            placeholder="123456"
            value={otpCode}
            onChange={(e) => setOtpCode(e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 6))}
            maxLength={6}
            inputMode="numeric"
            pattern="\d{6}"
            required
          />
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">{error}</Alert>
          )}
          <Group justify="flex-end">
            <Button onClick={handleVerifyOtp} loading={verifying} disabled={!/^\d{6}$/.test(otpCode)}>
              Verify
            </Button>
            <Button variant="light" loading={resending} onClick={async () => {
              if (!otpId) return;
              setResending(true);
              setError('');
              try {
                const r = await fetch('/api/admin/auth/resend-otp', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ otpId })
                });
                const d = await r.json();
                if (!r.ok) setError(d.message || 'Please wait before requesting a new code');
              } catch {
                setError('Failed to resend code');
              } finally {
                setResending(false);
              }
            }}>Resend code</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

