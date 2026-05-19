import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditService } from '../common/services/audit.service';
import { WorkOrdersController } from './work-orders/work-orders.controller';
import { WorkOrdersService } from './work-orders/work-orders.service';
import { ProductionStagesController } from './production-stages/production-stages.controller';
import { ProductionStagesService } from './production-stages/production-stages.service';
import { MaterialConsumptionController } from './material-consumption/material-consumption.controller';
import { MaterialConsumptionService } from './material-consumption/material-consumption.service';
import { OperatorAssignmentsController } from './operator-assignments/operator-assignments.controller';
import { OperatorAssignmentsService } from './operator-assignments/operator-assignments.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    WorkOrdersController,
    ProductionStagesController,
    MaterialConsumptionController,
    OperatorAssignmentsController,
  ],
  providers: [
    WorkOrdersService,
    ProductionStagesService,
    MaterialConsumptionService,
    OperatorAssignmentsService,
    AuditService,
  ],
})
export class ProductionModule {}
