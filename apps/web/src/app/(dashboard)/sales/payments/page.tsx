'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { salesService } from '@/services/sales.service';
import type { Payment } from '@/types';

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['payments', search, page],
    queryFn: () => salesService.getPayments({ search, page, limit: 20 }),
  });

  const columns = [
    { header: 'Invoice #', render: (r: Payment) => r.invoice?.invoiceNumber ?? '—' },
    { header: 'Amount', render: (r: Payment) => `$${r.originalAmount.toFixed(2)}` },
    { header: 'Method', render: (r: Payment) => r.method.replace(/_/g, ' ') },
    { header: 'Reference', render: (r: Payment) => r.reference ?? '—' },
    { header: 'Status', render: (r: Payment) => <StatusBadge status={r.status} /> },
    { header: 'Date', render: (r: Payment) => r.paidAt ? new Date(r.paidAt).toLocaleDateString() : '—' },
  ];

  return (
    <div>
      <PageHeader title="Payments" subtitle="Payment records" />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search payments..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
