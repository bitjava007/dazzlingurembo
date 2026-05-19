import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryLogsDto } from './dto/query-logs.dto';

export interface CreateNotificationLogParams {
  templateId?: string;
  channel: string;
  recipientId?: string;
  recipientType?: string;
  recipientAddress?: string;
  subject?: string;
  body?: string;
  variables?: Record<string, string>;
  referenceType?: string;
  referenceId?: string;
  status?: string;
  failureReason?: string;
  sentAt?: Date;
}

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryLogsDto) {
    const { page = 1, limit = 20, userId, channel, status, entityType, entityId, startDate, endDate } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (userId) where['recipientId'] = userId;
    if (channel) where['channel'] = channel;
    if (status) where['status'] = status;
    if (entityType) where['referenceType'] = entityType;
    if (entityId) where['referenceId'] = entityId;
    if (startDate || endDate) {
      where['createdAt'] = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          template: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notificationLog.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByEntity(entityType: string, entityId: string) {
    const data = await this.prisma.notificationLog.findMany({
      where: { referenceType: entityType, referenceId: entityId },
      include: {
        template: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data };
  }

  async create(params: CreateNotificationLogParams) {
    const log = await this.prisma.notificationLog.create({
      data: {
        id: crypto.randomUUID(),
        templateId: params.templateId ?? null,
        channel: params.channel as any,
        status: (params.status ?? 'QUEUED') as any,
        recipientId: params.recipientId ?? null,
        recipientType: params.recipientType ?? null,
        recipientAddress: params.recipientAddress ?? null,
        subject: params.subject ?? null,
        body: params.body ?? null,
        variables: params.variables as any ?? null,
        referenceType: params.referenceType ?? null,
        referenceId: params.referenceId ?? null,
        failureReason: params.failureReason ?? null,
        sentAt: params.sentAt ?? null,
      },
    });
    return log;
  }
}
