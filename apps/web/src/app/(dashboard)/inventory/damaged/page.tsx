'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { inventoryService } from '@/services/inventory.service';
import { toast } from '@/hooks/use-toast';
import type { DamagedStock } from '@/types';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  productId: z.string().min(1, 'Required'),
  variantId: z.string().optional(),
  quantity: z.string().min(1, 'Required'),
  reason: z.string().min(1, 'Required'),
  estimatedLoss: z.string().optional(),
  branchId: z.string().min(1, 'Required'),
});
type FormData = z.infer<typeof schema>;

export default function DamagedStockPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['damaged-stock'],
    queryFn: () => inventoryService.getDamagedStock(),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => inventoryService.createDamagedStock({
      ...d,
      quantity: parseInt(d.quantity, 10),
      estimatedLoss: d.estimatedLoss ? parseFloat(d.estimatedLoss) : undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['damaged-stock'] }); setModalOpen(false); reset(); toast({ title: 'Damaged stock record created' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to create damaged stock record', variant: 'destructive' }),
  });

  const resolveM = useMutation({
    mutationFn: (id: string) => inventoryService.resolveDamagedStock(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['damaged-stock'] }); toast({ title: 'Damaged stock resolved' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to resolve damaged stock', variant: 'destructive' }),
  });

  const columns = [
    { header: 'Variant ID', render: (r: DamagedStock) => <span className="font-mono text-xs text-gray-300">{r.variantId ?? '—'}</span> },
    { header: 'Quantity', render: (r: DamagedStock) => r.quantity },
    { header: 'Reason', render: (r: DamagedStock) => r.reason },
    { header: 'Est. Loss', render: (r: DamagedStock) => r.estimatedLoss != null ? `$${r.estimatedLoss.toFixed(2)}` : '—' },
    { header: 'Status', render: (r: DamagedStock) => r.resolvedAt ? <span className="text-green-400">Resolved</span> : <span className="text-yellow-400">Unresolved</span> },
    { header: 'Created At', render: (r: DamagedStock) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: 'Actions', render: (r: DamagedStock) => !r.resolvedAt ? (
        <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300" onClick={() => resolveM.mutate(r.id)}>
          <CheckCircle className="h-3 w-3 mr-1" />Resolve
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Damaged Stock" subtitle="Track and resolve damaged inventory" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Report Damaged Stock">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Product ID</Label>
              <Input {...register('productId')} placeholder="Product ID" className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.productId && <p className="text-red-400 text-xs">{errors.productId.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Variant ID (optional)</Label>
              <Input {...register('variantId')} placeholder="Variant ID" className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Quantity</Label>
              <Input type="number" {...register('quantity')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.quantity && <p className="text-red-400 text-xs">{errors.quantity.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Est. Loss ($)</Label>
              <Input type="number" step="0.01" {...register('estimatedLoss')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Branch ID</Label>
            <Input {...register('branchId')} placeholder="Branch ID" className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.branchId && <p className="text-red-400 text-xs">{errors.branchId.message}</p>}
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
