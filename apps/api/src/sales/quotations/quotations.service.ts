import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';

export interface QueryQuotationsDto {
  customerId?: string;
  branchId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryQuotationsDto) {
    const { page = 1, limit = 20, customerId, branchId, status, search } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (customerId) where['customerId'] = customerId;
    if (branchId) where['branchId'] = branchId;
    if (status) where['status'] = status;
    if (search) {
      where['OR'] = [
        { quotationNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where, skip, take: limit,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          branch: { select: { id: true, name: true, code: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quotation.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        branch: true,
        items: { include: { variant: { select: { id: true, name: true, sku: true } } } },
      },
    });
    if (!quotation) throw new NotFoundException(`Quotation ${id} not found`);
    return { data: quotation };
  }

  async create(dto: CreateQuotationDto, userId?: string) {
    const quotationNumber = `QUO-${Date.now()}`;
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
    const totalAmount = subtotal - discountAmount + taxAmount;

    const quotation = await this.prisma.quotation.create({
      data: {
        id: crypto.randomUUID(),
        quotationNumber,
        customerId: dto.customerId ?? null,
        branchId: dto.branchId,
        createdById: userId ?? null,
        currencyCode: dto.currencyCode,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        convertedCurrencyCode: dto.convertedCurrencyCode ?? null,
        exchangeRateSnapshot: dto.exchangeRateSnapshot ?? null,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        notes: dto.notes ?? null,
        termsConditions: dto.termsConditions ?? null,
        status: 'DRAFT',
        items: {
          create: items.map(item => ({
            id: crypto.randomUUID(),
            variantId: item.variantId ?? null,
            name: item.name,
            sku: item.sku ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
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
    await this.audit.log({ userId, action: 'CREATE', entityType: 'quotation', entityId: quotation.id });
    return { data: quotation };
  }

  async update(id: string, dto: Partial<CreateQuotationDto>, userId?: string) {
    const quotation = await this.prisma.quotation.findUnique({ where: { id, deletedAt: null } });
    if (!quotation) throw new NotFoundException(`Quotation ${id} not found`);
    const updated = await this.prisma.quotation.update({
      where: { id },
      data: {
        notes: dto.notes,
        termsConditions: dto.termsConditions,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'quotation', entityId: id });
    return { data: updated };
  }

  async convertToOrder(id: string, userId?: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id, deletedAt: null },
      include: { items: true },
    });
    if (!quotation) throw new NotFoundException(`Quotation ${id} not found`);
    if (quotation.status === 'CONVERTED') throw new BadRequestException('Quotation already converted');
    if (!['DRAFT', 'SENT', 'ACCEPTED'].includes(quotation.status)) {
      throw new BadRequestException('Quotation must be in DRAFT, SENT, or ACCEPTED status to convert');
    }

    const orderNumber = `ORD-${Date.now()}`;
    const order = await this.prisma.order.create({
      data: {
        id: crypto.randomUUID(),
        orderNumber,
        customerId: quotation.customerId,
        branchId: quotation.branchId,
        createdById: userId ?? null,
        currencyCode: quotation.currencyCode,
        subtotal: quotation.subtotal,
        discountAmount: quotation.discountAmount,
        taxAmount: quotation.taxAmount,
        totalAmount: quotation.totalAmount,
        convertedCurrencyCode: quotation.convertedCurrencyCode,
        convertedTotalAmount: quotation.convertedTotalAmount,
        exchangeRateSnapshot: quotation.exchangeRateSnapshot,
        status: 'DRAFT',
        items: {
          create: quotation.items.map(item => ({
            id: crypto.randomUUID(),
            productId: item.variantId ?? '',
            variantId: item.variantId ?? null,
            name: item.name,
            sku: item.sku ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            lineTotal: item.lineTotal,
          })),
        },
      },
    });

    await this.prisma.quotation.update({
      where: { id },
      data: { status: 'CONVERTED', convertedOrderId: order.id },
    });

    await this.audit.log({ userId, action: 'UPDATE', entityType: 'quotation', entityId: id, description: `Converted to order ${order.orderNumber}` });
    return { data: order };
  }

  async cancel(id: string, userId?: string) {
    const quotation = await this.prisma.quotation.findUnique({ where: { id, deletedAt: null } });
    if (!quotation) throw new NotFoundException(`Quotation ${id} not found`);
    const updated = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'REJECTED', deletedAt: new Date() },
    });
    await this.audit.log({ userId, action: 'DELETE', entityType: 'quotation', entityId: id });
    return { data: updated };
  }
}
