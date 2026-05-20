'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { financeService } from '@/services/finance.service';
import { toast } from '@/hooks/use-toast';
import type { Reconciliation } from '@/types';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  dailyClosureId: z.string().min(1, 'Required'),
  branchId: z.string().min(1, 'Required'),
  discrepancyAmount: z.string().optional(),
  discrepancyNotes: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ReconciliationsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['reconciliations', page],
    queryFn: () => financeService.getReconciliations({ page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => financeService.createReconciliation({
      ...d,
      discrepancyAmount: d.discrepancyAmount ? parseFloat(d.discrepancyAmount) : undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reconciliations'] }); setModalOpen(false); reset(); toast({ title: 'Reconciliation created' }); },
  });

  const approveM = useMutation({
    mutationFn: (id: string) => financeService.approveReconciliation(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reconciliations'] }); toast({ title: 'Reconciliation approved' }); },
  });

  const columns = [
    { header: 'Branch', render: (r: Reconciliation) => r.branch?.name ?? r.branchId },
    { header: 'Discrepancy', render: (r: Reconciliation) => r.difference != null ? `$${r.difference.toFixed(2)}` : '—' },
    { header: 'Notes', render: (r: Reconciliation) => r.notes ?? '—' },
    { header: 'Status', render: (r: Reconciliation) => <StatusBadge status={r.status} /> },
    { header: 'Date', render: (r: Reconciliation) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: 'Actions', render: (r: Reconciliation) => r.status === 'PENDING' ? (
        <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300" onClick={() => approveM.mutate(r.id)}>
          <CheckCircle className="h-3 w-3 mr-1" />Approve
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Reconciliations" subtitle="Cash reconciliation records" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Reconciliation">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Daily Closure ID</Label>
            <Input {...register('dailyClosureId')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.dailyClosureId && <p className="text-red-400 text-xs">{errors.dailyClosureId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Branch ID</Label>
            <Input {...register('branchId')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.branchId && <p className="text-red-400 text-xs">{errors.branchId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Discrepancy Amount</Label>
            <Input type="number" step="0.01" {...register('discrepancyAmount')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Discrepancy Notes</Label>
            <Input {...register('discrepancyNotes')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Notes</Label>
            <Input {...register('notes')} className="bg-[#111111] border-[#2A2A2A] text-white" />
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
