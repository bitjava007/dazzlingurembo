import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import * as crypto from 'crypto';
import type { Role } from '@prisma/client';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { rolePermissions: true },
        },
      },
    });

    return {
      data: roles.map((r: Role & { _count: { rolePermissions: number } }) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        permissionsCount: r._count.rolePermissions,
      })),
    };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id, deletedAt: null },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with id "${id}" not found`);
    }

    return { data: role };
  }

  async create(dto: CreateRoleDto, actorId?: string) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Restore deleted role
        const role = await this.prisma.role.update({
          where: { id: existing.id },
          data: {
            description: dto.description ?? existing.description,
            isSystem: dto.isSystem ?? existing.isSystem,
            deletedAt: null,
          },
        });
        return { data: role };
      }
      throw new ConflictException(`Role with name "${dto.name}" already exists`);
    }

    const role = await this.prisma.role.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        description: dto.description ?? null,
        isSystem: dto.isSystem ?? false,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entityType: 'role',
      entityId: role.id,
      description: `Created role: ${role.name}`,
    });

    this.logger.log(`Created role: ${role.name}`);
    return { data: role };
  }

  async update(id: string, dto: UpdateRoleDto, actorId?: string) {
    const role = await this.prisma.role.findUnique({
      where: { id, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException(`Role with id "${id}" not found`);
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify a system role');
    }

    if (dto.name && dto.name !== role.name) {
      const nameConflict = await this.prisma.role.findUnique({
        where: { name: dto.name },
      });
      if (nameConflict && !nameConflict.deletedAt) {
        throw new ConflictException(`Role with name "${dto.name}" already exists`);
      }
    }

    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'role',
      entityId: id,
      description: `Updated role: ${updated.name}`,
      oldValues: role,
      newValues: updated,
    });

    return { data: updated };
  }

  async remove(id: string, actorId?: string) {
    const role = await this.prisma.role.findUnique({
      where: { id, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException(`Role with id "${id}" not found`);
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete a system role');
    }

    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entityType: 'role',
      entityId: id,
      description: `Soft deleted role: ${role.name}`,
    });

    this.logger.log(`Soft deleted role: ${id}`);
  }

  async assignPermission(roleId: string, permissionId: string, actorId?: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException(`Role with id "${roleId}" not found`);
    }

    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with id "${permissionId}" not found`);
    }

    const existing = await this.prisma.rolePermission.findFirst({
      where: { roleId, permissionId },
    });

    if (existing) {
      throw new ConflictException('Permission already assigned to this role');
    }

    const rolePermission = await this.prisma.rolePermission.create({
      data: {
        id: crypto.randomUUID(),
        roleId,
        permissionId,
        grantedById: actorId ?? null,
      },
      include: {
        permission: true,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'role',
      entityId: roleId,
      description: `Assigned permission ${permission.module}:${permission.action} to role ${role.name}`,
    });

    return { data: rolePermission };
  }

  async removePermission(roleId: string, permissionId: string, actorId?: string) {
    const rolePermission = await this.prisma.rolePermission.findFirst({
      where: { roleId, permissionId },
      include: {
        permission: true,
        role: { select: { name: true } },
      },
    });

    if (!rolePermission) {
      throw new NotFoundException('Permission not assigned to this role');
    }

    await this.prisma.rolePermission.delete({ where: { id: rolePermission.id } });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'role',
      entityId: roleId,
      description: `Removed permission ${rolePermission.permission.module}:${rolePermission.permission.action} from role ${rolePermission.role.name}`,
    });
  }
}
