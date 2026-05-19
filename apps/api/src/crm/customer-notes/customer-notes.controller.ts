import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CustomerNotesService } from './customer-notes.service';
import { CreateCustomerNoteDto } from './dto/create-note.dto';

interface AuthUser { id: string }

@ApiTags('crm')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('crm/customers/:customerId/notes')
export class CustomerNotesController {
  constructor(private readonly svc: CustomerNotesService) {}

  @Get() @ApiOperation({ summary: 'List notes for a customer' })
  findAll(@Param('customerId') customerId: string) { return this.svc.findAll(customerId); }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Add note to customer' })
  create(@Param('customerId') customerId: string, @Body() dto: CreateCustomerNoteDto, @GetUser() u: AuthUser) {
    return this.svc.create(customerId, dto, u?.id);
  }

  @Delete(':noteId') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete note' })
  remove(@Param('customerId') customerId: string, @Param('noteId') noteId: string) {
    return this.svc.remove(customerId, noteId);
  }
}
