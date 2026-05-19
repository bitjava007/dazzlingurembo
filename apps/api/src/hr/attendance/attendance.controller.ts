import { Controller, Get, Post, Put, Param, Query, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

interface AuthUser { id: string }

@ApiTags('hr')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('hr/attendance')
export class AttendanceController {
  constructor(private readonly svc: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'List attendance records' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      employeeId,
      startDate,
      endDate,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get attendance by employee and month' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  findByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const now = new Date();
    return this.svc.findByEmployee(
      employeeId,
      month ? parseInt(month, 10) : now.getMonth() + 1,
      year ? parseInt(year, 10) : now.getFullYear(),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create attendance record' })
  create(@Body() dto: CreateAttendanceDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk create attendance records' })
  bulkCreate(@Body() records: CreateAttendanceDto[], @GetUser() u: AuthUser) {
    return this.svc.bulkCreate(records, u?.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update attendance record' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateAttendanceDto>, @GetUser() u: AuthUser) {
    return this.svc.update(id, dto, u?.id);
  }
}
