import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { StockMovementType } from '@prisma/client';

export interface QueryStockMovementsDto {
  warehouseId?: string;
  branchId?: string;
  productId?: string;
  variantId?: string;
  movementType?: StockMovementType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryStockMovementsDto) {
    const { page = 1, limit = 20, warehouseId, branchId, variantId, movementType, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (warehouseId) where['warehouseId'] = warehouseId;
    if (branchId) where['branchId'] = branchId;
    if (variantId) where['variantId'] = variantId;
    if (movementType) where['movementType'] = movementType;
    if (dateFrom || dateTo) {
      where['createdAt'] = {};
      if (dateFrom) (where['createdAt'] as Record<string, unknown>)['gte'] = new Date(dateFrom);
      if (dateTo) (where['createdAt'] as Record<string, unknown>)['lte'] = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        include: {
          variant: {
            select: { id: true, name: true, sku: true, product: { select: { id: true, name: true } } },
          },
          warehouse: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: CreateStockMovementDto, performedById?: string) {
    const movement = await this.prisma.stockMovement.create({
      data: {
        id: crypto.randomUUID(),
        movementType: dto.movementType,
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        branchId: dto.branchId,
        quantity: dto.quantity,
        quantityBefore: dto.quantityBefore,
        quantityAfter: dto.quantityAfter,
        unitCost: dto.unitCost ?? null,
        batchNumber: dto.batchNumber ?? null,
        serialNumber: dto.serialNumber ?? null,
        lotNumber: dto.lotNumber ?? null,
        referenceType: dto.referenceType ?? null,
        referenceId: dto.referenceId ?? null,
        notes: dto.notes ?? null,
        performedById: performedById ?? null,
      },
    });
    return { data: movement };
  }
}
