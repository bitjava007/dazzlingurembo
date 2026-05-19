import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async findAll(query: QueryProductsDto) {
    const { page = 1, limit = 20, search, categoryId, status, brand } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (categoryId) where['categoryId'] = categoryId;
    if (status) where['status'] = status;
    if (brand) where['brand'] = brand;
    if (search) {
      where['OR'] = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { variants: true, media: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: true,
        variants: { where: { deletedAt: null }, include: { stockBalances: { take: 5 } } },
        media: { orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }] },
      },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return { data: product };
  }

  async create(dto: CreateProductDto, actorId?: string) {
    const existing = await this.prisma.product.findUnique({ where: { slug: dto.slug } });
    if (existing && !existing.deletedAt) throw new ConflictException(`Slug "${dto.slug}" already in use`);

    const product = await this.prisma.product.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name, slug: dto.slug,
        description: dto.description ?? null,
        shortDescription: dto.shortDescription ?? null,
        categoryId: dto.categoryId ?? null,
        brand: dto.brand ?? null,
        origin: dto.origin ?? null,
        materials: dto.materials ?? [],
        tags: dto.tags ?? [],
        status: dto.status ?? 'DRAFT',
        baseCurrencyCode: dto.baseCurrencyCode,
        basePrice: dto.basePrice,
        costPrice: dto.costPrice ?? null,
        weight: dto.weight ?? null,
        weightUnit: dto.weightUnit ?? 'kg',
        isSerialized: dto.isSerialized ?? false,
        trackInventory: dto.trackInventory ?? true,
        minStockLevel: dto.minStockLevel ?? 0,
        reorderPoint: dto.reorderPoint ?? 0,
        createdById: actorId ?? null,
      },
    });
    await this.audit.log({ userId: actorId, action: 'CREATE', entityType: 'product', entityId: product.id, description: `Created product: ${product.name}` });
    return { data: product };
  }

  async update(id: string, dto: UpdateProductDto, actorId?: string) {
    const product = await this.prisma.product.findUnique({ where: { id, deletedAt: null } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    const updated = await this.prisma.product.update({ where: { id }, data: dto as object });
    await this.audit.log({ userId: actorId, action: 'UPDATE', entityType: 'product', entityId: id });
    return { data: updated };
  }

  async remove(id: string, actorId?: string) {
    const product = await this.prisma.product.findUnique({ where: { id, deletedAt: null } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ userId: actorId, action: 'DELETE', entityType: 'product', entityId: id });
  }

  async getLowStock(reorderPoint?: number) {
    const data = await this.prisma.product.findMany({
      where: { deletedAt: null, trackInventory: true },
      include: {
        variants: {
          include: {
            stockBalances: {
              where: { quantityAvailable: { lte: reorderPoint ?? 5 } },
              include: { warehouse: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });
    return { data: data.filter(p => p.variants.some(v => v.stockBalances.length > 0)) };
  }
}
