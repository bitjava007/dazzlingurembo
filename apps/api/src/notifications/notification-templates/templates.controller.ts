import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications/templates')
export class TemplatesController {
  constructor(private readonly svc: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List notification templates' })
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create notification template' })
  create(@Body() dto: CreateTemplateDto) {
    return this.svc.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update notification template' })
  update(@Param('id') id: string, @Body() dto: CreateTemplateDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification template (soft)' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post(':id/preview')
  @ApiOperation({ summary: 'Preview rendered template with variables' })
  preview(@Param('id') id: string, @Body() variables: Record<string, string>) {
    return this.svc.findOne(id).then(({ data }) => ({
      data: {
        rendered: this.svc.render(data.bodyHtml ?? data.bodyText ?? '', variables),
        subject: data.subject ? this.svc.render(data.subject, variables) : null,
      },
    }));
  }
}
