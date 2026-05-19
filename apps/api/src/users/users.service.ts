import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserStatus } from '@prisma/client';

const SALT_ROUNDS = 12;

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  status: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  mustChangePassword: true,
  countryId: true,
  branchId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: QueryUsersDto) {
    const { page = 1, limit = 20, status, branchId, countryId } = query;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(branchId ? { branchId } : {}),
      ...(countryId ? { countryId } : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        ...USER_SELECT,
        userRoles: {
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                isSystem: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return { data: user };
  }

  async create(dto: CreateUserDto, actorId?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(`User with email "${dto.email}" already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone ?? null,
        countryId: dto.countryId ?? null,
        branchId: dto.branchId ?? null,
        status: UserStatus.PENDING_VERIFICATION,
      },
      select: USER_SELECT,
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entityType: 'user',
      entityId: user.id,
      description: `Created user: ${user.email}`,
      newValues: { email: user.email, firstName: user.firstName, lastName: user.lastName },
    });

    this.logger.log(`Created user: ${user.email}`);
    return { data: user };
  }

  async update(id: string, dto: UpdateUserDto, actorId?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: USER_SELECT,
    });

    if (!existing) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
        ...(dto.countryId !== undefined ? { countryId: dto.countryId } : {}),
      },
      select: USER_SELECT,
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'user',
      entityId: id,
      description: `Updated user: ${user.email}`,
      oldValues: existing,
      newValues: user,
    });

    return { data: user };
  }

  async remove(id: string, actorId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entityType: 'user',
      entityId: id,
      description: `Soft deleted user: ${user.email}`,
    });

    this.logger.log(`Soft deleted user: ${id}`);
  }

  async updateStatus(id: string, status: UserStatus, actorId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, email: true, status: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
      select: USER_SELECT,
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'user',
      entityId: id,
      description: `Updated user status from ${user.status} to ${status}`,
      oldValues: { status: user.status },
      newValues: { status },
    });

    return { data: updated };
  }

  async assignRole(userId: string, dto: AssignRoleDto, actorId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException(`Role with id "${dto.roleId}" not found`);
    }

    // Check for existing active assignment
    const existing = await this.prisma.userRole.findFirst({
      where: {
        userId,
        roleId: dto.roleId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (existing) {
      throw new ConflictException('User already has this role assigned');
    }

    const userRole = await this.prisma.userRole.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        roleId: dto.roleId,
        branchId: dto.branchId ?? null,
        assignedBy: actorId ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      include: {
        role: { select: { id: true, name: true } },
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'user',
      entityId: userId,
      description: `Assigned role ${role.name} to user`,
    });

    return { data: userRole };
  }

  async removeRole(userId: string, roleId: string, actorId?: string) {
    const userRole = await this.prisma.userRole.findFirst({
      where: { userId, roleId },
      include: { role: { select: { name: true } } },
    });

    if (!userRole) {
      throw new NotFoundException('Role assignment not found');
    }

    await this.prisma.userRole.delete({ where: { id: userRole.id } });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'user',
      entityId: userId,
      description: `Removed role ${userRole.role.name} from user`,
    });
  }

  async assignBranch(userId: string, branchId: string, actorId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    if (branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId, deletedAt: null },
      });
      if (!branch) {
        throw new BadRequestException(`Branch with id "${branchId}" not found`);
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { branchId: branchId || null },
      select: USER_SELECT,
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'user',
      entityId: userId,
      description: `Updated user branch to ${branchId}`,
    });

    return { data: updated };
  }
}
