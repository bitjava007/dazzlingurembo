import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';

interface AuthUser { id: string }

@ApiTags('finance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('finance/journal')
export class JournalController {
  constructor(private readonly svc: JournalService) {}

  @Get()
  @ApiOperation({ summary: 'List journal entries' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'accountCode', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('accountCode') accountCode?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      branchId, accountCode, dateFrom, dateTo,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journal entry' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Get('reference/:type/:id')
  @ApiOperation({ summary: 'Get journal entries by reference' })
  findByReference(@Param('type') type: string, @Param('id') id: string) {
    return this.svc.findByReference(type, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create journal entry' })
  create(@Body() dto: CreateJournalEntryDto, @GetUser() u: AuthUser) {
    return this.svc.create(dto, u?.id);
  }
}
