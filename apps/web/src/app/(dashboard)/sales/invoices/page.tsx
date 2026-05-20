'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { BranchFilter } from '@/components/ui/branch-filter';
import { salesService } from '@/services/sales.service';
import type { Invoice } from '@/types';

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchId, setBranchId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search, page, branchId],
    queryFn: () => salesService.getInvoices({ search, page, limit: 20, ...(branchId && { branchId }) }),
  });

  const columns = [
    { header: 'Invoice #', accessor: 'invoiceNumber' as keyof Invoice },
    { header: 'Customer', render: (r: Invoice) => r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : '—' },
    { header: 'Status', render: (r: Invoice) => <StatusBadge status={r.status} /> },
    { header: 'Total', render: (r: Invoice) => `$${r.totalAmount.toFixed(2)}` },
    { header: 'Paid', render: (r: Invoice) => `$${r.paidAmount.toFixed(2)}` },
    { header: 'Balance', render: (r: Invoice) => <span className={r.balanceDue > 0 ? 'text-red-400' : 'text-green-400'}>${r.balanceDue.toFixed(2)}</span> },
    { header: 'Due Date', render: (r: Invoice) => r.dueAt ? new Date(r.dueAt).toLocaleDateString() : '—' },
  ];

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Sales invoices" />
      <div className="mb-4 flex gap-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search invoices..." />
        <BranchFilter value={branchId} onChange={(v) => { setBranchId(v); setPage(1); }} />
      </div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
