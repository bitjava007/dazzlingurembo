import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getInfo(): Record<string, unknown> {
    return {
      name: 'Dazzling UM API',
      version: '1.0.0',
      environment: this.configService.get<string>('app.nodeEnv', 'development'),
      timestamp: new Date().toISOString(),
    };
  }
}
