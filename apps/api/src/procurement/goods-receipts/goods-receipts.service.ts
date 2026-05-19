import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';

export interface QueryGoodsReceiptsDto {
  purchaseOrderId?: string;
  branchId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class GoodsReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryGoodsReceiptsDto) {
    const { page = 1, limit = 20, purchaseOrderId, branchId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (purchaseOrderId) where['purchaseOrderId'] = purchaseOrderId;
    if (branchId) where['branchId'] = branchId;

    const [data, total] = await Promise.all([
      this.prisma.goodsReceipt.findMany({
        where, skip, take: limit,
        include: {
          purchaseOrder: { select: { id: true, poNumber: true, supplier: { select: { id: true, name: true } } } },
          branch: { select: { id: true, name: true, code: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.goodsReceipt.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const gr = await this.prisma.goodsReceipt.findUnique({
      where: { id },
      include: {
        purchaseOrder: { include: { supplier: true } },
        warehouse: true,
        branch: true,
        items: {
          include: { variant: { select: { id: true, name: true, sku: true } } },
        },
      },
    });
    if (!gr) throw new NotFoundException(`Goods receipt ${id} not found`);
    return { data: gr };
  }

  async create(dto: CreateGoodsReceiptDto, userId?: string) {
    const receiptNumber = `GR-${Date.now()}`;
    const gr = await this.prisma.goodsReceipt.create({
      data: {
        id: crypto.randomUUID(),
        receiptNumber,
        purchaseOrderId: dto.purchaseOrderId,
        warehouseId: dto.warehouseId,
        branchId: dto.branchId,
        receivedById: userId ?? null,
        receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : new Date(),
        notes: dto.notes ?? null,
        qualityCheckStatus: dto.qualityCheckStatus ?? null,
        qualityNotes: dto.qualityNotes ?? null,
        items: {
          create: dto.items.map(item => ({
            id: crypto.randomUUID(),
            purchaseOrderItemId: item.purchaseOrderItemId ?? null,
            variantId: item.variantId ?? null,
            description: item.description,
            sku: item.sku ?? null,
            quantityExpected: item.quantityExpected ?? null,
            quantityReceived: item.quantityReceived,
            quantityRejected: item.quantityRejected ?? 0,
            condition: item.condition ?? null,
            notes: item.notes ?? null,
          })),
        },
      },
      include: { items: true },
    });

    // Update PO status to PARTIALLY_RECEIVED
    await this.prisma.purchaseOrder.update({
      where: { id: dto.purchaseOrderId },
      data: { status: 'PARTIALLY_RECEIVED' },
    });

    await this.audit.log({ userId, action: 'CREATE', entityType: 'goods_receipt', entityId: gr.id });
    return { data: gr };
  }
}
