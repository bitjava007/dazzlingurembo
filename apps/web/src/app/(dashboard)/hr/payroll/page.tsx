'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { hrService } from '@/services/hr.service';
import { toast } from '@/hooks/use-toast';
import type { PayrollRun } from '@/types';
import { CheckCircle, DollarSign } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function PayrollPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', page],
    queryFn: () => hrService.getPayrollRuns({ page, limit: 20 }),
  });

  const approveM = useMutation({ mutationFn: (id: string) => hrService.approvePayroll(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll'] }); toast({ title: 'Payroll approved' }); } });
  const payM = useMutation({ mutationFn: (id: string) => hrService.payPayroll(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll'] }); toast({ title: 'Payroll paid' }); } });

  const columns = [
    { header: 'Period', render: (r: PayrollRun) => `${MONTHS[r.month - 1]} ${r.year}` },
    { header: 'Employees', accessor: 'employeeCount' as keyof PayrollRun },
    { header: 'Gross', render: (r: PayrollRun) => `$${r.totalGross.toFixed(2)}` },
    { header: 'Deductions', render: (r: PayrollRun) => `$${r.totalDeductions.toFixed(2)}` },
    { header: 'Net', render: (r: PayrollRun) => `$${r.totalNet.toFixed(2)}` },
    { header: 'Status', render: (r: PayrollRun) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions', render: (r: PayrollRun) => (
        <div className="flex gap-1">
          {r.status === 'DRAFT' && <Button variant="ghost" size="sm" className="h-7 text-[#C9A84C]" onClick={() => approveM.mutate(r.id)}><CheckCircle className="h-3 w-3 mr-1" />Approve</Button>}
          {r.status === 'APPROVED' && <Button variant="ghost" size="sm" className="h-7 text-green-400" onClick={() => payM.mutate(r.id)}><DollarSign className="h-3 w-3 mr-1" />Pay</Button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Payroll" subtitle="Monthly payroll runs" />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
