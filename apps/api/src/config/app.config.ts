import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.API_PORT ?? '3001', 10),
  host: process.env.API_HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  webUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
}));
