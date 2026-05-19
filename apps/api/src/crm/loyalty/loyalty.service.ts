import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AddPointsDto, RedeemPointsDto } from './dto/loyalty.dto';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccount(customerId: string) {
    let account = await this.prisma.loyaltyAccount.findUnique({
      where: { customerId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!account) {
      account = await this.prisma.loyaltyAccount.create({
        data: {
          id: crypto.randomUUID(),
          customerId,
          accountNumber: `LYL-${Date.now().toString(36).toUpperCase()}`,
          pointsBalance: 0,
          lifetimePoints: 0,
          redeemedPoints: 0,
          isActive: true,
        },
        include: { transactions: true },
      });
    }
    return { data: account };
  }

  async addPoints(customerId: string, dto: AddPointsDto) {
    const account = await this.prisma.loyaltyAccount.findUnique({ where: { customerId } });
    if (!account) throw new NotFoundException('Loyalty account not found');
    if (!account.isActive) throw new BadRequestException('Loyalty account is inactive');

    const [updatedAccount, transaction] = await this.prisma.$transaction([
      this.prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          pointsBalance: account.pointsBalance + dto.points,
          lifetimePoints: account.lifetimePoints + dto.points,
        },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          id: crypto.randomUUID(),
          loyaltyAccountId: account.id,
          points: dto.points,
          type: dto.type,
          description: dto.description ?? null,
          referenceType: dto.referenceType ?? null,
          referenceId: dto.referenceId ?? null,
        },
      }),
    ]);
    return { data: { account: updatedAccount, transaction } };
  }

  async redeemPoints(customerId: string, dto: RedeemPointsDto) {
    const account = await this.prisma.loyaltyAccount.findUnique({ where: { customerId } });
    if (!account) throw new NotFoundException('Loyalty account not found');
    if (!account.isActive) throw new BadRequestException('Loyalty account is inactive');
    if (account.pointsBalance < dto.points) throw new BadRequestException(`Insufficient points. Balance: ${account.pointsBalance}`);

    const [updatedAccount, transaction] = await this.prisma.$transaction([
      this.prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          pointsBalance: account.pointsBalance - dto.points,
          redeemedPoints: account.redeemedPoints + dto.points,
        },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          id: crypto.randomUUID(),
          loyaltyAccountId: account.id,
          points: -dto.points,
          type: 'REDEMPTION',
          referenceId: dto.referenceId ?? null,
        },
      }),
    ]);
    return { data: { account: updatedAccount, transaction } };
  }

  async getTransactions(customerId: string) {
    const account = await this.prisma.loyaltyAccount.findUnique({ where: { customerId } });
    if (!account) throw new NotFoundException('Loyalty account not found');
    const transactions = await this.prisma.loyaltyTransaction.findMany({
      where: { loyaltyAccountId: account.id },
      orderBy: { createdAt: 'desc' },
    });
    return { data: transactions };
  }
}
