export interface ReceiptData {
  receiptNumber: string;
  issuedAt: Date;
  paymentMethod?: string;
  originalCurrencyCode: string;
  originalAmount: number;
  notes?: string | null;
  branch?: { name: string; address?: string | null; city?: string | null; phone?: string | null } | null;
}

export function generateReceiptHtml(receipt: ReceiptData): string {
  const fmt = (n: number) => `${receipt.originalCurrencyCode} ${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const date = (d: Date) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = (d: Date) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const method = receipt.paymentMethod?.replace(/_/g, ' ') ?? 'N/A';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Receipt ${receipt.receiptNumber}</title>
<style>
  :root { --gold: #C9A84C; --dark: #1A1A1A; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #222; background: #fff; }
  .page { max-width: 360px; margin: 0 auto; padding: 32px 24px; }
  .top { text-align: center; margin-bottom: 24px; }
  .brand { font-size: 20px; font-weight: bold; letter-spacing: 2px; color: var(--dark); }
  .brand-sub { font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #888; margin-top: 2px; }
  .branch-info { font-size: 11px; color: #666; margin-top: 8px; line-height: 1.7; }
  .divider-dashed { border: none; border-top: 2px dashed #ccc; margin: 16px 0; }
  .divider-solid { border: none; border-top: 1px solid #333; margin: 12px 0; }
  .doc-label { font-size: 18px; font-weight: bold; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); text-align: center; margin-bottom: 4px; }
  .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
  .row .label { color: #666; }
  .amount-section { background: var(--dark); color: #fff; padding: 16px; margin: 12px 0; text-align: center; border-radius: 4px; }
  .amount-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #aaa; }
  .amount-value { font-size: 28px; font-weight: bold; color: var(--gold); margin-top: 6px; letter-spacing: 1px; }
  .method-badge { display: inline-block; background: #f0e8d0; color: #7a5c00; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 12px; margin-top: 8px; letter-spacing: 1px; }
  .notes { font-size: 11px; color: #555; text-align: center; margin: 12px 0; line-height: 1.5; font-style: italic; }
  .footer { text-align: center; margin-top: 24px; }
  .footer-thanks { font-size: 13px; color: var(--gold); font-weight: bold; margin-bottom: 4px; }
  .footer-sub { font-size: 10px; color: #aaa; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="top">
    <div class="brand">DAZZLING UREMBO</div>
    <div class="brand-sub">Fashion &amp; Tailoring</div>
    ${receipt.branch ? `
    <div class="branch-info">
      ${receipt.branch.name}<br/>
      ${receipt.branch.address ?? ''}${receipt.branch.city ? `, ${receipt.branch.city}` : ''}<br/>
      ${receipt.branch.phone ?? ''}
    </div>` : ''}
  </div>

  <hr class="divider-dashed" />
  <div class="doc-label">Receipt</div>
  <hr class="divider-dashed" />

  <div class="row"><span class="label">Receipt #</span><span>${receipt.receiptNumber}</span></div>
  <div class="row"><span class="label">Date</span><span>${date(receipt.issuedAt)}</span></div>
  <div class="row"><span class="label">Time</span><span>${time(receipt.issuedAt)}</span></div>

  <hr class="divider-solid" />

  <div class="amount-section">
    <div class="amount-label">Total Paid</div>
    <div class="amount-value">${fmt(receipt.originalAmount)}</div>
    <div><span class="method-badge">${method}</span></div>
  </div>

  ${receipt.notes ? `<div class="notes">${receipt.notes}</div>` : ''}

  <hr class="divider-dashed" />

  <div class="footer">
    <div class="footer-thanks">Thank you!</div>
    <div class="footer-sub">Powered by Dazzling Urembo ERP</div>
  </div>
</div>
</body>
</html>`;
}
