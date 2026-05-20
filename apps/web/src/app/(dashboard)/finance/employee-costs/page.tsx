'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { DollarSign, Users, TrendingUp, CreditCard } from 'lucide-react';
import type { SalaryAdvance } from '@/types';

interface PayrollRecord {
  id: string;
  employeeId: string;
  periodStartDate: string;
  periodEndDate: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  status: string;
}

interface PayrollResponse {
  data: PayrollRecord[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface SalaryAdvanceResponse {
  data: SalaryAdvance[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function EmployeeCostsPage() {
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);

  const { data: payrollData, isLoading: payrollLoading } = useQuery<PayrollResponse>({
    queryKey: ['employee-costs', 'payroll', from, to],
    queryFn: () => api.get('/hr/payroll?page=1&limit=50').then((r) => r.data),
  });

  const { data: advancesData, isLoading: advancesLoading } = useQuery<SalaryAdvanceResponse>({
    queryKey: ['employee-costs', 'advances', from, to],
    queryFn: () => api.get('/hr/salary-advances?limit=50').then((r) => r.data),
  });

  const payrolls = payrollData?.data ?? [];
  const advances = advancesData?.data ?? [];

  const totalGross = payrolls.reduce((s, p) => s + Number(p.grossPay), 0);
  const totalNet = payrolls.reduce((s, p) => s + Number(p.netPay), 0);
  const totalAdvances = advances.filter((a) => a.status === 'DISBURSED').reduce((s, a) => s + Number(a.amount), 0);
  const headcount = new Set(payrolls.map((p) => p.employeeId)).size;

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);

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
      <PageHeader title="Employee Costs" subtitle="Payroll and salary advance tracking" />

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

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total Gross Pay" value={payrollLoading ? '...' : fmt(totalGross)} icon={DollarSign} />
        <KpiCard title="Total Net Pay" value={payrollLoading ? '...' : fmt(totalNet)} icon={TrendingUp} color="text-green-400" />
        <KpiCard title="Advances Disbursed" value={advancesLoading ? '...' : fmt(totalAdvances)} icon={CreditCard} color="text-red-400" />
        <KpiCard title="Headcount" value={payrollLoading ? '...' : String(headcount)} icon={Users} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Payroll Table */}
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2A2A2A]">
            <h3 className="text-sm font-semibold text-gray-400">Payroll Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#2A2A2A]">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Employee</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Base Salary</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Allowances</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Deductions</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">Net Pay</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : payrolls.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No payroll records found.</td></tr>
                ) : payrolls.map((p) => (
                  <tr key={p.id} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                    <td className="px-4 py-3 text-white font-mono text-xs">{p.employeeId.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-right text-gray-300">{fmt(Number(p.baseSalary))}</td>
                    <td className="px-4 py-3 text-right text-green-400">{fmt(Number(p.allowances))}</td>
                    <td className="px-4 py-3 text-right text-red-400">{fmt(Number(p.deductions))}</td>
                    <td className="px-4 py-3 text-right text-[#C9A84C] font-semibold">{fmt(Number(p.netPay))}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Salary Advances Table */}
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2A2A2A]">
            <h3 className="text-sm font-semibold text-gray-400">Salary Advances</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-[#2A2A2A]">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Employee</th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">Amount</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Currency</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {advancesLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : advances.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No advances found.</td></tr>
              ) : advances.map((adv) => (
                <tr key={adv.id} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                  <td className="px-4 py-3 text-white font-mono text-xs">{adv.employeeId.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-right text-[#C9A84C]">{fmt(Number(adv.amount))}</td>
                  <td className="px-4 py-3 text-gray-400">{adv.currencyCode}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{adv.status}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(adv.requestedDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
