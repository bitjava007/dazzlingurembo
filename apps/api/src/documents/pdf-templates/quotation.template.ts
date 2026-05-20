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

const BRAND_CSS = `
  :root { --gold: #C9A84C; --dark: #1A1A1A; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #333; background: #fff; }
  .page { padding: 48px; max-width: 800px; margin: 0 auto; }
  .header { background: var(--dark); color: #fff; padding: 32px 48px; margin: -48px -48px 32px; display: flex; justify-content: space-between; align-items: center; }
  .brand-name { font-size: 22px; font-weight: bold; color: var(--gold); letter-spacing: 1px; }
  .brand-sub { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-top: 2px; }
  .brand-contact { font-size: 11px; color: #aaa; margin-top: 8px; line-height: 1.6; }
  .doc-title { font-size: 28px; font-weight: bold; color: var(--gold); letter-spacing: 2px; }
  .doc-number { font-size: 14px; color: #ccc; margin-top: 4px; }
  .doc-dates { font-size: 11px; color: #aaa; margin-top: 8px; line-height: 1.8; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 3px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; background: var(--gold); color: var(--dark); margin-top: 6px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: var(--gold); border-bottom: 1px solid #e8e0d0; padding-bottom: 6px; margin-bottom: 12px; }
  .validity-banner { background: #fff8e6; border: 1px solid #f0d080; border-left: 4px solid var(--gold); padding: 12px 16px; border-radius: 0 4px 4px 0; font-size: 12px; color: #7a5c00; margin-bottom: 28px; }
  .bill-to { background: #fafaf8; border-left: 3px solid var(--gold); padding: 12px 16px; }
  .bill-to .name { font-size: 15px; font-weight: bold; color: var(--dark); }
  .bill-to .detail { font-size: 12px; color: #666; margin-top: 3px; }
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
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e8e0d0; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #aaa; }
  .footer-note { color: var(--gold); font-style: italic; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

export function generateQuotationHtml(quotation: QuotationData): string {
  const fmt = (n: number) => `${quotation.currencyCode} ${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const date = (d?: Date | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const itemRows = (quotation.items ?? []).map(item => `
    <tr>
      <td>${item.name}${item.sku ? `<br/><span class="sku">${item.sku}</span>` : ''}</td>
      <td>${item.quantity}</td>
      <td>${fmt(item.unitPrice)}</td>
      <td>${item.taxAmount > 0 ? fmt(item.taxAmount) : '—'}</td>
      <td>${fmt(item.lineTotal)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Quotation ${quotation.quotationNumber}</title>
<style>${BRAND_CSS}</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand-name">Dazzling Urembo</div>
      <div class="brand-sub">Fashion &amp; Tailoring</div>
      <div class="brand-contact">
        ${quotation.branch?.name ? `${quotation.branch.name}<br/>` : ''}
        ${quotation.branch?.address ? `${quotation.branch.address}<br/>` : ''}
        ${quotation.branch?.city ? `${quotation.branch.city}<br/>` : ''}
        ${quotation.branch?.phone ? `${quotation.branch.phone}<br/>` : ''}
        ${quotation.branch?.email ? quotation.branch.email : ''}
      </div>
    </div>
    <div style="text-align:right">
      <div class="doc-title">QUOTATION</div>
      <div class="doc-number"># ${quotation.quotationNumber}</div>
      <div class="doc-dates">Valid until: ${date(quotation.validUntil)}</div>
      <div><span class="status-badge">${quotation.status}</span></div>
    </div>
  </div>

  ${quotation.validUntil ? `
  <div class="validity-banner">
    This quotation is valid until <strong>${date(quotation.validUntil)}</strong>. Please confirm your order before this date.
  </div>` : ''}

  ${quotation.customer ? `
  <div class="section">
    <div class="section-title">Prepared For</div>
    <div class="bill-to">
      <div class="name">${(quotation.customer.firstName ?? '') + ' ' + (quotation.customer.lastName ?? '')}</div>
      ${quotation.customer.email ? `<div class="detail">${quotation.customer.email}</div>` : ''}
      ${quotation.customer.phone ? `<div class="detail">${quotation.customer.phone}</div>` : ''}
    </div>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Items</div>
    <table>
      <thead>
        <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Amount</th></tr>
      </thead>
      <tbody>${itemRows || '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:20px">No items</td></tr>'}</tbody>
    </table>
  </div>

  <div class="totals-wrap">
    <div class="totals">
      <div class="totals-row"><span style="color:#666">Subtotal</span><span>${fmt(quotation.subtotal)}</span></div>
      ${quotation.discountAmount > 0 ? `<div class="totals-row"><span style="color:#666">Discount</span><span>-${fmt(quotation.discountAmount)}</span></div>` : ''}
      ${quotation.taxAmount > 0 ? `<div class="totals-row"><span style="color:#666">Tax</span><span>${fmt(quotation.taxAmount)}</span></div>` : ''}
      <div class="totals-row grand-total"><span>Total</span><span>${fmt(quotation.totalAmount)}</span></div>
    </div>
  </div>

  ${quotation.notes ? `<div class="section" style="margin-top:28px"><div class="section-title">Notes</div><div class="notes-box">${quotation.notes}</div></div>` : ''}
  ${quotation.termsConditions ? `<div class="section"><div class="section-title">Terms &amp; Conditions</div><div class="notes-box">${quotation.termsConditions}</div></div>` : ''}

  <div class="footer">
    <span>Generated by Dazzling Urembo ERP</span>
    <span class="footer-note">We look forward to working with you!</span>
  </div>
</div>
</body>
</html>`;
}
