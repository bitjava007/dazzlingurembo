import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('finance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('finance/analytics')
export class AnalyticsController {
  constructor(private readonly svc: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary for a period' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  getSummary(@Query('from') from: string, @Query('to') to: string) {
    return this.svc.getSummary(from, to);
  }

  @Get('profitability/branch')
  @ApiOperation({ summary: 'Get profitability by branch' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  getProfitabilityByBranch(@Query('from') from: string, @Query('to') to: string) {
    return this.svc.getProfitabilityByBranch(from, to);
  }

  @Get('profitability/customer')
  @ApiOperation({ summary: 'Get profitability by customer' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getProfitabilityByCustomer(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.getProfitabilityByCustomer(from, to, limit ? parseInt(limit, 10) : 10);
  }

  @Get('profitability/period')
  @ApiOperation({ summary: 'Get profitability by period' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  @ApiQuery({ name: 'granularity', required: false, enum: ['day', 'month'] })
  getProfitabilityByPeriod(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('granularity') granularity?: 'day' | 'month',
  ) {
    return this.svc.getProfitabilityByPeriod(from, to, granularity ?? 'month');
  }

  @Get('profitability/workshop')
  @ApiOperation({ summary: 'Get profitability by workshop' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  getProfitabilityByWorkshop(@Query('from') from: string, @Query('to') to: string) {
    return this.svc.getProfitabilityByWorkshop(from, to);
  }

  @Get('employee-costs')
  @ApiOperation({ summary: 'Get employee cost breakdown' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  getEmployeeCosts(@Query('from') from: string, @Query('to') to: string) {
    return this.svc.getEmployeeCosts(from, to);
  }
}
