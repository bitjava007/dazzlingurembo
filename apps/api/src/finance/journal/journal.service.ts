import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';

export interface QueryJournalDto {
  branchId?: string;
  accountCode?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class JournalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QueryJournalDto) {
    const { page = 1, limit = 20, branchId, accountCode, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (branchId) where['branchId'] = branchId;
    if (accountCode) where['accountCode'] = accountCode;
    if (dateFrom || dateTo) {
      where['postDate'] = {};
      if (dateFrom) (where['postDate'] as Record<string, unknown>)['gte'] = new Date(dateFrom);
      if (dateTo) (where['postDate'] as Record<string, unknown>)['lte'] = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.financialJournal.findMany({
        where, skip, take: limit,
        orderBy: { postDate: 'desc' },
      }),
      this.prisma.financialJournal.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: CreateJournalEntryDto, userId?: string) {
    const entryNumber = `JE-${Date.now()}`;
    const entry = await this.prisma.financialJournal.create({
      data: {
        id: crypto.randomUUID(),
        entryNumber,
        description: dto.description,
        entryType: dto.entryType,
        branchId: dto.branchId,
        accountCode: dto.accountCode ?? null,
        originalCurrencyCode: dto.originalCurrencyCode,
        originalAmount: dto.originalAmount,
        convertedCurrencyCode: dto.convertedCurrencyCode ?? null,
        convertedAmount: dto.convertedAmount ?? null,
        exchangeRateSnapshot: dto.exchangeRateSnapshot ?? null,
        referenceType: dto.referenceType ?? null,
        referenceId: dto.referenceId ?? null,
        postDate: dto.date ? new Date(dto.date) : new Date(),
        postedById: userId ?? null,
        notes: dto.notes ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'financial_journal', entityId: entry.id });
    return { data: entry };
  }

  async findByReference(referenceType: string, referenceId: string) {
    const data = await this.prisma.financialJournal.findMany({
      where: { referenceType, referenceId },
      orderBy: { postDate: 'desc' },
    });
    return { data };
  }

  async findOne(id: string) {
    const entry = await this.prisma.financialJournal.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException(`Journal entry ${id} not found`);
    return { data: entry };
  }
}
