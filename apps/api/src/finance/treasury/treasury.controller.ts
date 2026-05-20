import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { TreasuryService } from './treasury.service';
import { CreateBankAccountDto, UpdateBankAccountDto, CreateBankTransactionDto } from './dto/create-bank-account.dto';

interface AuthUser { id: string }

@ApiTags('finance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('finance/treasury')
export class TreasuryController {
  constructor(private readonly svc: TreasuryService) {}

  @Get('cash-position')
  @ApiOperation({ summary: 'Get cash position across all bank accounts' })
  getCashPosition() {
    return this.svc.getCashPosition();
  }

  @Get('cashflow')
  @ApiOperation({ summary: 'Get cashflow for a date range' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  getCashflow(@Query('from') from: string, @Query('to') to: string) {
    return this.svc.getCashflow(from, to);
  }

  @Get('bank-accounts')
  @ApiOperation({ summary: 'List bank accounts' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAllAccounts(
    @Query('branchId') branchId?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAllAccounts({
      branchId, isActive,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('bank-accounts/:id')
  @ApiOperation({ summary: 'Get a single bank account with recent transactions' })
  findOneAccount(@Param('id') id: string) {
    return this.svc.findOneAccount(id);
  }

  @Post('bank-accounts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a bank account' })
  createAccount(@Body() dto: CreateBankAccountDto) {
    return this.svc.createAccount(dto);
  }

  @Patch('bank-accounts/:id')
  @ApiOperation({ summary: 'Update a bank account' })
  updateAccount(@Param('id') id: string, @Body() dto: UpdateBankAccountDto) {
    return this.svc.updateAccount(id, dto);
  }

  @Delete('bank-accounts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a bank account' })
  deleteAccount(@Param('id') id: string) {
    return this.svc.deleteAccount(id);
  }

  @Get('bank-accounts/:id/transactions')
  @ApiOperation({ summary: 'List transactions for a bank account' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTransactions(
    @Param('id') id: string,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.getTransactions(id, {
      type, from, to,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post('bank-accounts/:id/transactions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a transaction for a bank account' })
  createTransaction(
    @Param('id') id: string,
    @Body() dto: CreateBankTransactionDto,
    @GetUser() user: AuthUser,
  ) {
    return this.svc.createTransaction(id, dto.amount, dto, user?.id);
  }
}
