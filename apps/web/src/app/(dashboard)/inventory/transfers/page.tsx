'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { inventoryService } from '@/services/inventory.service';
import type { StockTransfer } from '@/types';

export default function TransfersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['transfers', search, page],
    queryFn: () => inventoryService.getTransfers({ search, page, limit: 20 }),
  });

  const columns = [
    { header: 'From', render: (r: StockTransfer) => r.fromWarehouse?.name ?? '—' },
    { header: 'To', render: (r: StockTransfer) => r.toWarehouse?.name ?? '—' },
    { header: 'Items', render: (r: StockTransfer) => r.items.length },
    { header: 'Status', render: (r: StockTransfer) => <StatusBadge status={r.status} /> },
    { header: 'Notes', render: (r: StockTransfer) => r.notes ?? '—' },
    { header: 'Date', render: (r: StockTransfer) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Stock Transfers" subtitle="Transfer inventory between warehouses" />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search transfers..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
