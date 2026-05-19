import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateCashClosureDto } from './dto/create-cash-closure.dto';

export interface QueryCashClosuresDto {
  branchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class CashClosuresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryCashClosuresDto) {
    const { page = 1, limit = 20, branchId, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (branchId) where['branchId'] = branchId;
    if (status) where['status'] = status;

    const [data, total] = await Promise.all([
      this.prisma.dailyClosure.findMany({
        where, skip, take: limit,
        include: { branch: { select: { id: true, name: true, code: true } } },
        orderBy: { closureDate: 'desc' },
      }),
      this.prisma.dailyClosure.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const closure = await this.prisma.dailyClosure.findUnique({
      where: { id },
      include: { branch: true, reconciliation: true },
    });
    if (!closure) throw new NotFoundException(`Cash closure ${id} not found`);
    return { data: closure };
  }

  async findByBranchDate(branchId: string, date: string) {
    const closureDate = new Date(date);
    const closure = await this.prisma.dailyClosure.findUnique({
      where: { branchId_closureDate: { branchId, closureDate } },
      include: { branch: true, reconciliation: true },
    });
    if (!closure) throw new NotFoundException(`Cash closure not found for branch ${branchId} on ${date}`);
    return { data: closure };
  }

  async create(dto: CreateCashClosureDto, userId?: string) {
    const closureDate = new Date(dto.closureDate);
    const existing = await this.prisma.dailyClosure.findUnique({
      where: { branchId_closureDate: { branchId: dto.branchId, closureDate } },
    });
    if (existing) throw new BadRequestException(`Cash closure already exists for this branch and date`);

    const cashVariance = dto.cashInDrawer != null && dto.expectedCash != null
      ? dto.cashInDrawer - dto.expectedCash
      : null;

    const closure = await this.prisma.dailyClosure.create({
      data: {
        id: crypto.randomUUID(),
        branchId: dto.branchId,
        closureDate,
        totalSales: dto.totalSales,
        totalRefunds: dto.totalRefunds ?? 0,
        totalExpenses: dto.totalExpenses ?? 0,
        netRevenue: dto.netRevenue,
        cashInDrawer: dto.cashInDrawer ?? null,
        expectedCash: dto.expectedCash ?? null,
        cashVariance,
        currencyCode: dto.currencyCode,
        notes: dto.notes ?? null,
        status: 'OPEN',
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'daily_closure', entityId: closure.id });
    return { data: closure };
  }

  async close(id: string, userId?: string) {
    const closure = await this.prisma.dailyClosure.findUnique({ where: { id } });
    if (!closure) throw new NotFoundException(`Cash closure ${id} not found`);
    if (closure.status !== 'OPEN') throw new BadRequestException('Only OPEN closures can be closed');
    const updated = await this.prisma.dailyClosure.update({
      where: { id },
      data: { status: 'CLOSED', closedById: userId ?? null, closedAt: new Date() },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'daily_closure', entityId: id, description: 'Closed cash closure' });
    return { data: updated };
  }
}
