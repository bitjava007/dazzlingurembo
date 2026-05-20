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
import { StatusBadge } from '@/components/ui/status-badge';
import { fashionService } from '@/services/fashion.service';
import { toast } from '@/hooks/use-toast';
import type { Alteration } from '@/types';
import { Play, CheckCircle, Truck } from 'lucide-react';

const schema = z.object({
  customerId: z.string().min(1, 'Required'),
  branchId: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  alterationType: z.string().optional(),
  workshopId: z.string().optional(),
  estimatedCost: z.string().optional(),
  estimatedTime: z.string().optional(),
  tailorId: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AlterationsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['alterations'],
    queryFn: () => fashionService.getAlterations(),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => fashionService.createAlteration({
      ...d,
      estimatedCost: d.estimatedCost ? parseFloat(d.estimatedCost) : undefined,
      estimatedTime: d.estimatedTime ? parseInt(d.estimatedTime, 10) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alterations'] });
      setModalOpen(false);
      reset();
      toast({ title: 'Alteration created' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create alteration', variant: 'destructive' }),
  });

  const startM = useMutation({
    mutationFn: (id: string) => fashionService.startAlteration(id, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['alterations'] }); toast({ title: 'Alteration started' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to start alteration', variant: 'destructive' }),
  });

  const completeM = useMutation({
    mutationFn: (id: string) => fashionService.completeAlteration(id, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['alterations'] }); toast({ title: 'Alteration completed' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to complete alteration', variant: 'destructive' }),
  });

  const deliverM = useMutation({
    mutationFn: (id: string) => fashionService.deliverAlteration(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['alterations'] }); toast({ title: 'Alteration delivered' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to deliver alteration', variant: 'destructive' }),
  });

  const columns = [
    { header: 'Number', render: (r: Alteration) => <span className="font-mono text-xs text-gray-300">{r.alterationNumber}</span> },
    { header: 'Customer ID', render: (r: Alteration) => <span className="font-mono text-xs text-gray-400">{r.customerId.slice(0, 8)}…</span> },
    { header: 'Description', render: (r: Alteration) => <span className="text-sm truncate max-w-xs block" title={r.description}>{r.description.length > 40 ? r.description.slice(0, 40) + '…' : r.description}</span> },
    { header: 'Type', render: (r: Alteration) => r.alterationType ?? '—' },
    { header: 'Status', render: (r: Alteration) => <StatusBadge status={r.status} /> },
    { header: 'Est. Cost', render: (r: Alteration) => r.estimatedCost != null ? `${r.estimatedCost.toFixed(0)} ${r.currencyCode}` : '—' },
    { header: 'Received', render: (r: Alteration) => new Date(r.receivedAt).toLocaleDateString() },
    {
      header: 'Actions',
      render: (r: Alteration) => (
        <div className="flex gap-1">
          {r.status === 'RECEIVED' && (
            <Button variant="ghost" size="sm" className="h-7 text-blue-400 hover:text-blue-300" onClick={() => startM.mutate(r.id)}>
              <Play className="h-3 w-3 mr-1" />Start
            </Button>
          )}
          {r.status === 'IN_PROGRESS' && (
            <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300" onClick={() => completeM.mutate(r.id)}>
              <CheckCircle className="h-3 w-3 mr-1" />Complete
            </Button>
          )}
          {r.status === 'COMPLETED' && (
            <Button variant="ghost" size="sm" className="h-7 text-[#C9A84C] hover:text-[#D4AF37]" onClick={() => deliverM.mutate(r.id)}>
              <Truck className="h-3 w-3 mr-1" />Deliver
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Alterations" subtitle="Manage garment alterations and modifications" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} emptyMessage="No alterations found" />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Alteration">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Customer ID</Label>
              <Input {...register('customerId')} placeholder="Customer ID" className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.customerId && <p className="text-red-400 text-xs">{errors.customerId.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Branch ID</Label>
              <Input {...register('branchId')} placeholder="Branch ID" className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.branchId && <p className="text-red-400 text-xs">{errors.branchId.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Description</Label>
            <Input {...register('description')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Type</Label>
              <Input {...register('alterationType')} placeholder="e.g. HEM, RESIZE" className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Workshop ID</Label>
              <Input {...register('workshopId')} placeholder="Workshop ID" className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Est. Cost</Label>
              <Input type="number" step="0.01" {...register('estimatedCost')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Est. Time (hours)</Label>
              <Input type="number" {...register('estimatedTime')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
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
