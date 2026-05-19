import api from '@/lib/api';
import type { StockBalance, StockMovement, StockTransfer, StockAdjustment, PaginatedResponse, ListParams } from '@/types';

export const inventoryService = {
  async getStockBalances(params?: ListParams): Promise<PaginatedResponse<StockBalance>> {
    const response = await api.get<PaginatedResponse<StockBalance>>('/inventory/stock', { params });
    return response.data;
  },

  async getMovements(params?: ListParams): Promise<PaginatedResponse<StockMovement>> {
    const response = await api.get<PaginatedResponse<StockMovement>>('/inventory/movements', { params });
    return response.data;
  },

  async getTransfers(params?: ListParams): Promise<PaginatedResponse<StockTransfer>> {
    const response = await api.get<PaginatedResponse<StockTransfer>>('/inventory/transfers', { params });
    return response.data;
  },

  async createTransfer(data: Partial<StockTransfer>): Promise<StockTransfer> {
    const response = await api.post<StockTransfer>('/inventory/transfers', data);
    return response.data;
  },

  async getAdjustments(params?: ListParams): Promise<PaginatedResponse<StockAdjustment>> {
    const response = await api.get<PaginatedResponse<StockAdjustment>>('/inventory/adjustments', { params });
    return response.data;
  },

  async createAdjustment(data: Partial<StockAdjustment>): Promise<StockAdjustment> {
    const response = await api.post<StockAdjustment>('/inventory/adjustments', data);
    return response.data;
  },

  async approveAdjustment(id: string): Promise<StockAdjustment> {
    const response = await api.patch<StockAdjustment>(`/inventory/adjustments/${id}/approve`);
    return response.data;
  },
};
