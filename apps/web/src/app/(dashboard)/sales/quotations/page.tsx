'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { salesService } from '@/services/sales.service';
import { toast } from '@/hooks/use-toast';
import type { Quotation } from '@/types';
import { ArrowRight } from 'lucide-react';

export default function QuotationsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['quotations', search, page],
    queryFn: () => salesService.getQuotations({ search, page, limit: 20 }),
  });

  const convertM = useMutation({
    mutationFn: (id: string) => salesService.convertToOrder(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quotations'] }); qc.invalidateQueries({ queryKey: ['orders'] }); toast({ title: 'Converted to order' }); },
  });

  const columns = [
    { header: 'Number', accessor: 'quotationNumber' as keyof Quotation },
    { header: 'Customer', render: (r: Quotation) => r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : '—' },
    { header: 'Status', render: (r: Quotation) => <StatusBadge status={r.status} /> },
    { header: 'Total', render: (r: Quotation) => `$${r.totalAmount.toFixed(2)}` },
    { header: 'Valid Until', render: (r: Quotation) => r.validUntil ? new Date(r.validUntil).toLocaleDateString() : '—' },
    { header: 'Date', render: (r: Quotation) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: 'Actions', render: (r: Quotation) => r.status === 'ACCEPTED' ? (
        <Button variant="ghost" size="sm" className="h-7 text-[#C9A84C] hover:text-[#D4AF37]" onClick={() => convertM.mutate(r.id)}>
          <ArrowRight className="h-3 w-3 mr-1" />Convert
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Quotations" subtitle="Manage sales quotations" />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search quotations..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
