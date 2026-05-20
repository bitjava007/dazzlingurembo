import api from '@/lib/api';
import type { User, PaginatedResponse, ApiResponse, ListParams } from '@/types';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export const usersService = {
  async getUsers(params?: ListParams): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  async createUser(dto: CreateUserDto): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>('/users', dto);
    return response.data;
  },

  async updateUser(id: string, dto: UpdateUserDto): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}`, dto);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/status`, { status });
    return response.data;
  },

  async assignRole(userId: string, roleId: string, branchId?: string): Promise<void> {
    await api.post(`/users/${userId}/roles`, { roleId, branchId });
  },

  async removeRole(userId: string, roleId: string): Promise<void> {
    await api.delete(`/users/${userId}/roles/${roleId}`);
  },

  async assignBranch(userId: string, branchId: string): Promise<void> {
    await api.patch(`/users/${userId}/branch`, { branchId });
  },
};
