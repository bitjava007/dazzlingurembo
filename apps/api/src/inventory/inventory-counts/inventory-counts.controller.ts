import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InventoryCountsService } from './inventory-counts.service';
import { CreateInventoryCountDto, InventoryCountItemDto } from './dto/create-inventory-count.dto';

interface AuthUser { id: string }

class SubmitResultsDto {
  @ApiProperty({ type: [InventoryCountItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryCountItemDto)
  items!: InventoryCountItemDto[];
}

@ApiTags('inventory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('inventory/inventory-counts')
export class InventoryCountsController {
  constructor(private readonly svc: InventoryCountsService) {}

  @Get()
  @ApiOperation({ summary: 'List inventory counts' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      warehouseId, branchId, status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory count details' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create inventory count' })
  create(@Body() dto: CreateInventoryCountDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/submit-results')
  @ApiOperation({ summary: 'Submit count results' })
  submitResults(@Param('id') id: string, @Body() body: SubmitResultsDto, @GetUser() u: AuthUser) {
    return this.svc.submitResults(id, body.items, u?.id);
  }

  @Patch(':id/apply-corrections')
  @ApiOperation({ summary: 'Apply inventory corrections based on count results' })
  applyCorrections(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.applyCorrections(id, u?.id);
  }
}
