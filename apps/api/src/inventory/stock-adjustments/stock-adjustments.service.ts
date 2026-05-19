import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';

export interface QueryStockAdjustmentsDto {
  warehouseId?: string;
  branchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class StockAdjustmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryStockAdjustmentsDto) {
    const { page = 1, limit = 20, warehouseId, branchId, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (warehouseId) where['warehouseId'] = warehouseId;
    if (branchId) where['branchId'] = branchId;
    if (status) where['status'] = status;

    const [data, total] = await Promise.all([
      this.prisma.stockAdjustment.findMany({
        where, skip, take: limit,
        include: {
          warehouse: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockAdjustment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: CreateStockAdjustmentDto, userId?: string) {
    const adjustmentNumber = `ADJ-${Date.now()}`;
    const adjustment = await this.prisma.stockAdjustment.create({
      data: {
        id: crypto.randomUUID(),
        adjustmentNumber,
        warehouseId: dto.warehouseId,
        branchId: dto.branchId,
        reason: dto.reason,
        notes: dto.notes ?? null,
        status: 'DRAFT',
        requestedById: userId ?? null,
        items: {
          create: dto.items.map(item => ({
            id: crypto.randomUUID(),
            variantId: item.variantId,
            quantityBefore: item.quantityBefore,
            quantityAdjusted: item.quantityAdjusted,
            quantityAfter: item.quantityAfter,
            unitCost: item.unitCost ?? null,
            notes: item.notes ?? null,
          })),
        },
      },
      include: { items: true },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'stockAdjustment', entityId: adjustment.id });
    return { data: adjustment };
  }

  async approve(id: string, userId: string) {
    const adjustment = await this.prisma.stockAdjustment.findUnique({ where: { id } });
    if (!adjustment) throw new NotFoundException(`Stock adjustment ${id} not found`);
    if (!['DRAFT', 'PENDING_APPROVAL'].includes(adjustment.status)) {
      throw new BadRequestException('Adjustment must be in DRAFT or PENDING_APPROVAL status');
    }
    const updated = await this.prisma.stockAdjustment.update({
      where: { id },
      data: { status: 'APPLIED', approvedById: userId, appliedAt: new Date() },
    });
    await this.audit.log({ userId, action: 'APPROVE', entityType: 'stockAdjustment', entityId: id });
    return { data: updated };
  }

  async reject(id: string, userId: string, reason?: string) {
    const adjustment = await this.prisma.stockAdjustment.findUnique({ where: { id } });
    if (!adjustment) throw new NotFoundException(`Stock adjustment ${id} not found`);
    if (!['DRAFT', 'PENDING_APPROVAL'].includes(adjustment.status)) {
      throw new BadRequestException('Adjustment must be in DRAFT or PENDING_APPROVAL status');
    }
    const updated = await this.prisma.stockAdjustment.update({
      where: { id },
      data: { status: 'REJECTED', notes: reason ? `Rejected: ${reason}` : adjustment.notes },
    });
    await this.audit.log({ userId, action: 'REJECT', entityType: 'stockAdjustment', entityId: id });
    return { data: updated };
  }
}
