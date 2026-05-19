import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CashClosuresService } from './cash-closures.service';
import { CreateCashClosureDto } from './dto/create-cash-closure.dto';

interface AuthUser { id: string }

@ApiTags('finance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('finance/cash-closures')
export class CashClosuresController {
  constructor(private readonly svc: CashClosuresService) {}

  @Get()
  @ApiOperation({ summary: 'List cash closures' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      branchId, status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cash closure' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Get('branch/:branchId/date/:date')
  @ApiOperation({ summary: 'Get cash closure by branch and date' })
  findByBranchDate(@Param('branchId') branchId: string, @Param('date') date: string) {
    return this.svc.findByBranchDate(branchId, date);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create cash closure' })
  create(@Body() dto: CreateCashClosureDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close cash closure' })
  close(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.close(id, u?.id);
  }
}
