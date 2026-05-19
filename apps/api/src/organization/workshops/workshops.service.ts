import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import * as crypto from 'crypto';

@Injectable()
export class WorkshopsService {
  private readonly logger = new Logger(WorkshopsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(params?: { branchId?: string; isActive?: boolean }) {
    const where = {
      deletedAt: null,
      ...(params?.branchId ? { branchId: params.branchId } : {}),
      ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
    };

    const workshops = await this.prisma.workshop.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
    });

    return { data: workshops };
  }

  async findOne(id: string) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id, deletedAt: null },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
    });

    if (!workshop) {
      throw new NotFoundException(`Workshop with id "${id}" not found`);
    }

    return { data: workshop };
  }

  async create(dto: CreateWorkshopDto, actorId?: string) {
    const existing = await this.prisma.workshop.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Workshop with code "${dto.code}" already exists`);
    }

    const workshop = await this.prisma.workshop.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        code: dto.code,
        branchId: dto.branchId,
        address: dto.address ?? null,
        capacity: dto.capacity ?? null,
        isActive: dto.isActive ?? true,
        specialties: dto.specialties ?? [],
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entityType: 'workshop',
      entityId: workshop.id,
      description: `Created workshop: ${workshop.name} (${workshop.code})`,
      branchId: workshop.branchId,
    });

    this.logger.log(`Created workshop: ${workshop.name}`);
    return { data: workshop };
  }

  async update(id: string, dto: UpdateWorkshopDto, actorId?: string) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id, deletedAt: null },
    });

    if (!workshop) {
      throw new NotFoundException(`Workshop with id "${id}" not found`);
    }

    const updated = await this.prisma.workshop.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.branchId !== undefined ? { branchId: dto.branchId } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.specialties !== undefined ? { specialties: dto.specialties } : {}),
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'workshop',
      entityId: id,
      description: `Updated workshop: ${updated.name}`,
      oldValues: workshop,
      newValues: updated,
      branchId: updated.branchId,
    });

    return { data: updated };
  }

  async remove(id: string, actorId?: string) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id, deletedAt: null },
    });

    if (!workshop) {
      throw new NotFoundException(`Workshop with id "${id}" not found`);
    }

    await this.prisma.workshop.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entityType: 'workshop',
      entityId: id,
      description: `Soft deleted workshop: ${workshop.name}`,
    });

    this.logger.log(`Soft deleted workshop: ${id}`);
  }
}
