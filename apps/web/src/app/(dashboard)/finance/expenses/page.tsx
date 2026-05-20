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
import { financeService } from '@/services/finance.service';
import { toast } from '@/hooks/use-toast';
import type { Expense } from '@/types';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  amount: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', search, page],
    queryFn: () => financeService.getExpenses({ search, page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => financeService.createExpense({ description: d.title, originalAmount: parseFloat(d.amount), title: d.title, amount: parseFloat(d.amount) } as Parameters<typeof financeService.createExpense>[0]),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setModalOpen(false); reset(); toast({ title: 'Expense created' }); },
  });
  const approveM = useMutation({
    mutationFn: (id: string) => financeService.approveExpense(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast({ title: 'Expense approved' }); },
  });

  const columns = [
    { header: 'Title', render: (r: Expense) => r.title ?? r.description },
    { header: 'Category', render: (r: Expense) => r.category?.name ?? r.categoryId ?? '—' },
    { header: 'Amount', render: (r: Expense) => `${(r.amount ?? r.originalAmount ?? 0).toFixed(2)} ${r.originalCurrencyCode ?? ''}` },
    { header: 'Status', render: (r: Expense) => <StatusBadge status={r.status} /> },
    { header: 'Date', render: (r: Expense) => new Date(r.expenseDate ?? r.createdAt).toLocaleDateString() },
    {
      header: 'Actions', render: (r: Expense) => r.status === 'SUBMITTED' ? (
        <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300" onClick={() => approveM.mutate(r.id)}>
          <CheckCircle className="h-3 w-3 mr-1" />Approve
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Expense management" onAction={() => setModalOpen(true)} />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search expenses..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Expense">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1"><Label className="text-gray-300">Title</Label><Input {...register('title')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Amount</Label><Input type="number" step="0.01" {...register('amount')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
            <div className="space-y-1"><Label className="text-gray-300">Category</Label><Input {...register('category')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="space-y-1"><Label className="text-gray-300">Description</Label><Input {...register('description')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Create</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
