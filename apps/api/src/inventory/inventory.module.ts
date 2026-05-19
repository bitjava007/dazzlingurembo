import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditService } from '../common/services/audit.service';
import { StockBalancesController } from './stock-balances/stock-balances.controller';
import { StockBalancesService } from './stock-balances/stock-balances.service';
import { StockMovementsController } from './stock-movements/stock-movements.controller';
import { StockMovementsService } from './stock-movements/stock-movements.service';
import { StockTransfersController } from './stock-transfers/stock-transfers.controller';
import { StockTransfersService } from './stock-transfers/stock-transfers.service';
import { InventoryCountsController } from './inventory-counts/inventory-counts.controller';
import { InventoryCountsService } from './inventory-counts/inventory-counts.service';
import { StockAdjustmentsController } from './stock-adjustments/stock-adjustments.controller';
import { StockAdjustmentsService } from './stock-adjustments/stock-adjustments.service';
import { DamagedStockController } from './damaged-stock/damaged-stock.controller';
import { DamagedStockService } from './damaged-stock/damaged-stock.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    StockBalancesController,
    StockMovementsController,
    StockTransfersController,
    InventoryCountsController,
    StockAdjustmentsController,
    DamagedStockController,
  ],
  providers: [
    StockBalancesService,
    StockMovementsService,
    StockTransfersService,
    InventoryCountsService,
    StockAdjustmentsService,
    DamagedStockService,
    AuditService,
  ],
  exports: [StockBalancesService, StockMovementsService],
})
export class InventoryModule {}
