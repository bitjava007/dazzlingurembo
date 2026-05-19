import { Injectable, Logger } from '@nestjs/common';
import { TemplatesService } from '../notification-templates/templates.service';
import { EmailService } from '../email/email.service';
import { LogsService } from '../notification-logs/logs.service';

@Injectable()
export class NotificationEventsService {
  private readonly logger = new Logger(NotificationEventsService.name);

  constructor(
    private readonly templates: TemplatesService,
    private readonly email: EmailService,
    private readonly logs: LogsService,
  ) {}

  private async dispatchEmail(
    templateCode: string,
    recipientEmail: string,
    variables: Record<string, string>,
    referenceType: string,
    referenceId: string,
  ): Promise<void> {
    try {
      const template = await this.templates.findByCode(templateCode);
      if (!template) {
        this.logger.warn(`Template not found: ${templateCode}`);
        return;
      }
      const body = this.templates.render(template.bodyHtml ?? template.bodyText ?? '', variables);
      const subject = template.subject ? this.templates.render(template.subject, variables) : '';
      const success = await this.email.sendEmail({ to: recipientEmail, subject, html: body });
      await this.logs.create({
        templateId: template.id,
        channel: 'EMAIL',
        recipientAddress: recipientEmail,
        subject,
        body,
        variables,
        referenceType,
        referenceId,
        status: success ? 'SENT' : 'FAILED',
        sentAt: success ? new Date() : undefined,
        failureReason: success ? undefined : 'Email delivery failed',
      });
    } catch (error) {
      this.logger.error(`Failed to dispatch notification for ${templateCode}`, error);
    }
  }

  async onOrderConfirmed(orderId: string, customerEmail: string, customerName: string, orderRef: string): Promise<void> {
    await this.dispatchEmail(
      'order_confirmed',
      customerEmail,
      { customerName, orderRef, orderId },
      'ORDER',
      orderId,
    );
  }

  async onPaymentReceived(invoiceId: string, customerEmail: string, amount: string, currency: string): Promise<void> {
    await this.dispatchEmail(
      'payment_received',
      customerEmail,
      { invoiceId, amount, currency },
      'INVOICE',
      invoiceId,
    );
  }

  async onInvoiceGenerated(invoiceId: string, customerEmail: string, invoiceRef: string, dueDate: string): Promise<void> {
    await this.dispatchEmail(
      'invoice_generated',
      customerEmail,
      { invoiceId, invoiceRef, dueDate },
      'INVOICE',
      invoiceId,
    );
  }

  async onQuotationGenerated(quotationId: string, customerEmail: string, quotationRef: string, validUntil: string): Promise<void> {
    await this.dispatchEmail(
      'quotation_generated',
      customerEmail,
      { quotationId, quotationRef, validUntil },
      'QUOTATION',
      quotationId,
    );
  }

  async onDeliveryDispatched(deliveryId: string, customerEmail: string, customerName: string, trackingRef: string): Promise<void> {
    await this.dispatchEmail(
      'delivery_dispatched',
      customerEmail,
      { deliveryId, customerName, trackingRef },
      'DELIVERY',
      deliveryId,
    );
  }

  async onDeliveryCompleted(deliveryId: string, customerEmail: string, customerName: string): Promise<void> {
    await this.dispatchEmail(
      'delivery_completed',
      customerEmail,
      { deliveryId, customerName },
      'DELIVERY',
      deliveryId,
    );
  }

  async onDeliveryFailed(deliveryId: string, customerEmail: string, reason: string): Promise<void> {
    await this.dispatchEmail(
      'delivery_failed',
      customerEmail,
      { deliveryId, reason },
      'DELIVERY',
      deliveryId,
    );
  }

  async onPurchaseOrderCreated(poId: string, supplierEmail: string, poRef: string): Promise<void> {
    await this.dispatchEmail(
      'purchase_order_created',
      supplierEmail,
      { poId, poRef },
      'PURCHASE_ORDER',
      poId,
    );
  }

  async onSupplierPaymentRecorded(paymentId: string, supplierEmail: string, amount: string, currency: string): Promise<void> {
    await this.dispatchEmail(
      'supplier_payment_recorded',
      supplierEmail,
      { paymentId, amount, currency },
      'SUPPLIER_PAYMENT',
      paymentId,
    );
  }
}
