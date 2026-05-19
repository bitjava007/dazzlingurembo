import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class VariantsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async findAll(productId: string) {
    const data = await this.prisma.productVariant.findMany({
      where: { productId, deletedAt: null },
      orderBy: { position: 'asc' },
      include: { stockBalances: { include: { warehouse: { select: { id: true, name: true } } } } },
    });
    return { data };
  }

  async findOne(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id, deletedAt: null },
      include: {
        product: { select: { id: true, name: true, slug: true, baseCurrencyCode: true, basePrice: true } },
        stockBalances: { include: { warehouse: true } },
        skus: true,
      },
    });
    if (!variant) throw new NotFoundException(`Variant ${id} not found`);
    return { data: variant };
  }

  async create(productId: string, dto: CreateVariantDto, actorId?: string) {
    const existing = await this.prisma.productVariant.findUnique({ where: { sku: dto.sku } });
    if (existing && !existing.deletedAt) throw new ConflictException(`SKU "${dto.sku}" already exists`);

    const variant = await this.prisma.productVariant.create({
      data: {
        id: crypto.randomUUID(),
        productId,
        name: dto.name, sku: dto.sku,
        barcode: dto.barcode ?? null,
        color: dto.color ?? null,
        size: dto.size ?? null,
        material: dto.material ?? null,
        priceAdjustment: dto.priceAdjustment ?? 0,
        costAdjustment: dto.costAdjustment ?? 0,
        isActive: dto.isActive ?? true,
        imageUrl: dto.imageUrl ?? null,
        position: dto.position ?? 0,
      },
    });
    await this.audit.log({ userId: actorId, action: 'CREATE', entityType: 'productVariant', entityId: variant.id });
    return { data: variant };
  }

  async update(id: string, dto: UpdateVariantDto, actorId?: string) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id, deletedAt: null } });
    if (!variant) throw new NotFoundException(`Variant ${id} not found`);
    const updated = await this.prisma.productVariant.update({ where: { id }, data: dto as object });
    await this.audit.log({ userId: actorId, action: 'UPDATE', entityType: 'productVariant', entityId: id });
    return { data: updated };
  }

  async remove(id: string, actorId?: string) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id, deletedAt: null } });
    if (!variant) throw new NotFoundException(`Variant ${id} not found`);
    await this.prisma.productVariant.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ userId: actorId, action: 'DELETE', entityType: 'productVariant', entityId: id });
  }
}
