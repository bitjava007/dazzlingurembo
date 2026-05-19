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
    { header: 'Date', render: (r: CashClosure) => new Date(r.date).toLocaleDateString() },
    { header: 'Branch', render: (r: CashClosure) => r.branch?.name ?? '—' },
    { header: 'Opening', render: (r: CashClosure) => `$${r.openingBalance.toFixed(2)}` },
    { header: 'Closing', render: (r: CashClosure) => `$${r.closingBalance.toFixed(2)}` },
    { header: 'Sales', render: (r: CashClosure) => `$${r.cashSales.toFixed(2)}` },
    { header: 'Difference', render: (r: CashClosure) => <span className={r.difference !== 0 ? 'text-red-400' : 'text-green-400'}>${r.difference.toFixed(2)}</span> },
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
