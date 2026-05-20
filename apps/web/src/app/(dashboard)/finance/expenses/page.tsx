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
import { BranchFilter } from '@/components/ui/branch-filter';
import { financeService } from '@/services/finance.service';
import { toast } from '@/hooks/use-toast';
import type { Expense, ExpenseCategory } from '@/types';
import { CheckCircle, Send } from 'lucide-react';
import api from '@/lib/api';
import type { Branch } from '@/types';

const schema = z.object({
  description: z.string().min(1, 'Required'),
  originalAmount: z.string().min(1, 'Required'),
  originalCurrencyCode: z.string().min(1, 'Required'),
  categoryId: z.string().min(1, 'Required'),
  branchId: z.string().min(1, 'Required'),
  expenseDate: z.string().min(1, 'Required'),
  vendor: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterBranchId, setFilterBranchId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { originalCurrencyCode: 'XOF', expenseDate: new Date().toISOString().slice(0, 10) },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', search, page, filterBranchId],
    queryFn: () => financeService.getExpenses({ search, page, limit: 20, ...(filterBranchId && { branchId: filterBranchId }) }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['expense-categories-list'],
    queryFn: () => financeService.getExpenseCategories({ limit: 100 }),
    enabled: modalOpen,
  });

  const { data: branchesData } = useQuery<{ data: Branch[] }>({
    queryKey: ['branches-for-expenses'],
    queryFn: () => api.get('/organization/branches', { params: { limit: 100 } }).then((r) => r.data),
    enabled: modalOpen,
  });

  const createM = useMutation({
    mutationFn: (d: FormData) =>
      financeService.createExpense({
        description: d.description,
        originalAmount: parseFloat(d.originalAmount),
        originalCurrencyCode: d.originalCurrencyCode,
        categoryId: d.categoryId,
        branchId: d.branchId,
        expenseDate: d.expenseDate,
        vendor: d.vendor || undefined,
        notes: d.notes || undefined,
      } as Parameters<typeof financeService.createExpense>[0]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      setModalOpen(false);
      reset({ originalCurrencyCode: 'XOF', expenseDate: new Date().toISOString().slice(0, 10) });
      toast({ title: 'Expense created' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create expense', variant: 'destructive' }),
  });

  const approveM = useMutation({
    mutationFn: (id: string) => financeService.approveExpense(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast({ title: 'Expense approved' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to approve', variant: 'destructive' }),
  });

  const submitM = useMutation({
    mutationFn: (id: string) => financeService.submitExpense(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast({ title: 'Expense submitted for approval' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to submit', variant: 'destructive' }),
  });

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);

  const columns = [
    { header: 'Expense #', render: (r: Expense) => <span className="font-mono text-xs text-[#C9A84C]">{r.expenseNumber}</span> },
    { header: 'Description', render: (r: Expense) => <span className="text-white truncate max-w-[200px] block">{r.description}</span> },
    { header: 'Category', render: (r: Expense) => (r as Expense & { category?: ExpenseCategory }).category?.name ?? r.categoryId ?? '—' },
    { header: 'Amount', render: (r: Expense) => <span className="text-[#C9A84C] font-semibold">{fmt(Number(r.originalAmount))} {r.originalCurrencyCode}</span> },
    { header: 'Status', render: (r: Expense) => <StatusBadge status={r.status} /> },
    { header: 'Date', render: (r: Expense) => new Date(r.expenseDate ?? r.createdAt).toLocaleDateString() },
    {
      header: 'Actions',
      render: (r: Expense) => (
        <div className="flex gap-1">
          {r.status === 'DRAFT' && (
            <Button variant="ghost" size="sm" className="h-7 text-blue-400 hover:text-blue-300" onClick={() => submitM.mutate(r.id)} disabled={submitM.isPending}>
              <Send className="h-3 w-3 mr-1" />Submit
            </Button>
          )}
          {r.status === 'SUBMITTED' && (
            <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300" onClick={() => approveM.mutate(r.id)} disabled={approveM.isPending}>
              <CheckCircle className="h-3 w-3 mr-1" />Approve
            </Button>
          )}
        </div>
      ),
    },
  ];

  const categories = (categoriesData as { data: ExpenseCategory[] } | undefined)?.data ?? [];
  const branches = branchesData?.data ?? [];

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Expense management" onAction={() => setModalOpen(true)} />
      <div className="mb-4 flex gap-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search expenses..." />
        <BranchFilter value={filterBranchId} onChange={(v) => { setFilterBranchId(v); setPage(1); }} />
      </div>
      <DataTable columns={columns} data={(data as { data: Expense[] } | undefined)?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={(data as { meta: { totalPages: number } } | undefined)?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Expense">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Description</Label>
            <Input {...register('description')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Amount</Label>
              <Input type="number" step="0.01" {...register('originalAmount')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.originalAmount && <p className="text-red-400 text-xs">{errors.originalAmount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Currency</Label>
              <Input {...register('originalCurrencyCode')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Category</Label>
            <Select value={watch('categoryId')} onValueChange={(v) => setValue('categoryId', v)}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {categories.map((c) => <SelectItem key={c.id} value={c.id} className="text-white">{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-red-400 text-xs">{errors.categoryId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Branch</Label>
            <Select value={watch('branchId')} onValueChange={(v) => setValue('branchId', v)}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue placeholder="Select branch" /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {branches.map((b) => <SelectItem key={b.id} value={b.id} className="text-white">{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.branchId && <p className="text-red-400 text-xs">{errors.branchId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Expense Date</Label>
            <Input type="date" {...register('expenseDate')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.expenseDate && <p className="text-red-400 text-xs">{errors.expenseDate.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Vendor (optional)</Label>
            <Input {...register('vendor')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Create</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
