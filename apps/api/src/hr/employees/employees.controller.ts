import { Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';

interface AuthUser { id: string }

@ApiTags('hr')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('hr/employees')
export class EmployeesController {
  constructor(private readonly svc: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees' })
  findAll(@Query() query: QueryEmployeesDto) {
    return this.svc.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create employee' })
  create(@Body() dto: CreateEmployeeDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @GetUser() u: AuthUser) {
    return this.svc.update(id, dto, u?.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update employee status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string, @GetUser() u: AuthUser) {
    return this.svc.updateStatus(id, status, u?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee (soft)' })
  remove(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.remove(id, u?.id);
  }
}
