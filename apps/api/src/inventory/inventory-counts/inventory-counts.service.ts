import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateInventoryCountDto, InventoryCountItemDto } from './dto/create-inventory-count.dto';

export interface QueryInventoryCountsDto {
  warehouseId?: string;
  branchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class InventoryCountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryInventoryCountsDto) {
    const { page = 1, limit = 20, warehouseId, branchId, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (warehouseId) where['warehouseId'] = warehouseId;
    if (branchId) where['branchId'] = branchId;
    if (status) where['status'] = status;

    const [data, total] = await Promise.all([
      this.prisma.inventoryCount.findMany({
        where, skip, take: limit,
        include: {
          warehouse: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryCount.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const count = await this.prisma.inventoryCount.findUnique({
      where: { id },
      include: {
        warehouse: true,
        branch: true,
        items: {
          include: {
            variant: { select: { id: true, name: true, sku: true, product: { select: { id: true, name: true } } } },
          },
        },
      },
    });
    if (!count) throw new NotFoundException(`Inventory count ${id} not found`);
    return { data: count };
  }

  async create(dto: CreateInventoryCountDto, userId?: string) {
    const countNumber = `CNT-${Date.now()}`;
    const inventoryCount = await this.prisma.inventoryCount.create({
      data: {
        id: crypto.randomUUID(),
        countNumber,
        warehouseId: dto.warehouseId,
        branchId: dto.branchId,
        status: 'DRAFT',
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        notes: dto.notes ?? null,
        performedById: userId ?? null,
        items: dto.items ? {
          create: dto.items.map(item => ({
            id: crypto.randomUUID(),
            variantId: item.variantId,
            expectedQuantity: item.expectedQuantity,
            countedQuantity: item.countedQuantity,
            variance: item.countedQuantity - item.expectedQuantity,
            notes: item.notes ?? null,
          })),
        } : undefined,
      },
      include: { items: true },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'inventoryCount', entityId: inventoryCount.id });
    return { data: inventoryCount };
  }

  async submitResults(id: string, items: InventoryCountItemDto[], userId?: string) {
    const count = await this.prisma.inventoryCount.findUnique({ where: { id } });
    if (!count) throw new NotFoundException(`Inventory count ${id} not found`);
    if (count.status === 'COMPLETED') throw new BadRequestException('Count already completed');

    // Delete existing items and recreate
    await this.prisma.inventoryCountItem.deleteMany({ where: { inventoryCountId: id } });
    await this.prisma.inventoryCountItem.createMany({
      data: items.map(item => ({
        id: crypto.randomUUID(),
        inventoryCountId: id,
        variantId: item.variantId,
        expectedQuantity: item.expectedQuantity,
        countedQuantity: item.countedQuantity,
        variance: item.countedQuantity - item.expectedQuantity,
        notes: item.notes ?? null,
      })),
    });

    const updated = await this.prisma.inventoryCount.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
      include: { items: true },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'inventoryCount', entityId: id, description: 'Submitted count results' });
    return { data: updated };
  }

  async applyCorrections(id: string, userId?: string) {
    const count = await this.prisma.inventoryCount.findUnique({
      where: { id },
      include: { items: { include: { variant: true } } },
    });
    if (!count) throw new NotFoundException(`Inventory count ${id} not found`);
    if (count.status !== 'COMPLETED') throw new BadRequestException('Count must be COMPLETED before applying corrections');

    // Create stock adjustments for variances
    const corrections = count.items.filter(item => item.variance !== 0);
    for (const item of corrections) {
      await this.prisma.stockMovement.create({
        data: {
          id: crypto.randomUUID(),
          movementType: item.variance > 0 ? 'ADJUSTMENT_POSITIVE' : 'ADJUSTMENT_NEGATIVE',
          variantId: item.variantId,
          warehouseId: count.warehouseId,
          branchId: count.branchId,
          quantity: Math.abs(item.variance),
          quantityBefore: item.expectedQuantity,
          quantityAfter: item.countedQuantity,
          referenceType: 'inventoryCount',
          referenceId: id,
          performedById: userId ?? null,
        },
      });
    }

    await this.audit.log({ userId, action: 'UPDATE', entityType: 'inventoryCount', entityId: id, description: 'Applied inventory corrections' });
    return { data: { correctionCount: corrections.length, message: `Applied ${corrections.length} corrections` } };
  }
}
