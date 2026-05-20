import { Controller, Get, Post, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { BOMService } from './bom.service';
import { CreateBOMDto, CreateBOMItemDto } from './dto/create-bom.dto';

interface AuthUser { id: string }

@ApiTags('fashion')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('fashion/bom')
export class BOMController {
  constructor(private readonly svc: BOMService) {}

  @Get() @ApiOperation({ summary: 'List BOMs' })
  findAll(@Query() q: Record<string, string>) { return this.svc.findAll(q); }

  @Get('product/:productId') @ApiOperation({ summary: 'Get BOM for product' })
  findByProduct(@Param('productId') id: string) { return this.svc.findByProduct(id); }

  @Get(':id/explode') @ApiOperation({ summary: 'Explode BOM to material requirements' })
  explode(@Param('id') id: string, @Query('quantity') qty: string) { return this.svc.explode(id, Number(qty) || 1); }

  @Get(':id') @ApiOperation({ summary: 'Get BOM details with items' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create BOM' })
  create(@Body() dto: CreateBOMDto, @GetUser() u: AuthUser) { return this.svc.create(dto, u?.id); }

  @Post(':id/items') @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Add item to BOM' })
  addItem(@Param('id') id: string, @Body() dto: CreateBOMItemDto) { return this.svc.addItem(id, dto); }

  @Delete(':id/items/:itemId') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Remove BOM item' })
  removeItem(@Param('itemId') itemId: string) { return this.svc.removeItem(itemId); }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete BOM' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
