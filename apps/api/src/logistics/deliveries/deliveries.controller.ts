import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto, DeliverDto, FailDeliveryDto } from './dto/create-delivery.dto';

interface AuthUser { id: string }

class AssignDeliveryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedToId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;
}

class RescheduleDeliveryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  newDate!: string;
}

@ApiTags('logistics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('logistics/deliveries')
export class DeliveriesController {
  constructor(private readonly svc: DeliveriesService) {}

  @Get()
  @ApiOperation({ summary: 'List deliveries' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'orderId', required: false })
  @ApiQuery({ name: 'assignedToId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('orderId') orderId?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      branchId, status, orderId, assignedToId, search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create delivery' })
  create(@Body() dto: CreateDeliveryDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign delivery to driver' })
  assign(@Param('id') id: string, @Body() dto: AssignDeliveryDto, @GetUser() u: AuthUser) {
    return this.svc.assign(id, dto.assignedToId, dto.vehicleId, u?.id);
  }

  @Patch(':id/dispatch')
  @ApiOperation({ summary: 'Dispatch delivery' })
  dispatch(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.dispatch(id, u?.id);
  }

  @Patch(':id/deliver')
  @ApiOperation({ summary: 'Mark delivery as delivered' })
  deliver(@Param('id') id: string, @Body() dto: DeliverDto, @GetUser() u: AuthUser) {
    return this.svc.deliver(id, dto, u?.id);
  }

  @Patch(':id/fail')
  @ApiOperation({ summary: 'Mark delivery as failed' })
  fail(@Param('id') id: string, @Body() dto: FailDeliveryDto, @GetUser() u: AuthUser) {
    return this.svc.fail(id, dto, u?.id);
  }

  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule delivery' })
  reschedule(@Param('id') id: string, @Body() dto: RescheduleDeliveryDto, @GetUser() u: AuthUser) {
    return this.svc.reschedule(id, dto.newDate, u?.id);
  }
}
