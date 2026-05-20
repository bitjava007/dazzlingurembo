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
import { procurementService } from '@/services/procurement.service';
import { toast } from '@/hooks/use-toast';
import type { SupplierInvoice } from '@/types';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  supplierId: z.string().min(1, 'Required'),
  branchId: z.string().min(1, 'Required'),
  invoiceNumber: z.string().min(1, 'Required'),
  invoiceDate: z.string().min(1, 'Required'),
  originalAmount: z.string().min(1, 'Required'),
  originalCurrencyCode: z.string().min(1, 'Required'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function SupplierInvoicesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['supplier-invoices', page],
    queryFn: () => procurementService.getSupplierInvoices({ page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => procurementService.createSupplierInvoice({
      ...d,
      originalAmount: parseFloat(d.originalAmount),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['supplier-invoices'] }); setModalOpen(false); reset(); toast({ title: 'Invoice created' }); },
  });

  const markPaidM = useMutation({
    mutationFn: (id: string) => procurementService.markSupplierInvoicePaid(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['supplier-invoices'] }); toast({ title: 'Invoice marked as paid' }); },
  });

  const columns = [
    { header: 'Invoice #', accessor: 'number' as keyof SupplierInvoice },
    { header: 'Supplier', render: (r: SupplierInvoice) => r.supplier?.name ?? '—' },
    { header: 'Status', render: (r: SupplierInvoice) => <StatusBadge status={r.status} /> },
    { header: 'Total', render: (r: SupplierInvoice) => `$${r.totalAmount.toFixed(2)}` },
    { header: 'Paid', render: (r: SupplierInvoice) => `$${r.paidAmount.toFixed(2)}` },
    { header: 'Due Date', render: (r: SupplierInvoice) => new Date(r.dueDate).toLocaleDateString() },
    {
      header: 'Actions', render: (r: SupplierInvoice) => r.status === 'PENDING' || r.status === 'APPROVED' ? (
        <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300" onClick={() => markPaidM.mutate(r.id)}>
          <CheckCircle className="h-3 w-3 mr-1" />Mark Paid
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Supplier Invoices" subtitle="Invoices from suppliers" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Supplier Invoice">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Supplier ID</Label>
              <Input {...register('supplierId')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.supplierId && <p className="text-red-400 text-xs">{errors.supplierId.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Branch ID</Label>
              <Input {...register('branchId')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.branchId && <p className="text-red-400 text-xs">{errors.branchId.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Invoice Number</Label>
            <Input {...register('invoiceNumber')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.invoiceNumber && <p className="text-red-400 text-xs">{errors.invoiceNumber.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Invoice Date</Label>
              <Input type="date" {...register('invoiceDate')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Due Date</Label>
              <Input type="date" {...register('dueDate')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Amount</Label>
              <Input type="number" step="0.01" {...register('originalAmount')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.originalAmount && <p className="text-red-400 text-xs">{errors.originalAmount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Currency Code</Label>
              <Input {...register('originalCurrencyCode')} placeholder="USD" className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.originalCurrencyCode && <p className="text-red-400 text-xs">{errors.originalCurrencyCode.message}</p>}
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
