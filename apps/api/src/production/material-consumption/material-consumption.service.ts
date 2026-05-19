import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateMaterialConsumptionDto } from './dto/create-material-consumption.dto';

@Injectable()
export class MaterialConsumptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(workOrderId: string) {
    const data = await this.prisma.materialConsumption.findMany({
      where: { workOrderId },
      include: {
        variant: { select: { id: true, name: true, sku: true } },
        warehouse: { select: { id: true, name: true, code: true } },
      },
    });
    return { data };
  }

  async record(dto: CreateMaterialConsumptionDto, userId?: string) {
    const record = await this.prisma.materialConsumption.create({
      data: {
        id: crypto.randomUUID(),
        workOrderId: dto.workOrderId,
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        plannedQuantity: dto.plannedQuantity,
        consumedQuantity: dto.consumedQuantity ?? 0,
        unit: dto.unit ?? 'PCS',
        unitCost: dto.unitCost ?? null,
        consumedAt: new Date(),
        notes: dto.notes ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'material_consumption', entityId: record.id });
    return { data: record };
  }
}
