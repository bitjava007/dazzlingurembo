'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatsChart } from '@/components/dashboard/stats-chart';
import { toast } from '@/hooks/use-toast';
import type { BankAccount, BankTransaction, CashPosition } from '@/types';
import { Landmark, TrendingUp, TrendingDown, Activity, Plus, Eye } from 'lucide-react';

const accountSchema = z.object({
  name: z.string().min(1, 'Required'),
  bankName: z.string().min(1, 'Required'),
  accountNumber: z.string().min(1, 'Required'),
  iban: z.string().optional(),
  swift: z.string().optional(),
  currencyCode: z.string().min(1, 'Required'),
  branchId: z.string().min(1, 'Required'),
  notes: z.string().optional(),
});
type AccountFormData = z.infer<typeof accountSchema>;

const txSchema = z.object({
  type: z.enum(['INFLOW', 'OUTFLOW']),
  amount: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  referenceType: z.string().optional(),
});
type TxFormData = z.infer<typeof txSchema>;

export default function TreasuryPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'cashflow'>('overview');
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [cashflowFrom, setCashflowFrom] = useState(thirtyDaysAgo);
  const [cashflowTo, setCashflowTo] = useState(today);

  const { data: cashPosition, isLoading: cpLoading } = useQuery<CashPosition>({
    queryKey: ['treasury', 'cash-position'],
    queryFn: () => api.get('/finance/treasury/cash-position').then((r) => r.data),
  });

  const { data: accountsData, isLoading: accountsLoading } = useQuery<{ data: BankAccount[] }>({
    queryKey: ['treasury', 'accounts'],
    queryFn: () => api.get('/finance/treasury/bank-accounts?limit=100').then((r) => r.data),
  });

  const { data: cashflowData } = useQuery<{ data: Array<{ date: string; inflows: number; outflows: number; net: number }> }>({
    queryKey: ['treasury', 'cashflow', cashflowFrom, cashflowTo],
    queryFn: () => api.get(`/finance/treasury/cashflow?from=${cashflowFrom}&to=${cashflowTo}`).then((r) => r.data),
    enabled: activeTab === 'cashflow',
  });

  const { data: txData, isLoading: txLoading } = useQuery<{ data: BankTransaction[] }>({
    queryKey: ['treasury', 'transactions', selectedAccount?.id],
    queryFn: () => api.get(`/finance/treasury/bank-accounts/${selectedAccount!.id}/transactions`).then((r) => r.data),
    enabled: !!selectedAccount,
  });

  const accountForm = useForm<AccountFormData>({ resolver: zodResolver(accountSchema) as never });
  const txForm = useForm<TxFormData>({ resolver: zodResolver(txSchema) as never });

  const createAccountM = useMutation({
    mutationFn: (d: AccountFormData) => api.post('/finance/treasury/bank-accounts', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['treasury'] });
      setAccountModalOpen(false);
      accountForm.reset();
      toast({ title: 'Bank account created' });
    },
  });

  const createTxM = useMutation({
    mutationFn: (d: TxFormData) =>
      api.post(`/finance/treasury/bank-accounts/${selectedAccount!.id}/transactions`, {
        type: d.type,
        amount: parseFloat(d.amount),
        description: d.description,
        referenceType: d.referenceType,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['treasury'] });
      setTxModalOpen(false);
      txForm.reset();
      toast({ title: 'Transaction recorded' });
    },
  });

  const deleteAccountM = useMutation({
    mutationFn: (id: string) => api.delete(`/finance/treasury/bank-accounts/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['treasury'] }); toast({ title: 'Account removed' }); },
  });

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);

  const tabs: Array<{ key: 'overview' | 'accounts' | 'cashflow'; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'accounts', label: 'Bank Accounts' },
    { key: 'cashflow', label: 'Cashflow' },
  ];

  const accountColumns = [
    { header: 'Name', render: (r: BankAccount) => <span className="font-medium text-white">{r.name}</span> },
    { header: 'Bank', accessor: 'bankName' as keyof BankAccount },
    { header: 'Account #', accessor: 'accountNumber' as keyof BankAccount },
    { header: 'Currency', accessor: 'currencyCode' as keyof BankAccount },
    { header: 'Balance', render: (r: BankAccount) => <span className="text-[#C9A84C] font-semibold">{fmt(r.currentBalance)}</span> },
    { header: 'Branch', render: (r: BankAccount) => r.branch?.name ?? r.branchId },
    { header: 'Status', render: (r: BankAccount) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      header: 'Actions',
      render: (r: BankAccount) => (
        <div className="flex gap-2">
          <Button
            variant="ghost" size="sm"
            className="h-7 text-[#C9A84C] hover:text-[#D4AF37]"
            onClick={() => setSelectedAccount(r)}
          >
            <Eye className="h-3 w-3 mr-1" />View
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-7 text-red-400 hover:text-red-300"
            onClick={() => deleteAccountM.mutate(r.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const txColumns = [
    { header: 'Date', render: (r: BankTransaction) => new Date(r.transactionDate).toLocaleDateString() },
    { header: 'Type', render: (r: BankTransaction) => <StatusBadge status={r.type} /> },
    { header: 'Description', accessor: 'description' as keyof BankTransaction },
    { header: 'Amount', render: (r: BankTransaction) => <span className={r.type === 'INFLOW' ? 'text-green-400' : 'text-red-400'}>{r.type === 'INFLOW' ? '+' : '-'}{fmt(r.amount)}</span> },
    { header: 'Ref Type', render: (r: BankTransaction) => r.referenceType ?? '—' },
  ];

  const chartData = (cashflowData?.data ?? []).map((d) => ({ label: d.date.slice(5), value: d.inflows }));

  return (
    <div>
      <PageHeader
        title="Treasury"
        subtitle="Bank accounts and cash flow management"
        onAction={activeTab === 'accounts' ? () => setAccountModalOpen(true) : undefined}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#2A2A2A]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-400">Total Balance</p>
                <div className="p-2 rounded-md bg-[#C9A84C]/10">
                  <Landmark className="h-5 w-5 text-[#C9A84C]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#C9A84C]">
                {cpLoading ? '...' : fmt((cashPosition?.accounts ?? []).reduce((s, a) => s + a.currentBalance, 0))}
              </p>
              <p className="text-xs text-gray-500 mt-1">XOF across all accounts</p>
            </div>

            <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-400">Inflows (30d)</p>
                <div className="p-2 rounded-md bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-400">{cpLoading ? '...' : fmt(cashPosition?.inflowLast30d ?? 0)}</p>
            </div>

            <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-400">Outflows (30d)</p>
                <div className="p-2 rounded-md bg-red-500/10">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-red-400">{cpLoading ? '...' : fmt(cashPosition?.outflowLast30d ?? 0)}</p>
            </div>

            <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-400">Net (30d)</p>
                <div className="p-2 rounded-md bg-[#C9A84C]/10">
                  <Activity className="h-5 w-5 text-[#C9A84C]" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${(cashPosition?.netLast30d ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {cpLoading ? '...' : fmt(cashPosition?.netLast30d ?? 0)}
              </p>
            </div>
          </div>

          {/* Account Cards */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Bank Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(cashPosition?.accounts ?? []).map((account) => (
                <div key={account.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{account.name}</span>
                    <StatusBadge status={account.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                  <p className="text-xs text-gray-500">{account.bankName}</p>
                  <p className="text-2xl font-bold text-[#C9A84C] mt-3">{fmt(account.currentBalance)}</p>
                  <p className="text-xs text-gray-500">{account.currencyCode}</p>
                </div>
              ))}
              {(cashPosition?.accounts ?? []).length === 0 && !cpLoading && (
                <p className="text-gray-500 text-sm col-span-3">No bank accounts found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <DataTable
            columns={accountColumns}
            data={accountsData?.data ?? []}
            loading={accountsLoading}
            keyExtractor={(r) => r.id}
          />

          {/* Transactions Sub-panel */}
          {selectedAccount && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">
                  Transactions — {selectedAccount.name}
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold h-8"
                    onClick={() => setTxModalOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />Add Transaction
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 h-8" onClick={() => setSelectedAccount(null)}>
                    Close
                  </Button>
                </div>
              </div>
              <DataTable
                columns={txColumns}
                data={txData?.data ?? []}
                loading={txLoading}
                keyExtractor={(r) => r.id}
              />
            </div>
          )}
        </div>
      )}

      {/* Cashflow Tab */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">From</Label>
              <input
                type="date"
                value={cashflowFrom}
                onChange={(e) => setCashflowFrom(e.target.value)}
                className="bg-[#111111] border border-[#2A2A2A] text-white rounded px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">To</Label>
              <input
                type="date"
                value={cashflowTo}
                onChange={(e) => setCashflowTo(e.target.value)}
                className="bg-[#111111] border border-[#2A2A2A] text-white rounded px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {chartData.length > 0 && (
            <StatsChart data={chartData} title="Daily Inflows" />
          )}

          {/* Cashflow Table */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-[#2A2A2A]">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Date</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Inflows</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Outflows</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Net</th>
                </tr>
              </thead>
              <tbody>
                {(cashflowData?.data ?? []).map((row) => (
                  <tr key={row.date} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                    <td className="px-4 py-3 text-white">{row.date}</td>
                    <td className="px-4 py-3 text-right text-green-400">{fmt(row.inflows)}</td>
                    <td className="px-4 py-3 text-right text-red-400">{fmt(row.outflows)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${row.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(row.net)}</td>
                  </tr>
                ))}
                {(cashflowData?.data ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No cashflow data for selected period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      <FormModal open={accountModalOpen} onOpenChange={setAccountModalOpen} title="New Bank Account">
        <form onSubmit={accountForm.handleSubmit((d) => createAccountM.mutate(d))} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Account Name</Label>
              <Input {...accountForm.register('name')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {accountForm.formState.errors.name && <p className="text-red-400 text-xs">{accountForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Bank Name</Label>
              <Input {...accountForm.register('bankName')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Account Number</Label>
              <Input {...accountForm.register('accountNumber')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Currency Code</Label>
              <Input {...accountForm.register('currencyCode')} placeholder="XOF" className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">IBAN (optional)</Label>
              <Input {...accountForm.register('iban')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">SWIFT (optional)</Label>
              <Input {...accountForm.register('swift')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Branch ID</Label>
            <Input {...accountForm.register('branchId')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Notes</Label>
            <Input {...accountForm.register('notes')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setAccountModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createAccountM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Create</Button>
          </div>
        </form>
      </FormModal>

      {/* Create Transaction Modal */}
      <FormModal open={txModalOpen} onOpenChange={setTxModalOpen} title={`Add Transaction — ${selectedAccount?.name ?? ''}`}>
        <form onSubmit={txForm.handleSubmit((d) => createTxM.mutate(d))} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Type</Label>
              <select
                {...txForm.register('type')}
                className="w-full bg-[#111111] border border-[#2A2A2A] text-white rounded px-3 py-2 text-sm"
              >
                <option value="INFLOW">INFLOW</option>
                <option value="OUTFLOW">OUTFLOW</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Amount</Label>
              <Input type="number" step="0.01" {...txForm.register('amount')} className="bg-[#111111] border-[#2A2A2A] text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Description</Label>
            <Input {...txForm.register('description')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Reference Type</Label>
            <Input {...txForm.register('referenceType')} placeholder="INVOICE, EXPENSE, PAYROLL, MANUAL" className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setTxModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createTxM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">Record</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
