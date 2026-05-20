import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

interface AuthUser { id: string }

class RejectExpenseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('finance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('finance/expenses')
export class ExpensesController {
  constructor(private readonly svc: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'List expenses' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      branchId, categoryId, status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create expense' })
  create(@Body() dto: CreateExpenseDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/submit')
  @ApiOperation({ summary: 'Submit expense for approval' })
  submit(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.submit(id, u?.id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve expense' })
  approve(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.approve(id, u?.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject expense' })
  reject(@Param('id') id: string, @Body() body: RejectExpenseDto, @GetUser() u: AuthUser) {
    return this.svc.reject(id, u?.id, body.reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense' })
  remove(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.remove(id, u?.id);
  }
}
