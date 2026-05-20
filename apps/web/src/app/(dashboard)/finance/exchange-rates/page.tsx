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
import { financeService } from '@/services/finance.service';
import { toast } from '@/hooks/use-toast';
import type { ExchangeRate } from '@/types';

const schema = z.object({
  fromCurrencyCode: z.string().min(1, 'Required'),
  toCurrencyCode: z.string().min(1, 'Required'),
  rate: z.string().min(1, 'Required'),
  effectiveFrom: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ExchangeRatesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({
    queryKey: ['exchange-rates', page],
    queryFn: () => financeService.getExchangeRates({ page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => financeService.createExchangeRate({ ...d, rate: parseFloat(d.rate) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exchange-rates'] }); setModalOpen(false); reset(); toast({ title: 'Rate created' }); },
  });

  const columns = [
    { header: 'From', render: (r: ExchangeRate) => r.fromCurrencyCode },
    { header: 'To', render: (r: ExchangeRate) => r.toCurrencyCode },
    { header: 'Rate', render: (r: ExchangeRate) => r.rate.toFixed(4) },
    { header: 'Effective From', render: (r: ExchangeRate) => r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : '—' },
    { header: 'Active', render: (r: ExchangeRate) => <span className={r.isActive ? 'text-green-400' : 'text-gray-500'}>{r.isActive ? 'Yes' : 'No'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Exchange Rates" subtitle="Currency exchange rates" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New Exchange Rate">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-gray-300">From Currency</Label><Input {...register('fromCurrencyCode')} placeholder="USD" className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.fromCurrencyCode && <p className="text-red-400 text-xs">{errors.fromCurrencyCode.message}</p>}</div>
            <div className="space-y-1"><Label className="text-gray-300">To Currency</Label><Input {...register('toCurrencyCode')} placeholder="EUR" className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.toCurrencyCode && <p className="text-red-400 text-xs">{errors.toCurrencyCode.message}</p>}</div>
          </div>
          <div className="space-y-1"><Label className="text-gray-300">Rate</Label><Input type="number" step="0.0001" {...register('rate')} className="bg-[#111111] border-[#2A2A2A] text-white" />{errors.rate && <p className="text-red-400 text-xs">{errors.rate.message}</p>}</div>
          <div className="space-y-1"><Label className="text-gray-300">Effective From (optional)</Label><Input type="date" {...register('effectiveFrom')} className="bg-[#111111] border-[#2A2A2A] text-white" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Create</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
