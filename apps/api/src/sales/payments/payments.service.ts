import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

export interface QueryPaymentsDto {
  orderId?: string;
  invoiceId?: string;
  branchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryPaymentsDto) {
    const { page = 1, limit = 20, orderId, invoiceId, branchId, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (orderId) where['orderId'] = orderId;
    if (invoiceId) where['invoiceId'] = invoiceId;
    if (branchId) where['branchId'] = branchId;
    if (status) where['status'] = status;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where, skip, take: limit,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          order: { select: { id: true, orderNumber: true } },
          invoice: { select: { id: true, invoiceNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        branch: true,
        order: true,
        invoice: true,
        receipt: true,
      },
    });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return { data: payment };
  }

  async create(dto: CreatePaymentDto, userId?: string) {
    const paymentNumber = `PAY-${Date.now()}`;
    const payment = await this.prisma.payment.create({
      data: {
        id: crypto.randomUUID(),
        paymentNumber,
        orderId: dto.orderId ?? null,
        invoiceId: dto.invoiceId ?? null,
        customerId: dto.customerId ?? null,
        branchId: dto.branchId,
        method: dto.method,
        status: 'COMPLETED',
        originalCurrencyCode: dto.originalCurrencyCode,
        originalAmount: dto.originalAmount,
        convertedCurrencyCode: dto.convertedCurrencyCode ?? null,
        convertedAmount: dto.convertedAmount ?? null,
        exchangeRateSnapshot: dto.exchangeRateSnapshot ?? null,
        transactionRef: dto.transactionRef ?? null,
        notes: dto.notes ?? null,
        receivedById: userId ?? null,
        processedAt: new Date(),
      },
    });

    // Update invoice if linked
    if (dto.invoiceId) {
      const invoice = await this.prisma.invoice.findUnique({ where: { id: dto.invoiceId } });
      if (invoice) {
        const newPaidAmount = Number(invoice.paidAmount) + dto.originalAmount;
        const newBalanceDue = Number(invoice.totalAmount) - newPaidAmount;
        const newStatus = newBalanceDue <= 0 ? 'PAID' : 'PARTIALLY_PAID';
        await this.prisma.invoice.update({
          where: { id: dto.invoiceId },
          data: {
            paidAmount: newPaidAmount,
            balanceDue: Math.max(0, newBalanceDue),
            status: newStatus,
            paidAt: newStatus === 'PAID' ? new Date() : undefined,
          },
        });
      }
    }

    await this.audit.log({ userId, action: 'CREATE', entityType: 'payment', entityId: payment.id });
    return { data: payment };
  }
}
