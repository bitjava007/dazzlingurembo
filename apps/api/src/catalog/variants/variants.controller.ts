import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

interface AuthUser { id: string }

@ApiTags('catalog')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/products/:productId/variants')
export class VariantsController {
  constructor(private readonly svc: VariantsService) {}

  @Get() @ApiOperation({ summary: 'List variants for a product' })
  findAll(@Param('productId') productId: string) { return this.svc.findAll(productId); }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create variant' })
  create(@Param('productId') productId: string, @Body() dto: CreateVariantDto, @GetUser() u: AuthUser) {
    return this.svc.create(productId, dto, u?.id);
  }

  @Get(':id') @ApiOperation({ summary: 'Get variant' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update variant' })
  update(@Param('id') id: string, @Body() dto: UpdateVariantDto, @GetUser() u: AuthUser) { return this.svc.update(id, dto, u?.id); }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Soft delete variant' })
  remove(@Param('id') id: string, @GetUser() u: AuthUser) { return this.svc.remove(id, u?.id); }
}
