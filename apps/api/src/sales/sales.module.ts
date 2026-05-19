import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditService } from '../common/services/audit.service';
import { QuotationsController } from './quotations/quotations.controller';
import { QuotationsService } from './quotations/quotations.service';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { InvoicesController } from './invoices/invoices.controller';
import { InvoicesService } from './invoices/invoices.service';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';
import { ReceiptsController } from './receipts/receipts.controller';
import { ReceiptsService } from './receipts/receipts.service';
import { RefundsController } from './refunds/refunds.controller';
import { RefundsService } from './refunds/refunds.service';
import { ReturnsController } from './returns/returns.controller';
import { ReturnsService } from './returns/returns.service';
import { DeliveryNotesController } from './delivery-notes/delivery-notes.controller';
import { DeliveryNotesService } from './delivery-notes/delivery-notes.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    QuotationsController,
    OrdersController,
    InvoicesController,
    PaymentsController,
    ReceiptsController,
    RefundsController,
    ReturnsController,
    DeliveryNotesController,
  ],
  providers: [
    QuotationsService,
    OrdersService,
    InvoicesService,
    PaymentsService,
    ReceiptsService,
    RefundsService,
    ReturnsService,
    DeliveryNotesService,
    AuditService,
  ],
  exports: [OrdersService, InvoicesService, PaymentsService],
})
export class SalesModule {}
