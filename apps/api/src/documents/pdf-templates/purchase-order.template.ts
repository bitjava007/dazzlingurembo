export interface PurchaseOrderItem {
  description: string;
  sku?: string | null;
  quantityOrdered: number;
  unitCost: number;
  taxAmount: number;
  lineTotal: number;
}

export interface PurchaseOrderData {
  poNumber: string;
  status: string;
  originalCurrencyCode: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  paidAmount: number;
  expectedDeliveryAt?: Date | null;
  sentAt?: Date | null;
  notes?: string | null;
  terms?: string | null;
  supplier?: {
    name: string;
    email?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    city?: string | null;
    countryCode?: string | null;
  } | null;
  branch?: { name: string; address?: string | null; city?: string | null; phone?: string | null; email?: string | null } | null;
  items?: PurchaseOrderItem[];
}

export function generatePurchaseOrderHtml(po: PurchaseOrderData): string {
  const fmt = (n: number) => `${po.originalCurrencyCode} ${Number(n).toFixed(2)}`;
  const date = (d?: Date | null) => d ? new Date(d).toLocaleDateString() : '-';

  const itemRows = (po.items ?? []).map(item => `
    <tr>
      <td>${item.description}${item.sku ? ` <small>(${item.sku})</small>` : ''}</td>
      <td style="text-align:center">${item.quantityOrdered}</td>
      <td style="text-align:right">${fmt(item.unitCost)}</td>
      <td style="text-align:right">${fmt(item.taxAmount)}</td>
      <td style="text-align:right">${fmt(item.lineTotal)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Purchase Order ${po.poNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #333; padding: 40px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
  .company-name { font-size: 24px; font-weight: bold; color: #1a1a2e; }
  .doc-title { font-size: 28px; font-weight: bold; color: #8e44ad; text-align: right; }
  .doc-meta { text-align: right; color: #666; }
  .section { margin-bottom: 24px; }
  .section-title { font-weight: bold; color: #1a1a2e; border-bottom: 2px solid #8e44ad; padding-bottom: 4px; margin-bottom: 8px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a1a2e; color: #fff; padding: 8px; text-align: left; }
  td { padding: 8px; border-bottom: 1px solid #eee; }
  tr:nth-child(even) td { background: #f8f9fa; }
  .totals { width: 300px; margin-left: auto; margin-top: 16px; }
  .totals td { border: none; padding: 4px 8px; }
  .totals .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #8e44ad; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; color: #999; font-size: 11px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="company-name">${po.branch?.name ?? 'Dazzling UM'}</div>
    ${po.branch?.address ? `<div>${po.branch.address}</div>` : ''}
    ${po.branch?.city ? `<div>${po.branch.city}</div>` : ''}
    ${po.branch?.phone ? `<div>${po.branch.phone}</div>` : ''}
    ${po.branch?.email ? `<div>${po.branch.email}</div>` : ''}
  </div>
  <div>
    <div class="doc-title">PURCHASE ORDER</div>
    <div class="doc-meta">
      <div><strong>#${po.poNumber}</strong></div>
      <div>Status: ${po.status}</div>
      <div>Sent: ${date(po.sentAt)}</div>
      <div>Expected Delivery: ${date(po.expectedDeliveryAt)}</div>
    </div>
  </div>
</div>

<div class="grid">
  ${po.supplier ? `
  <div class="section">
    <div class="section-title">Supplier</div>
    <div><strong>${po.supplier.name}</strong></div>
    ${po.supplier.email ? `<div>${po.supplier.email}</div>` : ''}
    ${po.supplier.phone ? `<div>${po.supplier.phone}</div>` : ''}
    ${po.supplier.addressLine1 ? `<div>${po.supplier.addressLine1}</div>` : ''}
    ${po.supplier.city ? `<div>${po.supplier.city}</div>` : ''}
    ${po.supplier.countryCode ? `<div>${po.supplier.countryCode}</div>` : ''}
  </div>
  ` : '<div></div>'}
  <div></div>
</div>

<div class="section">
  <div class="section-title">Items</div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Cost</th>
        <th style="text-align:right">Tax</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
</div>

<table class="totals">
  <tr><td>Subtotal</td><td style="text-align:right">${fmt(po.subtotal)}</td></tr>
  ${po.taxAmount > 0 ? `<tr><td>Tax</td><td style="text-align:right">${fmt(po.taxAmount)}</td></tr>` : ''}
  ${po.shippingAmount > 0 ? `<tr><td>Shipping</td><td style="text-align:right">${fmt(po.shippingAmount)}</td></tr>` : ''}
  <tr class="total-row"><td>Total</td><td style="text-align:right">${fmt(po.totalAmount)}</td></tr>
  ${po.paidAmount > 0 ? `<tr><td>Paid</td><td style="text-align:right">${fmt(po.paidAmount)}</td></tr>` : ''}
</table>

${po.notes ? `<div class="section"><div class="section-title">Notes</div><p>${po.notes}</p></div>` : ''}
${po.terms ? `<div class="section"><div class="section-title">Terms & Conditions</div><p>${po.terms}</p></div>` : ''}

<div class="footer">
  <p>Purchase Order generated by Dazzling UM ERP.</p>
</div>
</body>
</html>`;
}
