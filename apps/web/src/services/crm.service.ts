import api from '@/lib/api';
import type { Customer, CustomerNote, CustomerCommunication, LoyaltyAccount, PaginatedResponse, ListParams } from '@/types';

export const crmService = {
  async getCustomers(params?: ListParams): Promise<PaginatedResponse<Customer>> {
    const response = await api.get<PaginatedResponse<Customer>>('/crm/customers', { params });
    return response.data;
  },

  async getCustomer(id: string): Promise<Customer> {
    const response = await api.get<Customer>(`/crm/customers/${id}`);
    return response.data;
  },

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const response = await api.post<Customer>('/crm/customers', data);
    return response.data;
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const response = await api.patch<Customer>(`/crm/customers/${id}`, data);
    return response.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`/crm/customers/${id}`);
  },

  async getNotes(customerId: string): Promise<CustomerNote[]> {
    const response = await api.get<CustomerNote[]>(`/crm/customers/${customerId}/notes`);
    return response.data;
  },

  async addNote(customerId: string, data: { content: string }): Promise<CustomerNote> {
    const response = await api.post<CustomerNote>(`/crm/customers/${customerId}/notes`, data);
    return response.data;
  },

  async createNote(customerId: string, data: { content: string }): Promise<CustomerNote> {
    const response = await api.post<CustomerNote>(`/crm/customers/${customerId}/notes`, data);
    return response.data;
  },

  async deleteNote(customerId: string, noteId: string): Promise<void> {
    await api.delete(`/crm/customers/${customerId}/notes/${noteId}`);
  },

  async getCommunications(customerId: string): Promise<CustomerCommunication[]> {
    const response = await api.get<CustomerCommunication[]>(`/crm/customers/${customerId}/communications`);
    return response.data;
  },

  async addCommunication(customerId: string, data: object): Promise<CustomerCommunication> {
    const response = await api.post<CustomerCommunication>(`/crm/customers/${customerId}/communications`, data);
    return response.data;
  },

  async getLoyaltyAccount(customerId: string): Promise<LoyaltyAccount> {
    const response = await api.get<LoyaltyAccount>(`/crm/customers/${customerId}/loyalty`);
    return response.data;
  },

  async getLoyaltyPoints(customerId: string): Promise<number> {
    const response = await api.get<{ points: number }>(`/crm/customers/${customerId}/loyalty`);
    return response.data.points;
  },

  async addLoyaltyPoints(customerId: string, data: { points: number; type?: string; description?: string }): Promise<LoyaltyAccount> {
    const response = await api.post<LoyaltyAccount>(`/crm/customers/${customerId}/loyalty/add`, data);
    return response.data;
  },

  async redeemLoyaltyPoints(customerId: string, data: { points: number; description?: string }): Promise<LoyaltyAccount> {
    const response = await api.post<LoyaltyAccount>(`/crm/customers/${customerId}/loyalty/redeem`, data);
    return response.data;
  },
};
