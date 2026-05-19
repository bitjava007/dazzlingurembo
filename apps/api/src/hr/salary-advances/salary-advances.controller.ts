import { Controller, Get, Post, Patch, Param, Query, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { SalaryAdvancesService } from './salary-advances.service';
import { CreateSalaryAdvanceDto } from './dto/create-salary-advance.dto';

interface AuthUser { id: string }

@ApiTags('hr')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('hr/salary-advances')
export class SalaryAdvancesController {
  constructor(private readonly svc: SalaryAdvancesService) {}

  @Get()
  @ApiOperation({ summary: 'List salary advances' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      employeeId,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get salary advance by ID' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create salary advance request' })
  create(@Body() dto: CreateSalaryAdvanceDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve salary advance' })
  approve(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.approve(id, u?.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject salary advance' })
  reject(@Param('id') id: string, @Body('reason') reason: string, @GetUser() u: AuthUser) {
    return this.svc.reject(id, u?.id, reason);
  }

  @Patch(':id/repay')
  @ApiOperation({ summary: 'Mark salary advance as repaid' })
  repay(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.repay(id, u?.id);
  }
}
