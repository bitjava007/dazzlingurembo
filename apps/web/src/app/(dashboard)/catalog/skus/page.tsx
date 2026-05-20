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
import { catalogService } from '@/services/catalog.service';
import { toast } from '@/hooks/use-toast';
import type { ProductSku } from '@/types';
import { Trash2 } from 'lucide-react';

const schema = z.object({
  sku: z.string().min(1, 'Required'),
  barcode: z.string().optional(),
  condition: z.string().min(1),
  isActive: z.boolean(),
});
type FormData = z.infer<typeof schema>;

const CONDITIONS = ['NEW', 'REFURBISHED', 'DAMAGED'];

export default function SkusPage() {
  const qc = useQueryClient();
  const [variantId, setVariantId] = useState('');
  const [variantInput, setVariantInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ProductSku | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { condition: 'NEW', isActive: true },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['skus', variantId],
    queryFn: () => catalogService.getSkus(variantId),
    enabled: !!variantId,
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => catalogService.createSku(variantId, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['skus', variantId] }); setModalOpen(false); reset({ condition: 'NEW', isActive: true }); toast({ title: 'SKU created' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to create SKU', variant: 'destructive' }),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => catalogService.deleteSku(variantId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['skus', variantId] }); setDeleteOpen(false); setDeleteItem(null); toast({ title: 'SKU deleted' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to delete SKU', variant: 'destructive' }),
  });

  const handleSearch = () => setVariantId(variantInput.trim());

  const columns = [
    { header: 'SKU', accessor: 'sku' as keyof ProductSku },
    { header: 'Barcode', render: (r: ProductSku) => r.barcode ?? '—' },
    { header: 'Condition', render: (r: ProductSku) => r.condition ?? 'NEW' },
    { header: 'Active', render: (r: ProductSku) => <span className={r.isActive ? 'text-green-400' : 'text-gray-500'}>{r.isActive ? 'Yes' : 'No'}</span> },
    { header: 'Created At', render: (r: ProductSku) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: 'Actions', render: (r: ProductSku) => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => { setDeleteItem(r); setDeleteOpen(true); }}>
          <Trash2 className="h-3 w-3" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="SKUs" subtitle="Manage product SKUs by variant" onAction={() => variantId ? setModalOpen(true) : toast({ title: 'Enter a Variant ID first' })} />

      <div className="mb-4 flex gap-2">
        <Input
          value={variantInput}
          onChange={(e) => setVariantInput(e.target.value)}
          placeholder="Enter Variant ID..."
          className="bg-[#111111] border-[#2A2A2A] text-white max-w-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Load SKUs</Button>
      </div>

      {!variantId ? (
        <div className="text-center py-12 text-gray-500">Enter a Variant ID above to view SKUs</div>
      ) : (
        <DataTable columns={columns} data={data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      )}

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New SKU">
        <form onSubmit={handleSubmit((d) => createM.mutate(d as FormData))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">SKU</Label>
            <Input {...register('sku')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.sku && <p className="text-red-400 text-xs">{errors.sku.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Barcode</Label>
            <Input {...register('barcode')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Condition</Label>
            <Select value={watch('condition')} onValueChange={(v) => setValue('condition', v)}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {CONDITIONS.map((c) => <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register('isActive')} className="rounded" defaultChecked />
            <Label htmlFor="isActive" className="text-gray-300">Active</Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Create</Button>
          </div>
        </form>
      </FormModal>

      <FormModal open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete SKU">
        <div className="mt-2 space-y-4">
          <p className="text-gray-300">Are you sure you want to delete SKU <span className="text-white font-semibold">{deleteItem?.sku}</span>?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="button" disabled={deleteM.isPending} className="bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={() => deleteItem && deleteM.mutate(deleteItem.id)}>Delete</Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
