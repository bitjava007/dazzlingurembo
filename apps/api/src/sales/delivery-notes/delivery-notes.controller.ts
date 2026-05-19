import { Controller, Get, Post, Patch, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { DeliveryNotesService } from './delivery-notes.service';

interface AuthUser { id: string }

@ApiTags('sales')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('sales/delivery-notes')
export class DeliveryNotesController {
  constructor(private readonly svc: DeliveryNotesService) {}

  @Get()
  @ApiOperation({ summary: 'List delivery notes' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'orderId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('orderId') orderId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      branchId, orderId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery note details' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post('from-order/:orderId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create delivery note from order' })
  createFromOrder(@Param('orderId') orderId: string, @GetUser() u: AuthUser) {
    return this.svc.createFromOrder(orderId, u?.id);
  }

  @Patch(':id/dispatch')
  @ApiOperation({ summary: 'Dispatch delivery note (mark as shipped)' })
  dispatch(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.dispatch(id, u?.id);
  }

  @Patch(':id/deliver')
  @ApiOperation({ summary: 'Mark delivery note as delivered' })
  deliver(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.deliver(id, u?.id);
  }
}
