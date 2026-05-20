import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ProductionSchedulesService } from './production-schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

interface AuthUser { id: string }

@ApiTags('fashion')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('fashion/production-schedules')
export class ProductionSchedulesController {
  constructor(private readonly svc: ProductionSchedulesService) {}

  @Get() @ApiOperation({ summary: 'List production schedules' })
  findAll(@Query() q: Record<string, string>) { return this.svc.findAll(q); }

  @Get('calendar') @ApiOperation({ summary: 'Get calendar view of schedules' })
  findCalendar(
    @Query('workshopId') workshopId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) { return this.svc.findCalendar(workshopId, start, end); }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create production schedule' })
  create(@Body() dto: CreateScheduleDto, @GetUser() u: AuthUser) { return this.svc.create(dto, u?.id); }

  @Patch(':id') @ApiOperation({ summary: 'Update production schedule' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateScheduleDto>) { return this.svc.update(id, dto); }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete production schedule' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
