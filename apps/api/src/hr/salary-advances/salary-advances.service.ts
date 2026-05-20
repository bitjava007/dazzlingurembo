import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateSalaryAdvanceDto } from './dto/create-salary-advance.dto';

interface QueryAdvanceDto {
  employeeId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class SalaryAdvancesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryAdvanceDto) {
    const { page = 1, limit = 20, employeeId, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (employeeId) where['employeeId'] = employeeId;
    if (status) where['status'] = status;

    const [data, total] = await Promise.all([
      this.prisma.salaryAdvance.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.salaryAdvance.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const advance = await this.prisma.salaryAdvance.findUnique({
      where: { id },
      include: {
        employee: true,
        branch: true,
      },
    });
    if (!advance) throw new NotFoundException(`Salary advance ${id} not found`);
    return { data: advance };
  }

  async create(dto: CreateSalaryAdvanceDto, userId?: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException(`Employee ${dto.employeeId} not found`);

    const advanceNumber = `ADV-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
    const advance = await this.prisma.salaryAdvance.create({
      data: {
        id: crypto.randomUUID(),
        advanceNumber,
        employeeId: dto.employeeId,
        branchId: employee.branchId ?? '',
        originalCurrencyCode: dto.originalCurrencyCode,
        originalAmount: dto.originalAmount,
        convertedCurrencyCode: dto.convertedCurrencyCode ?? null,
        convertedAmount: dto.convertedAmount ?? null,
        reason: dto.reason,
        status: 'PENDING',
        deductFromPayroll: dto.deductFromPayroll ?? true,
        installments: dto.installments ?? 1,
        notes: dto.notes ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'salary_advance', entityId: advance.id });
    return { data: advance };
  }

  async approve(id: string, userId?: string) {
    const advance = await this.prisma.salaryAdvance.findUnique({ where: { id } });
    if (!advance) throw new NotFoundException(`Salary advance ${id} not found`);
    if (advance.status !== 'PENDING') {
      throw new BadRequestException(`Salary advance is already ${advance.status}`);
    }
    const updated = await this.prisma.salaryAdvance.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedById: userId ?? null },
    });
    await this.audit.log({ userId, action: 'APPROVE', entityType: 'salary_advance', entityId: id });
    return { data: updated };
  }

  async reject(id: string, userId?: string, reason?: string) {
    const advance = await this.prisma.salaryAdvance.findUnique({ where: { id } });
    if (!advance) throw new NotFoundException(`Salary advance ${id} not found`);
    if (advance.status !== 'PENDING') {
      throw new BadRequestException(`Salary advance is already ${advance.status}`);
    }
    const updated = await this.prisma.salaryAdvance.update({
      where: { id },
      data: { status: 'CANCELLED', notes: reason ?? null },
    });
    await this.audit.log({ userId, action: 'REJECT', entityType: 'salary_advance', entityId: id, description: reason });
    return { data: updated };
  }

  async repay(id: string, userId?: string) {
    const advance = await this.prisma.salaryAdvance.findUnique({ where: { id } });
    if (!advance) throw new NotFoundException(`Salary advance ${id} not found`);
    if (advance.status !== 'APPROVED' && advance.status !== 'DISBURSED') {
      throw new BadRequestException('Salary advance must be approved or disbursed to repay');
    }
    const updated = await this.prisma.salaryAdvance.update({
      where: { id },
      data: { status: 'REPAID', repaidAt: new Date() },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'salary_advance', entityId: id, description: 'Repaid' });
    return { data: updated };
  }
}
