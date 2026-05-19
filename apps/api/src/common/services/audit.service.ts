import { Injectable, Logger } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogParams {
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  description?: string;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string;
  userAgent?: string;
  branchId?: string;
  countryId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: params.userId ?? null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId ?? null,
          description: params.description ?? null,
          oldValues: params.oldValues !== undefined ? (params.oldValues as object) : undefined,
          newValues: params.newValues !== undefined ? (params.newValues as object) : undefined,
          ipAddress: params.ipAddress ?? null,
          userAgent: params.userAgent ?? null,
          branchId: params.branchId ?? null,
          countryId: params.countryId ?? null,
        },
      });
    } catch (error) {
      this.logger.error('Failed to write audit log', error);
    }
  }
}
