'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { productionService } from '@/services/production.service';
import { toast } from '@/hooks/use-toast';
import type { WorkOrderStage } from '@/types';
import { Play, CheckCircle } from 'lucide-react';

export default function ProductionStagesPage() {
  const qc = useQueryClient();
  const [workOrderId, setWorkOrderId] = useState('');
  const [inputValue, setInputValue] = useState('');

  const { data: stages, isLoading } = useQuery({
    queryKey: ['production-stages', workOrderId],
    queryFn: () => productionService.getStages(workOrderId),
    enabled: !!workOrderId,
  });

  const startM = useMutation({
    mutationFn: (id: string) => productionService.startStage(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['production-stages'] }); toast({ title: 'Stage started' }); },
  });

  const completeM = useMutation({
    mutationFn: (id: string) => productionService.completeStage(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['production-stages'] }); toast({ title: 'Stage completed' }); },
  });

  const columns = [
    { header: 'Stage Name', render: (r: WorkOrderStage) => r.name ?? '—' },
    { header: 'Status', render: (r: WorkOrderStage) => <StatusBadge status={r.status} /> },
    { header: 'Started At', render: (r: WorkOrderStage) => r.startedAt ? new Date(r.startedAt).toLocaleDateString() : '—' },
    { header: 'Completed At', render: (r: WorkOrderStage) => r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—' },
    { header: 'Notes', render: (r: WorkOrderStage) => r.notes ?? '—' },
    {
      header: 'Actions',
      render: (r: WorkOrderStage) => (
        <div className="flex gap-1">
          {r.status === 'PENDING' && (
            <Button variant="ghost" size="sm" className="h-7 text-blue-400 hover:text-blue-300" onClick={() => startM.mutate(r.id)}>
              <Play className="h-3 w-3 mr-1" />Start
            </Button>
          )}
          {r.status === 'IN_PROGRESS' && (
            <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300" onClick={() => completeM.mutate(r.id)}>
              <CheckCircle className="h-3 w-3 mr-1" />Complete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Production Stages" subtitle="Manage production stages by work order" />
      <div className="mb-4 flex gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-gray-300">Work Order ID</Label>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-[#111111] border-[#2A2A2A] text-white w-72"
            placeholder="Enter work order ID to view stages"
          />
        </div>
        <Button
          onClick={() => setWorkOrderId(inputValue)}
          className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold"
        >
          Load Stages
        </Button>
      </div>
      {!workOrderId ? (
        <div className="rounded-md border border-[#2A2A2A] p-10 text-center text-gray-500">
          Enter a Work Order ID above to view its stages.
        </div>
      ) : (
        <DataTable columns={columns} data={stages ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      )}
    </div>
  );
}
