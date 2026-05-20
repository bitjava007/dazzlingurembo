'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usersService } from '@/services/users.service';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2, UserCog, GitBranch } from 'lucide-react';
import type { User, Role, Branch, PaginatedResponse } from '@/types';

const createSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and number'),
  phone: z.string().optional(),
  countryId: z.string().optional(),
  branchId: z.string().optional(),
});

// Backend UpdateUserDto: firstName, lastName, phone, countryId only.
// email cannot be changed via PATCH /users/:id.
// status is changed via PATCH /users/:id/status (dedicated endpoint).
const editSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().optional(),
  countryId: z.string().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData = z.infer<typeof editSchema>;

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [deleteItem, setDeleteItem] = useState<User | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [assignBranchOpen, setAssignBranchOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema) as never,
  });
  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editSchema) as never,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, page],
    queryFn: () => usersService.getUsers({ search, page, limit: 20 }),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles-list'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Role>>('/rbac/roles', { params: { limit: 100 } });
      return res.data;
    },
    enabled: assignRoleOpen,
  });

  const { data: branchesData } = useQuery({
    queryKey: ['branches-list'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Branch>>('/organization/branches', { params: { limit: 100 } });
      return res.data;
    },
    enabled: assignBranchOpen,
  });

  const createM = useMutation({
    mutationFn: (d: CreateFormData) => usersService.createUser(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
      createForm.reset();
      toast({ title: 'User created' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create user', variant: 'destructive' }),
  });

  const updateM = useMutation({
    mutationFn: (d: EditFormData) => usersService.updateUser(editItem!.id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
      setEditItem(null);
      editForm.reset();
      toast({ title: 'User updated' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' }),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setDeleteConfirmOpen(false);
      setDeleteItem(null);
      toast({ title: 'User deleted' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' }),
  });

  const statusM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }) =>
      usersService.updateUserStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Status updated' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' }),
  });

  const assignRoleM = useMutation({
    mutationFn: () => usersService.assignRole(targetUser!.id, selectedRoleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setAssignRoleOpen(false);
      setSelectedRoleId('');
      setTargetUser(null);
      toast({ title: 'Role assigned' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to assign role', variant: 'destructive' }),
  });

  const removeRoleM = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      usersService.removeRole(userId, roleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Role removed' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to remove role', variant: 'destructive' }),
  });

  const assignBranchM = useMutation({
    mutationFn: () => usersService.assignBranch(targetUser!.id, selectedBranchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setAssignBranchOpen(false);
      setSelectedBranchId('');
      setTargetUser(null);
      toast({ title: 'Branch assigned' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to assign branch', variant: 'destructive' }),
  });

  const openCreate = () => {
    setEditItem(null);
    createForm.reset();
    setModalOpen(true);
  };

  const openEdit = (item: User) => {
    setEditItem(item);
    editForm.reset({
      firstName: item.firstName,
      lastName: item.lastName,
      phone: (item as User & { phone?: string }).phone ?? '',
    });
    setModalOpen(true);
  };

  const openDelete = (item: User) => {
    setDeleteItem(item);
    setDeleteConfirmOpen(true);
  };

  const openAssignRole = (item: User) => {
    setTargetUser(item);
    setSelectedRoleId('');
    setAssignRoleOpen(true);
  };

  const openAssignBranch = (item: User) => {
    setTargetUser(item);
    setSelectedBranchId(item.branchId ?? '');
    setAssignBranchOpen(true);
  };

  const toggleStatus = (item: User) => {
    const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    statusM.mutate({ id: item.id, status: newStatus });
  };

  const columns = [
    { header: 'Name', render: (r: User) => `${r.firstName} ${r.lastName}` },
    { header: 'Email', accessor: 'email' as keyof User },
    { header: 'Status', render: (r: User) => <StatusBadge status={r.status} /> },
    {
      header: 'Roles',
      render: (r: User) => (
        <div className="flex flex-wrap gap-1">
          {r.roles?.length ? r.roles.map(role => (
            <span key={role.id} className="inline-flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded px-1.5 py-0.5 text-xs text-gray-300">
              {role.name}
              <button
                onClick={() => removeRoleM.mutate({ userId: r.id, roleId: role.id })}
                className="text-gray-500 hover:text-red-400 ml-0.5"
                title="Remove role"
              >
                ×
              </button>
            </span>
          )) : <span className="text-gray-500 text-xs">—</span>}
        </div>
      ),
    },
    { header: 'Branch', render: (r: User) => r.branch?.name ?? '—' },
    {
      header: 'Actions',
      render: (r: User) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-white"
            title={r.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            onClick={() => toggleStatus(r)}
          >
            <span className={`h-2 w-2 rounded-full ${r.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-white"
            title="Assign role"
            onClick={() => openAssignRole(r)}
          >
            <UserCog className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-white"
            title="Assign branch"
            onClick={() => openAssignBranch(r)}
          >
            <GitBranch className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-white"
            title="Edit"
            onClick={() => openEdit(r)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-red-400"
            title="Delete"
            onClick={() => openDelete(r)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle="System user management" onAction={openCreate} />
      <div className="mb-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search users..." />
      </div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      {/* Create Modal */}
      <FormModal open={modalOpen && !editItem} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditItem(null); } }} title="New User">
        <form onSubmit={createForm.handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">First Name</Label>
              <Input {...createForm.register('firstName')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {createForm.formState.errors.firstName && <p className="text-red-400 text-xs">{createForm.formState.errors.firstName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Last Name</Label>
              <Input {...createForm.register('lastName')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {createForm.formState.errors.lastName && <p className="text-red-400 text-xs">{createForm.formState.errors.lastName.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Email</Label>
            <Input type="email" {...createForm.register('email')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {createForm.formState.errors.email && <p className="text-red-400 text-xs">{createForm.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Password</Label>
            <Input type="password" {...createForm.register('password')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {createForm.formState.errors.password && <p className="text-red-400 text-xs">{createForm.formState.errors.password.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Phone (optional)</Label>
            <Input {...createForm.register('phone')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Create</Button>
          </div>
        </form>
      </FormModal>

      {/* Edit Modal */}
      <FormModal open={modalOpen && !!editItem} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditItem(null); } }} title="Edit User">
        <form onSubmit={editForm.handleSubmit((d) => updateM.mutate(d))} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">First Name</Label>
              <Input {...editForm.register('firstName')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {editForm.formState.errors.firstName && <p className="text-red-400 text-xs">{editForm.formState.errors.firstName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Last Name</Label>
              <Input {...editForm.register('lastName')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Phone (optional)</Label>
            <Input {...editForm.register('phone')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Update</Button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirm Modal */}
      <FormModal open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} title="Delete User">
        <div className="mt-2 space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete <span className="text-white font-semibold">{deleteItem?.firstName} {deleteItem?.lastName}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteConfirmOpen(false)} className="text-gray-400">Cancel</Button>
            <Button
              type="button"
              disabled={deleteM.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={() => deleteItem && deleteM.mutate(deleteItem.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </FormModal>

      {/* Assign Role Modal */}
      <FormModal open={assignRoleOpen} onOpenChange={setAssignRoleOpen} title="Assign Role">
        <div className="mt-2 space-y-4">
          <p className="text-gray-400 text-sm">Assign a role to <span className="text-white">{targetUser?.firstName} {targetUser?.lastName}</span></p>
          <div className="space-y-1">
            <Label className="text-gray-300">Role</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {rolesData?.data?.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-white">{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setAssignRoleOpen(false)} className="text-gray-400">Cancel</Button>
            <Button
              type="button"
              disabled={!selectedRoleId || assignRoleM.isPending}
              className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold"
              onClick={() => assignRoleM.mutate()}
            >
              Assign
            </Button>
          </div>
        </div>
      </FormModal>

      {/* Assign Branch Modal */}
      <FormModal open={assignBranchOpen} onOpenChange={setAssignBranchOpen} title="Assign Branch">
        <div className="mt-2 space-y-4">
          <p className="text-gray-400 text-sm">Assign a branch to <span className="text-white">{targetUser?.firstName} {targetUser?.lastName}</span></p>
          <div className="space-y-1">
            <Label className="text-gray-300">Branch</Label>
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue placeholder="Select a branch" /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {branchesData?.data?.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-white">{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setAssignBranchOpen(false)} className="text-gray-400">Cancel</Button>
            <Button
              type="button"
              disabled={!selectedBranchId || assignBranchM.isPending}
              className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold"
              onClick={() => assignBranchM.mutate()}
            >
              Assign
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
