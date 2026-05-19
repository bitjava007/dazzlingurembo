import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';

export interface QuerySupplierPaymentsDto {
  supplierId?: string;
  branchId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class SupplierPaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QuerySupplierPaymentsDto) {
    const { page = 1, limit = 20, supplierId, branchId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (supplierId) where['supplierId'] = supplierId;
    if (branchId) where['branchId'] = branchId;

    const [data, total] = await Promise.all([
      this.prisma.supplierPayment.findMany({
        where, skip, take: limit,
        include: {
          supplier: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
          purchaseOrder: { select: { id: true, poNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supplierPayment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: CreateSupplierPaymentDto, userId?: string) {
    const paymentNumber = `SP-${Date.now()}`;
    const payment = await this.prisma.supplierPayment.create({
      data: {
        id: crypto.randomUUID(),
        paymentNumber,
        supplierId: dto.supplierId,
        purchaseOrderId: dto.purchaseOrderId ?? null,
        branchId: dto.branchId,
        originalCurrencyCode: dto.originalCurrencyCode,
        originalAmount: dto.originalAmount,
        convertedCurrencyCode: dto.convertedCurrencyCode ?? null,
        convertedAmount: dto.convertedAmount ?? null,
        exchangeRateSnapshot: dto.exchangeRateSnapshot ?? null,
        method: dto.method,
        status: 'COMPLETED',
        transactionRef: dto.transactionRef ?? null,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
        notes: dto.notes ?? null,
        processedById: userId ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'supplier_payment', entityId: payment.id });
    return { data: payment };
  }
}
