import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TailoringTeamsService } from './tailoring-teams.service';
import { CreateTeamDto } from './dto/create-team.dto';

@ApiTags('fashion')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('fashion/tailoring-teams')
export class TailoringTeamsController {
  constructor(private readonly svc: TailoringTeamsService) {}

  @Get() @ApiOperation({ summary: 'List tailoring teams' })
  findAll(@Query() q: Record<string, string>) { return this.svc.findAll(q); }

  @Get(':id') @ApiOperation({ summary: 'Get team' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post() @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create team' })
  create(@Body() dto: CreateTeamDto) { return this.svc.create(dto); }

  @Patch(':id') @ApiOperation({ summary: 'Update team' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateTeamDto>) { return this.svc.update(id, dto); }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete team' })
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
