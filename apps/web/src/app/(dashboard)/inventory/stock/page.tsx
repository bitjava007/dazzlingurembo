'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { inventoryService } from '@/services/inventory.service';
import type { StockBalance } from '@/types';

export default function StockPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['stock', search, page],
    queryFn: () => inventoryService.getStockBalances({ search, page, limit: 20 }),
  });

  const columns = [
    { header: 'Product', render: (r: StockBalance) => r.variant?.product?.name ?? '—' },
    { header: 'SKU', render: (r: StockBalance) => r.variant?.sku ?? '—' },
    { header: 'Variant', render: (r: StockBalance) => r.variant?.name ?? '—' },
    { header: 'Warehouse', render: (r: StockBalance) => r.warehouse?.name ?? '—' },
    { header: 'Quantity', render: (r: StockBalance) => r.quantity },
    { header: 'Reserved', render: (r: StockBalance) => r.reservedQuantity },
    {
      header: 'Available',
      render: (r: StockBalance) => (
        <span className={r.availableQuantity <= (r.reorderPoint ?? 10) ? 'text-red-400 font-medium' : 'text-green-400'}>
          {r.availableQuantity}
        </span>
      ),
    },
    { header: 'Reorder Point', render: (r: StockBalance) => r.reorderPoint ?? '—' },
  ];

  return (
    <div>
      <PageHeader title="Stock Balances" subtitle="Current inventory levels by warehouse" />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search stock..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
