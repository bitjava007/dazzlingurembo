'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fashionService } from '@/services/fashion.service';
import { toast } from '@/hooks/use-toast';
import type { ProductionSchedule } from '@/types';

interface ScheduleForm {
  workOrderId: string;
  workshopId: string;
  teamId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  title: string;
  notes: string;
}

export default function ProductionSchedulePage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [workshopFilter, setWorkshopFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<ScheduleForm>();

  const { data, isLoading } = useQuery({
    queryKey: ['production-schedules', page, workshopFilter, startDate, endDate],
    queryFn: () =>
      fashionService.getSchedules({
        page,
        limit: 20,
        ...(workshopFilter && { workshopId: workshopFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      }),
  });

  const createM = useMutation({
    mutationFn: (d: ScheduleForm) =>
      fashionService.createSchedule({
        workOrderId: d.workOrderId,
        workshopId: d.workshopId,
        scheduledDate: d.scheduledDate,
        title: d.title,
        teamId: d.teamId || undefined,
        startTime: d.startTime || undefined,
        endTime: d.endTime || undefined,
        notes: d.notes || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-schedules'] });
      setCreateOpen(false);
      reset();
      toast({ title: 'Schedule created' });
    },
    onError: () => toast({ title: 'Failed to create schedule', variant: 'destructive' }),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => fashionService.deleteSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-schedules'] });
      toast({ title: 'Schedule deleted' });
    },
  });

  const columns = [
    {
      header: 'Date',
      render: (r: ProductionSchedule) =>
        new Date(r.scheduledDate).toLocaleDateString(),
    },
    { header: 'Title', accessor: 'title' as keyof ProductionSchedule },
    {
      header: 'Workshop',
      render: (r: ProductionSchedule) =>
        (r.workshop as { name?: string } | undefined)?.name ?? r.workshopId,
    },
    {
      header: 'Work Order',
      render: (r: ProductionSchedule) => {
        const wo = r.workOrder as { workOrderNumber?: string } | undefined;
        return wo?.workOrderNumber ?? r.workOrderId;
      },
    },
    {
      header: 'Team',
      render: (r: ProductionSchedule) =>
        (r.team as { name?: string } | undefined)?.name ?? '—',
    },
    {
      header: 'Time',
      render: (r: ProductionSchedule) => {
        if (r.startTime && r.endTime) {
          return `${new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${new Date(r.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        return '—';
      },
    },
    {
      header: 'Actions',
      render: (r: ProductionSchedule) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-red-400"
          onClick={() => {
            if (confirm('Delete this schedule?')) deleteM.mutate(r.id);
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Production Schedule"
        subtitle="Planning calendar for workshops"
        onAction={() => setCreateOpen(true)}
      />

      <div className="mb-4 flex gap-3 flex-wrap">
        <Input
          placeholder="Filter by Workshop ID..."
          value={workshopFilter}
          onChange={(e) => setWorkshopFilter(e.target.value)}
          className="bg-[#111111] border-[#2A2A2A] text-white w-64"
        />
        <div className="flex items-center gap-2">
          <Label className="text-gray-400 text-sm">From:</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[#111111] border-[#2A2A2A] text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-gray-400 text-sm">To:</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-[#111111] border-[#2A2A2A] text-white"
          />
        </div>
        {(workshopFilter || startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setWorkshopFilter('');
              setStartDate('');
              setEndDate('');
            }}
            className="text-gray-400"
          >
            Clear
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        keyExtractor={(r) => r.id}
      />
      <Pagination
        page={page}
        totalPages={data?.meta?.totalPages ?? 1}
        onPageChange={setPage}
      />

      <FormModal open={createOpen} onOpenChange={setCreateOpen} title="New Production Schedule">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Work Order ID</Label>
              <Input
                {...register('workOrderId')}
                className="bg-[#111111] border-[#2A2A2A] text-white"
                placeholder="Work Order UUID"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Workshop ID</Label>
              <Input
                {...register('workshopId')}
                className="bg-[#111111] border-[#2A2A2A] text-white"
                placeholder="Workshop UUID"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Title</Label>
            <Input
              {...register('title')}
              className="bg-[#111111] border-[#2A2A2A] text-white"
              placeholder="e.g. Cutting Day, Assembly"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Team ID (optional)</Label>
            <Input
              {...register('teamId')}
              className="bg-[#111111] border-[#2A2A2A] text-white"
              placeholder="TailoringTeam UUID"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Scheduled Date</Label>
            <Input
              type="date"
              {...register('scheduledDate')}
              className="bg-[#111111] border-[#2A2A2A] text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Start Time</Label>
              <Input
                type="datetime-local"
                {...register('startTime')}
                className="bg-[#111111] border-[#2A2A2A] text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">End Time</Label>
              <Input
                type="datetime-local"
                {...register('endTime')}
                className="bg-[#111111] border-[#2A2A2A] text-white"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Notes</Label>
            <Input
              {...register('notes')}
              className="bg-[#111111] border-[#2A2A2A] text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              className="text-gray-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createM.isPending}
              className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold"
            >
              Create
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
