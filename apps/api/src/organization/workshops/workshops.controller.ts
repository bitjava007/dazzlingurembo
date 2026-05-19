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
import { WorkshopsService } from './workshops.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

interface AuthUser {
  id: string;
}

@ApiTags('organization')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('organization/workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Get()
  @ApiOperation({ summary: 'List all workshops' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'List of workshops' })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.workshopsService.findAll({
      branchId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new workshop' })
  @ApiResponse({ status: 201, description: 'Workshop created successfully' })
  @ApiResponse({ status: 409, description: 'Workshop code already exists' })
  create(@Body() dto: CreateWorkshopDto, @GetUser() actor: AuthUser) {
    return this.workshopsService.create(dto, actor?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workshop by ID' })
  @ApiParam({ name: 'id', description: 'Workshop ID' })
  @ApiResponse({ status: 200, description: 'Workshop data' })
  @ApiResponse({ status: 404, description: 'Workshop not found' })
  findOne(@Param('id') id: string) {
    return this.workshopsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workshop' })
  @ApiParam({ name: 'id', description: 'Workshop ID' })
  @ApiResponse({ status: 200, description: 'Workshop updated successfully' })
  @ApiResponse({ status: 404, description: 'Workshop not found' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkshopDto, @GetUser() actor: AuthUser) {
    return this.workshopsService.update(id, dto, actor?.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a workshop' })
  @ApiParam({ name: 'id', description: 'Workshop ID' })
  @ApiResponse({ status: 204, description: 'Workshop deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workshop not found' })
  remove(@Param('id') id: string, @GetUser() actor: AuthUser) {
    return this.workshopsService.remove(id, actor?.id);
  }
}
