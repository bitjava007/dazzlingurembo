'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { BranchFilter } from '@/components/ui/branch-filter';
import { hrService } from '@/services/hr.service';
import type { AttendanceRecord } from '@/types';

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branchId, setBranchId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', search, page, branchId],
    queryFn: () => hrService.getAttendance({ search, page, limit: 20, ...(branchId && { branchId }) }),
  });

  const columns = [
    { header: 'Employee', render: (r: AttendanceRecord) => r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '—' },
    { header: 'Date', render: (r: AttendanceRecord) => new Date(r.date).toLocaleDateString() },
    { header: 'Check In', render: (r: AttendanceRecord) => r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString() : '—' },
    { header: 'Check Out', render: (r: AttendanceRecord) => r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString() : '—' },
    { header: 'Status', render: (r: AttendanceRecord) => <StatusBadge status={r.status} /> },
    { header: 'Notes', render: (r: AttendanceRecord) => r.notes ?? '—' },
  ];

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Employee attendance records" />
      <div className="mb-4 flex gap-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search attendance..." />
        <BranchFilter value={branchId} onChange={(v) => { setBranchId(v); setPage(1); }} />
      </div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
