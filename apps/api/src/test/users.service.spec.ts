import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';

const safeUser = {
  id: 'user-uuid-1',
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  phone: null,
  avatarUrl: null,
  status: 'PENDING_VERIFICATION',
  emailVerifiedAt: null,
  lastLoginAt: null,
  mustChangePassword: false,
  countryId: null,
  branchId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      userRole: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
      branch: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return paginated list of users', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([safeUser]);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should calculate totalPages correctly', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([safeUser]);
      (prisma.user.count as jest.Mock).mockResolvedValue(45);

      const result = await service.findAll({ page: 2, limit: 20 });

      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.page).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a user with roles when found', async () => {
      const userWithRoles = { ...safeUser, userRoles: [] };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithRoles);

      const result = await service.findOne('user-uuid-1');

      expect(result.data.id).toBe('user-uuid-1');
      expect(result.data).toHaveProperty('userRoles');
    });

    it('should throw NotFoundException for missing user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a user and return safe user object', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // no existing
      (prisma.user.create as jest.Mock).mockResolvedValue(safeUser);

      const result = await service.create({
        email: 'jane@example.com',
        password: 'Password123',
        firstName: 'Jane',
        lastName: 'Doe',
      });

      expect(result.data.email).toBe('jane@example.com');
      expect(result.data).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException if email is already taken', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(safeUser);

      await expect(
        service.create({
          email: 'jane@example.com',
          password: 'Password123',
          firstName: 'Jane',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete a user by setting deletedAt', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-uuid-1', email: 'jane@example.com' });
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...safeUser, deletedAt: new Date() });

      await service.remove('user-uuid-1', 'actor-id');

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-uuid-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
