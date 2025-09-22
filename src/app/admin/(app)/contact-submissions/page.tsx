"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Card,
  Title,
  Group,
  Text,
  Button,
  ActionIcon,
  TextInput,
  Select,
  Table,
  Badge,
  ScrollArea,
  Pagination,
  Modal,
  Stack,
  Divider,
  Checkbox,
  LoadingOverlay,
  Grid,
  Paper,
  SimpleGrid,
  ThemeIcon,
  Textarea,
  Alert,
} from "@mantine/core";
import {
  IconMail,
  IconSearch,
  IconEye,
  IconTrash,
  IconRefresh,
  IconInbox,
  IconClock,
  IconBuilding,
  IconEdit,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { fetchWithRetry } from '@/lib/http';

interface ContactSubmission {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  country: string;
  phone: string;
  email: string;
  contactReason: string;
  message?: string;
  requirements?: Array<{
    productName: string;
    partNumber: string;
    quantity: string;
    leadTime: string;
  }>;
  status: 'NEW' | 'PROCESSING' | 'CONTACTED' | 'CLOSED';
  read: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactStats {
  totalSubmissions: number;
  recentSubmissions: number;
  countryStats: Record<string, number>;
  statusStats: Record<string, number>;
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [stats, setStats] = useState<ContactStats>({
    totalSubmissions: 0,
    recentSubmissions: 0,
    countryStats: {},
    statusStats: {},
  });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [readFilter, setReadFilter] = useState<string>("");
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<ContactSubmission | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<ContactSubmission | null>(null);
  const [editForm, setEditForm] = useState<{
    status: ContactSubmission['status'];
    read: boolean;
    notes: string;
  }>({
    status: 'NEW',
    read: false,
    notes: ''
  });

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(readFilter && { read: readFilter }),
      });

      const response = await fetchWithRetry(
        `/api/proxy/contact/submissions?${params}`,
        { credentials: 'include' },
        { retries: 2, timeoutMs: 8000 }
      );

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.data.submissions || []);
        setTotalPages(data.data.totalPages || 1);
        setTotalItems(data.data.total || 0);
      } else {
        const errorData = await response.json();
        notifications.show({
          title: 'Error',
          message: errorData.error || 'Failed to load contact submissions',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Load submissions error:', error);
      notifications.show({
        title: 'Error',
        message: 'Network error loading submissions',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, readFilter]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetchWithRetry(
        `/api/proxy/contact/stats`,
        { credentials: 'include' },
        { retries: 2, timeoutMs: 8000 }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.data || {
          totalSubmissions: 0,
          recentSubmissions: 0,
          countryStats: {},
          statusStats: {},
        });
      } else {
        console.error('Failed to load stats:', response.status);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const updateSubmission = async (id: string, updateData: Partial<ContactSubmission>) => {
    try {
      const response = await fetchWithRetry(
        `/api/proxy/contact/submissions/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updateData),
        },
        { retries: 1, timeoutMs: 8000 }
      );

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Submission updated successfully',
          color: 'green',
        });
        await loadSubmissions();
        await loadStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update submission');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update submission',
        color: 'red',
      });
    }
  };

  const confirmDelete = (submission: ContactSubmission) => {
    setSubmissionToDelete(submission);
    setDeleteModalOpen(true);
  };

  const deleteSubmission = async (id: string) => {
    try {
      const response = await fetchWithRetry(
        `/api/proxy/contact/submissions/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
        { retries: 1, timeoutMs: 8000 }
      );

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Submission deleted successfully',
          color: 'green',
        });
        await loadSubmissions();
        await loadStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete submission');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete submission',
        color: 'red',
      });
    }
  };

  const bulkDelete = async () => {
    if (selectedSubmissions.length === 0) return;

    try {
      const response = await fetchWithRetry(
        `/api/proxy/contact/submissions/bulk`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ids: selectedSubmissions }),
        },
        { retries: 1, timeoutMs: 10000 }
      );

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: `Successfully deleted ${selectedSubmissions.length} submissions`,
          color: 'green',
        });
        setSelectedSubmissions([]);
        await loadSubmissions();
        await loadStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete submissions');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete submissions',
        color: 'red',
      });
    }
  };

  const viewSubmission = (submission: ContactSubmission) => {
    // Normalize requirements in case backend sent a JSON string or non-array
    let normalizedRequirements: Array<{ productName: string; partNumber: string; quantity: string; leadTime: string }> | undefined;
    const raw = (submission as unknown as { requirements?: unknown }).requirements;
    if (Array.isArray(raw)) {
      normalizedRequirements = raw as Array<{ productName: string; partNumber: string; quantity: string; leadTime: string }>;
    } else if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        normalizedRequirements = Array.isArray(parsed) ? parsed : [];
      } catch {
        normalizedRequirements = [];
      }
    } else if (raw == null) {
      normalizedRequirements = [];
    } else {
      normalizedRequirements = [];
    }

    setCurrentSubmission({ ...submission, requirements: normalizedRequirements });
    setViewModalOpen(true);
  };

  const editSubmission = (submission: ContactSubmission) => {
    setCurrentSubmission(submission);
    setEditForm({
      status: submission.status,
      read: submission.read,
      notes: submission.notes || ''
    });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!currentSubmission) return;
    
    await updateSubmission(currentSubmission.id, editForm);
    setEditModalOpen(false);
    setCurrentSubmission(null);
  };

  const toggleSelection = (id: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleAllSelections = () => {
    if (selectedSubmissions.length === submissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(submissions.map(s => s.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'blue';
      case 'PROCESSING': return 'yellow';
      case 'CONTACTED': return 'green';
      case 'CLOSED': return 'gray';
      default: return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SubmissionRow = React.memo(function SubmissionRow({
    submission,
    isSelected,
    onToggleSelect,
    onView,
    onEdit,
    onDelete,
  }: {
    submission: ContactSubmission;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onView: (s: ContactSubmission) => void;
    onEdit: (s: ContactSubmission) => void;
    onDelete: (s: ContactSubmission) => void;
  }) {
    const requirementsCount = Array.isArray(submission.requirements)
      ? submission.requirements.length
      : (typeof submission.requirements === 'string'
          ? (() => { try { const p = JSON.parse(submission.requirements); return Array.isArray(p) ? p.length : 0; } catch { return 0; } })()
          : 0);

    return (
      <Table.Tr>
        <Table.Td>
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelect(submission.id)}
          />
        </Table.Td>
        <Table.Td>
          <Stack gap={4}>
            <Text fw={500}>
              {submission.firstName} {submission.lastName}
            </Text>
            <Text size="sm" c="dimmed">
              {submission.email}
            </Text>
            <Text size="sm" c="dimmed">
              {submission.phone}
            </Text>
          </Stack>
        </Table.Td>
        <Table.Td>
          <Stack gap={4}>
            <Text fw={500}>{submission.company}</Text>
            <Text size="sm" c="dimmed">
              {submission.country}
            </Text>
          </Stack>
        </Table.Td>
        <Table.Td>
          <Badge color="blue" variant="light">
            {submission.contactReason.charAt(0).toUpperCase() + submission.contactReason.slice(1).replace('-', ' ')}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text size="sm">
            {requirementsCount} item{requirementsCount !== 1 ? 's' : ''}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge color={getStatusColor(submission.status)}>
            {submission.status}
          </Badge>
          {!submission.read && (
            <Badge color="red" size="xs" ml={8}>
              NEW
            </Badge>
          )}
        </Table.Td>
        <Table.Td>
          <Text size="sm">{formatDate(submission.createdAt)}</Text>
        </Table.Td>
        <Table.Td>
          <Group gap={4}>
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView(submission)}
            >
              <IconEye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="yellow"
              onClick={() => onEdit(submission)}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => onDelete(submission)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  useEffect(() => {
    loadSubmissions();
    loadStats();
  }, [currentPage, pageSize, searchTerm, statusFilter, readFilter, loadSubmissions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, readFilter]);

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1} c="white">
          <IconMail size={28} style={{ marginRight: 10 }} /> Contact Submissions
        </Title>
        <Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            variant="light"
            onClick={() => {
              loadSubmissions();
              loadStats();
            }}
            loading={loading}
          >
            Refresh
          </Button>
          {selectedSubmissions.length > 0 && (
            <Button
              leftSection={<IconTrash size={16} />}
              color="red"
              onClick={bulkDelete}
            >
              Delete Selected ({selectedSubmissions.length})
            </Button>
          )}
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        <Paper p="md" radius="md" withBorder pos="relative">
          <LoadingOverlay visible={statsLoading} />
          <Group>
            <ThemeIcon size="lg" variant="light" color="blue">
              <IconInbox size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Total Submissions</Text>
              <Text fw={700} size="xl">{stats.totalSubmissions}</Text>
            </div>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group>
            <ThemeIcon size="lg" variant="light" color="green">
              <IconClock size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Recent (7 days)</Text>
              <Text fw={700} size="xl">{stats.recentSubmissions}</Text>
            </div>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group>
            <ThemeIcon size="lg" variant="light" color="yellow">
              <IconMail size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">New</Text>
              <Text fw={700} size="xl">{stats.statusStats.NEW || 0}</Text>
            </div>
          </Group>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group>
            <ThemeIcon size="lg" variant="light" color="orange">
              <IconBuilding size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Countries</Text>
              <Text fw={700} size="xl">{Object.keys(stats.countryStats).length}</Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>

      <Card mb="md" withBorder>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <TextInput
              placeholder="Search submissions..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              placeholder="Filter by status"
              data={[
                { value: '', label: 'All Statuses' },
                { value: 'NEW', label: 'New' },
                { value: 'PROCESSING', label: 'Processing' },
                { value: 'CONTACTED', label: 'Contacted' },
                { value: 'CLOSED', label: 'Closed' },
              ]}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || '')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              placeholder="Filter by read status"
              data={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Read' },
                { value: 'false', label: 'Unread' },
              ]}
              value={readFilter}
              onChange={(value) => setReadFilter(value || '')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              placeholder="Items per page"
              data={[
                { value: '5', label: '5 per page' },
                { value: '10', label: '10 per page' },
                { value: '20', label: '20 per page' },
                { value: '50', label: '50 per page' },
              ]}
              value={pageSize.toString()}
              onChange={(value) => setPageSize(parseInt(value || '10'))}
            />
          </Grid.Col>
        </Grid>
      </Card>

      <Card withBorder>
        <LoadingOverlay visible={loading} />
        <ScrollArea>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
                    indeterminate={selectedSubmissions.length > 0 && selectedSubmissions.length < submissions.length}
                    onChange={toggleAllSelections}
                  />
                </Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th>Company</Table.Th>
                <Table.Th>Reason</Table.Th>
                <Table.Th>Requirements</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {submissions.map((submission) => (
                <SubmissionRow
                  key={submission.id}
                  submission={submission}
                  isSelected={selectedSubmissions.includes(submission.id)}
                  onToggleSelect={toggleSelection}
                  onView={viewSubmission}
                  onEdit={editSubmission}
                  onDelete={confirmDelete}
                />
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Group justify="space-between" p="md">
          <Text size="sm" c="dimmed">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} submissions
          </Text>
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={setCurrentPage}
            size="sm"
          />
        </Group>
      </Card>

      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Submission Details"
        size="lg"
      >
        {currentSubmission && (
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <Text fw={500} size="sm" c="dimmed">Name</Text>
                <Text>{currentSubmission.firstName} {currentSubmission.lastName}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={500} size="sm" c="dimmed">Email</Text>
                <Text>{currentSubmission.email}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={500} size="sm" c="dimmed">Phone</Text>
                <Text>{currentSubmission.phone}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={500} size="sm" c="dimmed">Company</Text>
                <Text>{currentSubmission.company}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={500} size="sm" c="dimmed">Country</Text>
                <Text>{currentSubmission.country}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={500} size="sm" c="dimmed">Status</Text>
                <Badge color={getStatusColor(currentSubmission.status)}>
                  {currentSubmission.status}
                </Badge>
              </Grid.Col>
            </Grid>

            <Divider />

            <div>
              <Text fw={500} size="sm" c="dimmed" mb={8}>Contact Reason</Text>
              <Text size="sm" mb={16}>
                {currentSubmission.contactReason.charAt(0).toUpperCase() + currentSubmission.contactReason.slice(1).replace('-', ' ')}
              </Text>
              
              {currentSubmission.message && (
                <>
                  <Text fw={500} size="sm" c="dimmed" mb={8}>Message</Text>
                  <Text size="sm" mb={16}>{currentSubmission.message}</Text>
                </>
              )}
              
              {Array.isArray(currentSubmission.requirements) && currentSubmission.requirements.length > 0 && (
                <>
                  <Text fw={500} size="sm" c="dimmed" mb={8}>Product Requirements</Text>
                  {currentSubmission.requirements.map((req, index) => (
                    <Paper key={index} p="sm" mb="sm" withBorder>
                      <Grid>
                        <Grid.Col span={6}>
                          <Text size="sm" fw={500}>Product: {req.productName}</Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <Text size="sm">Part Number: {req.partNumber}</Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <Text size="sm">Quantity: {req.quantity}</Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <Text size="sm">Lead Time: {req.leadTime}</Text>
                        </Grid.Col>
                      </Grid>
                    </Paper>
                  ))}
                </>
              )}
            </div>

            {currentSubmission.notes && (
              <>
                <Divider />
                <div>
                  <Text fw={500} size="sm" c="dimmed" mb={8}>Notes</Text>
                  <Text>{currentSubmission.notes}</Text>
                </div>
              </>
            )}

            <Divider />

            <Grid>
              <Grid.Col span={6}>
                <Text fw={500} size="sm" c="dimmed">Created</Text>
                <Text size="sm">{formatDate(currentSubmission.createdAt)}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text fw={500} size="sm" c="dimmed">Updated</Text>
                <Text size="sm">{formatDate(currentSubmission.updatedAt)}</Text>
              </Grid.Col>
            </Grid>
          </Stack>
        )}
      </Modal>

      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Submission"
        size="md"
      >
        <Stack>
          <Select
            label="Status"
            data={[
              { value: 'NEW', label: 'New' },
              { value: 'PROCESSING', label: 'Processing' },
              { value: 'CONTACTED', label: 'Contacted' },
              { value: 'CLOSED', label: 'Closed' },
            ]}
            value={editForm.status}
            onChange={(value) => setEditForm(prev => ({ ...prev, status: (value as ContactSubmission['status']) || 'NEW' }))}
          />

          <Checkbox
            label="Mark as read"
            checked={editForm.read}
            onChange={(e) => setEditForm(prev => ({ ...prev, read: e.target.checked }))}
          />

          <Textarea
            label="Notes"
            placeholder="Add internal notes..."
            value={editForm.notes}
            onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        size="md"
      >
        <Stack>
          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="Are you sure?"
            color="red"
          >
            This action cannot be undone. This will permanently delete the contact submission for{' '}
            <strong>{submissionToDelete?.firstName} {submissionToDelete?.lastName}</strong> from{' '}
            <strong>{submissionToDelete?.company}</strong>.
          </Alert>

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={() => {
                if (submissionToDelete) {
                  deleteSubmission(submissionToDelete.id);
                  setDeleteModalOpen(false);
                  setSubmissionToDelete(null);
                }
              }}
            >
              Delete Submission
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}


