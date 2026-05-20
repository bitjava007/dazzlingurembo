import api from '@/lib/api';
import type { StockBalance, StockMovement, StockTransfer, StockAdjustment, PaginatedResponse, ListParams } from '@/types';

export const inventoryService = {
  async getStockBalances(params?: ListParams): Promise<PaginatedResponse<StockBalance>> {
    const response = await api.get<PaginatedResponse<StockBalance>>('/inventory/stock-balances', { params });
    return response.data;
  },

  async getMovements(params?: ListParams): Promise<PaginatedResponse<StockMovement>> {
    const response = await api.get<PaginatedResponse<StockMovement>>('/inventory/stock-movements', { params });
    return response.data;
  },

  async getTransfers(params?: ListParams): Promise<PaginatedResponse<StockTransfer>> {
    const response = await api.get<PaginatedResponse<StockTransfer>>('/inventory/stock-transfers', { params });
    return response.data;
  },

  async createTransfer(data: Partial<StockTransfer>): Promise<StockTransfer> {
    const response = await api.post<StockTransfer>('/inventory/stock-transfers', data);
    return response.data;
  },

  async approveTransfer(id: string): Promise<StockTransfer> {
    const response = await api.patch<StockTransfer>(`/inventory/stock-transfers/${id}/approve`);
    return response.data;
  },

  async receiveTransfer(id: string): Promise<StockTransfer> {
    const response = await api.patch<StockTransfer>(`/inventory/stock-transfers/${id}/receive`);
    return response.data;
  },

  async cancelTransfer(id: string): Promise<StockTransfer> {
    const response = await api.patch<StockTransfer>(`/inventory/stock-transfers/${id}/cancel`);
    return response.data;
  },

  async getAdjustments(params?: ListParams): Promise<PaginatedResponse<StockAdjustment>> {
    const response = await api.get<PaginatedResponse<StockAdjustment>>('/inventory/stock-adjustments', { params });
    return response.data;
  },

  async createAdjustment(data: Partial<StockAdjustment>): Promise<StockAdjustment> {
    const response = await api.post<StockAdjustment>('/inventory/stock-adjustments', data);
    return response.data;
  },

  async approveAdjustment(id: string): Promise<StockAdjustment> {
    const response = await api.patch<StockAdjustment>(`/inventory/stock-adjustments/${id}/approve`);
    return response.data;
  },

  async rejectAdjustment(id: string, reason?: string): Promise<StockAdjustment> {
    const response = await api.patch<StockAdjustment>(`/inventory/stock-adjustments/${id}/reject`, { reason });
    return response.data;
  },
};
