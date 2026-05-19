import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';

interface AuthUser { id: string }

@ApiTags('production')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('production/work-orders')
export class WorkOrdersController {
  constructor(private readonly svc: WorkOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List work orders' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'workshopId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('workshopId') workshopId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      branchId, workshopId, status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work order with stages' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create work order' })
  create(@Body() dto: CreateWorkOrderDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Start work order (DRAFT/SCHEDULED -> IN_PROGRESS)' })
  start(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.start(id, u?.id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete work order' })
  complete(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.complete(id, u?.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel work order' })
  cancel(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.cancel(id, u?.id);
  }
}
