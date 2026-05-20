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
import { hrService } from '@/services/hr.service';
import { toast } from '@/hooks/use-toast';
import type { SalaryAdvance } from '@/types';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const schema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  amount: z.string().min(1, 'Amount is required'),
  currencyCode: z.enum(['XOF', 'USD', 'EUR']),
  reason: z.string().min(1, 'Reason is required'),
});
type FormData = z.infer<typeof schema>;

const rejectSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});
type RejectFormData = z.infer<typeof rejectSchema>;

export default function SalaryAdvancesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const rejectForm = useForm<RejectFormData>({ resolver: zodResolver(rejectSchema) });

  const { data, isLoading } = useQuery({
    queryKey: ['salary-advances', page],
    queryFn: () => hrService.getSalaryAdvances({ page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => hrService.createSalaryAdvance({
      employeeId: d.employeeId,
      originalAmount: parseFloat(d.amount),
      originalCurrencyCode: d.currencyCode,
      reason: d.reason,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salary-advances'] });
      setModalOpen(false);
      reset();
      toast({ title: 'Salary advance requested' });
    },
  });

  const approveM = useMutation({
    mutationFn: (id: string) => hrService.approveSalaryAdvance(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['salary-advances'] }); toast({ title: 'Advance approved' }); },
  });

  const rejectM = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => hrService.rejectSalaryAdvance(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salary-advances'] });
      setRejectModalOpen(false);
      setRejectId(null);
      rejectForm.reset();
      toast({ title: 'Advance rejected' });
    },
  });

  const repayM = useMutation({
    mutationFn: (id: string) => hrService.repaySalaryAdvance(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['salary-advances'] }); toast({ title: 'Advance marked as repaid' }); },
  });

  const columns = [
    { header: 'Employee ID', render: (r: SalaryAdvance) => r.employeeId ?? '—' },
    { header: 'Amount', render: (r: SalaryAdvance) => r.originalAmount?.toFixed(2) ?? '—' },
    { header: 'Currency', render: (r: SalaryAdvance) => r.originalCurrencyCode ?? '—' },
    { header: 'Reason', accessor: 'reason' as keyof SalaryAdvance },
    { header: 'Status', render: (r: SalaryAdvance) => <StatusBadge status={r.status} /> },
    { header: 'Requested', render: (r: SalaryAdvance) => new Date(r.requestedAt).toLocaleDateString() },
    {
      header: 'Actions',
      render: (r: SalaryAdvance) => (
        <div className="flex gap-1">
          {r.status === 'PENDING' && (
            <>
              <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300" onClick={() => approveM.mutate(r.id)}>
                <CheckCircle className="h-3 w-3 mr-1" />Approve
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-red-400 hover:text-red-300" onClick={() => { setRejectId(r.id); setRejectModalOpen(true); }}>
                <XCircle className="h-3 w-3 mr-1" />Reject
              </Button>
            </>
          )}
          {r.status === 'APPROVED' && (
            <Button variant="ghost" size="sm" className="h-7 text-blue-400 hover:text-blue-300" onClick={() => repayM.mutate(r.id)}>
              <RefreshCw className="h-3 w-3 mr-1" />Repay
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Salary Advances" subtitle="Manage employee salary advances" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Request Salary Advance">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Employee ID</Label>
            <Input {...register('employeeId')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Enter employee ID" />
            {errors.employeeId && <p className="text-red-400 text-xs">{errors.employeeId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Amount</Label>
              <Input type="number" step="0.01" {...register('amount')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.amount && <p className="text-red-400 text-xs">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Currency</Label>
              <select {...register('currencyCode')} className="w-full h-10 rounded-md border border-[#2A2A2A] bg-[#111111] text-white px-3">
                <option value="XOF">XOF</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Reason</Label>
            <Input {...register('reason')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.reason && <p className="text-red-400 text-xs">{errors.reason.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Request</Button>
          </div>
        </form>
      </FormModal>

      <FormModal open={rejectModalOpen} onOpenChange={setRejectModalOpen} title="Reject Salary Advance">
        <form onSubmit={rejectForm.handleSubmit((d) => { if (rejectId) rejectM.mutate({ id: rejectId, reason: d.reason }); })} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Rejection Reason</Label>
            <Input {...rejectForm.register('reason')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Enter reason for rejection" />
            {rejectForm.formState.errors.reason && <p className="text-red-400 text-xs">{rejectForm.formState.errors.reason.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setRejectModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={rejectM.isPending} className="bg-red-600 hover:bg-red-700 text-white font-semibold">Reject</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
