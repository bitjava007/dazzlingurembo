'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { Permission } from '@/types';
import { Trash2 } from 'lucide-react';

const MODULES = ['CRM', 'CATALOG', 'INVENTORY', 'SALES', 'FINANCE', 'PROCUREMENT', 'PRODUCTION', 'LOGISTICS', 'HR', 'ADMIN'];
const ACTIONS = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'];

const schema = z.object({
  module: z.string().min(1, 'Required'),
  action: z.string().min(1, 'Required'),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function PermissionsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Permission | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { module: '', action: '' },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      // Backend returns grouped: { data: Record<string, Permission[]> }
      // Flatten into a list
      const res = await api.get<{ data: Record<string, Permission[]> }>('/rbac/permissions');
      const grouped = res.data.data;
      return Object.values(grouped).flat();
    },
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => api.post<{ data: Permission }>('/rbac/permissions', d).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['permissions'] }); setModalOpen(false); reset(); toast({ title: 'Permission created' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to create permission', variant: 'destructive' }),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => api.delete(`/rbac/permissions/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['permissions'] }); setDeleteOpen(false); setDeleteItem(null); toast({ title: 'Permission deleted' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to delete permission', variant: 'destructive' }),
  });

  const columns = [
    { header: 'Module', accessor: 'module' as keyof Permission },
    { header: 'Action', accessor: 'action' as keyof Permission },
    { header: 'Description', render: (r: Permission) => r.description ?? '—' },
    {
      header: 'Actions', render: (r: Permission) => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => { setDeleteItem(r); setDeleteOpen(true); }}>
          <Trash2 className="h-3 w-3" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Permissions" subtitle="Manage RBAC permissions" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Permission">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Module</Label>
            <Select value={watch('module')} onValueChange={(v) => setValue('module', v)}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue placeholder="Select module" /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {MODULES.map((m) => <SelectItem key={m} value={m} className="text-white">{m}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.module && <p className="text-red-400 text-xs">{errors.module.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Action</Label>
            <Select value={watch('action')} onValueChange={(v) => setValue('action', v)}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue placeholder="Select action" /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {ACTIONS.map((a) => <SelectItem key={a} value={a} className="text-white">{a}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.action && <p className="text-red-400 text-xs">{errors.action.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Description</Label>
            <Input {...register('description')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Create</Button>
          </div>
        </form>
      </FormModal>

      <FormModal open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Permission">
        <div className="mt-2 space-y-4">
          <p className="text-gray-300">Are you sure you want to delete <span className="text-white font-semibold">{deleteItem?.module}/{deleteItem?.action}</span>?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="button" disabled={deleteM.isPending} className="bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={() => deleteItem && deleteM.mutate(deleteItem.id)}>Delete</Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
