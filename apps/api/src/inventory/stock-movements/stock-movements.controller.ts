import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { StockMovementType } from '@prisma/client';

interface AuthUser { id: string }

@ApiTags('inventory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('inventory/stock-movements')
export class StockMovementsController {
  constructor(private readonly svc: StockMovementsService) {}

  @Get()
  @ApiOperation({ summary: 'List stock movements with filters' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'variantId', required: false })
  @ApiQuery({ name: 'movementType', required: false, enum: StockMovementType })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('branchId') branchId?: string,
    @Query('variantId') variantId?: string,
    @Query('movementType') movementType?: StockMovementType,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      warehouseId,
      branchId,
      variantId,
      movementType,
      dateFrom,
      dateTo,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a stock movement' })
  create(@Body() dto: CreateStockMovementDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }
}
