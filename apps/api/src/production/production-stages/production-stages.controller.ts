import { Controller, Get, Post, Patch, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ProductionStagesService } from './production-stages.service';
import { CreateProductionStageDto, CompleteStageDto, FailStageDto } from './dto/create-production-stage.dto';

interface AuthUser { id: string }

@ApiTags('production')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('production')
export class ProductionStagesController {
  constructor(private readonly svc: ProductionStagesService) {}

  @Get('work-orders/:workOrderId/stages')
  @ApiOperation({ summary: 'List stages for a work order' })
  findAll(@Param('workOrderId') workOrderId: string) {
    return this.svc.findAll(workOrderId);
  }

  @Post('stages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create production stage' })
  create(@Body() dto: CreateProductionStageDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch('stages/:id/start')
  @ApiOperation({ summary: 'Start stage' })
  start(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.start(id, u?.id);
  }

  @Patch('stages/:id/complete')
  @ApiOperation({ summary: 'Complete stage' })
  complete(@Param('id') id: string, @Body() dto: CompleteStageDto, @GetUser() u: AuthUser) {
    return this.svc.complete(id, u?.id, dto);
  }

  @Patch('stages/:id/fail')
  @ApiOperation({ summary: 'Fail stage' })
  fail(@Param('id') id: string, @Body() dto: FailStageDto, @GetUser() u: AuthUser) {
    return this.svc.fail(id, u?.id, dto);
  }
}
