import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from '../sales/orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';

const mockOrder = {
  id: 'order-uuid-1',
  orderNumber: 'ORD-1234567890',
  customerId: 'cust-uuid-1',
  branchId: 'branch-uuid-1',
  createdById: 'user-uuid-1',
  currencyCode: 'XOF',
  subtotal: 50000,
  discountAmount: 0,
  taxAmount: 0,
  shippingAmount: 0,
  totalAmount: 50000,
  convertedCurrencyCode: null,
  exchangeRateSnapshot: null,
  status: 'DRAFT',
  notes: null,
  shippingAddressLine1: null,
  shippingAddressLine2: null,
  shippingCity: null,
  shippingState: null,
  shippingPostalCode: null,
  shippingCountryCode: null,
  orderedAt: null,
  confirmedAt: null,
  shippedAt: null,
  deliveredAt: null,
  cancelledAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  customer: { id: 'cust-uuid-1', firstName: 'Alice', lastName: 'Nzinga', email: 'alice@test.com' },
  branch: { id: 'branch-uuid-1', name: 'Kigali Branch', code: 'KGL' },
  items: [],
};

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: jest.Mocked<PrismaService>;
  let audit: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const mockPrisma = {
      order: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get(PrismaService);
    audit = module.get(AuditService);
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
      (prisma.order.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by branchId', async () => {
      (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
      (prisma.order.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ branchId: 'branch-uuid-1' });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ branchId: 'branch-uuid-1' }),
        }),
      );
    });

    it('should filter by status', async () => {
      (prisma.order.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.order.count as jest.Mock).mockResolvedValue(0);

      await service.findAll({ status: 'CONFIRMED' });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'CONFIRMED' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const result = await service.findOne('order-uuid-1');

      expect(result.data).toMatchObject({ id: 'order-uuid-1', orderNumber: 'ORD-1234567890' });
    });

    it('should throw NotFoundException for unknown id', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an order and compute totals', async () => {
      (prisma.order.create as jest.Mock).mockResolvedValue({ ...mockOrder, items: [{ id: 'item-1', lineTotal: 50000 }] });

      const dto = {
        branchId: 'branch-uuid-1',
        currencyCode: 'XOF',
        items: [
          { productId: 'prod-uuid-1', name: 'Dress', quantity: 2, unitPrice: 25000 },
        ],
      };

      const result = await service.create(dto as never, 'user-uuid-1');

      expect(result.data.orderNumber).toBeDefined();
      expect(prisma.order.create).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', entityType: 'order' }),
      );
    });
  });

  describe('confirm', () => {
    it('should confirm a DRAFT order', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.order.update as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'CONFIRMED', confirmedAt: new Date() });

      const result = await service.confirm('order-uuid-1', 'user-uuid-1');

      expect(result.data.status).toBe('CONFIRMED');
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'CONFIRMED' }),
        }),
      );
    });

    it('should throw BadRequestException if order is not DRAFT', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });

      await expect(service.confirm('order-uuid-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for unknown order', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.confirm('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw BadRequestException for cancelled orders', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'CANCELLED' });

      await expect(service.update('order-uuid-1', {})).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for unknown order', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('bad-id', {})).rejects.toThrow(NotFoundException);
    });
  });
});
