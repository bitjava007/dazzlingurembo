import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: { page?: number; limit?: number; branchId?: string }) {
    const { page = 1, limit = 20, branchId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (branchId) where['branchId'] = branchId;

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: limit,
        include: {
          parent: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
          _count: { select: { employees: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.department.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id, deletedAt: null },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: { where: { deletedAt: null }, select: { id: true, name: true, code: true } },
        branch: { select: { id: true, name: true, code: true } },
        employees: { where: { deletedAt: null }, select: { id: true, firstName: true, lastName: true, jobTitle: true } },
      },
    });
    if (!dept) throw new NotFoundException(`Department ${id} not found`);
    return { data: dept };
  }

  async create(dto: CreateDepartmentDto, userId?: string) {
    const dept = await this.prisma.department.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        code: dto.code,
        parentId: dto.parentId ?? null,
        managerId: dto.managerId ?? null,
        branchId: dto.branchId ?? null,
        description: dto.description ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'department', entityId: dept.id });
    return { data: dept };
  }

  async update(id: string, dto: Partial<CreateDepartmentDto>, userId?: string) {
    const dept = await this.prisma.department.findUnique({ where: { id, deletedAt: null } });
    if (!dept) throw new NotFoundException(`Department ${id} not found`);
    const updated = await this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        parentId: dto.parentId,
        managerId: dto.managerId,
        branchId: dto.branchId,
        description: dto.description,
      },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'department', entityId: id });
    return { data: updated };
  }

  async remove(id: string, userId?: string) {
    const dept = await this.prisma.department.findUnique({ where: { id, deletedAt: null } });
    if (!dept) throw new NotFoundException(`Department ${id} not found`);
    await this.prisma.department.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ userId, action: 'DELETE', entityType: 'department', entityId: id });
    return { data: { id } };
  }
}
