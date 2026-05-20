import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditService } from '../common/services/audit.service';
import { JournalController } from './journal/journal.controller';
import { JournalService } from './journal/journal.service';
import { ExpenseCategoriesController } from './expense-categories/expense-categories.controller';
import { ExpenseCategoriesService } from './expense-categories/expense-categories.service';
import { ExpensesController } from './expenses/expenses.controller';
import { ExpensesService } from './expenses/expenses.service';
import { CashClosuresController } from './cash-closures/cash-closures.controller';
import { CashClosuresService } from './cash-closures/cash-closures.service';
import { ReconciliationsController } from './reconciliations/reconciliations.controller';
import { ReconciliationsService } from './reconciliations/reconciliations.service';
import { ExchangeRatesController } from './exchange-rates/exchange-rates.controller';
import { ExchangeRatesService } from './exchange-rates/exchange-rates.service';
import { TreasuryController } from './treasury/treasury.controller';
import { TreasuryService } from './treasury/treasury.service';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsService } from './analytics/analytics.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    JournalController,
    ExpenseCategoriesController,
    ExpensesController,
    CashClosuresController,
    ReconciliationsController,
    ExchangeRatesController,
    TreasuryController,
    AnalyticsController,
  ],
  providers: [
    JournalService,
    ExpenseCategoriesService,
    ExpensesService,
    CashClosuresService,
    ReconciliationsService,
    ExchangeRatesService,
    TreasuryService,
    AnalyticsService,
    AuditService,
  ],
})
export class FinanceModule {}
