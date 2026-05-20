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
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Pencil } from 'lucide-react';
import type { User, PaginatedResponse } from '@/types';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});
type FormData = z.infer<typeof schema>;

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ACTIVE' },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<User>>('/users', { params: { search, page, limit: 20 } });
      return res.data;
    },
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => api.post<User>('/users', d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setModalOpen(false); reset(); toast({ title: 'User created' }); },
  });
  const updateM = useMutation({
    mutationFn: (d: FormData) => api.patch<User>(`/users/${editItem!.id}`, d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setModalOpen(false); setEditItem(null); reset(); toast({ title: 'User updated' }); },
  });

  const openCreate = () => { setEditItem(null); reset({ status: 'ACTIVE' }); setModalOpen(true); };
  const openEdit = (item: User) => { setEditItem(item); reset({ firstName: item.firstName, lastName: item.lastName, email: item.email, status: item.status }); setModalOpen(true); };
  const onSubmit = (d: FormData) => editItem ? updateM.mutate(d) : createM.mutate(d);

  const columns = [
    { header: 'Name', render: (r: User) => `${r.firstName} ${r.lastName}` },
    { header: 'Email', accessor: 'email' as keyof User },
    { header: 'Status', render: (r: User) => <StatusBadge status={r.status} /> },
    { header: 'Roles', render: (r: User) => r.roles?.map(role => role.name).join(', ') || '—' },
    { header: 'Branch', render: (r: User) => r.branch?.name ?? '—' },
    {
      header: 'Actions', render: (r: User) => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle="System user management" onAction={openCreate} />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search users..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editItem ? 'Edit User' : 'New User'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">First Name</Label><Input {...register('firstName')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.firstName && <p className="text-red-400 text-xs">{errors.firstName.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">Last Name</Label><Input {...register('lastName')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="space-y-1"><Label className="text-gray-300">Email</Label><Input type="email" {...register('email')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}</div>
          <div className="space-y-1">
            <Label className="text-gray-300">Status</Label>
            <Select value={watch('status')} onValueChange={(v) => setValue('status', v as FormData['status'])}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {['ACTIVE', 'INACTIVE', 'SUSPENDED'].map((s) => <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending || updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
