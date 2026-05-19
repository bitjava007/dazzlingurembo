import { Controller, Get, Post, Put, Delete, Param, Query, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

interface AuthUser { id: string }

@ApiTags('hr')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('hr/departments')
export class DepartmentsController {
  constructor(private readonly svc: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List departments' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      branchId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create department' })
  create(@Body() dto: CreateDepartmentDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department' })
  update(@Param('id') id: string, @Body() dto: CreateDepartmentDto, @GetUser() u: AuthUser) {
    return this.svc.update(id, dto, u?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department (soft)' })
  remove(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.remove(id, u?.id);
  }
}
