import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import * as crypto from 'crypto';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });

    // Group by module
    const grouped = permissions.reduce(
      (acc, p) => {
        if (!acc[p.module]) {
          acc[p.module] = [];
        }
        acc[p.module].push(p);
        return acc;
      },
      {} as Record<string, typeof permissions>,
    );

    return { data: grouped };
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });

    if (!permission) {
      throw new NotFoundException(`Permission with id "${id}" not found`);
    }

    return { data: permission };
  }

  async create(dto: CreatePermissionDto, actorId?: string) {
    const existing = await this.prisma.permission.findUnique({
      where: { module_action: { module: dto.module, action: dto.action } },
    });

    if (existing) {
      throw new ConflictException(
        `Permission "${dto.module}:${dto.action}" already exists`,
      );
    }

    const permission = await this.prisma.permission.create({
      data: {
        id: crypto.randomUUID(),
        module: dto.module,
        action: dto.action,
        description: dto.description ?? null,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entityType: 'permission',
      entityId: permission.id,
      description: `Created permission: ${permission.module}:${permission.action}`,
    });

    this.logger.log(`Created permission: ${permission.module}:${permission.action}`);
    return { data: permission };
  }

  async remove(id: string, actorId?: string) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });

    if (!permission) {
      throw new NotFoundException(`Permission with id "${id}" not found`);
    }

    await this.prisma.permission.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entityType: 'permission',
      entityId: id,
      description: `Deleted permission: ${permission.module}:${permission.action}`,
    });

    this.logger.log(`Deleted permission: ${id}`);
  }
}
