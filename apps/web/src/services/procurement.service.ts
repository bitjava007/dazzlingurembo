import api from '@/lib/api';
import type { Supplier, PurchaseOrder, SupplierInvoice, GoodsReceipt, SupplierPayment, PaginatedResponse, ListParams } from '@/types';

export const procurementService = {
  async getSuppliers(params?: ListParams): Promise<PaginatedResponse<Supplier>> {
    const response = await api.get<PaginatedResponse<Supplier>>('/procurement/suppliers', { params });
    return response.data;
  },

  async getSupplier(id: string): Promise<Supplier> {
    const response = await api.get<Supplier>(`/procurement/suppliers/${id}`);
    return response.data;
  },

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    const response = await api.post<Supplier>('/procurement/suppliers', data);
    return response.data;
  },

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const response = await api.patch<Supplier>(`/procurement/suppliers/${id}`, data);
    return response.data;
  },

  async deleteSupplier(id: string): Promise<void> {
    await api.delete(`/procurement/suppliers/${id}`);
  },

  async getPurchaseOrders(params?: ListParams): Promise<PaginatedResponse<PurchaseOrder>> {
    const response = await api.get<PaginatedResponse<PurchaseOrder>>('/procurement/purchase-orders', { params });
    return response.data;
  },

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await api.get<PurchaseOrder>(`/procurement/purchase-orders/${id}`);
    return response.data;
  },

  async createPurchaseOrder(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await api.post<PurchaseOrder>('/procurement/purchase-orders', data);
    return response.data;
  },

  async updatePOStatus(id: string, status: string): Promise<PurchaseOrder> {
    const response = await api.patch<PurchaseOrder>(`/procurement/purchase-orders/${id}/status`, { status });
    return response.data;
  },

  async getSupplierInvoices(params?: ListParams): Promise<PaginatedResponse<SupplierInvoice>> {
    const response = await api.get<PaginatedResponse<SupplierInvoice>>('/procurement/supplier-invoices', { params });
    return response.data;
  },

  async createSupplierInvoice(data: object): Promise<SupplierInvoice> {
    const response = await api.post<SupplierInvoice>('/procurement/supplier-invoices', data);
    return response.data;
  },

  async markSupplierInvoicePaid(id: string): Promise<SupplierInvoice> {
    const response = await api.patch<SupplierInvoice>(`/procurement/supplier-invoices/${id}/mark-paid`);
    return response.data;
  },

  // Goods Receipts
  async getGoodsReceipts(params?: ListParams): Promise<PaginatedResponse<GoodsReceipt>> {
    const response = await api.get<PaginatedResponse<GoodsReceipt>>('/procurement/goods-receipts', { params });
    return response.data;
  },

  async createGoodsReceipt(data: object): Promise<GoodsReceipt> {
    const response = await api.post<GoodsReceipt>('/procurement/goods-receipts', data);
    return response.data;
  },

  // Supplier Payments
  async getSupplierPayments(params?: ListParams): Promise<PaginatedResponse<SupplierPayment>> {
    const response = await api.get<PaginatedResponse<SupplierPayment>>('/procurement/supplier-payments', { params });
    return response.data;
  },

  async createSupplierPayment(data: object): Promise<SupplierPayment> {
    const response = await api.post<SupplierPayment>('/procurement/supplier-payments', data);
    return response.data;
  },
};
