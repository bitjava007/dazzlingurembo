import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateRefundDto } from './dto/create-refund.dto';

export interface QueryRefundsDto {
  orderId?: string;
  branchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class RefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryRefundsDto) {
    const { page = 1, limit = 20, orderId, branchId, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (orderId) where['orderId'] = orderId;
    if (branchId) where['branchId'] = branchId;
    if (status) where['status'] = status;

    const [data, total] = await Promise.all([
      this.prisma.refund.findMany({
        where, skip, take: limit,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          order: { select: { id: true, orderNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refund.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: { branch: true, order: true, payment: true },
    });
    if (!refund) throw new NotFoundException(`Refund ${id} not found`);
    return { data: refund };
  }

  async create(dto: CreateRefundDto, userId?: string) {
    const refundNumber = `REF-${Date.now()}`;
    const refund = await this.prisma.refund.create({
      data: {
        id: crypto.randomUUID(),
        refundNumber,
        orderId: dto.orderId ?? null,
        paymentId: dto.paymentId ?? null,
        customerId: dto.customerId ?? null,
        branchId: dto.branchId,
        status: 'PENDING',
        reason: dto.reason,
        description: dto.description ?? null,
        originalCurrencyCode: dto.originalCurrencyCode,
        originalAmount: dto.originalAmount,
        convertedCurrencyCode: dto.convertedCurrencyCode ?? null,
        convertedAmount: dto.convertedAmount ?? null,
        exchangeRateSnapshot: dto.exchangeRateSnapshot ?? null,
        method: dto.method ?? null,
        requestedById: userId ?? null,
        notes: dto.notes ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'refund', entityId: refund.id });
    return { data: refund };
  }

  async approve(id: string, userId: string) {
    const refund = await this.prisma.refund.findUnique({ where: { id } });
    if (!refund) throw new NotFoundException(`Refund ${id} not found`);
    if (refund.status !== 'PENDING') throw new BadRequestException('Only PENDING refunds can be approved');
    const updated = await this.prisma.refund.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: userId },
    });
    await this.audit.log({ userId, action: 'APPROVE', entityType: 'refund', entityId: id });
    return { data: updated };
  }

  async reject(id: string, userId: string, reason?: string) {
    const refund = await this.prisma.refund.findUnique({ where: { id } });
    if (!refund) throw new NotFoundException(`Refund ${id} not found`);
    if (refund.status !== 'PENDING') throw new BadRequestException('Only PENDING refunds can be rejected');
    const updated = await this.prisma.refund.update({
      where: { id },
      data: { status: 'REJECTED', notes: reason ? `Rejected: ${reason}` : refund.notes },
    });
    await this.audit.log({ userId, action: 'REJECT', entityType: 'refund', entityId: id });
    return { data: updated };
  }

  async process(id: string, userId: string) {
    const refund = await this.prisma.refund.findUnique({ where: { id } });
    if (!refund) throw new NotFoundException(`Refund ${id} not found`);
    if (refund.status !== 'APPROVED') throw new BadRequestException('Only APPROVED refunds can be processed');
    const updated = await this.prisma.refund.update({
      where: { id },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'refund', entityId: id, description: 'Processed refund' });
    return { data: updated };
  }
}
