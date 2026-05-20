import api from '@/lib/api';
import type { Delivery, ProofOfDelivery, PaginatedResponse, ListParams } from '@/types';

export const logisticsService = {
  // Deliveries
  async getDeliveries(params?: ListParams): Promise<PaginatedResponse<Delivery>> {
    const response = await api.get<PaginatedResponse<Delivery>>('/logistics/deliveries', { params });
    return response.data;
  },

  async getDelivery(id: string): Promise<Delivery> {
    const response = await api.get<Delivery>(`/logistics/deliveries/${id}`);
    return response.data;
  },

  async createDelivery(data: Record<string, unknown>): Promise<Delivery> {
    const response = await api.post<Delivery>('/logistics/deliveries', data);
    return response.data;
  },

  async assignDelivery(id: string, assignedToId: string, vehicleId?: string): Promise<Delivery> {
    const response = await api.patch<Delivery>(`/logistics/deliveries/${id}/assign`, { assignedToId, vehicleId });
    return response.data;
  },

  async dispatch(id: string, data?: Record<string, unknown>): Promise<Delivery> {
    const response = await api.patch<Delivery>(`/logistics/deliveries/${id}/dispatch`, data ?? {});
    return response.data;
  },

  async markDelivered(id: string, data?: Record<string, unknown>): Promise<Delivery> {
    const response = await api.patch<Delivery>(`/logistics/deliveries/${id}/deliver`, data ?? {});
    return response.data;
  },

  async markFailed(id: string, reason: string): Promise<Delivery> {
    const response = await api.patch<Delivery>(`/logistics/deliveries/${id}/fail`, { reason });
    return response.data;
  },

  async rescheduleDelivery(id: string, newDate: string): Promise<Delivery> {
    const response = await api.patch<Delivery>(`/logistics/deliveries/${id}/reschedule`, { newDate });
    return response.data;
  },

  // Proof of Delivery
  async getPod(deliveryId: string): Promise<ProofOfDelivery> {
    const response = await api.get<ProofOfDelivery>(`/logistics/deliveries/${deliveryId}/pod`);
    return response.data;
  },

  async createPod(data: Record<string, unknown>): Promise<ProofOfDelivery> {
    const response = await api.post<ProofOfDelivery>('/logistics/pod', data);
    return response.data;
  },

  async getPODs(deliveryId: string): Promise<ProofOfDelivery[]> {
    const response = await api.get<ProofOfDelivery[]>(`/logistics/deliveries/${deliveryId}/pod`);
    return response.data;
  },
};
