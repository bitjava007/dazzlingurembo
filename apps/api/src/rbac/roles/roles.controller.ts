import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

interface AssignPermissionDto {
  permissionId: string;
}

interface AuthUser {
  id: string;
}

@ApiTags('rbac')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('rbac/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles with permission counts' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  create(@Body() dto: CreateRoleDto, @GetUser() actor: AuthUser) {
    return this.rolesService.create(dto, actor?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID with its permissions' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role data with permissions' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto, @GetUser() actor: AuthUser) {
    return this.rolesService.update(id, dto, actor?.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  remove(@Param('id') id: string, @GetUser() actor: AuthUser) {
    return this.rolesService.remove(id, actor?.id);
  }

  @Post(':id/permissions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign a permission to a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 201, description: 'Permission assigned successfully' })
  assignPermission(
    @Param('id') id: string,
    @Body() dto: AssignPermissionDto,
    @GetUser() actor: AuthUser,
  ) {
    return this.rolesService.assignPermission(id, dto.permissionId, actor?.id);
  }

  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiParam({ name: 'permissionId', description: 'Permission ID' })
  @ApiResponse({ status: 204, description: 'Permission removed successfully' })
  removePermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
    @GetUser() actor: AuthUser,
  ) {
    return this.rolesService.removePermission(id, permissionId, actor?.id);
  }
}
