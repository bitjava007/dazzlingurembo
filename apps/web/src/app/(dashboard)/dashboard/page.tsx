'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingCart, AlertTriangle, Package, Truck, TrendingUp, DollarSign, Factory } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { StatsChart } from '@/components/dashboard/stats-chart';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import api from '@/lib/api';
import type { Order, StockBalance, Branch, Invoice, Expense } from '@/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

function buildSalesChart(orders: Order[]) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en', { weekday: 'short' });
    const value = orders
      .filter((o) => o.createdAt.slice(0, 10) === dateStr)
      .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
    return { label, value };
  });
}

// ─── component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // KPI: total customers
  const { data: customersData } = useQuery({
    queryKey: ['dashboard', 'customers'],
    queryFn: () => api.get('/crm/customers?limit=1').then((r) => r.data),
  });

  // KPI: pending orders count (DRAFT = not yet confirmed)
  const { data: pendingOrdersData } = useQuery({
    queryKey: ['dashboard', 'pending-orders'],
    queryFn: () => api.get('/sales/orders?status=DRAFT&limit=1').then((r) => r.data),
  });

  // KPI: active work orders
  const { data: workOrdersData } = useQuery({
    queryKey: ['dashboard', 'work-orders'],
    queryFn: () => api.get('/production/work-orders?status=IN_PROGRESS&limit=1').then((r) => r.data),
  });

  // KPI + stock alerts table: low stock items
  const { data: lowStockData, isLoading: lowStockLoading } = useQuery({
    queryKey: ['dashboard', 'low-stock'],
    queryFn: () => api.get('/inventory/stock-balances/low-stock').then((r) => r.data),
  });

  // Recent orders table + sales chart source
  const { data: recentOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['dashboard', 'recent-orders'],
    queryFn: () => api.get('/sales/orders?limit=100').then((r) => r.data),
  });

  // Delivery counts by status
  const { data: deliveryPending } = useQuery({
    queryKey: ['dashboard', 'delivery-pending'],
    queryFn: () => api.get('/logistics/deliveries?status=PENDING&limit=1').then((r) => r.data),
  });
  const { data: deliveryDispatched } = useQuery({
    queryKey: ['dashboard', 'delivery-dispatched'],
    queryFn: () => api.get('/logistics/deliveries?status=DISPATCHED&limit=1').then((r) => r.data),
  });
  const { data: deliveryDelivered } = useQuery({
    queryKey: ['dashboard', 'delivery-delivered'],
    queryFn: () => api.get('/logistics/deliveries?status=DELIVERED&limit=1').then((r) => r.data),
  });
  const { data: deliveryFailed } = useQuery({
    queryKey: ['dashboard', 'delivery-failed'],
    queryFn: () => api.get('/logistics/deliveries?status=FAILED&limit=1').then((r) => r.data),
  });

  // Branch overview: branches + invoices + expenses (client-side grouping)
  const { data: branchesData } = useQuery({
    queryKey: ['dashboard', 'branches'],
    queryFn: () => api.get('/organization/branches?limit=6').then((r) => r.data),
  });
  const { data: invoicesData } = useQuery({
    queryKey: ['dashboard', 'invoices'],
    queryFn: () => api.get('/sales/invoices?limit=200').then((r) => r.data),
  });
  const { data: expensesData } = useQuery({
    queryKey: ['dashboard', 'expenses'],
    queryFn: () => api.get('/finance/expenses?status=APPROVED&limit=200').then((r) => r.data),
  });

  // ── derived values ──────────────────────────────────────────────────────────

  const totalCustomers: number = customersData?.meta?.total ?? 0;
  const pendingOrdersCount: number = pendingOrdersData?.meta?.total ?? 0;
  const activeWorkOrders: number = workOrdersData?.meta?.total ?? 0;
  const lowStockItems: StockBalance[] = lowStockData?.data ?? [];
  const lowStockCount: number = lowStockItems.length;

  const allOrders: Order[] = recentOrdersData?.data ?? [];
  const recentOrders: Order[] = allOrders.slice(0, 5);

  const salesChartData = useMemo(() => buildSalesChart(allOrders), [allOrders]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySales = useMemo(
    () => allOrders.filter((o) => o.createdAt.slice(0, 10) === todayStr).reduce((s, o) => s + (o.totalAmount ?? 0), 0),
    [allOrders, todayStr],
  );

  const deliverySummary = [
    { label: 'Pending', value: deliveryPending?.meta?.total ?? 0, color: 'text-yellow-400' },
    { label: 'Dispatched', value: deliveryDispatched?.meta?.total ?? 0, color: 'text-blue-400' },
    { label: 'Delivered', value: deliveryDelivered?.meta?.total ?? 0, color: 'text-green-400' },
    { label: 'Failed', value: deliveryFailed?.meta?.total ?? 0, color: 'text-red-400' },
  ];
  const totalDispatched =
    (deliveryPending?.meta?.total ?? 0) +
    (deliveryDispatched?.meta?.total ?? 0) +
    (deliveryDelivered?.meta?.total ?? 0) +
    (deliveryFailed?.meta?.total ?? 0);

  const branches: Branch[] = branchesData?.data ?? [];
  const invoices: Invoice[] = invoicesData?.data ?? [];
  const expenses: Expense[] = expensesData?.data ?? [];

  const branchStats = useMemo(() =>
    branches.map((b) => {
      const revenue = invoices.filter((i) => i.branchId === b.id).reduce((s, i) => s + (i.paidAmount ?? 0), 0);
      const cost = expenses.filter((e) => e.branchId === b.id).reduce((s, e) => s + (e.originalAmount ?? 0), 0);
      return { branch: b.name, revenue, expenses: cost, profit: revenue - cost };
    }),
    [branches, invoices, expenses],
  );

  // ── table columns ───────────────────────────────────────────────────────────

  const orderColumns = [
    { header: 'Order #', accessor: 'orderNumber' as keyof Order },
    {
      header: 'Customer',
      render: (row: Order) => row.customer ? `${row.customer.firstName} ${row.customer.lastName}` : '—',
    },
    { header: 'Status', render: (row: Order) => <StatusBadge status={row.status} /> },
    { header: 'Total', render: (row: Order) => `${fmtCurrency(row.totalAmount)} XOF` },
  ];

  const stockColumns = [
    { header: 'Product', render: (row: StockBalance) => row.variant?.name ?? '—' },
    { header: 'SKU', render: (row: StockBalance) => row.variant?.sku ?? '—' },
    {
      header: 'Available',
      render: (row: StockBalance) => (
        <span className="text-red-400 font-medium">{row.quantityAvailable}</span>
      ),
    },
    { header: 'Reorder Point', render: (row: StockBalance) => row.product?.reorderPoint ?? '—' },
  ];

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Executive Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Live business overview — {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Customers"
          value={totalCustomers.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue="All time"
        />
        <KpiCard
          title="Today's Revenue"
          value={`${fmtCurrency(todaySales)} XOF`}
          icon={DollarSign}
          trend={todaySales > 0 ? 'up' : 'neutral'}
          trendValue="From today's orders"
        />
        <KpiCard
          title="Pending Orders"
          value={pendingOrdersCount.toLocaleString()}
          icon={ShoppingCart}
          trend={pendingOrdersCount > 0 ? 'down' : 'neutral'}
          trendValue="Awaiting confirmation"
        />
        <KpiCard
          title="Low Stock Items"
          value={lowStockCount.toString()}
          icon={AlertTriangle}
          trend={lowStockCount > 0 ? 'down' : 'neutral'}
          trendValue="Below reorder point"
          subtitle="Needs attention"
        />
      </div>

      {/* Second KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Work Orders"
          value={activeWorkOrders.toLocaleString()}
          icon={Factory}
          trend="neutral"
          trendValue="In production"
        />
        <KpiCard
          title="Deliveries Dispatched"
          value={(deliveryDispatched?.meta?.total ?? 0).toLocaleString()}
          icon={Truck}
          trend="neutral"
          trendValue="Currently in transit"
        />
        <KpiCard
          title="Delivered Today"
          value={(deliveryDelivered?.meta?.total ?? 0).toLocaleString()}
          icon={TrendingUp}
          trend="up"
          trendValue="Completed deliveries"
        />
        <KpiCard
          title="Total Orders (7d)"
          value={allOrders.filter((o) => {
            const d = new Date(); d.setDate(d.getDate() - 7);
            return new Date(o.createdAt) >= d;
          }).length.toLocaleString()}
          icon={Package}
          trend="up"
          trendValue="Last 7 days"
        />
      </div>

      {/* Chart + Delivery Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <StatsChart data={salesChartData} title="Sales Revenue — Last 7 Days (XOF)" type="line" color="#C9A84C" formatValue={(v) => fmtCurrency(v)} />
        </div>
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Delivery Summary</h3>
          <div className="space-y-3">
            {deliverySummary.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#C9A84C]" />
              <span className="text-sm text-gray-400">
                Total: <span className="text-white font-medium">{totalDispatched.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Financial Overview */}
      {branchStats.length > 0 && (
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Branch Financial Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {branchStats.map((item) => (
              <div key={item.branch} className="bg-[#1A1A1A] rounded-md p-4 border border-[#2A2A2A]">
                <p className="text-sm font-medium text-white mb-2 truncate">{item.branch}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Revenue</span>
                    <span className="text-green-400">{fmtCurrency(item.revenue)} XOF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expenses</span>
                    <span className="text-red-400">{fmtCurrency(item.expenses)} XOF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Net</span>
                    <span className={item.profit >= 0 ? 'text-[#C9A84C] font-bold' : 'text-red-400 font-bold'}>
                      {fmtCurrency(item.profit)} XOF
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Orders</h3>
          <DataTable
            columns={orderColumns}
            data={recentOrders}
            loading={ordersLoading}
            emptyMessage="No recent orders"
            keyExtractor={(r) => r.id}
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Stock Alerts</h3>
          <DataTable
            columns={stockColumns}
            data={lowStockItems.slice(0, 5)}
            loading={lowStockLoading}
            emptyMessage="No low stock items"
            keyExtractor={(r) => r.id}
          />
        </div>
      </div>
    </div>
  );
}
