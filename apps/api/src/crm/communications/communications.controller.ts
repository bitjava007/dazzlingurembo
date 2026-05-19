import { Controller, Get, Post, Patch, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CommunicationsService } from './communications.service';
import { CreateCommunicationDto } from './dto/create-communication.dto';

interface AuthUser { id: string }

@ApiTags('crm')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('crm/customers/:customerId/communications')
export class CommunicationsController {
  constructor(private readonly svc: CommunicationsService) {}

  @Get() @ApiOperation({ summary: 'List communications for a customer' })
  findAll(@Param('customerId') customerId: string) { return this.svc.findAll(customerId); }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Log a communication' })
  create(@Param('customerId') customerId: string, @Body() dto: CreateCommunicationDto, @GetUser() u: AuthUser) {
    return this.svc.create(customerId, dto, u?.id);
  }

  @Patch(':id/read') @ApiOperation({ summary: 'Mark communication as read' })
  markRead(@Param('id') id: string) { return this.svc.markRead(id); }
}
