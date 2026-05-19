import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSkuDto } from './dto/create-sku.dto';

@Injectable()
export class SkusService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(variantId: string) {
    const data = await this.prisma.sKU.findMany({ where: { variantId }, orderBy: { createdAt: 'desc' } });
    return { data };
  }

  async create(variantId: string, dto: CreateSkuDto) {
    const existing = await this.prisma.sKU.findUnique({ where: { sku: dto.sku } });
    if (existing) throw new ConflictException(`SKU "${dto.sku}" already exists`);
    const sku = await this.prisma.sKU.create({
      data: {
        id: crypto.randomUUID(),
        variantId,
        sku: dto.sku,
        barcode: dto.barcode ?? null,
        serialNumber: dto.serialNumber ?? null,
        batchNumber: dto.batchNumber ?? null,
        condition: dto.condition ?? 'NEW',
        isActive: dto.isActive ?? true,
      },
    });
    return { data: sku };
  }

  async remove(id: string) {
    const sku = await this.prisma.sKU.findUnique({ where: { id } });
    if (!sku) throw new NotFoundException(`SKU ${id} not found`);
    await this.prisma.sKU.delete({ where: { id } });
  }
}
