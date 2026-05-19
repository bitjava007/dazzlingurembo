import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';

export interface QueryReceiptsDto {
  branchId?: string;
  paymentId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryReceiptsDto) {
    const { page = 1, limit = 20, branchId, paymentId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (branchId) where['branchId'] = branchId;
    if (paymentId) where['paymentId'] = paymentId;

    const [data, total] = await Promise.all([
      this.prisma.receipt.findMany({
        where, skip, take: limit,
        include: {
          payment: { select: { id: true, paymentNumber: true, originalAmount: true, originalCurrencyCode: true, method: true } },
          branch: { select: { id: true, name: true, code: true } },
        },
        orderBy: { issuedAt: 'desc' },
      }),
      this.prisma.receipt.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        payment: { include: { order: true, invoice: true } },
        branch: true,
      },
    });
    if (!receipt) throw new NotFoundException(`Receipt ${id} not found`);
    return { data: receipt };
  }

  async generate(paymentId: string, userId?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);

    const existing = await this.prisma.receipt.findUnique({ where: { paymentId } });
    if (existing) throw new ConflictException('Receipt already generated for this payment');

    const receiptNumber = `RCP-${Date.now()}`;
    const receipt = await this.prisma.receipt.create({
      data: {
        id: crypto.randomUUID(),
        receiptNumber,
        paymentId,
        branchId: payment.branchId,
        issuedAt: new Date(),
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'receipt', entityId: receipt.id });
    return { data: receipt };
  }
}
