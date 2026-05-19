import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CountriesService } from '../organization/countries/countries.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/services/audit.service';

const mockCountry = {
  id: 'country-uuid-1',
  name: 'Morocco',
  isoCode2: 'MA',
  isoCode3: 'MAR',
  dialCode: '+212',
  currencyCode: 'MAD',
  currencyName: 'Moroccan Dirham',
  currencySymbol: 'د.م.',
  locale: 'ar-MA',
  timezone: 'Africa/Casablanca',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('CountriesService', () => {
  let service: CountriesService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      country: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: { log: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return all countries', async () => {
      (prisma.country.findMany as jest.Mock).mockResolvedValue([mockCountry]);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Morocco');
    });

    it('should filter by isActive when provided', async () => {
      (prisma.country.findMany as jest.Mock).mockResolvedValue([mockCountry]);

      await service.findAll(true);

      expect(prisma.country.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true, deletedAt: null }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a country when found', async () => {
      (prisma.country.findUnique as jest.Mock).mockResolvedValue(mockCountry);

      const result = await service.findOne('country-uuid-1');

      expect(result.data.name).toBe('Morocco');
      expect(result.data.isoCode2).toBe('MA');
    });

    it('should throw NotFoundException when not found', async () => {
      (prisma.country.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a country successfully', async () => {
      (prisma.country.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.country.create as jest.Mock).mockResolvedValue(mockCountry);

      const result = await service.create({
        name: 'Morocco',
        isoCode2: 'MA',
        isoCode3: 'MAR',
        currencyCode: 'MAD',
        currencyName: 'Moroccan Dirham',
        currencySymbol: 'د.م.',
      });

      expect(result.data.name).toBe('Morocco');
      expect(prisma.country.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if ISO code already exists', async () => {
      (prisma.country.findFirst as jest.Mock).mockResolvedValue(mockCountry);

      await expect(
        service.create({
          name: 'Morocco',
          isoCode2: 'MA',
          isoCode3: 'MAR',
          currencyCode: 'MAD',
          currencyName: 'Moroccan Dirham',
          currencySymbol: 'د.م.',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a country successfully', async () => {
      (prisma.country.findUnique as jest.Mock).mockResolvedValue(mockCountry);
      const updated = { ...mockCountry, isActive: false };
      (prisma.country.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.update('country-uuid-1', { isActive: false });

      expect(result.data.isActive).toBe(false);
    });

    it('should throw NotFoundException when country not found', async () => {
      (prisma.country.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', { name: 'NewName' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a country by setting deletedAt', async () => {
      (prisma.country.findUnique as jest.Mock).mockResolvedValue(mockCountry);
      (prisma.country.update as jest.Mock).mockResolvedValue({ ...mockCountry, deletedAt: new Date() });

      await service.remove('country-uuid-1');

      expect(prisma.country.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'country-uuid-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw NotFoundException when country not found', async () => {
      (prisma.country.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
