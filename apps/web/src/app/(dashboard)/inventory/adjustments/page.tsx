'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { inventoryService } from '@/services/inventory.service';
import { toast } from '@/hooks/use-toast';
import type { StockAdjustment } from '@/types';
import { CheckCircle } from 'lucide-react';

export default function AdjustmentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adjustments', search, page],
    queryFn: () => inventoryService.getAdjustments({ search, page, limit: 20 }),
  });

  const approveM = useMutation({
    mutationFn: (id: string) => inventoryService.approveAdjustment(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adjustments'] }); toast({ title: 'Adjustment approved' }); },
  });

  const columns = [
    { header: 'Warehouse', render: (r: StockAdjustment) => r.warehouse?.name ?? '—' },
    { header: 'Items', render: (r: StockAdjustment) => r.items.length },
    { header: 'Status', render: (r: StockAdjustment) => <StatusBadge status={r.status} /> },
    { header: 'Notes', render: (r: StockAdjustment) => r.notes ?? '—' },
    { header: 'Date', render: (r: StockAdjustment) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: 'Actions', render: (r: StockAdjustment) => r.status === 'PENDING' ? (
        <Button variant="ghost" size="sm" className="h-7 text-green-400 hover:text-green-300" onClick={() => approveM.mutate(r.id)}>
          <CheckCircle className="h-3 w-3 mr-1" />Approve
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Stock Adjustments" subtitle="Manual inventory adjustments" />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search adjustments..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
