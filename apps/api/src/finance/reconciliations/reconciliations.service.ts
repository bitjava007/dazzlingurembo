import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateReconciliationDto } from './dto/create-reconciliation.dto';

export interface QueryReconciliationsDto {
  branchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ReconciliationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryReconciliationsDto) {
    const { page = 1, limit = 20, branchId, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (branchId) where['branchId'] = branchId;
    if (status) where['status'] = status;

    const [data, total] = await Promise.all([
      this.prisma.reconciliation.findMany({
        where, skip, take: limit,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          dailyClosure: { select: { id: true, closureDate: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reconciliation.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const rec = await this.prisma.reconciliation.findUnique({
      where: { id },
      include: { branch: true, dailyClosure: true },
    });
    if (!rec) throw new NotFoundException(`Reconciliation ${id} not found`);
    return { data: rec };
  }

  async create(dto: CreateReconciliationDto, userId?: string) {
    const existing = await this.prisma.reconciliation.findUnique({
      where: { dailyClosureId: dto.dailyClosureId },
    });
    if (existing) throw new BadRequestException('Reconciliation already exists for this daily closure');

    const rec = await this.prisma.reconciliation.create({
      data: {
        id: crypto.randomUUID(),
        dailyClosureId: dto.dailyClosureId,
        branchId: dto.branchId,
        discrepancyAmount: dto.discrepancyAmount ?? null,
        discrepancyNotes: dto.discrepancyNotes ?? null,
        notes: dto.notes ?? null,
        status: 'OPEN',
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'reconciliation', entityId: rec.id });
    return { data: rec };
  }

  async approve(id: string, userId?: string) {
    const rec = await this.prisma.reconciliation.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException(`Reconciliation ${id} not found`);
    if (!['OPEN', 'IN_PROGRESS'].includes(rec.status)) {
      throw new BadRequestException('Only OPEN or IN_PROGRESS reconciliations can be approved');
    }
    const updated = await this.prisma.reconciliation.update({
      where: { id },
      data: { status: 'RECONCILED', reconciledById: userId ?? null, reconciledAt: new Date() },
    });
    await this.audit.log({ userId, action: 'APPROVE', entityType: 'reconciliation', entityId: id });
    return { data: updated };
  }
}
