'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { financeService } from '@/services/finance.service';
import type { JournalEntry } from '@/types';

export default function JournalPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['journal', search, page],
    queryFn: () => financeService.getJournalEntries({ search, page, limit: 20 }),
  });

  const columns = [
    { header: 'Reference', accessor: 'reference' as keyof JournalEntry },
    { header: 'Description', accessor: 'description' as keyof JournalEntry },
    { header: 'Date', render: (r: JournalEntry) => new Date(r.date).toLocaleDateString() },
    { header: 'Status', render: (r: JournalEntry) => <StatusBadge status={r.status} /> },
    { header: 'Total Debit', render: (r: JournalEntry) => `$${r.totalDebit.toFixed(2)}` },
    { header: 'Total Credit', render: (r: JournalEntry) => `$${r.totalCredit.toFixed(2)}` },
  ];

  return (
    <div>
      <PageHeader title="Journal Entries" subtitle="General ledger journal" />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search entries..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
