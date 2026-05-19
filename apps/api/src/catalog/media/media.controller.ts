import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';

@ApiTags('catalog')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/products/:productId/media')
export class MediaController {
  constructor(private readonly svc: MediaService) {}

  @Get() @ApiOperation({ summary: 'List media for a product' })
  findAll(@Param('productId') productId: string) { return this.svc.findAll(productId); }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Add media metadata to product' })
  create(@Param('productId') productId: string, @Body() dto: CreateMediaDto) { return this.svc.create(productId, dto); }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Remove media' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
