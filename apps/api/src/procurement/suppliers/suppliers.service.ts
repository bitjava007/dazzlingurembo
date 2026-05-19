import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

export interface QuerySuppliersDto {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QuerySuppliersDto) {
    const { page = 1, limit = 20, search, isActive } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (isActive !== undefined) where['isActive'] = isActive;
    if (search) {
      where['OR'] = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.supplier.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id, deletedAt: null },
      include: {
        _count: { select: { purchaseOrders: true, supplierPayments: true } },
      },
    });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return { data: supplier };
  }

  async create(dto: CreateSupplierDto, userId?: string) {
    const existing = await this.prisma.supplier.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`Supplier with code ${dto.code} already exists`);

    const supplier = await this.prisma.supplier.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        code: dto.code,
        contactPerson: dto.contactPerson ?? null,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        website: dto.website ?? null,
        taxId: dto.taxId ?? null,
        currencyCode: dto.currencyCode ?? null,
        paymentTerms: dto.paymentTerms ?? null,
        addressLine1: dto.addressLine1 ?? null,
        addressLine2: dto.addressLine2 ?? null,
        city: dto.city ?? null,
        stateRegion: dto.stateRegion ?? null,
        postalCode: dto.postalCode ?? null,
        countryCode: dto.countryCode ?? null,
        rating: dto.rating ?? null,
        isActive: dto.isActive ?? true,
        notes: dto.notes ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'supplier', entityId: supplier.id });
    return { data: supplier };
  }

  async update(id: string, dto: Partial<CreateSupplierDto>, userId?: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id, deletedAt: null } });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    const updated = await this.prisma.supplier.update({
      where: { id },
      data: {
        name: dto.name,
        contactPerson: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        taxId: dto.taxId,
        currencyCode: dto.currencyCode,
        paymentTerms: dto.paymentTerms,
        addressLine1: dto.addressLine1,
        city: dto.city,
        countryCode: dto.countryCode,
        rating: dto.rating,
        isActive: dto.isActive,
        notes: dto.notes,
      },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'supplier', entityId: id });
    return { data: updated };
  }

  async remove(id: string, userId?: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id, deletedAt: null } });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    await this.prisma.supplier.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ userId, action: 'DELETE', entityType: 'supplier', entityId: id });
    return { data: { success: true } };
  }
}
