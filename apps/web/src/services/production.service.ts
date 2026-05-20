import api from '@/lib/api';
import type {
  WorkOrder,
  WorkOrderStage,
  MaterialConsumption,
  OperatorAssignment,
  PaginatedResponse,
  ListParams,
} from '@/types';

export const productionService = {
  // Work Orders
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

  async startWorkOrder(id: string): Promise<WorkOrder> {
    const response = await api.patch<WorkOrder>(`/production/work-orders/${id}/start`);
    return response.data;
  },

  async completeWorkOrder(id: string): Promise<WorkOrder> {
    const response = await api.patch<WorkOrder>(`/production/work-orders/${id}/complete`);
    return response.data;
  },

  async cancelWorkOrder(id: string): Promise<WorkOrder> {
    const response = await api.patch<WorkOrder>(`/production/work-orders/${id}/cancel`);
    return response.data;
  },

  // kept for backward compat
  async updateWorkOrderStatus(id: string, status: string): Promise<WorkOrder> {
    const action = status === 'IN_PROGRESS' ? 'start' : status === 'COMPLETED' ? 'complete' : 'cancel';
    const response = await api.patch<WorkOrder>(`/production/work-orders/${id}/${action}`);
    return response.data;
  },

  // Stages
  async getStages(workOrderId: string): Promise<WorkOrderStage[]> {
    const response = await api.get<WorkOrderStage[]>(`/production/work-orders/${workOrderId}/stages`);
    return response.data;
  },

  async createStage(data: Record<string, unknown>): Promise<WorkOrderStage> {
    const response = await api.post<WorkOrderStage>('/production/stages', data);
    return response.data;
  },

  async startStage(id: string): Promise<WorkOrderStage> {
    const response = await api.patch<WorkOrderStage>(`/production/stages/${id}/start`);
    return response.data;
  },

  async completeStage(id: string, data?: Record<string, unknown>): Promise<WorkOrderStage> {
    const response = await api.patch<WorkOrderStage>(`/production/stages/${id}/complete`, data ?? {});
    return response.data;
  },

  // kept for backward compat
  async updateStage(workOrderId: string, stageId: string, data: Partial<WorkOrderStage>): Promise<WorkOrderStage> {
    void workOrderId;
    const response = await api.patch<WorkOrderStage>(`/production/stages/${stageId}/complete`, data);
    return response.data;
  },

  // Material Consumption
  async getMaterials(workOrderId: string): Promise<MaterialConsumption[]> {
    const response = await api.get<MaterialConsumption[]>(`/production/work-orders/${workOrderId}/materials`);
    return response.data;
  },

  async recordMaterialConsumption(data: Record<string, unknown>): Promise<MaterialConsumption> {
    const response = await api.post<MaterialConsumption>('/production/materials', data);
    return response.data;
  },

  // Operator Assignments
  async getOperatorAssignments(params?: ListParams): Promise<PaginatedResponse<OperatorAssignment>> {
    const response = await api.get<PaginatedResponse<OperatorAssignment>>('/production/operator-assignments', { params });
    return response.data;
  },

  async assignOperator(data: Record<string, unknown>): Promise<OperatorAssignment> {
    const response = await api.post<OperatorAssignment>('/production/operator-assignments', data);
    return response.data;
  },

  async unassignOperator(id: string): Promise<void> {
    await api.delete(`/production/operator-assignments/${id}`);
  },
};
