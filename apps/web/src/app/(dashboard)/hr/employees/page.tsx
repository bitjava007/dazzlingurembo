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
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { hrService } from '@/services/hr.service';
import { toast } from '@/hooks/use-toast';
import { Pencil } from 'lucide-react';
import type { Employee } from '@/types';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  employeeCode: z.string().min(1, 'Required'),
  departmentId: z.string().min(1, 'Required'),
  branchId: z.string().min(1, 'Required'),
  jobTitle: z.string().min(1, 'Required'),
  hireDate: z.string().min(1, 'Required'),
  salary: z.string().min(1, 'Required'),
  currencyCode: z.enum(['XOF', 'USD', 'EUR']),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
});
type FormData = z.infer<typeof schema>;

export default function EmployeesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currencyCode: 'XOF', employmentType: 'FULL_TIME' },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search, page],
    queryFn: () => hrService.getEmployees({ search, page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => hrService.createEmployee({
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone || undefined,
      employeeCode: d.employeeCode,
      departmentId: d.departmentId,
      branchId: d.branchId,
      jobTitle: d.jobTitle,
      hireDate: d.hireDate,
      salary: parseFloat(d.salary),
      currencyCode: d.currencyCode,
      employmentType: d.employmentType,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); setModalOpen(false); reset(); toast({ title: 'Employee created' }); },
  });

  const updateM = useMutation({
    mutationFn: (d: FormData) => hrService.updateEmployee(editItem!.id, {
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone || undefined,
      jobTitle: d.jobTitle,
      salary: parseFloat(d.salary),
      currencyCode: d.currencyCode,
      employmentType: d.employmentType,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); setModalOpen(false); setEditItem(null); reset(); toast({ title: 'Employee updated' }); },
  });

  const openCreate = () => {
    setEditItem(null);
    reset({ currencyCode: 'XOF', employmentType: 'FULL_TIME' });
    setModalOpen(true);
  };
  const openEdit = (item: Employee) => {
    setEditItem(item);
    reset({
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email ?? '',
      phone: item.phone ?? '',
      employeeCode: item.employeeNumber,
      departmentId: item.departmentId ?? '',
      branchId: item.branchId ?? '',
      jobTitle: item.jobTitle ?? '',
      hireDate: item.hireDate?.slice(0, 10) ?? '',
      salary: String(item.baseSalary ?? ''),
      currencyCode: (item.currencyCode ?? 'XOF') as 'XOF' | 'USD' | 'EUR',
      employmentType: (item.employmentType ?? 'FULL_TIME') as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT',
    });
    setModalOpen(true);
  };
  const onSubmit = (d: FormData) => editItem ? updateM.mutate(d) : createM.mutate(d);

  const columns = [
    { header: 'Emp #', accessor: 'employeeNumber' as keyof Employee },
    { header: 'Name', render: (r: Employee) => `${r.firstName} ${r.lastName}` },
    { header: 'Email', render: (r: Employee) => r.email ?? '—' },
    { header: 'Job Title', render: (r: Employee) => r.jobTitle ?? '—' },
    { header: 'Department', render: (r: Employee) => r.department?.name ?? '—' },
    { header: 'Status', render: (r: Employee) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      header: 'Actions', render: (r: Employee) => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Employees" subtitle="Human resources management" onAction={openCreate} />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search employees..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editItem ? 'Edit Employee' : 'New Employee'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">First Name</Label><Input {...register('firstName')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.firstName && <p className="text-red-400 text-xs">{errors.firstName.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">Last Name</Label><Input {...register('lastName')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="space-y-1"><Label className="text-gray-300">Email</Label><Input type="email" {...register('email')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Employee Code</Label><Input {...register('employeeCode')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="EMP-001" />{errors.employeeCode && <p className="text-red-400 text-xs">{errors.employeeCode.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">Job Title</Label><Input {...register('jobTitle')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.jobTitle && <p className="text-red-400 text-xs">{errors.jobTitle.message}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Department ID</Label><Input {...register('departmentId')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.departmentId && <p className="text-red-400 text-xs">{errors.departmentId.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">Branch ID</Label><Input {...register('branchId')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.branchId && <p className="text-red-400 text-xs">{errors.branchId.message}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Hire Date</Label><Input type="date" {...register('hireDate')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.hireDate && <p className="text-red-400 text-xs">{errors.hireDate.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">Phone</Label><Input {...register('phone')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">Salary</Label><Input type="number" step="0.01" {...register('salary')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.salary && <p className="text-red-400 text-xs">{errors.salary.message}</p>}</div>
            <div className="space-y-1">
              <Label className="text-gray-300">Currency</Label>
              <select {...register('currencyCode')} className="w-full h-10 rounded-md border border-[#2A2A2A] bg-[#111111] text-white px-3 text-sm">
                <option value="XOF">XOF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Employment Type</Label>
              <select {...register('employmentType')} className="w-full h-10 rounded-md border border-[#2A2A2A] bg-[#111111] text-white px-3 text-sm">
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending || updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
