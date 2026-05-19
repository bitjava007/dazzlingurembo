'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { crmService } from '@/services/crm.service';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import type { Customer } from '@/types';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  tier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']),
  isVip: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => crmService.getCustomers({ search, page, limit: 20 }),
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tier: 'BRONZE', isVip: false },
  });

  const createMutation = useMutation({
    mutationFn: (d: FormData) => crmService.createCustomer(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setModalOpen(false); reset(); toast({ title: 'Customer created' }); },
    onError: () => toast({ title: 'Error', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: (d: FormData) => crmService.updateCustomer(editItem!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setModalOpen(false); setEditItem(null); reset(); toast({ title: 'Customer updated' }); },
    onError: () => toast({ title: 'Error', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => crmService.deleteCustomer(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setDeleteId(null); toast({ title: 'Customer deleted' }); },
    onError: () => toast({ title: 'Error', variant: 'destructive' }),
  });

  const openCreate = () => { setEditItem(null); reset({ tier: 'BRONZE', isVip: false }); setModalOpen(true); };
  const openEdit = (item: Customer) => {
    setEditItem(item);
    reset({ firstName: item.firstName, lastName: item.lastName, email: item.email ?? '', phone: item.phone ?? '', tier: item.tier, isVip: item.isVip });
    setModalOpen(true);
  };

  const onSubmit = (d: FormData) => editItem ? updateMutation.mutate(d) : createMutation.mutate(d);

  const columns = [
    { header: 'Name', render: (r: Customer) => `${r.firstName} ${r.lastName}` },
    { header: 'Code', accessor: 'code' as keyof Customer },
    { header: 'Email', accessor: 'email' as keyof Customer },
    { header: 'Phone', accessor: 'phone' as keyof Customer },
    { header: 'Tier', render: (r: Customer) => <StatusBadge status={r.tier} /> },
    { header: 'Status', render: (r: Customer) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: (r: Customer) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Customers" subtitle="Manage your CRM customer records" onAction={openCreate} />

      <div className="mb-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search customers..." />
      </div>

      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editItem ? 'Edit Customer' : 'New Customer'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">First Name</Label>
              <Input {...register('firstName')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.firstName && <p className="text-red-400 text-xs">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Last Name</Label>
              <Input {...register('lastName')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.lastName && <p className="text-red-400 text-xs">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Email</Label>
            <Input type="email" {...register('email')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Phone</Label>
            <Input {...register('phone')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Tier</Label>
            <Select value={watch('tier')} onValueChange={(v) => setValue('tier', v as FormData['tier'])}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map((t) => (
                  <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isVip" {...register('isVip')} className="accent-[#C9A84C]" />
            <Label htmlFor="isVip" className="text-gray-300">Is VIP</Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]">Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">
              {editItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        title="Delete Customer"
        description="This will permanently delete this customer."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
