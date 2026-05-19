import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateProofOfDeliveryDto } from './dto/create-pod.dto';

@Injectable()
export class ProofOfDeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findByDelivery(deliveryId: string) {
    const pod = await this.prisma.proofOfDelivery.findUnique({
      where: { deliveryId },
    });
    if (!pod) throw new NotFoundException(`Proof of delivery not found for delivery ${deliveryId}`);
    return { data: pod };
  }

  async create(dto: CreateProofOfDeliveryDto, userId?: string) {
    const existing = await this.prisma.proofOfDelivery.findUnique({ where: { deliveryId: dto.deliveryId } });
    if (existing) throw new ConflictException(`Proof of delivery already exists for this delivery`);

    const pod = await this.prisma.proofOfDelivery.create({
      data: {
        id: crypto.randomUUID(),
        deliveryId: dto.deliveryId,
        recipientName: dto.recipientName ?? null,
        recipientPhone: dto.recipientPhone ?? null,
        signatureUrl: dto.signatureUrl ?? null,
        photoUrls: dto.photoUrls ?? [],
        notes: dto.notes ?? null,
        deliveredAt: dto.deliveredAt ? new Date(dto.deliveredAt) : new Date(),
        receivedById: userId ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'proof_of_delivery', entityId: pod.id });
    return { data: pod };
  }
}
