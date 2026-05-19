import api from '@/lib/api';
import type { Quotation, Order, Invoice, Payment, PaginatedResponse, ListParams } from '@/types';

export const salesService = {
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

  async convertToOrder(id: string): Promise<Order> {
    const response = await api.post<Order>(`/sales/quotations/${id}/convert`);
    return response.data;
  },

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

  async getInvoices(params?: ListParams): Promise<PaginatedResponse<Invoice>> {
    const response = await api.get<PaginatedResponse<Invoice>>('/sales/invoices', { params });
    return response.data;
  },

  async getInvoice(id: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/sales/invoices/${id}`);
    return response.data;
  },

  async getPayments(params?: ListParams): Promise<PaginatedResponse<Payment>> {
    const response = await api.get<PaginatedResponse<Payment>>('/sales/payments', { params });
    return response.data;
  },

  async recordPayment(data: Partial<Payment>): Promise<Payment> {
    const response = await api.post<Payment>('/sales/payments', data);
    return response.data;
  },
};
