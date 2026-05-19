import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async findAll(isActive?: boolean) {
    const data = await this.prisma.productCategory.findMany({
      where: { deletedAt: null, ...(isActive !== undefined ? { isActive } : {}) },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        children: { where: { deletedAt: null }, select: { id: true, name: true, slug: true, sortOrder: true } },
        _count: { select: { products: true } },
      },
    });
    return { data };
  }

  async findOne(id: string) {
    const cat = await this.prisma.productCategory.findUnique({
      where: { id, deletedAt: null },
      include: { parent: true, children: { where: { deletedAt: null } } },
    });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    return { data: cat };
  }

  async create(dto: CreateCategoryDto, actorId?: string) {
    const existing = await this.prisma.productCategory.findUnique({ where: { slug: dto.slug } });
    if (existing && !existing.deletedAt) throw new ConflictException(`Slug "${dto.slug}" already in use`);

    const cat = await this.prisma.productCategory.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name, slug: dto.slug,
        description: dto.description ?? null,
        parentId: dto.parentId ?? null,
        imageUrl: dto.imageUrl ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        metaTitle: dto.metaTitle ?? null,
        metaDescription: dto.metaDescription ?? null,
      },
    });
    await this.audit.log({ userId: actorId, action: 'CREATE', entityType: 'productCategory', entityId: cat.id });
    return { data: cat };
  }

  async update(id: string, dto: UpdateCategoryDto, actorId?: string) {
    const cat = await this.prisma.productCategory.findUnique({ where: { id, deletedAt: null } });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    const updated = await this.prisma.productCategory.update({ where: { id }, data: dto as object });
    await this.audit.log({ userId: actorId, action: 'UPDATE', entityType: 'productCategory', entityId: id });
    return { data: updated };
  }

  async remove(id: string, actorId?: string) {
    const cat = await this.prisma.productCategory.findUnique({ where: { id, deletedAt: null } });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    await this.prisma.productCategory.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ userId: actorId, action: 'DELETE', entityType: 'productCategory', entityId: id });
  }
}
