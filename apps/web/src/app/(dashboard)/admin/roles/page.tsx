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
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Pencil } from 'lucide-react';
import type { Role, PaginatedResponse } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function RolesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Role | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['roles', search, page],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Role>>('/admin/roles', { params: { search, page, limit: 20 } });
      return res.data;
    },
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => api.post<Role>('/admin/roles', d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); setModalOpen(false); reset(); toast({ title: 'Role created' }); },
  });
  const updateM = useMutation({
    mutationFn: (d: FormData) => api.patch<Role>(`/admin/roles/${editItem!.id}`, d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); setModalOpen(false); setEditItem(null); reset(); toast({ title: 'Role updated' }); },
  });

  const openCreate = () => { setEditItem(null); reset(); setModalOpen(true); };
  const openEdit = (item: Role) => { setEditItem(item); reset({ name: item.name, description: item.description }); setModalOpen(true); };
  const onSubmit = (d: FormData) => editItem ? updateM.mutate(d) : createM.mutate(d);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Role },
    { header: 'Description', render: (r: Role) => r.description ?? '—' },
    { header: 'Permissions', render: (r: Role) => r.permissions?.length ?? 0 },
    {
      header: 'Actions', render: (r: Role) => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Roles & Permissions" subtitle="RBAC management" onAction={openCreate} />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search roles..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editItem ? 'Edit Role' : 'New Role'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1"><Label className="text-gray-300">Name</Label><Input {...register('name')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}</div>
          <div className="space-y-1"><Label className="text-gray-300">Description</Label><Input {...register('description')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending || updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
