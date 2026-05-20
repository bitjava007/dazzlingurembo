'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { procurementService } from '@/services/procurement.service';
import type { SupplierInvoice } from '@/types';

export default function SupplierInvoicesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['supplier-invoices', search, page],
    queryFn: () => procurementService.getSupplierInvoices({ search, page, limit: 20 }),
  });

  const columns = [
    { header: 'Ref #', render: (r: SupplierInvoice) => r.paymentNumber ?? '—' },
    { header: 'Supplier', render: (r: SupplierInvoice) => r.supplier?.name ?? '—' },
    { header: 'Status', render: (r: SupplierInvoice) => <StatusBadge status={r.status} /> },
    { header: 'Amount', render: (r: SupplierInvoice) => `${r.originalAmount.toFixed(2)} ${r.originalCurrencyCode ?? ''}` },
    { header: 'Method', render: (r: SupplierInvoice) => r.method ?? '—' },
    { header: 'Paid At', render: (r: SupplierInvoice) => r.paidAt ? new Date(r.paidAt).toLocaleDateString() : '—' },
  ];

  return (
    <div>
      <PageHeader title="Supplier Invoices" subtitle="Invoices from suppliers" />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search invoices..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
