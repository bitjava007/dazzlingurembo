import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';

export interface QueryExchangeRatesDto {
  fromCurrencyCode?: string;
  toCurrencyCode?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ExchangeRatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryExchangeRatesDto) {
    const { page = 1, limit = 20, fromCurrencyCode, toCurrencyCode } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (fromCurrencyCode) where['fromCurrencyCode'] = fromCurrencyCode;
    if (toCurrencyCode) where['toCurrencyCode'] = toCurrencyCode;

    const [data, total] = await Promise.all([
      this.prisma.exchangeRate.findMany({
        where, skip, take: limit,
        orderBy: { effectiveFrom: 'desc' },
      }),
      this.prisma.exchangeRate.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: CreateExchangeRateDto) {
    const rate = await this.prisma.exchangeRate.create({
      data: {
        id: crypto.randomUUID(),
        fromCurrencyCode: dto.fromCurrencyCode,
        toCurrencyCode: dto.toCurrencyCode,
        rate: dto.rate,
        source: dto.source ?? 'MANUAL',
        countryId: dto.countryId ?? null,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
        isActive: true,
      },
    });
    return { data: rate };
  }

  async getLatest(fromCurrencyCode: string, toCurrencyCode: string) {
    const rate = await this.prisma.exchangeRate.findFirst({
      where: { fromCurrencyCode, toCurrencyCode, isActive: true },
      orderBy: { effectiveFrom: 'desc' },
    });
    if (!rate) throw new NotFoundException(`No exchange rate found for ${fromCurrencyCode} -> ${toCurrencyCode}`);
    return { data: rate };
  }

  async getForDate(fromCurrencyCode: string, toCurrencyCode: string, date: string) {
    const targetDate = new Date(date);
    const rate = await this.prisma.exchangeRate.findFirst({
      where: {
        fromCurrencyCode,
        toCurrencyCode,
        effectiveFrom: { lte: targetDate },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: targetDate } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
    if (!rate) throw new NotFoundException(`No exchange rate found for ${fromCurrencyCode} -> ${toCurrencyCode} on ${date}`);
    return { data: rate };
  }
}
