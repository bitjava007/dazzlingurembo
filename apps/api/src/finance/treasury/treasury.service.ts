import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBankAccountDto, UpdateBankAccountDto, CreateBankTransactionDto } from './dto/create-bank-account.dto';

export interface QueryBankAccountsDto {
  branchId?: string;
  isActive?: string;
  page?: number;
  limit?: number;
}

export interface QueryTransactionsDto {
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TreasuryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllAccounts(query: QueryBankAccountsDto) {
    const { page = 1, limit = 20, branchId, isActive } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (branchId) where['branchId'] = branchId;
    if (isActive !== undefined) where['isActive'] = isActive === 'true';

    const [data, total] = await Promise.all([
      this.prisma.bankAccount.findMany({
        where, skip, take: limit,
        include: { branch: { select: { id: true, name: true, code: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bankAccount.count({ where }),
    ]);

    return {
      data: data.map((a) => ({ ...a, currentBalance: Number(a.currentBalance) })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneAccount(id: string) {
    const account = await this.prisma.bankAccount.findUnique({
      where: { id, deletedAt: null },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 10,
        },
      },
    });
    if (!account) throw new NotFoundException(`Bank account ${id} not found`);
    return {
      data: {
        ...account,
        currentBalance: Number(account.currentBalance),
        transactions: account.transactions.map((t) => ({ ...t, amount: Number(t.amount) })),
      },
    };
  }

  async createAccount(dto: CreateBankAccountDto) {
    const account = await this.prisma.bankAccount.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        iban: dto.iban ?? null,
        swift: dto.swift ?? null,
        currencyCode: dto.currencyCode,
        branchId: dto.branchId,
        notes: dto.notes ?? null,
        currentBalance: 0,
        isActive: true,
      },
    });
    return { data: { ...account, currentBalance: Number(account.currentBalance) } };
  }

  async updateAccount(id: string, dto: UpdateBankAccountDto) {
    const existing = await this.prisma.bankAccount.findUnique({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException(`Bank account ${id} not found`);

    const account = await this.prisma.bankAccount.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    return { data: { ...account, currentBalance: Number(account.currentBalance) } };
  }

  async deleteAccount(id: string) {
    const existing = await this.prisma.bankAccount.findUnique({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException(`Bank account ${id} not found`);
    await this.prisma.bankAccount.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getTransactions(bankAccountId: string, query: QueryTransactionsDto) {
    const { page = 1, limit = 20, type, from, to } = query;
    const skip = (page - 1) * limit;

    const existing = await this.prisma.bankAccount.findUnique({ where: { id: bankAccountId, deletedAt: null } });
    if (!existing) throw new NotFoundException(`Bank account ${bankAccountId} not found`);

    const where: Record<string, unknown> = { bankAccountId };
    if (type) where['type'] = type;
    if (from || to) {
      where['transactionDate'] = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.bankTransaction.findMany({
        where, skip, take: limit,
        orderBy: { transactionDate: 'desc' },
      }),
      this.prisma.bankTransaction.count({ where }),
    ]);

    return {
      data: data.map((t) => ({ ...t, amount: Number(t.amount) })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createTransaction(bankAccountId: string, amount: number, dto: CreateBankTransactionDto, userId?: string) {
    const account = await this.prisma.bankAccount.findUnique({ where: { id: bankAccountId, deletedAt: null } });
    if (!account) throw new NotFoundException(`Bank account ${bankAccountId} not found`);

    const transaction = await this.prisma.bankTransaction.create({
      data: {
        id: crypto.randomUUID(),
        bankAccountId,
        type: dto.type,
        amount,
        currencyCode: account.currencyCode,
        description: dto.description,
        referenceType: dto.referenceType ?? null,
        referenceId: dto.referenceId ?? null,
        transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : new Date(),
      },
    });

    const delta = dto.type === 'INFLOW' ? amount : -amount;
    await this.prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: { currentBalance: { increment: delta } },
    });

    return { data: { ...transaction, amount: Number(transaction.amount) } };
  }

  async getCashPosition() {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { deletedAt: null, isActive: true },
      include: { branch: { select: { id: true, name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [inflowAgg, outflowAgg] = await Promise.all([
      this.prisma.bankTransaction.aggregate({
        where: { type: 'INFLOW', transactionDate: { gte: thirtyDaysAgo } },
        _sum: { amount: true },
      }),
      this.prisma.bankTransaction.aggregate({
        where: { type: 'OUTFLOW', transactionDate: { gte: thirtyDaysAgo } },
        _sum: { amount: true },
      }),
    ]);

    const inflowLast30d = Number(inflowAgg._sum.amount ?? 0);
    const outflowLast30d = Number(outflowAgg._sum.amount ?? 0);

    return {
      accounts: accounts.map((a) => ({ ...a, currentBalance: Number(a.currentBalance) })),
      inflowLast30d,
      outflowLast30d,
      netLast30d: inflowLast30d - outflowLast30d,
    };
  }

  async getCashflow(from: string, to: string) {
    const transactions = await this.prisma.bankTransaction.findMany({
      where: {
        transactionDate: { gte: new Date(from), lte: new Date(to) },
      },
      orderBy: { transactionDate: 'asc' },
    });

    const byDate: Record<string, { inflows: number; outflows: number }> = {};
    for (const tx of transactions) {
      const dateKey = tx.transactionDate.toISOString().slice(0, 10);
      if (!byDate[dateKey]) byDate[dateKey] = { inflows: 0, outflows: 0 };
      if (tx.type === 'INFLOW') {
        byDate[dateKey].inflows += Number(tx.amount);
      } else {
        byDate[dateKey].outflows += Number(tx.amount);
      }
    }

    const data = Object.entries(byDate).map(([date, vals]) => ({
      date,
      inflows: vals.inflows,
      outflows: vals.outflows,
      net: vals.inflows - vals.outflows,
    }));

    return { data };
  }
}
