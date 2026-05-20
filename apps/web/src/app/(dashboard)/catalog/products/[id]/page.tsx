'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { catalogService } from '@/services/catalog.service';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2 } from 'lucide-react';
import type { Variant, ProductMedia } from '@/types';

type Tab = 'variants' | 'media';

interface VariantFormData {
  name: string;
  sku: string;
  price: number;
  costPrice: number;
}

interface MediaFormData {
  url: string;
  altText: string;
  mediaType: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('variants');
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);
  const [deleteMediaId, setDeleteMediaId] = useState<string | null>(null);

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => catalogService.getProduct(id),
    enabled: !!id,
  });

  const { data: variants = [], isLoading: loadingVariants } = useQuery({
    queryKey: ['variants', id],
    queryFn: () => catalogService.getVariants(id),
    enabled: !!id && activeTab === 'variants',
  });

  const { data: media = [], isLoading: loadingMedia } = useQuery({
    queryKey: ['media', id],
    queryFn: () => catalogService.getMedia(id),
    enabled: !!id && activeTab === 'media',
  });

  const variantForm = useForm<VariantFormData>({ defaultValues: { name: '', sku: '', price: 0, costPrice: 0 } });
  const mediaForm = useForm<MediaFormData>({ defaultValues: { url: '', altText: '', mediaType: 'IMAGE' } });

  const createVariantMutation = useMutation({
    mutationFn: (d: VariantFormData) => catalogService.createVariant(id, { ...d, price: Number(d.price), costPrice: Number(d.costPrice) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['variants', id] }); variantForm.reset({ name: '', sku: '', price: 0, costPrice: 0 }); toast({ title: 'Variant created' }); },
    onError: () => toast({ title: 'Error creating variant', variant: 'destructive' }),
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: string) => catalogService.deleteVariant(variantId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['variants', id] }); setDeleteVariantId(null); toast({ title: 'Variant deleted' }); },
    onError: () => toast({ title: 'Error deleting variant', variant: 'destructive' }),
  });

  const createMediaMutation = useMutation({
    mutationFn: (d: MediaFormData) => catalogService.createMedia(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media', id] }); mediaForm.reset({ url: '', altText: '', mediaType: 'IMAGE' }); toast({ title: 'Media added' }); },
    onError: () => toast({ title: 'Error adding media', variant: 'destructive' }),
  });

  const deleteMediaMutation = useMutation({
    mutationFn: (mediaId: string) => catalogService.deleteMedia(mediaId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media', id] }); setDeleteMediaId(null); toast({ title: 'Media deleted' }); },
    onError: () => toast({ title: 'Error deleting media', variant: 'destructive' }),
  });

  if (loadingProduct) {
    return <div className="text-gray-400 p-6">Loading...</div>;
  }

  if (!product) {
    return <div className="text-gray-400 p-6">Product not found.</div>;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'variants', label: 'Variants' },
    { key: 'media', label: 'Media' },
  ];

  const variantColumns = [
    { header: 'Name', accessor: 'name' as keyof Variant },
    { header: 'SKU', accessor: 'sku' as keyof Variant },
    { header: 'Price', render: (r: Variant) => r.price?.toFixed(2) ?? '—' },
    { header: 'Cost', render: (r: Variant) => r.costPrice?.toFixed(2) ?? '—' },
    { header: 'Status', render: (r: Variant) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: (r: Variant) => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => setDeleteVariantId(r.id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      ),
    },
  ];

  const mediaColumns = [
    { header: 'URL', render: (r: ProductMedia) => <a href={r.url} target="_blank" rel="noreferrer" className="text-[#C9A84C] hover:underline text-xs truncate max-w-[200px] block">{r.url}</a> },
    { header: 'Alt Text', render: (r: ProductMedia) => r.altText ?? '—' },
    { header: 'Type', accessor: 'mediaType' as keyof ProductMedia },
    { header: 'Primary', render: (r: ProductMedia) => r.isPrimary ? <span className="text-green-400 text-xs font-semibold">Yes</span> : <span className="text-gray-500 text-xs">No</span> },
    {
      header: 'Actions',
      render: (r: ProductMedia) => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => setDeleteMediaId(r.id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{product.name}</h1>
            {product.description && <p className="text-gray-400 mt-1 text-sm">{product.description}</p>}
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={product.status} />
              {product.category && (
                <span className="text-xs text-gray-400 bg-[#2A2A2A] px-2 py-0.5 rounded">{product.category.name}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#2A2A2A] flex gap-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Variants Tab */}
      {activeTab === 'variants' && (
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Add Variant</h3>
            <form onSubmit={variantForm.handleSubmit((d) => createVariantMutation.mutate(d))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-gray-300">Name</Label>
                  <Input {...variantForm.register('name', { required: true })} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="e.g. Red / L" />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-300">SKU</Label>
                  <Input {...variantForm.register('sku', { required: true })} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="e.g. PROD-RED-L" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-gray-300">Price</Label>
                  <Input type="number" step="0.01" {...variantForm.register('price')} className="bg-[#111111] border-[#2A2A2A] text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-300">Cost Price</Label>
                  <Input type="number" step="0.01" {...variantForm.register('costPrice')} className="bg-[#111111] border-[#2A2A2A] text-white" />
                </div>
              </div>
              <Button type="submit" disabled={createVariantMutation.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">
                Add Variant
              </Button>
            </form>
          </div>

          <DataTable
            columns={variantColumns}
            data={variants as Variant[]}
            loading={loadingVariants}
            keyExtractor={(r) => r.id}
          />

          <ConfirmDialog
            open={!!deleteVariantId}
            onOpenChange={(o) => { if (!o) setDeleteVariantId(null); }}
            title="Delete Variant"
            description="This will permanently delete this variant."
            onConfirm={() => deleteVariantId && deleteVariantMutation.mutate(deleteVariantId)}
            loading={deleteVariantMutation.isPending}
          />
        </div>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Add Media</h3>
            <form onSubmit={mediaForm.handleSubmit((d) => createMediaMutation.mutate(d))} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-gray-300">URL</Label>
                <Input {...mediaForm.register('url', { required: true })} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-gray-300">Alt Text</Label>
                  <Input {...mediaForm.register('altText')} className="bg-[#111111] border-[#2A2A2A] text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-300">Type</Label>
                  <select
                    {...mediaForm.register('mediaType')}
                    className="w-full bg-[#111111] border border-[#2A2A2A] text-white rounded-md p-2 text-sm focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO">VIDEO</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={createMediaMutation.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">
                Add Media
              </Button>
            </form>
          </div>

          <DataTable
            columns={mediaColumns}
            data={media as ProductMedia[]}
            loading={loadingMedia}
            keyExtractor={(r) => r.id}
          />

          <ConfirmDialog
            open={!!deleteMediaId}
            onOpenChange={(o) => { if (!o) setDeleteMediaId(null); }}
            title="Delete Media"
            description="This will permanently delete this media."
            onConfirm={() => deleteMediaId && deleteMediaMutation.mutate(deleteMediaId)}
            loading={deleteMediaMutation.isPending}
          />
        </div>
      )}
    </div>
  );
}
