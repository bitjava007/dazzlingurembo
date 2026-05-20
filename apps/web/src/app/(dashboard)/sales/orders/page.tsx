'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { salesService } from '@/services/sales.service';
import type { Order } from '@/types';

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', search, page],
    queryFn: () => salesService.getOrders({ search, page, limit: 20 }),
  });

  const columns = [
    { header: 'Order #', accessor: 'orderNumber' as keyof Order },
    { header: 'Customer', render: (r: Order) => r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : '—' },
    { header: 'Status', render: (r: Order) => <StatusBadge status={r.status} /> },
    { header: 'Items', render: (r: Order) => r.items?.length ?? 0 },
    { header: 'Total', render: (r: Order) => `$${r.totalAmount.toFixed(2)}` },
    { header: 'Date', render: (r: Order) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Orders" subtitle="Sales orders management" />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search orders..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
