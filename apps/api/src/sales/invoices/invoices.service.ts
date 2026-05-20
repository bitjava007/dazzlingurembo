import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';

export interface QueryInvoicesDto {
  customerId?: string;
  branchId?: string;
  orderId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryInvoicesDto) {
    const { page = 1, limit = 20, customerId, branchId, orderId, status, search } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (customerId) where['customerId'] = customerId;
    if (branchId) where['branchId'] = branchId;
    if (orderId) where['orderId'] = orderId;
    if (status) where['status'] = status;
    if (search) {
      where['OR'] = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where, skip, take: limit,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          order: { select: { id: true, orderNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id, deletedAt: null },
      include: {
        branch: true,
        order: { include: { items: true } },
        payments: { select: { id: true, paymentNumber: true, status: true, originalAmount: true, method: true } },
      },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return { data: invoice };
  }

  async createFromOrder(orderId: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, deletedAt: null },
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const invoiceNumber = `INV-${Date.now()}`;
    const invoice = await this.prisma.invoice.create({
      data: {
        id: crypto.randomUUID(),
        invoiceNumber,
        orderId,
        customerId: order.customerId,
        branchId: order.branchId,
        currencyCode: order.currencyCode,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        paidAmount: 0,
        balanceDue: order.totalAmount,
        convertedCurrencyCode: order.convertedCurrencyCode,
        convertedTotalAmount: order.convertedTotalAmount,
        exchangeRateSnapshot: order.exchangeRateSnapshot,
        status: 'ISSUED',
        issuedAt: new Date(),
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'invoice', entityId: invoice.id, description: `Created from order ${orderId}` });
    return { data: invoice };
  }

  async markOverdue() {
    const now = new Date();
    const result = await this.prisma.invoice.updateMany({
      where: {
        status: { in: ['ISSUED', 'PARTIALLY_PAID'] },
        dueAt: { lt: now },
        deletedAt: null,
      },
      data: { status: 'OVERDUE' },
    });
    return { data: { updatedCount: result.count } };
  }

  async cancel(id: string, userId?: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id, deletedAt: null } });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    if (invoice.status === 'PAID') throw new BadRequestException('Cannot cancel a paid invoice');
    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'VOID', voidedAt: new Date(), deletedAt: new Date() },
    });
    await this.audit.log({ userId, action: 'VOID', entityType: 'invoice', entityId: id });
    return { data: updated };
  }
}
