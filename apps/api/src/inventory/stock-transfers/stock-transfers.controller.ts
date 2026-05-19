import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { StockTransfersService } from './stock-transfers.service';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';

interface AuthUser { id: string }

@ApiTags('inventory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('inventory/stock-transfers')
export class StockTransfersController {
  constructor(private readonly svc: StockTransfersService) {}

  @Get()
  @ApiOperation({ summary: 'List stock transfers' })
  @ApiQuery({ name: 'fromWarehouseId', required: false })
  @ApiQuery({ name: 'toWarehouseId', required: false })
  @ApiQuery({ name: 'fromBranchId', required: false })
  @ApiQuery({ name: 'toBranchId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('fromWarehouseId') fromWarehouseId?: string,
    @Query('toWarehouseId') toWarehouseId?: string,
    @Query('fromBranchId') fromBranchId?: string,
    @Query('toBranchId') toBranchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      fromWarehouseId, toWarehouseId, fromBranchId, toBranchId, status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock transfer details' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create stock transfer' })
  create(@Body() dto: CreateStockTransferDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve and ship stock transfer (DRAFT -> IN_TRANSIT)' })
  approve(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.approve(id, u?.id);
  }

  @Patch(':id/receive')
  @ApiOperation({ summary: 'Mark stock transfer as received (IN_TRANSIT -> RECEIVED)' })
  receive(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.receive(id, u?.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel stock transfer' })
  cancel(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.cancel(id, u?.id);
  }
}
