import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';

export interface QueryWorkOrdersDto {
  branchId?: string;
  workshopId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class WorkOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryWorkOrdersDto) {
    const { page = 1, limit = 20, branchId, workshopId, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (branchId) where['branchId'] = branchId;
    if (workshopId) where['workshopId'] = workshopId;
    if (status) where['status'] = status;

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where, skip, take: limit,
        include: {
          workshop: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
          _count: { select: { stages: true, operatorAssignments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workOrder.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id, deletedAt: null },
      include: {
        workshop: true,
        branch: true,
        stages: { orderBy: { sequence: 'asc' } },
        materialConsumptions: { include: { variant: { select: { id: true, name: true, sku: true } } } },
        operatorAssignments: { include: { operator: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
    if (!wo) throw new NotFoundException(`Work order ${id} not found`);
    return { data: wo };
  }

  async create(dto: CreateWorkOrderDto, userId?: string) {
    const workOrderNumber = `WO-${Date.now()}`;
    const wo = await this.prisma.workOrder.create({
      data: {
        id: crypto.randomUUID(),
        workOrderNumber,
        title: dto.title,
        description: dto.description ?? null,
        workshopId: dto.workshopId,
        branchId: dto.branchId,
        outputVariantId: dto.outputVariantId ?? null,
        plannedQuantity: dto.plannedQuantity ?? 1,
        priority: dto.priority ?? 1,
        scheduledStartAt: dto.scheduledStartAt ? new Date(dto.scheduledStartAt) : null,
        scheduledEndAt: dto.scheduledEndAt ? new Date(dto.scheduledEndAt) : null,
        supervisorId: dto.supervisorId ?? null,
        orderId: dto.orderId ?? null,
        customerId: dto.customerId ?? null,
        estimatedCost: dto.estimatedCost ?? null,
        currencyCode: dto.currencyCode ?? null,
        notes: dto.notes ?? null,
        status: 'DRAFT',
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'work_order', entityId: wo.id });
    return { data: wo };
  }

  private async changeStatus(id: string, from: string[], to: string, userId?: string, extra?: Record<string, unknown>) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id, deletedAt: null } });
    if (!wo) throw new NotFoundException(`Work order ${id} not found`);
    if (!from.includes(wo.status)) {
      throw new BadRequestException(`Cannot transition from ${wo.status} to ${to}`);
    }
    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: { status: to as any, ...extra },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'work_order', entityId: id, description: `Status: ${to}` });
    return { data: updated };
  }

  async start(id: string, userId?: string) {
    return this.changeStatus(id, ['DRAFT', 'SCHEDULED'], 'IN_PROGRESS', userId, { actualStartAt: new Date() });
  }

  async complete(id: string, userId?: string) {
    return this.changeStatus(id, ['IN_PROGRESS'], 'COMPLETED', userId, { actualEndAt: new Date() });
  }

  async cancel(id: string, userId?: string) {
    return this.changeStatus(id, ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'PAUSED'], 'CANCELLED', userId);
  }
}
