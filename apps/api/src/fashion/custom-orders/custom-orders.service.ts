import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomOrderDto } from './dto/create-custom-order.dto';

@Injectable()
export class CustomOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; customerId?: string; branchId?: string; status?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (query.customerId) where['customerId'] = query.customerId;
    if (query.branchId) where['branchId'] = query.branchId;
    if (query.status) where['status'] = query.status;
    const [data, total] = await Promise.all([
      this.prisma.customOrder.findMany({
        where, skip, take: limit,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true } },
          branch: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customOrder.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const order = await this.prisma.customOrder.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        branch: { select: { id: true, name: true } },
      },
    });
    if (!order) throw new NotFoundException(`Custom order ${id} not found`);
    return { data: order };
  }

  async create(dto: CreateCustomOrderDto, userId?: string) {
    const orderNumber = `CO-${Date.now().toString(36).toUpperCase()}`;
    const order = await this.prisma.customOrder.create({
      data: {
        id: crypto.randomUUID(),
        orderNumber,
        customerId: dto.customerId,
        branchId: dto.branchId,
        title: dto.title,
        status: 'PENDING',
        description: dto.description ?? null,
        bust: dto.bust ?? null,
        waist: dto.waist ?? null,
        hips: dto.hips ?? null,
        length: dto.length ?? null,
        shoulders: dto.shoulders ?? null,
        sleeves: dto.sleeves ?? null,
        inseam: dto.inseam ?? null,
        neck: dto.neck ?? null,
        measurementNotes: dto.measurementNotes ?? null,
        stylePreferences: dto.stylePreferences ?? null,
        colorPreferences: dto.colorPreferences ?? null,
        fabricPreferences: dto.fabricPreferences ?? null,
        embellishments: dto.embellishments ?? null,
        specialInstructions: dto.specialInstructions ?? null,
        estimatedPrice: dto.estimatedPrice ?? null,
        finalPrice: dto.finalPrice ?? null,
        depositAmount: dto.depositAmount ?? null,
        currencyCode: dto.currencyCode ?? 'XOF',
        requiredByDate: dto.requiredByDate ? new Date(dto.requiredByDate) : null,
        fittingDate: dto.fittingDate ? new Date(dto.fittingDate) : null,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        notes: dto.notes ?? null,
        createdById: userId ?? null,
      },
    });
    return { data: order };
  }

  async update(id: string, dto: Partial<CreateCustomOrderDto>) {
    const order = await this.prisma.customOrder.findFirst({ where: { id, deletedAt: null } });
    if (!order) throw new NotFoundException(`Custom order ${id} not found`);
    const updated = await this.prisma.customOrder.update({
      where: { id },
      data: {
        ...dto,
        requiredByDate: dto.requiredByDate ? new Date(dto.requiredByDate) : undefined,
        fittingDate: dto.fittingDate ? new Date(dto.fittingDate) : undefined,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
      } as any,
    });
    return { data: updated };
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.customOrder.findFirst({ where: { id, deletedAt: null } });
    if (!order) throw new NotFoundException(`Custom order ${id} not found`);
    const updated = await this.prisma.customOrder.update({ where: { id }, data: { status } });
    return { data: updated };
  }

  async remove(id: string) {
    const order = await this.prisma.customOrder.findFirst({ where: { id, deletedAt: null } });
    if (!order) throw new NotFoundException(`Custom order ${id} not found`);
    await this.prisma.customOrder.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
