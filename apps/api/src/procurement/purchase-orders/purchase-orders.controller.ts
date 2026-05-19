import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

interface AuthUser { id: string }

@ApiTags('procurement')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('procurement/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly svc: PurchaseOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List purchase orders' })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('supplierId') supplierId?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      supplierId, branchId, status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order with items' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create purchase order' })
  create(@Body() dto: CreatePurchaseOrderDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/submit')
  @ApiOperation({ summary: 'Submit PO (DRAFT -> SENT)' })
  submit(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.submit(id, u?.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve PO (SENT -> ACKNOWLEDGED)' })
  approve(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.approve(id, u?.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel purchase order' })
  cancel(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.cancel(id, u?.id);
  }

  @Patch(':id/receive')
  @ApiOperation({ summary: 'Mark PO as received' })
  receive(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.receive(id, u?.id);
  }
}
