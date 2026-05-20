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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { organizationService } from '@/services/organization.service';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2 } from 'lucide-react';
import type { Country, Branch, Warehouse, Workshop } from '@/types';

const countrySchema = z.object({
  name: z.string().min(1, 'Required'),
  isoCode2: z.string().length(2, 'Must be 2 characters'),
  isoCode3: z.string().length(3, 'Must be 3 characters'),
  currencyCode: z.string().min(1, 'Required'),
  currencyName: z.string().min(1, 'Required'),
  currencySymbol: z.string().min(1, 'Required'),
  dialCode: z.string().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
});
type CountryForm = z.infer<typeof countrySchema>;

const branchSchema = z.object({
  name: z.string().min(1, 'Required'),
  code: z.string().min(1, 'Required'),
  type: z.string().min(1, 'Required'),
  countryId: z.string().min(1, 'Required'),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});
type BranchForm = z.infer<typeof branchSchema>;

const warehouseSchema = z.object({
  name: z.string().min(1, 'Required'),
  code: z.string().min(1, 'Required'),
  branchId: z.string().min(1, 'Required'),
  address: z.string().optional(),
});
type WarehouseForm = z.infer<typeof warehouseSchema>;

const workshopSchema = z.object({
  name: z.string().min(1, 'Required'),
  code: z.string().min(1, 'Required'),
  branchId: z.string().min(1, 'Required'),
  address: z.string().optional(),
});
type WorkshopForm = z.infer<typeof workshopSchema>;

const BRANCH_TYPES = ['RETAIL', 'WHOLESALE', 'WAREHOUSE', 'OFFICE', 'SHOWROOM', 'OTHER'];

function CountriesTab() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Country | null>(null);
  const [deleteItem, setDeleteItem] = useState<Country | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useForm<CountryForm>({ resolver: zodResolver(countrySchema) });

  const { data, isLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: () => organizationService.getCountries(),
  });

  const createM = useMutation({
    mutationFn: (d: CountryForm) => organizationService.createCountry(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['countries'] }); setModalOpen(false); form.reset(); toast({ title: 'Country created' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to create country', variant: 'destructive' }),
  });
  const updateM = useMutation({
    mutationFn: (d: CountryForm) => organizationService.updateCountry(editItem!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['countries'] }); setModalOpen(false); setEditItem(null); form.reset(); toast({ title: 'Country updated' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to update country', variant: 'destructive' }),
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => organizationService.deleteCountry(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['countries'] }); setDeleteOpen(false); setDeleteItem(null); toast({ title: 'Country deleted' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to delete country', variant: 'destructive' }),
  });

  const openCreate = () => { setEditItem(null); form.reset(); setModalOpen(true); };
  const openEdit = (item: Country) => { setEditItem(item); form.reset({ name: item.name, isoCode2: item.isoCode2, isoCode3: item.isoCode3, currencyCode: item.currencyCode, currencyName: item.currencyName, currencySymbol: item.currencySymbol, dialCode: item.dialCode ?? '', locale: item.locale ?? '', timezone: item.timezone ?? '' }); setModalOpen(true); };
  const openDelete = (item: Country) => { setDeleteItem(item); setDeleteOpen(true); };
  const onSubmit = (d: CountryForm) => editItem ? updateM.mutate(d) : createM.mutate(d);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Country },
    { header: 'ISO2', accessor: 'isoCode2' as keyof Country },
    { header: 'ISO3', accessor: 'isoCode3' as keyof Country },
    { header: 'Currency', render: (r: Country) => `${r.currencySymbol} ${r.currencyCode}` },
    { header: 'Timezone', render: (r: Country) => r.timezone ?? '—' },
    { header: 'Active', render: (r: Country) => <span className={r.isActive ? 'text-green-400' : 'text-gray-500'}>{r.isActive ? 'Yes' : 'No'}</span> },
    { header: 'Actions', render: (r: Country) => <div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => openDelete(r)}><Trash2 className="h-3 w-3" /></Button></div> },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4"><Button onClick={openCreate} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Add Country</Button></div>
      <DataTable columns={columns} data={data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <FormModal open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditItem(null); } }} title={editItem ? 'Edit Country' : 'New Country'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2"><Label className="text-gray-300">Name</Label><Input {...form.register('name')} className="bg-[#111111] border-[#2A2A2A] text-white" />{form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">ISO Code 2</Label><Input {...form.register('isoCode2')} maxLength={2} placeholder="MA" className="bg-[#111111] border-[#2A2A2A] text-white" />{form.formState.errors.isoCode2 && <p className="text-red-400 text-xs">{form.formState.errors.isoCode2.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">ISO Code 3</Label><Input {...form.register('isoCode3')} maxLength={3} placeholder="MAR" className="bg-[#111111] border-[#2A2A2A] text-white" />{form.formState.errors.isoCode3 && <p className="text-red-400 text-xs">{form.formState.errors.isoCode3.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">Currency Code</Label><Input {...form.register('currencyCode')} placeholder="MAD" className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
            <div className="space-y-1"><Label className="text-gray-300">Currency Name</Label><Input {...form.register('currencyName')} placeholder="Moroccan Dirham" className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
            <div className="space-y-1"><Label className="text-gray-300">Currency Symbol</Label><Input {...form.register('currencySymbol')} placeholder="د.م." className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
            <div className="space-y-1"><Label className="text-gray-300">Dial Code</Label><Input {...form.register('dialCode')} placeholder="+212" className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
            <div className="space-y-1"><Label className="text-gray-300">Timezone</Label><Input {...form.register('timezone')} placeholder="Africa/Casablanca" className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
            <div className="space-y-1"><Label className="text-gray-300">Locale</Label><Input {...form.register('locale')} placeholder="ar-MA" className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending || updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>
      <FormModal open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Country">
        <div className="mt-2 space-y-4">
          <p className="text-gray-300">Are you sure you want to delete <span className="text-white font-semibold">{deleteItem?.name}</span>?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="button" disabled={deleteM.isPending} className="bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={() => deleteItem && deleteM.mutate(deleteItem.id)}>Delete</Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}

function BranchesTab() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Branch | null>(null);
  const [deleteItem, setDeleteItem] = useState<Branch | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useForm<BranchForm>({ resolver: zodResolver(branchSchema) });

  const { data: countries } = useQuery({ queryKey: ['countries'], queryFn: () => organizationService.getCountries() });
  const { data, isLoading } = useQuery({ queryKey: ['branches'], queryFn: () => organizationService.getBranches() });

  const createM = useMutation({
    mutationFn: (d: BranchForm) => organizationService.createBranch(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); setModalOpen(false); form.reset(); toast({ title: 'Branch created' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to create branch', variant: 'destructive' }),
  });
  const updateM = useMutation({
    mutationFn: (d: BranchForm) => organizationService.updateBranch(editItem!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); setModalOpen(false); setEditItem(null); form.reset(); toast({ title: 'Branch updated' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to update branch', variant: 'destructive' }),
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => organizationService.deleteBranch(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); setDeleteOpen(false); setDeleteItem(null); toast({ title: 'Branch deleted' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to delete branch', variant: 'destructive' }),
  });

  const openCreate = () => { setEditItem(null); form.reset(); setModalOpen(true); };
  const openEdit = (item: Branch) => { setEditItem(item); form.reset({ name: item.name, code: item.code, type: item.type, countryId: item.countryId, address: item.address ?? '', city: item.city ?? '', phone: item.phone ?? '', email: item.email ?? '' }); setModalOpen(true); };
  const openDelete = (item: Branch) => { setDeleteItem(item); setDeleteOpen(true); };
  const onSubmit = (d: BranchForm) => editItem ? updateM.mutate(d) : createM.mutate(d);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Branch },
    { header: 'Code', accessor: 'code' as keyof Branch },
    { header: 'Type', accessor: 'type' as keyof Branch },
    { header: 'Country', render: (r: Branch) => r.country?.name ?? '—' },
    { header: 'City', render: (r: Branch) => r.city ?? '—' },
    { header: 'Active', render: (r: Branch) => <span className={r.isActive ? 'text-green-400' : 'text-gray-500'}>{r.isActive ? 'Yes' : 'No'}</span> },
    { header: 'Actions', render: (r: Branch) => <div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => openDelete(r)}><Trash2 className="h-3 w-3" /></Button></div> },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4"><Button onClick={openCreate} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Add Branch</Button></div>
      <DataTable columns={columns} data={data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <FormModal open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditItem(null); } }} title={editItem ? 'Edit Branch' : 'New Branch'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Name</Label><Input {...form.register('name')} className="bg-[#111111] border-[#2A2A2A] text-white" />{form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">Code</Label><Input {...form.register('code')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Type</Label>
              <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v)}>
                <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">{BRANCH_TYPES.map((t) => <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>)}</SelectContent>
              </Select>
              {form.formState.errors.type && <p className="text-red-400 text-xs">{form.formState.errors.type.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Country</Label>
              <Select value={form.watch('countryId')} onValueChange={(v) => form.setValue('countryId', v)}>
                <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">{countries?.map((c) => <SelectItem key={c.id} value={c.id} className="text-white">{c.name}</SelectItem>)}</SelectContent>
              </Select>
              {form.formState.errors.countryId && <p className="text-red-400 text-xs">{form.formState.errors.countryId.message}</p>}
            </div>
          </div>
          <div className="space-y-1"><Label className="text-gray-300">Address</Label><Input {...form.register('address')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">City</Label><Input {...form.register('city')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
            <div className="space-y-1"><Label className="text-gray-300">Phone</Label><Input {...form.register('phone')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="space-y-1"><Label className="text-gray-300">Email</Label><Input type="email" {...form.register('email')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending || updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>
      <FormModal open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Branch">
        <div className="mt-2 space-y-4">
          <p className="text-gray-300">Are you sure you want to delete <span className="text-white font-semibold">{deleteItem?.name}</span>?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="button" disabled={deleteM.isPending} className="bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={() => deleteItem && deleteM.mutate(deleteItem.id)}>Delete</Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}

function WarehousesTab() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Warehouse | null>(null);
  const [deleteItem, setDeleteItem] = useState<Warehouse | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useForm<WarehouseForm>({ resolver: zodResolver(warehouseSchema) });

  const { data: branches } = useQuery({ queryKey: ['branches'], queryFn: () => organizationService.getBranches() });
  const { data, isLoading } = useQuery({ queryKey: ['warehouses'], queryFn: () => organizationService.getWarehouses() });

  const createM = useMutation({
    mutationFn: (d: WarehouseForm) => organizationService.createWarehouse(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['warehouses'] }); setModalOpen(false); form.reset(); toast({ title: 'Warehouse created' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to create warehouse', variant: 'destructive' }),
  });
  const updateM = useMutation({
    mutationFn: (d: WarehouseForm) => organizationService.updateWarehouse(editItem!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['warehouses'] }); setModalOpen(false); setEditItem(null); form.reset(); toast({ title: 'Warehouse updated' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to update warehouse', variant: 'destructive' }),
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => organizationService.deleteWarehouse(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['warehouses'] }); setDeleteOpen(false); setDeleteItem(null); toast({ title: 'Warehouse deleted' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to delete warehouse', variant: 'destructive' }),
  });

  const openCreate = () => { setEditItem(null); form.reset(); setModalOpen(true); };
  const openEdit = (item: Warehouse) => { setEditItem(item); form.reset({ name: item.name, code: item.code, branchId: item.branchId, address: item.address ?? '' }); setModalOpen(true); };
  const openDelete = (item: Warehouse) => { setDeleteItem(item); setDeleteOpen(true); };
  const onSubmit = (d: WarehouseForm) => editItem ? updateM.mutate(d) : createM.mutate(d);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Warehouse },
    { header: 'Code', accessor: 'code' as keyof Warehouse },
    { header: 'Branch', render: (r: Warehouse) => r.branch?.name ?? '—' },
    { header: 'Address', render: (r: Warehouse) => r.address ?? '—' },
    { header: 'Default', render: (r: Warehouse) => r.isDefault ? <span className="text-[#C9A84C]">Yes</span> : '—' },
    { header: 'Active', render: (r: Warehouse) => <span className={r.isActive ? 'text-green-400' : 'text-gray-500'}>{r.isActive ? 'Yes' : 'No'}</span> },
    { header: 'Actions', render: (r: Warehouse) => <div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => openDelete(r)}><Trash2 className="h-3 w-3" /></Button></div> },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4"><Button onClick={openCreate} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Add Warehouse</Button></div>
      <DataTable columns={columns} data={data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <FormModal open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditItem(null); } }} title={editItem ? 'Edit Warehouse' : 'New Warehouse'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Name</Label><Input {...form.register('name')} className="bg-[#111111] border-[#2A2A2A] text-white" />{form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">Code</Label><Input {...form.register('code')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Branch</Label>
            <Select value={form.watch('branchId')} onValueChange={(v) => form.setValue('branchId', v)}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue placeholder="Select branch" /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">{branches?.map((b) => <SelectItem key={b.id} value={b.id} className="text-white">{b.name}</SelectItem>)}</SelectContent>
            </Select>
            {form.formState.errors.branchId && <p className="text-red-400 text-xs">{form.formState.errors.branchId.message}</p>}
          </div>
          <div className="space-y-1"><Label className="text-gray-300">Address</Label><Input {...form.register('address')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending || updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>
      <FormModal open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Warehouse">
        <div className="mt-2 space-y-4">
          <p className="text-gray-300">Are you sure you want to delete <span className="text-white font-semibold">{deleteItem?.name}</span>?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="button" disabled={deleteM.isPending} className="bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={() => deleteItem && deleteM.mutate(deleteItem.id)}>Delete</Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}

function WorkshopsTab() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Workshop | null>(null);
  const [deleteItem, setDeleteItem] = useState<Workshop | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const form = useForm<WorkshopForm>({ resolver: zodResolver(workshopSchema) });

  const { data: branches } = useQuery({ queryKey: ['branches'], queryFn: () => organizationService.getBranches() });
  const { data, isLoading } = useQuery({ queryKey: ['workshops'], queryFn: () => organizationService.getWorkshops() });

  const createM = useMutation({
    mutationFn: (d: WorkshopForm) => organizationService.createWorkshop(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workshops'] }); setModalOpen(false); form.reset(); toast({ title: 'Workshop created' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to create workshop', variant: 'destructive' }),
  });
  const updateM = useMutation({
    mutationFn: (d: WorkshopForm) => organizationService.updateWorkshop(editItem!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workshops'] }); setModalOpen(false); setEditItem(null); form.reset(); toast({ title: 'Workshop updated' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to update workshop', variant: 'destructive' }),
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => organizationService.deleteWorkshop(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workshops'] }); setDeleteOpen(false); setDeleteItem(null); toast({ title: 'Workshop deleted' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to delete workshop', variant: 'destructive' }),
  });

  const openCreate = () => { setEditItem(null); form.reset(); setModalOpen(true); };
  const openEdit = (item: Workshop) => { setEditItem(item); form.reset({ name: item.name, code: item.code, branchId: item.branchId, address: item.address ?? '' }); setModalOpen(true); };
  const openDelete = (item: Workshop) => { setDeleteItem(item); setDeleteOpen(true); };
  const onSubmit = (d: WorkshopForm) => editItem ? updateM.mutate(d) : createM.mutate(d);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Workshop },
    { header: 'Code', accessor: 'code' as keyof Workshop },
    { header: 'Branch', render: (r: Workshop) => r.branch?.name ?? '—' },
    { header: 'Address', render: (r: Workshop) => r.address ?? '—' },
    { header: 'Capacity', render: (r: Workshop) => r.capacity ?? '—' },
    { header: 'Active', render: (r: Workshop) => <span className={r.isActive ? 'text-green-400' : 'text-gray-500'}>{r.isActive ? 'Yes' : 'No'}</span> },
    { header: 'Actions', render: (r: Workshop) => <div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => openDelete(r)}><Trash2 className="h-3 w-3" /></Button></div> },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4"><Button onClick={openCreate} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Add Workshop</Button></div>
      <DataTable columns={columns} data={data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <FormModal open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditItem(null); } }} title={editItem ? 'Edit Workshop' : 'New Workshop'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Name</Label><Input {...form.register('name')} className="bg-[#111111] border-[#2A2A2A] text-white" />{form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">Code</Label><Input {...form.register('code')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Branch</Label>
            <Select value={form.watch('branchId')} onValueChange={(v) => form.setValue('branchId', v)}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue placeholder="Select branch" /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">{branches?.map((b) => <SelectItem key={b.id} value={b.id} className="text-white">{b.name}</SelectItem>)}</SelectContent>
            </Select>
            {form.formState.errors.branchId && <p className="text-red-400 text-xs">{form.formState.errors.branchId.message}</p>}
          </div>
          <div className="space-y-1"><Label className="text-gray-300">Address</Label><Input {...form.register('address')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending || updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>
      <FormModal open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Workshop">
        <div className="mt-2 space-y-4">
          <p className="text-gray-300">Are you sure you want to delete <span className="text-white font-semibold">{deleteItem?.name}</span>?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="button" disabled={deleteM.isPending} className="bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={() => deleteItem && deleteM.mutate(deleteItem.id)}>Delete</Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}

export default function OrganizationPage() {
  return (
    <div>
      <PageHeader title="Organization" subtitle="Manage countries, branches, warehouses, and workshops" />
      <Tabs defaultValue="countries">
        <TabsList className="bg-[#1A1A1A] border border-[#2A2A2A] mb-4">
          <TabsTrigger value="countries" className="data-[state=active]:bg-[#C9A84C] data-[state=active]:text-black">Countries</TabsTrigger>
          <TabsTrigger value="branches" className="data-[state=active]:bg-[#C9A84C] data-[state=active]:text-black">Branches</TabsTrigger>
          <TabsTrigger value="warehouses" className="data-[state=active]:bg-[#C9A84C] data-[state=active]:text-black">Warehouses</TabsTrigger>
          <TabsTrigger value="workshops" className="data-[state=active]:bg-[#C9A84C] data-[state=active]:text-black">Workshops</TabsTrigger>
        </TabsList>
        <TabsContent value="countries"><CountriesTab /></TabsContent>
        <TabsContent value="branches"><BranchesTab /></TabsContent>
        <TabsContent value="warehouses"><WarehousesTab /></TabsContent>
        <TabsContent value="workshops"><WorkshopsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
