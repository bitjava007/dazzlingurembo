'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { procurementService } from '@/services/procurement.service';
import { toast } from '@/hooks/use-toast';
import type { SupplierPayment } from '@/types';

const schema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  supplierInvoiceId: z.string().optional(),
  amount: z.string().min(1, 'Amount is required'),
  currencyCode: z.enum(['XOF', 'USD']),
  paymentMethod: z.enum(['CASH', 'WAVE', 'ORANGE_MONEY', 'BANK_TRANSFER']),
  paymentDate: z.string().min(1, 'Payment date is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function SupplierPaymentsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['supplier-payments', page],
    queryFn: () => procurementService.getSupplierPayments({ page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => procurementService.createSupplierPayment({
      supplierId: d.supplierId,
      supplierInvoiceId: d.supplierInvoiceId || undefined,
      amount: parseFloat(d.amount),
      currencyCode: d.currencyCode,
      paymentMethod: d.paymentMethod,
      paymentDate: d.paymentDate,
      reference: d.reference || undefined,
      notes: d.notes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-payments'] });
      setModalOpen(false);
      reset();
      toast({ title: 'Supplier payment recorded' });
    },
  });

  const columns = [
    { header: 'Supplier ID', render: (r: SupplierPayment) => r.supplierId ?? '—' },
    { header: 'Amount', render: (r: SupplierPayment) => r.amount?.toFixed(2) ?? '—' },
    { header: 'Currency', accessor: 'currencyCode' as keyof SupplierPayment },
    { header: 'Method', accessor: 'paymentMethod' as keyof SupplierPayment },
    { header: 'Date', render: (r: SupplierPayment) => new Date(r.paymentDate).toLocaleDateString() },
    { header: 'Reference', render: (r: SupplierPayment) => r.reference ?? '—' },
    { header: 'Created At', render: (r: SupplierPayment) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Supplier Payments" subtitle="Manage payments to suppliers" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Supplier Payment">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Supplier ID</Label>
            <Input {...register('supplierId')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Enter supplier ID" />
            {errors.supplierId && <p className="text-red-400 text-xs">{errors.supplierId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Supplier Invoice ID (optional)</Label>
            <Input {...register('supplierInvoiceId')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Enter invoice ID" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Amount</Label>
              <Input type="number" step="0.01" {...register('amount')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.amount && <p className="text-red-400 text-xs">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Currency</Label>
              <select {...register('currencyCode')} className="w-full h-10 rounded-md border border-[#2A2A2A] bg-[#111111] text-white px-3">
                <option value="XOF">XOF</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Payment Method</Label>
              <select {...register('paymentMethod')} className="w-full h-10 rounded-md border border-[#2A2A2A] bg-[#111111] text-white px-3">
                <option value="CASH">Cash</option>
                <option value="WAVE">Wave</option>
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Payment Date</Label>
              <Input type="date" {...register('paymentDate')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.paymentDate && <p className="text-red-400 text-xs">{errors.paymentDate.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Reference (optional)</Label>
            <Input {...register('reference')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Payment reference" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Notes (optional)</Label>
            <Input {...register('notes')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Record Payment</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
