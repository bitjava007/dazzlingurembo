import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateOperatorAssignmentDto } from './dto/create-operator-assignment.dto';

export interface QueryOperatorAssignmentsDto {
  workOrderId?: string;
  operatorId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class OperatorAssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryOperatorAssignmentsDto) {
    const { page = 1, limit = 20, workOrderId, operatorId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (workOrderId) where['workOrderId'] = workOrderId;
    if (operatorId) where['operatorId'] = operatorId;

    const [data, total] = await Promise.all([
      this.prisma.operatorAssignment.findMany({
        where, skip, take: limit,
        include: {
          workOrder: { select: { id: true, workOrderNumber: true, title: true } },
          operator: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { assignedAt: 'desc' },
      }),
      this.prisma.operatorAssignment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async assign(dto: CreateOperatorAssignmentDto, userId?: string) {
    const assignment = await this.prisma.operatorAssignment.create({
      data: {
        id: crypto.randomUUID(),
        workOrderId: dto.workOrderId,
        operatorId: dto.operatorId,
        role: dto.role ?? null,
        startAt: dto.startAt ? new Date(dto.startAt) : null,
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        notes: dto.notes ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'operator_assignment', entityId: assignment.id });
    return { data: assignment };
  }

  async unassign(id: string, userId?: string) {
    const assignment = await this.prisma.operatorAssignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException(`Operator assignment ${id} not found`);
    await this.prisma.operatorAssignment.delete({ where: { id } });
    await this.audit.log({ userId, action: 'DELETE', entityType: 'operator_assignment', entityId: id });
    return { data: { success: true } };
  }
}
