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

const BRAND_CSS = `
  :root { --gold: #C9A84C; --dark: #1A1A1A; --darker: #111111; --border: #2A2A2A; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #333; background: #fff; }
  .page { padding: 48px; max-width: 800px; margin: 0 auto; }
  .header { background: var(--dark); color: #fff; padding: 32px 48px; margin: -48px -48px 32px; display: flex; justify-content: space-between; align-items: center; }
  .brand { display: flex; flex-direction: column; }
  .brand-name { font-size: 22px; font-weight: bold; color: var(--gold); letter-spacing: 1px; }
  .brand-sub { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-top: 2px; }
  .brand-contact { font-size: 11px; color: #aaa; margin-top: 8px; line-height: 1.6; }
  .doc-info { text-align: right; }
  .doc-title { font-size: 28px; font-weight: bold; color: var(--gold); letter-spacing: 2px; }
  .doc-number { font-size: 14px; color: #ccc; margin-top: 4px; }
  .doc-dates { font-size: 11px; color: #aaa; margin-top: 8px; line-height: 1.8; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 3px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; background: var(--gold); color: var(--dark); margin-top: 6px; }
  .body { padding: 0; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: var(--gold); border-bottom: 1px solid #e8e0d0; padding-bottom: 6px; margin-bottom: 12px; }
  .bill-to { background: #fafaf8; border-left: 3px solid var(--gold); padding: 12px 16px; }
  .bill-to .name { font-size: 15px; font-weight: bold; color: var(--dark); }
  .bill-to .detail { font-size: 12px; color: #666; margin-top: 3px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
  thead th { background: var(--dark); color: var(--gold); padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
  thead th:not(:first-child) { text-align: right; }
  tbody td { padding: 10px 12px; border-bottom: 1px solid #f0ece4; font-size: 13px; }
  tbody td:not(:first-child) { text-align: right; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:nth-child(even) td { background: #faf9f7; }
  .sku { font-size: 11px; color: #999; }
  .totals-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
  .totals { width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
  .totals-row.subtotal { border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 4px; }
  .totals-row.grand-total { border-top: 2px solid var(--gold); padding-top: 8px; margin-top: 4px; font-size: 15px; font-weight: bold; color: var(--dark); }
  .totals-row.balance { font-size: 14px; font-weight: bold; color: #c0392b; }
  .totals-row .label { color: #666; }
  .notes-box { background: #fafaf8; border: 1px solid #e8e0d0; border-radius: 4px; padding: 14px; font-size: 12px; color: #555; line-height: 1.6; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e8e0d0; display: flex; justify-content: space-between; align-items: center; }
  .footer-brand { font-size: 11px; color: #aaa; }
  .footer-thanks { font-size: 12px; color: var(--gold); font-style: italic; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

export function generateInvoiceHtml(invoice: InvoiceData): string {
  const fmt = (n: number) => `${invoice.currencyCode} ${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const date = (d?: Date | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const itemRows = (invoice.items ?? []).map(item => `
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
<title>Invoice ${invoice.invoiceNumber}</title>
<style>${BRAND_CSS}</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">
      <div class="brand-name">Dazzling Urembo</div>
      <div class="brand-sub">Fashion &amp; Tailoring</div>
      <div class="brand-contact">
        ${invoice.branch?.name ? `${invoice.branch.name}<br/>` : ''}
        ${invoice.branch?.address ? `${invoice.branch.address}<br/>` : ''}
        ${invoice.branch?.city ? `${invoice.branch.city}<br/>` : ''}
        ${invoice.branch?.phone ? `${invoice.branch.phone}<br/>` : ''}
        ${invoice.branch?.email ? `${invoice.branch.email}` : ''}
      </div>
    </div>
    <div class="doc-info">
      <div class="doc-title">INVOICE</div>
      <div class="doc-number"># ${invoice.invoiceNumber}</div>
      <div class="doc-dates">
        Issued: ${date(invoice.issuedAt)}<br/>
        Due: ${date(invoice.dueAt)}
      </div>
      <div><span class="status-badge">${invoice.status}</span></div>
    </div>
  </div>

  <div class="body">
    ${invoice.customer ? `
    <div class="section">
      <div class="section-title">Bill To</div>
      <div class="bill-to">
        <div class="name">${(invoice.customer.firstName ?? '') + ' ' + (invoice.customer.lastName ?? '')}</div>
        ${invoice.customer.email ? `<div class="detail">${invoice.customer.email}</div>` : ''}
        ${invoice.customer.phone ? `<div class="detail">${invoice.customer.phone}</div>` : ''}
      </div>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">Items</div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Tax</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows || '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:20px">No items</td></tr>'}</tbody>
      </table>
    </div>

    <div class="totals-wrap">
      <div class="totals">
        <div class="totals-row subtotal"><span class="label">Subtotal</span><span>${fmt(invoice.subtotal)}</span></div>
        ${invoice.discountAmount > 0 ? `<div class="totals-row"><span class="label">Discount</span><span>-${fmt(invoice.discountAmount)}</span></div>` : ''}
        ${invoice.taxAmount > 0 ? `<div class="totals-row"><span class="label">Tax</span><span>${fmt(invoice.taxAmount)}</span></div>` : ''}
        <div class="totals-row grand-total"><span>Total</span><span>${fmt(invoice.totalAmount)}</span></div>
        ${invoice.paidAmount > 0 ? `<div class="totals-row"><span class="label">Paid</span><span>-${fmt(invoice.paidAmount)}</span></div>` : ''}
        ${invoice.balanceDue > 0 ? `<div class="totals-row balance"><span>Balance Due</span><span>${fmt(invoice.balanceDue)}</span></div>` : ''}
      </div>
    </div>

    ${invoice.notes ? `<div class="section" style="margin-top:28px"><div class="section-title">Notes</div><div class="notes-box">${invoice.notes}</div></div>` : ''}
    ${invoice.terms ? `<div class="section"><div class="section-title">Terms &amp; Conditions</div><div class="notes-box">${invoice.terms}</div></div>` : ''}

    <div class="footer">
      <div class="footer-brand">Generated by Dazzling Urembo ERP</div>
      <div class="footer-thanks">Thank you for your business!</div>
    </div>
  </div>
</div>
</body>
</html>`;
}
