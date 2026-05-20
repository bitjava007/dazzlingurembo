import api from '@/lib/api';
import type { Delivery, ProofOfDelivery, PaginatedResponse, ListParams } from '@/types';

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

  async getPODs(deliveryId: string): Promise<ProofOfDelivery[]> {
    const response = await api.get<ProofOfDelivery[]>(`/logistics/deliveries/${deliveryId}/pod`);
    return response.data;
  },

  async createPOD(data: object): Promise<ProofOfDelivery> {
    const response = await api.post<ProofOfDelivery>('/logistics/proof-of-delivery', data);
    return response.data;
  },
};
