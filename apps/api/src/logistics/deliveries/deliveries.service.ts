import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateDeliveryDto, DeliverDto, FailDeliveryDto } from './dto/create-delivery.dto';

export interface QueryDeliveriesDto {
  branchId?: string;
  status?: string;
  orderId?: string;
  assignedToId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryDeliveriesDto) {
    const { page = 1, limit = 20, branchId, status, orderId, assignedToId, search } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (branchId) where['branchId'] = branchId;
    if (status) where['status'] = status;
    if (orderId) where['orderId'] = orderId;
    if (assignedToId) where['assignedToId'] = assignedToId;
    if (search) {
      where['OR'] = [
        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
        { driverName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.delivery.findMany({
        where, skip, take: limit,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          order: { select: { id: true, orderNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.delivery.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: {
        branch: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        order: true,
        tracking: { orderBy: { recordedAt: 'desc' } },
        proofOfDelivery: true,
      },
    });
    if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
    return { data: delivery };
  }

  async create(dto: CreateDeliveryDto, userId?: string) {
    const deliveryNumber = `DEL-${Date.now()}`;
    const delivery = await this.prisma.delivery.create({
      data: {
        id: crypto.randomUUID(),
        deliveryNumber,
        orderId: dto.orderId ?? null,
        branchId: dto.branchId,
        recipientName: dto.recipientName ?? null,
        recipientPhone: dto.recipientPhone ?? null,
        addressLine1: dto.addressLine1 ?? null,
        addressLine2: dto.addressLine2 ?? null,
        city: dto.city ?? null,
        stateRegion: dto.stateRegion ?? null,
        postalCode: dto.postalCode ?? null,
        countryCode: dto.countryCode ?? null,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        deliveryNotes: dto.deliveryNotes ?? null,
        carrierName: dto.carrierName ?? null,
        status: 'PENDING',
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'delivery', entityId: delivery.id });
    return { data: delivery };
  }

  async assign(id: string, assignedToId: string, vehicleId: string | undefined, userId?: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
    if (!['PENDING'].includes(delivery.status)) {
      throw new BadRequestException(`Cannot assign a delivery in status ${delivery.status}`);
    }
    const updated = await this.prisma.delivery.update({
      where: { id },
      data: { status: 'ASSIGNED', assignedToId },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'delivery', entityId: id, description: 'Assigned' });
    return { data: updated };
  }

  async dispatch(id: string, userId?: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
    if (delivery.status !== 'ASSIGNED') throw new BadRequestException('Delivery must be ASSIGNED to dispatch');
    const updated = await this.prisma.delivery.update({
      where: { id },
      data: { status: 'PICKED_UP', pickedUpAt: new Date() },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'delivery', entityId: id, description: 'Dispatched' });
    return { data: updated };
  }

  async deliver(id: string, dto: DeliverDto, userId?: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
    if (!['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(delivery.status)) {
      throw new BadRequestException('Delivery must be in transit to mark as delivered');
    }
    const updated = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
        deliveryNotes: dto.notes ?? delivery.deliveryNotes,
      },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'delivery', entityId: id, description: 'Delivered' });
    return { data: updated };
  }

  async fail(id: string, dto: FailDeliveryDto, userId?: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
    const updated = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        failureReason: dto.reason ?? null,
        attemptCount: delivery.attemptCount + 1,
      },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'delivery', entityId: id, description: 'Failed' });
    return { data: updated };
  }

  async reschedule(id: string, newDate: string, userId?: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
    if (delivery.status === 'DELIVERED') throw new BadRequestException('Cannot reschedule a delivered delivery');
    const updated = await this.prisma.delivery.update({
      where: { id },
      data: { scheduledAt: new Date(newDate), status: 'PENDING' },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'delivery', entityId: id, description: 'Rescheduled' });
    return { data: updated };
  }
}
