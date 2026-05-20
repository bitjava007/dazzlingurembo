import api from '@/lib/api';

export const fashionService = {
  // BOM
  getBOMs: (params?: object) => api.get('/fashion/bom', { params }).then((r) => r.data),
  getBOM: (id: string) => api.get(`/fashion/bom/${id}`).then((r) => r.data),
  getBOMByProduct: (productId: string) =>
    api.get(`/fashion/bom/product/${productId}`).then((r) => r.data),
  createBOM: (data: object) => api.post('/fashion/bom', data).then((r) => r.data),
  addBOMItem: (bomId: string, data: object) =>
    api.post(`/fashion/bom/${bomId}/items`, data).then((r) => r.data),
  removeBOMItem: (bomId: string, itemId: string) =>
    api.delete(`/fashion/bom/${bomId}/items/${itemId}`),
  explodeBOM: (bomId: string, quantity: number) =>
    api.get(`/fashion/bom/${bomId}/explode?quantity=${quantity}`).then((r) => r.data),
  deleteBOM: (id: string) => api.delete(`/fashion/bom/${id}`),

  // Tailoring Teams
  getTeams: (params?: object) =>
    api.get('/fashion/tailoring-teams', { params }).then((r) => r.data),
  getTeam: (id: string) => api.get(`/fashion/tailoring-teams/${id}`).then((r) => r.data),
  createTeam: (data: object) =>
    api.post('/fashion/tailoring-teams', data).then((r) => r.data),
  updateTeam: (id: string, data: object) =>
    api.patch(`/fashion/tailoring-teams/${id}`, data).then((r) => r.data),
  deleteTeam: (id: string) => api.delete(`/fashion/tailoring-teams/${id}`),

  // Custom Orders
  getCustomOrders: (params?: object) =>
    api.get('/fashion/custom-orders', { params }).then((r) => r.data),
  getCustomOrder: (id: string) =>
    api.get(`/fashion/custom-orders/${id}`).then((r) => r.data),
  createCustomOrder: (data: object) =>
    api.post('/fashion/custom-orders', data).then((r) => r.data),
  updateCustomOrder: (id: string, data: object) =>
    api.patch(`/fashion/custom-orders/${id}`, data).then((r) => r.data),
  updateCustomOrderStatus: (id: string, status: string) =>
    api.patch(`/fashion/custom-orders/${id}/status`, { status }).then((r) => r.data),
  deleteCustomOrder: (id: string) => api.delete(`/fashion/custom-orders/${id}`),

  // Alterations
  getAlterations: (params?: object) =>
    api.get('/fashion/alterations', { params }).then((r) => r.data),
  getAlteration: (id: string) => api.get(`/fashion/alterations/${id}`).then((r) => r.data),
  createAlteration: (data: object) =>
    api.post('/fashion/alterations', data).then((r) => r.data),
  startAlteration: (id: string, data: object) =>
    api.patch(`/fashion/alterations/${id}/start`, data).then((r) => r.data),
  completeAlteration: (id: string, data: object) =>
    api.patch(`/fashion/alterations/${id}/complete`, data).then((r) => r.data),
  deliverAlteration: (id: string) =>
    api.patch(`/fashion/alterations/${id}/deliver`).then((r) => r.data),
  deleteAlteration: (id: string) => api.delete(`/fashion/alterations/${id}`),

  // Production Schedules
  getSchedules: (params?: object) =>
    api.get('/fashion/production-schedules', { params }).then((r) => r.data),
  getCalendar: (workshopId: string, start: string, end: string) =>
    api
      .get(
        `/fashion/production-schedules/calendar?workshopId=${workshopId}&start=${start}&end=${end}`,
      )
      .then((r) => r.data),
  createSchedule: (data: object) =>
    api.post('/fashion/production-schedules', data).then((r) => r.data),
  updateSchedule: (id: string, data: object) =>
    api.patch(`/fashion/production-schedules/${id}`, data).then((r) => r.data),
  deleteSchedule: (id: string) => api.delete(`/fashion/production-schedules/${id}`),
};
