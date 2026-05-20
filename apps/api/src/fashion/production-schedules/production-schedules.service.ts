import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class ProductionSchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; workshopId?: string; workOrderId?: string; startDate?: string; endDate?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (query.workshopId) where['workshopId'] = query.workshopId;
    if (query.workOrderId) where['workOrderId'] = query.workOrderId;
    if (query.startDate || query.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (query.startDate) dateFilter['gte'] = new Date(query.startDate);
      if (query.endDate) dateFilter['lte'] = new Date(query.endDate);
      where['scheduledDate'] = dateFilter;
    }
    const [data, total] = await Promise.all([
      this.prisma.productionSchedule.findMany({
        where, skip, take: limit,
        include: {
          workOrder: { select: { id: true, workOrderNumber: true, title: true } },
          workshop: { select: { id: true, name: true } },
          team: { select: { id: true, name: true } },
        },
        orderBy: { scheduledDate: 'asc' },
      }),
      this.prisma.productionSchedule.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findCalendar(workshopId: string, start: string, end: string) {
    const data = await this.prisma.productionSchedule.findMany({
      where: {
        workshopId,
        scheduledDate: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      include: {
        workOrder: { select: { id: true, workOrderNumber: true, title: true } },
        team: { select: { id: true, name: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });
    return { data };
  }

  async create(dto: CreateScheduleDto, userId?: string) {
    const schedule = await this.prisma.productionSchedule.create({
      data: {
        id: crypto.randomUUID(),
        workOrderId: dto.workOrderId,
        workshopId: dto.workshopId,
        scheduledDate: new Date(dto.scheduledDate),
        title: dto.title,
        teamId: dto.teamId ?? null,
        startTime: dto.startTime ? new Date(dto.startTime) : null,
        endTime: dto.endTime ? new Date(dto.endTime) : null,
        notes: dto.notes ?? null,
        createdById: userId ?? null,
      },
    });
    return { data: schedule };
  }

  async update(id: string, dto: Partial<CreateScheduleDto>) {
    const schedule = await this.prisma.productionSchedule.findFirst({ where: { id } });
    if (!schedule) throw new NotFoundException(`Schedule ${id} not found`);
    const updated = await this.prisma.productionSchedule.update({
      where: { id },
      data: {
        ...(dto.workOrderId && { workOrderId: dto.workOrderId }),
        ...(dto.workshopId && { workshopId: dto.workshopId }),
        ...(dto.scheduledDate && { scheduledDate: new Date(dto.scheduledDate) }),
        ...(dto.title && { title: dto.title }),
        ...(dto.teamId !== undefined && { teamId: dto.teamId }),
        ...(dto.startTime !== undefined && { startTime: dto.startTime ? new Date(dto.startTime) : null }),
        ...(dto.endTime !== undefined && { endTime: dto.endTime ? new Date(dto.endTime) : null }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
    return { data: updated };
  }

  async remove(id: string) {
    const schedule = await this.prisma.productionSchedule.findFirst({ where: { id } });
    if (!schedule) throw new NotFoundException(`Schedule ${id} not found`);
    await this.prisma.productionSchedule.delete({ where: { id } });
  }
}
