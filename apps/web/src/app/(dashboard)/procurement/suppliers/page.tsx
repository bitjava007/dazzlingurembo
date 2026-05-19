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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { procurementService } from '@/services/procurement.service';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import type { Supplier } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  code: z.string().min(1, 'Required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
  address: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function SuppliersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', search, page],
    queryFn: () => procurementService.getSuppliers({ search, page, limit: 20 }),
  });

  const createM = useMutation({ mutationFn: (d: FormData) => procurementService.createSupplier(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); setModalOpen(false); reset(); toast({ title: 'Supplier created' }); } });
  const updateM = useMutation({ mutationFn: (d: FormData) => procurementService.updateSupplier(editItem!.id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); setModalOpen(false); setEditItem(null); reset(); toast({ title: 'Supplier updated' }); } });
  const deleteM = useMutation({ mutationFn: (id: string) => procurementService.deleteSupplier(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); setDeleteId(null); toast({ title: 'Supplier deleted' }); } });

  const openCreate = () => { setEditItem(null); reset(); setModalOpen(true); };
  const openEdit = (item: Supplier) => { setEditItem(item); reset({ name: item.name, code: item.code, email: item.email ?? '', phone: item.phone ?? '', contactPerson: item.contactPerson ?? '', address: item.address ?? '' }); setModalOpen(true); };
  const onSubmit = (d: FormData) => editItem ? updateM.mutate(d) : createM.mutate(d);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Supplier },
    { header: 'Code', accessor: 'code' as keyof Supplier },
    { header: 'Email', accessor: 'email' as keyof Supplier },
    { header: 'Phone', accessor: 'phone' as keyof Supplier },
    { header: 'Contact', render: (r: Supplier) => r.contactPerson ?? '—' },
    { header: 'Status', render: (r: Supplier) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions', render: (r: Supplier) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Suppliers" subtitle="Manage your suppliers" onAction={openCreate} />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search suppliers..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editItem ? 'Edit Supplier' : 'New Supplier'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Name</Label><Input {...register('name')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">Code</Label><Input {...register('code')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="space-y-1"><Label className="text-gray-300">Email</Label><Input type="email" {...register('email')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Phone</Label><Input {...register('phone')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
            <div className="space-y-1"><Label className="text-gray-300">Contact Person</Label><Input {...register('contactPerson')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="space-y-1"><Label className="text-gray-300">Address</Label><Input {...register('address')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending || updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} title="Delete Supplier" description="This will permanently delete this supplier." onConfirm={() => deleteId && deleteM.mutate(deleteId)} loading={deleteM.isPending} />
    </div>
  );
}
