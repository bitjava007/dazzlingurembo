import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';

export interface QueryStockTransfersDto {
  fromWarehouseId?: string;
  toWarehouseId?: string;
  fromBranchId?: string;
  toBranchId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class StockTransfersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryStockTransfersDto) {
    const { page = 1, limit = 20, fromWarehouseId, toWarehouseId, fromBranchId, toBranchId, status, search } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (fromWarehouseId) where['fromWarehouseId'] = fromWarehouseId;
    if (toWarehouseId) where['toWarehouseId'] = toWarehouseId;
    if (fromBranchId) where['fromBranchId'] = fromBranchId;
    if (toBranchId) where['toBranchId'] = toBranchId;
    if (status) where['status'] = status;
    if (search) {
      where['OR'] = [
        { transferNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.stockTransfer.findMany({
        where,
        skip,
        take: limit,
        include: {
          fromWarehouse: { select: { id: true, name: true, code: true } },
          toWarehouse: { select: { id: true, name: true, code: true } },
          fromBranch: { select: { id: true, name: true, code: true } },
          toBranch: { select: { id: true, name: true, code: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockTransfer.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const transfer = await this.prisma.stockTransfer.findUnique({
      where: { id, deletedAt: null },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        fromBranch: true,
        toBranch: true,
        items: {
          include: {
            variant: { select: { id: true, name: true, sku: true, product: { select: { id: true, name: true } } } },
          },
        },
      },
    });
    if (!transfer) throw new NotFoundException(`Stock transfer ${id} not found`);
    return { data: transfer };
  }

  async create(dto: CreateStockTransferDto, userId?: string) {
    const transferNumber = `TRF-${Date.now()}`;
    const transfer = await this.prisma.stockTransfer.create({
      data: {
        id: crypto.randomUUID(),
        transferNumber,
        fromWarehouseId: dto.fromWarehouseId,
        toWarehouseId: dto.toWarehouseId,
        fromBranchId: dto.fromBranchId,
        toBranchId: dto.toBranchId,
        status: 'DRAFT',
        requestedById: userId ?? null,
        notes: dto.notes ?? null,
        trackingNumber: dto.trackingNumber ?? null,
        items: {
          create: dto.items.map(item => ({
            id: crypto.randomUUID(),
            variantId: item.variantId,
            quantityRequested: item.quantityRequested,
            quantityShipped: 0,
            quantityReceived: 0,
            notes: item.notes ?? null,
          })),
        },
      },
      include: { items: true },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'stockTransfer', entityId: transfer.id });
    return { data: transfer };
  }

  async approve(id: string, userId: string) {
    const transfer = await this.prisma.stockTransfer.findUnique({ where: { id, deletedAt: null } });
    if (!transfer) throw new NotFoundException(`Stock transfer ${id} not found`);
    if (transfer.status !== 'DRAFT') throw new BadRequestException('Only DRAFT transfers can be approved');
    const updated = await this.prisma.stockTransfer.update({
      where: { id },
      data: { status: 'IN_TRANSIT', approvedById: userId, shippedAt: new Date() },
    });
    await this.audit.log({ userId, action: 'APPROVE', entityType: 'stockTransfer', entityId: id });
    return { data: updated };
  }

  async receive(id: string, userId: string) {
    const transfer = await this.prisma.stockTransfer.findUnique({ where: { id, deletedAt: null } });
    if (!transfer) throw new NotFoundException(`Stock transfer ${id} not found`);
    if (transfer.status !== 'IN_TRANSIT') throw new BadRequestException('Only IN_TRANSIT transfers can be received');
    const updated = await this.prisma.stockTransfer.update({
      where: { id },
      data: { status: 'RECEIVED', receivedAt: new Date() },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'stockTransfer', entityId: id, description: 'Received transfer' });
    return { data: updated };
  }

  async cancel(id: string, userId?: string) {
    const transfer = await this.prisma.stockTransfer.findUnique({ where: { id, deletedAt: null } });
    if (!transfer) throw new NotFoundException(`Stock transfer ${id} not found`);
    if (transfer.status === 'RECEIVED') throw new BadRequestException('Received transfers cannot be cancelled');
    const updated = await this.prisma.stockTransfer.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'stockTransfer', entityId: id, description: 'Cancelled transfer' });
    return { data: updated };
  }
}
