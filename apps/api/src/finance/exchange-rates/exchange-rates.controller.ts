import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';

@ApiTags('finance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('finance/exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly svc: ExchangeRatesService) {}

  @Get()
  @ApiOperation({ summary: 'List exchange rates' })
  @ApiQuery({ name: 'fromCurrencyCode', required: false })
  @ApiQuery({ name: 'toCurrencyCode', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('fromCurrencyCode') fromCurrencyCode?: string,
    @Query('toCurrencyCode') toCurrencyCode?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      fromCurrencyCode, toCurrencyCode,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest exchange rate' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  getLatest(@Query('from') from: string, @Query('to') to: string) {
    return this.svc.getLatest(from, to);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create exchange rate' })
  create(@Body() dto: CreateExchangeRateDto) {
    return this.svc.create(dto);
  }
}
