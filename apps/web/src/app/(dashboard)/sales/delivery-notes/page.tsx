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
import type { DeliveryNote } from '@/types';
import { Truck } from 'lucide-react';

const schema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});
type FormData = z.infer<typeof schema>;

export default function DeliveryNotesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['delivery-notes', page],
    queryFn: () => salesService.getDeliveryNotes({ page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => salesService.createDeliveryNoteFromOrder(d.orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery-notes'] });
      setModalOpen(false);
      reset();
      toast({ title: 'Delivery note created' });
    },
  });

  const dispatchM = useMutation({
    mutationFn: (id: string) => salesService.dispatchDeliveryNote(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery-notes'] }); toast({ title: 'Delivery note dispatched' }); },
  });

  const columns = [
    { header: 'Order ID', render: (r: DeliveryNote) => r.orderId ?? '—' },
    { header: 'Branch', render: (r: DeliveryNote) => r.branch?.name ?? r.branchId },
    { header: 'Status', render: (r: DeliveryNote) => <StatusBadge status={r.status} /> },
    { header: 'Created At', render: (r: DeliveryNote) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: 'Actions',
      render: (r: DeliveryNote) => r.status === 'DRAFT' ? (
        <Button variant="ghost" size="sm" className="h-7 text-blue-400 hover:text-blue-300" onClick={() => dispatchM.mutate(r.id)}>
          <Truck className="h-3 w-3 mr-1" />Dispatch
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Delivery Notes" subtitle="Delivery note management" actionLabel="Create from Order" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Create Delivery Note">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Order ID</Label>
            <Input {...register('orderId')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Enter order ID" />
            {errors.orderId && <p className="text-red-400 text-xs">{errors.orderId.message}</p>}
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
