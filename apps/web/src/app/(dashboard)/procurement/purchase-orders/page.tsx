'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { BranchFilter } from '@/components/ui/branch-filter';
import { procurementService } from '@/services/procurement.service';
import { toast } from '@/hooks/use-toast';
import type { PurchaseOrder } from '@/types';

export default function PurchaseOrdersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchId, setBranchId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', search, page, branchId],
    queryFn: () => procurementService.getPurchaseOrders({ search, page, limit: 20, ...(branchId && { branchId }) }),
  });

  const statusM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => procurementService.updatePOStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchase-orders'] }); toast({ title: 'Status updated' }); },
  });

  const columns = [
    { header: 'PO #', accessor: 'poNumber' as keyof PurchaseOrder },
    { header: 'Supplier', render: (r: PurchaseOrder) => r.supplier?.name ?? '—' },
    { header: 'Status', render: (r: PurchaseOrder) => <StatusBadge status={r.status} /> },
    { header: 'Items', render: (r: PurchaseOrder) => r.items?.length ?? 0 },
    { header: 'Total', render: (r: PurchaseOrder) => `$${(r.totalAmount ?? 0).toFixed(2)}` },
    { header: 'Expected', render: (r: PurchaseOrder) => r.expectedDeliveryAt ? new Date(r.expectedDeliveryAt).toLocaleDateString() : '—' },
    { header: 'Date', render: (r: PurchaseOrder) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: 'Actions', render: (r: PurchaseOrder) => r.status === 'DRAFT' ? (
        <Button variant="ghost" size="sm" className="h-7 text-[#C9A84C] hover:text-[#D4AF37]" onClick={() => statusM.mutate({ id: r.id, status: 'SENT' })}>
          Send
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Purchase Orders" subtitle="Manage purchase orders" />
      <div className="mb-4 flex gap-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search POs..." />
        <BranchFilter value={branchId} onChange={(v) => { setBranchId(v); setPage(1); }} />
      </div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
