import { Module } from '@nestjs/common';
import { CountriesController } from './countries/countries.controller';
import { CountriesService } from './countries/countries.service';
import { BranchesController } from './branches/branches.controller';
import { BranchesService } from './branches/branches.service';
import { WorkshopsController } from './workshops/workshops.controller';
import { WorkshopsService } from './workshops/workshops.service';
import { WarehousesController } from './warehouses/warehouses.controller';
import { WarehousesService } from './warehouses/warehouses.service';
import { AuditService } from '../common/services/audit.service';

@Module({
  controllers: [
    CountriesController,
    BranchesController,
    WorkshopsController,
    WarehousesController,
  ],
  providers: [
    CountriesService,
    BranchesService,
    WorkshopsService,
    WarehousesService,
    AuditService,
  ],
  exports: [CountriesService, BranchesService, WorkshopsService, WarehousesService],
})
export class OrganizationModule {}
