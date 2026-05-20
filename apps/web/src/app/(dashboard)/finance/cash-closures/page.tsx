'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { financeService } from '@/services/finance.service';
import type { CashClosure } from '@/types';

export default function CashClosuresPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['cash-closures', page],
    queryFn: () => financeService.getCashClosures({ page, limit: 20 }),
  });

  const columns = [
    { header: 'Date', render: (r: CashClosure) => new Date(r.closureDate).toLocaleDateString() },
    { header: 'Branch', render: (r: CashClosure) => r.branch?.name ?? '—' },
    { header: 'Sales', render: (r: CashClosure) => `${Number(r.totalSales).toFixed(2)} ${r.currencyCode}` },
    { header: 'Refunds', render: (r: CashClosure) => `${Number(r.totalRefunds).toFixed(2)}` },
    { header: 'Net Revenue', render: (r: CashClosure) => `${Number(r.netRevenue).toFixed(2)} ${r.currencyCode}` },
    { header: 'Variance', render: (r: CashClosure) => r.cashVariance != null ? <span className={Number(r.cashVariance) !== 0 ? 'text-red-400' : 'text-green-400'}>{Number(r.cashVariance).toFixed(2)}</span> : '—' },
    { header: 'Status', render: (r: CashClosure) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Cash Closures" subtitle="Daily cash closure records" />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
