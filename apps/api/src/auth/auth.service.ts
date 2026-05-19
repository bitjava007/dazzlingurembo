import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';
import type { JwtPayload } from '../common/types/jwt-payload.type';
import type { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const RESET_TOKEN_TTL_MINUTES = 30;
const REFRESH_TOKEN_TTL_DAYS = 7;

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  status: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  mustChangePassword: true,
  countryId: true,
  branchId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Account locked until ${user.lockedUntil.toISOString()}. Try again later.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      const updateData: {
        failedLoginAttempts: number;
        lockedUntil?: Date | null;
      } = { failedLoginAttempts: failedAttempts };

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCK_DURATION_MINUTES);
        updateData.lockedUntil = lockedUntil;
        this.logger.warn(`Account locked for ${user.email} due to too many failed attempts`);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Successful login — reset counters
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Create session
    const sessionId = crypto.randomUUID();
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    const accessExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m');

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: crypto.randomBytes(16).toString('hex'),
        refreshToken,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        deviceType: null,
        isActive: true,
        expiresAt,
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      sessionId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessExpiresIn,
    });

    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'user',
      entityId: user.id,
      description: 'User logged in',
      ipAddress,
      userAgent,
    });

    const safeUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: USER_SELECT,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      user: safeUser,
    };
  }

  async logout(sessionId: string, userId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false, revokedAt: new Date() },
    });

    await this.auditService.log({
      userId,
      action: 'LOGOUT',
      entityType: 'user',
      entityId: userId,
      description: 'User logged out',
    });
  }

  async refresh(refreshToken: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        refreshToken,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { select: USER_SELECT },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const accessExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m');

    const payload: JwtPayload = {
      sub: session.userId,
      email: session.user.email,
      sessionId: session.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessExpiresIn,
    });

    return {
      accessToken,
      expiresIn: accessExpiresIn,
      user: session.user,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If that email is registered, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + RESET_TOKEN_TTL_MINUTES);

    await this.prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        token: resetToken,
        refreshToken: crypto.randomBytes(16).toString('hex'),
        deviceType: 'password-reset',
        isActive: true,
        expiresAt,
      },
    });

    // In production this would be emailed — log it here
    this.logger.log(`Password reset token for ${email}: ${resetToken}`);

    return {
      message: 'If that email is registered, a reset link has been sent.',
      token: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: {
        token,
        deviceType: 'password-reset',
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: session.userId },
        data: { passwordHash, mustChangePassword: false },
      }),
      this.prisma.session.update({
        where: { id: session.id },
        data: { isActive: false, revokedAt: new Date() },
      }),
    ]);

    await this.auditService.log({
      userId: session.userId,
      action: 'UPDATE',
      entityType: 'user',
      entityId: session.userId,
      description: 'Password reset',
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        ...USER_SELECT,
        userRoles: {
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                isSystem: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }
}
