import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateReturnDto } from './dto/create-return.dto';

export interface QueryReturnsDto {
  orderId?: string;
  customerId?: string;
  branchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryReturnsDto) {
    const { page = 1, limit = 20, orderId, customerId, branchId, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (orderId) where['orderId'] = orderId;
    if (customerId) where['customerId'] = customerId;
    if (branchId) where['branchId'] = branchId;
    if (status) where['status'] = status;

    const [data, total] = await Promise.all([
      this.prisma.return.findMany({
        where, skip, take: limit,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true } },
          branch: { select: { id: true, name: true, code: true } },
          order: { select: { id: true, orderNumber: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.return.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const returnRecord = await this.prisma.return.findUnique({
      where: { id },
      include: {
        customer: true,
        branch: true,
        order: true,
        items: { include: { variant: { select: { id: true, name: true, sku: true } } } },
      },
    });
    if (!returnRecord) throw new NotFoundException(`Return ${id} not found`);
    return { data: returnRecord };
  }

  async create(dto: CreateReturnDto, userId?: string) {
    const returnNumber = `RET-${Date.now()}`;
    const returnRecord = await this.prisma.return.create({
      data: {
        id: crypto.randomUUID(),
        returnNumber,
        orderId: dto.orderId ?? null,
        customerId: dto.customerId ?? null,
        branchId: dto.branchId,
        status: 'REQUESTED',
        reason: dto.reason,
        description: dto.description ?? null,
        resolutionType: dto.resolutionType ?? null,
        notes: dto.notes ?? null,
        items: {
          create: dto.items.map(item => ({
            id: crypto.randomUUID(),
            variantId: item.variantId ?? null,
            name: item.name,
            sku: item.sku ?? null,
            quantity: item.quantity,
            condition: item.condition ?? null,
            notes: item.notes ?? null,
          })),
        },
      },
      include: { items: true },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'return', entityId: returnRecord.id });
    return { data: returnRecord };
  }

  async approve(id: string, userId: string) {
    const returnRecord = await this.prisma.return.findUnique({ where: { id } });
    if (!returnRecord) throw new NotFoundException(`Return ${id} not found`);
    if (returnRecord.status !== 'REQUESTED') throw new BadRequestException('Only REQUESTED returns can be approved');
    const updated = await this.prisma.return.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });
    await this.audit.log({ userId, action: 'APPROVE', entityType: 'return', entityId: id });
    return { data: updated };
  }

  async reject(id: string, userId: string, reason?: string) {
    const returnRecord = await this.prisma.return.findUnique({ where: { id } });
    if (!returnRecord) throw new NotFoundException(`Return ${id} not found`);
    if (returnRecord.status !== 'REQUESTED') throw new BadRequestException('Only REQUESTED returns can be rejected');
    const updated = await this.prisma.return.update({
      where: { id },
      data: { status: 'REJECTED', notes: reason ? `Rejected: ${reason}` : returnRecord.notes },
    });
    await this.audit.log({ userId, action: 'REJECT', entityType: 'return', entityId: id });
    return { data: updated };
  }

  async complete(id: string, userId: string) {
    const returnRecord = await this.prisma.return.findUnique({ where: { id } });
    if (!returnRecord) throw new NotFoundException(`Return ${id} not found`);
    if (!['APPROVED', 'RECEIVED', 'INSPECTED'].includes(returnRecord.status)) {
      throw new BadRequestException('Return must be APPROVED, RECEIVED, or INSPECTED to complete');
    }
    const updated = await this.prisma.return.update({
      where: { id },
      data: { status: 'REFUND_ISSUED', resolvedAt: new Date() },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'return', entityId: id, description: 'Completed return' });
    return { data: updated };
  }
}
