import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { SupplierInvoicesService } from './supplier-invoices.service';
import { CreateSupplierInvoiceDto } from './dto/create-supplier-invoice.dto';

interface AuthUser { id: string }

@ApiTags('procurement')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('procurement/supplier-invoices')
export class SupplierInvoicesController {
  constructor(private readonly svc: SupplierInvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List supplier invoices' })
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
  @ApiOperation({ summary: 'Get supplier invoice' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create supplier invoice' })
  create(@Body() dto: CreateSupplierInvoiceDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/mark-paid')
  @ApiOperation({ summary: 'Mark supplier invoice as paid' })
  markPaid(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.markPaid(id, u?.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel supplier invoice' })
  cancel(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.cancel(id, u?.id);
  }
}
