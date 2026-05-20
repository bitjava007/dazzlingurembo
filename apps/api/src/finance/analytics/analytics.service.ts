import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(from: string, to: string) {
    const dateFrom = new Date(from);
    const dateTo = new Date(to);

    const [revenueAgg, expensesAgg, payrollAgg, advancesAgg] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { deletedAt: null, createdAt: { gte: dateFrom, lte: dateTo } },
        _sum: { paidAmount: true },
      }),
      this.prisma.expense.aggregate({
        where: { deletedAt: null, status: 'APPROVED', expenseDate: { gte: dateFrom, lte: dateTo } },
        _sum: { originalAmount: true },
      }),
      this.prisma.payroll.aggregate({
        where: { periodStartDate: { gte: dateFrom }, periodEndDate: { lte: dateTo } },
        _sum: { netPay: true },
      }),
      this.prisma.salaryAdvance.aggregate({
        where: {
          status: { in: ['APPROVED', 'DISBURSED'] },
          requestedAt: { gte: dateFrom, lte: dateTo },
        },
        _sum: { originalAmount: true },
      }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.paidAmount ?? 0);
    const totalExpenses = Number(expensesAgg._sum.originalAmount ?? 0);
    const grossProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const totalPayroll = Number(payrollAgg._sum.netPay ?? 0);
    const totalAdvances = Number(advancesAgg._sum.originalAmount ?? 0);

    return {
      totalRevenue,
      totalExpenses,
      grossProfit,
      margin,
      totalPayroll,
      totalAdvances,
      period: { from, to },
    };
  }

  async getProfitabilityByBranch(from: string, to: string) {
    const dateFrom = new Date(from);
    const dateTo = new Date(to);

    const branches = await this.prisma.branch.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true },
    });

    const [invoicesByBranch, expensesByBranch] = await Promise.all([
      this.prisma.invoice.groupBy({
        by: ['branchId'],
        where: { deletedAt: null, createdAt: { gte: dateFrom, lte: dateTo } },
        _sum: { paidAmount: true },
      }),
      this.prisma.expense.groupBy({
        by: ['branchId'],
        where: { deletedAt: null, status: 'APPROVED', expenseDate: { gte: dateFrom, lte: dateTo } },
        _sum: { originalAmount: true },
      }),
    ]);

    const revenueMap: Record<string, number> = {};
    for (const inv of invoicesByBranch) {
      revenueMap[inv.branchId] = Number(inv._sum.paidAmount ?? 0);
    }

    const expenseMap: Record<string, number> = {};
    for (const exp of expensesByBranch) {
      expenseMap[exp.branchId] = Number(exp._sum.originalAmount ?? 0);
    }

    return branches.map((b) => {
      const revenue = revenueMap[b.id] ?? 0;
      const expenses = expenseMap[b.id] ?? 0;
      const profit = revenue - expenses;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      return { branchId: b.id, branchName: b.name, revenue, expenses, profit, margin };
    });
  }

  async getProfitabilityByCustomer(from: string, to: string, limit = 10) {
    const dateFrom = new Date(from);
    const dateTo = new Date(to);

    const invoicesByCustomer = await this.prisma.invoice.groupBy({
      by: ['customerId'],
      where: {
        deletedAt: null,
        customerId: { not: null },
        createdAt: { gte: dateFrom, lte: dateTo },
      },
      _sum: { paidAmount: true },
      _count: { id: true },
      orderBy: { _sum: { paidAmount: 'desc' } },
      take: limit,
    });

    const customerIds = invoicesByCustomer.map((i) => i.customerId).filter(Boolean) as string[];
    const customers = await this.prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const customerMap: Record<string, string> = {};
    for (const c of customers) {
      customerMap[c.id] = `${c.firstName} ${c.lastName}`;
    }

    return invoicesByCustomer.map((i) => ({
      customerId: i.customerId,
      customerName: customerMap[i.customerId ?? ''] ?? 'Unknown',
      revenue: Number(i._sum.paidAmount ?? 0),
      ordersCount: i._count.id,
    }));
  }

  async getProfitabilityByPeriod(from: string, to: string, granularity: 'day' | 'month' = 'month') {
    const dateFrom = new Date(from);
    const dateTo = new Date(to);

    const invoices = await this.prisma.invoice.findMany({
      where: { deletedAt: null, createdAt: { gte: dateFrom, lte: dateTo } },
      select: { createdAt: true, paidAmount: true },
    });

    const expenses = await this.prisma.expense.findMany({
      where: { deletedAt: null, status: 'APPROVED', expenseDate: { gte: dateFrom, lte: dateTo } },
      select: { expenseDate: true, originalAmount: true },
    });

    const truncDate = (d: Date) => {
      if (granularity === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return d.toISOString().slice(0, 10);
    };

    const byPeriod: Record<string, { revenue: number; expenses: number }> = {};

    for (const inv of invoices) {
      const key = truncDate(inv.createdAt);
      if (!byPeriod[key]) byPeriod[key] = { revenue: 0, expenses: 0 };
      byPeriod[key].revenue += Number(inv.paidAmount);
    }

    for (const exp of expenses) {
      const key = truncDate(exp.expenseDate);
      if (!byPeriod[key]) byPeriod[key] = { revenue: 0, expenses: 0 };
      byPeriod[key].expenses += Number(exp.originalAmount);
    }

    return Object.entries(byPeriod)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, vals]) => ({
        period,
        revenue: vals.revenue,
        expenses: vals.expenses,
        profit: vals.revenue - vals.expenses,
      }));
  }

  async getEmployeeCosts(from: string, to: string) {
    const dateFrom = new Date(from);
    const dateTo = new Date(to);

    const [payrollRecords, advancesInPeriod] = await Promise.all([
      this.prisma.payroll.findMany({
        where: { periodStartDate: { gte: dateFrom }, periodEndDate: { lte: dateTo } },
        select: {
          id: true, employeeId: true, baseSalary: true, allowances: true,
          deductions: true, grossPay: true, netPay: true, status: true,
          periodStartDate: true, periodEndDate: true,
        },
      }),
      this.prisma.salaryAdvance.findMany({
        where: { requestedAt: { gte: dateFrom, lte: dateTo } },
        select: {
          id: true, employeeId: true, originalAmount: true,
          originalCurrencyCode: true, status: true, requestedAt: true,
        },
      }),
    ]);

    const payrollAgg = await this.prisma.payroll.aggregate({
      where: { periodStartDate: { gte: dateFrom }, periodEndDate: { lte: dateTo } },
      _sum: { baseSalary: true, allowances: true, deductions: true, grossPay: true, netPay: true },
    });

    const advancesDisbursedAgg = await this.prisma.salaryAdvance.aggregate({
      where: {
        status: 'DISBURSED',
        requestedAt: { gte: dateFrom, lte: dateTo },
      },
      _sum: { originalAmount: true },
    });

    const distinctEmployees = new Set(payrollRecords.map((p) => p.employeeId));

    return {
      summary: {
        totalBaseSalary: Number(payrollAgg._sum.baseSalary ?? 0),
        totalAllowances: Number(payrollAgg._sum.allowances ?? 0),
        totalDeductions: Number(payrollAgg._sum.deductions ?? 0),
        totalNetPay: Number(payrollAgg._sum.netPay ?? 0),
        totalGrossPay: Number(payrollAgg._sum.grossPay ?? 0),
        totalAdvancesDisbursed: Number(advancesDisbursedAgg._sum.originalAmount ?? 0),
        headcount: distinctEmployees.size,
      },
      payrollByEmployee: payrollRecords.map((p) => ({
        id: p.id,
        employeeId: p.employeeId,
        grossPay: Number(p.grossPay),
        netPay: Number(p.netPay),
        deductions: Number(p.deductions),
        baseSalary: Number(p.baseSalary),
        allowances: Number(p.allowances),
        status: p.status,
        periodStartDate: p.periodStartDate,
        periodEndDate: p.periodEndDate,
      })),
      advances: advancesInPeriod.map((a) => ({
        ...a,
        originalAmount: Number(a.originalAmount),
      })),
    };
  }

  async getProfitabilityByWorkshop(from: string, to: string) {
    const dateFrom = new Date(from);
    const dateTo = new Date(to);

    const workOrdersByWorkshop = await this.prisma.workOrder.groupBy({
      by: ['workshopId'],
      where: { deletedAt: null, createdAt: { gte: dateFrom, lte: dateTo } },
      _count: { id: true },
    });

    const workshopIds = workOrdersByWorkshop.map((w) => w.workshopId);
    const workshops = await this.prisma.workshop.findMany({
      where: { id: { in: workshopIds } },
      select: { id: true, name: true },
    });
    const workshopMap: Record<string, string> = {};
    for (const w of workshops) workshopMap[w.id] = w.name;

    const materialCostsByWorkshop = await this.prisma.materialConsumption.groupBy({
      by: ['workOrderId'],
      _sum: { unitCost: true },
    });

    const workOrdersInPeriod = await this.prisma.workOrder.findMany({
      where: { deletedAt: null, createdAt: { gte: dateFrom, lte: dateTo } },
      select: { id: true, workshopId: true },
    });
    const workOrderToWorkshop: Record<string, string> = {};
    for (const wo of workOrdersInPeriod) workOrderToWorkshop[wo.id] = wo.workshopId;

    const materialCostByWorkshop: Record<string, number> = {};
    for (const mc of materialCostsByWorkshop) {
      const workshopId = workOrderToWorkshop[mc.workOrderId];
      if (workshopId) {
        materialCostByWorkshop[workshopId] = (materialCostByWorkshop[workshopId] ?? 0) + Number(mc._sum.unitCost ?? 0);
      }
    }

    return workOrdersByWorkshop.map((w) => ({
      workshopId: w.workshopId,
      workshopName: workshopMap[w.workshopId] ?? 'Unknown',
      workOrderCount: w._count.id,
      materialCost: materialCostByWorkshop[w.workshopId] ?? 0,
    }));
  }
}
