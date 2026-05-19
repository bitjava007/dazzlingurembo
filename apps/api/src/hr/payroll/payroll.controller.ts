import { Controller, Get, Post, Patch, Param, Query, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';

interface AuthUser { id: string }

@ApiTags('hr')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('hr/payroll')
export class PayrollController {
  constructor(private readonly svc: PayrollService) {}

  @Get()
  @ApiOperation({ summary: 'List payroll records' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('period') period?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      employeeId,
      period,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('employee/:employeeId/summary')
  @ApiOperation({ summary: 'Get employee payroll summary YTD' })
  getEmployeeSummary(@Param('employeeId') employeeId: string) {
    return this.svc.getEmployeeSummary(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll by ID' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payroll' })
  create(@Body() dto: CreatePayrollDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve payroll' })
  approve(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.approve(id, u?.id);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Mark payroll as paid' })
  pay(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.pay(id, u?.id);
  }
}
