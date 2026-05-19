import { Controller, Get, Post, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { OperatorAssignmentsService } from './operator-assignments.service';
import { CreateOperatorAssignmentDto } from './dto/create-operator-assignment.dto';

interface AuthUser { id: string }

@ApiTags('production')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('production/operator-assignments')
export class OperatorAssignmentsController {
  constructor(private readonly svc: OperatorAssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List operator assignments' })
  @ApiQuery({ name: 'workOrderId', required: false })
  @ApiQuery({ name: 'operatorId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('workOrderId') workOrderId?: string,
    @Query('operatorId') operatorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      workOrderId, operatorId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign operator to work order' })
  assign(@Body() dto: CreateOperatorAssignmentDto, @GetUser() u: AuthUser) {
    return this.svc.assign(dto, u?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Unassign operator' })
  unassign(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.unassign(id, u?.id);
  }
}
