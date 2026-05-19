import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StockBalancesService } from './stock-balances.service';

@ApiTags('inventory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('inventory/stock-balances')
export class StockBalancesController {
  constructor(private readonly svc: StockBalancesService) {}

  @Get()
  @ApiOperation({ summary: 'List stock balances with optional filters' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'variantId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('branchId') branchId?: string,
    @Query('productId') productId?: string,
    @Query('variantId') variantId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      warehouseId,
      branchId,
      productId,
      variantId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get items with low stock (below reorder point or threshold)' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  getLowStock(@Query('threshold') threshold?: string) {
    return this.svc.getLowStock(threshold !== undefined ? parseInt(threshold, 10) : undefined);
  }
}
