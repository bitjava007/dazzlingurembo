import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBOMDto, CreateBOMItemDto } from './dto/create-bom.dto';

@Injectable()
export class BOMService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.bOM.findMany({
        where: { deletedAt: null },
        skip, take: limit,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          items: { include: { materialVariant: { select: { id: true, name: true, sku: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bOM.count({ where: { deletedAt: null } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const bom = await this.prisma.bOM.findFirst({
      where: { id, deletedAt: null },
      include: { product: true, items: { include: { materialVariant: { select: { id: true, name: true, sku: true } } } } },
    });
    if (!bom) throw new NotFoundException(`BOM ${id} not found`);
    return { data: bom };
  }

  async findByProduct(productId: string) {
    const bom = await this.prisma.bOM.findFirst({
      where: { productId, deletedAt: null },
      include: { items: { include: { materialVariant: { select: { id: true, name: true, sku: true } } } } },
    });
    return { data: bom };
  }

  async create(dto: CreateBOMDto, userId?: string) {
    const { items, ...rest } = dto;
    const bom = await this.prisma.bOM.create({
      data: {
        id: crypto.randomUUID(),
        productId: rest.productId,
        name: rest.name,
        version: rest.version ?? '1.0',
        isActive: rest.isActive ?? true,
        notes: rest.notes ?? null,
        createdById: userId ?? null,
        items: items ? {
          create: items.map(i => ({
            id: crypto.randomUUID(),
            materialVariantId: i.materialVariantId,
            quantity: i.quantity,
            unit: i.unit ?? 'PCS',
            wastagePercent: i.wastagePercent ?? null,
            materialType: i.materialType ?? 'FABRIC',
            notes: i.notes ?? null,
          })),
        } : undefined,
      },
      include: { items: true },
    });
    return { data: bom };
  }

  async addItem(bomId: string, dto: CreateBOMItemDto) {
    const bom = await this.prisma.bOM.findFirst({ where: { id: bomId, deletedAt: null } });
    if (!bom) throw new NotFoundException(`BOM ${bomId} not found`);
    const item = await this.prisma.bOMItem.create({
      data: {
        id: crypto.randomUUID(),
        bomId,
        materialVariantId: dto.materialVariantId,
        quantity: dto.quantity,
        unit: dto.unit ?? 'PCS',
        wastagePercent: dto.wastagePercent ?? null,
        materialType: dto.materialType ?? 'FABRIC',
        notes: dto.notes ?? null,
      },
    });
    return { data: item };
  }

  async removeItem(itemId: string) {
    await this.prisma.bOMItem.delete({ where: { id: itemId } });
  }

  async explode(bomId: string, quantity: number) {
    const bom = await this.prisma.bOM.findFirst({
      where: { id: bomId, deletedAt: null },
      include: { items: { include: { materialVariant: { select: { id: true, name: true, sku: true } } } } },
    });
    if (!bom) throw new NotFoundException(`BOM ${bomId} not found`);
    const materials = bom.items.map(item => ({
      materialVariantId: item.materialVariantId,
      materialVariant: item.materialVariant,
      unit: item.unit,
      materialType: item.materialType,
      requiredQuantity: Number(item.quantity) * quantity,
      withWastage: Number(item.quantity) * quantity * (1 + Number(item.wastagePercent ?? 0) / 100),
    }));
    return { data: { bomId, productQuantity: quantity, materials } };
  }

  async remove(id: string) {
    const bom = await this.prisma.bOM.findFirst({ where: { id, deletedAt: null } });
    if (!bom) throw new NotFoundException(`BOM ${id} not found`);
    await this.prisma.bOM.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
