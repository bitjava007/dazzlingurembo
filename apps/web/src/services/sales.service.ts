import api from '@/lib/api';
import type { Quotation, Order, Invoice, Payment, Receipt, Refund, Return, DeliveryNote, PaginatedResponse, ListParams } from '@/types';

export const salesService = {
  // Quotations
  async getQuotations(params?: ListParams): Promise<PaginatedResponse<Quotation>> {
    const response = await api.get<PaginatedResponse<Quotation>>('/sales/quotations', { params });
    return response.data;
  },

  async getQuotation(id: string): Promise<Quotation> {
    const response = await api.get<Quotation>(`/sales/quotations/${id}`);
    return response.data;
  },

  async createQuotation(data: Partial<Quotation>): Promise<Quotation> {
    const response = await api.post<Quotation>('/sales/quotations', data);
    return response.data;
  },

  async updateQuotation(id: string, data: Partial<Quotation>): Promise<Quotation> {
    const response = await api.patch<Quotation>(`/sales/quotations/${id}`, data);
    return response.data;
  },

  async convertToOrder(id: string): Promise<Order> {
    const response = await api.patch<Order>(`/sales/quotations/${id}/convert-to-order`);
    return response.data;
  },

  async cancelQuotation(id: string): Promise<Quotation> {
    const response = await api.patch<Quotation>(`/sales/quotations/${id}/cancel`);
    return response.data;
  },

  // Orders
  async getOrders(params?: ListParams): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>('/sales/orders', { params });
    return response.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await api.get<Order>(`/sales/orders/${id}`);
    return response.data;
  },

  async createOrder(data: Partial<Order>): Promise<Order> {
    const response = await api.post<Order>('/sales/orders', data);
    return response.data;
  },

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    const response = await api.patch<Order>(`/sales/orders/${id}`, data);
    return response.data;
  },

  async confirmOrder(id: string): Promise<Order> {
    const response = await api.patch<Order>(`/sales/orders/${id}/confirm`);
    return response.data;
  },

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const response = await api.patch<Order>(`/sales/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Invoices
  async getInvoices(params?: ListParams): Promise<PaginatedResponse<Invoice>> {
    const response = await api.get<PaginatedResponse<Invoice>>('/sales/invoices', { params });
    return response.data;
  },

  async getInvoice(id: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/sales/invoices/${id}`);
    return response.data;
  },

  async createInvoiceFromOrder(orderId: string): Promise<Invoice> {
    const response = await api.post<Invoice>(`/sales/invoices/from-order/${orderId}`);
    return response.data;
  },

  async cancelInvoice(id: string): Promise<Invoice> {
    const response = await api.patch<Invoice>(`/sales/invoices/${id}/cancel`);
    return response.data;
  },

  // Payments
  async getPayments(params?: ListParams): Promise<PaginatedResponse<Payment>> {
    const response = await api.get<PaginatedResponse<Payment>>('/sales/payments', { params });
    return response.data;
  },

  async getPayment(id: string): Promise<Payment> {
    const response = await api.get<Payment>(`/sales/payments/${id}`);
    return response.data;
  },

  async recordPayment(data: Partial<Payment>): Promise<Payment> {
    const response = await api.post<Payment>('/sales/payments', data);
    return response.data;
  },

  // Receipts
  async getReceipts(params?: ListParams): Promise<PaginatedResponse<Receipt>> {
    const response = await api.get<PaginatedResponse<Receipt>>('/sales/receipts', { params });
    return response.data;
  },

  async getReceipt(id: string): Promise<Receipt> {
    const response = await api.get<Receipt>(`/sales/receipts/${id}`);
    return response.data;
  },

  async generateReceipt(paymentId: string): Promise<Receipt> {
    const response = await api.post<Receipt>(`/sales/receipts/generate/${paymentId}`);
    return response.data;
  },

  // Refunds
  async getRefunds(params?: ListParams): Promise<PaginatedResponse<Refund>> {
    const response = await api.get<PaginatedResponse<Refund>>('/sales/refunds', { params });
    return response.data;
  },

  async getRefund(id: string): Promise<Refund> {
    const response = await api.get<Refund>(`/sales/refunds/${id}`);
    return response.data;
  },

  async createRefund(data: Partial<Refund>): Promise<Refund> {
    const response = await api.post<Refund>('/sales/refunds', data);
    return response.data;
  },

  async approveRefund(id: string): Promise<Refund> {
    const response = await api.patch<Refund>(`/sales/refunds/${id}/approve`);
    return response.data;
  },

  async rejectRefund(id: string, reason?: string): Promise<Refund> {
    const response = await api.patch<Refund>(`/sales/refunds/${id}/reject`, { reason });
    return response.data;
  },

  async processRefund(id: string): Promise<Refund> {
    const response = await api.patch<Refund>(`/sales/refunds/${id}/process`);
    return response.data;
  },

  // Returns
  async getReturns(params?: ListParams): Promise<PaginatedResponse<Return>> {
    const response = await api.get<PaginatedResponse<Return>>('/sales/returns', { params });
    return response.data;
  },

  async getReturn(id: string): Promise<Return> {
    const response = await api.get<Return>(`/sales/returns/${id}`);
    return response.data;
  },

  async createReturn(data: Partial<Return>): Promise<Return> {
    const response = await api.post<Return>('/sales/returns', data);
    return response.data;
  },

  async approveReturn(id: string): Promise<Return> {
    const response = await api.patch<Return>(`/sales/returns/${id}/approve`);
    return response.data;
  },

  async rejectReturn(id: string, reason?: string): Promise<Return> {
    const response = await api.patch<Return>(`/sales/returns/${id}/reject`, { reason });
    return response.data;
  },

  async completeReturn(id: string): Promise<Return> {
    const response = await api.patch<Return>(`/sales/returns/${id}/complete`);
    return response.data;
  },

  // Delivery Notes
  async getDeliveryNotes(params?: ListParams): Promise<PaginatedResponse<DeliveryNote>> {
    const response = await api.get<PaginatedResponse<DeliveryNote>>('/sales/delivery-notes', { params });
    return response.data;
  },

  async getDeliveryNote(id: string): Promise<DeliveryNote> {
    const response = await api.get<DeliveryNote>(`/sales/delivery-notes/${id}`);
    return response.data;
  },

  async createDeliveryNoteFromOrder(orderId: string): Promise<DeliveryNote> {
    const response = await api.post<DeliveryNote>(`/sales/delivery-notes/from-order/${orderId}`);
    return response.data;
  },

  async dispatchDeliveryNote(id: string): Promise<DeliveryNote> {
    const response = await api.patch<DeliveryNote>(`/sales/delivery-notes/${id}/dispatch`);
    return response.data;
  },

  async deliverDeliveryNote(id: string): Promise<DeliveryNote> {
    const response = await api.patch<DeliveryNote>(`/sales/delivery-notes/${id}/deliver`);
    return response.data;
  },
};
