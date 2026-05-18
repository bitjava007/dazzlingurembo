import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Redirect('/api/v1/health', 302)
  @ApiOperation({ summary: 'Redirect to health check' })
  redirectToHealth() {
    return { url: '/api/v1/health' };
  }

  @Get('info')
  @ApiOperation({ summary: 'Get application info' })
  getInfo() {
    return this.appService.getInfo();
  }
}
