import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';

interface AuthUser { id: string }

@ApiTags('crm')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('crm/customers')
export class CustomersController {
  constructor(private readonly svc: CustomersService) {}

  @Get() @ApiOperation({ summary: 'List customers with search and filters' })
  findAll(@Query() q: QueryCustomersDto) { return this.svc.findAll(q); }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create customer' })
  create(@Body() dto: CreateCustomerDto, @GetUser() u: AuthUser) { return this.svc.create(dto, u?.id); }

  @Get(':id') @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update customer' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto, @GetUser() u: AuthUser) { return this.svc.update(id, dto, u?.id); }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Soft delete customer' })
  remove(@Param('id') id: string, @GetUser() u: AuthUser) { return this.svc.remove(id, u?.id); }
}
