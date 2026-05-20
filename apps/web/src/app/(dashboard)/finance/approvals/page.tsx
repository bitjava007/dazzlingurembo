'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import type { Expense } from '@/types';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ApprovalsPage() {
  const qc = useQueryClient();
  const [showProcessed, setShowProcessed] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const status = showProcessed ? 'APPROVED' : 'SUBMITTED';

  const { data: pendingData, isLoading } = useQuery<{ data: Expense[]; meta: { totalPages: number } }>({
    queryKey: ['approvals', status],
    queryFn: () => api.get(`/finance/expenses?status=${status}&limit=50`).then((r) => r.data),
  });

  const approveM = useMutation({
    mutationFn: (id: string) => api.patch(`/finance/expenses/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals'] });
      toast({ title: 'Expense approved' });
    },
    onError: () => toast({ title: 'Failed to approve expense', variant: 'destructive' }),
  });

  const rejectM = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/finance/expenses/${id}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals'] });
      setRejectModalOpen(false);
      setSelectedExpense(null);
      setRejectionReason('');
      toast({ title: 'Expense rejected' });
    },
    onError: () => toast({ title: 'Failed to reject expense', variant: 'destructive' }),
  });

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);

  const columns = [
    { header: 'Expense #', render: (r: Expense) => <span className="font-mono text-xs text-[#C9A84C]">{r.expenseNumber}</span> },
    { header: 'Description', render: (r: Expense) => <span className="text-white">{r.description}</span> },
    { header: 'Category', render: (r: Expense) => r.category?.name ?? r.categoryId ?? '—' },
    { header: 'Amount', render: (r: Expense) => <span className="text-[#C9A84C] font-semibold">{fmt(Number(r.originalAmount))} {r.originalCurrencyCode}</span> },
    { header: 'Branch', render: (r: Expense) => r.branch?.name ?? r.branchId ?? '—' },
    { header: 'Submitted By', render: (r: Expense) => r.createdById ? <span className="font-mono text-xs">{r.createdById.slice(0, 8)}...</span> : '—' },
    { header: 'Date', render: (r: Expense) => new Date(r.expenseDate).toLocaleDateString() },
    { header: 'Status', render: (r: Expense) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: (r: Expense) => r.status === 'SUBMITTED' ? (
        <div className="flex gap-2">
          <Button
            variant="ghost" size="sm"
            className="h-7 text-green-400 hover:text-green-300"
            onClick={() => approveM.mutate(r.id)}
            disabled={approveM.isPending}
          >
            <CheckCircle className="h-3 w-3 mr-1" />Approve
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-7 text-red-400 hover:text-red-300"
            onClick={() => { setSelectedExpense(r); setRejectModalOpen(true); }}
          >
            <XCircle className="h-3 w-3 mr-1" />Reject
          </Button>
        </div>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Expense Approvals" subtitle="Review and approve submitted expenses" />

      {/* Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowProcessed(false)}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            !showProcessed ? 'bg-[#C9A84C] text-black' : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-[#2A2A2A]'
          }`}
        >
          Pending Approval
          {!showProcessed && pendingData?.data?.length ? (
            <span className="ml-2 bg-black text-[#C9A84C] text-xs px-1.5 py-0.5 rounded-full">
              {pendingData.data.length}
            </span>
          ) : null}
        </button>
        <button
          onClick={() => setShowProcessed(true)}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            showProcessed ? 'bg-[#C9A84C] text-black' : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-[#2A2A2A]'
          }`}
        >
          Approved
        </button>
      </div>

      <DataTable
        columns={columns}
        data={pendingData?.data ?? []}
        loading={isLoading}
        keyExtractor={(r) => r.id}
      />

      {/* Rejection Modal */}
      <FormModal
        open={rejectModalOpen}
        onOpenChange={(open) => { setRejectModalOpen(open); if (!open) { setSelectedExpense(null); setRejectionReason(''); } }}
        title={`Reject Expense — ${selectedExpense?.expenseNumber ?? ''}`}
      >
        <div className="space-y-4 mt-2">
          <p className="text-gray-400 text-sm">
            Please provide a reason for rejecting this expense.
          </p>
          <div className="space-y-1">
            <Label className="text-gray-300">Rejection Reason</Label>
            <Input
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="bg-[#111111] border-[#2A2A2A] text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setRejectModalOpen(false); setSelectedExpense(null); setRejectionReason(''); }}
              className="text-gray-400"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!rejectionReason.trim() || rejectM.isPending}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold"
              onClick={() => {
                if (selectedExpense && rejectionReason.trim()) {
                  rejectM.mutate({ id: selectedExpense.id, reason: rejectionReason.trim() });
                }
              }}
            >
              Reject Expense
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
