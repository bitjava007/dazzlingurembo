import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RolesService } from '../rbac/roles/roles.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';

const mockRole = {
  id: 'role-uuid-1',
  name: 'STORE_MANAGER',
  description: 'Manages a single store',
  isSystem: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockPermission = {
  id: 'perm-uuid-1',
  module: 'users',
  action: 'read',
  description: 'Can read users',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RolesService', () => {
  let service: RolesService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      role: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      permission: {
        findUnique: jest.fn(),
      },
      rolePermission: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return all roles with permission counts', async () => {
      const roleWithCount = { ...mockRole, _count: { rolePermissions: 3 } };
      (prisma.role.findMany as jest.Mock).mockResolvedValue([roleWithCount]);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].permissionsCount).toBe(3);
      expect(result.data[0].name).toBe('STORE_MANAGER');
    });
  });

  describe('create', () => {
    it('should create a role successfully', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.create as jest.Mock).mockResolvedValue(mockRole);

      const result = await service.create({ name: 'STORE_MANAGER', description: 'Manages a store' });

      expect(result.data.name).toBe('STORE_MANAGER');
      expect(prisma.role.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if role name already exists', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);

      await expect(
        service.create({ name: 'STORE_MANAGER' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should throw BadRequestException for system roles', async () => {
      const systemRole = { ...mockRole, isSystem: true };
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(systemRole);

      await expect(
        service.update('role-uuid-1', { name: 'NEW_NAME' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('assignPermission', () => {
    it('should assign a permission to a role', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
      (prisma.permission.findUnique as jest.Mock).mockResolvedValue(mockPermission);
      (prisma.rolePermission.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.rolePermission.create as jest.Mock).mockResolvedValue({
        id: 'rp-uuid-1',
        roleId: 'role-uuid-1',
        permissionId: 'perm-uuid-1',
        grantedById: null,
        grantedAt: new Date(),
        permission: mockPermission,
      });

      const result = await service.assignPermission('role-uuid-1', 'perm-uuid-1');

      expect(result.data.roleId).toBe('role-uuid-1');
      expect(prisma.rolePermission.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if permission already assigned', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
      (prisma.permission.findUnique as jest.Mock).mockResolvedValue(mockPermission);
      (prisma.rolePermission.findFirst as jest.Mock).mockResolvedValue({ id: 'existing' });

      await expect(
        service.assignPermission('role-uuid-1', 'perm-uuid-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if role does not exist', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.assignPermission('nonexistent', 'perm-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
