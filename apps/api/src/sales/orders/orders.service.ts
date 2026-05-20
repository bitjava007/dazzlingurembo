import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateOrderDto } from './dto/create-order.dto';

export interface QueryOrdersDto {
  customerId?: string;
  branchId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryOrdersDto) {
    const { page = 1, limit = 20, customerId, branchId, status, search } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (customerId) where['customerId'] = customerId;
    if (branchId) where['branchId'] = branchId;
    if (status) where['status'] = status;
    if (search) {
      where['OR'] = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where, skip, take: limit,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          branch: { select: { id: true, name: true, code: true } },
          _count: { select: { items: true, invoices: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        branch: true,
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
            variant: { select: { id: true, name: true, sku: true, color: true, size: true } },
          },
        },
        invoices: { select: { id: true, invoiceNumber: true, status: true, totalAmount: true, paidAmount: true, balanceDue: true } },
        payments: { select: { id: true, paymentNumber: true, status: true, originalAmount: true, method: true } },
      },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return { data: order };
  }

  async create(dto: CreateOrderDto, userId?: string) {
    const orderNumber = `ORD-${Date.now()}`;
    const items = dto.items.map(item => {
      const discountAmount = item.discountAmount ?? 0;
      const taxRate = item.taxRate ?? 0;
      const taxAmount = (item.unitPrice * item.quantity - discountAmount) * taxRate;
      const lineTotal = item.unitPrice * item.quantity - discountAmount + taxAmount;
      return { ...item, discountAmount, taxRate, taxAmount, lineTotal };
    });

    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const discountAmount = items.reduce((s, i) => s + i.discountAmount, 0);
    const taxAmount = items.reduce((s, i) => s + i.taxAmount, 0);
    const shippingAmount = dto.shippingAmount ?? 0;
    const totalAmount = subtotal - discountAmount + taxAmount + shippingAmount;

    const order = await this.prisma.order.create({
      data: {
        id: crypto.randomUUID(),
        orderNumber,
        customerId: dto.customerId ?? null,
        branchId: dto.branchId,
        createdById: userId ?? null,
        currencyCode: dto.currencyCode,
        subtotal,
        discountAmount,
        taxAmount,
        shippingAmount,
        totalAmount,
        convertedCurrencyCode: dto.convertedCurrencyCode ?? null,
        exchangeRateSnapshot: dto.exchangeRateSnapshot ?? null,
        shippingAddressLine1: dto.shippingAddressLine1 ?? null,
        shippingAddressLine2: dto.shippingAddressLine2 ?? null,
        shippingCity: dto.shippingCity ?? null,
        shippingState: dto.shippingState ?? null,
        shippingPostalCode: dto.shippingPostalCode ?? null,
        shippingCountryCode: dto.shippingCountryCode ?? null,
        notes: dto.notes ?? null,
        status: 'DRAFT',
        items: {
          create: items.map(item => ({
            id: crypto.randomUUID(),
            productId: item.productId,
            variantId: item.variantId ?? null,
            name: item.name,
            sku: item.sku ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            costPrice: item.costPrice ?? null,
            discountAmount: item.discountAmount,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            lineTotal: item.lineTotal,
            notes: item.notes ?? null,
          })),
        },
      },
      include: { items: true },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'order', entityId: order.id });
    return { data: order };
  }

  async update(id: string, dto: Partial<CreateOrderDto>, userId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id, deletedAt: null } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    if (order.status === 'CANCELLED') throw new BadRequestException('Cannot update cancelled order');
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        notes: dto.notes,
        shippingAddressLine1: dto.shippingAddressLine1,
        shippingCity: dto.shippingCity,
        shippingCountryCode: dto.shippingCountryCode,
      },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'order', entityId: id });
    return { data: updated };
  }

  async confirm(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id, deletedAt: null } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    if (order.status !== 'DRAFT') throw new BadRequestException('Only DRAFT orders can be confirmed');
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: 'CONFIRMED', orderedAt: new Date() },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'order', entityId: id, description: 'Confirmed order' });
    return { data: updated };
  }

  async cancel(id: string, userId?: string, reason?: string) {
    const order = await this.prisma.order.findUnique({ where: { id, deletedAt: null } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException('Cannot cancel delivered or already cancelled order');
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: reason ?? null },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'order', entityId: id, description: 'Cancelled order' });
    return { data: updated };
  }
}
