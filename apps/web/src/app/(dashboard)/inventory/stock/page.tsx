'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { BranchFilter } from '@/components/ui/branch-filter';
import { inventoryService } from '@/services/inventory.service';
import type { StockBalance } from '@/types';

export default function StockPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchId, setBranchId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['stock', search, page, branchId],
    queryFn: () => inventoryService.getStockBalances({ search, page, limit: 20, ...(branchId && { branchId }) }),
  });

  const columns = [
    { header: 'Product', render: (r: StockBalance) => r.variant?.product?.name ?? '—' },
    { header: 'SKU', render: (r: StockBalance) => r.variant?.sku ?? '—' },
    { header: 'Variant', render: (r: StockBalance) => r.variant?.name ?? '—' },
    { header: 'Warehouse', render: (r: StockBalance) => r.warehouse?.name ?? '—' },
    { header: 'On Hand', render: (r: StockBalance) => r.quantityOnHand },
    { header: 'Reserved', render: (r: StockBalance) => r.quantityReserved },
    {
      header: 'Available',
      render: (r: StockBalance) => {
        const reorderPt = r.product?.reorderPoint ?? 10;
        return (
          <span className={r.quantityAvailable <= reorderPt ? 'text-red-400 font-medium' : 'text-green-400'}>
            {r.quantityAvailable}
          </span>
        );
      },
    },
    { header: 'Reorder Point', render: (r: StockBalance) => r.product?.reorderPoint ?? '—' },
  ];

  return (
    <div>
      <PageHeader title="Stock Balances" subtitle="Current inventory levels by warehouse" />
      <div className="mb-4 flex gap-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search stock..." />
        <BranchFilter value={branchId} onChange={(v) => { setBranchId(v); setPage(1); }} />
      </div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
