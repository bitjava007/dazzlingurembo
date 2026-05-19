export interface QuotationItem {
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  lineTotal: number;
}

export interface QuotationData {
  quotationNumber: string;
  status: string;
  validUntil?: Date | null;
  currencyCode: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string | null;
  termsConditions?: string | null;
  branch?: { name: string; address?: string | null; city?: string | null; phone?: string | null; email?: string | null } | null;
  customer?: { firstName?: string; lastName?: string; email?: string | null; phone?: string | null } | null;
  items?: QuotationItem[];
}

export function generateQuotationHtml(quotation: QuotationData): string {
  const fmt = (n: number) => `${quotation.currencyCode} ${Number(n).toFixed(2)}`;
  const date = (d?: Date | null) => d ? new Date(d).toLocaleDateString() : '-';

  const itemRows = (quotation.items ?? []).map(item => `
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
<title>Quotation ${quotation.quotationNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #333; padding: 40px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
  .company-name { font-size: 24px; font-weight: bold; color: #1a1a2e; }
  .doc-title { font-size: 32px; font-weight: bold; color: #27ae60; text-align: right; }
  .doc-meta { text-align: right; color: #666; }
  .section { margin-bottom: 24px; }
  .section-title { font-weight: bold; color: #1a1a2e; border-bottom: 2px solid #27ae60; padding-bottom: 4px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a1a2e; color: #fff; padding: 8px; text-align: left; }
  td { padding: 8px; border-bottom: 1px solid #eee; }
  tr:nth-child(even) td { background: #f8f9fa; }
  .totals { width: 300px; margin-left: auto; margin-top: 16px; }
  .totals td { border: none; padding: 4px 8px; }
  .totals .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #27ae60; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; color: #999; font-size: 11px; }
  .validity-notice { background: #fff8e1; border-left: 4px solid #ffc107; padding: 12px; margin-bottom: 24px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="company-name">${quotation.branch?.name ?? 'Dazzling UM'}</div>
    ${quotation.branch?.address ? `<div>${quotation.branch.address}</div>` : ''}
    ${quotation.branch?.city ? `<div>${quotation.branch.city}</div>` : ''}
    ${quotation.branch?.phone ? `<div>${quotation.branch.phone}</div>` : ''}
    ${quotation.branch?.email ? `<div>${quotation.branch.email}</div>` : ''}
  </div>
  <div>
    <div class="doc-title">QUOTATION</div>
    <div class="doc-meta">
      <div><strong>#${quotation.quotationNumber}</strong></div>
      <div>Status: ${quotation.status}</div>
      <div>Valid Until: ${date(quotation.validUntil)}</div>
    </div>
  </div>
</div>

${quotation.validUntil ? `
<div class="validity-notice">
  This quotation is valid until <strong>${date(quotation.validUntil)}</strong>.
</div>
` : ''}

${quotation.customer ? `
<div class="section">
  <div class="section-title">Prepared For</div>
  <div>${quotation.customer.firstName ?? ''} ${quotation.customer.lastName ?? ''}</div>
  ${quotation.customer.email ? `<div>${quotation.customer.email}</div>` : ''}
  ${quotation.customer.phone ? `<div>${quotation.customer.phone}</div>` : ''}
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
  <tr><td>Subtotal</td><td style="text-align:right">${fmt(quotation.subtotal)}</td></tr>
  ${quotation.discountAmount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-${fmt(quotation.discountAmount)}</td></tr>` : ''}
  ${quotation.taxAmount > 0 ? `<tr><td>Tax</td><td style="text-align:right">${fmt(quotation.taxAmount)}</td></tr>` : ''}
  <tr class="total-row"><td>Total</td><td style="text-align:right">${fmt(quotation.totalAmount)}</td></tr>
</table>

${quotation.notes ? `<div class="section"><div class="section-title">Notes</div><p>${quotation.notes}</p></div>` : ''}
${quotation.termsConditions ? `<div class="section"><div class="section-title">Terms & Conditions</div><p>${quotation.termsConditions}</p></div>` : ''}

<div class="footer">
  <p>Generated by Dazzling UM ERP. This quotation is subject to acceptance within the validity period.</p>
</div>
</body>
</html>`;
}
