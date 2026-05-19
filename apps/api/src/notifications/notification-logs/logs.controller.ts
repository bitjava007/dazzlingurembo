import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LogsService } from './logs.service';
import { QueryLogsDto } from './dto/query-logs.dto';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications/logs')
export class LogsController {
  constructor(private readonly svc: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'List notification logs' })
  findAll(@Query() query: QueryLogsDto) {
    return this.svc.findAll(query);
  }

  @Get('entity/:type/:id')
  @ApiOperation({ summary: 'Get notification logs by entity' })
  findByEntity(@Param('type') type: string, @Param('id') id: string) {
    return this.svc.findByEntity(type, id);
  }
}
