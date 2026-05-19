import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';
import * as bcrypt from 'bcryptjs';

const mockUser = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  passwordHash: '',
  firstName: 'Jane',
  lastName: 'Doe',
  phone: null,
  avatarUrl: null,
  status: 'ACTIVE',
  emailVerifiedAt: null,
  lastLoginAt: null,
  failedLoginAttempts: 0,
  lockedUntil: null,
  mustChangePassword: false,
  countryId: null,
  branchId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockSession = {
  id: 'session-uuid-1',
  userId: 'user-uuid-1',
  token: 'random-token',
  refreshToken: 'refresh-token-hex',
  ipAddress: null,
  userAgent: null,
  deviceType: null,
  isActive: true,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  revokedAt: null,
  user: mockUser,
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('Password123', 1);
  });

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
      session: {
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed-jwt-token') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('15m'), getOrThrow: jest.fn().mockReturnValue('15m') },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('should return access token, refresh token, and user on successful login', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, lastLoginAt: new Date() });
      (prisma.session.create as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await service.login({ email: 'test@example.com', password: 'Password123' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.user).toBeDefined();
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: 'Password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked account', async () => {
      const lockedUser = {
        ...mockUser,
        lockedUntil: new Date(Date.now() + 10 * 60 * 1000), // locked for 10 more minutes
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(lockedUser);

      await expect(
        service.login({ email: 'test@example.com', password: 'Password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should increment failedLoginAttempts and lock after 5 failures', async () => {
      const almostLockedUser = { ...mockUser, failedLoginAttempts: 4 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(almostLockedUser);
      const updateSpy = (prisma.user.update as jest.Mock).mockResolvedValue(almostLockedUser);

      await expect(
        service.login({ email: 'test@example.com', password: 'Wrong' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 5,
            lockedUntil: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('logout', () => {
    it('should mark session as inactive on logout', async () => {
      (prisma.session.update as jest.Mock).mockResolvedValue({ ...mockSession, isActive: false });

      await service.logout('session-uuid-1', 'user-uuid-1');

      expect(prisma.session.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'session-uuid-1' },
          data: expect.objectContaining({ isActive: false }),
        }),
      );
    });
  });

  describe('refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      (prisma.session.findFirst as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.refresh('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid/expired refresh token', async () => {
      (prisma.session.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException for invalid reset token', async () => {
      (prisma.session.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.resetPassword('bad-reset-token', 'NewPassword123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update password hash for valid reset token', async () => {
      const resetSession = { ...mockSession, deviceType: 'password-reset' };
      (prisma.session.findFirst as jest.Mock).mockResolvedValue(resetSession);
      (prisma.$transaction as jest.Mock).mockResolvedValue([mockUser, resetSession]);

      await expect(
        service.resetPassword('valid-reset-token', 'NewPassword123'),
      ).resolves.toBeUndefined();

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
