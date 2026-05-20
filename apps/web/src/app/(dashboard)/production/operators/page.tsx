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
import { productionService } from '@/services/production.service';
import { toast } from '@/hooks/use-toast';
import type { OperatorAssignment } from '@/types';
import { UserMinus } from 'lucide-react';

const schema = z.object({
  workOrderId: z.string().min(1, 'Work Order ID is required'),
  operatorId: z.string().min(1, 'Operator ID is required'),
  role: z.string().min(1, 'Role is required'),
  startDate: z.string().min(1, 'Start date is required'),
});
type FormData = z.infer<typeof schema>;

export default function OperatorsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['operator-assignments', page],
    queryFn: () => productionService.getOperatorAssignments({ page, limit: 20 }),
  });

  const assignM = useMutation({
    mutationFn: (d: FormData) => productionService.assignOperator(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operator-assignments'] });
      setModalOpen(false);
      reset();
      toast({ title: 'Operator assigned' });
    },
  });

  const unassignM = useMutation({
    mutationFn: (id: string) => productionService.unassignOperator(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['operator-assignments'] }); toast({ title: 'Operator unassigned' }); },
  });

  const columns = [
    { header: 'Work Order ID', render: (r: OperatorAssignment) => r.workOrderId ?? '—' },
    { header: 'Operator ID', render: (r: OperatorAssignment) => r.operatorId ?? '—' },
    { header: 'Role', accessor: 'role' as keyof OperatorAssignment },
    { header: 'Start Date', render: (r: OperatorAssignment) => new Date(r.startDate).toLocaleDateString() },
    { header: 'Status', render: (r: OperatorAssignment) => <StatusBadge status={r.unassignedAt ? 'INACTIVE' : 'ACTIVE'} /> },
    {
      header: 'Actions',
      render: (r: OperatorAssignment) => !r.unassignedAt ? (
        <Button variant="ghost" size="sm" className="h-7 text-red-400 hover:text-red-300" onClick={() => unassignM.mutate(r.id)}>
          <UserMinus className="h-3 w-3 mr-1" />Unassign
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Operator Assignments" subtitle="Manage operator assignments for work orders" actionLabel="Assign Operator" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Assign Operator">
        <form onSubmit={handleSubmit((d) => assignM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Work Order ID</Label>
            <Input {...register('workOrderId')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Enter work order ID" />
            {errors.workOrderId && <p className="text-red-400 text-xs">{errors.workOrderId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Operator ID</Label>
            <Input {...register('operatorId')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Enter operator ID" />
            {errors.operatorId && <p className="text-red-400 text-xs">{errors.operatorId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Role</Label>
            <Input {...register('role')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="e.g. Lead, Assistant" />
            {errors.role && <p className="text-red-400 text-xs">{errors.role.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Start Date</Label>
            <Input type="date" {...register('startDate')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.startDate && <p className="text-red-400 text-xs">{errors.startDate.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={assignM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Assign</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
