import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateInvoiceHtml } from '../pdf-templates/invoice.template';
import { generateQuotationHtml } from '../pdf-templates/quotation.template';
import { generateReceiptHtml } from '../pdf-templates/receipt.template';
import { generateDeliveryNoteHtml } from '../pdf-templates/delivery-note.template';
import { generatePurchaseOrderHtml } from '../pdf-templates/purchase-order.template';

@Injectable()
export class DocumentGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async generateInvoicePdf(invoiceId: string): Promise<{ buffer: Buffer; filename: string }> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        branch: true,
        payments: { include: { receipt: true } },
      },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);

    // Fetch customer if exists
    let customer: { firstName: string; lastName: string; email?: string | null; phone?: string | null } | null = null;
    if (invoice.customerId) {
      customer = await this.prisma.customer.findUnique({
        where: { id: invoice.customerId },
        select: { firstName: true, lastName: true, email: true, phone: true },
      });
    }

    const html = generateInvoiceHtml({
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      issuedAt: invoice.issuedAt,
      dueAt: invoice.dueAt,
      currencyCode: invoice.currencyCode,
      subtotal: Number(invoice.subtotal),
      discountAmount: Number(invoice.discountAmount),
      taxAmount: Number(invoice.taxAmount),
      totalAmount: Number(invoice.totalAmount),
      paidAmount: Number(invoice.paidAmount),
      balanceDue: Number(invoice.balanceDue),
      notes: invoice.notes,
      terms: invoice.terms,
      branch: invoice.branch,
      customer,
    });

    return { buffer: Buffer.from(html, 'utf-8'), filename: `invoice-${invoice.invoiceNumber}.html` };
  }

  async generateQuotationPdf(quotationId: string): Promise<{ buffer: Buffer; filename: string }> {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        branch: true,
        items: true,
      },
    });
    if (!quotation) throw new NotFoundException(`Quotation ${quotationId} not found`);

    let customer: { firstName: string; lastName: string; email?: string | null; phone?: string | null } | null = null;
    if (quotation.customerId) {
      customer = await this.prisma.customer.findUnique({
        where: { id: quotation.customerId },
        select: { firstName: true, lastName: true, email: true, phone: true },
      });
    }

    const html = generateQuotationHtml({
      quotationNumber: quotation.quotationNumber,
      status: quotation.status,
      validUntil: quotation.validUntil,
      currencyCode: quotation.currencyCode,
      subtotal: Number(quotation.subtotal),
      discountAmount: Number(quotation.discountAmount),
      taxAmount: Number(quotation.taxAmount),
      totalAmount: Number(quotation.totalAmount),
      notes: quotation.notes,
      termsConditions: quotation.termsConditions,
      branch: quotation.branch,
      customer,
      items: quotation.items.map(i => ({
        name: i.name,
        sku: i.sku ?? undefined,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        taxAmount: Number(i.taxAmount),
        lineTotal: Number(i.lineTotal),
      })),
    });

    return { buffer: Buffer.from(html, 'utf-8'), filename: `quotation-${quotation.quotationNumber}.html` };
  }

  async generateReceiptPdf(receiptId: string): Promise<{ buffer: Buffer; filename: string }> {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        branch: true,
        payment: true,
      },
    });
    if (!receipt) throw new NotFoundException(`Receipt ${receiptId} not found`);

    const html = generateReceiptHtml({
      receiptNumber: receipt.receiptNumber,
      issuedAt: receipt.issuedAt,
      paymentMethod: receipt.payment?.method,
      originalCurrencyCode: receipt.payment?.originalCurrencyCode ?? '',
      originalAmount: Number(receipt.payment?.originalAmount ?? 0),
      notes: receipt.notes,
      branch: receipt.branch,
    });

    return { buffer: Buffer.from(html, 'utf-8'), filename: `receipt-${receipt.receiptNumber}.html` };
  }

  async generateDeliveryNotePdf(deliveryNoteId: string): Promise<{ buffer: Buffer; filename: string }> {
    const note = await this.prisma.deliveryNote.findUnique({
      where: { id: deliveryNoteId },
      include: {
        branch: true,
        order: true,
      },
    });
    if (!note) throw new NotFoundException(`Delivery note ${deliveryNoteId} not found`);

    const html = generateDeliveryNoteHtml({
      noteNumber: note.noteNumber,
      issuedAt: note.issuedAt,
      shippedAt: note.shippedAt,
      deliveredAt: note.deliveredAt,
      carrierName: note.carrierName,
      trackingNumber: note.trackingNumber,
      notes: note.notes,
      signedBy: note.signedBy,
      branch: note.branch,
      order: note.order ? {
        orderNumber: note.order.orderNumber,
        shippingAddressLine1: note.order.shippingAddressLine1,
        shippingAddressLine2: note.order.shippingAddressLine2,
        shippingCity: note.order.shippingCity,
        shippingState: note.order.shippingState,
        shippingCountryCode: note.order.shippingCountryCode,
      } : null,
    });

    return { buffer: Buffer.from(html, 'utf-8'), filename: `delivery-note-${note.noteNumber}.html` };
  }

  async generatePurchaseOrderPdf(poId: string): Promise<{ buffer: Buffer; filename: string }> {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        branch: true,
        supplier: true,
        items: true,
      },
    });
    if (!po) throw new NotFoundException(`Purchase order ${poId} not found`);

    const html = generatePurchaseOrderHtml({
      poNumber: po.poNumber,
      status: po.status,
      originalCurrencyCode: po.originalCurrencyCode,
      subtotal: Number(po.subtotal),
      taxAmount: Number(po.taxAmount),
      shippingAmount: Number(po.shippingAmount),
      totalAmount: Number(po.totalAmount),
      paidAmount: Number(po.paidAmount),
      expectedDeliveryAt: po.expectedDeliveryAt,
      sentAt: po.sentAt,
      notes: po.notes,
      terms: po.terms,
      branch: po.branch,
      supplier: po.supplier,
      items: po.items.map(i => ({
        description: i.description,
        sku: i.sku,
        quantityOrdered: i.quantityOrdered,
        unitCost: Number(i.unitCost),
        taxAmount: Number(i.taxAmount),
        lineTotal: Number(i.lineTotal),
      })),
    });

    return { buffer: Buffer.from(html, 'utf-8'), filename: `purchase-order-${po.poNumber}.html` };
  }
}
