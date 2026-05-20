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
import { salesService } from '@/services/sales.service';
import { toast } from '@/hooks/use-toast';
import type { Receipt } from '@/types';

const schema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
});
type FormData = z.infer<typeof schema>;

export default function ReceiptsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['receipts', page],
    queryFn: () => salesService.getReceipts({ page, limit: 20 }),
  });

  const generateM = useMutation({
    mutationFn: (d: FormData) => salesService.generateReceipt(d.paymentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receipts'] });
      setModalOpen(false);
      reset();
      toast({ title: 'Receipt generated' });
    },
  });

  const columns = [
    { header: 'Receipt Number', render: (r: Receipt) => r.receiptNumber ?? '—' },
    { header: 'Payment ID', render: (r: Receipt) => r.paymentId ?? '—' },
    { header: 'Issued At', render: (r: Receipt) => r.issuedAt ? new Date(r.issuedAt).toLocaleDateString() : '—' },
    { header: 'Created At', render: (r: Receipt) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Receipts" subtitle="Sales receipt management" actionLabel="Generate Receipt" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Generate Receipt">
        <form onSubmit={handleSubmit((d) => generateM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Payment ID</Label>
            <Input {...register('paymentId')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Enter payment ID" />
            {errors.paymentId && <p className="text-red-400 text-xs">{errors.paymentId.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={generateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Generate</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
