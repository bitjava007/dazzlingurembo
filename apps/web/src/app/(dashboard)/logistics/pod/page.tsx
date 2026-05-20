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
import { logisticsService } from '@/services/logistics.service';
import { toast } from '@/hooks/use-toast';
import type { ProofOfDelivery } from '@/types';

const schema = z.object({
  deliveryId: z.string().min(1, 'Delivery ID is required'),
  signatureName: z.string().min(1, 'Signature name is required'),
  notes: z.string().optional(),
  deliveredAt: z.string().min(1, 'Delivered at is required'),
});
type FormData = z.infer<typeof schema>;

export default function PODPage() {
  const qc = useQueryClient();
  const [deliveryId, setDeliveryId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data: pods, isLoading } = useQuery({
    queryKey: ['pod', deliveryId],
    queryFn: () => logisticsService.getPODs(deliveryId),
    enabled: !!deliveryId,
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => logisticsService.createPOD({
      deliveryId: d.deliveryId,
      signatureName: d.signatureName,
      notes: d.notes,
      deliveredAt: d.deliveredAt,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pod'] });
      setModalOpen(false);
      reset();
      toast({ title: 'Proof of delivery recorded' });
    },
  });

  const columns = [
    { header: 'Delivery ID', render: (r: ProofOfDelivery) => r.deliveryId ?? '—' },
    { header: 'Signature Name', accessor: 'signatureName' as keyof ProofOfDelivery },
    { header: 'Notes', render: (r: ProofOfDelivery) => r.notes ?? '—' },
    { header: 'Delivered At', render: (r: ProofOfDelivery) => new Date(r.deliveredAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Proof of Delivery" subtitle="Manage proof of delivery records" actionLabel="Record POD" onAction={() => setModalOpen(true)} />
      <div className="mb-4 flex gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-gray-300">Delivery ID</Label>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-[#111111] border-[#2A2A2A] text-white w-72"
            placeholder="Enter delivery ID to view PODs"
          />
        </div>
        <Button
          onClick={() => setDeliveryId(inputValue)}
          className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold"
        >
          Load PODs
        </Button>
      </div>
      {!deliveryId ? (
        <div className="rounded-md border border-[#2A2A2A] p-10 text-center text-gray-500">
          Enter a Delivery ID above to view its proof of delivery records.
        </div>
      ) : (
        <DataTable columns={columns} data={pods ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      )}

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Record Proof of Delivery">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Delivery ID</Label>
            <Input {...register('deliveryId')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Enter delivery ID" />
            {errors.deliveryId && <p className="text-red-400 text-xs">{errors.deliveryId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Signature Name</Label>
            <Input {...register('signatureName')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Name of recipient" />
            {errors.signatureName && <p className="text-red-400 text-xs">{errors.signatureName.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Delivered At</Label>
            <Input type="datetime-local" {...register('deliveredAt')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.deliveredAt && <p className="text-red-400 text-xs">{errors.deliveredAt.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Notes (optional)</Label>
            <Input {...register('notes')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Record</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
