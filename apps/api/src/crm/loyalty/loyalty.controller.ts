import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoyaltyService } from './loyalty.service';
import { AddPointsDto, RedeemPointsDto } from './dto/loyalty.dto';

@ApiTags('crm')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('crm/customers/:customerId/loyalty')
export class LoyaltyController {
  constructor(private readonly svc: LoyaltyService) {}

  @Get() @ApiOperation({ summary: 'Get loyalty account with recent transactions' })
  getAccount(@Param('customerId') customerId: string) { return this.svc.getAccount(customerId); }

  @Get('transactions') @ApiOperation({ summary: 'Get all loyalty transactions' })
  getTransactions(@Param('customerId') customerId: string) { return this.svc.getTransactions(customerId); }

  @Post('add') @ApiOperation({ summary: 'Add loyalty points' })
  addPoints(@Param('customerId') customerId: string, @Body() dto: AddPointsDto) { return this.svc.addPoints(customerId, dto); }

  @Post('redeem') @ApiOperation({ summary: 'Redeem loyalty points' })
  redeemPoints(@Param('customerId') customerId: string, @Body() dto: RedeemPointsDto) { return this.svc.redeemPoints(customerId, dto); }
}
