import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ProofOfDeliveryService } from './proof-of-delivery.service';
import { CreateProofOfDeliveryDto } from './dto/create-pod.dto';

interface AuthUser { id: string }

@ApiTags('logistics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('logistics')
export class ProofOfDeliveryController {
  constructor(private readonly svc: ProofOfDeliveryService) {}

  @Get('deliveries/:deliveryId/pod')
  @ApiOperation({ summary: 'Get proof of delivery' })
  findByDelivery(@Param('deliveryId') deliveryId: string) {
    return this.svc.findByDelivery(deliveryId);
  }

  @Post('pod')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create proof of delivery' })
  create(@Body() dto: CreateProofOfDeliveryDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }
}
