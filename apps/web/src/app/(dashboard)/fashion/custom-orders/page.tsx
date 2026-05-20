'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fashionService } from '@/services/fashion.service';
import { toast } from '@/hooks/use-toast';
import type { CustomOrder } from '@/types';

const STATUSES = [
  'PENDING',
  'MEASUREMENT',
  'FABRIC_SELECTION',
  'PRODUCTION',
  'FITTING',
  'COMPLETED',
  'DELIVERED',
  'CANCELLED',
];

interface CreateOrderForm {
  customerId: string;
  branchId: string;
  title: string;
  description: string;
  requiredByDate: string;
  bust: string;
  waist: string;
  hips: string;
  length: string;
  shoulders: string;
  sleeves: string;
  inseam: string;
  neck: string;
  measurementNotes: string;
  stylePreferences: string;
  colorPreferences: string;
  fabricPreferences: string;
  estimatedPrice: string;
  depositAmount: string;
  currencyCode: string;
}

export default function CustomOrdersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<CreateOrderForm>({
    defaultValues: { currencyCode: 'XOF' },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['custom-orders', page, statusFilter],
    queryFn: () =>
      fashionService.getCustomOrders({
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
      }),
  });

  const createM = useMutation({
    mutationFn: (d: CreateOrderForm) =>
      fashionService.createCustomOrder({
        ...d,
        bust: d.bust ? parseFloat(d.bust) : undefined,
        waist: d.waist ? parseFloat(d.waist) : undefined,
        hips: d.hips ? parseFloat(d.hips) : undefined,
        length: d.length ? parseFloat(d.length) : undefined,
        shoulders: d.shoulders ? parseFloat(d.shoulders) : undefined,
        sleeves: d.sleeves ? parseFloat(d.sleeves) : undefined,
        inseam: d.inseam ? parseFloat(d.inseam) : undefined,
        neck: d.neck ? parseFloat(d.neck) : undefined,
        estimatedPrice: d.estimatedPrice ? parseFloat(d.estimatedPrice) : undefined,
        depositAmount: d.depositAmount ? parseFloat(d.depositAmount) : undefined,
        requiredByDate: d.requiredByDate || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-orders'] });
      setCreateOpen(false);
      reset();
      toast({ title: 'Custom order created' });
    },
    onError: () => toast({ title: 'Failed to create order', variant: 'destructive' }),
  });

  const statusM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fashionService.updateCustomOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['custom-orders'] });
      toast({ title: 'Status updated' });
    },
  });

  const getNextStatus = (current: string) => {
    const idx = STATUSES.indexOf(current);
    if (idx === -1 || idx >= STATUSES.length - 2) return null;
    return STATUSES[idx + 1];
  };

  const columns = [
    { header: 'Order #', accessor: 'orderNumber' as keyof CustomOrder },
    {
      header: 'Customer',
      render: (r: CustomOrder) => {
        const c = r.customer as { firstName?: string; lastName?: string } | undefined;
        return c ? `${c.firstName} ${c.lastName}` : r.customerId;
      },
    },
    { header: 'Title', accessor: 'title' as keyof CustomOrder },
    {
      header: 'Status',
      render: (r: CustomOrder) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Required By',
      render: (r: CustomOrder) =>
        r.requiredByDate ? new Date(r.requiredByDate).toLocaleDateString() : '—',
    },
    {
      header: 'Est. Price',
      render: (r: CustomOrder) =>
        r.estimatedPrice
          ? `${Number(r.estimatedPrice).toLocaleString()} ${r.currencyCode}`
          : '—',
    },
    {
      header: 'Actions',
      render: (r: CustomOrder) => {
        const next = getNextStatus(r.status);
        return next ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[#C9A84C]"
            onClick={() => statusM.mutate({ id: r.id, status: next })}
          >
            {next.replace('_', ' ')}
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Custom Orders"
        subtitle="Bespoke customer orders with measurements"
        onAction={() => setCreateOpen(true)}
      />

      <div className="mb-4 flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-[#111111] border border-[#2A2A2A] text-white rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        keyExtractor={(r) => r.id}
      />
      <Pagination
        page={page}
        totalPages={data?.meta?.totalPages ?? 1}
        onPageChange={setPage}
      />

      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Custom Order"
      >
        <form onSubmit={handleSubmit((d) => createM.mutate(d))} className="space-y-4 mt-2">
          {/* Basic Info */}
          <div className="text-xs font-semibold text-gray-500 uppercase">Basic Info</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Customer ID</Label>
              <Input
                {...register('customerId')}
                className="bg-[#111111] border-[#2A2A2A] text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Branch ID</Label>
              <Input
                {...register('branchId')}
                className="bg-[#111111] border-[#2A2A2A] text-white"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Title</Label>
            <Input
              {...register('title')}
              className="bg-[#111111] border-[#2A2A2A] text-white"
              placeholder="e.g. Wedding Dress, Business Suit"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Description</Label>
            <Input
              {...register('description')}
              className="bg-[#111111] border-[#2A2A2A] text-white"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Required By</Label>
            <Input
              type="date"
              {...register('requiredByDate')}
              className="bg-[#111111] border-[#2A2A2A] text-white"
            />
          </div>

          {/* Measurements */}
          <div className="text-xs font-semibold text-gray-500 uppercase mt-2">Measurements (cm)</div>
          <div className="grid grid-cols-4 gap-3">
            {(['bust', 'waist', 'hips', 'length', 'shoulders', 'sleeves', 'inseam', 'neck'] as const).map((field) => (
              <div key={field} className="space-y-1">
                <Label className="text-gray-300 text-xs capitalize">{field}</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(field)}
                  className="bg-[#111111] border-[#2A2A2A] text-white"
                />
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Measurement Notes</Label>
            <Input
              {...register('measurementNotes')}
              className="bg-[#111111] border-[#2A2A2A] text-white"
            />
          </div>

          {/* Style */}
          <div className="text-xs font-semibold text-gray-500 uppercase mt-2">Style Preferences</div>
          <div className="space-y-1">
            <Label className="text-gray-300">Style Preferences</Label>
            <Input
              {...register('stylePreferences')}
              className="bg-[#111111] border-[#2A2A2A] text-white"
              placeholder="A-line, empire waist..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Color Preferences</Label>
              <Input
                {...register('colorPreferences')}
                className="bg-[#111111] border-[#2A2A2A] text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Fabric Preferences</Label>
              <Input
                {...register('fabricPreferences')}
                className="bg-[#111111] border-[#2A2A2A] text-white"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="text-xs font-semibold text-gray-500 uppercase mt-2">Pricing</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Estimated Price</Label>
              <Input
                type="number"
                {...register('estimatedPrice')}
                className="bg-[#111111] border-[#2A2A2A] text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Deposit Amount</Label>
              <Input
                type="number"
                {...register('depositAmount')}
                className="bg-[#111111] border-[#2A2A2A] text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Currency</Label>
              <Input
                {...register('currencyCode')}
                className="bg-[#111111] border-[#2A2A2A] text-white"
                defaultValue="XOF"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              className="text-gray-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createM.isPending}
              className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold"
            >
              Create Order
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
