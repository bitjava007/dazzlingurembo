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

const BRAND_CSS = `
  :root { --gold: #C9A84C; --dark: #1A1A1A; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #333; background: #fff; }
  .page { padding: 48px; max-width: 800px; margin: 0 auto; }
  .header { background: var(--dark); color: #fff; padding: 32px 48px; margin: -48px -48px 32px; display: flex; justify-content: space-between; align-items: center; }
  .brand-name { font-size: 22px; font-weight: bold; color: var(--gold); letter-spacing: 1px; }
  .brand-sub { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-top: 2px; }
  .brand-contact { font-size: 11px; color: #aaa; margin-top: 8px; line-height: 1.6; }
  .doc-title { font-size: 24px; font-weight: bold; color: var(--gold); letter-spacing: 2px; }
  .doc-number { font-size: 14px; color: #ccc; margin-top: 4px; }
  .doc-meta { font-size: 11px; color: #aaa; margin-top: 8px; line-height: 1.8; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 3px; font-size: 10px; font-weight: bold; text-transform: uppercase; background: var(--gold); color: var(--dark); margin-top: 6px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: var(--gold); border-bottom: 1px solid #e8e0d0; padding-bottom: 6px; margin-bottom: 12px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 28px; }
  .info-block { background: #fafaf8; border-left: 3px solid var(--gold); padding: 12px 16px; }
  .info-block .title { font-weight: bold; color: var(--dark); font-size: 14px; }
  .info-block .detail { font-size: 12px; color: #666; margin-top: 3px; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: var(--dark); color: var(--gold); padding: 10px 12px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
  thead th:first-child { text-align: left; }
  tbody td { padding: 10px 12px; border-bottom: 1px solid #f0ece4; text-align: right; }
  tbody td:first-child { text-align: left; }
  tbody tr:nth-child(even) td { background: #faf9f7; }
  .sku { font-size: 11px; color: #999; }
  .totals-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
  .totals { width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
  .totals-row.grand-total { border-top: 2px solid var(--gold); padding-top: 8px; margin-top: 4px; font-size: 15px; font-weight: bold; color: var(--dark); }
  .notes-box { background: #fafaf8; border: 1px solid #e8e0d0; border-radius: 4px; padding: 14px; font-size: 12px; color: #555; line-height: 1.6; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e8e0d0; display: flex; justify-content: space-between; font-size: 11px; color: #aaa; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

export function generatePurchaseOrderHtml(po: PurchaseOrderData): string {
  const fmt = (n: number) => `${po.originalCurrencyCode} ${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const date = (d?: Date | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const itemRows = (po.items ?? []).map(item => `
    <tr>
      <td>${item.description}${item.sku ? `<br/><span class="sku">${item.sku}</span>` : ''}</td>
      <td>${item.quantityOrdered}</td>
      <td>${fmt(item.unitCost)}</td>
      <td>${item.taxAmount > 0 ? fmt(item.taxAmount) : '—'}</td>
      <td>${fmt(item.lineTotal)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Purchase Order ${po.poNumber}</title>
<style>${BRAND_CSS}</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand-name">Dazzling Urembo</div>
      <div class="brand-sub">Fashion &amp; Tailoring</div>
      <div class="brand-contact">
        ${po.branch?.name ? `${po.branch.name}<br/>` : ''}
        ${po.branch?.address ? `${po.branch.address}<br/>` : ''}
        ${po.branch?.city ? `${po.branch.city}<br/>` : ''}
        ${po.branch?.phone ? `${po.branch.phone}<br/>` : ''}
        ${po.branch?.email ? po.branch.email : ''}
      </div>
    </div>
    <div style="text-align:right">
      <div class="doc-title">PURCHASE ORDER</div>
      <div class="doc-number"># ${po.poNumber}</div>
      <div class="doc-meta">
        Sent: ${date(po.sentAt)}<br/>
        Expected: ${date(po.expectedDeliveryAt)}
      </div>
      <div><span class="status-badge">${po.status}</span></div>
    </div>
  </div>

  ${po.supplier ? `
  <div class="two-col">
    <div class="info-block">
      <div class="title">${po.supplier.name}</div>
      <div class="detail">
        ${po.supplier.email ? `${po.supplier.email}<br/>` : ''}
        ${po.supplier.phone ? `${po.supplier.phone}<br/>` : ''}
        ${po.supplier.addressLine1 ? `${po.supplier.addressLine1}<br/>` : ''}
        ${[po.supplier.city, po.supplier.countryCode].filter(Boolean).join(', ')}
      </div>
    </div>
    <div></div>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Items</div>
    <table>
      <thead>
        <tr><th>Description</th><th>Qty</th><th>Unit Cost</th><th>Tax</th><th>Total</th></tr>
      </thead>
      <tbody>${itemRows || '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:20px">No items</td></tr>'}</tbody>
    </table>
  </div>

  <div class="totals-wrap">
    <div class="totals">
      <div class="totals-row"><span style="color:#666">Subtotal</span><span>${fmt(po.subtotal)}</span></div>
      ${po.taxAmount > 0 ? `<div class="totals-row"><span style="color:#666">Tax</span><span>${fmt(po.taxAmount)}</span></div>` : ''}
      ${po.shippingAmount > 0 ? `<div class="totals-row"><span style="color:#666">Shipping</span><span>${fmt(po.shippingAmount)}</span></div>` : ''}
      <div class="totals-row grand-total"><span>Total</span><span>${fmt(po.totalAmount)}</span></div>
      ${po.paidAmount > 0 ? `<div class="totals-row"><span style="color:#666">Paid</span><span>-${fmt(po.paidAmount)}</span></div>` : ''}
    </div>
  </div>

  ${po.notes ? `<div class="section" style="margin-top:28px"><div class="section-title">Notes</div><div class="notes-box">${po.notes}</div></div>` : ''}
  ${po.terms ? `<div class="section"><div class="section-title">Terms &amp; Conditions</div><div class="notes-box">${po.terms}</div></div>` : ''}

  <div class="footer">
    <span>Generated by Dazzling Urembo ERP</span>
    <span>Purchase Order — Confidential</span>
  </div>
</div>
</body>
</html>`;
}
