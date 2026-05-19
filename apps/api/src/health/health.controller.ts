import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  services: {
    database: 'ok' | 'error';
    api: 'ok';
  };
  version: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unavailable' })
  async getHealth(): Promise<HealthStatus> {
    let dbStatus: 'ok' | 'error' = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbStatus,
        api: 'ok',
      },
      version: process.env.npm_package_version ?? '1.0.0',
    };
  }
}
