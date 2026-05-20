import api from '@/lib/api';
import type { StockBalance, StockMovement, StockTransfer, StockAdjustment, InventoryCount, DamagedStock, PaginatedResponse, ListParams } from '@/types';

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

  async getInventoryCounts(params?: object): Promise<PaginatedResponse<InventoryCount>> {
    const response = await api.get<PaginatedResponse<InventoryCount>>('/inventory/inventory-counts', { params });
    return response.data;
  },

  async createInventoryCount(data: object): Promise<InventoryCount> {
    const response = await api.post<InventoryCount>('/inventory/inventory-counts', data);
    return response.data;
  },

  async applyInventoryCount(id: string): Promise<InventoryCount> {
    const response = await api.patch<InventoryCount>(`/inventory/inventory-counts/${id}/apply-corrections`);
    return response.data;
  },

  async getDamagedStock(params?: object): Promise<PaginatedResponse<DamagedStock>> {
    const response = await api.get<PaginatedResponse<DamagedStock>>('/inventory/damaged-stock', { params });
    return response.data;
  },

  async createDamagedStock(data: object): Promise<DamagedStock> {
    const response = await api.post<DamagedStock>('/inventory/damaged-stock', data);
    return response.data;
  },

  async resolveDamagedStock(id: string): Promise<DamagedStock> {
    const response = await api.patch<DamagedStock>(`/inventory/damaged-stock/${id}/resolve`);
    return response.data;
  },
};
