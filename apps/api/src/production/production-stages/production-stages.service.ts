import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateProductionStageDto, CompleteStageDto, FailStageDto } from './dto/create-production-stage.dto';

@Injectable()
export class ProductionStagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(workOrderId: string) {
    const stages = await this.prisma.productionStage.findMany({
      where: { workOrderId },
      orderBy: { sequence: 'asc' },
    });
    return { data: stages };
  }

  async create(dto: CreateProductionStageDto, userId?: string) {
    const stage = await this.prisma.productionStage.create({
      data: {
        id: crypto.randomUUID(),
        workOrderId: dto.workOrderId,
        name: dto.name,
        description: dto.description ?? null,
        sequence: dto.sequence,
        plannedDuration: dto.plannedDuration ?? null,
        operatorId: dto.operatorId ?? null,
        notes: dto.notes ?? null,
        status: 'PENDING',
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'production_stage', entityId: stage.id });
    return { data: stage };
  }

  async start(id: string, userId?: string) {
    const stage = await this.prisma.productionStage.findUnique({ where: { id } });
    if (!stage) throw new NotFoundException(`Production stage ${id} not found`);
    if (stage.status !== 'PENDING') throw new BadRequestException('Stage must be PENDING to start');
    const updated = await this.prisma.productionStage.update({
      where: { id },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'production_stage', entityId: id });
    return { data: updated };
  }

  async complete(id: string, userId?: string, dto?: CompleteStageDto) {
    const stage = await this.prisma.productionStage.findUnique({ where: { id } });
    if (!stage) throw new NotFoundException(`Production stage ${id} not found`);
    if (stage.status !== 'IN_PROGRESS') throw new BadRequestException('Stage must be IN_PROGRESS to complete');
    const updated = await this.prisma.productionStage.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        actualDuration: dto?.actualDuration ?? null,
        notes: dto?.notes ?? stage.notes,
      },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'production_stage', entityId: id });
    return { data: updated };
  }

  async fail(id: string, userId?: string, dto?: FailStageDto) {
    const stage = await this.prisma.productionStage.findUnique({ where: { id } });
    if (!stage) throw new NotFoundException(`Production stage ${id} not found`);
    if (!['PENDING', 'IN_PROGRESS'].includes(stage.status)) {
      throw new BadRequestException('Stage must be PENDING or IN_PROGRESS to fail');
    }
    const updated = await this.prisma.productionStage.update({
      where: { id },
      data: {
        status: 'SKIPPED',
        notes: dto?.reason ? `${stage.notes ?? ''} | Failure reason: ${dto.reason}` : stage.notes,
      },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'production_stage', entityId: id, description: 'Stage failed' });
    return { data: updated };
  }
}
