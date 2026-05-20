import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BOMController } from './bom/bom.controller';
import { BOMService } from './bom/bom.service';
import { TailoringTeamsController } from './tailoring-teams/tailoring-teams.controller';
import { TailoringTeamsService } from './tailoring-teams/tailoring-teams.service';
import { CustomOrdersController } from './custom-orders/custom-orders.controller';
import { CustomOrdersService } from './custom-orders/custom-orders.service';
import { AlterationsController } from './alterations/alterations.controller';
import { AlterationsService } from './alterations/alterations.service';
import { ProductionSchedulesController } from './production-schedules/production-schedules.controller';
import { ProductionSchedulesService } from './production-schedules/production-schedules.service';

@Module({
  imports: [PrismaModule],
  controllers: [BOMController, TailoringTeamsController, CustomOrdersController, AlterationsController, ProductionSchedulesController],
  providers: [BOMService, TailoringTeamsService, CustomOrdersService, AlterationsService, ProductionSchedulesService],
})
export class FashionModule {}
