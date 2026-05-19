export interface InvoiceItem {
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  lineTotal: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  status: string;
  issuedAt?: Date | null;
  dueAt?: Date | null;
  currencyCode: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string | null;
  terms?: string | null;
  branch?: {
    name: string;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phone?: string | null;
  } | null;
  items?: InvoiceItem[];
}

export function generateInvoiceHtml(invoice: InvoiceData): string {
  const fmt = (n: number) => `${invoice.currencyCode} ${Number(n).toFixed(2)}`;
  const date = (d?: Date | null) => d ? new Date(d).toLocaleDateString() : '-';

  const itemRows = (invoice.items ?? []).map(item => `
    <tr>
      <td>${item.name}${item.sku ? ` <small>(${item.sku})</small>` : ''}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${fmt(item.unitPrice)}</td>
      <td style="text-align:right">${fmt(item.taxAmount)}</td>
      <td style="text-align:right">${fmt(item.lineTotal)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${invoice.invoiceNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #333; padding: 40px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
  .company-name { font-size: 24px; font-weight: bold; color: #1a1a2e; }
  .doc-title { font-size: 32px; font-weight: bold; color: #4a90e2; text-align: right; }
  .doc-meta { text-align: right; color: #666; }
  .section { margin-bottom: 24px; }
  .section-title { font-weight: bold; color: #1a1a2e; border-bottom: 2px solid #4a90e2; padding-bottom: 4px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #1a1a2e; color: #fff; padding: 8px; text-align: left; }
  td { padding: 8px; border-bottom: 1px solid #eee; }
  tr:nth-child(even) td { background: #f8f9fa; }
  .totals { width: 300px; margin-left: auto; }
  .totals td { border: none; padding: 4px 8px; }
  .totals .total-row td { font-weight: bold; font-size: 15px; color: #1a1a2e; border-top: 2px solid #4a90e2; }
  .balance-row td { font-weight: bold; font-size: 16px; color: #e74c3c; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; color: #999; font-size: 11px; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;
    background: #e8f5e9; color: #2e7d32; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="company-name">${invoice.branch?.name ?? 'Dazzling UM'}</div>
    ${invoice.branch?.address ? `<div>${invoice.branch.address}</div>` : ''}
    ${invoice.branch?.city ? `<div>${invoice.branch.city}</div>` : ''}
    ${invoice.branch?.phone ? `<div>${invoice.branch.phone}</div>` : ''}
    ${invoice.branch?.email ? `<div>${invoice.branch.email}</div>` : ''}
  </div>
  <div>
    <div class="doc-title">INVOICE</div>
    <div class="doc-meta">
      <div><strong>#${invoice.invoiceNumber}</strong></div>
      <div><span class="status-badge">${invoice.status}</span></div>
      <div>Issued: ${date(invoice.issuedAt)}</div>
      <div>Due: ${date(invoice.dueAt)}</div>
    </div>
  </div>
</div>

${invoice.customer ? `
<div class="section">
  <div class="section-title">Bill To</div>
  <div>${invoice.customer.firstName ?? ''} ${invoice.customer.lastName ?? ''}</div>
  ${invoice.customer.email ? `<div>${invoice.customer.email}</div>` : ''}
  ${invoice.customer.phone ? `<div>${invoice.customer.phone}</div>` : ''}
</div>
` : ''}

<div class="section">
  <div class="section-title">Items</div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Tax</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
</div>

<table class="totals">
  <tr><td>Subtotal</td><td style="text-align:right">${fmt(invoice.subtotal)}</td></tr>
  ${invoice.discountAmount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-${fmt(invoice.discountAmount)}</td></tr>` : ''}
  ${invoice.taxAmount > 0 ? `<tr><td>Tax</td><td style="text-align:right">${fmt(invoice.taxAmount)}</td></tr>` : ''}
  <tr class="total-row"><td>Total</td><td style="text-align:right">${fmt(invoice.totalAmount)}</td></tr>
  ${invoice.paidAmount > 0 ? `<tr><td>Paid</td><td style="text-align:right">-${fmt(invoice.paidAmount)}</td></tr>` : ''}
  ${invoice.balanceDue > 0 ? `<tr class="balance-row"><td>Balance Due</td><td style="text-align:right">${fmt(invoice.balanceDue)}</td></tr>` : ''}
</table>

${invoice.notes ? `<div class="section"><div class="section-title">Notes</div><p>${invoice.notes}</p></div>` : ''}
${invoice.terms ? `<div class="section"><div class="section-title">Terms & Conditions</div><p>${invoice.terms}</p></div>` : ''}

<div class="footer">
  <p>Thank you for your business. Generated by Dazzling UM ERP.</p>
</div>
</body>
</html>`;
}
