"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Container, Title, Card, Group, TextInput, Button, Table, ActionIcon, Modal, Stack, Text, Pagination, Tooltip, Badge, LoadingOverlay, Box, ThemeIcon } from "@mantine/core";
import { IconTags, IconPlus, IconEdit, IconTrash, IconSearch, IconRefresh } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";


// Add client-side only rendering to prevent hydration issues
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
};

type Category = { 
  id: string; 
  name: string; 
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
};

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const pageSize = 10;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/admin/categories`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to load categories');
      }
      const data = await res.json();
      setCats(data?.data || []);
    } catch (error) {
      console.error('Load categories error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load categories',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await load();
      notifications.show({
        title: 'Success',
        message: 'Categories refreshed successfully',
        color: 'green',
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return cats.filter((c) => !s || c.name.toLowerCase().includes(s));
  }, [cats, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => { 
    setEditing(null); 
    setName(""); 
    setDescription("");
    setModalOpen(true); 
  };
  
  const openEdit = (c: Category) => { 
    setEditing(c); 
    setName(c.name); 
    setDescription(c.description || "");
    setModalOpen(true); 
  };

  const save = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      if (editing) {
        const res = await fetch(`/api/proxy/admin/categories`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            id: editing.id, 
            name: name.trim(),
            description: description.trim()
          })
        });
        if (res.ok) {
          await load();
          setModalOpen(false);
          notifications.show({
            title: 'Success',
            message: 'Category updated successfully',
            color: 'green',
          });
        } else {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update category');
        }
      } else {
        const res = await fetch(`/api/proxy/admin/categories`, {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name: name.trim(),
            description: description.trim()
          })
        });
        if (res.ok) {
          await load();
          setModalOpen(false);
          notifications.show({
            title: 'Success',
            message: 'Category created successfully',
            color: 'green',
          });
        } else {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to create category');
        }
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save category',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (category: Category) => {
    setCategoryToDelete(category);
    setConfirmOpen(true);
  };

  const removeCat = async (id: string) => {
    
    
    if (!id || id.trim() === '') {
      notifications.show({
        title: 'Error',
        message: 'Invalid category ID',
        color: 'red',
      });
      return;
    }

    // Check if category has products
    if (categoryToDelete?._count?.products && categoryToDelete._count.products > 0) {
      notifications.show({
        title: 'Cannot Delete',
        message: `This category contains ${categoryToDelete._count.products} product(s) and cannot be deleted. Please remove or reassign the products first.`,
        color: 'orange',
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/proxy/admin/categories?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      
      if (response.ok && data.success) {
        await load();
        notifications.show({
          title: 'Success',
          message: 'Category deleted successfully',
          color: 'green',
        });
      } else {
        // Handle specific error cases
        if (data.error === 'Cannot delete category with existing products') {
          notifications.show({
            title: 'Cannot Delete',
            message: 'This category cannot be deleted because it contains products. Please remove or reassign the products first.',
            color: 'orange',
          });
        } else {
          let errorMessage = data.error || 'Failed to delete category';
          
          // Show validation details if available
          if (data.details && Array.isArray(data.details)) {
            const validationErrors = data.details.map((err: { path: string; msg: string }) => `${err.path}: ${err.msg}`).join(', ');
            errorMessage = `Validation failed: ${validationErrors}`;
          }
          
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete category',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1} c="white">
          <IconTags size={28} style={{ marginRight: 10 }} /> Categories
        </Title>
        <Button 
          leftSection={<IconRefresh size={16} />} 
          variant="light" 
          onClick={refresh}
          loading={refreshing}
          size="sm"
        >
          Refresh
        </Button>
      </Group>

      <Card withBorder p="md" bg="dark.6">
        <Group justify="space-between" mb="md">
          <TextInput 
            placeholder="Search categories..." 
            leftSection={<IconSearch size={16} />} 
            value={search} 
            onChange={(e) => { setPage(1); setSearch(e.currentTarget.value); }} 
            w={300} 
          />
          <Button color="brand" leftSection={<IconPlus size={16} />} onClick={openCreate}>Add category</Button>
        </Group>

        <Box pos="relative">
          <LoadingOverlay visible={loading} />
          <ClientOnly>
            <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Products</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paged.map((c) => (
                <Table.Tr key={c.id}>
                  <Table.Td>
                    <Badge variant="light" color="brand">{c.name}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description || '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="blue">{c._count?.products || 0} products</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant={c.isActive ? "filled" : "light"} color={c.isActive ? "green" : "gray"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Edit">
                        <ActionIcon variant="light" color="brand" onClick={() => openEdit(c)} aria-label="Edit category">
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon variant="light" color="red" onClick={() => openDeleteConfirm(c)} aria-label="Delete category">
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          </ClientOnly>
        </Box>

        {filtered.length > 0 && (
          <Group justify="center" mt="md">
            <Pagination total={totalPages} value={page} onChange={setPage} color="brand" />
          </Group>
        )}
      </Card>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit category' : 'Add category'} centered>
        <Stack>
          <TextInput 
            label="Name" 
            value={name} 
            onChange={(e) => setName(e.currentTarget.value)} 
            required 
            placeholder="Enter category name"
          />
          <TextInput 
            label="Description (optional)" 
            value={description} 
            onChange={(e) => setDescription(e.currentTarget.value)} 
            placeholder="Enter category description"
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={loading}>Save</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        opened={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        title={
          <Group gap="xs">
            <IconTrash size={20} color="red" />
            <Text fw={600}>Delete Category</Text>
          </Group>
        } 
        centered
        size="md"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack gap="lg">
          {/* Category Information */}
          <Card withBorder p="md" bg="gray.0">
            <Group gap="md">
              <ThemeIcon size="lg" color="brand" variant="light">
                <IconTags size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="lg">{categoryToDelete?.name}</Text>
                <Text size="sm" c="dimmed" mt={4}>
                  {categoryToDelete?.description || 'No description provided'}
                </Text>
                <Group gap="xs" mt={8}>
                  <Badge variant="light" color="blue">
                    {categoryToDelete?._count?.products || 0} products
                  </Badge>
                  <Badge variant="light" color={categoryToDelete?.isActive ? "green" : "gray"}>
                    {categoryToDelete?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Group>
              </div>
            </Group>
          </Card>

          {/* Warning Modal Content */}
          {categoryToDelete?._count?.products && categoryToDelete._count.products > 0 ? (
            <Stack gap="md">
              <Group gap="md" align="center">
                <ThemeIcon size="xl" color="orange" variant="filled">
                  <IconTrash size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="lg" c="orange">Cannot Delete Category</Text>
                  <Text size="sm" c="dimmed">This category contains products</Text>
                </div>
              </Group>
              
              <Card withBorder p="md" bg="orange.0">
                <Text size="sm" mb="xs">
                  The category <strong>&quot;{categoryToDelete?.name}&quot;</strong> contains <strong>{categoryToDelete._count.products} product(s)</strong> and cannot be deleted.
                </Text>
                <Text size="sm" c="dimmed">
                  Please remove or reassign all products to another category before deleting this category.
                </Text>
              </Card>
            </Stack>
          ) : (
            <Stack gap="md">
              <Group gap="md" align="center">
                <ThemeIcon size="xl" color="red" variant="filled">
                  <IconTrash size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="lg" c="red">Delete Category</Text>
                  <Text size="sm" c="dimmed">This action cannot be undone</Text>
                </div>
              </Group>
              
              <Card withBorder p="md" bg="red.0">
                <Text size="sm" mb="xs">
                  Are you sure you want to delete the category <strong>&quot;{categoryToDelete?.name}&quot;</strong>?
                </Text>
                <Text size="sm" c="dimmed">
                  This action cannot be undone. The category will be permanently deleted from the database.
                </Text>
              </Card>
            </Stack>
          )}

          {/* Action Buttons */}
          <Group justify="flex-end" gap="sm">
            <Button 
              variant="light" 
              onClick={() => setConfirmOpen(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button 
              color="red" 
              variant="filled"
              onClick={() => {
                if (categoryToDelete) {
                  removeCat(categoryToDelete.id);
                  setConfirmOpen(false);
                }
              }}
              loading={loading}
              disabled={!!(categoryToDelete?._count?.products && categoryToDelete._count.products > 0)}
              leftSection={<IconTrash size={16} />}
              size="sm"
            >
              {loading ? 'Deleting...' : 'Delete Category'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}




