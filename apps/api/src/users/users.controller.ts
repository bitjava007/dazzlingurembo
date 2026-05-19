import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

interface AuthUser {
  id: string;
  email: string;
}

class UpdateStatusDto {
  status!: UserStatus;
}

class AssignBranchDto {
  branchId!: string;
}

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of users' })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  create(@Body() dto: CreateUserDto, @GetUser() actor: AuthUser) {
    return this.usersService.create(dto, actor?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID with roles' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User data with roles' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @GetUser() actor: AuthUser) {
    return this.usersService.update(id, dto, actor?.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string, @GetUser() actor: AuthUser) {
    return this.usersService.remove(id, actor?.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user status (activate, deactivate, suspend)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @GetUser() actor: AuthUser,
  ) {
    return this.usersService.updateStatus(id, dto.status, actor?.id);
  }

  @Post(':id/roles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto, @GetUser() actor: AuthUser) {
    return this.usersService.assignRole(id, dto, actor?.id);
  }

  @Delete(':id/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiResponse({ status: 204, description: 'Role removed successfully' })
  removeRole(@Param('id') id: string, @Param('roleId') roleId: string, @GetUser() actor: AuthUser) {
    return this.usersService.removeRole(id, roleId, actor?.id);
  }

  @Patch(':id/branch')
  @ApiOperation({ summary: 'Assign user to a branch' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Branch assigned successfully' })
  assignBranch(
    @Param('id') id: string,
    @Body() dto: AssignBranchDto,
    @GetUser() actor: AuthUser,
  ) {
    return this.usersService.assignBranch(id, dto.branchId, actor?.id);
  }
}
