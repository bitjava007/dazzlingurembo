import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditService } from '../common/services/audit.service';
import { SuppliersController } from './suppliers/suppliers.controller';
import { SuppliersService } from './suppliers/suppliers.service';
import { PurchaseOrdersController } from './purchase-orders/purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders/purchase-orders.service';
import { GoodsReceiptsController } from './goods-receipts/goods-receipts.controller';
import { GoodsReceiptsService } from './goods-receipts/goods-receipts.service';
import { SupplierInvoicesController } from './supplier-invoices/supplier-invoices.controller';
import { SupplierInvoicesService } from './supplier-invoices/supplier-invoices.service';
import { SupplierPaymentsController } from './supplier-payments/supplier-payments.controller';
import { SupplierPaymentsService } from './supplier-payments/supplier-payments.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    SuppliersController,
    PurchaseOrdersController,
    GoodsReceiptsController,
    SupplierInvoicesController,
    SupplierPaymentsController,
  ],
  providers: [
    SuppliersService,
    PurchaseOrdersService,
    GoodsReceiptsService,
    SupplierInvoicesService,
    SupplierPaymentsService,
    AuditService,
  ],
})
export class ProcurementModule {}
