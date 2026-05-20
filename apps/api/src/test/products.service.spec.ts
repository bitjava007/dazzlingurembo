import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductsService } from '../catalog/products/products.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';

const mockProduct = {
  id: 'prod-uuid-1',
  name: 'Test Fabric Dress',
  slug: 'test-fabric-dress',
  description: 'A beautiful dress',
  shortDescription: null,
  categoryId: 'cat-uuid-1',
  brand: 'Dazzling',
  origin: null,
  materials: [],
  tags: [],
  status: 'ACTIVE',
  baseCurrencyCode: 'XOF',
  basePrice: 25000,
  costPrice: 15000,
  weight: null,
  weightUnit: 'kg',
  isSerialized: false,
  trackInventory: true,
  minStockLevel: 0,
  reorderPoint: 5,
  createdById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: jest.Mocked<PrismaService>;
  let audit: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const mockPrisma = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get(PrismaService);
    audit = module.get(AuditService);
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);
      (prisma.product.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by search term', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);
      (prisma.product.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ search: 'dress' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should filter by categoryId', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.count as jest.Mock).mockResolvedValue(0);

      await service.findAll({ categoryId: 'cat-uuid-1' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: 'cat-uuid-1' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.findOne('prod-uuid-1');

      expect(result.data).toMatchObject({ id: 'prod-uuid-1', name: 'Test Fabric Dress' });
    });

    it('should throw NotFoundException for unknown id', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new product', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const dto = {
        name: 'Test Fabric Dress',
        slug: 'test-fabric-dress',
        baseCurrencyCode: 'XOF',
        basePrice: 25000,
      };

      const result = await service.create(dto as never, 'user-uuid-1');

      expect(result.data).toMatchObject({ name: 'Test Fabric Dress' });
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', entityType: 'product' }),
      );
    });

    it('should throw ConflictException if slug already exists', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const dto = {
        name: 'Duplicate',
        slug: 'test-fabric-dress',
        baseCurrencyCode: 'XOF',
        basePrice: 10000,
      };

      await expect(service.create(dto as never)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update and return the product', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.product.update as jest.Mock).mockResolvedValue({ ...mockProduct, name: 'Updated Name' });

      const result = await service.update('prod-uuid-1', { name: 'Updated Name' } as never);

      expect(result.data.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when product does not exist', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('bad-id', {} as never)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete the product', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.product.update as jest.Mock).mockResolvedValue({ ...mockProduct, deletedAt: new Date() });

      await service.remove('prod-uuid-1', 'user-uuid-1');

      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw NotFoundException for unknown id', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
