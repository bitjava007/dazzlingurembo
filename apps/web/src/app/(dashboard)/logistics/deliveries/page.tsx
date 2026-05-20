'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { logisticsService } from '@/services/logistics.service';
import { toast } from '@/hooks/use-toast';
import type { Delivery } from '@/types';
import { Truck, CheckCircle, XCircle } from 'lucide-react';

export default function DeliveriesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['deliveries', search, page],
    queryFn: () => logisticsService.getDeliveries({ search, page, limit: 20 }),
  });

  const dispatchM = useMutation({
    mutationFn: (id: string) => logisticsService.dispatch(id, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deliveries'] }); toast({ title: 'Dispatched' }); },
  });
  const deliverM = useMutation({
    mutationFn: (id: string) => logisticsService.markDelivered(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deliveries'] }); toast({ title: 'Marked as delivered' }); },
  });
  const failM = useMutation({
    mutationFn: (id: string) => logisticsService.markFailed(id, 'Delivery failed'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deliveries'] }); toast({ title: 'Marked as failed' }); },
  });

  const columns = [
    { header: 'Order #', render: (r: Delivery) => r.order?.orderNumber ?? '—' },
    { header: 'Status', render: (r: Delivery) => <StatusBadge status={r.status} /> },
    { header: 'Carrier', render: (r: Delivery) => r.carrierName ?? '—' },
    { header: 'Tracking', render: (r: Delivery) => r.trackingNumber ?? '—' },
    { header: 'Picked Up', render: (r: Delivery) => r.pickedUpAt ? new Date(r.pickedUpAt).toLocaleDateString() : '—' },
    { header: 'Delivered', render: (r: Delivery) => r.deliveredAt ? new Date(r.deliveredAt).toLocaleDateString() : '—' },
    {
      header: 'Actions', render: (r: Delivery) => (
        <div className="flex gap-1">
          {r.status === 'PENDING' && <Button variant="ghost" size="sm" className="h-7 text-blue-400" onClick={() => dispatchM.mutate(r.id)}><Truck className="h-3 w-3 mr-1" />Dispatch</Button>}
          {r.status === 'DISPATCHED' && <Button variant="ghost" size="sm" className="h-7 text-green-400" onClick={() => deliverM.mutate(r.id)}><CheckCircle className="h-3 w-3 mr-1" />Deliver</Button>}
          {r.status === 'DISPATCHED' && <Button variant="ghost" size="sm" className="h-7 text-red-400" onClick={() => failM.mutate(r.id)}><XCircle className="h-3 w-3 mr-1" />Fail</Button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Deliveries" subtitle="Logistics and delivery management" />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search deliveries..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
