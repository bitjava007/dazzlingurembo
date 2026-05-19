import api from '@/lib/api';

export const documentsService = {
  async downloadInvoicePdf(id: string): Promise<Blob> {
    const response = await api.get(`/documents/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data as Blob;
  },

  async downloadQuotationPdf(id: string): Promise<Blob> {
    const response = await api.get(`/documents/quotations/${id}/pdf`, { responseType: 'blob' });
    return response.data as Blob;
  },

  async downloadReceiptPdf(id: string): Promise<Blob> {
    const response = await api.get(`/documents/receipts/${id}/pdf`, { responseType: 'blob' });
    return response.data as Blob;
  },

  async downloadPurchaseOrderPdf(id: string): Promise<Blob> {
    const response = await api.get(`/documents/purchase-orders/${id}/pdf`, { responseType: 'blob' });
    return response.data as Blob;
  },

  openPdfInNewTab(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
