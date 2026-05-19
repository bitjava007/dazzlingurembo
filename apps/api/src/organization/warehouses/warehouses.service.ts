import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Decimal } from '@prisma/client/runtime/library';
import * as crypto from 'crypto';

@Injectable()
export class WarehousesService {
  private readonly logger = new Logger(WarehousesService.name);

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

    const warehouses = await this.prisma.warehouse.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
    });

    return { data: warehouses };
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id, deletedAt: null },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with id "${id}" not found`);
    }

    return { data: warehouse };
  }

  async create(dto: CreateWarehouseDto, actorId?: string) {
    const existing = await this.prisma.warehouse.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Warehouse with code "${dto.code}" already exists`);
    }

    const warehouse = await this.prisma.warehouse.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        code: dto.code,
        branchId: dto.branchId,
        address: dto.address ?? null,
        totalCapacity: dto.totalCapacity !== undefined ? new Decimal(dto.totalCapacity) : null,
        isActive: dto.isActive ?? true,
        isDefault: dto.isDefault ?? false,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entityType: 'warehouse',
      entityId: warehouse.id,
      description: `Created warehouse: ${warehouse.name} (${warehouse.code})`,
      branchId: warehouse.branchId,
    });

    this.logger.log(`Created warehouse: ${warehouse.name}`);
    return { data: warehouse };
  }

  async update(id: string, dto: UpdateWarehouseDto, actorId?: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id, deletedAt: null },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with id "${id}" not found`);
    }

    const updated = await this.prisma.warehouse.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.branchId !== undefined ? { branchId: dto.branchId } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.totalCapacity !== undefined
          ? { totalCapacity: new Decimal(dto.totalCapacity) }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'warehouse',
      entityId: id,
      description: `Updated warehouse: ${updated.name}`,
      oldValues: { ...warehouse, totalCapacity: warehouse.totalCapacity?.toString() },
      newValues: { ...updated, totalCapacity: updated.totalCapacity?.toString() },
      branchId: updated.branchId,
    });

    return { data: updated };
  }

  async remove(id: string, actorId?: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id, deletedAt: null },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with id "${id}" not found`);
    }

    await this.prisma.warehouse.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entityType: 'warehouse',
      entityId: id,
      description: `Soft deleted warehouse: ${warehouse.name}`,
    });

    this.logger.log(`Soft deleted warehouse: ${id}`);
  }
}
