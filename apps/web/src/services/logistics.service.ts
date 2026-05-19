import api from '@/lib/api';
import type { Delivery, PaginatedResponse, ListParams } from '@/types';

export const logisticsService = {
  async getDeliveries(params?: ListParams): Promise<PaginatedResponse<Delivery>> {
    const response = await api.get<PaginatedResponse<Delivery>>('/logistics/deliveries', { params });
    return response.data;
  },

  async getDelivery(id: string): Promise<Delivery> {
    const response = await api.get<Delivery>(`/logistics/deliveries/${id}`);
    return response.data;
  },

  async dispatch(id: string, data: Partial<Delivery>): Promise<Delivery> {
    const response = await api.patch<Delivery>(`/logistics/deliveries/${id}/dispatch`, data);
    return response.data;
  },

  async markDelivered(id: string): Promise<Delivery> {
    const response = await api.patch<Delivery>(`/logistics/deliveries/${id}/deliver`);
    return response.data;
  },

  async markFailed(id: string, notes: string): Promise<Delivery> {
    const response = await api.patch<Delivery>(`/logistics/deliveries/${id}/fail`, { notes });
    return response.data;
  },
};
