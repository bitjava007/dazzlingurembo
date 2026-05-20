import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CustomOrdersService } from './custom-orders.service';
import { CreateCustomOrderDto } from './dto/create-custom-order.dto';

interface AuthUser { id: string }

@ApiTags('fashion')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('fashion/custom-orders')
export class CustomOrdersController {
  constructor(private readonly svc: CustomOrdersService) {}

  @Get() @ApiOperation({ summary: 'List custom orders' })
  findAll(@Query() q: Record<string, string>) { return this.svc.findAll(q); }

  @Get(':id') @ApiOperation({ summary: 'Get custom order' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create custom order' })
  create(@Body() dto: CreateCustomOrderDto, @GetUser() u: AuthUser) { return this.svc.create(dto, u?.id); }

  @Patch(':id') @ApiOperation({ summary: 'Update custom order' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCustomOrderDto>) { return this.svc.update(id, dto); }

  @Patch(':id/status') @ApiOperation({ summary: 'Update custom order status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) { return this.svc.updateStatus(id, status); }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete custom order' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
