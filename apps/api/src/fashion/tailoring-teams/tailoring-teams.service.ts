import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TailoringTeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; workshopId?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (query.workshopId) where['workshopId'] = query.workshopId;
    const [data, total] = await Promise.all([
      this.prisma.tailoringTeam.findMany({
        where, skip, take: limit,
        include: { workshop: { select: { id: true, name: true, code: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tailoringTeam.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const team = await this.prisma.tailoringTeam.findFirst({
      where: { id, deletedAt: null },
      include: { workshop: true },
    });
    if (!team) throw new NotFoundException(`Team ${id} not found`);
    return { data: team };
  }

  async create(dto: CreateTeamDto) {
    const team = await this.prisma.tailoringTeam.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        code: dto.code,
        workshopId: dto.workshopId,
        leaderId: dto.leaderId ?? null,
        capacity: dto.capacity ?? null,
        specialties: dto.specialties ?? [],
        isActive: dto.isActive ?? true,
      },
    });
    return { data: team };
  }

  async update(id: string, dto: Partial<CreateTeamDto>) {
    const team = await this.prisma.tailoringTeam.findFirst({ where: { id, deletedAt: null } });
    if (!team) throw new NotFoundException(`Team ${id} not found`);
    const updated = await this.prisma.tailoringTeam.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.workshopId !== undefined && { workshopId: dto.workshopId }),
        ...(dto.leaderId !== undefined && { leaderId: dto.leaderId }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.specialties !== undefined && { specialties: dto.specialties }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    return { data: updated };
  }

  async remove(id: string) {
    const team = await this.prisma.tailoringTeam.findFirst({ where: { id, deletedAt: null } });
    if (!team) throw new NotFoundException(`Team ${id} not found`);
    await this.prisma.tailoringTeam.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
