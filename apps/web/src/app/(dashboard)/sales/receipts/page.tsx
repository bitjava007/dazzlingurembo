'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormModal } from '@/components/ui/form-modal';
import { salesService } from '@/services/sales.service';
import { toast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';
import type { Receipt } from '@/types';
import { useForm } from 'react-hook-form';

interface GenerateFormData {
  paymentId: string;
}

export default function ReceiptsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['receipts', page],
    queryFn: () => salesService.getReceipts({ page, limit: 20 }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GenerateFormData>({ defaultValues: { paymentId: '' } });

  const generateMutation = useMutation({
    mutationFn: (d: GenerateFormData) => salesService.generateReceipt(d.paymentId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['receipts'] }); setModalOpen(false); reset(); toast({ title: 'Receipt generated' }); },
    onError: () => toast({ title: 'Error generating receipt', variant: 'destructive' }),
  });

  const columns = [
    { header: 'Receipt #', accessor: 'receiptNumber' as keyof Receipt },
    { header: 'Payment ID', render: (r: Receipt) => r.paymentId },
    { header: 'Branch', render: (r: Receipt) => r.branch?.name ?? '—' },
    { header: 'Issued At', render: (r: Receipt) => new Date(r.issuedAt).toLocaleString() },
    { header: 'Created', render: (r: Receipt) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader
        title="Receipts"
        subtitle="Payment receipts"
        onAction={() => setModalOpen(true)}
      />

      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Generate Receipt">
        <form onSubmit={handleSubmit((d) => generateMutation.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Payment ID</Label>
            <Input
              {...register('paymentId', { required: 'Payment ID is required' })}
              className="bg-[#111111] border-[#2A2A2A] text-white"
              placeholder="Enter payment ID"
            />
            {errors.paymentId && <p className="text-red-400 text-xs">{errors.paymentId.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]">Cancel</Button>
            <Button type="submit" disabled={generateMutation.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">
              <FileText className="h-4 w-4 mr-1" />
              Generate
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
