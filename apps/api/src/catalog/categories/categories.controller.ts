import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

interface AuthUser { id: string }

@ApiTags('catalog')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/categories')
export class CategoriesController {
  constructor(private readonly svc: CategoriesService) {}

  @Get() @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiOperation({ summary: 'List categories with hierarchy' })
  findAll(@Query('isActive') isActive?: string) {
    return this.svc.findAll(isActive !== undefined ? isActive === 'true' : undefined);
  }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create category' })
  create(@Body() dto: CreateCategoryDto, @GetUser() u: AuthUser) { return this.svc.create(dto, u?.id); }

  @Get(':id') @ApiOperation({ summary: 'Get category with hierarchy' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update category' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @GetUser() u: AuthUser) { return this.svc.update(id, dto, u?.id); }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Soft delete category' })
  remove(@Param('id') id: string, @GetUser() u: AuthUser) { return this.svc.remove(id, u?.id); }
}
