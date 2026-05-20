import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AlterationsService } from './alterations.service';
import { CreateAlterationDto } from './dto/create-alteration.dto';

interface AuthUser { id: string }

@ApiTags('fashion')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('fashion/alterations')
export class AlterationsController {
  constructor(private readonly svc: AlterationsService) {}

  @Get() @ApiOperation({ summary: 'List alterations' })
  findAll(@Query() q: Record<string, string>) { return this.svc.findAll(q); }

  @Get(':id') @ApiOperation({ summary: 'Get alteration' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create alteration' })
  create(@Body() dto: CreateAlterationDto, @GetUser() u: AuthUser) { return this.svc.create(dto, u?.id); }

  @Patch(':id/start') @ApiOperation({ summary: 'Start alteration (RECEIVED -> IN_PROGRESS)' })
  start(
    @Param('id') id: string,
    @Body('tailorId') tailorId?: string,
    @Body('workshopId') workshopId?: string,
  ) { return this.svc.start(id, tailorId, workshopId); }

  @Patch(':id/complete') @ApiOperation({ summary: 'Complete alteration' })
  complete(
    @Param('id') id: string,
    @Body('finalCost') finalCost?: number,
    @Body('actualTime') actualTime?: number,
  ) { return this.svc.complete(id, finalCost, actualTime); }

  @Patch(':id/deliver') @ApiOperation({ summary: 'Deliver alteration' })
  deliver(@Param('id') id: string) { return this.svc.deliver(id); }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete alteration' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
