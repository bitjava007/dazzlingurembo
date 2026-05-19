import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';

interface AuthUser { id: string }

@ApiTags('sales')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('sales/quotations')
export class QuotationsController {
  constructor(private readonly svc: QuotationsService) {}

  @Get()
  @ApiOperation({ summary: 'List quotations' })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('customerId') customerId?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      customerId, branchId, status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quotation details' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create quotation' })
  create(@Body() dto: CreateQuotationDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quotation' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateQuotationDto>, @GetUser() u: AuthUser) {
    return this.svc.update(id, dto, u?.id);
  }

  @Patch(':id/convert-to-order')
  @ApiOperation({ summary: 'Convert quotation to order' })
  convertToOrder(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.convertToOrder(id, u?.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel quotation' })
  cancel(@Param('id') id: string, @GetUser() u: AuthUser) {
    return this.svc.cancel(id, u?.id);
  }
}
