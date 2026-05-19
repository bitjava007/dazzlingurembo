import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditService } from '../common/services/audit.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { VariantsController } from './variants/variants.controller';
import { VariantsService } from './variants/variants.service';
import { SkusController } from './skus/skus.controller';
import { SkusService } from './skus/skus.service';
import { MediaController } from './media/media.controller';
import { MediaService } from './media/media.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CategoriesController,
    ProductsController,
    VariantsController,
    SkusController,
    MediaController,
  ],
  providers: [
    CategoriesService,
    ProductsService,
    VariantsService,
    SkusService,
    MediaService,
    AuditService,
  ],
  exports: [ProductsService, VariantsService],
})
export class CatalogModule {}
