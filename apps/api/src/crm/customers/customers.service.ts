import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryCustomersDto) {
    const { page = 1, limit = 20, search, tier, countryId, primaryBranchId, isVip, isBlacklisted } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (tier) where['tier'] = tier;
    if (countryId) where['countryId'] = countryId;
    if (primaryBranchId) where['primaryBranchId'] = primaryBranchId;
    if (isVip !== undefined) where['isVip'] = isVip;
    if (isBlacklisted !== undefined) where['isBlacklisted'] = isBlacklisted;
    if (search) {
      where['OR'] = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.customer.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id, deletedAt: null },
      include: {
        loyaltyAccount: true,
        _count: { select: { orders: true, customerNotes: true, communicationHistory: true } },
      },
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return { data: customer };
  }

  async create(dto: CreateCustomerDto, actorId?: string) {
    if (dto.email) {
      const existing = await this.prisma.customer.findUnique({ where: { email: dto.email } });
      if (existing && !existing.deletedAt) throw new ConflictException(`Email already registered`);
    }

    const code = `CUST-${Date.now().toString(36).toUpperCase()}`;
    const customer = await this.prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        code,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        phone2: dto.phone2 ?? null,
        gender: dto.gender ?? null,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        nationalId: dto.nationalId ?? null,
        passportNumber: dto.passportNumber ?? null,
        nationality: dto.nationality ?? null,
        preferredLanguage: dto.preferredLanguage ?? 'en',
        tier: dto.tier ?? 'BRONZE',
        addressLine1: dto.addressLine1 ?? null,
        addressLine2: dto.addressLine2 ?? null,
        city: dto.city ?? null,
        stateRegion: dto.stateRegion ?? null,
        postalCode: dto.postalCode ?? null,
        countryId: dto.countryId ?? null,
        primaryBranchId: dto.primaryBranchId ?? null,
        isVip: dto.isVip ?? false,
        marketingConsent: dto.marketingConsent ?? false,
        notes: dto.notes ?? null,
        source: dto.source ?? null,
      },
    });

    await this.audit.log({ userId: actorId, action: 'CREATE', entityType: 'customer', entityId: customer.id, description: `Created customer ${customer.code}` });
    this.logger.log(`Created customer: ${customer.code}`);
    return { data: customer };
  }

  async update(id: string, dto: UpdateCustomerDto, actorId?: string) {
    const existing = await this.prisma.customer.findUnique({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException(`Customer ${id} not found`);

    const data: Record<string, unknown> = {};
    const fields = ['firstName', 'lastName', 'email', 'phone', 'phone2', 'gender', 'nationality',
      'preferredLanguage', 'tier', 'addressLine1', 'addressLine2', 'city', 'stateRegion',
      'postalCode', 'countryId', 'primaryBranchId', 'isVip', 'marketingConsent', 'notes',
      'source', 'nationalId', 'passportNumber', 'isBlacklisted', 'blacklistReason'] as const;

    for (const f of fields) {
      if (dto[f] !== undefined) data[f] = dto[f];
    }
    if (dto.dateOfBirth !== undefined) data['dateOfBirth'] = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;

    const customer = await this.prisma.customer.update({ where: { id }, data });
    await this.audit.log({ userId: actorId, action: 'UPDATE', entityType: 'customer', entityId: id, oldValues: existing, newValues: customer });
    return { data: customer };
  }

  async remove(id: string, actorId?: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id, deletedAt: null } });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    await this.prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ userId: actorId, action: 'DELETE', entityType: 'customer', entityId: id });
  }
}
