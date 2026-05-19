import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ExpenseCategoriesService } from './expense-categories.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';

interface AuthUser { id: string }

@ApiTags('finance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('finance/expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly svc: ExpenseCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List expense categories' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAll(page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 50);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense category' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create expense category' })
  create(@Body() dto: CreateExpenseCategoryDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update expense category' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateExpenseCategoryDto>, @GetUser() u: AuthUser) {
    return this.svc.update(id, dto, u?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense category' })
  remove(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.remove(id, u?.id);
  }
}
