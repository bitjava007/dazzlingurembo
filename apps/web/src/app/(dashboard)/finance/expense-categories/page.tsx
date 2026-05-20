'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { financeService } from '@/services/finance.service';
import { toast } from '@/hooks/use-toast';
import type { ExpenseCategory } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  code: z.string().optional(),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ExpenseCategoriesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['expense-categories', page],
    queryFn: () => financeService.getExpenseCategories({ page, limit: 50 }),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => financeService.createExpenseCategory(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expense-categories'] }); setModalOpen(false); reset(); toast({ title: 'Category created' }); },
  });
  const updateM = useMutation({
    mutationFn: (d: FormData) => financeService.updateExpenseCategory(editItem!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expense-categories'] }); setModalOpen(false); setEditItem(null); reset(); toast({ title: 'Category updated' }); },
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => financeService.deleteExpenseCategory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expense-categories'] }); setDeleteId(null); toast({ title: 'Category deleted' }); },
  });

  const openCreate = () => { setEditItem(null); reset(); setModalOpen(true); };
  const openEdit = (item: ExpenseCategory) => {
    setEditItem(item);
    reset({ name: item.name, code: item.code ?? '', description: item.description ?? '' });
    setModalOpen(true);
  };
  const onSubmit = (d: FormData) => editItem ? updateM.mutate(d) : createM.mutate(d);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof ExpenseCategory },
    { header: 'Code', render: (r: ExpenseCategory) => r.code ?? '—' },
    { header: 'Description', render: (r: ExpenseCategory) => r.description ?? '—' },
    {
      header: 'Actions', render: (r: ExpenseCategory) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Expense Categories" subtitle="Manage expense categories" onAction={openCreate} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editItem ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Name</Label>
            <Input {...register('name')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Code</Label>
            <Input {...register('code')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Description</Label>
            <Input {...register('description')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending || updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} title="Delete Category" description="This will permanently delete this category." onConfirm={() => deleteId && deleteM.mutate(deleteId)} loading={deleteM.isPending} />
    </div>
  );
}
