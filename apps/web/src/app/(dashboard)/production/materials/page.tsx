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
import { productionService } from '@/services/production.service';
import { toast } from '@/hooks/use-toast';
import type { MaterialConsumption } from '@/types';

const schema = z.object({
  workOrderId: z.string().min(1, 'Work Order ID is required'),
  variantId: z.string().min(1, 'Variant ID is required'),
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  plannedQuantity: z.string().min(1, 'Planned quantity is required'),
  consumedQuantity: z.string().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProductionMaterialsPage() {
  const qc = useQueryClient();
  const [workOrderId, setWorkOrderId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data: materials, isLoading } = useQuery({
    queryKey: ['production-materials', workOrderId],
    queryFn: () => productionService.getMaterials(workOrderId),
    enabled: !!workOrderId,
  });

  const recordM = useMutation({
    mutationFn: (d: FormData) => productionService.recordMaterialConsumption({
      workOrderId: d.workOrderId,
      variantId: d.variantId,
      warehouseId: d.warehouseId,
      plannedQuantity: parseFloat(d.plannedQuantity),
      consumedQuantity: d.consumedQuantity ? parseFloat(d.consumedQuantity) : undefined,
      unit: d.unit,
      notes: d.notes,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-materials'] });
      setModalOpen(false);
      reset();
      toast({ title: 'Material consumption recorded' });
    },
  });

  const columns = [
    { header: 'Work Order ID', render: (r: MaterialConsumption) => r.workOrderId ?? '—' },
    { header: 'Variant ID', render: (r: MaterialConsumption) => r.variantId ?? '—' },
    { header: 'Planned Qty', render: (r: MaterialConsumption) => r.plannedQuantity?.toString() ?? '—' },
    { header: 'Consumed Qty', render: (r: MaterialConsumption) => r.consumedQuantity?.toString() ?? '—' },
    { header: 'Unit', accessor: 'unit' as keyof MaterialConsumption },
    { header: 'Recorded At', render: (r: MaterialConsumption) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Production Materials" subtitle="Track material consumption by work order" actionLabel="Record Consumption" onAction={() => setModalOpen(true)} />
      <div className="mb-4 flex gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-gray-300">Work Order ID</Label>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-[#111111] border-[#2A2A2A] text-white w-72"
            placeholder="Enter work order ID to view materials"
          />
        </div>
        <Button
          onClick={() => setWorkOrderId(inputValue)}
          className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold"
        >
          Load Materials
        </Button>
      </div>
      {!workOrderId ? (
        <div className="rounded-md border border-[#2A2A2A] p-10 text-center text-gray-500">
          Enter a Work Order ID above to view its materials.
        </div>
      ) : (
        <DataTable columns={columns} data={materials ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      )}

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Record Material Consumption">
        <form onSubmit={handleSubmit((d) => recordM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Work Order ID</Label>
            <Input {...register('workOrderId')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Enter work order ID" />
            {errors.workOrderId && <p className="text-red-400 text-xs">{errors.workOrderId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Variant ID</Label>
            <Input {...register('variantId')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Enter variant ID" />
            {errors.variantId && <p className="text-red-400 text-xs">{errors.variantId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Warehouse ID</Label>
            <Input {...register('warehouseId')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Enter warehouse ID" />
            {errors.warehouseId && <p className="text-red-400 text-xs">{errors.warehouseId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Planned Quantity</Label>
              <Input type="number" step="0.001" {...register('plannedQuantity')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.plannedQuantity && <p className="text-red-400 text-xs">{errors.plannedQuantity.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Consumed Quantity</Label>
              <Input type="number" step="0.001" {...register('consumedQuantity')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Unit (optional)</Label>
            <Input {...register('unit')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="e.g. kg, m, pcs" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Notes (optional)</Label>
            <Input {...register('notes')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={recordM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Record</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
