import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SkusService } from './skus.service';
import { CreateSkuDto } from './dto/create-sku.dto';

@ApiTags('catalog')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/variants/:variantId/skus')
export class SkusController {
  constructor(private readonly svc: SkusService) {}

  @Get() @ApiOperation({ summary: 'List SKUs for a variant' })
  findAll(@Param('variantId') variantId: string) { return this.svc.findAll(variantId); }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create SKU for variant' })
  create(@Param('variantId') variantId: string, @Body() dto: CreateSkuDto) { return this.svc.create(variantId, dto); }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete SKU' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
