import { Controller, Get, Post, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ReceiptsService } from './receipts.service';

interface AuthUser { id: string }

@ApiTags('sales')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('sales/receipts')
export class ReceiptsController {
  constructor(private readonly svc: ReceiptsService) {}

  @Get()
  @ApiOperation({ summary: 'List receipts' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'paymentId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('paymentId') paymentId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      branchId, paymentId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get receipt details' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post('generate/:paymentId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate receipt for a payment' })
  generate(@Param('paymentId') paymentId: string, @GetUser() u: AuthUser) {
    return this.svc.generate(paymentId, u?.id);
  }
}
