import { Module } from '@nestjs/common';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { PermissionsController } from './permissions/permissions.controller';
import { PermissionsService } from './permissions/permissions.service';
import { AuditService } from '../common/services/audit.service';

@Module({
  controllers: [RolesController, PermissionsController],
  providers: [RolesService, PermissionsService, AuditService],
  exports: [RolesService, PermissionsService],
})
export class RbacModule {}
