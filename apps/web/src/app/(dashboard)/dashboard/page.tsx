'use client';

import { Users, ShoppingCart, AlertTriangle, Package, Truck } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { StatsChart } from '@/components/dashboard/stats-chart';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useList } from '@/hooks/use-api';
import type { Order, StockBalance } from '@/types';

const salesData = [
  { label: 'Mon', value: 45 },
  { label: 'Tue', value: 62 },
  { label: 'Wed', value: 38 },
  { label: 'Thu', value: 71 },
  { label: 'Fri', value: 89 },
  { label: 'Sat', value: 55 },
  { label: 'Sun', value: 30 },
];

export default function DashboardPage() {
  const { data: ordersData, isLoading: ordersLoading } = useList<Order>(
    ['orders', 'recent'],
    '/orders',
    { limit: 5, page: 1 },
  );

  const { data: stockData, isLoading: stockLoading } = useList<StockBalance>(
    ['stock', 'low'],
    '/inventory/stock',
    { limit: 5, lowStock: true },
  );

  const orderColumns = [
    { header: 'Order #', accessor: 'number' as keyof Order },
    {
      header: 'Customer',
      render: (row: Order) => row.customer ? `${row.customer.firstName} ${row.customer.lastName}` : '—',
    },
    {
      header: 'Status',
      render: (row: Order) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Total',
      render: (row: Order) => `$${row.totalAmount.toFixed(2)}`,
    },
  ];

  const stockColumns = [
    {
      header: 'Product',
      render: (row: StockBalance) => row.variant?.name ?? '—',
    },
    {
      header: 'SKU',
      render: (row: StockBalance) => row.variant?.sku ?? '—',
    },
    {
      header: 'Available',
      render: (row: StockBalance) => (
        <span className="text-red-400 font-medium">{row.availableQuantity}</span>
      ),
    },
    {
      header: 'Reorder Point',
      render: (row: StockBalance) => row.reorderPoint ?? '—',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Executive Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back. Here is what is happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Customers"
          value="2,847"
          icon={Users}
          trend="up"
          trendValue="+12% this month"
        />
        <KpiCard
          title="Today's Sales"
          value="$18,432"
          icon={ShoppingCart}
          trend="up"
          trendValue="+8.2% vs yesterday"
        />
        <KpiCard
          title="Pending Orders"
          value="143"
          icon={Package}
          trend="down"
          trendValue="-5 from yesterday"
        />
        <KpiCard
          title="Low Stock Items"
          value="28"
          icon={AlertTriangle}
          trend="down"
          trendValue="Needs attention"
          subtitle="Below reorder point"
        />
      </div>

      {/* Chart + Delivery Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <StatsChart data={salesData} title="Sales — Last 7 Days" />
        </div>
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Delivery Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: 34, color: 'text-yellow-400' },
              { label: 'Dispatched', value: 67, color: 'text-blue-400' },
              { label: 'Delivered', value: 142, color: 'text-green-400' },
              { label: 'Failed', value: 8, color: 'text-red-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#C9A84C]" />
              <span className="text-sm text-gray-400">Total dispatched: <span className="text-white font-medium">251</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Financial Overview */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Branch Financial Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { branch: 'Main Branch', revenue: '$84,200', expenses: '$31,400', profit: '$52,800' },
            { branch: 'North Branch', revenue: '$42,100', expenses: '$18,600', profit: '$23,500' },
            { branch: 'East Branch', revenue: '$29,700', expenses: '$14,200', profit: '$15,500' },
          ].map((item) => (
            <div key={item.branch} className="bg-[#1A1A1A] rounded-md p-4 border border-[#2A2A2A]">
              <p className="text-sm font-medium text-white mb-2">{item.branch}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Revenue</span>
                  <span className="text-green-400">{item.revenue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expenses</span>
                  <span className="text-red-400">{item.expenses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Profit</span>
                  <span className="text-[#C9A84C] font-bold">{item.profit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Orders</h3>
          <DataTable
            columns={orderColumns}
            data={ordersData?.data ?? []}
            loading={ordersLoading}
            emptyMessage="No recent orders"
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Stock Alerts</h3>
          <DataTable
            columns={stockColumns}
            data={stockData?.data ?? []}
            loading={stockLoading}
            emptyMessage="No low stock items"
          />
        </div>
      </div>
    </div>
  );
}
