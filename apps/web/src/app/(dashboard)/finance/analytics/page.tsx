'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import type { AnalyticsSummary, ProfitabilityByBranch, EmployeeCostSummary } from '@/types';
import { DollarSign, TrendingUp, TrendingDown, Users, Briefcase, CreditCard } from 'lucide-react';

type MainTab = 'summary' | 'profitability' | 'employee-costs' | 'workshop';
type ProfitSubTab = 'branch' | 'customer' | 'period';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('summary');
  const [profitSubTab, setProfitSubTab] = useState<ProfitSubTab>('branch');

  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);

  const { data: summary, isLoading: summaryLoading } = useQuery<AnalyticsSummary>({
    queryKey: ['analytics', 'summary', from, to],
    queryFn: () => api.get(`/finance/analytics/summary?from=${from}&to=${to}`).then((r) => r.data),
    enabled: activeTab === 'summary',
  });

  const { data: branchData, isLoading: branchLoading } = useQuery<ProfitabilityByBranch[]>({
    queryKey: ['analytics', 'profitability', 'branch', from, to],
    queryFn: () => api.get(`/finance/analytics/profitability/branch?from=${from}&to=${to}`).then((r) => r.data),
    enabled: activeTab === 'profitability' && profitSubTab === 'branch',
  });

  const { data: customerData, isLoading: customerLoading } = useQuery<Array<{ customerId: string | null; customerName: string; revenue: number; ordersCount: number }>>({
    queryKey: ['analytics', 'profitability', 'customer', from, to],
    queryFn: () => api.get(`/finance/analytics/profitability/customer?from=${from}&to=${to}&limit=20`).then((r) => r.data),
    enabled: activeTab === 'profitability' && profitSubTab === 'customer',
  });

  const { data: periodData, isLoading: periodLoading } = useQuery<Array<{ period: string; revenue: number; expenses: number; profit: number }>>({
    queryKey: ['analytics', 'profitability', 'period', from, to],
    queryFn: () => api.get(`/finance/analytics/profitability/period?from=${from}&to=${to}&granularity=month`).then((r) => r.data),
    enabled: activeTab === 'profitability' && profitSubTab === 'period',
  });

  const { data: employeeCosts, isLoading: ecLoading } = useQuery<EmployeeCostSummary>({
    queryKey: ['analytics', 'employee-costs', from, to],
    queryFn: () => api.get(`/finance/analytics/employee-costs?from=${from}&to=${to}`).then((r) => r.data),
    enabled: activeTab === 'employee-costs',
  });

  const { data: workshopData, isLoading: workshopLoading } = useQuery<Array<{ workshopId: string; workshopName: string; workOrderCount: number; materialCost: number }>>({
    queryKey: ['analytics', 'workshop', from, to],
    queryFn: () => api.get(`/finance/analytics/profitability/workshop?from=${from}&to=${to}`).then((r) => r.data),
    enabled: activeTab === 'workshop',
  });

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);
  const fmtPct = (n: number) => `${n.toFixed(1)}%`;

  const mainTabs: Array<{ key: MainTab; label: string }> = [
    { key: 'summary', label: 'Summary' },
    { key: 'profitability', label: 'Profitability' },
    { key: 'employee-costs', label: 'Employee Costs' },
    { key: 'workshop', label: 'Workshop' },
  ];

  const profitSubTabs: Array<{ key: ProfitSubTab; label: string }> = [
    { key: 'branch', label: 'By Branch' },
    { key: 'customer', label: 'By Customer' },
    { key: 'period', label: 'By Period' },
  ];

  const KpiCard = ({ title, value, icon: Icon, color = 'text-[#C9A84C]' }: { title: string; value: string; icon: React.ElementType; color?: string }) => (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <div className="p-2 rounded-md bg-[#C9A84C]/10">
          <Icon className="h-5 w-5 text-[#C9A84C]" />
        </div>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );

  return (
    <div>
      <PageHeader title="Financial Analytics" subtitle="Profitability, revenue and cost analysis" />

      {/* Date Range Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="space-y-1">
          <p className="text-xs text-gray-400">From</p>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-[#111111] border border-[#2A2A2A] text-white rounded px-3 py-1.5 text-sm"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-400">To</p>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-[#111111] border border-[#2A2A2A] text-white rounded px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#2A2A2A]">
        {mainTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard title="Total Revenue" value={summaryLoading ? '...' : fmt(summary?.totalRevenue ?? 0)} icon={TrendingUp} color="text-green-400" />
          <KpiCard title="Total Expenses" value={summaryLoading ? '...' : fmt(summary?.totalExpenses ?? 0)} icon={TrendingDown} color="text-red-400" />
          <KpiCard title="Gross Profit" value={summaryLoading ? '...' : fmt(summary?.grossProfit ?? 0)} icon={DollarSign} color={(summary?.grossProfit ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'} />
          <KpiCard title="Margin %" value={summaryLoading ? '...' : fmtPct(summary?.margin ?? 0)} icon={Briefcase} />
          <KpiCard title="Total Payroll" value={summaryLoading ? '...' : fmt(summary?.totalPayroll ?? 0)} icon={Users} />
          <KpiCard title="Total Advances" value={summaryLoading ? '...' : fmt(summary?.totalAdvances ?? 0)} icon={CreditCard} />
        </div>
      )}

      {/* Profitability Tab */}
      {activeTab === 'profitability' && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {profitSubTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setProfitSubTab(t.key)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  profitSubTab === t.key ? 'bg-[#C9A84C] text-black' : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-[#2A2A2A]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {profitSubTab === 'branch' && (
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-[#2A2A2A]">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Branch</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Revenue</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Expenses</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Profit</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {branchLoading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                  ) : (branchData ?? []).map((row) => (
                    <tr key={row.branchId} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                      <td className="px-4 py-3 text-white font-medium">{row.branchName}</td>
                      <td className="px-4 py-3 text-right text-green-400">{fmt(row.revenue)}</td>
                      <td className="px-4 py-3 text-right text-red-400">{fmt(row.expenses)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${row.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(row.profit)}</td>
                      <td className="px-4 py-3 text-right text-[#C9A84C]">{fmtPct(row.margin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {profitSubTab === 'customer' && (
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-[#2A2A2A]">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Customer</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Revenue</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {customerLoading ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                  ) : (customerData ?? []).map((row, i) => (
                    <tr key={row.customerId ?? i} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                      <td className="px-4 py-3 text-white">{row.customerName}</td>
                      <td className="px-4 py-3 text-right text-green-400">{fmt(row.revenue)}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{row.ordersCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {profitSubTab === 'period' && (
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-[#2A2A2A]">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Period</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Revenue</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Expenses</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {periodLoading ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                  ) : (periodData ?? []).map((row) => (
                    <tr key={row.period} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                      <td className="px-4 py-3 text-white font-medium">{row.period}</td>
                      <td className="px-4 py-3 text-right text-green-400">{fmt(row.revenue)}</td>
                      <td className="px-4 py-3 text-right text-red-400">{fmt(row.expenses)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${row.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(row.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Employee Costs Tab */}
      {activeTab === 'employee-costs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard title="Total Gross Pay" value={ecLoading ? '...' : fmt(employeeCosts?.summary.totalGrossPay ?? 0)} icon={DollarSign} />
            <KpiCard title="Total Net Pay" value={ecLoading ? '...' : fmt(employeeCosts?.summary.totalNetPay ?? 0)} icon={TrendingUp} color="text-green-400" />
            <KpiCard title="Total Allowances" value={ecLoading ? '...' : fmt(employeeCosts?.summary.totalAllowances ?? 0)} icon={Briefcase} />
            <KpiCard title="Headcount" value={ecLoading ? '...' : String(employeeCosts?.summary.headcount ?? 0)} icon={Users} />
          </div>

          <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2A2A2A]">
              <h3 className="text-sm font-semibold text-gray-400">Payroll by Employee</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-[#2A2A2A]">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Employee ID</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Gross Pay</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Net Pay</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Deductions</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ecLoading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : (employeeCosts?.payrollByEmployee ?? []).map((row) => (
                  <tr key={row.employeeId} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                    <td className="px-4 py-3 text-white font-mono text-xs">{row.employeeId.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-right text-[#C9A84C]">{fmt(row.grossPay)}</td>
                    <td className="px-4 py-3 text-right text-green-400">{fmt(row.netPay)}</td>
                    <td className="px-4 py-3 text-right text-red-400">{fmt(row.deductions)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2A2A2A]">
              <h3 className="text-sm font-semibold text-gray-400">Salary Advances</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-[#2A2A2A]">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Employee ID</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Currency</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ecLoading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : (employeeCosts?.advances ?? []).map((adv) => (
                  <tr key={adv.id} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                    <td className="px-4 py-3 text-white font-mono text-xs">{adv.employeeId.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-right text-[#C9A84C]">{fmt(adv.originalAmount)}</td>
                    <td className="px-4 py-3 text-gray-400">{adv.originalCurrencyCode}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{adv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Workshop Tab */}
      {activeTab === 'workshop' && (
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#2A2A2A]">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Workshop</th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">Work Orders</th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">Material Cost</th>
              </tr>
            </thead>
            <tbody>
              {workshopLoading ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : (workshopData ?? []).map((row) => (
                <tr key={row.workshopId} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                  <td className="px-4 py-3 text-white font-medium">{row.workshopName}</td>
                  <td className="px-4 py-3 text-right text-[#C9A84C]">{row.workOrderCount}</td>
                  <td className="px-4 py-3 text-right text-red-400">{fmt(row.materialCost)}</td>
                </tr>
              ))}
              {!workshopLoading && (workshopData ?? []).length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No workshop data for selected period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
