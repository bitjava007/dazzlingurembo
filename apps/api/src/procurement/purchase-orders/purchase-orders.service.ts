import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

export interface QueryPurchaseOrdersDto {
  supplierId?: string;
  branchId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryPurchaseOrdersDto) {
    const { page = 1, limit = 20, supplierId, branchId, status, search } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (supplierId) where['supplierId'] = supplierId;
    if (branchId) where['branchId'] = branchId;
    if (status) where['status'] = status;
    if (search) {
      where['OR'] = [
        { poNumber: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where, skip, take: limit,
        include: {
          supplier: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id, deletedAt: null },
      include: {
        supplier: true,
        branch: true,
        warehouse: true,
        items: {
          include: { variant: { select: { id: true, name: true, sku: true } } },
        },
        goodsReceipts: { select: { id: true, receiptNumber: true, receivedAt: true } },
      },
    });
    if (!po) throw new NotFoundException(`Purchase order ${id} not found`);
    return { data: po };
  }

  async create(dto: CreatePurchaseOrderDto, userId?: string) {
    const poNumber = `PO-${Date.now()}`;
    const items = dto.items.map(item => {
      const taxRate = item.taxRate ?? 0;
      const taxAmount = item.quantityOrdered * item.unitCost * taxRate;
      const lineTotal = item.quantityOrdered * item.unitCost + taxAmount;
      return { ...item, taxRate, taxAmount, lineTotal };
    });
    const subtotal = items.reduce((s, i) => s + i.quantityOrdered * i.unitCost, 0);
    const taxAmount = items.reduce((s, i) => s + i.taxAmount, 0);
    const totalAmount = subtotal + taxAmount;

    const po = await this.prisma.purchaseOrder.create({
      data: {
        id: crypto.randomUUID(),
        poNumber,
        supplierId: dto.supplierId,
        branchId: dto.branchId,
        warehouseId: dto.warehouseId ?? null,
        originalCurrencyCode: dto.originalCurrencyCode,
        subtotal,
        taxAmount,
        shippingAmount: 0,
        totalAmount,
        paidAmount: 0,
        expectedDeliveryAt: dto.expectedDeliveryAt ? new Date(dto.expectedDeliveryAt) : null,
        notes: dto.notes ?? null,
        terms: dto.terms ?? null,
        createdById: userId ?? null,
        status: 'DRAFT',
        items: {
          create: items.map(item => ({
            id: crypto.randomUUID(),
            variantId: item.variantId ?? null,
            description: item.description,
            sku: item.sku ?? null,
            quantityOrdered: item.quantityOrdered,
            quantityReceived: 0,
            unitCost: item.unitCost,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            lineTotal: item.lineTotal,
            notes: item.notes ?? null,
          })),
        },
      },
      include: { items: true },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'purchase_order', entityId: po.id });
    return { data: po };
  }

  private async changeStatus(id: string, from: string[], to: string, userId?: string, extra?: Record<string, unknown>) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id, deletedAt: null } });
    if (!po) throw new NotFoundException(`Purchase order ${id} not found`);
    if (!from.includes(po.status)) {
      throw new BadRequestException(`Cannot transition from ${po.status} to ${to}`);
    }
    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: to as any, ...extra },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'purchase_order', entityId: id, description: `Status: ${to}` });
    return { data: updated };
  }

  async submit(id: string, userId?: string) {
    return this.changeStatus(id, ['DRAFT'], 'SENT', userId, { sentAt: new Date() });
  }

  async approve(id: string, userId?: string) {
    return this.changeStatus(id, ['SENT', 'ACKNOWLEDGED'], 'ACKNOWLEDGED', userId, { acknowledgedAt: new Date() });
  }

  async cancel(id: string, userId?: string) {
    return this.changeStatus(id, ['DRAFT', 'SENT', 'ACKNOWLEDGED'], 'CANCELLED', userId);
  }

  async receive(id: string, userId?: string) {
    return this.changeStatus(id, ['ACKNOWLEDGED', 'PARTIALLY_RECEIVED'], 'RECEIVED', userId);
  }
}
