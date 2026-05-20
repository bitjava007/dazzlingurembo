export interface DeliveryNoteData {
  noteNumber: string;
  issuedAt: Date;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  carrierName?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  signedBy?: string | null;
  order?: {
    orderNumber: string;
    shippingAddressLine1?: string | null;
    shippingAddressLine2?: string | null;
    shippingCity?: string | null;
    shippingState?: string | null;
    shippingCountryCode?: string | null;
  } | null;
  branch?: { name: string; address?: string | null; city?: string | null; phone?: string | null } | null;
}

export function generateDeliveryNoteHtml(note: DeliveryNoteData): string {
  const date = (d?: Date | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const deliveryStatus = note.deliveredAt ? 'DELIVERED' : note.shippedAt ? 'SHIPPED' : 'PENDING';
  const statusColor = note.deliveredAt ? '#2e7d32' : note.shippedAt ? '#1565c0' : '#b45309';
  const statusBg = note.deliveredAt ? '#e8f5e9' : note.shippedAt ? '#e3f2fd' : '#fff8e1';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Delivery Note ${note.noteNumber}</title>
<style>
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
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 3px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; background: ${statusBg}; color: ${statusColor}; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: var(--gold); border-bottom: 1px solid #e8e0d0; padding-bottom: 6px; margin-bottom: 12px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 28px; }
  .info-card { background: #fafaf8; border-left: 3px solid var(--gold); padding: 14px 16px; }
  .info-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 4px; }
  .info-value { font-size: 14px; font-weight: 600; color: var(--dark); }
  .info-sub { font-size: 12px; color: #555; margin-top: 2px; }
  .address-block { background: #fafaf8; border: 1px solid #e8e0d0; padding: 14px 16px; border-radius: 4px; }
  .address-block .name { font-size: 14px; font-weight: bold; color: var(--dark); margin-bottom: 6px; }
  .address-block .addr { font-size: 13px; color: #555; line-height: 1.7; }
  .notes-box { background: #fafaf8; border: 1px solid #e8e0d0; border-radius: 4px; padding: 14px; font-size: 12px; color: #555; line-height: 1.6; }
  .signature-section { border: 1px solid #ddd; border-radius: 4px; padding: 16px; }
  .sig-box { border: 1px solid #ccc; height: 80px; border-radius: 4px; margin-top: 12px; display: flex; align-items: flex-end; padding: 8px; }
  .sig-name { font-size: 12px; color: #666; border-top: 1px solid #333; margin-top: 4px; padding-top: 4px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e8e0d0; display: flex; justify-content: space-between; font-size: 11px; color: #aaa; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand-name">Dazzling Urembo</div>
      <div class="brand-sub">Fashion &amp; Tailoring</div>
      <div class="brand-contact">
        ${note.branch?.name ? `${note.branch.name}<br/>` : ''}
        ${note.branch?.address ? `${note.branch.address}<br/>` : ''}
        ${note.branch?.city ? `${note.branch.city}<br/>` : ''}
        ${note.branch?.phone ? note.branch.phone : ''}
      </div>
    </div>
    <div style="text-align:right">
      <div class="doc-title">DELIVERY NOTE</div>
      <div class="doc-number"># ${note.noteNumber}</div>
      <div style="font-size:11px;color:#aaa;margin-top:8px">Issued: ${date(note.issuedAt)}</div>
      <div><span class="status-badge">${deliveryStatus}</span></div>
    </div>
  </div>

  <div class="two-col">
    <div>
      <div class="section-title">Delivery Details</div>
      ${note.order ? `<div class="info-card" style="margin-bottom:12px"><div class="info-label">Order Reference</div><div class="info-value">${note.order.orderNumber}</div></div>` : ''}
      <div class="info-card" style="margin-bottom:12px"><div class="info-label">Shipped</div><div class="info-value">${date(note.shippedAt)}</div></div>
      <div class="info-card"><div class="info-label">Delivered</div><div class="info-value">${date(note.deliveredAt)}</div></div>
    </div>
    <div>
      <div class="section-title">Carrier</div>
      ${note.carrierName ? `<div class="info-card" style="margin-bottom:12px"><div class="info-label">Carrier Name</div><div class="info-value">${note.carrierName}</div></div>` : ''}
      ${note.trackingNumber ? `<div class="info-card"><div class="info-label">Tracking Number</div><div class="info-value" style="font-family:monospace">${note.trackingNumber}</div></div>` : ''}
    </div>
  </div>

  ${note.order && (note.order.shippingAddressLine1 || note.order.shippingCity) ? `
  <div class="section">
    <div class="section-title">Delivery Address</div>
    <div class="address-block">
      <div class="addr">
        ${note.order.shippingAddressLine1 ? `${note.order.shippingAddressLine1}<br/>` : ''}
        ${note.order.shippingAddressLine2 ? `${note.order.shippingAddressLine2}<br/>` : ''}
        ${[note.order.shippingCity, note.order.shippingState, note.order.shippingCountryCode].filter(Boolean).join(', ')}
      </div>
    </div>
  </div>` : ''}

  ${note.notes ? `<div class="section"><div class="section-title">Notes</div><div class="notes-box">${note.notes}</div></div>` : ''}

  <div class="section" style="margin-top:32px">
    <div class="section-title">Recipient Confirmation</div>
    <div class="signature-section">
      <div style="font-size:12px;color:#555;margin-bottom:8px">By signing below, the recipient confirms delivery of the above goods in satisfactory condition.</div>
      <div class="sig-box">
        ${note.signedBy ? `<span style="font-size:14px;font-style:italic;color:#333">${note.signedBy}</span>` : '<span style="color:#ccc;font-size:12px">Signature</span>'}
      </div>
      ${note.signedBy ? `<div class="sig-name">Signed by: ${note.signedBy}</div>` : '<div class="sig-name">Name &amp; Date: _______________________</div>'}
    </div>
  </div>

  <div class="footer">
    <span>Generated by Dazzling Urembo ERP</span>
    <span>Delivery Note — Keep for your records</span>
  </div>
</div>
</body>
</html>`;
}
