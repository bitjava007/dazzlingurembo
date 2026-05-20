import api from '@/lib/api';
import type { NotificationTemplate, NotificationLog, PaginatedResponse } from '@/types';

export const notificationsService = {
  getTemplates: (params?: object) => api.get<PaginatedResponse<NotificationTemplate>>('/notifications/templates', { params }).then(r => r.data),
  getTemplate: (id: string) => api.get<NotificationTemplate>(`/notifications/templates/${id}`).then(r => r.data),
  createTemplate: (data: object) => api.post<NotificationTemplate>('/notifications/templates', data).then(r => r.data),
  updateTemplate: (id: string, data: object) => api.patch<NotificationTemplate>(`/notifications/templates/${id}`, data).then(r => r.data),
  deleteTemplate: (id: string) => api.delete(`/notifications/templates/${id}`),
  getLogs: (params?: object) => api.get<PaginatedResponse<NotificationLog>>('/notifications/logs', { params }).then(r => r.data),
  getLogsByEntity: (type: string, id: string) => api.get<NotificationLog[]>(`/notifications/logs/entity/${type}/${id}`).then(r => r.data),
};
