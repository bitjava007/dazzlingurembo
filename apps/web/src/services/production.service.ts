import api from '@/lib/api';
import type { WorkOrder, WorkOrderStage, PaginatedResponse, ListParams } from '@/types';

export const productionService = {
  async getWorkOrders(params?: ListParams): Promise<PaginatedResponse<WorkOrder>> {
    const response = await api.get<PaginatedResponse<WorkOrder>>('/production/work-orders', { params });
    return response.data;
  },

  async getWorkOrder(id: string): Promise<WorkOrder> {
    const response = await api.get<WorkOrder>(`/production/work-orders/${id}`);
    return response.data;
  },

  async createWorkOrder(data: Partial<WorkOrder>): Promise<WorkOrder> {
    const response = await api.post<WorkOrder>('/production/work-orders', data);
    return response.data;
  },

  async updateWorkOrderStatus(id: string, status: string): Promise<WorkOrder> {
    const response = await api.patch<WorkOrder>(`/production/work-orders/${id}/status`, { status });
    return response.data;
  },

  async getStages(workOrderId: string): Promise<WorkOrderStage[]> {
    const response = await api.get<WorkOrderStage[]>(`/production/work-orders/${workOrderId}/stages`);
    return response.data;
  },

  async updateStage(workOrderId: string, stageId: string, data: Partial<WorkOrderStage>): Promise<WorkOrderStage> {
    const response = await api.patch<WorkOrderStage>(`/production/work-orders/${workOrderId}/stages/${stageId}`, data);
    return response.data;
  },
};
