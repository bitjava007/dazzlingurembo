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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { catalogService } from '@/services/catalog.service';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import type { Product } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']),
});
type FormData = z.infer<typeof schema>;

export default function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, page],
    queryFn: () => catalogService.getProducts({ search, page, limit: 20 }),
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ACTIVE' },
  });

  const createM = useMutation({ mutationFn: (d: FormData) => catalogService.createProduct(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setModalOpen(false); reset(); toast({ title: 'Product created' }); } });
  const updateM = useMutation({ mutationFn: (d: FormData) => catalogService.updateProduct(editItem!.id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setModalOpen(false); setEditItem(null); reset(); toast({ title: 'Product updated' }); } });
  const deleteM = useMutation({ mutationFn: (id: string) => catalogService.deleteProduct(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDeleteId(null); toast({ title: 'Product deleted' }); } });

  const openCreate = () => { setEditItem(null); reset({ status: 'ACTIVE' }); setModalOpen(true); };
  const openEdit = (item: Product) => { setEditItem(item); reset({ name: item.name, description: item.description, status: item.status }); setModalOpen(true); };
  const onSubmit = (d: FormData) => editItem ? updateM.mutate(d) : createM.mutate(d);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Product },
    { header: 'Category', render: (r: Product) => r.category?.name ?? '—' },
    { header: 'Variants', render: (r: Product) => r.variants?.length ?? 0 },
    { header: 'Status', render: (r: Product) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions', render: (r: Product) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage your product catalog" onAction={openCreate} />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search products..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editItem ? 'Edit Product' : 'New Product'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1"><Label className="text-gray-300">Name</Label><Input {...register('name')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}</div>
          <div className="space-y-1"><Label className="text-gray-300">Description</Label><Input {...register('description')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="space-y-1">
            <Label className="text-gray-300">Status</Label>
            <Select value={watch('status')} onValueChange={(v) => setValue('status', v as FormData['status'])}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {['ACTIVE', 'INACTIVE', 'DISCONTINUED'].map((s) => <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending || updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} title="Delete Product" description="This will permanently delete this product." onConfirm={() => deleteId && deleteM.mutate(deleteId)} loading={deleteM.isPending} />
    </div>
  );
}
