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
import { Truck, PackageCheck } from 'lucide-react';
import type { DeliveryNote } from '@/types';

interface CreateFromOrderFormData {
  orderId: string;
}

export default function DeliveryNotesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['delivery-notes', page],
    queryFn: () => salesService.getDeliveryNotes({ page, limit: 20 }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateFromOrderFormData>({
    defaultValues: { orderId: '' },
  });

  const createMutation = useMutation({
    mutationFn: (d: CreateFromOrderFormData) => salesService.createDeliveryNoteFromOrder(d.orderId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery-notes'] }); setModalOpen(false); reset(); toast({ title: 'Delivery note created' }); },
    onError: () => toast({ title: 'Error creating delivery note', variant: 'destructive' }),
  });

  const dispatchMutation = useMutation({
    mutationFn: (id: string) => salesService.dispatchDeliveryNote(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery-notes'] }); toast({ title: 'Delivery note dispatched' }); },
    onError: () => toast({ title: 'Error dispatching', variant: 'destructive' }),
  });

  const deliverMutation = useMutation({
    mutationFn: (id: string) => salesService.deliverDeliveryNote(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery-notes'] }); toast({ title: 'Marked as delivered' }); },
    onError: () => toast({ title: 'Error marking as delivered', variant: 'destructive' }),
  });

  const columns = [
    { header: 'Delivery #', accessor: 'deliveryNumber' as keyof DeliveryNote },
    { header: 'Order', render: (r: DeliveryNote) => r.order?.orderNumber ?? r.orderId },
    { header: 'Branch', render: (r: DeliveryNote) => r.branch?.name ?? '—' },
    { header: 'Status', render: (r: DeliveryNote) => <StatusBadge status={r.status} /> },
    { header: 'Notes', render: (r: DeliveryNote) => r.notes ?? '—' },
    { header: 'Dispatched', render: (r: DeliveryNote) => r.dispatchedAt ? new Date(r.dispatchedAt).toLocaleDateString() : '—' },
    { header: 'Delivered', render: (r: DeliveryNote) => r.deliveredAt ? new Date(r.deliveredAt).toLocaleDateString() : '—' },
    {
      header: 'Actions',
      render: (r: DeliveryNote) => (
        <div className="flex gap-1">
          {r.status === 'DRAFT' && (
            <Button variant="ghost" size="sm" className="h-7 text-[#C9A84C] hover:text-[#D4AF37] px-2" onClick={() => dispatchMutation.mutate(r.id)} disabled={dispatchMutation.isPending}>
              <Truck className="h-3 w-3 mr-1" />Dispatch
            </Button>
          )}
          {r.status === 'DISPATCHED' && (
            <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300 px-2" onClick={() => deliverMutation.mutate(r.id)} disabled={deliverMutation.isPending}>
              <PackageCheck className="h-3 w-3 mr-1" />Deliver
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Delivery Notes" subtitle="Manage delivery notes" onAction={() => setModalOpen(true)} />

      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Create Delivery Note from Order">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Order ID</Label>
            <Input
              {...register('orderId', { required: 'Order ID is required' })}
              className="bg-[#111111] border-[#2A2A2A] text-white"
              placeholder="Enter order ID"
            />
            {errors.orderId && <p className="text-red-400 text-xs">{errors.orderId.message}</p>}
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
