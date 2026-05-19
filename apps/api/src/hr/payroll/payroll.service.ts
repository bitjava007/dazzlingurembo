import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';

interface QueryPayrollDto {
  employeeId?: string;
  period?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryPayrollDto) {
    const { page = 1, limit = 20, employeeId, period, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (employeeId) where['employeeId'] = employeeId;
    if (status) where['status'] = status;
    if (period) {
      // period is YYYY-MM
      const [year, month] = period.split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      where['periodStartDate'] = { gte: start };
      where['periodEndDate'] = { lte: end };
    }

    const [data, total] = await Promise.all([
      this.prisma.payroll.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payroll.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });
    if (!payroll) throw new NotFoundException(`Payroll ${id} not found`);
    return { data: payroll };
  }

  async create(dto: CreatePayrollDto, userId?: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException(`Employee ${dto.employeeId} not found`);

    const [year, month] = dto.period.split('-').map(Number);
    const periodStartDate = new Date(year, month - 1, 1);
    const periodEndDate = new Date(year, month, 0);

    const payrollNumber = `PAY-${dto.period}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
    const grossPay = dto.baseSalary + (dto.allowances ?? 0);
    const netPay = dto.netSalary;

    const payroll = await this.prisma.payroll.create({
      data: {
        id: crypto.randomUUID(),
        payrollNumber,
        employeeId: dto.employeeId,
        periodStartDate,
        periodEndDate,
        baseSalary: dto.baseSalary,
        allowances: dto.allowances ?? 0,
        deductions: dto.deductions ?? 0,
        grossPay,
        netPay,
        currencyCode: dto.currencyCode,
        paymentMethod: dto.paymentMethod as any,
        paidAt: dto.paymentDate ? new Date(dto.paymentDate) : null,
        notes: dto.notes ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'payroll', entityId: payroll.id });
    return { data: payroll };
  }

  async approve(id: string, userId?: string) {
    const payroll = await this.prisma.payroll.findUnique({ where: { id } });
    if (!payroll) throw new NotFoundException(`Payroll ${id} not found`);
    if (payroll.status !== 'DRAFT' && payroll.status !== 'PROCESSING') {
      throw new BadRequestException(`Payroll is already ${payroll.status}`);
    }
    const updated = await this.prisma.payroll.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: userId ?? null },
    });
    await this.audit.log({ userId, action: 'APPROVE', entityType: 'payroll', entityId: id });
    return { data: updated };
  }

  async pay(id: string, userId?: string) {
    const payroll = await this.prisma.payroll.findUnique({ where: { id } });
    if (!payroll) throw new NotFoundException(`Payroll ${id} not found`);
    if (payroll.status !== 'APPROVED') {
      throw new BadRequestException('Payroll must be approved before marking as paid');
    }
    const updated = await this.prisma.payroll.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'payroll', entityId: id, description: 'Marked as paid' });
    return { data: updated };
  }

  async getEmployeeSummary(employeeId: string) {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const paidPayrolls = await this.prisma.payroll.findMany({
      where: {
        employeeId,
        status: 'PAID',
        periodStartDate: { gte: startOfYear },
      },
      orderBy: { periodStartDate: 'desc' },
    });
    const totalPaidYTD = paidPayrolls.reduce((sum, p) => sum + Number(p.netPay), 0);
    return {
      data: {
        employeeId,
        year: currentYear,
        totalPaidYTD,
        payrollCount: paidPayrolls.length,
        payrolls: paidPayrolls,
      },
    };
  }
}
