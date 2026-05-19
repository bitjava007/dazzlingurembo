import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommunicationDto } from './dto/create-communication.dto';

@Injectable()
export class CommunicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(customerId: string) {
    const data = await this.prisma.communicationHistory.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: { sentBy: { select: { id: true, firstName: true, lastName: true } } },
    });
    return { data };
  }

  async create(customerId: string, dto: CreateCommunicationDto, sentById?: string) {
    const comm = await this.prisma.communicationHistory.create({
      data: {
        id: crypto.randomUUID(),
        customerId,
        channel: dto.channel,
        direction: dto.direction,
        subject: dto.subject ?? null,
        body: dto.body ?? null,
        sentById: sentById ?? null,
        isRead: dto.isRead ?? false,
        referenceType: dto.referenceType ?? null,
        referenceId: dto.referenceId ?? null,
      },
    });
    return { data: comm };
  }

  async markRead(id: string) {
    const comm = await this.prisma.communicationHistory.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return { data: comm };
  }
}
