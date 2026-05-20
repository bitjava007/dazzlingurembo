'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { BranchFilter } from '@/components/ui/branch-filter';
import { inventoryService } from '@/services/inventory.service';
import type { StockMovement } from '@/types';

export default function MovementsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchId, setBranchId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['movements', search, page, branchId],
    queryFn: () => inventoryService.getMovements({ search, page, limit: 20, ...(branchId && { branchId }) }),
  });

  const columns = [
    { header: 'Type', render: (r: StockMovement) => <StatusBadge status={r.movementType} /> },
    { header: 'SKU', render: (r: StockMovement) => r.variant?.sku ?? '—' },
    { header: 'Variant', render: (r: StockMovement) => r.variant?.name ?? '—' },
    { header: 'Warehouse', render: (r: StockMovement) => r.warehouse?.name ?? '—' },
    { header: 'Quantity', render: (r: StockMovement) => r.quantity },
    { header: 'Notes', render: (r: StockMovement) => r.notes ?? '—' },
    { header: 'Date', render: (r: StockMovement) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Stock Movements" subtitle="Movement history" />
      <div className="mb-4 flex gap-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search movements..." />
        <BranchFilter value={branchId} onChange={(v) => { setBranchId(v); setPage(1); }} />
      </div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
