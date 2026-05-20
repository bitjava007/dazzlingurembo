import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

export interface QueryExpensesDto {
  branchId?: string;
  categoryId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryExpensesDto) {
    const { page = 1, limit = 20, branchId, categoryId, status, search } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (branchId) where['branchId'] = branchId;
    if (categoryId) where['categoryId'] = categoryId;
    if (status) where['status'] = status;
    if (search) {
      where['OR'] = [
        { expenseNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        where, skip, take: limit,
        include: {
          category: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { expenseDate: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: true,
        branch: true,
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!expense) throw new NotFoundException(`Expense ${id} not found`);
    return { data: expense };
  }

  async create(dto: CreateExpenseDto, userId?: string) {
    const expenseNumber = `EXP-${Date.now()}`;
    const expense = await this.prisma.expense.create({
      data: {
        id: crypto.randomUUID(),
        expenseNumber,
        categoryId: dto.categoryId,
        branchId: dto.branchId,
        description: dto.description,
        vendor: dto.vendor ?? null,
        originalCurrencyCode: dto.originalCurrencyCode,
        originalAmount: dto.originalAmount,
        convertedCurrencyCode: dto.convertedCurrencyCode ?? null,
        convertedAmount: dto.convertedAmount ?? null,
        exchangeRateSnapshot: dto.exchangeRateSnapshot ?? null,
        taxAmount: 0,
        expenseDate: new Date(dto.expenseDate),
        receiptUrl: dto.receiptUrl ?? null,
        isRecurring: dto.isRecurring ?? false,
        notes: dto.notes ?? null,
        createdById: userId ?? null,
        status: 'DRAFT',
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'expense', entityId: expense.id });
    return { data: expense };
  }

  async approve(id: string, userId?: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id, deletedAt: null } });
    if (!expense) throw new NotFoundException(`Expense ${id} not found`);
    if (!['DRAFT', 'SUBMITTED'].includes(expense.status)) {
      throw new BadRequestException('Only DRAFT or SUBMITTED expenses can be approved');
    }
    const updated = await this.prisma.expense.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: userId ?? null, approvedAt: new Date() },
    });
    await this.audit.log({ userId, action: 'APPROVE', entityType: 'expense', entityId: id });
    return { data: updated };
  }

  async reject(id: string, userId?: string, reason?: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id, deletedAt: null } });
    if (!expense) throw new NotFoundException(`Expense ${id} not found`);
    if (!['DRAFT', 'SUBMITTED'].includes(expense.status)) {
      throw new BadRequestException('Only DRAFT or SUBMITTED expenses can be rejected');
    }
    const updated = await this.prisma.expense.update({
      where: { id },
      data: { status: 'REJECTED', notes: reason ? `${expense.notes ?? ''} | Rejection reason: ${reason}` : expense.notes },
    });
    await this.audit.log({ userId, action: 'REJECT', entityType: 'expense', entityId: id });
    return { data: updated };
  }

  async submit(id: string, userId?: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id, deletedAt: null } });
    if (!expense) throw new NotFoundException(`Expense ${id} not found`);
    if (expense.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT expenses can be submitted');
    }
    const updated = await this.prisma.expense.update({
      where: { id },
      data: { status: 'SUBMITTED' },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'expense', entityId: id });
    return { data: updated };
  }

  async remove(id: string, userId?: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id, deletedAt: null } });
    if (!expense) throw new NotFoundException(`Expense ${id} not found`);
    await this.prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ userId, action: 'DELETE', entityType: 'expense', entityId: id });
    return { data: { success: true } };
  }
}
