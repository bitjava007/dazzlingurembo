import api from '@/lib/api';
import type { NotificationTemplate, NotificationLog, PaginatedResponse, ListParams } from '@/types';

export const notificationsService = {
  async getTemplates(params?: ListParams): Promise<PaginatedResponse<NotificationTemplate>> {
    const response = await api.get<PaginatedResponse<NotificationTemplate>>('/notifications/templates', { params });
    return response.data;
  },

  async createTemplate(data: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const response = await api.post<NotificationTemplate>('/notifications/templates', data);
    return response.data;
  },

  async updateTemplate(id: string, data: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const response = await api.put<NotificationTemplate>(`/notifications/templates/${id}`, data);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/notifications/templates/${id}`);
  },

  async getLogs(params?: ListParams): Promise<PaginatedResponse<NotificationLog>> {
    const response = await api.get<PaginatedResponse<NotificationLog>>('/notifications/logs', { params });
    return response.data;
  },
};
