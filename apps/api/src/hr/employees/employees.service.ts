import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryEmployeesDto) {
    const { page = 1, limit = 20, departmentId, branchId, status, search } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (departmentId) where['departmentId'] = departmentId;
    if (branchId) where['branchId'] = branchId;
    if (status) where['isActive'] = status === 'ACTIVE';
    if (search) {
      where['OR'] = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
        },
        orderBy: { lastName: 'asc' },
      }),
      this.prisma.employee.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id, deletedAt: null },
      include: {
        department: true,
        branch: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
    if (!employee) throw new NotFoundException(`Employee ${id} not found`);
    return { data: employee };
  }

  async create(dto: CreateEmployeeDto, userId?: string) {
    const employee = await this.prisma.employee.create({
      data: {
        id: crypto.randomUUID(),
        employeeNumber: dto.employeeCode,
        userId: dto.userId ?? null,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone ?? null,
        departmentId: dto.departmentId,
        branchId: dto.branchId,
        jobTitle: dto.jobTitle,
        hireDate: new Date(dto.hireDate),
        baseSalary: dto.salary,
        currencyCode: dto.currencyCode,
        employmentType: dto.employmentType,
        isActive: !dto.status || dto.status === 'ACTIVE',
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'employee', entityId: employee.id });
    return { data: employee };
  }

  async update(id: string, dto: UpdateEmployeeDto, userId?: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id, deletedAt: null } });
    if (!employee) throw new NotFoundException(`Employee ${id} not found`);
    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        departmentId: dto.departmentId,
        branchId: dto.branchId,
        jobTitle: dto.jobTitle,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
        baseSalary: dto.salary,
        currencyCode: dto.currencyCode,
        employmentType: dto.employmentType,
        isActive: dto.status ? dto.status === 'ACTIVE' : undefined,
      },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'employee', entityId: id });
    return { data: updated };
  }

  async updateStatus(id: string, status: string, userId?: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id, deletedAt: null } });
    if (!employee) throw new NotFoundException(`Employee ${id} not found`);
    const updated = await this.prisma.employee.update({
      where: { id },
      data: { isActive: status === 'ACTIVE' },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'employee', entityId: id, description: `Status changed to ${status}` });
    return { data: updated };
  }

  async remove(id: string, userId?: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id, deletedAt: null } });
    if (!employee) throw new NotFoundException(`Employee ${id} not found`);
    await this.prisma.employee.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ userId, action: 'DELETE', entityType: 'employee', entityId: id });
    return { data: { id } };
  }
}
