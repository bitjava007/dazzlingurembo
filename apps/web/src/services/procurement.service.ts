import api from '@/lib/api';
import type {
  Supplier,
  PurchaseOrder,
  GoodsReceipt,
  SupplierInvoice,
  SupplierPayment,
  PaginatedResponse,
  ListParams,
} from '@/types';

export const procurementService = {
  // Suppliers
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

  // Purchase Orders
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

  async submitPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await api.patch<PurchaseOrder>(`/procurement/purchase-orders/${id}/submit`);
    return response.data;
  },

  async approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await api.patch<PurchaseOrder>(`/procurement/purchase-orders/${id}/approve`);
    return response.data;
  },

  async cancelPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await api.patch<PurchaseOrder>(`/procurement/purchase-orders/${id}/cancel`);
    return response.data;
  },

  // kept for backward compat (purchase orders page uses this)
  async updatePOStatus(id: string, action: string): Promise<PurchaseOrder> {
    const response = await api.patch<PurchaseOrder>(`/procurement/purchase-orders/${id}/${action.toLowerCase()}`);
    return response.data;
  },

  // Goods Receipts
  async getGoodsReceipts(params?: ListParams): Promise<PaginatedResponse<GoodsReceipt>> {
    const response = await api.get<PaginatedResponse<GoodsReceipt>>('/procurement/goods-receipts', { params });
    return response.data;
  },

  async createGoodsReceipt(data: Record<string, unknown>): Promise<GoodsReceipt> {
    const response = await api.post<GoodsReceipt>('/procurement/goods-receipts', data);
    return response.data;
  },

  // Supplier Invoices
  async getSupplierInvoices(params?: ListParams): Promise<PaginatedResponse<SupplierInvoice>> {
    const response = await api.get<PaginatedResponse<SupplierInvoice>>('/procurement/supplier-invoices', { params });
    return response.data;
  },

  async createSupplierInvoice(data: Record<string, unknown>): Promise<SupplierInvoice> {
    const response = await api.post<SupplierInvoice>('/procurement/supplier-invoices', data);
    return response.data;
  },

  async markSupplierInvoicePaid(id: string): Promise<SupplierInvoice> {
    const response = await api.patch<SupplierInvoice>(`/procurement/supplier-invoices/${id}/mark-paid`);
    return response.data;
  },

  // Supplier Payments
  async getSupplierPayments(params?: ListParams): Promise<PaginatedResponse<SupplierPayment>> {
    const response = await api.get<PaginatedResponse<SupplierPayment>>('/procurement/supplier-payments', { params });
    return response.data;
  },

  async createSupplierPayment(data: Record<string, unknown>): Promise<SupplierPayment> {
    const response = await api.post<SupplierPayment>('/procurement/supplier-payments', data);
    return response.data;
  },
};
