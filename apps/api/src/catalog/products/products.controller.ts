import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

interface AuthUser { id: string }

@ApiTags('catalog')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/products')
export class ProductsController {
  constructor(private readonly svc: ProductsService) {}

  @Get() @ApiOperation({ summary: 'List products with filters and search' })
  findAll(@Query() q: QueryProductsDto) { return this.svc.findAll(q); }

  @Get('low-stock') @ApiOperation({ summary: 'Get products below reorder point' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  getLowStock(@Query('threshold') threshold?: string) {
    return this.svc.getLowStock(threshold ? parseInt(threshold) : undefined);
  }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create product' })
  create(@Body() dto: CreateProductDto, @GetUser() u: AuthUser) { return this.svc.create(dto, u?.id); }

  @Get(':id') @ApiOperation({ summary: 'Get product with variants and media' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @GetUser() u: AuthUser) { return this.svc.update(id, dto, u?.id); }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Soft delete product' })
  remove(@Param('id') id: string, @GetUser() u: AuthUser) { return this.svc.remove(id, u?.id); }
}
