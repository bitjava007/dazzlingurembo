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
import type { TailoringTeam } from '@/types';

interface TeamForm {
  name: string;
  code: string;
  workshopId: string;
  capacity: string;
  specialties: string;
  isActive: boolean;
}

export default function TeamsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<TailoringTeam | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<TeamForm>({ defaultValues: { isActive: true } });

  const { data, isLoading } = useQuery({
    queryKey: ['teams', page],
    queryFn: () => fashionService.getTeams({ page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: TeamForm) => fashionService.createTeam({
      name: d.name, code: d.code, workshopId: d.workshopId,
      capacity: d.capacity ? Number(d.capacity) : undefined,
      specialties: d.specialties ? d.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
      isActive: d.isActive,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); setModalOpen(false); reset(); toast({ title: 'Team created' }); },
  });

  const updateM = useMutation({
    mutationFn: ({ id, d }: { id: string; d: TeamForm }) => fashionService.updateTeam(id, {
      name: d.name, code: d.code, workshopId: d.workshopId,
      capacity: d.capacity ? Number(d.capacity) : undefined,
      specialties: d.specialties ? d.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
      isActive: d.isActive,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); setModalOpen(false); setEditTeam(null); reset(); toast({ title: 'Team updated' }); },
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => fashionService.deleteTeam(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); toast({ title: 'Team deleted' }); },
  });

  const openEdit = (team: TailoringTeam) => {
    setEditTeam(team);
    setValue('name', team.name);
    setValue('code', team.code);
    setValue('workshopId', team.workshopId);
    setValue('capacity', team.capacity?.toString() ?? '');
    setValue('specialties', team.specialties.join(', '));
    setValue('isActive', team.isActive);
    setModalOpen(true);
  };

  const onSubmit = (d: TeamForm) => {
    if (editTeam) updateM.mutate({ id: editTeam.id, d });
    else createM.mutate(d);
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof TailoringTeam },
    { header: 'Code', accessor: 'code' as keyof TailoringTeam },
    { header: 'Workshop ID', accessor: 'workshopId' as keyof TailoringTeam },
    { header: 'Capacity', render: (r: TailoringTeam) => r.capacity ?? '-' },
    { header: 'Specialties', render: (r: TailoringTeam) => (
      <div className="flex flex-wrap gap-1">
        {r.specialties.map((s, i) => <span key={i} className="px-1 py-0.5 bg-[#1A1A1A] text-xs rounded text-gray-300">{s}</span>)}
      </div>
    )},
    { header: 'Active', render: (r: TailoringTeam) => r.isActive ? 'Yes' : 'No' },
    {
      header: 'Actions',
      render: (r: TailoringTeam) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-blue-400 hover:text-blue-300" onClick={() => openEdit(r)}>Edit</Button>
          <Button variant="ghost" size="sm" className="h-7 text-red-400 hover:text-red-300" onClick={() => { if (confirm('Delete team?')) deleteM.mutate(r.id); }}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Tailoring Teams" subtitle="Manage tailoring teams" onAction={() => { setEditTeam(null); reset(); setModalOpen(true); }} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={(v) => { setModalOpen(v); if (!v) { setEditTeam(null); reset(); } }} title={editTeam ? 'Edit Team' : 'New Team'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Name</Label>
              <Input {...register('name', { required: true })} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Code</Label>
              <Input {...register('code', { required: true })} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Workshop ID</Label>
            <Input {...register('workshopId', { required: true })} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Capacity</Label>
              <Input type="number" {...register('capacity')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Active</Label>
              <select {...register('isActive')} className="w-full h-10 rounded-md bg-[#111111] border border-[#2A2A2A] text-white px-3 text-sm">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Specialties (comma-separated)</Label>
            <Input {...register('specialties')} placeholder="e.g. TAILORING, EMBROIDERY" className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending || updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">{editTeam ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
