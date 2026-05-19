import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { TemplatesController } from './notification-templates/templates.controller';
import { TemplatesService } from './notification-templates/templates.service';

import { LogsController } from './notification-logs/logs.controller';
import { LogsService } from './notification-logs/logs.service';

import { EmailService } from './email/email.service';
import { NotificationEventsService } from './notification-events/notification-events.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    TemplatesController,
    LogsController,
  ],
  providers: [
    TemplatesService,
    LogsService,
    EmailService,
    NotificationEventsService,
  ],
  exports: [
    TemplatesService,
    LogsService,
    EmailService,
    NotificationEventsService,
  ],
})
export class NotificationsModule {}
