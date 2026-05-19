import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface QueryStockBalancesDto {
  warehouseId?: string;
  branchId?: string;
  productId?: string;
  variantId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class StockBalancesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryStockBalancesDto) {
    const { page = 1, limit = 20, warehouseId, branchId, productId, variantId } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (warehouseId) where['warehouseId'] = warehouseId;
    if (branchId) where['branchId'] = branchId;
    if (productId) where['productId'] = productId;
    if (variantId) where['variantId'] = variantId;

    const [data, total] = await Promise.all([
      this.prisma.stockBalance.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: { select: { id: true, name: true, slug: true, status: true } },
          variant: { select: { id: true, name: true, sku: true, color: true, size: true } },
          warehouse: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.stockBalance.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getLowStock(threshold?: number) {
    const data = await this.prisma.stockBalance.findMany({
      where: threshold !== undefined
        ? { quantityAvailable: { lte: threshold } }
        : { product: { trackInventory: true } },
      include: {
        product: { select: { id: true, name: true, slug: true, reorderPoint: true, minStockLevel: true } },
        variant: { select: { id: true, name: true, sku: true } },
        warehouse: { select: { id: true, name: true, code: true } },
        branch: { select: { id: true, name: true, code: true } },
      },
      orderBy: { quantityAvailable: 'asc' },
    });

    const filtered = threshold !== undefined
      ? data
      : data.filter(b => b.quantityAvailable <= (b.product as { reorderPoint: number }).reorderPoint);

    return { data: filtered };
  }
}
