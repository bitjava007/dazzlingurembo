import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { StockAdjustmentsService } from './stock-adjustments.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';

interface AuthUser { id: string }

class RejectAdjustmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('inventory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('inventory/stock-adjustments')
export class StockAdjustmentsController {
  constructor(private readonly svc: StockAdjustmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List stock adjustments' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      warehouseId, branchId, status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create stock adjustment' })
  create(@Body() dto: CreateStockAdjustmentDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve stock adjustment' })
  approve(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.approve(id, u?.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject stock adjustment' })
  reject(@Param('id') id: string, @Body() body: RejectAdjustmentDto, @GetUser() u: AuthUser) {
    return this.svc.reject(id, u?.id, body.reason);
  }
}
