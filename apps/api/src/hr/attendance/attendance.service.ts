import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

interface QueryAttendanceDto {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryAttendanceDto) {
    const { page = 1, limit = 20, employeeId, startDate, endDate, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (employeeId) where['employeeId'] = employeeId;
    if (status) where['status'] = status;
    if (startDate || endDate) {
      where['date'] = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.attendance.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByEmployee(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const data = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
    return { data };
  }

  async create(dto: CreateAttendanceDto, userId?: string) {
    // Find a branchId for the employee
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException(`Employee ${dto.employeeId} not found`);

    const attendance = await this.prisma.attendance.create({
      data: {
        id: crypto.randomUUID(),
        employeeId: dto.employeeId,
        branchId: employee.branchId ?? '',
        date: new Date(dto.date),
        status: dto.status as any,
        checkInAt: dto.checkIn ? new Date(dto.checkIn) : null,
        checkOutAt: dto.checkOut ? new Date(dto.checkOut) : null,
        notes: dto.notes ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'attendance', entityId: attendance.id });
    return { data: attendance };
  }

  async update(id: string, dto: Partial<CreateAttendanceDto>, userId?: string) {
    const attendance = await this.prisma.attendance.findUnique({ where: { id } });
    if (!attendance) throw new NotFoundException(`Attendance ${id} not found`);
    const updated = await this.prisma.attendance.update({
      where: { id },
      data: {
        status: dto.status as any,
        checkInAt: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOutAt: dto.checkOut ? new Date(dto.checkOut) : undefined,
        notes: dto.notes,
      },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'attendance', entityId: id });
    return { data: updated };
  }

  async bulkCreate(records: CreateAttendanceDto[], userId?: string) {
    const results = [];
    for (const dto of records) {
      const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
      if (!employee) continue;
      const attendance = await this.prisma.attendance.upsert({
        where: { employeeId_date: { employeeId: dto.employeeId, date: new Date(dto.date) } },
        create: {
          id: crypto.randomUUID(),
          employeeId: dto.employeeId,
          branchId: employee.branchId ?? '',
          date: new Date(dto.date),
          status: dto.status as any,
          checkInAt: dto.checkIn ? new Date(dto.checkIn) : null,
          checkOutAt: dto.checkOut ? new Date(dto.checkOut) : null,
          notes: dto.notes ?? null,
        },
        update: {
          status: dto.status as any,
          checkInAt: dto.checkIn ? new Date(dto.checkIn) : null,
          checkOutAt: dto.checkOut ? new Date(dto.checkOut) : null,
          notes: dto.notes ?? null,
        },
      });
      results.push(attendance);
    }
    await this.audit.log({ userId, action: 'CREATE', entityType: 'attendance', description: `Bulk created ${results.length} records` });
    return { data: results, meta: { count: results.length } };
  }
}
