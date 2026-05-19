import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';

interface AuthUser { id: string }

class RejectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('sales')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('sales/refunds')
export class RefundsController {
  constructor(private readonly svc: RefundsService) {}

  @Get()
  @ApiOperation({ summary: 'List refunds' })
  @ApiQuery({ name: 'orderId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('orderId') orderId?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      orderId, branchId, status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get refund details' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create refund request' })
  create(@Body() dto: CreateRefundDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve refund' })
  approve(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.approve(id, u?.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject refund' })
  reject(@Param('id') id: string, @Body() body: RejectDto, @GetUser() u: AuthUser) {
    return this.svc.reject(id, u?.id, body.reason);
  }

  @Patch(':id/process')
  @ApiOperation({ summary: 'Process approved refund' })
  process(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.process(id, u?.id);
  }
}
