import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { DocumentGeneratorController } from './document-generator/document-generator.controller';
import { DocumentGeneratorService } from './document-generator/document-generator.service';

import { StorageService } from './storage/storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    DocumentGeneratorController,
  ],
  providers: [
    DocumentGeneratorService,
    StorageService,
  ],
  exports: [
    DocumentGeneratorService,
    StorageService,
  ],
})
export class DocumentsModule {}
