import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAlterationDto } from './dto/create-alteration.dto';

@Injectable()
export class AlterationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; customerId?: string; branchId?: string; status?: string; workshopId?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (query.customerId) where['customerId'] = query.customerId;
    if (query.branchId) where['branchId'] = query.branchId;
    if (query.status) where['status'] = query.status;
    if (query.workshopId) where['workshopId'] = query.workshopId;
    const [data, total] = await Promise.all([
      this.prisma.alteration.findMany({
        where, skip, take: limit,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true } },
          branch: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.alteration.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const alt = await this.prisma.alteration.findFirst({
      where: { id },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        branch: { select: { id: true, name: true } },
        workshop: { select: { id: true, name: true } },
      },
    });
    if (!alt) throw new NotFoundException(`Alteration ${id} not found`);
    return { data: alt };
  }

  async create(dto: CreateAlterationDto, userId?: string) {
    const alterationNumber = `ALT-${Date.now().toString(36).toUpperCase()}`;
    const alt = await this.prisma.alteration.create({
      data: {
        id: crypto.randomUUID(),
        alterationNumber,
        customerId: dto.customerId,
        branchId: dto.branchId,
        description: dto.description,
        alterationType: dto.alterationType ?? 'RESIZE',
        workshopId: dto.workshopId ?? null,
        estimatedCost: dto.estimatedCost ?? null,
        currencyCode: dto.currencyCode ?? 'XOF',
        tailorId: dto.tailorId ?? null,
        notes: dto.notes ?? null,
        estimatedTime: dto.estimatedTime ?? null,
        status: 'RECEIVED',
        createdById: userId ?? null,
      },
    });
    return { data: alt };
  }

  async start(id: string, tailorId?: string, workshopId?: string) {
    const alt = await this.prisma.alteration.findFirst({ where: { id } });
    if (!alt) throw new NotFoundException(`Alteration ${id} not found`);
    const updated = await this.prisma.alteration.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        ...(tailorId && { tailorId }),
        ...(workshopId && { workshopId }),
      },
    });
    return { data: updated };
  }

  async complete(id: string, finalCost?: number, actualTime?: number) {
    const alt = await this.prisma.alteration.findFirst({ where: { id } });
    if (!alt) throw new NotFoundException(`Alteration ${id} not found`);
    const updated = await this.prisma.alteration.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        ...(finalCost !== undefined && { finalCost }),
        ...(actualTime !== undefined && { actualTime }),
      },
    });
    return { data: updated };
  }

  async deliver(id: string) {
    const alt = await this.prisma.alteration.findFirst({ where: { id } });
    if (!alt) throw new NotFoundException(`Alteration ${id} not found`);
    const updated = await this.prisma.alteration.update({
      where: { id },
      data: { status: 'DELIVERED', deliveredAt: new Date() },
    });
    return { data: updated };
  }

  async remove(id: string) {
    const alt = await this.prisma.alteration.findFirst({ where: { id } });
    if (!alt) throw new NotFoundException(`Alteration ${id} not found`);
    await this.prisma.alteration.delete({ where: { id } });
  }
}
