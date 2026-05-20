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
import { salesService } from '@/services/sales.service';
import { toast } from '@/hooks/use-toast';
import type { Refund } from '@/types';
import { CheckCircle, XCircle } from 'lucide-react';

const schema = z.object({
  orderId: z.string().optional(),
  invoiceId: z.string().optional(),
  amount: z.string().min(1, 'Amount is required'),
  reason: z.string().min(1, 'Reason is required'),
});
type FormData = z.infer<typeof schema>;

export default function RefundsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['refunds', page],
    queryFn: () => salesService.getRefunds({ page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => salesService.createRefund({
      orderId: d.orderId || undefined,
      reason: d.reason,
      originalAmount: parseFloat(d.amount),
      originalCurrencyCode: 'XOF',
      branchId: '',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['refunds'] });
      setModalOpen(false);
      reset();
      toast({ title: 'Refund created' });
    },
  });

  const approveM = useMutation({
    mutationFn: (id: string) => salesService.approveRefund(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['refunds'] }); toast({ title: 'Refund approved' }); },
  });

  const rejectM = useMutation({
    mutationFn: (id: string) => salesService.rejectRefund(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['refunds'] }); toast({ title: 'Refund rejected' }); },
  });

  const columns = [
    { header: 'Order ID', render: (r: Refund) => r.orderId ?? '—' },
    { header: 'Amount', render: (r: Refund) => `${r.originalAmount.toFixed(2)} ${r.originalCurrencyCode}` },
    { header: 'Reason', accessor: 'reason' as keyof Refund },
    { header: 'Status', render: (r: Refund) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: (r: Refund) => r.status === 'PENDING' ? (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300" onClick={() => approveM.mutate(r.id)}>
            <CheckCircle className="h-3 w-3 mr-1" />Approve
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-red-400 hover:text-red-300" onClick={() => rejectM.mutate(r.id)}>
            <XCircle className="h-3 w-3 mr-1" />Reject
          </Button>
        </div>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Refunds" subtitle="Sales refund management" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Refund">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Order ID (optional)</Label>
              <Input {...register('orderId')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Invoice ID (optional)</Label>
              <Input {...register('invoiceId')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Amount</Label>
            <Input type="number" step="0.01" {...register('amount')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.amount && <p className="text-red-400 text-xs">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Reason</Label>
            <Input {...register('reason')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.reason && <p className="text-red-400 text-xs">{errors.reason.message}</p>}
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
