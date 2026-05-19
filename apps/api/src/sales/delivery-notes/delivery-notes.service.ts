import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';

export interface QueryDeliveryNotesDto {
  branchId?: string;
  orderId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class DeliveryNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryDeliveryNotesDto) {
    const { page = 1, limit = 20, branchId, orderId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (branchId) where['branchId'] = branchId;
    if (orderId) where['orderId'] = orderId;

    const [data, total] = await Promise.all([
      this.prisma.deliveryNote.findMany({
        where, skip, take: limit,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          order: { select: { id: true, orderNumber: true, status: true } },
        },
        orderBy: { issuedAt: 'desc' },
      }),
      this.prisma.deliveryNote.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const note = await this.prisma.deliveryNote.findUnique({
      where: { id },
      include: { branch: true, order: { include: { items: true, customer: true } } },
    });
    if (!note) throw new NotFoundException(`Delivery note ${id} not found`);
    return { data: note };
  }

  async createFromOrder(orderId: string, userId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId, deletedAt: null } });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const existing = await this.prisma.deliveryNote.findUnique({ where: { orderId } });
    if (existing) throw new ConflictException('Delivery note already exists for this order');

    const noteNumber = `DN-${Date.now()}`;
    const note = await this.prisma.deliveryNote.create({
      data: {
        id: crypto.randomUUID(),
        noteNumber,
        orderId,
        branchId: order.branchId,
        issuedAt: new Date(),
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'deliveryNote', entityId: note.id });
    return { data: note };
  }

  async dispatch(id: string, userId?: string) {
    const note = await this.prisma.deliveryNote.findUnique({ where: { id } });
    if (!note) throw new NotFoundException(`Delivery note ${id} not found`);
    if (note.shippedAt) throw new BadRequestException('Already dispatched');
    const updated = await this.prisma.deliveryNote.update({
      where: { id },
      data: { shippedAt: new Date() },
    });
    // Update order status
    await this.prisma.order.update({
      where: { id: note.orderId },
      data: { status: 'SHIPPED' },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'deliveryNote', entityId: id, description: 'Dispatched' });
    return { data: updated };
  }

  async deliver(id: string, userId?: string) {
    const note = await this.prisma.deliveryNote.findUnique({ where: { id } });
    if (!note) throw new NotFoundException(`Delivery note ${id} not found`);
    if (!note.shippedAt) throw new BadRequestException('Must dispatch before marking as delivered');
    if (note.deliveredAt) throw new BadRequestException('Already delivered');
    const updated = await this.prisma.deliveryNote.update({
      where: { id },
      data: { deliveredAt: new Date() },
    });
    await this.prisma.order.update({
      where: { id: note.orderId },
      data: { status: 'DELIVERED' },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'deliveryNote', entityId: id, description: 'Delivered' });
    return { data: updated };
  }
}
