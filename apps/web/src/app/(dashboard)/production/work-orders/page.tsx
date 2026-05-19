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
import { productionService } from '@/services/production.service';
import { toast } from '@/hooks/use-toast';
import type { WorkOrder } from '@/types';

const schema = z.object({
  quantity: z.string().min(1, 'Required'),
  notes: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function WorkOrdersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['work-orders', search, page],
    queryFn: () => productionService.getWorkOrders({ search, page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => productionService.createWorkOrder({ ...d, quantity: parseInt(d.quantity) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['work-orders'] }); setModalOpen(false); reset(); toast({ title: 'Work order created' }); },
  });

  const statusM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => productionService.updateWorkOrderStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['work-orders'] }); toast({ title: 'Status updated' }); },
  });

  const columns = [
    { header: 'WO #', accessor: 'number' as keyof WorkOrder },
    { header: 'Product', render: (r: WorkOrder) => r.product?.name ?? '—' },
    { header: 'Quantity', accessor: 'quantity' as keyof WorkOrder },
    { header: 'Status', render: (r: WorkOrder) => <StatusBadge status={r.status} /> },
    { header: 'Start Date', render: (r: WorkOrder) => r.startDate ? new Date(r.startDate).toLocaleDateString() : '—' },
    { header: 'End Date', render: (r: WorkOrder) => r.endDate ? new Date(r.endDate).toLocaleDateString() : '—' },
    {
      header: 'Actions', render: (r: WorkOrder) => r.status === 'DRAFT' ? (
        <Button variant="ghost" size="sm" className="h-7 text-[#C9A84C]" onClick={() => statusM.mutate({ id: r.id, status: 'IN_PROGRESS' })}>Start</Button>
      ) : r.status === 'IN_PROGRESS' ? (
        <Button variant="ghost" size="sm" className="h-7 text-green-400" onClick={() => statusM.mutate({ id: r.id, status: 'COMPLETED' })}>Complete</Button>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Work Orders" subtitle="Production work orders" onAction={() => setModalOpen(true)} />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search work orders..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Work Order">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1"><Label className="text-gray-300">Quantity</Label><Input type="number" {...register('quantity')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Start Date</Label><Input type="date" {...register('startDate')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
            <div className="space-y-1"><Label className="text-gray-300">End Date</Label><Input type="date" {...register('endDate')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="space-y-1"><Label className="text-gray-300">Notes</Label><Input {...register('notes')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Create</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
