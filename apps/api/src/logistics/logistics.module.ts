import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditService } from '../common/services/audit.service';
import { DeliveriesController } from './deliveries/deliveries.controller';
import { DeliveriesService } from './deliveries/deliveries.service';
import { ProofOfDeliveryController } from './proof-of-delivery/proof-of-delivery.controller';
import { ProofOfDeliveryService } from './proof-of-delivery/proof-of-delivery.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    DeliveriesController,
    ProofOfDeliveryController,
  ],
  providers: [
    DeliveriesService,
    ProofOfDeliveryService,
    AuditService,
  ],
})
export class LogisticsModule {}
