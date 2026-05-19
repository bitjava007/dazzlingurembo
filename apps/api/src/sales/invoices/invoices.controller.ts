import { Controller, Get, Post, Patch, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvoicesService } from './invoices.service';

interface AuthUser { id: string }

@ApiTags('sales')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('sales/invoices')
export class InvoicesController {
  constructor(private readonly svc: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices' })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'orderId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('customerId') customerId?: string,
    @Query('branchId') branchId?: string,
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      customerId, branchId, orderId, status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice details' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post('from-order/:orderId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create invoice from order' })
  createFromOrder(@Param('orderId') orderId: string, @GetUser() u: AuthUser) {
    return this.svc.createFromOrder(orderId, u?.id);
  }

  @Patch('mark-overdue')
  @ApiOperation({ summary: 'Mark overdue invoices' })
  markOverdue(@GetUser() u: AuthUser) {
    return this.svc.markOverdue();
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel / void invoice' })
  cancel(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.cancel(id, u?.id);
  }
}
