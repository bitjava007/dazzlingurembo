import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: any;

  constructor(private readonly config: ConfigService) {
    // Lazy-load resend to avoid startup failure if not configured
  }

  private getResend() {
    if (!this.resend) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Resend } = require('resend');
        const apiKey = this.config.get<string>('RESEND_API_KEY');
        if (apiKey) this.resend = new Resend(apiKey);
      } catch (e) {
        this.logger.warn('Resend not available');
      }
    }
    return this.resend;
  }

  async sendEmail(params: { to: string; subject: string; html: string; from?: string }): Promise<boolean> {
    const resend = this.getResend();
    if (!resend) {
      this.logger.warn('Email skipped: Resend not configured');
      return false;
    }
    try {
      await resend.emails.send({
        from: params.from ?? this.config.get('RESEND_FROM_EMAIL', 'noreply@dazzlingurembo.com'),
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
      return true;
    } catch (e) {
      this.logger.error('Email send failed', e);
      return false;
    }
  }
}
