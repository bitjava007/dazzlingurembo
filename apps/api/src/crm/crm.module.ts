import { Module } from '@nestjs/common';
import { CustomersController } from './customers/customers.controller';
import { CustomersService } from './customers/customers.service';
import { CustomerNotesController } from './customer-notes/customer-notes.controller';
import { CustomerNotesService } from './customer-notes/customer-notes.service';
import { CommunicationsController } from './communications/communications.controller';
import { CommunicationsService } from './communications/communications.service';
import { LoyaltyController } from './loyalty/loyalty.controller';
import { LoyaltyService } from './loyalty/loyalty.service';
import { AuditService } from '../common/services/audit.service';

@Module({
  controllers: [CustomersController, CustomerNotesController, CommunicationsController, LoyaltyController],
  providers: [CustomersService, CustomerNotesService, CommunicationsService, LoyaltyService, AuditService],
  exports: [CustomersService],
})
export class CrmModule {}
