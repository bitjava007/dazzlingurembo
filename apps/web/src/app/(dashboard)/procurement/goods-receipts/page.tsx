'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { procurementService } from '@/services/procurement.service';
import { toast } from '@/hooks/use-toast';
import type { GoodsReceipt } from '@/types';

const schema = z.object({
  purchaseOrderId: z.string().min(1, 'Required'),
  warehouseId: z.string().min(1, 'Required'),
  branchId: z.string().min(1, 'Required'),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function GoodsReceiptsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['goods-receipts', page],
    queryFn: () => procurementService.getGoodsReceipts({ page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => procurementService.createGoodsReceipt({ ...d, items: [] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goods-receipts'] }); setModalOpen(false); reset(); toast({ title: 'Goods receipt created' }); },
  });

  const columns = [
    { header: 'Purchase Order', render: (r: GoodsReceipt) => r.purchaseOrder?.number ?? r.purchaseOrderId },
    { header: 'Branch', render: (r: GoodsReceipt) => r.branchId },
    { header: 'Items', render: (r: GoodsReceipt) => r.items?.length ?? 0 },
    { header: 'Notes', render: (r: GoodsReceipt) => r.notes ?? '—' },
    { header: 'Received', render: (r: GoodsReceipt) => r.receivedDate ? new Date(r.receivedDate).toLocaleDateString() : new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Goods Receipts" subtitle="Record received goods from purchase orders" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Goods Receipt">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Purchase Order ID</Label>
            <Input {...register('purchaseOrderId')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.purchaseOrderId && <p className="text-red-400 text-xs">{errors.purchaseOrderId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Warehouse ID</Label>
            <Input {...register('warehouseId')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.warehouseId && <p className="text-red-400 text-xs">{errors.warehouseId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Branch ID</Label>
            <Input {...register('branchId')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.branchId && <p className="text-red-400 text-xs">{errors.branchId.message}</p>}
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
