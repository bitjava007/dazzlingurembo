'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormModal } from '@/components/ui/form-modal';
import { salesService } from '@/services/sales.service';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, PackageCheck } from 'lucide-react';
import type { Return } from '@/types';

interface ReturnFormData {
  branchId: string;
  reason: string;
  orderId: string;
  description: string;
}

export default function ReturnsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['returns', page],
    queryFn: () => salesService.getReturns({ page, limit: 20 }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReturnFormData>({
    defaultValues: { branchId: '', reason: '', orderId: '', description: '' },
  });

  const createMutation = useMutation({
    mutationFn: (d: ReturnFormData) => salesService.createReturn({ ...d, items: [] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['returns'] }); setModalOpen(false); reset(); toast({ title: 'Return request created' }); },
    onError: () => toast({ title: 'Error creating return', variant: 'destructive' }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => salesService.approveReturn(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['returns'] }); toast({ title: 'Return approved' }); },
    onError: () => toast({ title: 'Error approving return', variant: 'destructive' }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => salesService.rejectReturn(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['returns'] }); toast({ title: 'Return rejected' }); },
    onError: () => toast({ title: 'Error rejecting return', variant: 'destructive' }),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => salesService.completeReturn(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['returns'] }); toast({ title: 'Return completed' }); },
    onError: () => toast({ title: 'Error completing return', variant: 'destructive' }),
  });

  const columns = [
    { header: 'Return #', accessor: 'returnNumber' as keyof Return },
    { header: 'Order', render: (r: Return) => r.order?.orderNumber ?? r.orderId ?? '—' },
    { header: 'Customer', render: (r: Return) => r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : '—' },
    { header: 'Reason', render: (r: Return) => r.reason },
    { header: 'Items', render: (r: Return) => r.items.length },
    { header: 'Status', render: (r: Return) => <StatusBadge status={r.status} /> },
    { header: 'Date', render: (r: Return) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: 'Actions',
      render: (r: Return) => (
        <div className="flex gap-1">
          {r.status === 'PENDING' && (
            <>
              <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300 px-2" onClick={() => approveMutation.mutate(r.id)} disabled={approveMutation.isPending}>
                <CheckCircle className="h-3 w-3 mr-1" />Approve
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-red-400 hover:text-red-300 px-2" onClick={() => rejectMutation.mutate(r.id)} disabled={rejectMutation.isPending}>
                <XCircle className="h-3 w-3 mr-1" />Reject
              </Button>
            </>
          )}
          {r.status === 'APPROVED' && (
            <Button variant="ghost" size="sm" className="h-7 text-[#C9A84C] hover:text-[#D4AF37] px-2" onClick={() => completeMutation.mutate(r.id)} disabled={completeMutation.isPending}>
              <PackageCheck className="h-3 w-3 mr-1" />Complete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Returns" subtitle="Manage customer returns" onAction={() => setModalOpen(true)} />

      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Return Request">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Order ID (optional)</Label>
            <Input {...register('orderId')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Order ID" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Branch ID</Label>
            <Input {...register('branchId', { required: 'Branch ID is required' })} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.branchId && <p className="text-red-400 text-xs">{errors.branchId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Reason</Label>
            <Input {...register('reason', { required: 'Reason is required' })} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.reason && <p className="text-red-400 text-xs">{errors.reason.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Description</Label>
            <Input {...register('description')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]">Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Create</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
