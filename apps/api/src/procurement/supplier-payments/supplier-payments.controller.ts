import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { SupplierPaymentsService } from './supplier-payments.service';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';

interface AuthUser { id: string }

@ApiTags('procurement')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('procurement/supplier-payments')
export class SupplierPaymentsController {
  constructor(private readonly svc: SupplierPaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List supplier payments' })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('supplierId') supplierId?: string,
    @Query('branchId') branchId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      supplierId, branchId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create supplier payment' })
  create(@Body() dto: CreateSupplierPaymentDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }
}
