import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { DamagedStockService } from './damaged-stock.service';
import { CreateDamagedStockDto } from './dto/create-damaged-stock.dto';

interface AuthUser { id: string }

@ApiTags('inventory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('inventory/damaged-stock')
export class DamagedStockController {
  constructor(private readonly svc: DamagedStockService) {}

  @Get()
  @ApiOperation({ summary: 'List damaged stock records' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'variantId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('branchId') branchId?: string,
    @Query('variantId') variantId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      warehouseId, branchId, variantId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Report damaged stock' })
  create(@Body() dto: CreateDamagedStockDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve / dispose damaged stock' })
  resolve(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.resolve(id, u?.id);
  }
}
