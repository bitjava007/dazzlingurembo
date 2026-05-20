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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Pencil } from 'lucide-react';
import type { Country, Branch, PaginatedResponse } from '@/types';

const branchSchema = z.object({
  name: z.string().min(1, 'Required'),
  code: z.string().min(1, 'Required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});
type BranchForm = z.infer<typeof branchSchema>;

export default function OrganizationPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BranchForm>({ resolver: zodResolver(branchSchema) });

  const { data: countriesData, isLoading: cLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => { const res = await api.get<PaginatedResponse<Country>>('/organization/countries'); return res.data; },
  });

  const { data: branchesData, isLoading: bLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => { const res = await api.get<PaginatedResponse<Branch>>('/organization/branches'); return res.data; },
  });

  const createBranchM = useMutation({
    mutationFn: (d: BranchForm) => api.post<Branch>('/organization/branches', d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); setModalOpen(false); reset(); toast({ title: 'Branch created' }); },
  });
  const updateBranchM = useMutation({
    mutationFn: (d: BranchForm) => api.patch<Branch>(`/organization/branches/${editBranch!.id}`, d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); setModalOpen(false); setEditBranch(null); reset(); toast({ title: 'Branch updated' }); },
  });

  const openCreateBranch = () => { setEditBranch(null); reset(); setModalOpen(true); };
  const openEditBranch = (b: Branch) => { setEditBranch(b); reset({ name: b.name, code: b.code, address: b.address ?? '', phone: b.phone ?? '', email: b.email ?? '' }); setModalOpen(true); };
  const onSubmitBranch = (d: BranchForm) => editBranch ? updateBranchM.mutate(d) : createBranchM.mutate(d);

  const countryColumns = [
    { header: 'Name', accessor: 'name' as keyof Country },
    { header: 'Code', accessor: 'code' as keyof Country },
    { header: 'Currency', render: (r: Country) => `${r.currencySymbol} ${r.currencyCode}` },
    { header: 'Timezone', accessor: 'timezone' as keyof Country },
  ];

  const branchColumns = [
    { header: 'Name', accessor: 'name' as keyof Branch },
    { header: 'Code', accessor: 'code' as keyof Branch },
    { header: 'Country', render: (r: Branch) => r.country?.name ?? '—' },
    { header: 'Status', render: (r: Branch) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      header: 'Actions', render: (r: Branch) => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEditBranch(r)}><Pencil className="h-3 w-3" /></Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Organization" subtitle="Manage countries and branches" />
      <Tabs defaultValue="branches">
        <TabsList className="bg-[#1A1A1A] border border-[#2A2A2A] mb-4">
          <TabsTrigger value="branches" className="data-[state=active]:bg-[#C9A84C] data-[state=active]:text-black">Branches</TabsTrigger>
          <TabsTrigger value="countries" className="data-[state=active]:bg-[#C9A84C] data-[state=active]:text-black">Countries</TabsTrigger>
        </TabsList>
        <TabsContent value="branches">
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateBranch} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Add Branch</Button>
          </div>
          <DataTable columns={branchColumns} data={branchesData?.data ?? []} loading={bLoading} keyExtractor={(r) => r.id} />
        </TabsContent>
        <TabsContent value="countries">
          <DataTable columns={countryColumns} data={countriesData?.data ?? []} loading={cLoading} keyExtractor={(r) => r.id} />
        </TabsContent>
      </Tabs>

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editBranch ? 'Edit Branch' : 'New Branch'}>
        <form onSubmit={handleSubmit(onSubmitBranch)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Name</Label><Input {...register('name')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">Code</Label><Input {...register('code')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="space-y-1"><Label className="text-gray-300">Address</Label><Input {...register('address')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Phone</Label><Input {...register('phone')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
            <div className="space-y-1"><Label className="text-gray-300">Email</Label><Input type="email" {...register('email')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createBranchM.isPending || updateBranchM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">{editBranch ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
