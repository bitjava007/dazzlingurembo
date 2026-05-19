import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { MaterialConsumptionService } from './material-consumption.service';
import { CreateMaterialConsumptionDto } from './dto/create-material-consumption.dto';

interface AuthUser { id: string }

@ApiTags('production')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('production')
export class MaterialConsumptionController {
  constructor(private readonly svc: MaterialConsumptionService) {}

  @Get('work-orders/:workOrderId/materials')
  @ApiOperation({ summary: 'List materials for a work order' })
  findAll(@Param('workOrderId') workOrderId: string) {
    return this.svc.findAll(workOrderId);
  }

  @Post('materials')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record material consumption' })
  record(@Body() dto: CreateMaterialConsumptionDto, @GetUser() u: AuthUser) {
    return this.svc.record(dto, u?.id);
  }
}
