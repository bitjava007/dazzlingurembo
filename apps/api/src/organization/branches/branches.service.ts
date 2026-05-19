import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import * as crypto from 'crypto';

@Injectable()
export class BranchesService {
  private readonly logger = new Logger(BranchesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(params?: { countryId?: string; isActive?: boolean }) {
    const where = {
      deletedAt: null,
      ...(params?.countryId ? { countryId: params.countryId } : {}),
      ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
    };

    const branches = await this.prisma.branch.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        country: { select: { id: true, name: true, isoCode2: true } },
      },
    });

    return { data: branches };
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id, deletedAt: null },
      include: {
        country: { select: { id: true, name: true, isoCode2: true } },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with id "${id}" not found`);
    }

    return { data: branch };
  }

  async create(dto: CreateBranchDto, actorId?: string) {
    const existing = await this.prisma.branch.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Branch with code "${dto.code}" already exists`);
    }

    const branch = await this.prisma.branch.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        code: dto.code,
        type: dto.type,
        countryId: dto.countryId,
        address: dto.address ?? null,
        city: dto.city ?? null,
        stateRegion: dto.stateRegion ?? null,
        postalCode: dto.postalCode ?? null,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        isActive: dto.isActive ?? true,
        isHeadOffice: dto.isHeadOffice ?? false,
        openingDate: dto.openingDate ? new Date(dto.openingDate) : null,
        managerId: dto.managerId ?? null,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entityType: 'branch',
      entityId: branch.id,
      description: `Created branch: ${branch.name} (${branch.code})`,
      branchId: branch.id,
    });

    this.logger.log(`Created branch: ${branch.name}`);
    return { data: branch };
  }

  async update(id: string, dto: UpdateBranchDto, actorId?: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id, deletedAt: null },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with id "${id}" not found`);
    }

    const updated = await this.prisma.branch.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.stateRegion !== undefined ? { stateRegion: dto.stateRegion } : {}),
        ...(dto.postalCode !== undefined ? { postalCode: dto.postalCode } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.isHeadOffice !== undefined ? { isHeadOffice: dto.isHeadOffice } : {}),
        ...(dto.closingDate !== undefined ? { closingDate: new Date(dto.closingDate) } : {}),
        ...(dto.managerId !== undefined ? { managerId: dto.managerId } : {}),
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'branch',
      entityId: id,
      description: `Updated branch: ${updated.name}`,
      oldValues: branch,
      newValues: updated,
      branchId: id,
    });

    return { data: updated };
  }

  async remove(id: string, actorId?: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id, deletedAt: null },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with id "${id}" not found`);
    }

    await this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entityType: 'branch',
      entityId: id,
      description: `Soft deleted branch: ${branch.name}`,
    });

    this.logger.log(`Soft deleted branch: ${id}`);
  }
}
