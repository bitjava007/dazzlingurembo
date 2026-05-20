'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  ShoppingCart,
  DollarSign,
  Truck,
  Factory,
  Shield,
  Building2,
  FileText,
  ClipboardList,
  UserCheck,
  BarChart3,
  Bell,
  Receipt,
  CreditCard,
  PackageCheck,
  Layers,
  Wrench,
  UserCog,
  MapPin,
  BookOpen,
  RefreshCw,
  Tag,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Platform',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Operations',
    items: [
      { href: '/crm/customers', label: 'CRM', icon: Users },
      { href: '/catalog/products', label: 'Catalog', icon: Package },
      { href: '/inventory/stock', label: 'Inventory', icon: Boxes },
    ],
  },
  {
    title: 'Sales',
    items: [
      { href: '/sales/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/sales/quotations', label: 'Quotations', icon: FileText },
      { href: '/sales/invoices', label: 'Invoices', icon: Receipt },
      { href: '/sales/payments', label: 'Payments', icon: CreditCard },
      { href: '/sales/receipts', label: 'Receipts', icon: Receipt },
      { href: '/sales/refunds', label: 'Refunds', icon: RefreshCw },
      { href: '/sales/returns', label: 'Returns', icon: PackageCheck },
      { href: '/sales/delivery-notes', label: 'Delivery Notes', icon: Truck },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/finance/journal', label: 'Journal', icon: BookOpen },
      { href: '/finance/expenses', label: 'Expenses', icon: DollarSign },
      { href: '/finance/expense-categories', label: 'Expense Categories', icon: Tag },
      { href: '/finance/cash-closures', label: 'Cash Closures', icon: DollarSign },
      { href: '/finance/reconciliations', label: 'Reconciliations', icon: RefreshCw },
      { href: '/finance/exchange-rates', label: 'Exchange Rates', icon: CreditCard },
    ],
  },
  {
    title: 'Procurement',
    items: [
      { href: '/procurement/suppliers', label: 'Suppliers', icon: ClipboardList },
      { href: '/procurement/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
      { href: '/procurement/goods-receipts', label: 'Goods Receipts', icon: PackageCheck },
      { href: '/procurement/supplier-invoices', label: 'Supplier Invoices', icon: Receipt },
      { href: '/procurement/supplier-payments', label: 'Supplier Payments', icon: CreditCard },
    ],
  },
  {
    title: 'Production',
    items: [
      { href: '/production/work-orders', label: 'Work Orders', icon: Factory },
      { href: '/production/stages', label: 'Stages', icon: Layers },
      { href: '/production/materials', label: 'Materials', icon: Wrench },
      { href: '/production/operators', label: 'Operators', icon: UserCog },
    ],
  },
  {
    title: 'Logistics',
    items: [
      { href: '/logistics/deliveries', label: 'Deliveries', icon: Truck },
      { href: '/logistics/pod', label: 'Proof of Delivery', icon: MapPin },
    ],
  },
  {
    title: 'People',
    items: [
      { href: '/hr/employees', label: 'Employees', icon: UserCheck },
      { href: '/hr/departments', label: 'Departments', icon: Building2 },
      { href: '/hr/attendance', label: 'Attendance', icon: LayoutDashboard },
      { href: '/hr/payroll', label: 'Payroll', icon: DollarSign },
      { href: '/hr/salary-advances', label: 'Salary Advances', icon: CreditCard },
    ],
  },
  {
    title: 'Admin',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/roles', label: 'RBAC', icon: Shield },
      { href: '/admin/organization', label: 'Organization', icon: Building2 },
      { href: '/documents', label: 'Documents', icon: FileText },
      { href: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#111111] border-r border-[#2A2A2A] overflow-y-auto">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-[#2A2A2A]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-[#C9A84C]" />
          <span className="text-lg font-bold text-[#C9A84C] tracking-wider">DAZZLING UM</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'border-l-2 border-[#C9A84C] bg-[#1A1A1A] text-[#C9A84C] pl-[10px]'
                        : 'text-gray-400 hover:bg-[#1A1A1A] hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
