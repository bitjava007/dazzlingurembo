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
    { header: 'Entry #', render: (r: JournalEntry) => <span className="font-mono text-xs text-[#C9A84C]">{r.entryNumber}</span> },
    { header: 'Description', accessor: 'description' as keyof JournalEntry },
    { header: 'Type', render: (r: JournalEntry) => r.entryType.replace(/_/g, ' ') },
    { header: 'Amount', render: (r: JournalEntry) => `${Number(r.originalAmount).toFixed(2)} ${r.originalCurrencyCode}` },
    { header: 'Account', render: (r: JournalEntry) => r.accountCode ?? '—' },
    { header: 'Date', render: (r: JournalEntry) => new Date(r.postDate).toLocaleDateString() },
    { header: 'Void', render: (r: JournalEntry) => r.isVoid ? <span className="text-red-400">Yes</span> : <span className="text-gray-500">No</span> },
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
