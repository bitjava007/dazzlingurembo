'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { inventoryService } from '@/services/inventory.service';
import { toast } from '@/hooks/use-toast';
import type { InventoryCount } from '@/types';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  branchId: z.string().min(1, 'Required'),
  warehouseId: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function InventoryCountsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-counts'],
    queryFn: () => inventoryService.getInventoryCounts(),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => inventoryService.createInventoryCount(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory-counts'] }); setModalOpen(false); reset(); toast({ title: 'Inventory count created' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to create inventory count', variant: 'destructive' }),
  });

  const applyM = useMutation({
    mutationFn: (id: string) => inventoryService.applyInventoryCount(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory-counts'] }); toast({ title: 'Corrections applied' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to apply corrections', variant: 'destructive' }),
  });

  const columns = [
    { header: 'Branch ID', render: (r: InventoryCount) => <span className="font-mono text-xs text-gray-300">{r.branchId}</span> },
    { header: 'Warehouse ID', render: (r: InventoryCount) => r.warehouseId ? <span className="font-mono text-xs text-gray-300">{r.warehouseId}</span> : '—' },
    { header: 'Status', render: (r: InventoryCount) => <StatusBadge status={r.status} /> },
    { header: 'Notes', render: (r: InventoryCount) => r.notes ?? '—' },
    { header: 'Created At', render: (r: InventoryCount) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: 'Actions', render: (r: InventoryCount) => r.status === 'COMPLETED' ? (
        <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300" onClick={() => applyM.mutate(r.id)}>
          <CheckCircle className="h-3 w-3 mr-1" />Apply
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Inventory Counts" subtitle="Manage physical inventory counts" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Inventory Count">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Branch ID</Label>
            <Input {...register('branchId')} placeholder="Branch ID" className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.branchId && <p className="text-red-400 text-xs">{errors.branchId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Warehouse ID (optional)</Label>
            <Input {...register('warehouseId')} placeholder="Warehouse ID" className="bg-[#111111] border-[#2A2A2A] text-white" />
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
