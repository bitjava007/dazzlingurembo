import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateDamagedStockDto } from './dto/create-damaged-stock.dto';

export interface QueryDamagedStockDto {
  warehouseId?: string;
  branchId?: string;
  variantId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class DamagedStockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryDamagedStockDto) {
    const { page = 1, limit = 20, warehouseId, branchId, variantId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (warehouseId) where['warehouseId'] = warehouseId;
    if (branchId) where['branchId'] = branchId;
    if (variantId) where['variantId'] = variantId;

    const [data, total] = await Promise.all([
      this.prisma.damagedStock.findMany({
        where, skip, take: limit,
        include: {
          variant: { select: { id: true, name: true, sku: true, product: { select: { id: true, name: true } } } },
          warehouse: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.damagedStock.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: CreateDamagedStockDto, userId?: string) {
    const record = await this.prisma.damagedStock.create({
      data: {
        id: crypto.randomUUID(),
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        branchId: dto.branchId,
        quantity: dto.quantity,
        reason: dto.reason,
        description: dto.description ?? null,
        estimatedLoss: dto.estimatedLoss ?? null,
        currencyCode: dto.currencyCode ?? null,
        disposalMethod: dto.disposalMethod ?? null,
        reportedById: userId ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'damagedStock', entityId: record.id });
    return { data: record };
  }

  async resolve(id: string, userId: string) {
    const record = await this.prisma.damagedStock.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Damaged stock record ${id} not found`);
    const updated = await this.prisma.damagedStock.update({
      where: { id },
      data: { disposedAt: new Date(), approvedById: userId },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'damagedStock', entityId: id, description: 'Resolved damaged stock' });
    return { data: updated };
  }
}
