import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import * as crypto from 'crypto';

@Injectable()
export class CountriesService {
  private readonly logger = new Logger(CountriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(isActive?: boolean) {
    const where = {
      deletedAt: null,
      ...(isActive !== undefined ? { isActive } : {}),
    };

    const countries = await this.prisma.country.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return { data: countries };
  }

  async findOne(id: string) {
    const country = await this.prisma.country.findUnique({
      where: { id, deletedAt: null },
    });

    if (!country) {
      throw new NotFoundException(`Country with id "${id}" not found`);
    }

    return { data: country };
  }

  async create(dto: CreateCountryDto, actorId?: string) {
    const existing = await this.prisma.country.findFirst({
      where: {
        isoCode2: dto.isoCode2,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(`Country with ISO code "${dto.isoCode2}" already exists`);
    }

    const country = await this.prisma.country.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        isoCode2: dto.isoCode2,
        isoCode3: dto.isoCode3,
        dialCode: dto.dialCode ?? null,
        currencyCode: dto.currencyCode,
        currencyName: dto.currencyName,
        currencySymbol: dto.currencySymbol,
        locale: dto.locale ?? 'en',
        timezone: dto.timezone ?? 'UTC',
        isActive: dto.isActive ?? true,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entityType: 'country',
      entityId: country.id,
      description: `Created country: ${country.name} (${country.isoCode2})`,
    });

    this.logger.log(`Created country: ${country.name}`);
    return { data: country };
  }

  async update(id: string, dto: UpdateCountryDto, actorId?: string) {
    const country = await this.prisma.country.findUnique({
      where: { id, deletedAt: null },
    });

    if (!country) {
      throw new NotFoundException(`Country with id "${id}" not found`);
    }

    const updated = await this.prisma.country.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.dialCode !== undefined ? { dialCode: dto.dialCode } : {}),
        ...(dto.currencyCode !== undefined ? { currencyCode: dto.currencyCode } : {}),
        ...(dto.currencyName !== undefined ? { currencyName: dto.currencyName } : {}),
        ...(dto.currencySymbol !== undefined ? { currencySymbol: dto.currencySymbol } : {}),
        ...(dto.locale !== undefined ? { locale: dto.locale } : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'country',
      entityId: id,
      description: `Updated country: ${updated.name}`,
      oldValues: country,
      newValues: updated,
    });

    return { data: updated };
  }

  async remove(id: string, actorId?: string) {
    const country = await this.prisma.country.findUnique({
      where: { id, deletedAt: null },
    });

    if (!country) {
      throw new NotFoundException(`Country with id "${id}" not found`);
    }

    await this.prisma.country.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entityType: 'country',
      entityId: id,
      description: `Soft deleted country: ${country.name}`,
    });

    this.logger.log(`Soft deleted country: ${id}`);
  }
}
