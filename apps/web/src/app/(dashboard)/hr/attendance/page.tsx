'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { hrService } from '@/services/hr.service';
import type { AttendanceRecord } from '@/types';

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', search, page],
    queryFn: () => hrService.getAttendance({ search, page, limit: 20 }),
  });

  const columns = [
    { header: 'Employee', render: (r: AttendanceRecord) => r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '—' },
    { header: 'Date', render: (r: AttendanceRecord) => new Date(r.date).toLocaleDateString() },
    { header: 'Check In', render: (r: AttendanceRecord) => r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—' },
    { header: 'Check Out', render: (r: AttendanceRecord) => r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—' },
    { header: 'Status', render: (r: AttendanceRecord) => <StatusBadge status={r.status} /> },
    { header: 'Notes', render: (r: AttendanceRecord) => r.notes ?? '—' },
  ];

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Employee attendance records" />
      <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search attendance..." /></div>
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
