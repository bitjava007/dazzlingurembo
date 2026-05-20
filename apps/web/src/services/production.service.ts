import api from '@/lib/api';
import type { WorkOrder, WorkOrderStage, MaterialConsumption, OperatorAssignment, PaginatedResponse, ListParams } from '@/types';

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

  async createStage(data: object): Promise<WorkOrderStage> {
    const response = await api.post<WorkOrderStage>('/production/production-stages', data);
    return response.data;
  },

  async startStage(id: string): Promise<WorkOrderStage> {
    const response = await api.patch<WorkOrderStage>(`/production/production-stages/${id}/start`);
    return response.data;
  },

  async completeStage(id: string, data?: object): Promise<WorkOrderStage> {
    const response = await api.patch<WorkOrderStage>(`/production/production-stages/${id}/complete`, data);
    return response.data;
  },

  async getMaterials(workOrderId: string): Promise<MaterialConsumption[]> {
    const response = await api.get<MaterialConsumption[]>(`/production/work-orders/${workOrderId}/materials`);
    return response.data;
  },

  async recordMaterial(data: object): Promise<MaterialConsumption> {
    const response = await api.post<MaterialConsumption>('/production/material-consumption', data);
    return response.data;
  },

  async getAssignments(params?: object): Promise<PaginatedResponse<OperatorAssignment>> {
    const response = await api.get<PaginatedResponse<OperatorAssignment>>('/production/operator-assignments', { params });
    return response.data;
  },

  async createAssignment(data: object): Promise<OperatorAssignment> {
    const response = await api.post<OperatorAssignment>('/production/operator-assignments', data);
    return response.data;
  },

  async unassignOperator(id: string): Promise<OperatorAssignment> {
    const response = await api.patch<OperatorAssignment>(`/production/operator-assignments/${id}/unassign`);
    return response.data;
  },
};
