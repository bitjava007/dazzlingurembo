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
import type { ProductMedia } from '@/types';
import { Trash2 } from 'lucide-react';

const schema = z.object({
  type: z.string().min(1),
  url: z.string().min(1, 'Required'),
  altText: z.string().optional(),
  title: z.string().optional(),
  isPrimary: z.boolean(),
  position: z.string(),
});
type FormData = z.infer<typeof schema>;

const MEDIA_TYPES = ['IMAGE', 'VIDEO', 'DOCUMENT'];

export default function MediaPage() {
  const qc = useQueryClient();
  const [productId, setProductId] = useState('');
  const [productInput, setProductInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ProductMedia | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { type: 'IMAGE', isPrimary: false, position: '0' },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['media', productId],
    queryFn: () => catalogService.getMedia(productId),
    enabled: !!productId,
  });

  const createM = useMutation({
    mutationFn: (d: FormData) => catalogService.createMedia(productId, { ...d, position: parseInt(d.position || '0', 10) } as object),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media', productId] }); setModalOpen(false); reset({ type: 'IMAGE', isPrimary: false, position: '0' }); toast({ title: 'Media added' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to add media', variant: 'destructive' }),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => catalogService.deleteMedia(productId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media', productId] }); setDeleteOpen(false); setDeleteItem(null); toast({ title: 'Media deleted' }); },
    onError: () => toast({ title: 'Error', description: 'Failed to delete media', variant: 'destructive' }),
  });

  const handleSearch = () => setProductId(productInput.trim());

  const columns = [
    { header: 'Type', render: (r: ProductMedia) => r.mediaType },
    { header: 'URL', render: (r: ProductMedia) => <span className="text-gray-400 text-xs truncate max-w-xs block" title={r.url}>{r.url.length > 50 ? r.url.slice(0, 50) + '…' : r.url}</span> },
    { header: 'Alt Text', render: (r: ProductMedia) => r.altText ?? '—' },
    { header: 'Primary', render: (r: ProductMedia) => r.isPrimary ? <span className="text-[#C9A84C]">Yes</span> : '—' },
    { header: 'Position', render: (r: ProductMedia) => r.sortOrder },
    {
      header: 'Actions', render: (r: ProductMedia) => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => { setDeleteItem(r); setDeleteOpen(true); }}>
          <Trash2 className="h-3 w-3" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Product Media" subtitle="Manage media assets for products" onAction={() => productId ? setModalOpen(true) : toast({ title: 'Enter a Product ID first' })} />

      <div className="mb-4 flex gap-2">
        <Input
          value={productInput}
          onChange={(e) => setProductInput(e.target.value)}
          placeholder="Enter Product ID..."
          className="bg-[#111111] border-[#2A2A2A] text-white max-w-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Load Media</Button>
      </div>

      {!productId ? (
        <div className="text-center py-12 text-gray-500">Enter a Product ID above to view media</div>
      ) : (
        <DataTable columns={columns} data={data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      )}

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Add Media">
        <form onSubmit={handleSubmit((d) => createM.mutate(d as FormData))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-gray-300">Type</Label>
            <Select value={watch('type')} onValueChange={(v) => setValue('type', v)}>
              <SelectTrigger className="bg-[#111111] border-[#2A2A2A] text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {MEDIA_TYPES.map((t) => <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">URL</Label>
            <Input {...register('url')} placeholder="https://..." className="bg-[#111111] border-[#2A2A2A] text-white" />
            {errors.url && <p className="text-red-400 text-xs">{errors.url.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Alt Text</Label>
              <Input {...register('altText')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Title</Label>
              <Input {...register('title')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Position</Label>
              <Input type="number" {...register('position')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="isPrimary" {...register('isPrimary')} className="rounded" />
              <Label htmlFor="isPrimary" className="text-gray-300">Primary</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Add</Button>
          </div>
        </form>
      </FormModal>

      <FormModal open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Media">
        <div className="mt-2 space-y-4">
          <p className="text-gray-300">Are you sure you want to delete this media item?</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="button" disabled={deleteM.isPending} className="bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={() => deleteItem && deleteM.mutate(deleteItem.id)}>Delete</Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
