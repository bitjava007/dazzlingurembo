'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fashionService } from '@/services/fashion.service';
import { toast } from '@/hooks/use-toast';
import type { BOM } from '@/types';

interface CreateBOMForm {
  productId: string;
  name: string;
  version: string;
  notes: string;
}

interface ExplodeResult {
  bomId: string;
  productQuantity: number;
  materials: Array<{
    materialVariantId: string;
    materialVariant?: { id: string; name: string; sku?: string };
    unit: string;
    materialType: string;
    requiredQuantity: number;
    withWastage: number;
  }>;
}

export default function BOMPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [explodeOpen, setExplodeOpen] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [explodeQty, setExplodeQty] = useState('1');
  const [explodeResult, setExplodeResult] = useState<ExplodeResult | null>(null);
  const { register, handleSubmit, reset } = useForm<CreateBOMForm>({ defaultValues: { version: '1.0' } });

  const { data, isLoading } = useQuery({
    queryKey: ['boms', page],
    queryFn: () => fashionService.getBOMs({ page, limit: 20 }),
  });

  const createM = useMutation({
    mutationFn: (d: CreateBOMForm) => fashionService.createBOM(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['boms'] }); setModalOpen(false); reset(); toast({ title: 'BOM created' }); },
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => fashionService.deleteBOM(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['boms'] }); toast({ title: 'BOM deleted' }); },
  });

  const handleExplode = async (bom: BOM) => {
    setSelectedBOM(bom);
    setExplodeResult(null);
    setExplodeOpen(true);
  };

  const runExplode = async () => {
    if (!selectedBOM) return;
    try {
      const res = await fashionService.explodeBOM(selectedBOM.id, Number(explodeQty) || 1);
      setExplodeResult(res.data);
    } catch {
      toast({ title: 'Error exploding BOM', variant: 'destructive' });
    }
  };

  const columns = [
    { header: 'Product', render: (r: BOM) => r.product?.name ?? r.productId },
    { header: 'BOM Name', accessor: 'name' as keyof BOM },
    { header: 'Version', accessor: 'version' as keyof BOM },
    { header: 'Items', render: (r: BOM) => r.items?.length ?? 0 },
    { header: 'Active', render: (r: BOM) => r.isActive ? 'Yes' : 'No' },
    {
      header: 'Actions',
      render: (r: BOM) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-blue-400 hover:text-blue-300" onClick={() => handleExplode(r)}>Explode</Button>
          <Button variant="ghost" size="sm" className="h-7 text-red-400 hover:text-red-300" onClick={() => { if (confirm('Delete BOM?')) deleteM.mutate(r.id); }}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Bill of Materials" subtitle="Manage product BOMs" onAction={() => setModalOpen(true)} />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="New BOM">
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Product ID</Label>
            <Input {...register('productId', { required: true })} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">BOM Name</Label>
            <Input {...register('name', { required: true })} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Version</Label>
            <Input {...register('version')} className="bg-[#111111] border-[#2A2A2A] text-white" />
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

      <FormModal open={explodeOpen} onOpenChange={setExplodeOpen} title={`Explode BOM: ${selectedBOM?.name ?? ''}`}>
        <div className="space-y-4 mt-2">
          <div className="flex gap-2 items-end">
            <div className="space-y-1 flex-1">
              <Label className="text-gray-300">Quantity</Label>
              <Input type="number" min="1" value={explodeQty} onChange={(e) => setExplodeQty(e.target.value)} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
            <Button onClick={runExplode} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Calculate</Button>
          </div>
          {explodeResult && (
            <div className="space-y-2">
              <p className="text-gray-300 text-sm font-medium">Material Requirements for {explodeResult.productQuantity} units:</p>
              <div className="overflow-auto max-h-64">
                <table className="w-full text-sm text-gray-300">
                  <thead><tr className="border-b border-[#2A2A2A]"><th className="text-left py-1">Material</th><th className="text-right py-1">Required</th><th className="text-right py-1">With Wastage</th><th className="text-left py-1 pl-2">Unit</th></tr></thead>
                  <tbody>
                    {explodeResult.materials.map((m, i) => (
                      <tr key={i} className="border-b border-[#1A1A1A]">
                        <td className="py-1">{m.materialVariant?.name ?? m.materialVariantId}</td>
                        <td className="text-right py-1">{m.requiredQuantity.toFixed(3)}</td>
                        <td className="text-right py-1">{m.withWastage.toFixed(3)}</td>
                        <td className="py-1 pl-2">{m.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
}
